"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TextLink } from "@/components/TextLink";
import { authCopy } from "@/constants/authCopy";
import {
  accountLoginHref,
  accountRegisterHref,
} from "@/constants/siteNavigation";

type AuthRequiredProps = {
  locale: string;
};

export function AuthRequired({ locale }: AuthRequiredProps) {
  const pathname = usePathname();
  const nextParam = encodeURIComponent(pathname);

  return (
    <section className="mx-auto max-w-xl py-8 text-center md:py-16">
      <h1 className="text-title-sm font-medium tracking-tight text-ink md:text-title-md">
        {authCopy.gateHeading}
      </h1>
      <p className="mt-4 text-body leading-8 text-ink-soft">{authCopy.gateBody}</p>
      <p className="mt-3 text-meta leading-6 text-ink-soft">{authCopy.deviceNote}</p>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <TextLink href={`/${locale}${accountLoginHref}?next=${nextParam}`}>
          {authCopy.gateSignIn}
        </TextLink>
        <Link
          href={`/${locale}${accountRegisterHref}?next=${nextParam}`}
          className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] text-ink underline-offset-4 hover:underline"
        >
          {authCopy.gateRegister}
        </Link>
      </div>
    </section>
  );
}
