"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy } from "@/constants/adminCopy";
import { updateSiteGlobalAction } from "@/server/actions/adminCatalogActions";
import { type SiteGlobalSettings } from "@/types/api/siteSettings";

type AdminSiteGlobalPageProps = {
  locale: string;
  initialSettings: SiteGlobalSettings;
};

export function AdminSiteGlobalPage({
  locale,
  initialSettings,
}: AdminSiteGlobalPageProps) {
  const localeRoot = `/${locale}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [brandName, setBrandName] = useState(initialSettings.brandName);
  const [tagline, setTagline] = useState(initialSettings.tagline);
  const [contactEmail, setContactEmail] = useState(
    initialSettings.contactEmail,
  );
  const [contactPhone, setContactPhone] = useState(
    initialSettings.contactPhone,
  );
  const [contactAddress, setContactAddress] = useState(
    initialSettings.contactAddress,
  );
  const [instagram, setInstagram] = useState(initialSettings.instagram);
  const [pinterest, setPinterest] = useState(initialSettings.pinterest);
  const [toast, setToast] = useState<string | null>(null);

  const onSave = () => {
    startTransition(async () => {
      const result = await updateSiteGlobalAction({
        brandName,
        tagline,
        contactEmail,
        contactPhone,
        contactAddress,
        instagram,
        pinterest,
      });

      if (!result.ok) {
        setToast(result.error || adminCopy.productsActionFailed);
      } else {
        setToast(adminCopy.productsSaved);
        router.refresh();
      }

      window.setTimeout(() => {
        setToast(null);
      }, 2400);
    });
  };

  const clearContact = () => {
    setContactEmail("");
    setContactPhone("");
    setContactAddress("");
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.siteGlobalTitle}
        body={adminCopy.siteGlobalSummary}
        actions={
          <>
            <Link href={`${localeRoot}/admin/site`} className="admin-link-ghost">
              {adminCopy.siteTitle}
            </Link>
            <button
              type="button"
              className="admin-link-action disabled:opacity-70"
              onClick={onSave}
              disabled={isPending}
            >
              {isPending ? adminCopy.productsSaving : adminCopy.productsSave}
            </button>
          </>
        }
      />

      {toast === null ? null : (
        <p className="admin-panel px-4 py-3 text-[0.875rem] text-admin-ink-soft">
          {toast}
        </p>
      )}

      <div className="admin-panel grid max-w-2xl gap-5 p-5 md:p-6">
        <p className="admin-panel-kicker">{adminCopy.siteGlobalBrand}</p>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalBrand}
          <input
            value={brandName}
            onChange={(event) => {
              setBrandName(event.target.value);
            }}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalTagline}
          <input
            value={tagline}
            onChange={(event) => {
              setTagline(event.target.value);
            }}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
      </div>

      <div className="admin-panel grid max-w-2xl gap-5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="admin-panel-kicker">{adminCopy.siteGlobalContact}</p>
          <button
            type="button"
            className="admin-link-ghost"
            onClick={clearContact}
          >
            {adminCopy.siteGlobalClearContact}
          </button>
        </div>
        <p className="text-[0.875rem] text-admin-ink-soft">
          {adminCopy.siteGlobalContactHint}
        </p>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalEmail}
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => {
              setContactEmail(event.target.value);
            }}
            placeholder={adminCopy.siteGlobalEmailPlaceholder}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalPhone}
          <input
            type="tel"
            value={contactPhone}
            onChange={(event) => {
              setContactPhone(event.target.value);
            }}
            placeholder={adminCopy.siteGlobalPhonePlaceholder}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalAddress}
          <textarea
            value={contactAddress}
            onChange={(event) => {
              setContactAddress(event.target.value);
            }}
            rows={3}
            placeholder={adminCopy.siteGlobalAddressPlaceholder}
            className="border border-admin-line bg-admin-input px-3 py-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
      </div>

      <div className="admin-panel grid max-w-2xl gap-5 p-5 md:p-6">
        <p className="admin-panel-kicker">{adminCopy.siteGlobalSocial}</p>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalInstagram}
          <input
            value={instagram}
            onChange={(event) => {
              setInstagram(event.target.value);
            }}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
        <label className="flex flex-col gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-admin-ink-soft">
          {adminCopy.siteGlobalPinterest}
          <input
            value={pinterest}
            onChange={(event) => {
              setPinterest(event.target.value);
            }}
            className="min-h-11 border border-admin-line bg-admin-input px-3 text-[0.9375rem] normal-case tracking-normal text-admin-ink"
          />
        </label>
      </div>
    </div>
  );
}
