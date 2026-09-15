import { LockIcon } from "@/components/icons/LockIcon";
import { checkoutCopy } from "@/constants/checkoutCopy";

export function CheckoutPayment() {
  return (
    <section aria-labelledby="checkout-payment-heading" className="mt-12">
      <h2 id="checkout-payment-heading" className="text-h3 font-medium text-ink">
        {checkoutCopy.paymentHeading}
      </h2>
      <p className="mt-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {checkoutCopy.paymentMethod}
      </p>
      <label className="mt-4 flex min-h-11 items-center gap-3 text-body text-ink">
        <input type="radio" name="checkout-payment-method" value="card" checked readOnly />
        {checkoutCopy.paymentCard}
      </label>
      <div className="mt-6 border border-line bg-surface p-6">
        <p className="inline-flex items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink">
          <LockIcon />
          {checkoutCopy.paymentSecure}
        </p>
        <p className="mt-4 text-body leading-8 text-ink-soft">
          {checkoutCopy.paymentProviderPending}
        </p>
        <p className="mt-3 text-meta leading-6 text-ink-soft">
          {checkoutCopy.paymentReadyHint}
        </p>
      </div>
    </section>
  );
}
