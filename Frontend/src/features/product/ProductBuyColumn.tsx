import { CheckIcon } from "@/components/icons/CheckIcon";
import { StarRating } from "@/components/StarRating";
import { productCopy } from "@/constants/productCopy";
import { productDescriptionText, productSpecLabels } from "@/constants/productDetail";
import { formatShopPrice, type ShopProduct } from "@/constants/shopCatalog";
import { ProductPurchaseActions } from "@/features/product/ProductPurchaseActions";

type ProductBuyColumnProps = {
  locale: string;
  product: ShopProduct;
};

export function ProductBuyColumn({ product }: ProductBuyColumnProps) {
  const priceLabel = formatShopPrice(product.priceCents);
  const specs = productSpecLabels(product);

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
      <div className="productHeroCopy mt-8">
        <h2 className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {productCopy.designSize}
        </h2>
        <p className="mt-2 text-body text-ink">{specs.sizeLabel}</p>
      </div>
      <dl className="productHeroCopy mt-8 hidden grid-cols-2 gap-x-6 gap-y-4 text-meta uppercase tracking-[0.14em] lg:grid">
        <div>
          <dt className="text-ink-soft">Design Size</dt>
          <dd className="mt-1 text-body normal-case tracking-normal text-ink">
            {specs.sizeLabel}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">Stitch Count</dt>
          <dd className="mt-1 text-body normal-case tracking-normal text-ink">
            {specs.stitchLabel}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">Thread Colors</dt>
          <dd className="mt-1 text-body normal-case tracking-normal text-ink">
            {specs.colorLabel}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">Hoop</dt>
          <dd className="mt-1 text-body normal-case tracking-normal text-ink">
            {specs.hoopLabel}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-ink-soft">Package</dt>
          <dd className="mt-1 text-body normal-case tracking-normal text-ink">
            {specs.formatsLabel}
          </dd>
        </div>
      </dl>
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
