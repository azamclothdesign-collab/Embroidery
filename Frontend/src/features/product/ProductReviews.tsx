import { CoverImage } from "@/components/CoverImage";
import { StarRating } from "@/components/StarRating";
import { communityPosts } from "@/constants/communityPosts";
import { productCopy } from "@/constants/productCopy";
import { productReview } from "@/constants/productDetail";
import { type ShopProduct } from "@/constants/shopCatalog";

type ProductReviewsProps = {
  product: ShopProduct;
};

export function ProductReviews({ product }: ProductReviewsProps) {
  return (
    <section
      id="product-reviews"
      className="productReviews scroll-mt-header-compact mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="product-reviews-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {productCopy.reviewsEyebrow}
      </p>
      <h2
        id="product-reviews-heading"
        className="mt-4 max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {productCopy.reviewsHeading}
      </h2>
      <blockquote className="mt-12 max-w-3xl">
        <p className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          “{productReview.quote}”
        </p>
        <p className="mt-6 text-body leading-8 text-ink-soft">“{productReview.body}”</p>
        <footer className="mt-8">
          <StarRating value={product.rating} />
          <p className="mt-3 text-body text-ink">{productReview.name}</p>
          <p className="mt-1 text-meta uppercase tracking-[0.16em] text-ink-soft">
            {productCopy.verifiedPurchase}
          </p>
        </footer>
      </blockquote>
      <ul className="mt-16 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 md:gap-5">
        {communityPosts.slice(0, 6).map((post) => (
          <li key={post.username}>
            <figure className="group relative aspect-square overflow-hidden bg-line">
              <CoverImage
                src={post.imageSrc}
                alt={post.imageAlt}
                sizes="(min-width: 768px) 33vw, 50vw"
                className="absolute inset-0 size-full max-w-none object-cover"
              />
              <figcaption className="absolute inset-0 flex flex-col justify-end bg-[var(--category-overlay)] p-4 text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-100">
                <p className="text-meta tracking-wide">@{post.username}</p>
                <p className="mt-1 text-meta text-paper/80">{post.designName}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
