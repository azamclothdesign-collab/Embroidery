import { CoverImage } from "@/components/CoverImage";
import { productCopy } from "@/constants/productCopy";
import { type ProductGalleryItem } from "@/constants/productDetail";

type ProductGalleryProps = {
  items: readonly ProductGalleryItem[];
};

export function ProductGallery({ items }: ProductGalleryProps) {
  const first = items[0];

  if (first === undefined) {
    return null;
  }

  const preview = items.find((item) => item.id === "preview");
  const stitched = items.find((item) => item.id === "stitched");

  return (
    <div className="productHeroImage">
      {items.map((item, index) => (
        <div key={item.id}>
          <input
            type="radio"
            name="product-gallery"
            id={`product-gallery-${item.id}`}
            defaultChecked={index === 0}
            className="peer sr-only"
          />
          <div className="relative hidden aspect-square overflow-hidden bg-line peer-checked:block">
            <CoverImage
              src={item.src}
              alt={item.alt}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority={index === 0}
              className="absolute inset-0 size-full max-w-none object-cover"
            />
          </div>
        </div>
      ))}
      {preview !== undefined && stitched !== undefined ? (
        <div className="mt-4 flex justify-center gap-6 text-meta uppercase tracking-[0.16em] text-ink-soft">
          <label htmlFor={`product-gallery-${preview.id}`} className="cursor-pointer">
            {productCopy.digitalPreview}
          </label>
          <span aria-hidden="true">|</span>
          <label htmlFor={`product-gallery-${stitched.id}`} className="cursor-pointer">
            {productCopy.stitchedResult}
          </label>
        </div>
      ) : null}
      <ul className="mt-6 hidden gap-3 md:flex">
        {items.map((item) => (
          <li key={item.id}>
            <label
              htmlFor={`product-gallery-${item.id}`}
              aria-label={item.label}
              className="relative block size-16 cursor-pointer overflow-hidden bg-line"
            >
              <CoverImage
                src={item.src}
                alt=""
                sizes="64px"
                className="absolute inset-0 size-full max-w-none object-cover"
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
