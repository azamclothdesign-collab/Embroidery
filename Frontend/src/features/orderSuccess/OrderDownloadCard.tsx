"use client";

import { useState, useTransition } from "react";

import { CoverImage } from "@/components/CoverImage";
import { TextButton } from "@/components/TextButton";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { type LocalOrderLine } from "@/lib/session/orderSession";
import { downloadOrderPackageAction } from "@/server/actions/adminCatalogActions";

type DownloadState = "idle" | "preparing" | "downloading" | "complete" | "error";

type OrderDownloadCardProps = {
  line: LocalOrderLine;
  orderId: string;
  onToast: (message: string) => void;
};

function triggerBrowserDownload(
  fileName: string,
  contentType: string,
  contentBase64: string,
): void {
  const binary = atob(contentBase64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function OrderDownloadCard({
  line,
  orderId,
  onToast,
}: OrderDownloadCardProps) {
  const [allState, setAllState] = useState<DownloadState>("idle");
  const [isPending, startTransition] = useTransition();

  const runDownload = () => {
    setAllState("preparing");
    startTransition(async () => {
      setAllState("downloading");
      const result = await downloadOrderPackageAction({
        orderId,
        productSlug: line.slug,
      });

      if (!result.ok) {
        setAllState("error");
        onToast(orderSuccessCopy.downloadFailed);
        return;
      }

      triggerBrowserDownload(
        result.data.fileName,
        result.data.contentType,
        result.data.contentBase64,
      );
      setAllState("complete");
      onToast(orderSuccessCopy.downloadStarted);
      window.setTimeout(() => {
        setAllState("idle");
      }, 1800);
    });
  };

  const allLabel =
    allState === "preparing"
      ? orderSuccessCopy.preparing
      : allState === "downloading"
        ? orderSuccessCopy.downloading
        : allState === "complete"
          ? orderSuccessCopy.downloaded
          : allState === "error"
            ? orderSuccessCopy.tryAgain
            : orderSuccessCopy.downloadZip;

  return (
    <article className="orderDownloadCard border border-line bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="relative aspect-square w-full max-w-[12rem] overflow-hidden bg-line">
          <CoverImage
            src={line.imageSrc}
            alt={line.imageAlt}
            sizes="192px"
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 font-medium tracking-tight text-ink">
            {line.displayName}
          </h3>
          <p className="mt-3 text-meta text-ink-soft">
            {[line.sizeLabel, line.stitchLabel.length > 0 ? `${line.stitchLabel} stitches` : ""]
              .filter((item) => item.length > 0)
              .join(" · ")}
          </p>
          <p className="mt-6 text-meta uppercase tracking-[0.14em] text-ink-soft">
            {orderSuccessCopy.filesIncluded}
          </p>
          <p className="mt-2 text-body text-ink">
            {orderSuccessCopy.singleZipLabel}
          </p>
          <div className="mt-6">
            <TextButton
              className="w-full active:scale-[0.97] sm:w-auto"
              disabled={
                isPending ||
                allState === "preparing" ||
                allState === "downloading"
              }
              onClick={runDownload}
            >
              {allLabel}
            </TextButton>
          </div>
          <p className="mt-3 max-w-xl text-meta leading-6 text-ink-soft">
            {orderSuccessCopy.downloadPendingNote}
          </p>
        </div>
      </div>
    </article>
  );
}
