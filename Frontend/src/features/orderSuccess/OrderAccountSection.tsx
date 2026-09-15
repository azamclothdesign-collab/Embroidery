"use client";

import { useState } from "react";

import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import { orderSuccessCopy } from "@/constants/orderSuccessCopy";
import { accountHref } from "@/constants/siteNavigation";

type OrderAccountSectionProps = {
  locale: string;
};

export function OrderAccountSection({ locale }: OrderAccountSectionProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <section
      className="mx-auto w-full max-w-[85rem] px-6 py-12 md:py-16"
      aria-labelledby="order-account-heading"
    >
      <h2
        id="order-account-heading"
        className="text-title-sm font-medium tracking-tight text-ink md:text-title-md"
      >
        {orderSuccessCopy.accountHeading}
      </h2>
      <p className="mt-4 max-w-2xl text-body leading-8 text-ink-soft">
        {orderSuccessCopy.accountBody}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <TextLink href={`/${locale}${accountHref}`}>
          {orderSuccessCopy.createAccount}
        </TextLink>
        <TextButton
          tone="ghostOnLight"
          onClick={() => {
            setDismissed(true);
          }}
        >
          {orderSuccessCopy.continueWithout}
        </TextButton>
      </div>
    </section>
  );
}
