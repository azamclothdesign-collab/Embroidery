import Link from "next/link";

import { CoverImage } from "@/components/CoverImage";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

type HomeFeaturedCategoryTileProps = {
  category: {
    name: string;
    imageSrc: string;
    imageAlt: string;
  };
  href: string;
};

export function HomeFeaturedCategoryTile({
  category,
  href,
}: HomeFeaturedCategoryTileProps) {
  const isPlaceholder = category.imageSrc === "/assets/categoryPlaceholder.webp";

  return (
    <Link
      href={href}
      data-motion-frame=""
      className="group relative block w-[280px] h-[200px] md:w-[320px] md:h-[240px] shrink-0 overflow-hidden bg-ink rounded-lg snap-start"
    >
      {isPlaceholder ? (
        <div className="absolute inset-0 size-full bg-gradient-to-br from-ink to-ink-soft opacity-80" />
      ) : (
        <CoverImage
          src={category.imageSrc}
          alt={category.imageAlt}
          sizes="(min-width: 768px) 320px, 280px"
          className="absolute inset-0 size-full max-w-none object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
      <div className="absolute inset-0 bg-[var(--category-overlay)] transition-colors duration-500 group-hover:bg-[var(--category-overlay-hover)] motion-reduce:transition-none" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-paper">
        <h3 className="text-h4 font-medium tracking-tight leading-tight">{category.name}</h3>
        <span className="inline-flex shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-2 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
          <ArrowRightIcon />
        </span>
      </div>
    </Link>
  );
}
