"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminCopy } from "@/constants/adminCopy";
import { adminLoginHref } from "@/constants/adminNav";
import { notifyAdminAuthUpdated } from "@/lib/session/adminAuth";
import { logoutAdminAction } from "@/server/actions/adminAuthActions";
import { type AdminSessionView } from "@/types/api/auth";

type AdminSecurityPageProps = {
  locale: string;
  session: AdminSessionView | null;
};

const controls = [
  adminCopy.securityControlAuth,
  adminCopy.securityControl2fa,
  adminCopy.securityControlSession,
  adminCopy.securityControlDownload,
  adminCopy.securityControlAudit,
] as const;

export function AdminSecurityPage({
  locale,
  session,
}: AdminSecurityPageProps) {
  const router = useRouter();
  const [dangerOpen, setDangerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const completedControls = session === null ? 0 : 1;
  const scorePercent = Math.round(
    (completedControls / controls.length) * 100,
  );
  const displayName =
    session === null
      ? adminCopy.emDash
      : session.email.split("@")[0] ?? adminCopy.emDash;
  const displayEmail = session?.email ?? adminCopy.emDash;

  const signOutAll = () => {
    setDangerOpen(false);
    startTransition(async () => {
      await logoutAdminAction();
      notifyAdminAuthUpdated();
      router.replace(`/${locale}${adminLoginHref}`);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.securityTitle}
        body={adminCopy.securityBody}
        actions={
          <p className="text-[0.875rem] text-ink-soft">
            ● {adminCopy.securityStatusLive}
          </p>
        }
      />

      <section className="rounded-2xl border border-line bg-surface px-6 py-10 text-center">
        <p className="text-meta uppercase tracking-[0.18em] text-ink-soft">
          {adminCopy.securityScoreLabel}
        </p>
        <p className="mt-4 text-[3rem] font-semibold tracking-tight text-ink">
          {scorePercent}
        </p>
        <p className="mt-2 text-lg font-medium text-ink">
          {adminCopy.securityScoreValue}
        </p>
        <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-paper">
          <div
            className={
              completedControls === 0 ? "h-full w-0 bg-accent" : "h-full w-1/5 bg-accent"
            }
          />
        </div>
        <p className="mx-auto mt-4 max-w-xl text-[0.875rem] leading-6 text-ink-soft">
          {adminCopy.securityScoreHint}
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {adminCopy.securityAccount}
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
              {adminCopy.securityName}
            </dt>
            <dd className="mt-2 text-[0.9375rem] text-ink">
              {displayName}
            </dd>
          </div>
          <div>
            <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
              {adminCopy.securityEmail}
            </dt>
            <dd className="mt-2 text-[0.9375rem] text-ink">
              {displayEmail}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-meta uppercase tracking-[0.14em] text-ink-soft">
              {adminCopy.securityPassword}
            </dt>
            <dd className="mt-2 text-[0.9375rem] text-ink-soft">
              {adminCopy.securityPasswordPending}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-70"
        >
          {adminCopy.securityChangePassword}
        </button>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {adminCopy.security2fa}
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-7 text-ink-soft">
          {adminCopy.security2faPending}
        </p>
        <button
          type="button"
          disabled
          className="mt-6 inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-70"
        >
          {adminCopy.security2faEnable}
        </button>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {adminCopy.securitySessions}
        </h2>
        <div className="mt-4">
          <AdminEmptyState
            title={adminCopy.securitySessions}
            body={adminCopy.securitySessionsEmpty}
          />
        </div>
        <button
          type="button"
          disabled
          className="mt-4 inline-flex min-h-11 items-center border border-line px-4 text-meta uppercase tracking-[0.14em] text-ink-soft opacity-70"
        >
          {adminCopy.securitySignOutOthers}
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.securityActivity}
          </h2>
          <p className="mt-4 text-[0.9375rem] text-ink-soft">
            {adminCopy.securityActivityEmpty}
          </p>
        </article>
        <article className="rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold tracking-tight">
            {adminCopy.securityAdminActivity}
          </h2>
          <p className="mt-4 text-[0.9375rem] text-ink-soft">
            {adminCopy.securityActivityEmpty}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold tracking-tight">
          {adminCopy.securityControls}
        </h2>
        <ul className="mt-6 flex list-none flex-col gap-3 p-0">
          {controls.map((control) => (
            <li
              key={control}
              className="flex items-center justify-between gap-4 border border-line px-4 py-3 text-[0.9375rem]"
            >
              <span>{control}</span>
              <span className="text-ink-soft">
                {control === adminCopy.securityControlAuth && session !== null
                  ? adminCopy.securityControlActive
                  : adminCopy.securityControlPending}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {adminCopy.securityDanger}
        </h2>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-7 text-ink-soft">
          {adminCopy.securityDangerBody}
        </p>
        <button
          type="button"
          className="mt-6 inline-flex min-h-11 items-center border border-ink px-5 text-meta uppercase tracking-[0.14em] disabled:opacity-70"
          disabled={isPending}
          onClick={() => {
            setDangerOpen(true);
          }}
        >
          {adminCopy.securityDangerAction}
        </button>
      </section>

      <AdminConfirmDialog
        open={dangerOpen}
        title={adminCopy.securityDangerAction}
        body={adminCopy.securityDangerBody}
        confirmLabel={adminCopy.securityDangerAction}
        pendingNote={adminCopy.securityDangerPending}
        onClose={() => {
          setDangerOpen(false);
        }}
        onConfirm={signOutAll}
      />
    </div>
  );
}
