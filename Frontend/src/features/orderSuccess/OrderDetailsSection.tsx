import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { formatShopPrice } from "@/constants/shopCatalog";
import { type LocalOrder } from "@/lib/session/orderSession";

type OrderDetailsSectionProps = {
  order: LocalOrder;
};

export function OrderDetailsSection({ order }: OrderDetailsSectionProps) {
  const dateLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(order.createdAt));

  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="order-details-heading"
    >
      <h2
        id="order-details-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.orderDetails}
      </h2>
      <dl className="mt-8 grid max-w-xl gap-4 text-body">
        <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4">
          <dt className="text-ink-soft">{orderSuccessCopy.orderNumber}</dt>
          <dd className="text-ink">{order.id}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4">
          <dt className="text-ink-soft">{orderSuccessCopy.date}</dt>
          <dd className="text-ink">{dateLabel}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4">
          <dt className="text-ink-soft">{orderSuccessCopy.status}</dt>
          <dd className="text-ink">{orderSuccessCopy.statusPaid}</dd>
        </div>
        {order.contactName ? (
          <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4">
            <dt className="text-ink-soft">{orderSuccessCopy.contactName}</dt>
            <dd className="text-ink">{order.contactName}</dd>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4">
          <dt className="text-ink-soft">{orderSuccessCopy.email}</dt>
          <dd className="text-ink">{order.email}</dd>
        </div>
        {order.phone ? (
          <div className="flex flex-wrap justify-between gap-2 border-b border-line pb-4">
            <dt className="text-ink-soft">{orderSuccessCopy.phone}</dt>
            <dd className="text-ink">{order.phone}</dd>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-between gap-2 pb-2">
          <dt className="text-ink-soft">{orderSuccessCopy.total}</dt>
          <dd className="text-ink">{formatShopPrice(order.totalCents)}</dd>
        </div>
      </dl>

      {order.lines.length > 0 ? (
        <div className="mt-12 max-w-xl">
          <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
            Your Purchase
          </p>
          <ol className="mt-6 flex list-none flex-col gap-4 p-0">
            {order.lines.map((line, index) => (
              <li
                key={line.slug}
                className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4"
              >
                <span className="text-body text-ink">
                  <span className="text-meta text-ink-soft">
                    {String(index + 1).padStart(2, "0")}{" "}
                  </span>
                  {line.displayName}
                </span>
                <span className="text-body text-ink">
                  {formatShopPrice(line.priceCents)}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex justify-between text-body text-ink">
            <span>{orderSuccessCopy.total}</span>
            <span>{formatShopPrice(order.totalCents)}</span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
