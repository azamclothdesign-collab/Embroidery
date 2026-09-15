import { shopCopy } from "@/constants/shopCopy";

export function ShopNewsletter() {
  return (
    <section className="shopNewsletter border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {shopCopy.newsletterHeading}
        </h2>
        <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
          {shopCopy.newsletterBody}
        </p>
        <form className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="shop-newsletter-email">
            Email address
          </label>
          <input
            id="shop-newsletter-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Your email address"
            className="min-h-11 w-full border border-line bg-paper px-4 text-body text-ink sm:min-w-0 sm:flex-1"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 shrink-0 items-center justify-center bg-ink px-6 font-nourd text-base tracking-wide text-paper"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
