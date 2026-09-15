import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { gzipSync } from "node:zlib";

import {
  maxCinematicHomepageGzipBytes,
  maxRouteJavascriptGzipBytes,
} from "../src/constants/performanceBudgets.ts";

type PageBuildManifest = {
  polyfillFiles?: string[];
  rootMainFiles?: string[];
};

const chunkPattern = /(?:\/_next\/)?static\/chunks\/[A-Za-z0-9._-]+\.js/g;

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
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

async function gzipFileSize(filePath: string): Promise<number> {
  const contents = await readFile(filePath);
  return gzipSync(contents).byteLength;
}

function collectChunkPaths(source: string): string[] {
  return source.match(chunkPattern) ?? [];
}

function toRelativeChunkPath(chunkPath: string): string {
  return chunkPath.replace(/^\/_next\//, "");
}

async function run(): Promise<void> {
  const serverAppRoot = path.join(process.cwd(), ".next", "server", "app");
  const files = await listFiles(serverAppRoot);
  const routeManifests = files.filter((filePath) =>
    filePath.endsWith("page_client-reference-manifest.js"),
  );
  const violations: string[] = [];

  if (routeManifests.length === 0) {
    throw new Error("No client reference manifests found after build");
  }

  for (const manifestPath of routeManifests) {
    const routeDirectory = path.dirname(manifestPath);
    const routeName = path
      .relative(serverAppRoot, routeDirectory)
      .replace(/\\/g, "/");
    const chunks = new Set<string>();
    const clientManifest = await readFile(manifestPath, "utf8");

    for (const chunkPath of collectChunkPaths(clientManifest)) {
      chunks.add(toRelativeChunkPath(chunkPath));
    }

    const buildManifestPath = path.join(routeDirectory, "page", "build-manifest.json");
    const buildManifestRaw = await readFile(buildManifestPath, "utf8").catch(
      () => undefined,
    );

    if (buildManifestRaw !== undefined) {
      const buildManifest = JSON.parse(buildManifestRaw) as PageBuildManifest;

      for (const file of [
        ...(buildManifest.polyfillFiles ?? []),
        ...(buildManifest.rootMainFiles ?? []),
      ]) {
        if (file.endsWith(".js")) {
          chunks.add(file);
        }
      }
    }

    let total = 0;

    for (const chunk of chunks) {
      const absolutePath = path.join(process.cwd(), ".next", chunk);
      total += await gzipFileSize(absolutePath);
    }

    const budget =
      routeName === "[locale]/(public)"
        ? maxCinematicHomepageGzipBytes
        : maxRouteJavascriptGzipBytes;

    if (total > budget) {
      violations.push(`${routeName}: ${total} bytes gzip / ${budget} budget`);
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `JavaScript budget exceeded:\n${violations.join("\n")}`,
    );
  }
}

run().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Bundle budget check failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
