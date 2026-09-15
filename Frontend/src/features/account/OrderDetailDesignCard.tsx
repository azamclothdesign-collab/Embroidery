"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { accountCopy } from "@/constants/accountCopy";
import { formatShopPrice, shopProductHref } from "@/constants/shopCatalog";
import {
  contactHref,
  guidesHref,
  howItWorksHref,
  licensingHref,
} from "@/constants/siteNavigation";
import { type LocalOrderLine } from "@/lib/session/orderSession";
import { downloadOrderPackageAction } from "@/server/actions/adminCatalogActions";

type DownloadState = "idle" | "preparing" | "downloading" | "complete" | "error";

type OrderDetailDesignCardProps = {
  locale: string;
  orderId: string;
  line: LocalOrderLine;
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

export function OrderDetailDesignCard({
  locale,
  orderId,
  line,
  onToast,
}: OrderDetailDesignCardProps) {
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
        onToast(accountCopy.downloadsFailed);
        return;
      }

      triggerBrowserDownload(
        result.data.fileName,
        result.data.contentType,
        result.data.contentBase64,
      );
      setAllState("complete");
      onToast(accountCopy.downloadsStarted);
      window.setTimeout(() => {
        setAllState("idle");
      }, 1600);
    });
  };

  const allLabel =
    allState === "preparing"
      ? accountCopy.downloadsPreparing
      : allState === "downloading"
        ? accountCopy.downloadsDownloading
        : allState === "complete"
          ? accountCopy.downloadsComplete
          : allState === "error"
            ? accountCopy.orderDetailTryAgain
            : accountCopy.downloadsZipAll;

  return (
    <article className="accountCard border border-line bg-surface p-5 md:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <div className="relative aspect-square w-full max-w-[10rem] overflow-hidden bg-line">
          <CoverImage
            src={line.imageSrc}
            alt={line.imageAlt}
            sizes="160px"
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 font-medium tracking-tight text-ink">
            {line.displayName}
          </h3>
          <p className="mt-3 text-meta uppercase tracking-[0.14em] text-ink-soft">
            {accountCopy.downloadsSingleZip}
          </p>
          <p className="mt-2 text-body text-ink">
            {formatShopPrice(line.priceCents)}
          </p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            <TextButton
              disabled={
                isPending ||
                allState === "preparing" ||
                allState === "downloading"
              }
              onClick={runDownload}
            >
              {allLabel}
            </TextButton>
            <TextLink
              href={shopProductHref(locale, line.slug)}
              tone="ghostOnLight"
            >
              {accountCopy.orderDetailViewDesign}
            </TextLink>
          </div>
          <p className="mt-3 text-meta leading-6 text-ink-soft">
            {accountCopy.downloadsPendingNote}
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link
              href={`/${locale}${howItWorksHref}`}
              className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
            >
              {accountCopy.downloadsViewGuide}
            </Link>
            <Link
              href={`/${locale}${guidesHref}`}
              className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
            >
              {accountCopy.orderDetailNeedHelp}
            </Link>
            <Link
              href={`/${locale}${licensingHref}`}
              className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
            >
              {accountCopy.downloadsLicense}
            </Link>
            <Link
              href={`/${locale}${contactHref}`}
              className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
            >
              {accountCopy.orderDetailContact}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
