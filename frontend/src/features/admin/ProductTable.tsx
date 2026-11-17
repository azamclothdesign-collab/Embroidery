"use client";

import { Archive, Eye, EyeOff, ImageOff, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { bulkProductsAction, deleteProductAction } from "@/actions/admin";
import type { Product } from "@/lib/types";
import { NavRow } from "./NavRow";
import { RowActions } from "./RowActions";
import { StatusBadge, rupees } from "./ui";

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const all = products.length > 0 && selected.length === products.length;

  const bulk = (status: "draft" | "published" | "archived") =>
    startTransition(async () => {
      const result = await bulkProductsAction(selected, status);
      if (!result.ok) return void toast.error(result.message);
      const changed = (result.data as { changed: number }).changed;
      toast.success(`${changed} design${changed === 1 ? "" : "s"} updated${status === "published" && changed < selected.length ? " (designs without a ZIP were skipped)" : ""}`);
      setSelected([]);
      router.refresh();
    });

  const bulkDelete = () =>
    startTransition(async () => {
      let deleted = 0;
      for (const id of selected) {
        const result = await deleteProductAction(id);
        if (!result.ok) {
          toast.error(result.message);
          break;
        }
        deleted += 1;
      }
      if (deleted > 0) toast.success(`${deleted} design${deleted === 1 ? "" : "s"} deleted`);
      setSelected([]);
      router.refresh();
    });

  return (
    <div className="card overflow-hidden">
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-sand/60 px-4 py-2.5 text-sm">
          <span className="me-2 font-semibold">{selected.length} selected</span>
          <button type="button" className="btn btn-outline min-h-9 px-3" disabled={pending} onClick={() => bulk("published")}>
            <Eye className="size-4" aria-hidden /> Publish
          </button>
          <button type="button" className="btn btn-outline min-h-9 px-3" disabled={pending} onClick={() => bulk("draft")}>
            <EyeOff className="size-4" aria-hidden /> Unpublish
          </button>
          <button type="button" className="btn btn-outline min-h-9 px-3" disabled={pending} onClick={() => bulk("archived")}>
            <Archive className="size-4" aria-hidden /> Archive
          </button>
          <button type="button" className="btn btn-outline min-h-9 px-3 text-danger" disabled={pending} onClick={bulkDelete}>
            <Trash2 className="size-4" aria-hidden /> Delete
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" aria-label="Select all" className="size-4 accent-ink" checked={all} onChange={(e) => setSelected(e.target.checked ? products.map((p) => p.id) : [])} />
              </th>
              <th className="px-3 py-3 text-start font-semibold">Design</th>
              <th className="px-3 py-3 text-start font-semibold">Category</th>
              <th className="px-3 py-3 text-start font-semibold">Status</th>
              <th className="px-3 py-3 text-start font-semibold">ZIP</th>
              <th className="px-3 py-3 text-end font-semibold">Price</th>
              <th className="px-4 py-3 text-end font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const href = `/admin/products/${product.id}`;
              return (
                <NavRow key={product.id} href={href}>
                  <td className="px-4 py-3" data-no-row-nav>
                    <input
                      type="checkbox"
                      aria-label={`Select ${product.name.en}`}
                      className="size-4 accent-ink"
                      checked={selected.includes(product.id)}
                      onChange={(e) => setSelected((s) => (e.target.checked ? [...s, product.id] : s.filter((id) => id !== product.id)))}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-3 font-semibold">
                      <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sand">
                        {product.images[0] !== undefined ? <Image src={product.images[0]} alt="" fill sizes="44px" className="object-cover" /> : <ImageOff className="size-4 text-muted" aria-hidden />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-teal">{product.name.en}</span>
                        <span className="block truncate text-xs font-normal text-muted">/{product.slug}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{product.category.name.en}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-3 py-3">{product.package !== null ? <span className="text-success">✓</span> : <span className="font-semibold text-danger">Missing</span>}</td>
                  <td className="px-3 py-3 text-end">
                    {product.salePriceMinor !== null ? (
                      <>
                        <span className="font-semibold">{rupees(product.salePriceMinor)}</span>{" "}
                        <s className="text-xs text-muted">{rupees(product.priceMinor)}</s>
                      </>
                    ) : (
                      <span className="font-semibold">{rupees(product.priceMinor)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <RowActions
                      editHref={href}
                      editLabel={`Edit ${product.name.en}`}
                      deleteLabel={`Delete ${product.name.en}`}
                      deleteConfirmLabel="Confirm delete design"
                      onDelete={() => deleteProductAction(product.id)}
                      successMessage="Design deleted"
                    />
                  </td>
                </NavRow>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
