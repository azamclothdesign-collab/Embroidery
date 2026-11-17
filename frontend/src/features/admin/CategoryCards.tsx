"use client";

import { EyeOff, FolderTree } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteCategoryAction } from "@/actions/admin";
import type { Category } from "@/lib/types";
import { RowActions } from "./RowActions";

export function CategoryCards({ items }: { items: Category[] }) {
  const router = useRouter();

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((category) => {
        const href = `/admin/categories/${category.id}`;
        return (
          <li key={category.id}>
            <div className="card flex w-full items-center gap-4 p-3 transition hover:bg-sand/40 hover:shadow-[var(--shadow-soft)]">
              <button
                type="button"
                onClick={() => router.push(href)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
              >
                <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sand">
                  {category.image !== null ? <Image src={category.image} alt="" fill sizes="64px" className="object-cover" /> : <FolderTree className="size-5 text-muted" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-teal">{category.name.en}</span>
                  {category.name.ur ? <span className="block truncate text-sm text-ink-soft" dir="rtl" lang="ur">{category.name.ur}</span> : null}
                  <span className="text-xs text-muted">
                    {category.productCount} designs · order {category.sortOrder}
                  </span>
                </span>
                {!category.isVisible && <EyeOff className="size-4 shrink-0 text-muted" aria-label="Hidden" />}
              </button>
              <RowActions
                editHref={href}
                editLabel={`Edit ${category.name.en}`}
                deleteLabel={`Delete ${category.name.en}`}
                deleteConfirmLabel="Delete category + designs"
                onDelete={() => deleteCategoryAction(category.id)}
                successMessage="Category deleted"
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
