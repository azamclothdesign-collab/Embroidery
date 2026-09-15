import { type ReactNode } from "react";

import { SkipLink } from "@/components/SkipLink";

type CheckoutLayoutProps = {
  children: ReactNode;
};

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <>
      <SkipLink />
      <main id="main-content" className="flex flex-1 flex-col bg-paper" tabIndex={-1}>
        {children}
      </main>
    </>
  );
}
