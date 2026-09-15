import { CheckIcon } from "@/components/icons/CheckIcon";
import { productCopy, productDownloadBody } from "@/constants/productCopy";
import {
  includedFiles,
  productDescriptionText,
  productSpecLabels,
  productThreadColors,
} from "@/constants/productDetail";
import { type ShopProduct } from "@/constants/shopCatalog";
import { ProductAccordion } from "@/features/product/ProductAccordion";

type ProductDetailsProps = {
  locale: string;
  product: ShopProduct;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const specs = productSpecLabels(product);
  const files = includedFiles(product);

  return (
    <section className="py-8 md:py-12" aria-label="Product details">
      <ProductAccordion
        items={[
          {
            title: productCopy.accordionDescription,
            content: <p>{productDescriptionText(product)}</p>,
          },
          {
            title: productCopy.accordionIncluded,
            content: (
              <div>
                <p className="text-body font-medium text-ink">
                  {productCopy.includedHeading}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {files.map((file) => (
                    <li key={file} className="flex items-center gap-3 text-ink">
                      <CheckIcon />
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          },
          {
            title: productCopy.accordionSpecs,
            content: (
              <dl className="productSpecs grid grid-cols-1 gap-3 sm:grid-cols-[12rem_1fr]">
                <dt>Width</dt>
                <dd className="text-ink">{specs.widthLabel}</dd>
                <dt>Height</dt>
                <dd className="text-ink">{specs.heightLabel}</dd>
                <dt>Stitch Count</dt>
                <dd className="text-ink">{specs.stitchLabel}</dd>
                <dt>Thread Colors</dt>
                <dd className="text-ink">{specs.colorLabel}</dd>
                <dt>Recommended Hoop</dt>
                <dd className="text-ink">{specs.hoopLabel}</dd>
                <dt>Package</dt>
                <dd className="text-ink">{specs.formatsLabel}</dd>
              </dl>
            ),
          },
          {
            title: productCopy.colorHeading,
            content: (
              <ol className="flex flex-col gap-3">
                {productThreadColors.map((color) => (
                  <li
                    key={color.id}
                    className="productColorItem flex items-center gap-4 text-ink"
                  >
                    <span
                      className={`size-6 shrink-0 border border-line ${color.swatchClassName}`}
                    />
                    <span className="w-8 text-meta tracking-[0.14em]">{color.id}</span>
                    <span>{color.name}</span>
                  </li>
                ))}
              </ol>
            ),
          },
          {
            title: productCopy.accordionDownload,
            content: <p>{productDownloadBody}</p>,
          },
        ]}
      />
    </section>
  );
}
