import { AboutCommunity } from "@/features/about/AboutCommunity";
import { AboutCraft } from "@/features/about/AboutCraft";
import { AboutExperience } from "@/features/about/AboutExperience";
import { AboutFaq } from "@/features/about/AboutFaq";
import { AboutFinalCta } from "@/features/about/AboutFinalCta";
import { AboutHero } from "@/features/about/AboutHero";
import { AboutNotPixels } from "@/features/about/AboutNotPixels";
import { AboutPrinciples } from "@/features/about/AboutPrinciples";
import { AboutProof } from "@/features/about/AboutProof";
import { AboutQuality } from "@/features/about/AboutQuality";
import { AboutScrollMotion } from "@/features/about/AboutScrollMotion";
import { AboutStory } from "@/features/about/AboutStory";
import { AboutSupport } from "@/features/about/AboutSupport";
import { AboutWhy } from "@/features/about/AboutWhy";

type AboutPageProps = {
  locale: string;
};

export function AboutPage({ locale }: AboutPageProps) {
  return (
    <AboutScrollMotion>
      <AboutHero locale={locale} />
      <AboutWhy />
      <AboutStory />
      <AboutPrinciples />
      <AboutQuality />
      <AboutNotPixels />
      <AboutCraft />
      <AboutExperience />
      <AboutSupport locale={locale} />
      <AboutProof />
      <AboutCommunity locale={locale} />
      <AboutFaq />
      <AboutFinalCta locale={locale} />
    </AboutScrollMotion>
  );
}
