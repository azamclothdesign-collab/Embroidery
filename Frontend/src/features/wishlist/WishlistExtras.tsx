import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { featuredCategories } from "@/constants/featuredCategories";
import {
  machineCompatibilityHref,
  shopCategoryHref,
} from "@/constants/shopCatalog";
import { wishlistCopy } from "@/constants/wishlistCopy";

type LocaleProps = {
  locale: string;
};

export function WishlistMachineCta({ locale }: LocaleProps) {
  return (
    <section className="wishlistReveal bg-ink text-paper">
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-20">
        <h2 className="text-title-sm font-medium tracking-tight text-paper md:text-title-md">
          {wishlistCopy.machineHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-paper/80">
          {wishlistCopy.machineBody}
        </p>
        <div className="mt-8 flex justify-center">
          <TextLink href={`/${locale}${machineCompatibilityHref}`} tone="paper">
            {wishlistCopy.findMachine}
          </TextLink>
        </div>
      </div>
    </section>
  );
}

export function WishlistKeepExploring({ locale }: LocaleProps) {
  return (
    <section
      className="wishlistReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="wishlist-explore-heading"
    >
      <h2
        id="wishlist-explore-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {wishlistCopy.exploreHeading}
      </h2>
      <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {featuredCategories.map((category) => (
          <li key={category.query}>
            <Link
              href={shopCategoryHref(locale, category.query)}
              className="group block border border-line"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-line">
                <CoverImage
                  src={category.imageSrc}
                  alt={category.imageAlt}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                />
              </span>
              <span className="block px-4 py-4 text-body font-medium text-ink">
                {category.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
