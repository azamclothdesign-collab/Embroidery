import { type Metadata } from "next";
import { redirect } from "next/navigation";

type DownloadsRedirectProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Downloads",
};

export default async function DownloadsRedirect({
  params,
}: DownloadsRedirectProps) {
  const { locale } = await params;
  redirect(`/${locale}/account/downloads`);
}
