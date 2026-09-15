import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";
import { OrderSuccessHeader } from "@/features/orderSuccess/OrderSuccessHeader";

type OrderUnauthorizedProps = {
  locale: string;
};

export function OrderUnauthorized({ locale }: OrderUnauthorizedProps) {
  return (
    <>
      <OrderSuccessHeader locale={locale} />
      <section className="mx-auto w-full max-w-2xl px-6 py-20 text-center">
        <h1 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {orderSuccessCopy.unauthorizedHeading}
        </h1>
        <p className="mt-6 text-body leading-8 text-ink-soft">
          {orderSuccessCopy.unauthorizedBody}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <TextLink href={`/${locale}${shopDesignsHref}`}>
            {orderSuccessCopy.backToShop}
          </TextLink>
          <TextLink href={`/${locale}`} tone="ghostOnLight">
            {orderSuccessCopy.backToHome}
          </TextLink>
        </div>
      </section>
    </>
  );
}
