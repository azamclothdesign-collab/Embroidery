import type { Metadata } from "next";
import { AuthCard } from "@/features/admin/AuthCard";
import { LoginForm } from "@/features/admin/AuthForms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const notice = params.reset === "1" ? "Password updated. Sign in with your new password." : params.expired === "1" ? "Your session ended. Please sign in again." : null;
  return (
    <AuthCard title="Store admin" text="Sign in to manage designs, orders and payments.">
      <LoginForm notice={notice} />
    </AuthCard>
  );
}
