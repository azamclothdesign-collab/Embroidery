import { type ShopProduct } from "@/constants/shopCatalog";
import { CatalogProductCard } from "@/features/shop/CatalogProductCard";

type ShopProductGridProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function ShopProductGrid({ locale, products }: ShopProductGridProps) {
  return (
    <ul className="shopGrid mx-auto grid w-full max-w-[85rem] grid-cols-2 gap-3 px-6 md:grid-cols-3 md:gap-5 xl:grid-cols-4 min-[1680px]:grid-cols-5">
      {products.map((product) => (
        <li key={product.slug}>
          <CatalogProductCard locale={locale} product={product} />
        </li>
      ))}
    </ul>
  );
}
