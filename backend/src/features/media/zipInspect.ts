import { open } from "node:fs/promises";

export type ZipReport = { files: string[]; totalUncompressed: number };

const LOCAL_HEADER = 0x04034b50;
const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const MAX_ENTRIES = 2000;
const MAX_UNCOMPRESSED = 2 * 1024 ** 3;

/**
 * Validates a ZIP by reading its central directory (no extraction):
 * - starts with a local file header ("PK\x03\x04")
 * - has an end-of-central-directory record
 * - no absolute / parent-traversal paths, bounded entry count and size
 * Throws with a readable message when the file is not an acceptable ZIP.
 */
export async function inspectZip(filePath: string): Promise<ZipReport> {
  const handle = await open(filePath, "r");
  try {
    const { size } = await handle.stat();
    if (size < 22) throw new Error("File is too small to be a ZIP");

    const head = Buffer.alloc(4);
    await handle.read(head, 0, 4, 0);
    if (head.readUInt32LE(0) !== LOCAL_HEADER) throw new Error("This is not a ZIP file");

    // EOCD is in the last 22 bytes + up to 64 KiB of comment.
    const tailSize = Math.min(size, 22 + 0xffff);
    const tail = Buffer.alloc(tailSize);
    await handle.read(tail, 0, tailSize, size - tailSize);
    let eocd = -1;
    for (let i = tailSize - 22; i >= 0; i -= 1) {
      if (tail.readUInt32LE(i) === EOCD) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) throw new Error("ZIP is damaged (no central directory)");

    const entries = tail.readUInt16LE(eocd + 10);
    const cdSize = tail.readUInt32LE(eocd + 12);
    const cdOffset = tail.readUInt32LE(eocd + 16);
    if (entries === 0xffff || cdOffset === 0xffffffff) throw new Error("ZIP64 archives are not supported; re-save as a normal ZIP");
    if (entries === 0) throw new Error("ZIP is empty");
    if (entries > MAX_ENTRIES) throw new Error(`ZIP has too many files (max ${MAX_ENTRIES})`);
    if (cdOffset + cdSize > size) throw new Error("ZIP is damaged (bad directory offset)");

    const cd = Buffer.alloc(cdSize);
    await handle.read(cd, 0, cdSize, cdOffset);

    const files: string[] = [];
    let total = 0;
    let pointer = 0;
    for (let n = 0; n < entries; n += 1) {
      if (pointer + 46 > cd.length || cd.readUInt32LE(pointer) !== CENTRAL) throw new Error("ZIP is damaged (bad entry)");
      const uncompressed = cd.readUInt32LE(pointer + 24);
      const nameLength = cd.readUInt16LE(pointer + 28);
      const extraLength = cd.readUInt16LE(pointer + 30);
      const commentLength = cd.readUInt16LE(pointer + 32);
      const name = cd.toString("utf8", pointer + 46, pointer + 46 + nameLength);
      pointer += 46 + nameLength + extraLength + commentLength;

      const normalized = name.replaceAll("\\", "/");
      if (normalized.startsWith("/") || /^[a-zA-Z]:/.test(normalized) || normalized.split("/").includes("..")) {
        throw new Error(`ZIP contains an unsafe path: ${name}`);
      }
      total += uncompressed;
      if (total > MAX_UNCOMPRESSED) throw new Error("ZIP expands to more than 2 GB");
      if (!normalized.endsWith("/")) files.push(normalized);
    }
    if (files.length === 0) throw new Error("ZIP contains only folders");
    return { files, totalUncompressed: total };
  } finally {
    await handle.close();
  }
}
