import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CartView } from "@/features/checkout/CartView";
import { getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { cartLabels } from "@/features/checkout/labels";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, path: "/cart", title: t.cart.title, description: t.cart.title, storefront: await getStorefront(), noindex: true });
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="mb-8 text-4xl">{t.cart.title}</h1>
      <CartView locale={locale} labels={cartLabels(locale)} />
    </div>
  );
}
