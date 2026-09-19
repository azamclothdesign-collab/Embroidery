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
      className="group relative flex min-h-56 w-full flex-col justify-end overflow-hidden border border-line bg-surface text-ink"
    >
      {isPlaceholder ? (
        <div className="absolute inset-0 size-full bg-gradient-to-br from-ink to-ink-soft opacity-80" />
      ) : (
        <CoverImage
          src={category.imageSrc}
          alt={category.imageAlt}
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="absolute inset-0 size-full max-w-none object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      )}
      <div className="absolute inset-0 bg-[var(--category-overlay)] transition-colors duration-500 group-hover:bg-[var(--category-overlay-hover)] motion-reduce:transition-none" />
      <div className="relative z-10 flex w-full items-end justify-between gap-4 p-5 text-paper">
        <h3 className="text-h3 font-medium tracking-tight leading-tight">
          {category.name}
        </h3>
        <span className="inline-flex shrink-0 transition-transform duration-500 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
          <ArrowRightIcon />
        </span>
      </div>
    </Link>
  );
}
