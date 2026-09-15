import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import {
  type CategoryPageContent,
  categoryPageCopy,
  getCategoryPageContent,
  relatedCategoryIds,
} from "@/constants/categoryPageCopy";
import { shopCategoryHref } from "@/constants/shopCatalog";
import {
  contactHref,
  howItWorksHref,
  shopDesignsHref,
} from "@/constants/siteNavigation";

type CategoryProjectsProps = {
  content: CategoryPageContent;
};

export function CategoryProjects({ content }: CategoryProjectsProps) {
  return (
    <section
      className="categoryReveal border-y border-line bg-surface"
      aria-labelledby="category-projects-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="category-projects-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {content.label} {categoryPageCopy.projectsHeadingPrefix}
        </h2>
        <ul className="mt-10 grid list-none gap-8 p-0 md:grid-cols-3">
          {content.projectCards.map((card) => (
            <li key={card.title} className="border-t border-line pt-6">
              <h3 className="text-h3 font-medium tracking-tight text-ink">
                {card.title}
              </h3>
              <p className="mt-3 text-body leading-8 text-ink-soft">{card.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type LocaleProps = {
  locale: string;
};

export function CategoryBeginner({ locale }: LocaleProps) {
  return (
    <section
      className="categoryReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="category-beginner-heading"
    >
      <h2
        id="category-beginner-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {categoryPageCopy.beginnerHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {categoryPageCopy.beginnerBody}
      </p>
      <ul className="mt-8 flex list-none flex-col gap-3 p-0 sm:flex-row sm:flex-wrap">
        <li>
          <TextLink href={`/${locale}${howItWorksHref}`} tone="ghostOnLight">
            How It Works
          </TextLink>
        </li>
        <li>
          <TextLink href={`/${locale}${contactHref}`} tone="ghostOnLight">
            Contact
          </TextLink>
        </li>
      </ul>
    </section>
  );
}

type CategorySeoProps = {
  content: CategoryPageContent;
};

export function CategorySeo({ content }: CategorySeoProps) {
  return (
    <section
      className="categoryReveal border-y border-line bg-surface"
      aria-labelledby="category-seo-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="category-seo-heading"
          className="max-w-3xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {content.seoHeading}
        </h2>
        <div className="mt-8 max-w-3xl space-y-6">
          {content.seoParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-body leading-8 text-ink-soft">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

type CategoryRelatedProps = {
  locale: string;
  currentId: string;
};

export function CategoryRelated({ locale, currentId }: CategoryRelatedProps) {
  const related = relatedCategoryIds(currentId);

  return (
    <section
      className="categoryReveal mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="category-related-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {categoryPageCopy.relatedEyebrow}
      </p>
      <h2
        id="category-related-heading"
        className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {categoryPageCopy.relatedHeading}
      </h2>
      <ul className="mt-10 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((id) => {
          const relatedContent = getCategoryPageContent(id);

          return (
            <li key={id}>
              <Link
                href={shopCategoryHref(locale, id)}
                className="group block border border-line"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-line">
                  <CoverImage
                    src={relatedContent.heroImageSrc}
                    alt={relatedContent.heroImageAlt}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex items-center justify-between gap-3 px-4 py-4">
                  <span className="text-body font-medium text-ink">
                    {relatedContent.label}
                  </span>
                  <span className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                    {categoryPageCopy.explore}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function CategoryFinalCta({ locale }: LocaleProps) {
  return (
    <section className="categoryReveal border-t border-line bg-paper">
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24">
        <p className="text-meta uppercase tracking-[0.22em] text-accent">
          {categoryPageCopy.finalEyebrow}
        </p>
        <h2 className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {categoryPageCopy.finalHeading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {categoryPageCopy.finalBody}
        </p>
        <div className="mt-10 flex justify-center">
          <TextLink href={`/${locale}${shopDesignsHref}`}>
            {categoryPageCopy.browseAll}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
