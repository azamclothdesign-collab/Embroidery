import type { ReactNode } from "react";
import { BrandMark, StitchLine } from "@/features/store/components/StitchLine";

export function AuthCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(70%_60%_at_50%_0%,var(--color-saffron-soft),transparent_70%)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandMark className="size-12" />
          <h1 className="mt-4 text-3xl">{title}</h1>
          <StitchLine className="mt-2 w-36" />
          <p className="mt-3 text-ink-soft">{text}</p>
        </div>
        <div className="card p-6 shadow-[var(--shadow-soft)] sm:p-8">{children}</div>
      </div>
    </main>
  );
}
