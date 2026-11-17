import { mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { config } from "./config.ts";

/**
 * Storage layout (all outside the web root):
 *   media/     public product + category images (served by nginx at /media/)
 *   packages/  paid ZIP files (served only through signed /dl links)
 *   proofs/    bank transfer receipts (admin only)
 *   tmp/       in-progress uploads
 */
export const storageRoot = path.resolve(config.STORAGE_DIR);
export const dirs = {
  media: path.join(storageRoot, "media"),
  packages: path.join(storageRoot, "packages"),
  proofs: path.join(storageRoot, "proofs"),
  tmp: path.join(storageRoot, "tmp"),
} as const;

export async function ensureStorage(): Promise<void> {
  await Promise.all(Object.values(dirs).map((dir) => mkdir(dir, { recursive: true, mode: 0o750 })));
}

/** Resolves a stored relative name inside a storage dir, refusing traversal. */
export function resolveInside(dir: string, name: string): string {
  const base = path.basename(name);
  if (base !== name || base.length === 0 || base.startsWith(".")) {
    throw new Error("Invalid storage name");
  }
  return path.join(dir, base);
}

export async function moveInto(tempPath: string, dir: string, name: string): Promise<string> {
  const target = resolveInside(dir, name);
  await rename(tempPath, target);
  return target;
}

export async function removeQuietly(filePath: string): Promise<void> {
  await rm(filePath, { force: true });
}
