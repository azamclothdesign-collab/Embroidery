"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { finalCtaPosterSrc, finalCtaVideoSrc } from "@/constants/assetPaths";
import { finalCtaCopy } from "@/constants/finalCta";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  motionQueries,
  motionRefreshPriority,
  playClipImageReveal,
  playParallax,
  playSimpleFade,
} from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

type HomeFinalCtaStageProps = {
  locale: string;
  hasVideo: boolean;
};

export function HomeFinalCtaStage({
  locale,
  hasVideo,
}: HomeFinalCtaStageProps) {
  const scopeRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const playVideo = hasVideo && !reduceMotion;

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
            items: scope.querySelectorAll(".finalCtaCopy"),
            trigger: scope,
            refreshPriority: motionRefreshPriority.finalCta,
          });
          return;
        }

        const frame = scope.querySelector("[data-motion-frame]");
        const layer = scope.querySelector("[data-motion-parallax]");

        if (frame !== null) {
          playClipImageReveal({
            frames: [frame],
            trigger: scope,
            refreshPriority: motionRefreshPriority.finalCta,
          });
        }

        if (layer !== null) {
          playParallax({
            media: layer,
            trigger: scope,
            refreshPriority: motionRefreshPriority.finalCta,
          });
        }

        playSimpleFade({
          items: scope.querySelectorAll(".finalCtaCopy"),
          trigger: scope,
          refreshPriority: motionRefreshPriority.finalCta,
        });
      });

      return () => {
        media.revert();
      };
    },
    { scope: scopeRef },
  );

  return (
    <section
      ref={scopeRef}
      className="relative min-h-[70svh] overflow-hidden bg-ink text-paper"
      aria-labelledby="final-cta-heading"
    >
      <div data-motion-frame="" className="absolute inset-0 overflow-hidden">
        <div data-motion-parallax="" className="absolute inset-0">
          <CoverImage
            src={finalCtaPosterSrc}
            alt={finalCtaCopy.imageAlt}
            sizes="100vw"
            className="absolute inset-0 size-full max-w-none object-cover"
          />
          {playVideo ? (
            <video
              className="absolute inset-0 size-full object-cover"
              poster={finalCtaPosterSrc}
              muted
              playsInline
              loop
              autoPlay
              preload="metadata"
              aria-hidden="true"
            >
              <source src={finalCtaVideoSrc} type="video/mp4" />
            </video>
          ) : null}
        </div>
      </div>
      <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
      <div className="relative z-10 mx-auto flex min-h-[70svh] w-full max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="finalCtaCopy text-meta uppercase tracking-[0.22em] text-accent">
          {finalCtaCopy.eyebrow}
        </p>
        <h2
          id="final-cta-heading"
          className="finalCtaCopy mt-6 max-w-4xl text-title-sm font-medium tracking-tight text-paper md:text-title-lg"
        >
          {finalCtaCopy.heading}
        </h2>
        <p className="finalCtaCopy mt-8 max-w-2xl text-body leading-8 text-paper/90">
          {finalCtaCopy.body}
        </p>
        <div className="finalCtaCopy mt-10 flex flex-wrap items-center justify-center gap-4">
          <TextLink href={`/${locale}${shopDesignsHref}`} tone="paper">
            {finalCtaCopy.primaryCta}
          </TextLink>
          <TextLink href="#best-sellers" tone="ghostOnDark">
            {finalCtaCopy.secondaryCta}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
