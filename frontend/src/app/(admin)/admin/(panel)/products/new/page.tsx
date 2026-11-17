import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { ProductForm } from "@/features/admin/ProductForm";
import { EmptyState, PageHeader } from "@/features/admin/ui";
import { SITE_URL } from "@/lib/site";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "New design" };

export default async function NewProductPage() {
  const { items: categories } = await adminApi<{ items: Category[] }>("/v1/admin/categories");
  return (
    <>
      <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Designs
      </Link>
      <PageHeader title="New design" />
      {categories.length === 0 ? (
        <EmptyState title="Create a category first" text="Every design belongs to a category." action={<Link href="/admin/categories" className="btn btn-primary">Add category</Link>} />
      ) : (
        <ProductForm product={null} categories={categories} siteUrl={SITE_URL} />
      )}
    </>
  );
}
