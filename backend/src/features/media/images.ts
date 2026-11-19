import path from "node:path";
import sharp from "sharp";
import { dirs } from "../../platform/storage.ts";

/** Widths generated for every uploaded image; the storefront loader picks one. */
export const IMAGE_WIDTHS = [400, 800, 1600] as const;

export type SniffedImage = "jpeg" | "png" | "webp" | "avif" | "gif";

export type CropRect = { left: number; top: number; width: number; height: number };

/** Detects real image type from magic bytes (never trusts the file name). */
export function sniffImage(head: Buffer): SniffedImage | null {
  if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (head.length >= 8 && head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (head.length >= 12 && head.toString("ascii", 0, 4) === "RIFF" && head.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (head.length >= 12 && head.toString("ascii", 4, 12).startsWith("ftypavi")) return "avif";
  if (head.length >= 6 && head.toString("ascii", 0, 6).startsWith("GIF8")) return "gif";
  return null;
}

const ANALYSIS_MAX = 480;
const CHROMA_MIN = 28;
const PAD_RATIO = 0.05;
const SKIP_IF_COVERAGE = 0.9;

function chroma(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

/**
 * Finds a tight bounding box around colourful embroidery artwork.
 * Ignores flat neutrals (gray canvas, white paper, dark fabric) and sparse
 * UI chrome via column/row density. Returns null when the artwork already
 * fills most of the frame.
 */
export async function findContentCrop(source: sharp.Sharp): Promise<CropRect | null> {
  const meta = await source.metadata();
  if (meta.width === undefined || meta.height === undefined) return null;
  const fullW = meta.width;
  const fullH = meta.height;

  const scale = Math.min(1, ANALYSIS_MAX / Math.max(fullW, fullH));
  const w = Math.max(1, Math.round(fullW * scale));
  const h = Math.max(1, Math.round(fullH * scale));

  const { data, info } = await source
    .clone()
    .rotate()
    .resize(w, h, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const total = info.width * info.height;
  const colHits = new Array<number>(info.width).fill(0);
  const rowHits = new Array<number>(info.height).fill(0);
  let hits = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if ((data[i + 3] ?? 255) < 16) continue;
      if (chroma(data[i]!, data[i + 1]!, data[i + 2]!) < CHROMA_MIN) continue;
      hits += 1;
      colHits[x] = (colHits[x] ?? 0) + 1;
      rowHits[y] = (rowHits[y] ?? 0) + 1;
    }
  }

  if (hits < Math.max(40, total * 0.002)) return null;

  // Drop sparse UI chrome (taskbars / window edges) by keeping dense rows/cols.
  const colMax = Math.max(...colHits);
  const rowMax = Math.max(...rowHits);
  const colThresh = Math.max(2, colMax * 0.1);
  const rowThresh = Math.max(2, rowMax * 0.1);
  let minX = 0;
  let maxX = info.width - 1;
  let minY = 0;
  let maxY = info.height - 1;
  while (minX < info.width && (colHits[minX] ?? 0) < colThresh) minX += 1;
  while (maxX > minX && (colHits[maxX] ?? 0) < colThresh) maxX -= 1;
  while (minY < info.height && (rowHits[minY] ?? 0) < rowThresh) minY += 1;
  while (maxY > minY && (rowHits[maxY] ?? 0) < rowThresh) maxY -= 1;

  if (maxX <= minX || maxY <= minY) return null;

  const inv = 1 / scale;
  let left = Math.floor(minX * inv);
  let top = Math.floor(minY * inv);
  let right = Math.ceil((maxX + 1) * inv);
  let bottom = Math.ceil((maxY + 1) * inv);

  const padX = Math.round((right - left) * PAD_RATIO);
  const padY = Math.round((bottom - top) * PAD_RATIO);
  left = Math.max(0, left - padX);
  top = Math.max(0, top - padY);
  right = Math.min(fullW, right + padX);
  bottom = Math.min(fullH, bottom + padY);

  const width = right - left;
  const height = bottom - top;
  if (width < 8 || height < 8) return null;
  if ((width * height) / (fullW * fullH) >= SKIP_IF_COVERAGE) return null;

  return { left, top, width, height };
}

/**
 * Writes /media/{id}-{w}.webp variants (plus the original aspect ratio).
 * Returns the public base path stored in the DB: /media/{id}
 *
 * Crops away flat screenshot / fabric margins first so the design sits
 * in the middle of the frame on mobile.
 */
export async function writeImageVariants(
  sourcePath: string,
  id: string,
  options?: { allowUpscale?: boolean },
): Promise<{ base: string; width: number; height: number }> {
  return writeImageVariantsFrom(sharp(sourcePath, { limitInputPixels: 40_000_000 }), id, options);
}

/** Same as writeImageVariants but from an already-opened Sharp pipeline (reframe script). */
export async function writeImageVariantsFrom(
  source: sharp.Sharp,
  id: string,
  options?: { allowUpscale?: boolean },
): Promise<{ base: string; width: number; height: number }> {
  const allowUpscale = options?.allowUpscale === true;
  const oriented = source.clone().rotate();
  const crop = await findContentCrop(oriented);
  const framed = crop === null ? oriented : oriented.extract(crop);

  const meta = await framed.metadata();
  if (meta.width === undefined || meta.height === undefined) throw new Error("Unreadable image");

  await Promise.all(
    IMAGE_WIDTHS.map((width) =>
      framed
        .clone()
        .resize({ width, withoutEnlargement: !allowUpscale })
        .webp({ quality: width >= 1600 ? 70 : 60, effort: 5, smartSubsample: true })
        .toFile(path.join(dirs.media, `${id}-${width}.webp`)),
    ),
  );
  return { base: `/media/${id}`, width: meta.width, height: meta.height };
}
