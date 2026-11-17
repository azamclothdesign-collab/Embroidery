import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminApi } from "@/features/admin/adminApi";
import { ListFilters, Pager, readAdminParams } from "@/features/admin/ListFilters";
import { ProductTable } from "@/features/admin/ProductTable";
import { EmptyState, PageHeader } from "@/features/admin/ui";
import type { ProductPage } from "@/lib/types";

export const metadata: Metadata = { title: "Designs" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const { one, page, q } = readAdminParams(await searchParams);
  const status = ["draft", "published", "archived"].includes(one("status")) ? one("status") : "";
  const params = new URLSearchParams({ page: String(page), limit: "30", sort: "new" });
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const data = await adminApi<ProductPage>(`/v1/admin/products?${params.toString()}`);

  return (
    <>
      <PageHeader
        title="Designs"
        description={`${data.total} design${data.total === 1 ? "" : "s"} · click any row to edit`}
        actions={
          <Link href="/admin/products/new" className="btn btn-primary">
            <Plus className="size-4" aria-hidden /> New design
          </Link>
        }
      />
      <ListFilters
        action="/admin/products"
        q={q}
        tabParam="status"
        activeTab={status}
        placeholder="Search name or slug"
        tabs={[
          { value: "", label: "All" },
          { value: "published", label: "Published" },
          { value: "draft", label: "Drafts" },
          { value: "archived", label: "Archived" },
        ]}
      />
      {data.items.length === 0 ? (
        <EmptyState
          title="No designs here yet"
          text="Add your first design: images, price, category and the ZIP file customers will download."
          action={<Link href="/admin/products/new" className="btn btn-primary">Add a design</Link>}
        />
      ) : (
        <ProductTable products={data.items} />
      )}
      <Pager
        page={data.page}
        pages={data.pages}
        href={(p) => `/admin/products?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}), page: String(p) }).toString()}`}
      />
    </>
  );
}
