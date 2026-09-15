"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons/CloseIcon";
import { TextButton } from "@/components/TextButton";
import { TextLink } from "@/components/TextLink";
import {
  accountCopy,
  accountCountryOptions,
} from "@/constants/accountCopy";
import {
  accountDownloadsHref,
  accountOrdersHref,
  formatCompletedOrderCount,
  formatOrderDate,
  formatPurchasedDesignCount,
  orderDetailHref,
} from "@/constants/accountNav";
import { formatShopPrice } from "@/constants/shopCatalog";
import { accountForgotHref } from "@/constants/siteNavigation";
import { AccountGuard } from "@/features/account/AccountGuard";
import { AccountScrollMotion } from "@/features/account/AccountScrollMotion";
import { useAccountPreferences } from "@/hooks/useAccountPreferences";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import { useSyncSessionOrderToHistory } from "@/hooks/useSyncSessionOrderToHistory";
import {
  type AccountPreferences,
  clearAccountPreferences,
  writeAccountPreferences,
} from "@/lib/accountPreferences";
import { changePasswordSchema } from "@/schemas/authFormSchema";
import {
  changeAccountPasswordAction,
  updateAccountSettingsAction,
} from "@/server/actions/accountActions";

type AccountSettingsPageProps = {
  locale: string;
};

type SaveState = "idle" | "saving" | "saved";

