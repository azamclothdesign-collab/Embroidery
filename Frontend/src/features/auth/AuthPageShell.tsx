import { type ReactNode } from "react";

import { PageEnter } from "@/components/PageEnter";
import { SiteHeader } from "@/components/SiteHeader";
import { authCopy } from "@/constants/authCopy";

type AuthPageShellProps = {
  eyebrow: string;
  heading: string;
  body: string;
  children: ReactNode;
};

export function AuthPageShell({
  eyebrow,
  heading,
  body,
  children,
}: AuthPageShellProps) {
  return (
    <>
      <SiteHeader />
      <PageEnter>
        <section className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col px-6 py-12 md:py-20">
          <div className="mx-auto w-full max-w-md">
            <p className="text-meta uppercase tracking-[0.22em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
              {heading}
            </h1>
            <p className="mt-4 text-body leading-8 text-ink-soft">{body}</p>
            <p className="mt-3 text-meta leading-6 text-ink-soft">
              {authCopy.deviceNote}
            </p>
            <div className="mt-10">{children}</div>
          </div>
        </section>
      </PageEnter>
    </>
  );
}
