"use client";

import { useEffect, useMemo, useState } from "react";

import { type HeroVideoSources } from "@/constants/assetPaths";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export type ActiveHeroVideoSources = {
  webmSrc?: string;
  mp4Src?: string;
};

function hasSource(webmSrc: string | undefined, mp4Src: string | undefined): boolean {
  return webmSrc !== undefined || mp4Src !== undefined;
}

export function pickHeroVideoSources(
  sources: HeroVideoSources,
  isDesktop: boolean,
): ActiveHeroVideoSources | null {
  if (isDesktop) {
    if (!hasSource(sources.desktopWebmSrc, sources.desktopMp4Src)) {
      return null;
    }

    return {
      ...(sources.desktopWebmSrc !== undefined
        ? { webmSrc: sources.desktopWebmSrc }
        : {}),
      ...(sources.desktopMp4Src !== undefined
        ? { mp4Src: sources.desktopMp4Src }
        : {}),
    };
  }

  if (!hasSource(sources.mobileWebmSrc, sources.mobileMp4Src)) {
    return null;
  }

  return {
    ...(sources.mobileWebmSrc !== undefined
      ? { webmSrc: sources.mobileWebmSrc }
      : {}),
    ...(sources.mobileMp4Src !== undefined
      ? { mp4Src: sources.mobileMp4Src }
      : {}),
  };
}

export function useHeroVideoPlayback(
  sources: HeroVideoSources,
): ActiveHeroVideoSources | null {
  const reduceMotion = usePrefersReducedMotion();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      setIsDesktop(media.matches);
    };

    onChange();
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
    };
  }, []);

  return useMemo(() => {
    if (reduceMotion || isDesktop === null) {
      return null;
    }

    return pickHeroVideoSources(sources, isDesktop);
  }, [isDesktop, reduceMotion, sources]);
}
