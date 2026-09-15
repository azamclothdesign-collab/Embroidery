import Link from "next/link";

import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { shopSortOptions } from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";
import {
  shopCatalogHref,
  type ShopCatalogQuery,
} from "@/features/shop/shopCatalogQuery";

type ShopSortLinksProps = {
  locale: string;
  path: string;
  catalog: ShopCatalogQuery;
};

export function ShopSortLinks({ locale, path, catalog }: ShopSortLinksProps) {
  return (
    <details className="relative">
      <summary className="relative flex min-h-11 cursor-pointer list-none items-center border border-line bg-surface px-4 pr-10 text-meta uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden">
        <span className="mr-2 hidden text-ink-soft md:inline">{shopCopy.sortLabel}</span>
        <span>
          {shopSortOptions.find((option) => option.id === catalog.sortId)?.label ??
            catalog.sortId}
        </span>
        <span className="pointer-events-none absolute right-3 inline-flex text-ink">
          <ChevronDownIcon />
        </span>
      </summary>
      <ul className="absolute right-0 z-20 mt-2 min-w-full border border-line bg-paper py-2">
        {shopSortOptions.map((option) => {
          const href = shopCatalogHref(locale, path, {
            ...catalog,
            sortId: option.id,
            page: 1,
          });

          return (
            <li key={option.id}>
              <Link
                href={href}
                aria-current={option.id === catalog.sortId ? "page" : undefined}
                className="flex min-h-11 items-center px-4 text-meta uppercase tracking-[0.14em] text-ink"
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
