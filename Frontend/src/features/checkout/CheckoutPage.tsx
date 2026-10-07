"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { checkoutCopy } from "@/constants/checkoutCopy";
import { cartHref } from "@/constants/siteNavigation";
import { CheckoutHeader } from "@/features/checkout/CheckoutHeader";

type CheckoutPageProps = {
  locale: string;
};

/** Checkout form moved to cart; this route only hands off to /cart. */
export function CheckoutPage({ locale }: CheckoutPageProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}${cartHref}`);
  }, [locale, router]);

  return (
    <>
      <CheckoutHeader locale={locale} />
      <section className="mx-auto w-full max-w-xl px-6 py-20 text-center">
        <p className="text-body text-ink-soft">{checkoutCopy.processing}</p>
      </section>
    </>
  );
}
