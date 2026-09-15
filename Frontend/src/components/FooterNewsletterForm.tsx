import { footerCopy } from "@/constants/footer";

export function FooterNewsletterForm() {
  return (
    <form className="mt-6 flex flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="footer-newsletter-email">
        {footerCopy.emailLabel}
      </label>
      <input
        id="footer-newsletter-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder={footerCopy.emailLabel}
        className="min-h-11 w-full border border-paper bg-ink px-4 text-body text-paper [color-scheme:dark] sm:min-w-0 sm:flex-1"
      />
      <button
        type="submit"
        className="inline-flex min-h-11 shrink-0 items-center justify-center bg-paper px-6 font-nourd text-base tracking-wide text-ink"
      >
        {footerCopy.subscribe}
      </button>
    </form>
  );
}
