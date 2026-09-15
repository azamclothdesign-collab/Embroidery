"use client";

import { type ReactNode, useCallback, useMemo, useState } from "react";

import { type ShopProduct } from "@/constants/shopCatalog";
import { wishlistCopy } from "@/constants/wishlistCopy";
import {
  WishlistFinalCta,
  WishlistPopular,
} from "@/features/wishlist/WishlistBodyExtras";
import { WishlistCard } from "@/features/wishlist/WishlistCard";
import { WishlistEmpty } from "@/features/wishlist/WishlistEmpty";
import { WishlistHero } from "@/features/wishlist/WishlistHero";
import { WishlistSyncNotice } from "@/features/wishlist/WishlistSyncNotice";
import { WishlistToast } from "@/features/wishlist/WishlistToast";
import { WishlistToolbar } from "@/features/wishlist/WishlistToolbar";
import {
  applyWishlistSnapshot,
  useWishlistItems,
} from "@/hooks/useWishlistItems";
import {
  resolveWishlistDisplay,
  sortWishlistDisplay,
  type WishlistSortId,
} from "@/lib/session/wishlistDisplay";
import {
  removeWishlistItemAction,
  restoreWishlistItemAction,
} from "@/server/actions/wishlistActions";
import { type WishlistItem } from "@/types/api/wishlist";

type WishlistBodyProps = {
  locale: string;
  products: readonly ShopProduct[];
  children: ReactNode;
};

export function WishlistBody({ locale, products, children }: WishlistBodyProps) {
  const items = useWishlistItems();
  const [sortId, setSortId] = useState<WishlistSortId>("recent");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<string | undefined>(undefined);
  const [undoItem, setUndoItem] = useState<WishlistItem | null>(null);

  const displayItems = useMemo(
    () => sortWishlistDisplay(resolveWishlistDisplay(items, products), sortId),
    [items, products, sortId],
  );

  const hideToast = useCallback(() => {
    setToastMessage(null);
    setToastAction(undefined);
    setUndoItem(null);
  }, []);

  const onRemove = (slug: string) => {
    const removed = items.find((item) => item.slug === slug);

    if (removed === undefined) {
      setToastMessage(wishlistCopy.errorToast);
      setToastAction(wishlistCopy.tryAgain);
      setUndoItem(null);
      return;
    }

    void removeWishlistItemAction(slug).then((wishlist) => {
      applyWishlistSnapshot(wishlist);
      setUndoItem(removed);
      setToastMessage(wishlistCopy.removedToast);
      setToastAction(wishlistCopy.undo);
    });
  };

  const hasItems = displayItems.length > 0;

  return (
    <>
      {hasItems ? (
        <>
          <WishlistHero count={displayItems.length} />
          <WishlistSyncNotice locale={locale} />
          <WishlistToolbar
            locale={locale}
            count={displayItems.length}
            sortId={sortId}
            onSortChange={setSortId}
          />
          <section
            className="mx-auto w-full max-w-[85rem] px-6 py-10 md:py-14"
            aria-label={wishlistCopy.heading}
          >
            <ul className="grid list-none grid-cols-2 gap-x-4 gap-y-10 p-0 md:grid-cols-3 lg:grid-cols-4">
              {displayItems.map((item) => (
                <li key={item.slug} className="min-w-0">
                  <WishlistCard
                    locale={locale}
                    item={item}
                    onRemove={onRemove}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <WishlistHero count={0} />
          <WishlistSyncNotice locale={locale} />
          <WishlistEmpty locale={locale} />
          <WishlistPopular locale={locale} products={products} />
        </>
      )}
      {children}
      <WishlistFinalCta locale={locale} hasItems={hasItems} />
      <WishlistToast
        message={toastMessage}
        actionLabel={toastAction}
        onAction={
          undoItem !== null
            ? () => {
                void restoreWishlistItemAction(undoItem).then((wishlist) => {
                  applyWishlistSnapshot(wishlist);
                  hideToast();
                });
              }
            : toastAction === wishlistCopy.tryAgain
              ? hideToast
              : undefined
        }
        onHide={hideToast}
      />
    </>
  );
}
