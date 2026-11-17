import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { nastaliq, nourd } from "../../fonts";
import "../../globals.css";

export const metadata: Metadata = {
  title: { default: "Store admin", template: "%s · Store admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${nourd.variable} ${nastaliq.variable}`}>
      <body className="min-h-dvh bg-ivory">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
