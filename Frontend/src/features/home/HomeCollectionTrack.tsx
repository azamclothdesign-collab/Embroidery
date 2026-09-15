"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";
import {
  type FeaturedCollectionTabId,
  featuredCollectionTabs,
  productsForCollectionTab,
} from "@/constants/featuredCollection";
import { type ShopProduct } from "@/constants/shopCatalog";
import { HomeBestSellerCard } from "@/features/home/HomeBestSellerCard";
import {
  motionRefreshPriority,
  playHorizontalEnter,
  playSimpleFade,
} from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

type HomeCollectionTrackProps = {
  locale: string;
  products: readonly ShopProduct[];
};

function isCollectionTabId(value: string): value is FeaturedCollectionTabId {
  return featuredCollectionTabs.some((tab) => tab.id === value);
}

export function HomeCollectionTrack({
  locale,
  products: catalog,
}: HomeCollectionTrackProps) {
  const panelId = useId();
  const tabListId = useId();
  const scopeRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [activeTab, setActiveTab] = useState<FeaturedCollectionTabId>("all");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const products = productsForCollectionTab(activeTab, catalog);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;

    if (viewport === null) {
      return;
    }

    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    setCanScrollPrev(viewport.scrollLeft > 4);
    setCanScrollNext(maxScroll > 4 && viewport.scrollLeft < maxScroll - 4);
  }, []);

  const scrollByCard = useCallback(
    (direction: -1 | 1) => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      const firstCard = track?.querySelector("li");

      if (viewport === null || firstCard === null || firstCard === undefined) {
        return;
      }

      const gap = 32;
      const step = firstCard.getBoundingClientRect().width + gap;
      viewport.scrollBy({ left: direction * step, behavior: "smooth" });
    },
    [],
  );

  useGSAP(
    () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;

      if (viewport === null || track === null) {
        return;
      }

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) {
        playSimpleFade({
          items: track.children,
          trigger: viewport,
          refreshPriority: motionRefreshPriority.collection,
        });
      } else {
        playHorizontalEnter({
          items: track.children,
          trigger: viewport,
          refreshPriority: motionRefreshPriority.collection,
        });
      }
    },
    { scope: scopeRef, dependencies: [activeTab, products.length] },
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (viewport === null) {
      return;
    }

    viewport.scrollLeft = 0;
    updateScrollState();

    const onScroll = () => {
      updateScrollState();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      const maxScroll = viewport.scrollWidth - viewport.clientWidth;

      if (maxScroll <= 0) {
        return;
      }

      const atStart = viewport.scrollLeft <= 0 && event.deltaY < 0;
      const atEnd = viewport.scrollLeft >= maxScroll - 1 && event.deltaY > 0;

      if (atStart || atEnd) {
        return;
      }

      event.preventDefault();
      viewport.scrollLeft += event.deltaY;
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("wheel", onWheel, { passive: false });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(viewport);

    if (trackRef.current !== null) {
      resizeObserver.observe(trackRef.current);
    }

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("wheel", onWheel);
      resizeObserver.disconnect();
    };
  }, [activeTab, products.length, updateScrollState]);

  return (
    <div ref={scopeRef} className="mt-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div
          id={tabListId}
          role="tablist"
          aria-labelledby="featured-collection-heading"
          className="flex gap-6 overflow-x-auto"
        >
          {featuredCollectionTabs.map((tab) => {
            const selected = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${tabListId}-${tab.id}`}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className={`min-h-11 shrink-0 border-b-2 pb-3 text-meta uppercase tracking-[0.22em] ${
                  selected
                    ? "border-ink text-ink"
                    : "border-transparent text-ink-soft"
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                onKeyDown={(event) => {
                  const currentIndex = featuredCollectionTabs.findIndex(
                    (item) => item.id === activeTab,
                  );
                  const lastIndex = featuredCollectionTabs.length - 1;
                  let nextIndex = currentIndex;

                  if (event.key === "ArrowRight") {
                    nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
                  } else if (event.key === "ArrowLeft") {
                    nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
                  } else if (event.key === "Home") {
                    nextIndex = 0;
                  } else if (event.key === "End") {
                    nextIndex = lastIndex;
                  } else {
                    return;
                  }

                  event.preventDefault();
                  const nextTab = featuredCollectionTabs[nextIndex];

                  if (nextTab !== undefined && isCollectionTabId(nextTab.id)) {
                    setActiveTab(nextTab.id);
                    const nextButton = document.getElementById(
                      `${tabListId}-${nextTab.id}`,
                    );
                    nextButton?.focus();
                  }
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="hidden shrink-0 gap-2 md:flex">
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center border border-line text-ink disabled:cursor-default disabled:opacity-30"
            aria-label="Scroll products left"
            disabled={!canScrollPrev}
            onClick={() => {
              scrollByCard(-1);
            }}
          >
            <span className="inline-flex rotate-180">
              <ArrowRightIcon />
            </span>
          </button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center border border-line text-ink disabled:cursor-default disabled:opacity-30"
            aria-label="Scroll products right"
            disabled={!canScrollNext}
            onClick={() => {
              scrollByCard(1);
            }}
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${tabListId}-${activeTab}`}
        className="mt-10"
      >
        <div
          ref={viewportRef}
          className="collection-product-scroll min-h-80 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-2"
        >
          <ul
            ref={trackRef}
            aria-live="polite"
            className="flex w-max list-none gap-8 p-0"
          >
            {products.map((product) => (
              <li
                key={product.slug}
                className="w-[min(22rem,80vw)] shrink-0 snap-start"
              >
                <HomeBestSellerCard locale={locale} product={product} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
