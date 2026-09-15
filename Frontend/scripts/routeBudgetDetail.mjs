import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const chunkPattern = /(?:\/_next\/)?static\/chunks\/[A-Za-z0-9._-]+\.js/g;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
    else files.push(fullPath);
  }
  return files;
}

async function gzipSize(filePath) {
  return gzipSync(await readFile(filePath)).byteLength;
}

const serverAppRoot = path.join(process.cwd(), ".next", "server", "app");
const route = process.argv[2] ?? "[locale]/(public)/designs/[slug]";
const manifests = (await listFiles(serverAppRoot)).filter((f) =>
  f.endsWith("page_client-reference-manifest.js"),
);
const manifestPath = manifests.find(
  (f) =>
    path.relative(serverAppRoot, path.dirname(f)).replace(/\\/g, "/") === route,
);
if (!manifestPath) {
  console.error("missing", route);
  process.exit(1);
}

const chunks = new Set(
  ((await readFile(manifestPath, "utf8")).match(chunkPattern) ?? []).map((c) =>
    c.replace(/^\/_next\//, ""),
  ),
);

const buildManifestPath = path.join(
  path.dirname(manifestPath),
  "page",
  "build-manifest.json",
);
try {
  const buildManifest = JSON.parse(await readFile(buildManifestPath, "utf8"));
  for (const file of [
    ...(buildManifest.polyfillFiles ?? []),
    ...(buildManifest.rootMainFiles ?? []),
  ]) {
    if (file.endsWith(".js")) chunks.add(file);
  }
} catch {
  // ignore
}

const rows = [];
let total = 0;
for (const chunk of chunks) {
  const abs = path.join(process.cwd(), ".next", chunk);
  try {
    const size = await gzipSize(abs);
    total += size;
    rows.push({ chunk: path.basename(chunk), size });
  } catch {
    rows.push({ chunk: path.basename(chunk), size: -1 });
  }
}
rows.sort((a, b) => b.size - a.size);
console.log(route, "total", (total / 1024).toFixed(1) + "KB");
for (const row of rows) {
  console.log(
    `${(row.size / 1024).toFixed(1).padStart(6)}KB  ${row.chunk}`,
  );
}
