import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { DeleteButton } from "@/features/admin/ConfirmButtons";
import { PageEditor } from "@/features/admin/PageEditor";
import { PageHeader } from "@/features/admin/ui";
import { SITE_URL } from "@/lib/site";
import type { CmsPage } from "@/lib/types";

export const metadata: Metadata = { title: "Edit page" };

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const isNew = slug === "new";
  if (!isNew && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) notFound();
  const page = isNew ? null : ((await adminApi<{ items: CmsPage[] }>("/v1/admin/pages")).items.find((p) => p.slug === slug) ?? null);
  if (!isNew && page === null) notFound();

  return (
    <>
      <Link href="/admin/pages" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Pages
      </Link>
      <PageHeader
        title={page?.title.en ?? "New page"}
        {...(page === null
          ? {}
          : {
              actions: (
                <>
                  <Link href={`/en/p/${page.slug}`} target="_blank" className="btn btn-outline">
                    <ExternalLink className="size-4" aria-hidden /> View
                  </Link>
                  <DeleteButton kind="page" id={page.slug} redirectTo="/admin/pages" />
                </>
              ),
            })}
      />
      <PageEditor key={page?.updatedAt ?? "new"} page={page} siteUrl={SITE_URL} />
    </>
  );
}
