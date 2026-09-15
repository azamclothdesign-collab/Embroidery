"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { CoverImage } from "@/components/CoverImage";
import {
  fromScreenToStitchPosterSrc,
  fromScreenToStitchVideoSrc,
} from "@/constants/assetPaths";
import { fromScreenToStitchCopy } from "@/constants/fromScreenToStitch";
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

type HomeFromScreenMediaProps = {
  hasVideo: boolean;
};

export function HomeFromScreenMedia({ hasVideo }: HomeFromScreenMediaProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
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
            items: scope.querySelectorAll("[data-motion-frame]"),
            trigger: scope,
            refreshPriority: motionRefreshPriority.fromScreen,
          });
          return;
        }

        const frame = scope.querySelector("[data-motion-frame]");
        const layer = scope.querySelector("[data-motion-parallax]");

        if (frame !== null) {
          playClipImageReveal({
            frames: [frame],
            trigger: scope,
            refreshPriority: motionRefreshPriority.fromScreen,
          });
        }

        if (layer !== null) {
          playParallax({
            media: layer,
            trigger: scope,
            refreshPriority: motionRefreshPriority.fromScreen,
          });
        }
      });

      return () => {
        media.revert();
      };
    },
    { scope: scopeRef },
  );

  return (
    <div
      ref={scopeRef}
      className="relative min-h-[24rem] overflow-hidden bg-ink md:min-h-0"
    >
      <div data-motion-frame="" className="absolute inset-0 overflow-hidden">
        <div data-motion-parallax="" className="absolute inset-0">
          <CoverImage
            src={fromScreenToStitchPosterSrc}
            alt={fromScreenToStitchCopy.imageAlt}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="absolute inset-0 size-full max-w-none object-cover"
          />
          {playVideo ? (
            <video
              className="absolute inset-0 size-full object-cover"
              poster={fromScreenToStitchPosterSrc}
              muted
              playsInline
              loop
              autoPlay
              preload="metadata"
              aria-hidden="true"
            >
              <source src={fromScreenToStitchVideoSrc} type="video/mp4" />
            </video>
          ) : null}
        </div>
      </div>
    </div>
  );
}
