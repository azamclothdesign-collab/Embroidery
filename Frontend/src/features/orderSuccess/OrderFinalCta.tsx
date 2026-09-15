import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { accountHref, shopDesignsHref } from "@/constants/siteNavigation";

type OrderFinalCtaProps = {
  locale: string;
};

export function OrderFinalCta({ locale }: OrderFinalCtaProps) {
  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-16 text-center md:py-24"
      aria-labelledby="order-final-heading"
    >
      <h2
        id="order-final-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.finalHeading}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-body leading-8 text-ink-soft">
        {orderSuccessCopy.finalBody}
      </p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {orderSuccessCopy.finalPrimary}
        </TextLink>
        <TextLink href={`/${locale}${accountHref}`} tone="ghostOnLight">
          {orderSuccessCopy.finalSecondary}
        </TextLink>
      </div>
    </section>
  );
}
