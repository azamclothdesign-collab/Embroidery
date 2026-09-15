import { productCopy, productQualityItems } from "@/constants/productCopy";

export function ProductQuality() {
  return (
    <section
      className="productQuality mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="product-quality-heading"
    >
      <h2
        id="product-quality-heading"
        className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {productCopy.qualityHeading}
      </h2>
      <ul className="mt-12 grid list-none grid-cols-1 gap-10 p-0 md:grid-cols-3">
        {productQualityItems.map((item) => (
          <li key={item.heading} className="productQualityItem">
            <h3 className="text-h3 font-medium tracking-tight text-ink">{item.heading}</h3>
            <p className="mt-4 text-body leading-8 text-ink-soft">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
