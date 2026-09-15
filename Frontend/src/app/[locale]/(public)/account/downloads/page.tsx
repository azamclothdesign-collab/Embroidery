import { type Metadata } from "next";

import { AccountDownloadsPage } from "@/features/account/AccountDownloadsPage";
import { AccountPageFrame } from "@/features/account/AccountPageFrame";
import { fetchAccountDownloads } from "@/lib/api/accountApi";
import { type DownloadLibraryItem } from "@/types/api/account";

type AccountDownloadsRouteProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "My Downloads",
};

export default async function AccountDownloadsRoute({
  params,
}: AccountDownloadsRouteProps) {
  const { locale } = await params;

  let items: DownloadLibraryItem[];

  try {
    items = await fetchAccountDownloads();
  } catch {
    items = [];
  }

  return (
    <AccountPageFrame locale={locale} activeId="downloads">
      <AccountDownloadsPage locale={locale} items={items} />
    </AccountPageFrame>
  );
}
