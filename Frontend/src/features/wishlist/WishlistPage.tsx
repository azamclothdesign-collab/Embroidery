import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { type ShopProduct } from "@/constants/shopCatalog";
import { WishlistBody } from "@/features/wishlist/WishlistBody";
import {
  WishlistKeepExploring,
} from "@/features/wishlist/WishlistExtras";
import { WishlistScrollMotion } from "@/features/wishlist/WishlistScrollMotion";

type WishlistPageProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function WishlistPage({ locale, products }: WishlistPageProps) {
  return (
    <>
      <SiteHeader />
      <PageEnter>
        <WishlistScrollMotion>
          <WishlistBody locale={locale} products={products}>
            <WishlistKeepExploring locale={locale} />
          </WishlistBody>
        </WishlistScrollMotion>
      </PageEnter>
    </>
  );
}
