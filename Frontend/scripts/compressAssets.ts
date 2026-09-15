import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

import {
  maxCompressedAssetBytes,
  maxHeroVideoDesktopBytes,
  maxHeroVideoMobileBytes,
  maxSourceAssetBytes,
} from "../src/constants/performanceBudgets.ts";

const sourceRoot = path.join(process.cwd(), "public", "assets", "source");
const outputRoot = path.join(process.cwd(), "public", "assets");
const rasterExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".tif",
  ".tiff",
  ".webp",
]);

function isCheckMode(argv: readonly string[]): boolean {
  return argv.includes("--check");
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    (error: unknown) => {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return [];
      }

      throw error;
    },
  );

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nested = await listFiles(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function toWebpOutputPath(sourcePath: string): string {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const parsed = path.parse(relativePath);
  return path.join(outputRoot, parsed.dir, `${parsed.name}.webp`);
}

async function compressFile(sourcePath: string): Promise<void> {
  const sourceStat = await stat(sourcePath);

  if (sourceStat.size > maxSourceAssetBytes) {
    throw new Error(`Source asset exceeds budget: ${sourcePath}`);
  }

  const outputPath = toWebpOutputPath(sourcePath);
  await mkdir(path.dirname(outputPath), { recursive: true });

  let quality = 80;
  let output = await sharp(sourcePath).webp({ quality }).toBuffer();

  while (output.byteLength > maxCompressedAssetBytes && quality > 40) {
    quality -= 10;
    output = await sharp(sourcePath).webp({ quality }).toBuffer();
  }

  if (output.byteLength > maxCompressedAssetBytes) {
    throw new Error(`Compressed asset exceeds budget: ${sourcePath}`);
  }

  await writeFile(outputPath, output);
}

async function checkFile(sourcePath: string): Promise<void> {
  const sourceStat = await stat(sourcePath);

  if (sourceStat.size > maxSourceAssetBytes) {
    throw new Error(`Source asset exceeds budget: ${sourcePath}`);
  }

  const outputPath = toWebpOutputPath(sourcePath);
  const outputStat = await stat(outputPath).catch(() => undefined);

  if (outputStat === undefined) {
    throw new Error(`Missing compressed WebP for ${sourcePath}`);
  }

  if (outputStat.size > maxCompressedAssetBytes) {
    throw new Error(`Compressed asset exceeds budget: ${outputPath}`);
  }
}

async function checkHeroVideos(): Promise<void> {
  const videos = [
    { name: "heroEmbroideryMobile.webm", maxBytes: maxHeroVideoMobileBytes },
    { name: "heroEmbroideryMobile.mp4", maxBytes: maxHeroVideoMobileBytes },
    { name: "heroEmbroidery.webm", maxBytes: maxHeroVideoDesktopBytes },
    { name: "heroEmbroidery.mp4", maxBytes: maxHeroVideoDesktopBytes },
  ] as const;

  for (const video of videos) {
    const videoPath = path.join(outputRoot, video.name);
    const videoStat = await stat(videoPath).catch(() => undefined);

    if (videoStat === undefined) {
      continue;
    }

    if (videoStat.size > video.maxBytes) {
      throw new Error(`Hero video exceeds budget: ${videoPath}`);
    }
  }
}

async function run(): Promise<void> {
  const files = await listFiles(sourceRoot);
  const sources = files.filter((filePath) =>
    rasterExtensions.has(path.extname(filePath).toLowerCase()),
  );

  if (isCheckMode(process.argv)) {
    for (const sourcePath of sources) {
      await checkFile(sourcePath);
    }
    await checkHeroVideos();
    return;
  }

  for (const sourcePath of sources) {
    await compressFile(sourcePath);
  }

  await checkHeroVideos();
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Asset compression failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
