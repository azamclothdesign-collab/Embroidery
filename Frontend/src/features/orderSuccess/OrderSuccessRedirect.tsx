"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { orderSuccessPath } from "@/constants/siteNavigation";
import { OrderSuccessHeader } from "@/features/orderSuccess/OrderSuccessHeader";
import { OrderUnauthorized } from "@/features/orderSuccess/OrderUnauthorized";
import { useLocalOrder } from "@/hooks/useLocalOrder";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

type OrderSuccessRedirectProps = {
  locale: string;
};

export function OrderSuccessRedirect({ locale }: OrderSuccessRedirectProps) {
  const router = useRouter();
  const isClient = useIsClient();
  const order = useLocalOrder();

  useEffect(() => {
    if (!isClient) {
      return;
    }

    if (order === null || order.lines.length === 0) {
      return;
    }

    router.replace(`/${locale}${orderSuccessPath(order.id)}`);
  }, [isClient, locale, order, router]);

  if (!isClient) {
    return (
      <>
        <OrderSuccessHeader locale={locale} />
        <section className="mx-auto w-full max-w-2xl px-6 py-20 text-center">
          <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
            {orderSuccessCopy.eyebrow}
          </p>
        </section>
      </>
    );
  }

  if (order === null || order.lines.length === 0) {
    return <OrderUnauthorized locale={locale} />;
  }

  return (
    <>
      <OrderSuccessHeader locale={locale} />
      <section className="mx-auto w-full max-w-2xl px-6 py-20 text-center">
        <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
          {orderSuccessCopy.eyebrow}
        </p>
      </section>
    </>
  );
}
