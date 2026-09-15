import { type ReactNode } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SkipLink } from "@/components/SkipLink";

type PublicLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = await params;

  return (
    <>
      <SkipLink />
      <main id="main-content" className="flex flex-1 flex-col" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
