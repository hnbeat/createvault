/**
 * Server-side utility to extract Open Graph data from a URL.
 * Returns image, title, and description.
 */

export interface OgData {
  image: string | null;
  title: string | null;
  description: string | null;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractMeta(html: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

/**
 * Find the first meaningful <img> src in the HTML.
 * Skips tiny images (icons, tracking pixels, SVGs, data URIs).
 */
function findFirstSignificantImage(html: string, baseUrl: string): string | null {
  // Match all <img> tags with src
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    let src = match[1];
    if (!src) continue;

    // Skip data URIs, SVGs, tracking pixels, and tiny icons
    if (src.startsWith("data:")) continue;
    if (src.endsWith(".svg")) continue;
    if (src.endsWith(".ico")) continue;
    if (src.includes("pixel") || src.includes("tracking") || src.includes("1x1")) continue;
    if (src.includes("logo") && (src.includes("16") || src.includes("32"))) continue;

    // Check for width/height attributes that indicate a tiny image
    const tagStr = match[0];
    const widthMatch = tagStr.match(/width=["']?(\d+)/i);
    const heightMatch = tagStr.match(/height=["']?(\d+)/i);
    if (widthMatch && parseInt(widthMatch[1]) < 50) continue;
    if (heightMatch && parseInt(heightMatch[1]) < 50) continue;

    // Make absolute URL
    if (!src.startsWith("http")) {
      try {
        src = new URL(src, baseUrl).href;
      } catch {
        continue;
      }
    }

    return src;
  }
  return null;
}

export async function fetchOgData(url: string): Promise<OgData> {
  const html = await fetchHtml(url);
  if (!html) return { image: null, title: null, description: null };

  // Image — try OG / Twitter meta first
  let image = extractMeta(html, [
    /property="og:image"\s+content="([^"]+)"/i,
    /property='og:image'\s+content='([^']+)'/i,
    /content="([^"]+)"\s+property="og:image"/i,
    /content='([^']+)'\s+property='og:image'/i,
    /name="twitter:image"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+name="twitter:image"/i,
  ]);

  if (image && !image.startsWith("http")) {
    try {
      image = new URL(image, new URL(url).origin).href;
    } catch {
      image = null;
    }
  }

  // Fallback: find the first significant image on the page
  if (!image) {
    try {
      image = findFirstSignificantImage(html, new URL(url).origin);
    } catch {
      // ignore
    }
  }

  // Title
  const title = extractMeta(html, [
    /property="og:title"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+property="og:title"/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);

  // Description
  const description = extractMeta(html, [
    /property="og:description"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+property="og:description"/i,
    /name="description"\s+content="([^"]+)"/i,
    /content="([^"]+)"\s+name="description"/i,
  ]);

  return { image, title, description };
}

// Convenience wrapper for just the image
export async function fetchOgImage(url: string): Promise<string | null> {
  const data = await fetchOgData(url);
  return data.image;
}

/**
 * Detect if text is likely non-English and translate it.
 * Uses MyMemory free translation API.
 */
export async function translateIfNeeded(text: string): Promise<string> {
  if (!text || text.length < 3) return text;

  // Simple heuristic: if text contains mostly ASCII letters, it's probably English
  const asciiLetters = text.replace(/[^a-zA-Z]/g, "").length;
  const totalLetters = text.replace(/[\s\d\W]/g, "").length;

  if (totalLetters === 0) return text;
  const asciiRatio = asciiLetters / totalLetters;

  // If mostly ASCII, assume English
  if (asciiRatio > 0.8) return text;

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|en`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated.toLowerCase() !== text.toLowerCase()) {
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}
