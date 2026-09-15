import Link from "next/link";

import { shopCategoryHref } from "@/constants/shopCatalog";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { type CategoryRecord } from "@/types/api/product";

type ShopCategoryChip = {
  id: string;
  label: string;
};

type ShopCategoryChipsProps = {
  locale: string;
  activeId: string;
  categories: readonly CategoryRecord[];
};

export function ShopCategoryChips({
  locale,
  activeId,
  categories,
}: ShopCategoryChipsProps) {
  const chips: ShopCategoryChip[] = [
    { id: "all", label: "All Designs" },
    ...categories
      .filter((category) => category.isVisible)
      .map((category) => ({ id: category.id, label: category.label })),
  ];

  return (
    <nav aria-label="Design categories" className="shopChips border-b border-line">
      <ul className="mx-auto flex w-full max-w-[85rem] gap-2 overflow-x-auto px-6 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const isActive = chip.id === activeId;
          const href =
            chip.id === "all"
              ? `/${locale}${shopDesignsHref}`
              : shopCategoryHref(locale, chip.id);

          return (
            <li key={chip.id} className="shrink-0">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper"
                    : "inline-flex min-h-11 items-center rounded-full border border-line bg-transparent px-5 text-meta uppercase tracking-[0.14em] text-ink transition-colors duration-200 hover:border-ink"
                }
              >
                {chip.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
