import { productCopy, productGuideTopics } from "@/constants/productCopy";
import { type ShopProduct } from "@/constants/shopCatalog";

type ProductGuideProps = {
  product: ShopProduct;
};

export function ProductGuide({ product }: ProductGuideProps) {
  return (
    <section className="productGuide mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {productCopy.guideEyebrow}
      </p>
      <h2 className="mt-4 max-w-2xl text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {productCopy.guideHeading}
      </h2>
      <div className="mt-10 border border-line bg-surface px-6 py-12 md:px-16 md:py-16">
        <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {productCopy.guideEyebrow}
        </p>
        <p className="mt-4 text-h3 font-medium text-ink">{product.name}</p>
        <ul className="mt-8 flex flex-col gap-3 text-body text-ink-soft">
          {productGuideTopics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
