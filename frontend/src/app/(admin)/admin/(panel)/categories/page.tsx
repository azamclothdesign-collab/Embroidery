import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { CategoryCards } from "@/features/admin/CategoryCards";
import { EmptyState, PageHeader } from "@/features/admin/ui";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const { items } = await adminApi<{ items: Category[] }>("/v1/admin/categories");
  return (
    <>
      <PageHeader
        title="Categories"
        description={`${items.length} categor${items.length === 1 ? "y" : "ies"} · click any card to edit`}
        actions={
          <Link href="/admin/categories/new" className="btn btn-primary">
            <Plus className="size-4" aria-hidden /> New category
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No categories yet" action={<Link href="/admin/categories/new" className="btn btn-primary">Add category</Link>} />
      ) : (
        <CategoryCards items={items} />
      )}
    </>
  );
}
