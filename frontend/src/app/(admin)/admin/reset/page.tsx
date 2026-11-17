import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/features/admin/AuthCard";
import { ResetForm } from "@/features/admin/AuthForms";

export const metadata: Metadata = { title: "Set new password", referrer: "no-referrer" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const token = (await searchParams).token;
  const valid = typeof token === "string" && token.length >= 20 && token.length <= 200;
  return (
    <AuthCard title="Set a new password" text="Choose a strong password you do not use anywhere else.">
      {valid ? (
        <ResetForm token={token} />
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-ink-soft">This reset link is invalid or incomplete.</p>
          <Link href="/admin/forgot" className="btn btn-dark w-full">Request a new link</Link>
        </div>
      )}
    </AuthCard>
  );
}
