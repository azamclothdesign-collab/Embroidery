import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type OrderExploreSectionProps = {
  locale: string;
};

export function OrderExploreSection({ locale }: OrderExploreSectionProps) {
  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="order-explore-heading"
    >
      <h2
        id="order-explore-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.relatedHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {orderSuccessCopy.relatedBody}
      </p>
      <div className="mt-8">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {orderSuccessCopy.exploreDesigns}
        </TextLink>
      </div>
    </section>
  );
}
