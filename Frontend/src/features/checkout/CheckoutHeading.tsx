import { checkoutCopy } from "@/constants/checkoutCopy";

export function CheckoutHeading() {
  return (
    <header className="checkoutHero mx-auto w-full max-w-[85rem] px-6 pt-8 pb-8 text-center md:pt-10 md:pb-10">
      <p className="text-meta uppercase tracking-[0.22em] text-accent">
        {checkoutCopy.eyebrow}
      </p>
      <h1 className="mt-3 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {checkoutCopy.heading}
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-body leading-8 text-ink-soft">
        {checkoutCopy.body}
      </p>
    </header>
  );
}
