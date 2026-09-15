import { type ShopProduct } from "@/constants/shopCatalog";
import { HowItWorksBeginner } from "@/features/howItWorks/HowItWorksBeginner";
import { HowItWorksFaq } from "@/features/howItWorks/HowItWorksFaq";
import { HowItWorksFinalCta } from "@/features/howItWorks/HowItWorksFinalCta";
import { HowItWorksHero } from "@/features/howItWorks/HowItWorksHero";
import { HowItWorksJourney } from "@/features/howItWorks/HowItWorksJourney";
import { HowItWorksLicensing } from "@/features/howItWorks/HowItWorksLicensing";
import { HowItWorksProcessIntro } from "@/features/howItWorks/HowItWorksProcessIntro";
import { HowItWorksQuality } from "@/features/howItWorks/HowItWorksQuality";
import { HowItWorksReceive } from "@/features/howItWorks/HowItWorksReceive";
import { HowItWorksScrollMotion } from "@/features/howItWorks/HowItWorksScrollMotion";

type HowItWorksPageProps = {
  locale: string;
  products: readonly ShopProduct[];
};

export function HowItWorksPage({ locale, products }: HowItWorksPageProps) {
  return (
    <HowItWorksScrollMotion>
      <HowItWorksHero locale={locale} products={products} />
      <HowItWorksProcessIntro />
      <HowItWorksJourney locale={locale} products={products} />
      <HowItWorksReceive />
      <HowItWorksQuality />
      <HowItWorksBeginner locale={locale} />
      <HowItWorksFaq locale={locale} />
      <HowItWorksLicensing locale={locale} />
      <HowItWorksFinalCta locale={locale} />
    </HowItWorksScrollMotion>
  );
}
