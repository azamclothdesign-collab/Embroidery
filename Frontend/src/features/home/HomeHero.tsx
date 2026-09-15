import { heroPosterSrc } from "@/constants/assetPaths";
import { defaultLocale } from "@/constants/locales";
import { HomeHeroStage } from "@/features/home/HomeHeroStage";
import { resolveHeroVideoSources } from "@/lib/heroVideoFile";

type HomeHeroProps = {
  locale?: string;
};

export function HomeHero({ locale = defaultLocale }: HomeHeroProps) {
  return (
    <HomeHeroStage
      locale={locale}
      posterSrc={heroPosterSrc}
      videoSources={resolveHeroVideoSources()}
    />
  );
}
