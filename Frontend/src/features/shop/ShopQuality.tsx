import { shopCopy, shopQualityItems } from "@/constants/shopCopy";

export function ShopQuality() {
  return (
    <section
      className="shopQuality mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="shop-quality-heading"
    >
      <h2
        id="shop-quality-heading"
        className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {shopCopy.qualityHeading}
      </h2>
      <ul className="mt-12 grid list-none grid-cols-1 gap-10 p-0 md:grid-cols-3 md:gap-8">
        {shopQualityItems.map((item) => (
          <li key={item.heading} className="shopQualityItem">
            <h3 className="text-h3 font-medium tracking-tight text-ink">
              {item.heading}
            </h3>
            <p className="mt-4 text-body leading-8 text-ink-soft">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
