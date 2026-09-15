import { type ReactNode } from "react";
import type { Metadata } from "next";

import { nourdFont } from "@/lib/nourdFont";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Embroidery",
  description: "Embroidery",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${nourdFont.variable} ${nourdFont.className} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-nourd text-ink">
        {children}
      </body>
    </html>
  );
}
