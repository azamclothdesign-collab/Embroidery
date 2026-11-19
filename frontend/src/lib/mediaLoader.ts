"use client";

/**
 * next/image loader for backend media. Uploads are stored as
 * /media/{id}-{400|800|1600}.webp; pick the smallest variant ≥ requested width.
 * Anything else (static files in /public) is returned unchanged.
 */
const WIDTHS = [400, 800, 1600] as const;

export function mediaUrl(src: string, width = 800): string {
  if (!src.startsWith("/media/")) return src;
  const chosen = WIDTHS.find((candidate) => candidate >= width) ?? 1600;
  return `${src}-${chosen}.webp`;
}

export default function mediaLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  return mediaUrl(src, width);
}
