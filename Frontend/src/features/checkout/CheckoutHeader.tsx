import Link from "next/link";

import { LockIcon } from "@/components/icons/LockIcon";
import { checkoutCopy } from "@/constants/checkoutCopy";

type CheckoutHeaderProps = {
  locale: string;
};

export function CheckoutHeader({ locale }: CheckoutHeaderProps) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-header-compact w-full max-w-[85rem] items-center justify-between gap-4 px-6">
        <Link
          href={`/${locale}`}
          className="font-nourd text-lg tracking-[0.14em] text-ink"
        >
          Embroidery
        </Link>
        <p className="inline-flex items-center gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          <LockIcon />
          <span>{checkoutCopy.secureCheckout}</span>
        </p>
      </div>
    </header>
  );
}
