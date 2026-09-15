"use client";

import { TextLink } from "@/components/TextLink";
import { shopDesignsHref } from "@/constants/siteNavigation";
import {
  formatSavedDesignCount,
  wishlistCopy,
  wishlistSortOptions,
} from "@/constants/wishlistCopy";
import { type WishlistSortId } from "@/lib/session/wishlistDisplay";

type WishlistToolbarProps = {
  locale: string;
  count: number;
  sortId: WishlistSortId;
  onSortChange: (id: WishlistSortId) => void;
};

export function WishlistToolbar({
  locale,
  count,
  sortId,
  onSortChange,
}: WishlistToolbarProps) {
  return (
    <div className="border-y border-line bg-surface">
      <div className="mx-auto flex w-full max-w-[85rem] flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-meta uppercase tracking-[0.14em] text-ink">
          {formatSavedDesignCount(count)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
            <span>{wishlistCopy.sortLabel}</span>
            <select
              className="min-h-11 border border-line bg-paper px-3 text-meta uppercase tracking-[0.14em] text-ink"
              value={sortId}
              onChange={(event) => {
                onSortChange(event.target.value as WishlistSortId);
              }}
            >
              {wishlistSortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <TextLink href={`/${locale}${shopDesignsHref}`} tone="ghostOnLight">
            {wishlistCopy.shopNow}
          </TextLink>
        </div>
      </div>
    </div>
  );
}
