import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/JsonLd";
import { CartDrawer } from "@/features/cart/CartDrawer";
import { CartProvider } from "@/features/cart/CartProvider";
import { MotionLayer } from "@/features/motion/MotionLayer";
import { Footer } from "@/features/store/components/Footer";
import { Header } from "@/features/store/components/Header";
import { WhatsAppButton } from "@/features/store/components/WhatsAppButton";
import { getMethods, getStorefront } from "@/features/store/data";
import { dirFor, getDictionary, isLocale } from "@/lib/i18n";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { pick } from "@/lib/types";
import { nastaliq, nourd } from "../../fonts";
import "../../globals.css";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const storefront = await getStorefront();
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: pick(storefront.store.name, locale),
    icons: { icon: "/favicon.svg" },
    formatDetection: { telephone: false },
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const [storefront, methods] = await Promise.all([getStorefront(), getMethods()]);

  return (
    <html lang={locale} dir={dirFor(locale)} className={`${nourd.variable} ${locale === "ur" ? nastaliq.variable : ""}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          {t.nav.skip}
        </a>
        <CartProvider>
          <Header storefront={storefront} locale={locale} t={t} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer storefront={storefront} methods={methods} locale={locale} t={t} />
          <CartDrawer
            locale={locale}
            labels={{
              title: t.cart.title,
              empty: t.cart.empty,
              emptyCta: t.cart.emptyCta,
              remove: t.cart.remove,
              subtotal: t.cart.subtotal,
              checkout: t.cart.checkout,
              viewCart: t.cart.title,
              close: t.nav.close,
            }}
          />
        </CartProvider>
        <MotionLayer />
        <WhatsAppButton number={storefront.store.whatsapp} label={t.contact.whatsapp} />
        <Toaster position="top-center" richColors closeButton dir={dirFor(locale)} />
        <JsonLd data={[organizationJsonLd(storefront, locale), websiteJsonLd(storefront, locale)]} />
      </body>
    </html>
  );
}
