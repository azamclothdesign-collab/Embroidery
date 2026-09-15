"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { CoverImage } from "@/components/CoverImage";
import { TextLink } from "@/components/TextLink";
import { type HeroVideoSources } from "@/constants/assetPaths";
import { howItWorksHref, shopDesignsHref } from "@/constants/siteNavigation";
import { useHeroVideoPlayback } from "@/features/home/useHeroVideoPlayback";
import { motionRefreshPriority, playSimpleFade } from "@/lib/motion/homeMotion";
import { registerGsapPlugins } from "@/lib/motion/registerGsapPlugins";

registerGsapPlugins();

type HomeHeroStageProps = {
  locale: string;
  posterSrc: string;
  videoSources: HeroVideoSources;
};

export function HomeHeroStage({
  locale,
  posterSrc,
  videoSources,
}: HomeHeroStageProps) {
  const stageRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const activeSources = useHeroVideoPlayback(videoSources);

  useGSAP(
    () => {
      const stage = stageRef.current;

      if (stage === null) {
        return;
      }

      const media = gsap.matchMedia();

      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          allowMotion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const reduceMotion = context.conditions?.reduceMotion === true;
          const frame = stage.querySelector(".heroFrame");
          const copyItems = stage.querySelectorAll(".heroCopy");
          const isDesktop = window.matchMedia("(min-width: 768px)").matches;

          if (reduceMotion) {
            playSimpleFade({ items: copyItems });
            return;
          }

          const intro = gsap.timeline({
            defaults: { ease: "power2.out", duration: 0.8 },
          });

          if (frame !== null) {
            intro.from(
              frame,
              { autoAlpha: 0, duration: 1 },
              0,
            );
            intro.from(
              frame.querySelectorAll("img, video"),
              { scale: 1.08, duration: 1.6 },
              0,
            );
          }

          intro.from(
            copyItems,
            { autoAlpha: 0, y: 20, stagger: 0.08 },
            0.28,
          );

          if (!isDesktop) {
            return;
          }

          gsap.to(frame, {
            scale: 1.08,
            borderRadius: 32,
            ease: "none",
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: "bottom top",
              scrub: true,
              refreshPriority: motionRefreshPriority.hero,
            },
          });

          gsap.to(stage.querySelector(".heroCopyBlock"), {
            y: -56,
            ease: "none",
            scrollTrigger: {
              trigger: stage,
              start: "top top",
              end: "bottom top",
              scrub: true,
              refreshPriority: motionRefreshPriority.hero,
            },
          });
        },
      );

      return () => {
        media.revert();
      };
    },
    { scope: stageRef },
  );

  return (
    <section
      ref={stageRef}
      className="relative h-svh overflow-hidden bg-ink text-paper md:h-auto md:min-h-svh"
      aria-labelledby="home-hero-heading"
    >
      <div className="heroFrame absolute inset-0 overflow-hidden">
        <CoverImage
          src={posterSrc}
          alt=""
          priority
          sizes="100vw"
          className="absolute inset-0 size-full max-w-none object-cover"
        />
        {activeSources !== null ? (
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            poster={posterSrc}
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            aria-hidden="true"
          >
            {activeSources.webmSrc !== undefined ? (
              <source src={activeSources.webmSrc} type="video/webm" />
            ) : null}
            {activeSources.mp4Src !== undefined ? (
              <source src={activeSources.mp4Src} type="video/mp4" />
            ) : null}
          </video>
        ) : null}
        <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
      </div>
      <div className="heroCopyBlock relative z-10 mx-auto flex h-svh w-full max-w-7xl flex-col items-center justify-center px-6 pt-header-compact text-center md:h-auto md:min-h-svh md:pt-header">
        <p className="heroCopy text-meta uppercase tracking-[0.28em] text-paper/75">
          Embroidery
        </p>
        <h1
          id="home-hero-heading"
          className="heroCopy mt-5 max-w-3xl text-title-lg font-medium leading-[1.12] tracking-tight md:text-display-sm lg:text-[3.25rem] lg:leading-[1.1]"
        >
          Designs Made to Be Stitched.
        </h1>
        <p className="heroCopy mt-4 max-w-lg text-body leading-7 text-paper/80 md:mt-5 md:leading-8">
          Professionally digitized embroidery designs in the formats you need —
          ready to download, stitch, and bring to life.
        </p>
        <div className="heroCopy mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row md:mt-9">
          <TextLink
            href={`/${locale}${shopDesignsHref}`}
            tone="paper"
            className="w-full sm:w-auto"
          >
            Explore Designs
          </TextLink>
          <TextLink
            href={`/${locale}${howItWorksHref}`}
            tone="ghostOnDark"
            className="w-full sm:w-auto"
          >
            How It Works
          </TextLink>
        </div>
      </div>
      {activeSources !== null ? (
        <button
          type="button"
          className="absolute right-6 bottom-6 z-10 hidden min-h-11 border border-paper px-4 text-meta uppercase tracking-[0.16em] text-paper md:inline-flex"
          onClick={() => {
            const video = videoRef.current;

            if (video === null) {
              return;
            }

            if (video.paused) {
              void video.play();
              setIsVideoPlaying(true);
              return;
            }

            video.pause();
            setIsVideoPlaying(false);
          }}
        >
          {isVideoPlaying ? "Pause video" : "Play video"}
        </button>
      ) : null}
    </section>
  );
}
