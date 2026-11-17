import type { Metadata } from "next";
import { AuthCard } from "@/features/admin/AuthCard";
import { ForgotForm } from "@/features/admin/AuthForms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthCard title="Reset password" text="Enter your admin email and we will send a one-time reset link.">
      <ForgotForm />
    </AuthCard>
  );
}
