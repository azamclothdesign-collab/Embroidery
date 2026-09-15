import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { contactHref } from "@/constants/siteNavigation";

type OrderShareSectionProps = {
  locale: string;
};

export function OrderShareSection({ locale }: OrderShareSectionProps) {
  return (
    <section
      className="border-y border-line bg-surface"
      aria-labelledby="order-share-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="order-share-heading"
          className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {orderSuccessCopy.shareHeading}
        </h2>
        <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {orderSuccessCopy.shareBody}
        </p>
        <div className="mt-8">
          <TextLink href={`/${locale}${contactHref}`}>
            {orderSuccessCopy.shareCta}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
