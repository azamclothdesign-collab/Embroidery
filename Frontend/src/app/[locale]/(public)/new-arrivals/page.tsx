import { type Metadata } from "next";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { newArrivalsCopy } from "@/constants/newArrivalsCopy";
import { NewArrivalsPage } from "@/features/newArrivals/NewArrivalsPage";
import { fetchProducts } from "@/lib/api/productsApi";

type NewArrivalsRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: newArrivalsCopy.metaTitle,
  description: newArrivalsCopy.metaDescription,
};

export default async function NewArrivalsRoute({
  params,
}: NewArrivalsRouteProps) {
  const { locale } = await params;
  const products = await fetchProducts();

  return (
    <>
      <SiteHeader />
      <PageEnter>
        <NewArrivalsPage locale={locale} products={products} />
      </PageEnter>
    </>
  );
}
