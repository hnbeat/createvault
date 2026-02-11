import { NextRequest, NextResponse } from "next/server";
import { fetchOgImage } from "@/lib/og-image";
import { getAllReferences, updateReference } from "@/db/queries";

// Fetch OG image for a single URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const image = await fetchOgImage(url);

    // Also try to extract title and description from the page
    let title: string | null = null;
    let description: string | null = null;

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const html = await res.text();
        const titleMatch =
          html.match(/property="og:title"\s+content="([^"]+)"/i) ||
          html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch =
          html.match(/property="og:description"\s+content="([^"]+)"/i) ||
          html.match(/name="description"\s+content="([^"]+)"/i);

        title = titleMatch?.[1] || null;
        description = descMatch?.[1] || null;
      }
    } catch {
      // silently ignore - we only really need the image
    }

    return NextResponse.json({
      image: image || null,
      title,
      description,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// Batch fetch all missing thumbnails
export async function PATCH() {
  try {
    const allRefs = await getAllReferences();
    const missing = allRefs.filter((r) => !r.thumbnail);

    let updated = 0;
    const results: { id: number; title: string; image: string | null }[] = [];

    for (const ref of missing) {
      const image = await fetchOgImage(ref.url);
      if (image) {
        await updateReference(ref.id, { thumbnail: image });
        updated++;
      }
      results.push({ id: ref.id, title: ref.title, image });
      // Small delay between requests
      await new Promise((r) => setTimeout(r, 200));
    }

    return NextResponse.json({
      total: missing.length,
      updated,
      results,
    });
  } catch (error) {
    console.error("Batch fetch error:", error);
    return NextResponse.json({ error: "Failed to batch fetch" }, { status: 500 });
  }
}
