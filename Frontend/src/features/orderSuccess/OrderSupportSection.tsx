import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { contactHref, downloadsHref } from "@/constants/siteNavigation";

type OrderSupportSectionProps = {
  locale: string;
};

export function OrderSupportSection({ locale }: OrderSupportSectionProps) {
  return (
    <section
      className="border-y border-line bg-surface"
      aria-labelledby="order-support-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="order-support-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {orderSuccessCopy.supportHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {orderSuccessCopy.supportBody}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TextLink href={`/${locale}${contactHref}`}>
            {orderSuccessCopy.contactSupport}
          </TextLink>
          <TextLink href={`/${locale}${downloadsHref}`} tone="ghostOnLight">
            {orderSuccessCopy.downloadHelp}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
