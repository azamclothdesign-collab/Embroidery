import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/features/checkout/CheckoutForm";
import { getStorefront } from "@/features/store/data";
import { getDictionary, isLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { cartLabels } from "@/features/checkout/labels";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return buildMetadata({ locale, path: "/checkout", title: t.checkout.title, description: t.checkout.title, storefront: await getStorefront(), noindex: true });
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="mb-8 text-4xl">{t.checkout.title}</h1>
      <CheckoutForm
        locale={locale}
        cartLabels={cartLabels(locale)}
        labels={{ ...t.checkout, required: t.common.required, termsHref: `/${locale}/p/terms` }}
      />
    </div>
  );
}
