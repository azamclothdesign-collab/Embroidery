import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  adminCopy,
  adminHomeSections,
  adminSitePages,
} from "@/constants/adminCopy";
import {
  adminSiteFaqsHref,
  adminSiteGlobalHref,
  adminSiteHomeHref,
  adminSitePagesHref,
} from "@/constants/adminNav";
import { type SitePageItem } from "@/types/api/siteSettings";

type AdminSiteHubPageProps = {
  locale: string;
  lastSyncedLabel: string;
  pages: readonly SitePageItem[];
};

export function AdminSiteHubPage({
  locale,
  lastSyncedLabel,
  pages,
}: AdminSiteHubPageProps) {
  const localeRoot = `/${locale}`;
  const pageList = pages.length > 0 ? pages : adminSitePages;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.siteTitle}
        body={adminCopy.siteBody}
        actions={
          <>
            <Link
              href={localeRoot}
              target="_blank"
              rel="noreferrer"
              className="admin-link-ghost"
            >
              {adminCopy.sitePreview}
            </Link>
            <Link
              href={`${localeRoot}${adminSiteGlobalHref}`}
              className="admin-link-action"
            >
              {adminCopy.siteOpenGlobal}
            </Link>
          </>
        }
      />

      <section className="admin-panel overflow-hidden">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex items-start gap-4">
            <span className="admin-live-dot mt-2 shrink-0" aria-hidden="true" />
            <div>
              <p className="admin-panel-kicker">{adminCopy.siteHealthTitle}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-admin-ink">
                {adminCopy.siteHealthLive}
              </h2>
              <p className="mt-2 text-[0.9375rem] text-admin-ink-soft">
                {adminCopy.siteHealthPublished}: {lastSyncedLabel}
              </p>
            </div>
          </div>
          <p className="max-w-sm border border-admin-line bg-admin-input px-4 py-3 text-[0.8125rem] leading-5 text-admin-ink-soft">
            {adminCopy.sitePublishPending}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <article className="admin-panel-interactive flex flex-col p-6 md:p-7">
          <div className="h-1 w-12 bg-admin-accent" aria-hidden="true" />
          <p className="admin-panel-kicker mt-5">{adminCopy.siteMapHome}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-admin-ink">
            {adminCopy.siteHomeTitle}
          </h2>
          <ul className="mt-5 flex list-none flex-col gap-2.5 p-0 text-[0.875rem] text-admin-ink-soft">
            {adminHomeSections.map((section) => (
              <li
                key={section.id}
                className="flex items-center gap-2 border-b border-admin-line/70 pb-2 last:border-b-0 last:pb-0"
              >
                <span
                  className="size-1.5 shrink-0 bg-admin-accent"
                  aria-hidden="true"
                />
                {section.label}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-7">
            <Link
              href={`${localeRoot}${adminSiteHomeHref}`}
              className="admin-link-action"
            >
              {adminCopy.siteEdit}
            </Link>
          </div>
        </article>

        <article className="admin-panel-interactive flex flex-col p-6 md:p-7">
          <div className="h-1 w-12 bg-admin-accent" aria-hidden="true" />
          <p className="admin-panel-kicker mt-5">{adminCopy.siteMapPages}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-admin-ink">
            {adminCopy.sitePagesTitle}
          </h2>
          <ul className="mt-5 flex list-none flex-col gap-2.5 p-0 text-[0.875rem] text-admin-ink-soft">
            {pageList.map((page) => (
              <li
                key={page.id}
                className="flex items-center gap-2 border-b border-admin-line/70 pb-2 last:border-b-0 last:pb-0"
              >
                <span
                  className="size-1.5 shrink-0 bg-admin-accent"
                  aria-hidden="true"
                />
                {page.label}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-7">
            <Link
              href={`${localeRoot}${adminSitePagesHref}`}
              className="admin-link-action"
            >
              {adminCopy.siteEdit}
            </Link>
            <Link
              href={`${localeRoot}${adminSiteFaqsHref}`}
              className="admin-link-ghost"
            >
              {adminCopy.siteFaqTitle}
            </Link>
          </div>
        </article>

        <article className="admin-panel-interactive flex flex-col p-6 md:p-7">
          <div className="h-1 w-12 bg-admin-accent" aria-hidden="true" />
          <p className="admin-panel-kicker mt-5">{adminCopy.siteMapGlobal}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-admin-ink">
            {adminCopy.siteGlobalTitle}
          </h2>
          <p className="mt-5 text-[0.9375rem] leading-7 text-admin-ink-soft">
            {adminCopy.siteGlobalSummary}
          </p>
          <div className="mt-auto pt-7">
            <Link
              href={`${localeRoot}${adminSiteGlobalHref}`}
              className="admin-link-action"
            >
              {adminCopy.siteEdit}
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
