"use client";

import Link from "next/link";

import { TextButton } from "@/components/TextButton";
import { defaultLocale } from "@/constants/locales";

type PublicErrorProps = {
  reset: () => void;
};

export default function PublicError({ reset }: PublicErrorProps) {
  return (
    <>
      <header className="sticky top-0 z-40 h-header-compact bg-paper text-ink">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-6">
          <Link
            href={`/${defaultLocale}`}
            className="font-nourd text-lg tracking-[0.14em]"
          >
            Embroidery
          </Link>
        </div>
      </header>
      <section
        className="mx-auto w-full max-w-3xl px-6 py-16"
        aria-labelledby="error-heading"
      >
        <h1 id="error-heading" className="text-2xl font-medium text-ink">
          The page could not be loaded
        </h1>
        <TextButton className="mt-6" tone="ink" onClick={reset}>
          Try again
        </TextButton>
      </section>
    </>
  );
}