export function AccountSettingsPage({ locale }: AccountSettingsPageProps) {
  useSyncSessionOrderToHistory();
  const session = useCustomerSession();
  const stored = useAccountPreferences();
  const orders = useOrderHistory();
  const [draft, setDraft] = useState<AccountPreferences>(() => {
    if (session === null) {
      return stored;
    }

    return {
      ...stored,
      firstName: stored.firstName || session.firstName,
      lastName: stored.lastName || session.lastName,
      displayName:
        stored.displayName ||
        session.firstName ||
        [session.firstName, session.lastName].filter(Boolean).join(" "),
    };
  });
  const [seenPrefs, setSeenPrefs] = useState(stored);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [toast, setToast] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordAttempted, setPasswordAttempted] = useState(false);
  const [passwordState, setPasswordState] = useState<
    "idle" | "saving" | "saved" | "invalid"
  >("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  if (stored !== seenPrefs) {
    setSeenPrefs(stored);
    setDraft({
      ...stored,
      firstName: stored.firstName || session?.firstName || "",
      lastName: stored.lastName || session?.lastName || "",
    });
  }

  const recent = orders[0];
  const designCount = orders.reduce((sum, order) => sum + order.lines.length, 0);
  const accountEmail = session?.email ?? recent?.email ?? "";
  const memberSince =
    session !== null ? formatOrderDate(session.signedInAt) : null;
  const displayLabel =
    draft.displayName.trim().length > 0
      ? draft.displayName.trim()
      : [draft.firstName, draft.lastName].filter(Boolean).join(" ").trim() ||
        session?.firstName ||
        accountCopy.profileGuest;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (dialog === null) {
      return;
    }

    if (deleteOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }

      return;
    }

    if (!dialog.open) {
      return;
    }

    const timer = window.setTimeout(() => {
      dialog.close();
    }, 380);

    return () => {
      window.clearTimeout(timer);
    };
  }, [deleteOpen]);

  const onSavePersonal = () => {
    setSaveState("saving");

    void updateAccountSettingsAction({
      firstName: draft.firstName,
      lastName: draft.lastName,
      displayName: draft.displayName,
      country: draft.country,
      preferredFormat: draft.preferredFormat,
      rememberFormat: draft.rememberFormat,
      openDownloadInstructions: draft.openDownloadInstructions,
    }).then((result) => {
      if (!result.ok) {
        setSaveState("idle");
        return;
      }

      writeAccountPreferences(draft);
      setSaveState("saved");
      setToast(accountCopy.changesSaved);
      window.setTimeout(() => {
        setSaveState("idle");
        setToast(null);
      }, 2200);
    });
  };

  const onSavePrefs = () => {
    setSaveState("saving");

    void updateAccountSettingsAction({
      firstName: draft.firstName,
      lastName: draft.lastName,
      displayName: draft.displayName,
      country: draft.country,
      preferredFormat: draft.preferredFormat,
      rememberFormat: draft.rememberFormat,
      openDownloadInstructions: draft.openDownloadInstructions,
    }).then((result) => {
      if (!result.ok) {
        setSaveState("idle");
        return;
      }

      writeAccountPreferences(draft);
      setSaveState("saved");
      setToast(accountCopy.changesSaved);
      window.setTimeout(() => {
        setSaveState("idle");
        setToast(null);
      }, 2200);
    });
  };

  const onUpdatePassword = () => {
    if (session === null) {
      return;
    }

    setPasswordAttempted(true);
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      nextPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      return;
    }

    setPasswordState("saving");

    void changeAccountPasswordAction({
      currentPassword: parsed.data.currentPassword,
      nextPassword: parsed.data.nextPassword,
      confirmPassword: parsed.data.confirmPassword,
    }).then((result) => {
      if (!result.ok) {
        setPasswordState("invalid");
        return;
      }

      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setPasswordAttempted(false);
      setPasswordState("saved");
      setToast(accountCopy.passwordUpdated);
      window.setTimeout(() => {
        setPasswordState("idle");
        setToast(null);
      }, 2200);
    });
  };

  const passwordParsed = changePasswordSchema.safeParse({
    currentPassword,
    nextPassword,
    confirmPassword,
  });
  const passwordFieldError = (path: string): string | null => {
    if (!passwordAttempted || passwordParsed.success) {
      return null;
    }

    const issue = passwordParsed.error.issues.find(
      (item) => item.path[0] === path,
    );
    return issue?.message ?? null;
  };

  const passwordButtonLabel =
    passwordState === "saving"
      ? accountCopy.passwordUpdating
      : passwordState === "saved"
        ? accountCopy.passwordUpdated
        : accountCopy.passwordUpdate;

  const saveLabel =
    saveState === "saving"
      ? accountCopy.saving
      : saveState === "saved"
        ? accountCopy.saved
        : accountCopy.saveChanges;

  return (
    <AccountGuard locale={locale}>
      <AccountScrollMotion>
        <p className="accountHeroCopy text-meta uppercase tracking-[0.22em] text-accent">
          {accountCopy.settingsEyebrow}
        </p>
        <h1 className="accountHeroCopy mt-4 text-title-sm font-medium tracking-tight text-ink md:text-title-md">
          {accountCopy.settingsHeading}
        </h1>
        <p className="accountHeroCopy mt-4 max-w-2xl text-body leading-8 text-ink-soft">
          {accountCopy.settingsBody}
        </p>

        <section className="accountCard mt-12 border border-line bg-surface px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div
              aria-hidden="true"
              className="flex size-16 items-center justify-center border border-line bg-paper text-meta uppercase tracking-[0.14em] text-ink"
            >
              {displayLabel.slice(0, 1) || "G"}
            </div>
            <div>
              <p className="text-h3 font-medium tracking-tight text-ink">{displayLabel}</p>
              <p className="mt-2 text-body text-ink-soft">
                {accountEmail.length > 0 ? accountEmail : accountCopy.noEmail}
              </p>
              <p className="mt-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                {memberSince !== null
                  ? `${accountCopy.profileMemberSince} ${memberSince}`
                  : accountCopy.profileLocal}
              </p>
            </div>
          </div>
        </section>

        <section className="accountReveal mt-14" aria-labelledby="personal-heading">
          <h2 id="personal-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.personalHeading}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
              {accountCopy.firstName}
              <input
                className="min-h-11 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={draft.firstName}
                onChange={(event) => {
                  setDraft({ ...draft, firstName: event.target.value });
                }}
              />
            </label>
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
              {accountCopy.lastName}
              <input
                className="min-h-11 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={draft.lastName}
                onChange={(event) => {
                  setDraft({ ...draft, lastName: event.target.value });
                }}
              />
            </label>
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft sm:col-span-2">
              {accountCopy.displayName}
              <input
                className="min-h-11 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={draft.displayName}
                onChange={(event) => {
                  setDraft({ ...draft, displayName: event.target.value });
                }}
              />
            </label>
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft sm:col-span-2">
              {accountCopy.country}
              <span className="normal-case tracking-normal text-ink-soft/80">
                {accountCopy.countryOptional}
              </span>
              <select
                className="min-h-11 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={draft.country}
                onChange={(event) => {
                  setDraft({ ...draft, country: event.target.value });
                }}
              >
                {accountCountryOptions.map((option) => (
                  <option key={option.value || "none"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-8">
            <TextButton disabled={saveState === "saving"} onClick={onSavePersonal}>
              {saveLabel}
            </TextButton>
          </div>
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="email-heading">
          <h2 id="email-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.emailHeading}
          </h2>
          <p className="mt-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
            {accountCopy.currentEmail}
          </p>
          <p className="mt-3 text-body text-ink">
            {accountEmail.length > 0 ? accountEmail : accountCopy.noEmail}
          </p>
          {accountEmail.length > 0 ? (
            <p className="mt-2 text-meta text-ink-soft">{accountCopy.emailCheckoutNote}</p>
          ) : null}
          <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
            {accountCopy.emailPending}
          </p>
          <button
            type="button"
            disabled
            className="mt-6 min-h-11 border border-line px-5 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-60"
          >
            {accountCopy.changeEmail}
          </button>
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="password-heading">
          <h2 id="password-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.passwordHeading}
          </h2>
          <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
            {accountCopy.passwordBody}
          </p>
          <div className="mt-8 grid max-w-xl gap-5">
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
              {accountCopy.passwordCurrent}
              <input
                type="password"
                autoComplete="current-password"
                className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  if (passwordState === "invalid") {
                    setPasswordState("idle");
                  }
                }}
                aria-invalid={
                  passwordFieldError("currentPassword") !== null ||
                  passwordState === "invalid"
                }
              />
              {passwordFieldError("currentPassword") !== null ||
              passwordState === "invalid" ? (
                <span className="normal-case tracking-normal text-ink">
                  {passwordState === "invalid"
                    ? accountCopy.passwordInvalidCurrent
                    : passwordFieldError("currentPassword")}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
              {accountCopy.passwordNext}
              <input
                type="password"
                autoComplete="new-password"
                className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={nextPassword}
                onChange={(event) => {
                  setNextPassword(event.target.value);
                }}
                aria-invalid={passwordFieldError("nextPassword") !== null}
              />
              {passwordFieldError("nextPassword") !== null ? (
                <span className="normal-case tracking-normal text-ink">
                  {passwordFieldError("nextPassword")}
                </span>
              ) : null}
            </label>
            <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
              {accountCopy.passwordConfirm}
              <input
                type="password"
                autoComplete="new-password"
                className="min-h-12 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                }}
                aria-invalid={passwordFieldError("confirmPassword") !== null}
              />
              {passwordFieldError("confirmPassword") !== null ? (
                <span className="normal-case tracking-normal text-ink">
                  {accountCopy.passwordMismatch}
                </span>
              ) : null}
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <TextButton
                type="button"
                onClick={onUpdatePassword}
                disabled={passwordState === "saving"}
              >
                {passwordButtonLabel}
              </TextButton>
              <TextLink
                href={`/${locale}${accountForgotHref}`}
                tone="ghostOnLight"
              >
                {accountCopy.passwordForgotLink}
              </TextLink>
            </div>
          </div>
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="security-heading">
          <h2 id="security-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.securityHeading}
          </h2>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="border border-line bg-surface px-5 py-5">
              <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                {accountCopy.securityPassword}
              </dt>
              <dd className="mt-2 text-body text-ink">
                {accountCopy.securityProtected}
              </dd>
            </div>
            <div className="border border-line bg-surface px-5 py-5">
              <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                {accountCopy.securityEmail}
              </dt>
              <dd className="mt-2 text-body text-ink">
                {accountCopy.securitySignedIn}
              </dd>
            </div>
            <div className="border border-line bg-surface px-5 py-5">
              <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                {accountCopy.securitySessions}
              </dt>
              <dd className="mt-2 text-body text-ink">
                {accountCopy.securitySessionsCurrent}
              </dd>
            </div>
            <div className="border border-line bg-surface px-5 py-5">
              <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                Last login
              </dt>
              <dd className="mt-2 text-body text-ink">{accountCopy.lastLoginToday}</dd>
            </div>
          </dl>
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="sessions-heading">
          <h2 id="sessions-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.sessionsHeading}
          </h2>
          <p className="mt-4 max-w-xl text-body leading-8 text-ink-soft">
            {accountCopy.sessionsCurrentBody}
          </p>
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="download-prefs-heading">
          <h2
            id="download-prefs-heading"
            className="text-h3 font-medium tracking-tight text-ink"
          >
            {accountCopy.downloadPrefsHeading}
          </h2>
          <fieldset className="mt-8">
            <legend className="text-meta uppercase tracking-[0.14em] text-ink-soft">
              {accountCopy.preferredFormat}
            </legend>
            <ul className="mt-4 flex list-none flex-col gap-3 p-0">
              {(["PES", "DST", "JEF", "all"] as const).map((format) => (
                <li key={format}>
                  <label className="flex min-h-11 items-center gap-3 text-body text-ink">
                    <input
                      type="radio"
                      name="preferred-format"
                      checked={draft.preferredFormat === format}
                      onChange={() => {
                        setDraft({ ...draft, preferredFormat: format });
                      }}
                    />
                    {format === "all" ? accountCopy.formatAll : format}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <ul className="mt-8 flex list-none flex-col gap-3 p-0">
            <li>
              <label className="flex min-h-11 items-center gap-3 text-body text-ink">
                <input
                  type="checkbox"
                  checked={draft.rememberFormat}
                  onChange={(event) => {
                    setDraft({ ...draft, rememberFormat: event.target.checked });
                  }}
                />
                {accountCopy.rememberFormat}
              </label>
            </li>
            <li>
              <label className="flex min-h-11 items-center gap-3 text-body text-ink">
                <input
                  type="checkbox"
                  checked={draft.openDownloadInstructions}
                  onChange={(event) => {
                    setDraft({
                      ...draft,
                      openDownloadInstructions: event.target.checked,
                    });
                  }}
                />
                {accountCopy.openInstructions}
              </label>
            </li>
          </ul>
          <div className="mt-8">
            <TextButton disabled={saveState === "saving"} onClick={onSavePrefs}>
              {saveLabel}
            </TextButton>
          </div>
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="order-info-heading">
          <h2 id="order-info-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.orderInfoHeading}
          </h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-body leading-8 text-ink-soft">{accountCopy.noOrdersYet}</p>
          ) : (
            <>
              <p className="mt-4 text-body text-ink">
                {formatCompletedOrderCount(orders.length)}
              </p>
              <p className="mt-2 text-body text-ink">
                {formatPurchasedDesignCount(designCount)}
              </p>
            </>
          )}
          <div className="mt-6">
            <TextLink href={`/${locale}${accountOrdersHref}`}>
              {accountCopy.viewOrders}
            </TextLink>
          </div>
          {recent !== undefined ? (
            <div className="mt-10 border border-line bg-surface px-5 py-6">
              <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                {accountCopy.recentOrder}
              </p>
              <p className="mt-3 text-body font-medium text-ink">#{recent.id}</p>
              <p className="mt-2 text-meta text-ink-soft">
                {formatOrderDate(recent.createdAt)} · {formatShopPrice(recent.totalCents)} ·{" "}
                {accountCopy.paid}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <TextLink href={`/${locale}${orderDetailHref(recent.id)}`}>
                  {accountCopy.viewOrder}
                </TextLink>
                <TextLink
                  href={`/${locale}${accountDownloadsHref}`}
                  tone="ghostOnLight"
                >
                  {accountCopy.overviewDownloads}
                </TextLink>
              </div>
            </div>
          ) : null}
        </section>

        <section className="accountReveal mt-14 border-t border-line pt-14" aria-labelledby="danger-heading">
          <h2 id="danger-heading" className="text-h3 font-medium tracking-tight text-ink">
            {accountCopy.dangerHeading}
          </h2>
          <p className="mt-6 text-body font-medium text-ink">{accountCopy.deleteHeading}</p>
          <p className="mt-3 max-w-xl text-body leading-8 text-ink-soft">
            {accountCopy.deleteBody}
          </p>
          <button
            type="button"
            className="mt-6 min-h-11 border border-line px-5 text-meta uppercase tracking-[0.14em] text-ink"
            onClick={() => {
              setDeleteConfirm("");
              setDeleteOpen(true);
            }}
          >
            {accountCopy.deleteAccount}
          </button>
        </section>

        {toast !== null ? (
          <p className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 border border-line bg-paper px-5 py-3 text-meta text-ink" role="status">
            {toast}
          </p>
        ) : null}
      </AccountScrollMotion>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className={`dialog-pop m-auto w-[min(28rem,calc(100vw-2rem))] border border-line bg-paper p-6 text-ink${deleteOpen ? " is-open" : ""}`}
        onCancel={(event) => {
          event.preventDefault();
          setDeleteOpen(false);
        }}
        onClose={() => {
          setDeleteOpen(false);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-h3 font-medium">
            {accountCopy.deleteModalHeading}
          </h2>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center"
            aria-label="Close"
            onClick={() => {
              setDeleteOpen(false);
            }}
          >
            <CloseIcon />
          </button>
        </div>
        <p className="mt-4 text-body leading-8 text-ink-soft">
          {accountCopy.deleteModalBody}
        </p>
        <label className="mt-6 flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
          {accountCopy.deleteConfirmLabel}
          <input
            className="min-h-11 border border-line bg-paper px-4 text-body normal-case tracking-normal text-ink"
            value={deleteConfirm}
            onChange={(event) => {
              setDeleteConfirm(event.target.value);
            }}
          />
        </label>
        <div className="mt-8 flex flex-wrap gap-3">
          <TextButton
            tone="ghostOnLight"
            onClick={() => {
              setDeleteOpen(false);
            }}
          >
            {accountCopy.cancel}
          </TextButton>
          <TextButton
            disabled={deleteConfirm !== accountCopy.deleteConfirmWord}
            onClick={() => {
              clearAccountPreferences();
              setDeleteOpen(false);
              setToast(accountCopy.changesSaved);
              window.setTimeout(() => {
                setToast(null);
              }, 2200);
            }}
          >
            {accountCopy.deleteAccount}
          </TextButton>
        </div>
      </dialog>
    </AccountGuard>
  );
}
