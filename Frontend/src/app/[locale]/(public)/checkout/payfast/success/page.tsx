import { redirect } from "next/navigation";

import { orderSuccessPath } from "@/constants/siteNavigation";
import { clearCartAction } from "@/server/actions/cartActions";
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

export default async function PayFastSuccessRoute({
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
  const signature = firstParam(query.signature) ?? firstParam(query.SIGNATURE);
  const paymentReference =
    firstParam(query.transaction_id) ??
    firstParam(query.TRANSACTION_ID) ??
    firstParam(query.err_code);

  if (orderId === undefined) {
    redirect(`/${locale}/checkout/payfast/failure`);
  }

  const result = await confirmPayFastPaymentAction({
    orderId,
    ...(signature !== undefined ? { signature } : {}),
    ...(paymentReference !== undefined
      ? { paymentReference }
      : {}),
  });

  if (!result.ok || result.order.paymentStatus !== "paid") {
    redirect(
      `/${locale}/checkout/payfast/failure?order_id=${encodeURIComponent(orderId)}`,
    );
  }

  await clearCartAction();
  redirect(`/${locale}${orderSuccessPath(orderId)}`);
}
