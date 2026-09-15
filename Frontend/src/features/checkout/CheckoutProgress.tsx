import { checkoutCopy } from "@/constants/checkoutCopy";

export function CheckoutProgress() {
  return (
    <ol className="checkoutHero flex flex-wrap items-center justify-center gap-3 px-6 pt-8 text-meta uppercase tracking-[0.16em] text-ink-soft md:pt-10">
      <li>{`01 ${checkoutCopy.progressCart}`}</li>
      <li aria-hidden="true" className="h-px w-8 bg-line md:w-14" />
      <li className="text-ink">{`02 ${checkoutCopy.progressCheckout}`}</li>
      <li aria-hidden="true" className="h-px w-8 bg-line md:w-14" />
      <li>{`03 ${checkoutCopy.progressDownload}`}</li>
    </ol>
  );
}
