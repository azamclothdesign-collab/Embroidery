"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { OrderAccountSection } from "@/features/orderSuccess/OrderAccountSection";
import { OrderDetailsSection } from "@/features/orderSuccess/OrderDetailsSection";
import { OrderDownloadsSection } from "@/features/orderSuccess/OrderDownloadsSection";
import { OrderEmailNote } from "@/features/orderSuccess/OrderEmailNote";
import { OrderExploreSection } from "@/features/orderSuccess/OrderExploreSection";
import { OrderFinalCta } from "@/features/orderSuccess/OrderFinalCta";
import { OrderGuideSection } from "@/features/orderSuccess/OrderGuideSection";
import { OrderNextSteps } from "@/features/orderSuccess/OrderNextSteps";
import { OrderShareSection } from "@/features/orderSuccess/OrderShareSection";
import { OrderSuccessHeader } from "@/features/orderSuccess/OrderSuccessHeader";
import { OrderSuccessHero } from "@/features/orderSuccess/OrderSuccessHero";
import { OrderSuccessScrollMotion } from "@/features/orderSuccess/OrderSuccessScrollMotion";
import { OrderSuccessToast } from "@/features/orderSuccess/OrderSuccessToast";
import { OrderSupportSection } from "@/features/orderSuccess/OrderSupportSection";
import { OrderUnauthorized } from "@/features/orderSuccess/OrderUnauthorized";
import { useAuthorizedLocalOrder } from "@/hooks/useLocalOrder";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

type OrderSuccessPageProps = {
  locale: string;
  orderId: string;
};

export function OrderSuccessPage({ locale, orderId }: OrderSuccessPageProps) {
  const isClient = useIsClient();
  const order = useAuthorizedLocalOrder(orderId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const onToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

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

  if (order === null) {
    return <OrderUnauthorized locale={locale} />;
  }

  return (
    <>
      <OrderSuccessHeader locale={locale} />
      <OrderSuccessScrollMotion>
        <OrderSuccessHero order={order} />
        <OrderDownloadsSection order={order} onToast={onToast} />
        <OrderGuideSection order={order} onToast={onToast} />
        <OrderNextSteps />
        <OrderDetailsSection order={order} />
        <OrderSupportSection locale={locale} />
        <OrderAccountSection locale={locale} />
        <OrderEmailNote
          email={order.email}
          onResend={() => {
            onToast(orderSuccessCopy.resendQueued);
          }}
        />
        <OrderExploreSection locale={locale} />
        <OrderShareSection locale={locale} />
        <OrderFinalCta locale={locale} />
      </OrderSuccessScrollMotion>
      <OrderSuccessToast message={toastMessage} onHide={hideToast} />
    </>
  );
}
