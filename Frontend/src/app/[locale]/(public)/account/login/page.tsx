import { Suspense } from "react";
import { type Metadata } from "next";

import { LoginPage } from "@/features/auth/LoginPage";

type LoginRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginRoute({ params }: LoginRouteProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <LoginPage locale={locale} />
    </Suspense>
  );
}
