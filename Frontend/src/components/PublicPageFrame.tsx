import { type ReactNode } from "react";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";

type PublicPageFrameProps = {
  title: string;
  children?: ReactNode;
};

export function PublicPageFrame({ title, children }: PublicPageFrameProps) {
  return (
    <>
      <SiteHeader />
      <PageEnter>
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <h1 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
            {title}
          </h1>
          {children === undefined ? null : (
            <div className="mt-6 max-w-2xl text-body leading-8 text-ink-soft">
              {children}
            </div>
          )}
        </section>
      </PageEnter>
    </>
  );
}
