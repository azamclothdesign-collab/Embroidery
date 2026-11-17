import { Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** GET-form filters + pagination for admin lists (works without JavaScript). */
export function ListFilters({
  action,
  q,
  tabs,
  activeTab,
  tabParam,
  placeholder,
  extra,
}: {
  action: string;
  q: string;
  tabs: Array<{ value: string; label: string }>;
  activeTab: string;
  tabParam: string;
  placeholder: string;
  extra?: Record<string, string>;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <nav className="flex flex-wrap gap-1" aria-label="Filter">
        {tabs.map((tab) => {
          const params = new URLSearchParams({ ...extra, ...(tab.value ? { [tabParam]: tab.value } : {}), ...(q ? { q } : {}) });
          return (
            <Link
              key={tab.value}
              href={`${action}${params.size > 0 ? `?${params.toString()}` : ""}`}
              aria-current={tab.value === activeTab ? "page" : undefined}
              className={cn("rounded-full px-3.5 py-2 text-sm font-semibold", tab.value === activeTab ? "bg-ink text-white" : "text-ink-soft hover:bg-sand")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <form action={action} className="flex gap-2" role="search">
        {activeTab && <input type="hidden" name={tabParam} value={activeTab} />}
        <label htmlFor="admin-q" className="sr-only">{placeholder}</label>
        <input id="admin-q" name="q" defaultValue={q} placeholder={placeholder} className="field min-h-11 w-full lg:w-72" />
        <button type="submit" className="btn btn-dark min-h-11 px-4" aria-label="Search">
          <Search className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}

export function Pager({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-end gap-2 text-sm" aria-label="Pagination">
      {page > 1 && <Link href={href(page - 1)} className="btn btn-outline min-h-9 px-3">Previous</Link>}
      <span className="px-2 text-ink-soft">Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} className="btn btn-outline min-h-9 px-3">Next</Link>}
    </nav>
  );
}

export function readAdminParams(params: Record<string, string | string[] | undefined>) {
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const page = Number.parseInt(one("page") || "1", 10);
  return { one, page: Number.isFinite(page) && page > 0 ? page : 1, q: one("q").trim().slice(0, 80) };
}
