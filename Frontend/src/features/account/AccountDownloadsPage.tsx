"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { accountCopy } from "@/constants/accountCopy";
import {
  formatOrderDate,
  formatPurchasedDesignCount,
  orderDetailHref,
} from "@/constants/accountNav";
import {
  howItWorksHref,
  licensingHref,
  shopDesignsHref,
} from "@/constants/siteNavigation";
import { AccountGuard } from "@/features/account/AccountGuard";
import { AccountScrollMotion } from "@/features/account/AccountScrollMotion";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useSyncSessionOrderToHistory } from "@/hooks/useSyncSessionOrderToHistory";
import { type LocalOrder } from "@/lib/session/orderSession";
import { downloadOrderPackageAction } from "@/server/actions/adminCatalogActions";
import { type DownloadLibraryItem } from "@/types/api/account";

type LibraryItem = {
  key: string;
  displayName: string;
  imageSrc: string;
  imageAlt: string;
  orderId: string;
  orderCreatedAt: string;
  productSlug: string;
};

type DownloadState = "idle" | "preparing" | "downloading" | "complete" | "error";
type SortId = "recent" | "name";

type AccountDownloadsPageProps = {
  locale: string;
  items: DownloadLibraryItem[];
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

function fromApiItem(item: DownloadLibraryItem): LibraryItem {
  return {
    key: item.key,
    displayName: item.displayName,
    imageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    orderId: item.orderId,
    orderCreatedAt: item.orderCreatedAt,
    productSlug: item.slug,
  };
}

function fromLocalOrders(orders: readonly LocalOrder[]): LibraryItem[] {
  return orders.flatMap((order) =>
    order.lines.map((line) => ({
      key: `${order.id}-${line.slug}`,
      displayName: line.displayName,
      imageSrc: line.imageSrc,
      imageAlt: line.imageAlt,
      orderId: order.id,
      orderCreatedAt: order.createdAt,
      productSlug: line.slug,
    })),
  );
}

export function AccountDownloadsPage({
  locale,
  items,
}: AccountDownloadsPageProps) {
  useSyncSessionOrderToHistory();
  const orders = useOrderHistory();
  const [query, setQuery] = useState("");
  const [sortId, setSortId] = useState<SortId>("recent");
  const [toast, setToast] = useState<string | null>(null);
  const [states, setStates] = useState<Record<string, DownloadState>>({});
  const [isPending, startTransition] = useTransition();

  const library = useMemo(() => {
    const apiItems = items.map(fromApiItem);
    const apiKeys = new Set(apiItems.map((item) => item.key));
    const localFallback = fromLocalOrders(orders).filter(
      (item) => !apiKeys.has(item.key),
    );

    return [...apiItems, ...localFallback];
  }, [items, orders]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let next = library.filter((item) => {
      return (
        normalized.length === 0 ||
        item.displayName.toLowerCase().includes(normalized) ||
        item.orderId.toLowerCase().includes(normalized)
      );
    });

    if (sortId === "name") {
      next = [...next].sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      );
    } else {
      next = [...next].sort(
        (a, b) =>
          new Date(b.orderCreatedAt).getTime() -
          new Date(a.orderCreatedAt).getTime(),
      );
    }

    return next;
  }, [library, query, sortId]);

  const runDownload = (item: LibraryItem) => {
    setStates((current) => ({ ...current, [item.key]: "preparing" }));
    startTransition(async () => {
      setStates((current) => ({ ...current, [item.key]: "downloading" }));
      const result = await downloadOrderPackageAction({
        orderId: item.orderId,
        productSlug: item.productSlug,
      });

      if (!result.ok) {
        setStates((current) => ({ ...current, [item.key]: "error" }));
        setToast(accountCopy.downloadsFailed);
        return;
      }

      triggerBrowserDownload(
        result.data.fileName,
        result.data.contentType,
        result.data.contentBase64,
      );
      setStates((current) => ({ ...current, [item.key]: "complete" }));
      setToast(accountCopy.downloadsStarted);
      window.setTimeout(() => {
        setStates((current) => ({ ...current, [item.key]: "idle" }));
        setToast(null);
      }, 1800);
    });
  };

  return (
    <AccountGuard locale={locale}>
      <AccountScrollMotion>
        <p className="accountHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {accountCopy.downloadsEyebrow}
        </p>
        <h1 className="accountHeroCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {accountCopy.downloadsHeading}
        </h1>
        <p className="accountHeroCopy mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {accountCopy.downloadsBody}
        </p>
        <p className="accountHeroCopy mt-6 text-meta uppercase tracking-[0.22em] text-accent">
          {formatPurchasedDesignCount(library.length)}
        </p>

        {library.length === 0 ? (
          <div className="accountCard mt-12 border border-line bg-surface px-6 py-14 text-center">
            <p className="text-title-sm font-medium tracking-tight text-ink">↓</p>
            <h2 className="mt-6 text-title-sm font-medium tracking-tight text-ink">
              {accountCopy.downloadsEmptyHeading}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-body leading-8 text-ink-soft">
              {accountCopy.downloadsEmptyBody}
            </p>
            <div className="mt-8 flex justify-center">
              <TextLink href={`/${locale}${shopDesignsHref}`}>
                {accountCopy.downloadsExplore}
              </TextLink>
            </div>
          </div>
        ) : (
          <>
            <div className="accountReveal mt-10">
              <label className="sr-only" htmlFor="downloads-search">
                {accountCopy.downloadsSearchLabel}
              </label>
              <input
                id="downloads-search"
                className="min-h-12 w-full border border-line bg-paper px-4 text-body text-ink"
                placeholder={accountCopy.downloadsSearchPlaceholder}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                }}
              />
            </div>

            <div className="accountReveal mt-6 flex justify-end">
              <label className="flex items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                <select
                  className="min-h-11 border border-line bg-paper px-3 text-meta uppercase tracking-[0.14em] text-ink"
                  value={sortId}
                  onChange={(event) => {
                    setSortId(event.target.value as SortId);
                  }}
                >
                  <option value="recent">{accountCopy.downloadsSortRecent}</option>
                  <option value="name">{accountCopy.downloadsSortName}</option>
                </select>
              </label>
            </div>

            {filtered.length === 0 ? (
              <p className="mt-10 text-body text-ink-soft">{accountCopy.downloadsNoMatch}</p>
            ) : (
              <ul className="mt-10 flex list-none flex-col gap-5 p-0">
                {filtered.map((item) => {
                  const state = states[item.key] ?? "idle";
                  const buttonLabel =
                    state === "preparing"
                      ? accountCopy.downloadsPreparing
                      : state === "downloading"
                        ? accountCopy.downloadsDownloading
                        : state === "complete"
                          ? accountCopy.downloadsComplete
                          : state === "error"
                            ? accountCopy.orderDetailTryAgain
                            : accountCopy.downloadsZipAll;

                  return (
                    <li key={item.key}>
                      <article className="accountCard border border-line bg-surface p-5 md:p-6">
                        <div className="flex flex-col gap-5 md:flex-row md:gap-8">
                          <div className="relative aspect-square w-full max-w-[9rem] overflow-hidden bg-line">
                            <CoverImage
                              src={item.imageSrc}
                              alt={item.imageAlt}
                              sizes="144px"
                              className="absolute inset-0 size-full max-w-none object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-h3 font-medium tracking-tight text-ink">
                              {item.displayName}
                            </h2>
                            <p className="mt-3 text-meta text-ink-soft">
                              {accountCopy.downloadsPurchased}{" "}
                              {formatOrderDate(item.orderCreatedAt)}
                            </p>
                            <p className="mt-4 text-meta uppercase tracking-[0.14em] text-ink-soft">
                              {accountCopy.downloadsFormats}
                            </p>
                            <p className="mt-2 text-body text-ink">
                              {accountCopy.downloadsSingleZip}
                            </p>
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                              <TextButton
                                disabled={
                                  isPending ||
                                  state === "preparing" ||
                                  state === "downloading"
                                }
                                onClick={() => {
                                  runDownload(item);
                                }}
                              >
                                {buttonLabel}
                              </TextButton>
                              <TextLink
                                href={`/${locale}${orderDetailHref(item.orderId)}`}
                                tone="ghostOnLight"
                              >
                                {accountCopy.downloadsViewOrder}
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
                                href={`/${locale}${licensingHref}`}
                                className="min-h-11 text-meta uppercase tracking-[0.14em] text-ink-soft underline-offset-4 hover:underline"
                              >
                                {accountCopy.downloadsLicense}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </AccountScrollMotion>
      {toast !== null ? (
        <p
          className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 border border-line bg-paper px-5 py-3 text-meta text-ink"
          role="status"
        >
          {toast}
        </p>
      ) : null}
    </AccountGuard>
  );
}
