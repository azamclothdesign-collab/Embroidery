import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { FastifyRequest } from "fastify";
import { AppError, badRequest } from "../../platform/errors.ts";
import { dirs, ensureStorage, removeQuietly } from "../../platform/storage.ts";

export type TempUpload = { tmpPath: string; filename: string; size: number; head: Buffer };

function storageError(error: unknown): never {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  if (code === "EACCES" || code === "EPERM" || code === "EROFS") {
    throw new AppError(500, "storage_unwritable", "Server cannot write uploaded files. Fix STORAGE_DIR permissions and try again.");
  }
  if (code === "ENOSPC") {
    throw new AppError(500, "storage_full", "Server storage is full. Free disk space and try again.");
  }
  throw error;
}

/**
 * Streams the single multipart file to storage/tmp with a hard size limit.
 * Caller must move or delete tmpPath.
 */
export async function receiveFile(request: FastifyRequest, maxBytes: number): Promise<TempUpload> {
  await ensureStorage();
  const part = await request.file({ limits: { fileSize: maxBytes, files: 1, fields: 5 } });
  if (part === undefined) throw badRequest("file_missing", "Choose a file to upload");

  const tmpPath = path.join(dirs.tmp, `${randomUUID()}.part`);
  try {
    try {
      await pipeline(part.file, createWriteStream(tmpPath, { mode: 0o640 }));
    } catch (error) {
      storageError(error);
    }
    if (part.file.truncated) {
      throw badRequest("file_too_large", `File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB`);
    }
    const handle = await open(tmpPath, "r");
    try {
      const { size } = await handle.stat();
      if (size === 0) throw badRequest("file_empty", "The file is empty");
      const head = Buffer.alloc(Math.min(size, 16));
      await handle.read(head, 0, head.length, 0);
      return { tmpPath, filename: sanitizeName(part.filename), size, head };
    } finally {
      await handle.close();
    }
  } catch (error) {
    await removeQuietly(tmpPath);
    throw error;
  }
}

export function sanitizeName(name: string): string {
  const base = path.basename(name).normalize("NFKC");
  const cleaned = base.replaceAll(/[^\w.\- ()]+/g, "_").replaceAll(/\s+/g, " ").trim().slice(0, 120);
  return cleaned.length > 0 ? cleaned : "file";
}
