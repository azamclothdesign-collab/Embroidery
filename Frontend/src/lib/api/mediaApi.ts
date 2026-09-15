import { apiRoutes } from "@/constants/apiRoutes";
import { maxPackageJsonBytes } from "@/constants/httpLimits";
import { requestApiJsonWithContext } from "@/lib/api/apiClient";

import "server-only";

export type MediaUploadInput = {
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  contentBase64: string;
};

export type MediaUploadResult = {
  url: string;
  contentType: string;
  byteLength: number;
};

export type MediaPackageUploadInput = {
  fileName: string;
  contentType: "application/zip";
  contentBase64: string;
};

export type MediaPackageUploadResult = {
  packagePath: string;
  packageFileName: string;
  contentType: string;
  byteLength: number;
};

type MediaUploadResponse = {
  media: MediaUploadResult;
};

type MediaPackageUploadResponse = {
  media: MediaPackageUploadResult;
};

export async function uploadAdminMedia(
  input: MediaUploadInput,
): Promise<MediaUploadResult> {
  const data = await requestApiJsonWithContext<MediaUploadResponse>({
    method: "POST",
    path: apiRoutes.adminMedia.upload,
    body: input,
    cacheStrategy: { cache: "no-store" },
  });

  return data.media;
}

export async function uploadAdminPackage(
  input: MediaPackageUploadInput,
): Promise<MediaPackageUploadResult> {
  const data = await requestApiJsonWithContext<MediaPackageUploadResponse>({
    method: "POST",
    path: apiRoutes.adminMedia.package,
    body: input,
    cacheStrategy: { cache: "no-store" },
    maxResponseBytes: maxPackageJsonBytes,
  });

  return data.media;
}
