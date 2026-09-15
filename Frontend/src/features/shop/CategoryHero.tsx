import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import {
  type CategoryPageContent,
  categoryPageCopy,
} from "@/constants/categoryPageCopy";

type CategoryHeroProps = {
  locale: string;
  content: CategoryPageContent;
};

export function CategoryHero({ content }: CategoryHeroProps) {
  return (
    <section className="bg-paper">
      <div className="mx-auto grid w-full max-w-[85rem] gap-10 px-6 pt-14 pb-12 md:pt-20 md:pb-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-14">
        <div>
          <p className="categoryHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
            {categoryPageCopy.eyebrow}
          </p>
          <h1 className="categoryHeroCopy mt-4 max-w-2xl text-title-sm font-medium tracking-tight text-ink md:text-title-md lg:text-title-lg">
            {content.heading}
          </h1>
          <p className="categoryHeroCopy mt-6 max-w-xl text-body leading-8 text-ink-soft">
            {content.body}
          </p>
          <div className="categoryHeroCopy mt-8 flex flex-col gap-3 sm:flex-row">
            <TextLink href="#category-collection">
              {categoryPageCopy.exploreDesigns}
            </TextLink>
          </div>
        </div>
        <div className="categoryHeroMedia relative aspect-[4/5] overflow-hidden bg-line md:aspect-[5/6]">
          <CoverImage
            src={content.heroImageSrc}
            alt={content.heroImageAlt}
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        </div>
      </div>
    </section>
  );
}
