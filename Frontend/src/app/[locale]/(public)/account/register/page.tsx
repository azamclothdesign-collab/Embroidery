import { Suspense } from "react";
import { type Metadata } from "next";

import { RegisterPage } from "@/features/auth/RegisterPage";

type RegisterRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function RegisterRoute({ params }: RegisterRouteProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <RegisterPage locale={locale} />
    </Suspense>
  );
}
