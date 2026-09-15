"use client";

import { useState, useTransition } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy } from "@/constants/adminCopy";
import { updateSiteFaqsAction } from "@/server/actions/adminCatalogActions";
import { type SiteFaqItem, type SiteFaqsSettings } from "@/types/api/siteSettings";

type AdminSiteFaqsPageProps = {
  locale: string;
  initialSettings: SiteFaqsSettings;
};

export function AdminSiteFaqsPage({
  locale,
  initialSettings,
}: AdminSiteFaqsPageProps) {
  void locale;
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<SiteFaqItem[]>(() => [
    ...initialSettings.items,
  ]);
  const [toast, setToast] = useState<string | null>(null);

  const persist = (next: SiteFaqItem[], rollback?: SiteFaqItem[]) => {
    setItems(next);

    startTransition(async () => {
      const result = await updateSiteFaqsAction({ items: next });

      if (!result.ok) {
        setToast(result.error);
        if (rollback !== undefined) {
          setItems(rollback);
        }
      } else {
        setToast(adminCopy.productsSaved);
      }

      window.setTimeout(() => {
        setToast(null);
      }, 2400);
    });
  };

  const toggleVisible = (index: number) => {
    const previous = items;
    const next = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, visible: !item.visible } : item,
    );
    persist(next, previous);
  };

  const addFaq = () => {
    const previous = items;
    const next: SiteFaqItem[] = [
      ...items,
      {
        question: "New question",
        answer: "Add your answer here.",
        visible: true,
      },
    ];
    persist(next, previous);
  };

  const removeFaq = (index: number) => {
    const previous = items;
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    persist(next, previous);
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.siteFaqTitle}
        body={adminCopy.siteFaqPending}
        actions={
          <button
            type="button"
            className="inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] disabled:opacity-70"
            onClick={addFaq}
            disabled={isPending}
          >
            {adminCopy.siteAddFaq}
          </button>
        }
      />

      {toast === null ? null : (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[0.875rem] text-ink-soft">
          {toast}
        </p>
      )}

      <ul className="flex list-none flex-col gap-3 p-0">
        {items.map((item, index) => (
          <li
            key={`${item.question}-${index}`}
            className="rounded-2xl border border-line bg-surface px-5 py-5"
          >
            <p className="text-meta uppercase tracking-[0.14em] text-accent">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-[0.9375rem] font-medium text-ink">
              {item.question}
            </h2>
            <p className="mt-3 text-[0.875rem] leading-6 text-ink-soft">
              {item.answer}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled
                className="inline-flex min-h-10 items-center border border-line px-3 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-70"
              >
                {adminCopy.siteEdit}
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center border border-line px-3 text-meta uppercase tracking-[0.14em] disabled:opacity-70"
                onClick={() => {
                  toggleVisible(index);
                }}
                disabled={isPending}
              >
                {item.visible ? adminCopy.siteHide : adminCopy.categoriesFilterVisible}
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center border border-line px-3 text-meta uppercase tracking-[0.14em] disabled:opacity-70"
                onClick={() => {
                  removeFaq(index);
                }}
                disabled={isPending}
              >
                {adminCopy.siteDelete}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
