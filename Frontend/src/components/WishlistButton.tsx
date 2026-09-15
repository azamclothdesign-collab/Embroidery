"use client";

import { HeartIcon } from "@/components/icons/HeartIcon";
import { productCopy } from "@/constants/productCopy";
import {
  applyWishlistSnapshot,
  useWishlistSaved,
} from "@/hooks/useWishlistItems";
import { toggleWishlistItemAction } from "@/server/actions/wishlistActions";

type WishlistButtonProps = {
  name: string;
  slug: string;
  onSaved?: () => void;
  onRemoved?: () => void;
  className?: string;
  showLabel?: boolean;
  nativeCursor?: boolean;
};

export function WishlistButton({
  name,
  slug,
  onSaved,
  onRemoved,
  className = "absolute top-3 right-3 z-20 inline-flex size-11 items-center justify-center bg-paper text-ink",
  showLabel = false,
  nativeCursor = false,
}: WishlistButtonProps) {
  const isSaved = useWishlistSaved(slug);

  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? `${name} saved to wishlist` : `Save ${name} to wishlist`}
      className={className}
      {...(nativeCursor ? { "data-native-cursor": "" } : {})}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const button = event.currentTarget;

        void toggleWishlistItemAction(slug)
          .then((result) => {
            applyWishlistSnapshot(result.wishlist);

            if (result.saved) {
              const icon = button.querySelector("[data-heart-icon]");
              icon?.classList.remove("wishlist-heart-pulse");
              void (icon as HTMLElement | null)?.offsetWidth;
              icon?.classList.add("wishlist-heart-pulse");
              onSaved?.();
              return;
            }

            onRemoved?.();
          })
          .catch(() => undefined);
      }}
    >
      <span data-heart-icon="" className="inline-flex">
        <HeartIcon filled={isSaved} />
      </span>
      {showLabel ? (
        <span>{isSaved ? "Saved" : productCopy.addToWishlist}</span>
      ) : null}
    </button>
  );
}
