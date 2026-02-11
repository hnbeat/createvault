import { NextRequest, NextResponse } from "next/server";
import { getAllReferences, createReference, getAllTags, getTagsForReference } from "@/db/queries";
import { fetchOgImage } from "@/lib/og-image";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Return all tags
  const allTagsParam = searchParams.get("allTags");
  if (allTagsParam === "true") {
    const tags = await getAllTags();
    return NextResponse.json(tags);
  }

  // Return tags for a specific reference
  const tagsParam = searchParams.get("tags");
  if (tagsParam) {
    const referenceId = parseInt(tagsParam);
    if (!isNaN(referenceId)) {
      const tags = await getTagsForReference(referenceId);
      return NextResponse.json(tags);
    }
  }

  const refs = await getAllReferences();
  return NextResponse.json(refs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, description, thumbnail, categoryId, tagIds } = body;

    if (!title || !url) {
      return NextResponse.json(
        { error: "Title and URL are required" },
        { status: 400 }
      );
    }

    // Auto-fetch OG image if no thumbnail was provided
    let resolvedThumbnail = thumbnail ?? null;
    if (!resolvedThumbnail) {
      resolvedThumbnail = await fetchOgImage(url);
    }

    const ref = await createReference({
      title,
      url,
      description,
      thumbnail: resolvedThumbnail ?? undefined,
      categoryId,
      tagIds,
    });

    return NextResponse.json(ref, { status: 201 });
  } catch (error) {
    console.error("Error creating reference:", error);
    return NextResponse.json(
      { error: "Failed to create reference" },
      { status: 500 }
    );
  }
}
