import { type Metadata } from "next";

import { HomeBestSellers } from "@/features/home/HomeBestSellers";
import { HomeFaq } from "@/features/home/HomeFaq";
import { HomeFeaturedCategories } from "@/features/home/HomeFeaturedCategories";
import { HomeFinalCta } from "@/features/home/HomeFinalCta";
import { HomeFromScreenToStitch } from "@/features/home/HomeFromScreenToStitch";
import { HomeGuides } from "@/features/home/HomeGuides";
import { HomeHero } from "@/features/home/HomeHero";
import { HomeHowItWorks } from "@/features/home/HomeHowItWorks";
import { HomeImpact } from "@/features/home/HomeImpact";
import { HomeProblemSolution } from "@/features/home/HomeProblemSolution";
import { HomeSiteHeader } from "@/features/home/HomeSiteHeader";
import { HomeStitchedCommunity } from "@/features/home/HomeStitchedCommunity";
import { fetchCategories } from "@/lib/api/categoriesApi";
import { fetchProducts } from "@/lib/api/productsApi";
import { buildCategoryStorefrontTiles } from "@/lib/catalog/buildCategoryStorefrontTiles";

type PublicHomePageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Embroidery | High-Quality Digital Embroidery Designs",
};

export default async function PublicHomePage({ params }: PublicHomePageProps) {
  const { locale } = await params;
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories().catch(() => []),
  ]);
  const categoryTiles = buildCategoryStorefrontTiles(categories);

  return (
    <>
      <HomeSiteHeader />
      <HomeHero locale={locale} />
      <HomeFeaturedCategories locale={locale} tiles={categoryTiles} />
      <HomeBestSellers locale={locale} products={products} />
      <HomeFromScreenToStitch />
      <HomeProblemSolution />
      <HomeHowItWorks />
      <HomeStitchedCommunity />
      <HomeImpact />
      <HomeGuides locale={locale} />
      <HomeFaq />
      <HomeFinalCta locale={locale} />
    </>
  );
}
