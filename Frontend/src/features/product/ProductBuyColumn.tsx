import { CheckIcon } from "@/components/icons/CheckIcon";
import { StarRating } from "@/components/StarRating";
import { productCopy } from "@/constants/productCopy";
import { productDescriptionText } from "@/constants/productDetail";
import { formatShopPrice, type ShopProduct } from "@/constants/shopCatalog";
import { ProductPurchaseActions } from "@/features/product/ProductPurchaseActions";

type ProductBuyColumnProps = {
  locale: string;
  product: ShopProduct;
};

export function ProductBuyColumn({ product }: ProductBuyColumnProps) {
  const priceLabel = formatShopPrice(product.priceCents);

  return (
    <div className="flex flex-col lg:justify-center">
      {product.badge !== undefined ? (
        <p className="productHeroCopy text-meta uppercase tracking-[0.16em] text-ink-soft">
          {product.badge}
        </p>
      ) : null}
      <h1 className="productHeroCopy mt-3 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {product.name} Embroidery Design
      </h1>
      <a href="#product-reviews" className="productHeroCopy mt-4 inline-flex">
        <StarRating value={product.rating} />
      </a>
      <p className="productHeroCopy mt-6 text-h3 font-medium text-ink">{priceLabel}</p>
      <p className="productHeroCopy mt-1 text-meta uppercase tracking-[0.16em] text-ink-soft">
        {productCopy.digitalDownload}
      </p>
      <div className="productHeroCopy mt-6 border border-line bg-paper px-4 py-4">
        <h2 className="text-meta uppercase tracking-[0.16em] text-ink">
          {productCopy.howItWorksHeading}
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-7 text-ink-soft">
          {productCopy.howItWorksBody}
        </p>
      </div>
      <p className="productHeroCopy mt-6 max-w-md text-body leading-8 text-ink-soft">
        {productDescriptionText(product)}
      </p>
      <div className="productHeroCopy mt-8">
        <h2 className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {productCopy.includedFormats}
        </h2>
        <p className="mt-3 border border-line px-3 py-2 text-meta uppercase tracking-[0.14em] text-ink">
          ZIP package
        </p>
        <p className="mt-3 text-meta text-ink-soft">{productCopy.formatsNote}</p>
      </div>
      <ProductPurchaseActions />
      <ul className="productHeroCopy mt-6 flex flex-col gap-2 text-meta text-ink-soft">
        <li className="flex items-center gap-2">
          <CheckIcon />
          {productCopy.instantDownload}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon />
          {productCopy.secureCheckout}
        </li>
        <li className="flex items-center gap-2">
          <CheckIcon />
          {productCopy.noPhysical}
        </li>
      </ul>
    </div>
  );
}
