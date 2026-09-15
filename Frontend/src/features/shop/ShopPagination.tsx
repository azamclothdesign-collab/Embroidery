import Link from "next/link";

import { shopCopy } from "@/constants/shopCopy";
import {
  shopCatalogHref,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";

type ShopPaginationProps = {
  locale: string;
  path: string;
  catalog: ShopCatalogQuery;
  visibleCount: number;
  totalCount: number;
};

export function ShopPagination({
  locale,
  path,
  catalog,
  visibleCount,
  totalCount,
}: ShopPaginationProps) {
  if (totalCount === 0) {
    return null;
  }

  const moreHref = shopCatalogHref(locale, path, {
    ...catalog,
    page: catalog.page + 1,
  });

  return (
    <div className="mx-auto flex w-full max-w-[85rem] flex-col items-center gap-6 px-6 py-12">
      <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
        {shopCopy.showing} {visibleCount} {shopCopy.of} {totalCount}{" "}
        {totalCount === 1 ? "design" : "designs"}
      </p>
      {visibleCount < totalCount ? (
        <Link
          href={moreHref}
          className="inline-flex min-h-11 items-center justify-center bg-ink px-6 font-nourd text-base tracking-wide text-paper"
        >
          {shopCopy.loadMore}
        </Link>
      ) : null}
    </div>
  );
}
