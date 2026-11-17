import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { AnnouncementEditor, FaqEditor, HomeEditor, SeoEditor } from "@/features/admin/StorefrontEditor";
import { PageHeader } from "@/features/admin/ui";
import type { Storefront } from "@/lib/types";

export const metadata: Metadata = { title: "Storefront" };

export default async function ContentPage() {
  const [home, announcement, faq, seo] = await Promise.all([
    adminApi<Storefront["home"]>("/v1/admin/settings/home"),
    adminApi<Storefront["announcement"]>("/v1/admin/settings/announcement"),
    adminApi<Storefront["faq"]>("/v1/admin/settings/faq"),
    adminApi<Storefront["seo"]>("/v1/admin/settings/seo"),
  ]);
  return (
    <>
      <PageHeader
        title="Storefront"
        description="Everything customers read on the home page, in English and Urdu."
        actions={
          <Link href="/en" target="_blank" className="btn btn-outline">
            <ExternalLink className="size-4" aria-hidden /> Preview store
          </Link>
        }
      />
      <div className="space-y-6">
        <HomeEditor initial={home} />
        <AnnouncementEditor initial={announcement} />
        <FaqEditor initial={faq} />
        <SeoEditor initial={seo} />
      </div>
    </>
  );
}
