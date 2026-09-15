import { type Metadata } from "next";

import { WishlistPage } from "@/features/wishlist/WishlistPage";
import { fetchProducts } from "@/lib/api/productsApi";

type WishlistRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Wishlist",
};

export default async function WishlistRoute({ params }: WishlistRouteProps) {
  const { locale } = await params;
  const products = await fetchProducts();

  return <WishlistPage locale={locale} products={products} />;
}
