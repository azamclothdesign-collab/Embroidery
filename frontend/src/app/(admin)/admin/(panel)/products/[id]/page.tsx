import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { ArchiveProductButton, DeleteProductButton } from "@/features/admin/ConfirmButtons";
import { ProductForm } from "@/features/admin/ProductForm";
import { PageHeader, StatusBadge } from "@/features/admin/ui";
import { ApiError } from "@/lib/api.server";
import { SITE_URL } from "@/lib/site";
import type { Category, Product } from "@/lib/types";

export const metadata: Metadata = { title: "Edit design" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, categories] = await Promise.all([
    adminApi<Product>(`/v1/admin/products/${id}`).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }),
    adminApi<{ items: Category[] }>("/v1/admin/categories"),
  ]);
  if (product === null) notFound();

  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Designs
      </Link>
      <PageHeader
        title={product.name.en}
        description={`Last updated ${new Date(product.updatedAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}`}
        actions={
          <>
            <StatusBadge status={product.status} />
            {product.status === "published" && (
              <Link href={`/en/d/${product.slug}`} target="_blank" className="btn btn-outline">
                <ExternalLink className="size-4" aria-hidden /> View
              </Link>
            )}
            {product.status !== "archived" && <ArchiveProductButton id={product.id} />}
            <DeleteProductButton id={product.id} />
          </>
        }
      />
      <ProductForm key={product.updatedAt} product={product} categories={categories.items} siteUrl={SITE_URL} />
    </>
  );
}
