import Link from "next/link";

import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { accountHref } from "@/constants/siteNavigation";

type OrderSuccessHeaderProps = {
  locale: string;
};

export function OrderSuccessHeader({ locale }: OrderSuccessHeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-header-compact w-full max-w-[85rem] items-center justify-between gap-4 px-6">
        <Link
          href={`/${locale}`}
          className="font-nourd text-lg tracking-[0.14em] text-ink"
        >
          Embroidery
        </Link>
        <Link
          href={`/${locale}${accountHref}`}
          className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink"
        >
          {orderSuccessCopy.myAccount}
        </Link>
      </div>
    </header>
  );
}
