import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { howItWorksPageCopy } from "@/constants/howItWorksPageCopy";
import { HowItWorksPage } from "@/features/howItWorks/HowItWorksPage";
import { fetchProducts } from "@/lib/api/productsApi";

type HowItWorksRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: howItWorksPageCopy.metaTitle,
  description: howItWorksPageCopy.metaDescription,
};

export default async function HowItWorksRoute({ params }: HowItWorksRouteProps) {
  const { locale } = await params;
  const products = await fetchProducts();

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <HowItWorksPage locale={locale} products={products} />
      </PageEnter>
    </>
  );
}
