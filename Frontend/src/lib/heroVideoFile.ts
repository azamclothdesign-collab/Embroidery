import { existsSync } from "node:fs";
import path from "node:path";

import {
  heroVideoDesktopMp4Src,
  heroVideoDesktopWebmSrc,
  heroVideoMobileMp4Src,
  heroVideoMobileWebmSrc,
  type HeroVideoSources,
} from "@/constants/assetPaths";

function publicAssetExists(urlPath: string): boolean {
  return existsSync(path.join(process.cwd(), "public", urlPath.replace(/^\//, "")));
}

export function resolveHeroVideoSources(): HeroVideoSources {
  const sources: HeroVideoSources = {};

  if (publicAssetExists(heroVideoDesktopWebmSrc)) {
    sources.desktopWebmSrc = heroVideoDesktopWebmSrc;
  }

  if (publicAssetExists(heroVideoDesktopMp4Src)) {
    sources.desktopMp4Src = heroVideoDesktopMp4Src;
  }

  if (publicAssetExists(heroVideoMobileWebmSrc)) {
    sources.mobileWebmSrc = heroVideoMobileWebmSrc;
  }

  if (publicAssetExists(heroVideoMobileMp4Src)) {
    sources.mobileMp4Src = heroVideoMobileMp4Src;
  }

  return sources;
}
