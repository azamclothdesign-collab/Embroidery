import { orderSuccessCopy, orderSuccessNextSteps } from "@/constants/orderSuccessCopy";

export function OrderNextSteps() {
  return (
    <section
      className="orderNextSteps border-y border-line bg-surface"
      aria-labelledby="order-next-heading"
    >
      <div className="mx-auto w-full max-w-[85rem] px-6 py-16 md:py-20">
        <h2
          id="order-next-heading"
          className="text-center text-title-sm font-medium tracking-tight text-ink md:text-title-md"
        >
          {orderSuccessCopy.nextHeading}
        </h2>
        <ol className="mt-12 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-8">
          {orderSuccessNextSteps.map((step, index) => (
            <li key={step.id} className="orderNextStep text-center md:text-left">
              <p className="text-meta uppercase tracking-[0.18em] text-accent">
                {step.id}
              </p>
              <h3 className="mt-3 text-h3 font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-body leading-8 text-ink-soft">{step.body}</p>
              {index < orderSuccessNextSteps.length - 1 ? (
                <p
                  className="mt-6 text-meta uppercase tracking-[0.2em] text-ink-soft md:hidden"
                  aria-hidden="true"
                >
                  ↓
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
