import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { OrderDownloadCard } from "@/features/orderSuccess/OrderDownloadCard";
import { type LocalOrder } from "@/lib/session/orderSession";

type OrderDownloadsSectionProps = {
  order: LocalOrder;
  onToast: (message: string) => void;
};

export function OrderDownloadsSection({
  order,
  onToast,
}: OrderDownloadsSectionProps) {
  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="order-downloads-heading"
    >
      <h2
        id="order-downloads-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.downloadsHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {orderSuccessCopy.downloadsBody}
      </p>
      <div className="mt-10 flex flex-col gap-6">
        {order.lines.map((line) => (
          <OrderDownloadCard
            key={line.slug}
            line={line}
            orderId={order.id}
            onToast={onToast}
          />
        ))}
      </div>
    </section>
  );
}
