import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { CategoryForm } from "@/features/admin/CategoryForm";
import { DeleteButton } from "@/features/admin/ConfirmButtons";
import { PageHeader } from "@/features/admin/ui";
import { ApiError } from "@/lib/api.server";
import { SITE_URL } from "@/lib/site";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Category" };

/** /admin/categories/new creates; /admin/categories/{uuid} edits. */
export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const category = isNew
    ? null
    : await adminApi<Category>(`/v1/admin/categories/${id}`).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      });
  if (!isNew && category === null) notFound();

  return (
    <>
      <Link href="/admin/categories" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Categories
      </Link>
      <PageHeader
        title={category === null ? "New category" : category.name.en}
        {...(category === null
          ? {}
          : {
              description: `${category.productCount} published designs`,
              actions: <DeleteButton kind="category" id={category.id} redirectTo="/admin/categories" />,
            })}
      />
      <CategoryForm key={category?.updatedAt ?? "new"} category={category} siteUrl={SITE_URL} />
    </>
  );
}
