"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy } from "@/constants/adminCopy";
import { updateSitePaymentsAction } from "@/server/actions/adminCatalogActions";
import { type SitePaymentsSettings } from "@/types/api/siteSettings";

type AdminPaymentsPageProps = {
  locale: string;
  initialSettings: SitePaymentsSettings;
};

export function AdminPaymentsPage({
  locale,
  initialSettings,
}: AdminPaymentsPageProps) {
  const [isPending, startTransition] = useTransition();
  const [gatewayEnabled, setGatewayEnabled] = useState(
    initialSettings.gatewayEnabled,
  );
  const [mode, setMode] = useState<"sandbox" | "live">(initialSettings.mode);
  const [merchantId, setMerchantId] = useState(initialSettings.merchantId);
  const [securedKey, setSecuredKey] = useState("");
  const [merchantName, setMerchantName] = useState(initialSettings.merchantName);
  const [tokenUrl, setTokenUrl] = useState(initialSettings.tokenUrl);
  const [checkoutUrl, setCheckoutUrl] = useState(initialSettings.checkoutUrl);
  const [successPath, setSuccessPath] = useState(initialSettings.successPath);
  const [failurePath, setFailurePath] = useState(initialSettings.failurePath);
  const [hasSecuredKey, setHasSecuredKey] = useState(
    initialSettings.hasSecuredKey === true,
  );
  const [saveLabel, setSaveLabel] = useState<string>(adminCopy.settingsSave);
  const [toast, setToast] = useState<string | null>(null);

  const handleSave = () => {
    setSaveLabel(adminCopy.productsSaving);

    startTransition(async () => {
      const result = await updateSitePaymentsAction({
        gatewayEnabled,
        provider: "payfast",
        mode,
        merchantId: merchantId.trim(),
        securedKey: securedKey.trim(),
        merchantName: merchantName.trim() || "Designer",
        tokenUrl: tokenUrl.trim(),
        checkoutUrl: checkoutUrl.trim(),
        successPath: successPath.trim() || "/checkout/payfast/success",
        failurePath: failurePath.trim() || "/checkout/payfast/failure",
      });

      if (!result.ok) {
        setSaveLabel(adminCopy.settingsSave);
        setToast(result.error);
        return;
      }

      setHasSecuredKey(result.data.hasSecuredKey === true);
      setSecuredKey("");
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
        title={adminCopy.paymentsTitle}
        body={adminCopy.paymentsBody}
        actions={
          <Link
            href={`/${locale}/admin/settings`}
            className="admin-link-ghost"
          >
            Back to Settings
          </Link>
        }
      />

      {toast === null ? null : (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[0.875rem] text-ink-soft">
          {toast}
        </p>
      )}

      <section className="flex flex-col gap-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-meta uppercase tracking-[0.14em] text-ink-soft">
          {adminCopy.settingsSectionPayments}
        </h2>

        <label className="flex min-h-11 items-center gap-3 text-[0.875rem] text-ink">
          <input
            type="checkbox"
            checked={gatewayEnabled}
            onChange={(event) => {
              setGatewayEnabled(event.target.checked);
            }}
          />
          {adminCopy.paymentsEnabled}
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsMode}
          <select
            value={mode}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setMode(event.target.value === "live" ? "live" : "sandbox");
            }}
          >
            <option value="sandbox">{adminCopy.paymentsModeSandbox}</option>
            <option value="live">{adminCopy.paymentsModeLive}</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsMerchantId}
          <input
            type="text"
            value={merchantId}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setMerchantId(event.target.value);
            }}
          />
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsMerchantName}
          <input
            type="text"
            value={merchantName}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setMerchantName(event.target.value);
            }}
          />
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsSecuredKey}
          <input
            type="password"
            value={securedKey}
            autoComplete="new-password"
            placeholder={
              hasSecuredKey
                ? adminCopy.paymentsSecuredKeyHint
                : "Paste PayFast secured key"
            }
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setSecuredKey(event.target.value);
            }}
          />
          <span className="text-meta text-ink-soft">
            {hasSecuredKey
              ? adminCopy.paymentsHasKey
              : adminCopy.paymentsNoKey}
          </span>
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsTokenUrl}
          <input
            type="url"
            value={tokenUrl}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setTokenUrl(event.target.value);
            }}
          />
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsCheckoutUrl}
          <input
            type="url"
            value={checkoutUrl}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setCheckoutUrl(event.target.value);
            }}
          />
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsSuccessPath}
          <input
            type="text"
            value={successPath}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setSuccessPath(event.target.value);
            }}
          />
        </label>

        <label className="flex flex-col gap-2 text-[0.875rem] text-ink">
          {adminCopy.paymentsFailurePath}
          <input
            type="text"
            value={failurePath}
            className="min-h-11 border border-line bg-paper px-3 text-body text-ink"
            onChange={(event) => {
              setFailurePath(event.target.value);
            }}
          />
        </label>

        <button
          type="button"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper disabled:opacity-60"
          onClick={handleSave}
        >
          {saveLabel}
        </button>
      </section>
    </div>
  );
}
