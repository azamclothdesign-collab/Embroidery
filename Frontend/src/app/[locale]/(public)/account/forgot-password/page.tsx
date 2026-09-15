import { type Metadata } from "next";

import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";

type ForgotPasswordRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default async function ForgotPasswordRoute({
  params,
}: ForgotPasswordRouteProps) {
  const { locale } = await params;

  return <ForgotPasswordPage locale={locale} />;
}
