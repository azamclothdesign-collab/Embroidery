import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  maxPackageFileBytes,
  maxUploadFileBytes,
} from "../../../constants/httpLimits.js";
import { env } from "../../../schemas/envSchema.js";
import { ServiceError } from "../../../utils/serviceError.js";

type UploadInput = {
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  contentBase64: string;
};

type PackageUploadInput = {
  fileName: string;
  contentType: "application/zip";
  contentBase64: string;
};

type UploadResult = {
  url: string;
  contentType: string;
  byteLength: number;
};

type PackageUploadResult = {
  packagePath: string;
  packageFileName: string;
  contentType: string;
  byteLength: number;
};

const extensionByType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;

function monorepoRoot(): string {
  return path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../../",
  );
}

function defaultUploadDir(): string {
  return path.join(monorepoRoot(), "Frontend/public/uploads");
}

function defaultPackageDir(): string {
  return path.join(monorepoRoot(), "storage/packages");
}

function sniffImageType(
  bytes: Buffer,
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function isZipBytes(bytes: Buffer): boolean {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  );
}

function sanitizeFileName(fileName: string): string {
  const base = path.basename(fileName).replace(/[^\w.\- ()[\]]+/g, "_");
  const trimmed = base.trim();

  if (trimmed.toLowerCase().endsWith(".zip")) {
    return trimmed.length > 0 ? trimmed : "design-package.zip";
  }

  return `${trimmed.length > 0 ? trimmed : "design-package"}.zip`;
}

export async function storeAdminImage(
  input: UploadInput,
): Promise<UploadResult> {
  let bytes: Buffer;

  try {
    bytes = Buffer.from(input.contentBase64, "base64");
  } catch {
    throw new ServiceError(400, "validation_error", "Invalid image payload");
  }

  if (bytes.byteLength === 0 || bytes.byteLength > maxUploadFileBytes) {
    throw new ServiceError(413, "payload_too_large", "Image exceeds size limit");
  }

  const sniffed = sniffImageType(bytes);

  if (sniffed === null) {
    throw new ServiceError(400, "validation_error", "Invalid image type");
  }

  const uploadDir = env.UPLOAD_DIR ?? defaultUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const storedName = `${randomUUID()}${extensionByType[sniffed]}`;
  const absolutePath = path.join(uploadDir, storedName);
  await writeFile(absolutePath, bytes);

  return {
    url: `/uploads/${storedName}`,
    contentType: sniffed,
    byteLength: bytes.byteLength,
  };
}

export async function storeAdminPackage(
  input: PackageUploadInput,
): Promise<PackageUploadResult> {
  let bytes: Buffer;

  try {
    bytes = Buffer.from(input.contentBase64, "base64");
  } catch {
    throw new ServiceError(400, "validation_error", "Invalid package payload");
  }

  if (bytes.byteLength === 0 || bytes.byteLength > maxPackageFileBytes) {
    throw new ServiceError(413, "payload_too_large", "Package exceeds size limit");
  }

  if (!isZipBytes(bytes) || input.contentType !== "application/zip") {
    throw new ServiceError(400, "validation_error", "Package must be a ZIP file");
  }

  const packageDir = defaultPackageDir();
  await mkdir(packageDir, { recursive: true });

  const packageFileName = sanitizeFileName(input.fileName);
  const storedName = `${randomUUID()}.zip`;
  const absolutePath = path.join(packageDir, storedName);
  await writeFile(absolutePath, bytes);

  return {
    packagePath: storedName,
    packageFileName,
    contentType: "application/zip",
    byteLength: bytes.byteLength,
  };
}

export async function readStoredPackage(packagePath: string): Promise<Buffer> {
  const safeName = path.basename(packagePath);

  if (safeName !== packagePath || !safeName.endsWith(".zip")) {
    throw new ServiceError(404, "not_found", "Package not found");
  }

  try {
    return await readFile(path.join(defaultPackageDir(), safeName));
  } catch {
    throw new ServiceError(404, "not_found", "Package not found");
  }
}
