import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { PageHeader, shortDate } from "@/features/admin/ui";
import type { CmsPage } from "@/lib/types";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesPage() {
  const { items } = await adminApi<{ items: CmsPage[] }>("/v1/admin/pages");
  return (
    <>
      <PageHeader
        title="Pages"
        description="About and policy pages, linked in the footer. Payment providers require privacy, refund and terms pages."
        actions={
          <Link href="/admin/pages/new" className="btn btn-primary">
            <Plus className="size-4" aria-hidden /> New page
          </Link>
        }
      />
      <ul className="card divide-y divide-line">
        {items.map((page) => (
          <li key={page.slug}>
            <Link href={`/admin/pages/${page.slug}`} className="flex items-center gap-4 px-5 py-4 hover:bg-sand/40">
              <FileText className="size-5 text-muted" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{page.title.en}</span>
                <span className="text-xs text-muted">/p/{page.slug}</span>
              </span>
              <span className="text-xs text-muted">{shortDate(page.updatedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
