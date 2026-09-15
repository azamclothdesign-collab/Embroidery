import { type ReactNode } from "react";
import { notFound } from "next/navigation";

import { type Locale,locales } from "@/constants/locales";

function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return children;
}
