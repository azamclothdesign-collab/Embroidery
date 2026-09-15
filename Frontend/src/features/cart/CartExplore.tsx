import { TextLink } from "@/components/TextLink";
import { cartCopy } from "@/constants/cartCopy";
import { shopDesignsHref } from "@/constants/siteNavigation";

type CartExploreProps = {
  locale: string;
};

export function CartExplore({ locale }: CartExploreProps) {
  return (
    <section
      className="cartExplore mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20"
      aria-labelledby="cart-explore-heading"
    >
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {cartCopy.exploreEyebrow}
      </p>
      <h2
        id="cart-explore-heading"
        className="mt-4 max-w-2xl text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {cartCopy.exploreHeading}
      </h2>
      <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
        {cartCopy.exploreBody}
      </p>
      <div className="mt-8">
        <TextLink href={`/${locale}${shopDesignsHref}`}>
          {cartCopy.exploreDesigns}
        </TextLink>
      </div>
    </section>
  );
}
