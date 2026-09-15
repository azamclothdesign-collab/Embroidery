"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy, adminHomeSections } from "@/constants/adminCopy";
import { updateSiteHomeAction } from "@/server/actions/adminCatalogActions";
import {
  type SiteHomeSection,
  type SiteHomeSettings,
} from "@/types/api/siteSettings";

type AdminSiteHomePageProps = {
  locale: string;
  initialSettings: SiteHomeSettings;
};

type HeroForm = {
  eyebrow: string;
  heading: string;
  description: string;
  primaryCta: string;
  primaryUrl: string;
};

function defaultSections(): SiteHomeSection[] {
  return adminHomeSections.map((section) => ({
    id: section.id,
    label: section.label,
    enabled: true,
  }));
}

function resolveSections(settings: SiteHomeSettings): SiteHomeSection[] {
  if (settings.sections.length === 0) {
    return defaultSections();
  }

  return [...settings.sections];
}

function toHeroForm(settings: SiteHomeSettings): HeroForm {
  return {
    eyebrow: settings.hero.eyebrow,
    heading: settings.hero.heading,
    description: settings.hero.body,
    primaryCta: settings.hero.ctaLabel,
    primaryUrl: settings.hero.ctaHref,
  };
}

export function AdminSiteHomePage({
  locale,
  initialSettings,
}: AdminSiteHomePageProps) {
  const localeRoot = `/${locale}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState(() =>
    resolveSections(initialSettings),
  );
  const [editingHero, setEditingHero] = useState(false);
  const [hero, setHero] = useState(() => toHeroForm(initialSettings));
  const [toast, setToast] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= sections.length) {
      return;
    }

    const next = [...sections];
    const current = next[index];
    const swap = next[nextIndex];

    if (current === undefined || swap === undefined) {
      return;
    }

    next[index] = swap;
    next[nextIndex] = current;
    setSections(next);
    setDirty(true);
  };

  const toggleEnabled = (sectionId: string) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section,
      ),
    );
    setDirty(true);
  };

  const onSave = () => {
    startTransition(async () => {
      const result = await updateSiteHomeAction({
        hero: {
          eyebrow: hero.eyebrow,
          heading: hero.heading,
          body: hero.description,
          ctaLabel: hero.primaryCta,
          ctaHref: hero.primaryUrl,
        },
        sections,
      });

      if (!result.ok) {
        setToast(result.error || adminCopy.productsActionFailed);
      } else {
        setToast(adminCopy.productsSaved);
        setDirty(false);
        router.refresh();
      }

      window.setTimeout(() => {
        setToast(null);
      }, 2400);
    });
  };

  const onDiscard = () => {
    setSections(resolveSections(initialSettings));
    setHero(toHeroForm(initialSettings));
    setEditingHero(false);
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-8 pb-28">
      <AdminPageHeader
        title={adminCopy.siteHomeTitle}
        body={adminCopy.siteHomeReorderHint}
        actions={
          <Link href={`${localeRoot}/admin/site`} className="admin-link-ghost">
            {adminCopy.siteTitle}
          </Link>
        }
      />

      {toast === null ? null : (
        <p className="admin-panel px-4 py-3 text-[0.875rem] text-admin-ink-soft">
          {toast}
        </p>
      )}

      {sections.length === 0 ? (
        <AdminEmptyState
          title={adminCopy.siteHomeTitle}
          body={adminCopy.siteHomeEmpty}
          action={
            <button
              type="button"
              className="admin-link-action"
              onClick={() => {
                setSections(defaultSections());
                setDirty(true);
              }}
            >
              {adminCopy.siteHomeResetSections}
            </button>
          }
        />
      ) : (
        <ul className="flex list-none flex-col gap-3 p-0">
          {sections.map((section, index) => (
            <li key={section.id} className="admin-panel px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="text-[0.75rem] text-admin-ink-soft"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-[0.9375rem] font-medium text-admin-ink">
                      {section.label}
                    </h2>
                    <p className="mt-1 text-[0.8125rem] text-admin-ink-soft">
                      {section.enabled
                        ? adminCopy.categoriesStatusLive
                        : adminCopy.siteHide}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="admin-link-ghost"
                    onClick={() => {
                      move(index, -1);
                    }}
                  >
                    {adminCopy.siteMoveUp}
                  </button>
                  <button
                    type="button"
                    className="admin-link-ghost"
                    onClick={() => {
                      move(index, 1);
                    }}
                  >
                    {adminCopy.siteMoveDown}
                  </button>
                  <button
                    type="button"
                    className="admin-link-ghost"
                    onClick={() => {
                      toggleEnabled(section.id);
                    }}
                  >
                    {section.enabled
                      ? adminCopy.siteHide
                      : adminCopy.siteShow}
                  </button>
                  {section.id === "hero" ? (
                    <button
                      type="button"
                      className="admin-link-action"
                      onClick={() => {
                        setEditingHero((open) => !open);
                      }}
                    >
                      {adminCopy.siteEdit}
                    </button>
                  ) : null}
                </div>
              </div>
              {section.id === "hero" && editingHero ? (
                <div className="mt-5 grid gap-4 border-t border-admin-line pt-5 md:grid-cols-2">
                  <div className="flex flex-col gap-3">
                    {(
                      [
                        ["eyebrow", hero.eyebrow, adminCopy.siteHeroEyebrow],
                        ["heading", hero.heading, adminCopy.siteHeroHeading],
                        [
                          "description",
                          hero.description,
                          adminCopy.siteHeroBody,
                        ],
                        ["primaryCta", hero.primaryCta, adminCopy.siteHeroCta],
                        ["primaryUrl", hero.primaryUrl, adminCopy.siteHeroUrl],
                      ] as const
                    ).map(([key, value, label]) => (
                      <label
                        key={key}
                        className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft"
                      >
                        {label}
                        <input
                          value={value}
                          onChange={(event) => {
                            setHero((current) => ({
                              ...current,
                              [key]: event.target.value,
                            }));
                            setDirty(true);
                          }}
                          className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="border border-admin-line bg-admin-input p-5">
                    <p className="admin-panel-kicker">
                      {adminCopy.productsPreview}
                    </p>
                    <p className="mt-4 text-meta uppercase tracking-[0.16em] text-admin-ink-soft">
                      {hero.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-admin-ink">
                      {hero.heading}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-7 text-admin-ink-soft">
                      {hero.description}
                    </p>
                    <div className="mt-6">
                      <span className="inline-flex border border-admin-ink bg-admin-ink px-3 py-2 text-meta uppercase tracking-[0.14em] text-paper">
                        {hero.primaryCta}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-admin-line bg-admin-surface-glass px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.875rem] text-admin-ink-soft">
            {dirty
              ? adminCopy.siteStickyUnsaved
              : adminCopy.siteStickySaved}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-link-ghost"
              onClick={onDiscard}
            >
              {adminCopy.siteStickyDiscard}
            </button>
            <button
              type="button"
              className="admin-link-ghost disabled:opacity-70"
              onClick={onSave}
              disabled={isPending}
            >
              {isPending ? adminCopy.productsSaving : adminCopy.siteStickyDraft}
            </button>
            <Link
              href={localeRoot}
              target="_blank"
              rel="noreferrer"
              className="admin-link-ghost"
            >
              {adminCopy.siteStickyPreview}
            </Link>
            <button
              type="button"
              className="admin-link-action disabled:opacity-70"
              onClick={onSave}
              disabled={isPending}
            >
              {adminCopy.siteStickyPublish}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
