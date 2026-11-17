import path from "node:path";
import sharp from "sharp";
import { dirs } from "../../platform/storage.ts";

/** Widths generated for every uploaded image; the storefront loader picks one. */
export const IMAGE_WIDTHS = [400, 800, 1600] as const;

export type SniffedImage = "jpeg" | "png" | "webp" | "avif" | "gif";

/** Detects real image type from magic bytes (never trusts the file name). */
export function sniffImage(head: Buffer): SniffedImage | null {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (head.length >= 8 && head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (head.length >= 12 && head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (head.length >= 12 && head.toString("ascii", 4, 12).startsWith("ftypavi")) return "avif";
  if (head.length >= 6 && head.toString("ascii", 0, 6).startsWith("GIF8")) return "gif";
  return null;
}

/**
 * Writes /media/{id}-{w}.webp variants (plus the original aspect ratio).
 * Returns the public base path stored in the DB: /media/{id}
 */
export async function writeImageVariants(sourcePath: string, id: string): Promise<{ base: string; width: number; height: number }> {
  const image = sharp(sourcePath, { limitInputPixels: 40_000_000 }).rotate();
  const meta = await image.metadata();
  if (meta.width === undefined || meta.height === undefined) throw new Error("Unreadable image");
  if (meta.width < 300 || meta.height < 300) throw new Error("Image must be at least 300 × 300 pixels");

  await Promise.all(
    IMAGE_WIDTHS.map((width) =>
      image
        .clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: width >= 1600 ? 70 : 60, effort: 5, smartSubsample: true })
        .toFile(path.join(dirs.media, `${id}-${width}.webp`)),
    ),
  );
  return { base: `/media/${id}`, width: meta.width, height: meta.height };
}
