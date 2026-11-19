import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { writeImageVariantsFrom } from "../features/media/images.ts";
import { dirs, ensureStorage } from "../platform/storage.ts";

/**
 * Re-crops every existing media set in place so storefront galleries center
 * the embroidery artwork (drops Wilcom canvas / empty fabric margins).
 *
 *   cd backend && npm run reframe:media
 *
 * Paths stay /media/{uuid}; product rows do not change.
 */
async function main(): Promise<void> {
  await ensureStorage();
  const files = await readdir(dirs.media);
  const ids = [
    ...new Set(
      files
        .map((name) => {
          const match = /^([a-f0-9-]{36})-1600\.webp$/i.exec(name);
          return match?.[1] ?? null;
        })
        .filter((id): id is string => id !== null),
    ),
  ].sort();

  console.log(`Reframing ${ids.length} media set(s) in ${dirs.media}`);
  let ok = 0;
  let failed = 0;

  for (const id of ids) {
    const sourcePath = path.join(dirs.media, `${id}-1600.webp`);
    try {
      // Buffer first so we never read+overwrite the same path in one pipeline.
      const bytes = await readFile(sourcePath);
      await writeImageVariantsFrom(sharp(bytes, { limitInputPixels: 40_000_000 }), id, {
        allowUpscale: true,
      });
      ok += 1;
      console.log(`  ok  ${id}`);
    } catch (error) {
      failed += 1;
      console.error(`  fail ${id}: ${(error as Error).message}`);
    }
  }

  console.log(`Done. ok=${ok} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
