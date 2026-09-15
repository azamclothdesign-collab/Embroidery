import { cartCopy, cartTrustItems } from "@/constants/cartCopy";

export function CartTrust() {
  return (
    <section
      className="cartTrust border-t border-line bg-surface"
      aria-label={cartCopy.secureCheckout}
    >
      <ul className="mx-auto grid w-full max-w-[85rem] list-none grid-cols-1 gap-10 px-6 py-16 p-0 md:grid-cols-3 md:gap-8 md:py-20">
        {cartTrustItems.map((item) => (
          <li key={item.heading}>
            <h2 className="text-meta uppercase tracking-[0.16em] text-ink">
              {item.heading}
            </h2>
            <p className="mt-3 text-body leading-8 text-ink-soft">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
