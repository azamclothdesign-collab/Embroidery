import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy } from "@/constants/adminCopy";
import { type SitePagesSettings } from "@/types/api/siteSettings";

type AdminSitePagesPageProps = {
  locale: string;
  initialSettings: SitePagesSettings;
};

export function AdminSitePagesPage({
  locale,
  initialSettings,
}: AdminSitePagesPageProps) {
  const localeRoot = `/${locale}`;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.sitePagesTitle}
        body={adminCopy.siteSectionPending}
      />
      <ul className="flex list-none flex-col gap-3 p-0">
        {initialSettings.pages.map((page) => (
          <li
            key={page.id}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-[0.9375rem] font-medium text-ink">
                {page.label}
              </h2>
              <p className="mt-1 text-[0.8125rem] text-ink-soft">{page.href}</p>
              <p className="mt-1 text-[0.8125rem] text-ink-soft">
                {page.visible
                  ? adminCopy.categoriesStatusLive
                  : adminCopy.categoriesFilterHidden}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`${localeRoot}${page.href}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] underline-offset-4 hover:underline"
              >
                {adminCopy.siteStickyPreview}
              </Link>
              <Link
                href={`${localeRoot}${page.href}`}
                className="inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em]"
              >
                {adminCopy.siteEdit}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
