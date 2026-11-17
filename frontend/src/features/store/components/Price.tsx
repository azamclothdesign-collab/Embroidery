import { formatPrice, percentOff } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/types";

export function Price({
  priceMinor,
  salePriceMinor,
  locale,
  size = "md",
  saveLabel,
}: {
  priceMinor: number;
  salePriceMinor: number | null;
  locale: Locale;
  size?: "md" | "lg";
  saveLabel?: string;
}) {
  const onSale = salePriceMinor !== null && salePriceMinor < priceMinor;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", size === "lg" ? "text-2xl" : "text-base")}>
      <span className="font-semibold text-ink">{formatPrice(onSale ? salePriceMinor : priceMinor, locale)}</span>
      {onSale && (
        <>
          <s className={cn("text-muted", size === "lg" ? "text-lg" : "text-sm")}>
            <span className="sr-only">{locale === "ur" ? "پرانی قیمت" : "Was"} </span>
            {formatPrice(priceMinor, locale)}
          </s>
          {saveLabel !== undefined && (
            <span className="rounded-md bg-gold-soft px-2 py-0.5 text-xs font-semibold text-ink">
              {saveLabel} {percentOff(priceMinor, salePriceMinor)}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
