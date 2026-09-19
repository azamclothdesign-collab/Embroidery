"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { shopCategoryHref } from "@/constants/shopCatalog";
import { HomeFeaturedCategoryTile } from "@/features/home/HomeFeaturedCategoryTile";
import { type CategoryStorefrontTile } from "@/lib/catalog/buildCategoryStorefrontTiles";
import {
  motionQueries,
  motionRefreshPriority,
  playClipImageReveal,
  playSimpleFade,
} from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

type HomeCategoryGridProps = {
  locale: string;
  tiles: readonly CategoryStorefrontTile[];
};

export function HomeCategoryGrid({ locale, tiles }: HomeCategoryGridProps) {
  const scopeRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;

      if (scope === null) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(motionQueries, (context) => {
        if (context.conditions?.reduceMotion === true) {
          playSimpleFade({
            items: scope.querySelectorAll("[data-motion-frame]"),
            trigger: scope,
            refreshPriority: motionRefreshPriority.categories,
          });
          return;
        }

        playClipImageReveal({
          frames: scope.querySelectorAll("[data-motion-frame]"),
          trigger: scope,
          refreshPriority: motionRefreshPriority.categories,
        });
      });

      return () => {
        media.revert();
      };
    },
    { scope: scopeRef },
  );

  return (
    <ul
      ref={scopeRef}
      className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {tiles.map((tile) => (
        <li key={tile.id}>
          <HomeFeaturedCategoryTile
            category={{
              name: tile.label,
              imageSrc: tile.imageSrc ?? "/assets/categoryPlaceholder.webp",
              imageAlt: tile.imageAlt ?? `Embroidery design for ${tile.label}`,
            }}
            href={shopCategoryHref(locale, tile.id)}
          />
        </li>
      ))}
    </ul>
  );
}
