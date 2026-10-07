import Link from "next/link";

import { SiteHeader } from "@/components/SiteHeader";
import { checkoutCopy } from "@/constants/checkoutCopy";
import { cartHref, checkoutHref } from "@/constants/siteNavigation";
import { confirmPayFastPaymentAction } from "@/server/actions/orderActions";

type RouteProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }

  return undefined;
}

export default async function PayFastFailureRoute({
  params,
  searchParams,
}: RouteProps) {
  const { locale } = await params;
  const query = await searchParams;
  const orderId =
    firstParam(query.order_id) ??
    firstParam(query.orderId) ??
    firstParam(query.BASKET_ID) ??
    firstParam(query.basket_id);

  if (orderId !== undefined) {
    await confirmPayFastPaymentAction({
      orderId,
      markFailed: true,
    });
  }

  return (
    <>
      <SiteHeader />
      <section className="mx-auto w-full max-w-xl px-6 py-20 text-center">
        <h1 className="text-title-sm font-medium tracking-tight text-ink">
          {checkoutCopy.paymentFailedHeading}
        </h1>
        <p className="mt-4 text-body leading-8 text-ink-soft">
          {checkoutCopy.paymentFailedBody}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}${checkoutHref}`}
            className="inline-flex min-h-11 items-center justify-center bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper"
          >
            {checkoutCopy.tryAgain}
          </Link>
          <Link
            href={`/${locale}${cartHref}`}
            className="inline-flex min-h-11 items-center justify-center border border-line px-5 text-meta uppercase tracking-[0.14em] text-ink"
          >
            {checkoutCopy.returnToCart}
          </Link>
        </div>
      </section>
    </>
  );
}
