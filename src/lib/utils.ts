export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDomainFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return "";
  }
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
}

// Generate a consistent gradient pair from a domain string
export function getDomainGradient(domain: string): { from: string; to: string } {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;

  return {
    from: `hsl(${hue1}, 50%, 15%)`,
    to: `hsl(${hue2}, 40%, 8%)`,
  };
}

// Dark-theme category badge colors
export const categoryColors: Record<string, string> = {
  blue: "bg-blue-950/60 text-blue-400 border-blue-800/50",
  purple: "bg-purple-950/60 text-purple-400 border-purple-800/50",
  green: "bg-green-950/60 text-green-400 border-green-800/50",
  orange: "bg-orange-950/60 text-orange-400 border-orange-800/50",
  pink: "bg-pink-950/60 text-pink-400 border-pink-800/50",
  teal: "bg-teal-950/60 text-teal-400 border-teal-800/50",
  red: "bg-red-950/60 text-red-400 border-red-800/50",
  yellow: "bg-yellow-950/60 text-yellow-400 border-yellow-800/50",
  indigo: "bg-indigo-950/60 text-indigo-400 border-indigo-800/50",
  cyan: "bg-cyan-950/60 text-cyan-400 border-cyan-800/50",
};
