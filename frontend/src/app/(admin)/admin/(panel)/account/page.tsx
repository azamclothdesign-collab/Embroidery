import type { Metadata } from "next";
import { AccountForm } from "@/features/admin/AccountForm";
import { adminApi, type AdminMe } from "@/features/admin/adminApi";
import { PageHeader } from "@/features/admin/ui";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const me = await adminApi<AdminMe>("/v1/admin/auth/me");
  return (
    <>
      <PageHeader title="Account" description="Change your admin email and password. Saving signs out every other device." />
      <AccountForm key={me.email} email={me.email} force={me.mustChangePassword} />
    </>
  );
}
