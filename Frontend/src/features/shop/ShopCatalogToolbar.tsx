import { formatDesignCount } from "@/constants/shopCatalog";
import { type ShopCatalogQuery } from "@/features/shop/shopCatalogQuery";
import { ShopFilterForm } from "@/features/shop/ShopFilterForm";
import { ShopSortLinks } from "@/features/shop/ShopSortLinks";

type ShopCatalogToolbarProps = {
  locale: string;
  path: string;
  catalog: ShopCatalogQuery;
  totalCount: number;
};

export function ShopCatalogToolbar({
  locale,
  path,
  catalog,
  totalCount,
}: ShopCatalogToolbarProps) {
  return (
    <div className="shopToolbar mx-auto flex w-full max-w-[85rem] flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
      <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
        {formatDesignCount(totalCount)}
      </p>
      <div className="flex items-center gap-3">
        <ShopFilterForm
          locale={locale}
          path={path}
          catalog={catalog}
          resultCount={totalCount}
        />
        <ShopSortLinks locale={locale} path={path} catalog={catalog} />
      </div>
    </div>
  );
}
