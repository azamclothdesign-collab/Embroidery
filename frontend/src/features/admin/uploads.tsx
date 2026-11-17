"use client";

import { FileArchive, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

/** XHR (not fetch) so large ZIP uploads can show progress. */
function upload<T>(kind: "image" | "package", file: File, onProgress: (percent: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/upload/${kind}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body: unknown = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        if (body === null || typeof body !== "object") {
          reject(new Error(`Upload failed (${xhr.status})`));
          return;
        }
        resolve(body as T);
        return;
      }
      const problem = body as { title?: string; detail?: string; code?: string } | null;
      reject(new Error(problem?.title ?? problem?.detail ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.ontimeout = () => reject(new Error("Upload timed out — try a smaller file or check your connection"));
    xhr.timeout = 10 * 60_000;
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

export function ImagesField({ value, onChange, max = 8, label = "Images" }: { value: string[]; onChange: (next: string[]) => void; max?: number; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const add = async (files: FileList | null) => {
    if (files === null) return;
    let next = [...value];
    for (const file of Array.from(files).slice(0, max - next.length)) {
      try {
        setBusy(0);
        const result = await upload<{ path: string }>("image", file, setBusy);
        next = [...next, result.path];
        onChange(next);
      } catch (error) {
        toast.error(`${file.name}: ${(error as Error).message}`);
      }
    }
    setBusy(null);
    if (input.current !== null) input.current.value = "";
  };

  return (
    <div>
      <p className="field-label">{label}</p>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {value.map((path, index) => (
          <li key={path} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-sand">
            <Image src={path} alt="" fill sizes="160px" className="object-cover" />
            {index === 0 && <span className="absolute start-1.5 top-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/60 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {index > 0 && (
                <button type="button" className="flex size-8 items-center justify-center rounded-full bg-paper" aria-label="Make cover image" onClick={() => onChange([path, ...value.filter((p) => p !== path)])}>
                  <Star className="size-4" aria-hidden />
                </button>
              )}
              <button type="button" className="flex size-8 items-center justify-center rounded-full bg-paper text-danger" aria-label="Remove image" onClick={() => onChange(value.filter((p) => p !== path))}>
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
        {value.length < max && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy !== null}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-sm text-ink-soft hover:border-ink/40 hover:bg-sand"
            >
              {busy !== null ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <ImagePlus className="size-6" aria-hidden />}
              {busy !== null ? `${busy}%` : "Add image"}
            </button>
          </li>
        )}
      </ul>
      <input ref={input} type="file" accept="image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/avif,image/gif,.jpg,.jpeg,.jfif,.png,.webp,.avif,.gif" multiple hidden onChange={(e) => void add(e.target.files)} />
      <p className="field-help">JPG/JFIF, PNG, WebP or GIF (not HEIC). Resized to fast WebP automatically. First image is the cover.</p>
    </div>
  );
}

export type PackageInfo = { id: string; name: string; size: number; files: string[] };

export function ZipField({ value, onChange, error }: { value: PackageInfo | null; onChange: (next: PackageInfo) => void; error?: string | undefined }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const send = async (file: File | undefined) => {
    if (file === undefined) return;
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast.error("Only .zip files are accepted");
      return;
    }
    try {
      setProgress(0);
      const result = await upload<{ packageId: string; name: string; size: number; files: string[] }>("package", file, setProgress);
      onChange({ id: result.packageId, name: result.name, size: result.size, files: result.files });
      toast.success("ZIP checked and uploaded");
    } catch (uploadError) {
      toast.error((uploadError as Error).message);
    } finally {
      setProgress(null);
      if (input.current !== null) input.current.value = "";
    }
  };

  return (
    <div>
      <p className="field-label">Design ZIP file</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void send(e.dataTransfer.files[0]);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-5 transition",
          dragging ? "border-saffron bg-saffron-soft/40" : error !== undefined ? "border-danger" : "border-line",
        )}
      >
        {value !== null && (
          <div className="mb-4 flex items-start gap-3 rounded-xl bg-sand/70 p-3">
            <FileArchive className="mt-0.5 size-6 shrink-0 text-teal" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{value.name}</p>
              <p className="text-sm text-ink-soft">{formatBytes(value.size)}{value.files.length > 0 ? ` · ${value.files.length} files` : ""}</p>
              {value.files.length > 0 && (
                <details className="mt-1 text-sm">
                  <summary className="cursor-pointer text-teal">Show files</summary>
                  <ul className="mt-1 max-h-40 overflow-y-auto font-mono text-xs text-ink-soft" dir="ltr">
                    {value.files.map((file) => <li key={file}>{file}</li>)}
                  </ul>
                </details>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col items-center gap-2 text-center">
          {progress !== null ? (
            <>
              <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm font-semibold">{progress < 100 ? `Uploading ${progress}%` : "Checking ZIP…"}</p>
            </>
          ) : (
            <>
              <UploadCloud className="size-7 text-muted" aria-hidden />
              <button type="button" className="btn btn-outline" onClick={() => input.current?.click()}>
                {value === null ? "Choose ZIP file" : "Replace ZIP"}
              </button>
              <p className="text-xs text-muted">or drag and drop · .zip only · paths and contents are checked</p>
            </>
          )}
        </div>
      </div>
      {error !== undefined && <p className="field-error">{error}</p>}
      <input ref={input} type="file" accept=".zip,application/zip" hidden onChange={(e) => void send(e.target.files?.[0])} />
    </div>
  );
}
