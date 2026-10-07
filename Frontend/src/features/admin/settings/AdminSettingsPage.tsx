"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy } from "@/constants/adminCopy";
import { adminPaymentsHref } from "@/constants/adminNav";
import { updateSiteGlobalAction } from "@/server/actions/adminCatalogActions";
import { type SiteGlobalSettings } from "@/types/api/siteSettings";

type AdminSettingsPageProps = {
  locale: string;
  initialSettings: SiteGlobalSettings;
};

export function AdminSettingsPage({
  locale,
  initialSettings,
}: AdminSettingsPageProps) {
  const [isPending, startTransition] = useTransition();
  const [storeName, setStoreName] = useState(initialSettings.brandName);
  const [storeEmail, setStoreEmail] = useState(
    initialSettings.contactEmail || "azamclothdesign@gmail.com",
  );
  const [orderConfirmation, setOrderConfirmation] = useState(true);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [saveLabel, setSaveLabel] = useState<string>(adminCopy.settingsSave);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = () => {
    setSaveLabel(adminCopy.productsSaving);

    startTransition(async () => {
      const result = await updateSiteGlobalAction({
        brandName: storeName.trim().length > 0 ? storeName.trim() : initialSettings.brandName,
        tagline: tagline.trim().length > 0 ? tagline.trim() : initialSettings.tagline,
        contactEmail:
          storeEmail.trim().length > 0
            ? storeEmail.trim()
            : initialSettings.contactEmail,
        contactPhone: initialSettings.contactPhone,
        contactAddress: initialSettings.contactAddress,
        instagram: initialSettings.instagram,
        pinterest: initialSettings.pinterest,
      });

      if (!result.ok) {
        setSaveLabel(adminCopy.settingsSave);
        setToast(result.error);
        return;
      }

      setSaveLabel(adminCopy.productsSaved);
      setToast(adminCopy.productsSavePending);
      window.setTimeout(() => {
        setSaveLabel(adminCopy.settingsSave);
        setToast(null);
      }, 2000);
    });
  };

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.settingsTitle}
        body={adminCopy.settingsBody}
      />

      {toast === null ? null : (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[0.875rem] text-ink-soft">
          {toast}
        </p>
      )}

      <section className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-meta uppercase tracking-[0.14em] text-ink-soft">
          {adminCopy.settingsSectionGeneral}
        </h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
            {adminCopy.settingsStoreName}
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            />
          </label>
          <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
            {adminCopy.siteGlobalTagline}
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            />
          </label>
          <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
            {adminCopy.settingsStoreEmail}
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            />
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-meta uppercase tracking-[0.14em] text-ink-soft">
          {adminCopy.settingsSectionPayments}
        </h2>
        <p className="text-body leading-8 text-ink-soft">
          {adminCopy.paymentsBody}
        </p>
        <Link
          href={`/${locale}${adminPaymentsHref}`}
          className="inline-flex min-h-11 w-fit items-center bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper"
        >
          {adminCopy.paymentsOpenLink}
        </Link>
      </section>

      <section className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-meta uppercase tracking-[0.14em] text-ink-soft">
          {adminCopy.settingsSectionNotifications}
        </h2>
        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center gap-3 text-[0.875rem] text-ink">
            <input
              type="checkbox"
              checked={orderConfirmation}
              onChange={(e) => setOrderConfirmation(e.target.checked)}
              className="size-5 border-line bg-paper text-ink focus:ring-ink"
            />
            {adminCopy.settingsOrderConfirmation}
          </label>
        </div>
      </section>

      <div className="flex justify-end border-t border-line pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex min-h-11 items-center bg-ink px-6 text-meta uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink/90 disabled:opacity-70"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
