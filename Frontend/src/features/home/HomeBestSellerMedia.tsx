"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { CoverImage } from "@/components/CoverImage";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { WishlistButton } from "@/components/WishlistButton";
import { type ShopProduct } from "@/constants/shopCatalog";
import { shopCopy } from "@/constants/shopCopy";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";
import { notifyCartAdded, notifyCartUpdated } from "@/lib/session/cartSession";
import { addCartLineAction } from "@/server/actions/cartActions";

registerGsapPlugins();

type AddState = "idle" | "adding" | "added";

type HomeBestSellerMediaProps = {
  product: ShopProduct;
  designHref: string;
};

export function HomeBestSellerMedia({
  product,
  designHref,
}: HomeBestSellerMediaProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [addState, setAddState] = useState<AddState>("idle");
  const hasStitchedResult =
    product.stitchedImageSrc !== undefined && product.stitchedImageSrc.length > 0;

  const addLabel =
    addState === "adding"
      ? shopCopy.adding
      : addState === "added"
        ? shopCopy.added
        : shopCopy.quickAdd;

  const onQuickAdd = () => {
    if (addState !== "idle") {
      return;
    }

    setAddState("adding");
    void addCartLineAction({
      slug: product.slug,
      pdpSlug: product.pdpSlug,
      name: product.name,
      priceCents: product.priceCents,
      imageSrc: product.imageSrc,
      imageAlt: product.imageAlt,
    })
      .then(() => {
        notifyCartUpdated();
        notifyCartAdded();
        setAddState("added");
        window.setTimeout(() => {
          setAddState("idle");
        }, 1400);
      })
      .catch(() => {
        setAddState("idle");
      });
  };

  useGSAP(
    (_, contextSafe) => {
      const media = mediaRef.current;
      const cursor = cursorRef.current;

      if (media === null || cursor === null || contextSafe === undefined) {
        return;
      }

      const matchMedia = gsap.matchMedia();

      matchMedia.add(
        {
          finePointer: "(hover: hover) and (pointer: fine)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.finePointer !== true) {
            return;
          }

          const reduceMotion = context.conditions.reduceMotion === true;
          const followDuration = reduceMotion ? 0 : 0.45;
          const fadeDuration = reduceMotion ? 0 : 0.22;

          gsap.set(cursor, {
            xPercent: -50,
            yPercent: -50,
            autoAlpha: 0,
            scale: 0.84,
          });

          const xTo = gsap.quickTo(cursor, "x", {
            duration: followDuration,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(cursor, "y", {
            duration: followDuration,
            ease: "power3.out",
          });

          const hideCursor = contextSafe(() => {
            gsap.to(cursor, {
              autoAlpha: 0,
              scale: 0.84,
              duration: fadeDuration,
              ease: "power2.out",
              overwrite: "auto",
            });
          });

          const showCursor = contextSafe(() => {
            gsap.to(cursor, {
              autoAlpha: 1,
              scale: 1,
              duration: fadeDuration,
              ease: "power2.out",
              overwrite: "auto",
            });
          });

          const onPointerMove = contextSafe((event: PointerEvent) => {
            if (event.pointerType !== "mouse") {
              hideCursor();
              return;
            }

            const target = event.target;

            if (
              target instanceof Element &&
              target.closest("[data-native-cursor]") !== null
            ) {
              hideCursor();
              return;
            }

            const bounds = media.getBoundingClientRect();
            xTo(event.clientX - bounds.left);
            yTo(event.clientY - bounds.top);
            showCursor();
          });

          media.addEventListener("pointermove", onPointerMove);
          media.addEventListener("pointerleave", hideCursor);
          media.addEventListener("pointercancel", hideCursor);

          return () => {
            media.removeEventListener("pointermove", onPointerMove);
            media.removeEventListener("pointerleave", hideCursor);
            media.removeEventListener("pointercancel", hideCursor);
          };
        },
      );

      return () => {
        matchMedia.revert();
      };
    },
    { scope: mediaRef },
  );

  return (
    <div
      ref={mediaRef}
      data-motion-frame=""
      className="group relative aspect-4/3 overflow-hidden bg-line [@media(hover:hover)_and_(pointer:fine)]:cursor-none"
    >
      <Link
        href={designHref}
        aria-label={`View ${product.name} design`}
        className="absolute inset-0"
      >
        <CoverImage
          src={product.imageSrc}
          alt={product.imageAlt}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="absolute inset-0 size-full max-w-none object-cover"
        />
        {hasStitchedResult && product.stitchedImageSrc !== undefined ? (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 motion-reduce:transition-none">
            <CoverImage
              src={product.stitchedImageSrc}
              alt=""
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="absolute inset-0 size-full max-w-none object-cover"
            />
          </div>
        ) : null}
      </Link>
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-30 hidden size-28 flex-col items-center justify-center rounded-full bg-paper text-center text-meta uppercase tracking-[0.16em] text-ink opacity-0 [@media(hover:hover)_and_(pointer:fine)]:flex"
      >
        <span>View</span>
        <span>Design</span>
      </div>
      <WishlistButton
        name={product.name}
        slug={product.slug}
        nativeCursor
        className="absolute top-4 right-4 z-20 inline-flex size-11 items-center justify-center bg-paper text-ink"
      />
      <div
        data-native-cursor=""
        className="absolute inset-x-0 bottom-0 z-10 hidden cursor-auto flex-col gap-2 bg-[var(--category-overlay-hover)] p-4 opacity-100 transition-opacity duration-300 md:flex [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
      >
        <TextButton
          type="button"
          tone="paper"
          className="w-full cursor-auto"
          disabled={addState !== "idle"}
          onClick={onQuickAdd}
        >
          {addLabel}
        </TextButton>
        <TextLink
          href={designHref}
          tone="ghostOnDark"
          className="w-full cursor-auto [@media(hover:hover)_and_(pointer:fine)]:hidden"
        >
          {shopCopy.viewDesign}
        </TextLink>
      </div>
    </div>
  );
}
