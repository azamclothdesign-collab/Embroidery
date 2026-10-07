import { LockIcon } from "@/components/icons/LockIcon";
import { checkoutCopy } from "@/constants/checkoutCopy";

type CheckoutPaymentProps = {
  gatewayEnabled: boolean;
  gatewayReady: boolean;
};

export function CheckoutPayment({
  gatewayEnabled,
  gatewayReady,
}: CheckoutPaymentProps) {
  return (
    <section aria-labelledby="checkout-payment-heading" className="mt-12">
      <h2 id="checkout-payment-heading" className="text-h3 font-medium text-ink">
        {checkoutCopy.paymentHeading}
      </h2>
      <p className="mt-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
        {checkoutCopy.paymentMethod}
      </p>
      <label className="mt-4 flex min-h-11 items-center gap-3 text-body text-ink">
        <input
          type="radio"
          name="checkout-payment-method"
          value="payfast"
          checked
          readOnly
        />
        {checkoutCopy.paymentPayFast}
      </label>
      <div className="mt-6 border border-line bg-surface p-6">
        <p className="inline-flex items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink">
          <LockIcon />
          {checkoutCopy.paymentSecure}
        </p>
        {!gatewayReady ? (
          <p className="mt-4 text-body leading-8 text-ink-soft">
            {checkoutCopy.paymentChecking}
          </p>
        ) : gatewayEnabled ? (
          <>
            <p className="mt-4 text-body leading-8 text-ink-soft">
              {checkoutCopy.paymentPayFastBody}
            </p>
            <p className="mt-3 text-meta leading-6 text-ink-soft">
              {checkoutCopy.paymentReadyHint}
            </p>
          </>
        ) : (
          <p className="mt-4 text-body leading-8 text-ink-soft">
            {checkoutCopy.paymentGatewayOff}
          </p>
        )}
      </div>
    </section>
  );
}
