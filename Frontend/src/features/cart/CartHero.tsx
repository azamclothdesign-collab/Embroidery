import { cartCopy } from "@/constants/cartCopy";

export function CartHero() {
  return (
    <header className="mx-auto w-full max-w-[85rem] px-6 pt-10 pb-8 md:pt-14 md:pb-10">
      <p className="cartHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
        {cartCopy.eyebrow}
      </p>
      <h1 className="cartHeroCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md lg:text-title-lg">
        {cartCopy.heading}
      </h1>
      <p className="cartHeroCopy mt-3 text-meta uppercase tracking-[0.16em] text-ink">
        {cartCopy.promiseHeading}
      </p>
      <p className="cartHeroCopy mt-3 max-w-xl text-body leading-8 text-ink-soft">
        {cartCopy.body}
      </p>
      <ol className="cartHeroCopy mt-10 flex flex-wrap items-center gap-3 text-meta uppercase tracking-[0.16em] text-ink-soft">
        <li className="text-ink">{`01 ${cartCopy.progressCart}`}</li>
        <li aria-hidden="true" className="h-px w-10 bg-line md:w-16" />
        <li>{`02 ${cartCopy.progressCheckout}`}</li>
        <li aria-hidden="true" className="h-px w-10 bg-line md:w-16" />
        <li>{`03 ${cartCopy.progressDownload}`}</li>
      </ol>
    </header>
  );
}
