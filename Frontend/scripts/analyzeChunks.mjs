import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.name.endsWith(".js")) {
      out.push(full);
    }
  }
  return out;
}

const root = path.join(process.cwd(), ".next", "static", "chunks");
const files = await walk(root);
const rows = [];

for (const file of files) {
  const buf = await readFile(file);
  rows.push({
    file: path.relative(process.cwd(), file).replaceAll("\\", "/"),
    gzip: gzipSync(buf).byteLength,
    raw: buf.length,
  });
}

rows.sort((a, b) => b.gzip - a.gzip);

for (const row of rows.slice(0, 20)) {
  console.log(
    `${(row.gzip / 1024).toFixed(1).padStart(6)}KB gzip  ${(row.raw / 1024).toFixed(0).padStart(5)}KB  ${row.file}`,
  );
}
