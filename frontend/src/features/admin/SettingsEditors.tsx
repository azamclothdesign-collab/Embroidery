"use client";

import { Loader2, MailCheck, Save } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSettingAction, saveSmtpAction, testSmtpAction } from "@/actions/admin";
import type { Storefront } from "@/lib/types";
import { BilingualRow, TextField, Toggle } from "./fields";
import { Panel } from "./ui";
import { ImagesField } from "./uploads";
import { useSave } from "./useSave";

export function StoreEditor({ initial }: { initial: Storefront["store"] }) {
  const [v, setV] = useState(initial);
  const { save, pending } = useSave();
  const loc = (key: "name" | "tagline" | "address", lang: "en" | "ur", value: string) => setV((c) => ({ ...c, [key]: { ...c[key], [lang]: value } }));
  const social = (key: keyof Storefront["store"]["social"], value: string) => setV((c) => ({ ...c, social: { ...c.social, [key]: value } }));

  return (
    <Panel title="Store details" description="Shown in the header, footer, emails and structured data.">
      <div className="space-y-4">
        <BilingualRow>
          <TextField id="name-en" label="Store name (English)" required maxLength={60} value={v.name.en} onChange={(x) => loc("name", "en", x)} />
          <TextField id="name-ur" label="Store name (Urdu)" dir="rtl" maxLength={60} value={v.name.ur} onChange={(x) => loc("name", "ur", x)} />
        </BilingualRow>
        <BilingualRow>
          <TextField id="tag-en" label="Tagline (English)" maxLength={120} value={v.tagline.en} onChange={(x) => loc("tagline", "en", x)} />
          <TextField id="tag-ur" label="Tagline (Urdu)" dir="rtl" maxLength={120} value={v.tagline.ur} onChange={(x) => loc("tagline", "ur", x)} />
        </BilingualRow>
        <div className="grid gap-4 md:grid-cols-3">
          <TextField id="email" label="Support email" type="email" dir="ltr" value={v.email} onChange={(x) => setV((c) => ({ ...c, email: x }))} help="Contact form messages are sent here." />
          <TextField id="phone" label="Phone" dir="ltr" value={v.phone} onChange={(x) => setV((c) => ({ ...c, phone: x }))} />
          <TextField id="whatsapp" label="WhatsApp number" dir="ltr" value={v.whatsapp} onChange={(x) => setV((c) => ({ ...c, whatsapp: x }))} help="Shows the green floating WhatsApp button on the storefront. Leave blank to hide it." />
        </div>
        <BilingualRow>
          <TextField id="addr-en" label="Address (English)" value={v.address.en} onChange={(x) => loc("address", "en", x)} />
          <TextField id="addr-ur" label="Address (Urdu)" dir="rtl" value={v.address.ur} onChange={(x) => loc("address", "ur", x)} />
        </BilingualRow>
        <div className="grid gap-4 md:grid-cols-2">
          {(["facebook", "instagram", "youtube", "tiktok"] as const).map((key) => (
            <TextField key={key} id={`social-${key}`} label={`${key[0]?.toUpperCase()}${key.slice(1)} URL`} dir="ltr" placeholder="https://" value={v.social[key]} onChange={(x) => social(key, x)} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="dl-limit" label="Downloads per design" type="number" dir="ltr" value={String(v.downloadLimit)} onChange={(x) => setV((c) => ({ ...c, downloadLimit: Math.min(100, Math.max(1, Number.parseInt(x || "1", 10) || 1)) }))} />
          <TextField id="access-days" label="Order link valid for (days)" type="number" dir="ltr" value={String(v.accessDays)} onChange={(x) => setV((c) => ({ ...c, accessDays: Math.min(365, Math.max(1, Number.parseInt(x || "1", 10) || 1)) }))} />
        </div>
        <div className="max-w-xs">
          <ImagesField label="Logo (square)" max={1} value={v.logo ? [v.logo] : []} onChange={(images) => setV((c) => ({ ...c, logo: images[0] ?? "" }))} />
        </div>
      </div>
      <button type="button" className="btn btn-primary mt-5" disabled={pending} onClick={() => save(() => saveSettingAction("store", v), "Store details saved")}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Save store details
      </button>
    </Panel>
  );
}

type Smtp = { host: string; port: number; secure: boolean; user: string; from: string; passSet: boolean };

export function SmtpEditor({ initial }: { initial: Smtp }) {
  const [v, setV] = useState({ host: initial.host, port: initial.port, secure: initial.secure, user: initial.user, from: initial.from, pass: "" });
  const { save, pending } = useSave();
  const [testing, startTest] = useTransition();
  return (
    <Panel title="Email (SMTP)" description="Used for order emails, download links and password resets. Hostinger: smtp.hostinger.com, port 465 with SSL.">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_140px]">
          <TextField id="smtp-host" label="SMTP host" dir="ltr" value={v.host} onChange={(x) => setV((c) => ({ ...c, host: x }))} />
          <TextField id="smtp-port" label="Port" type="number" dir="ltr" value={String(v.port)} onChange={(x) => setV((c) => ({ ...c, port: Number.parseInt(x || "587", 10) || 587 }))} />
        </div>
        <Toggle id="smtp-secure" label="Use SSL/TLS" help="On for port 465; off for 587 (STARTTLS)." checked={v.secure} onChange={(x) => setV((c) => ({ ...c, secure: x }))} />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="smtp-user" label="Username" dir="ltr" value={v.user} onChange={(x) => setV((c) => ({ ...c, user: x }))} />
          <TextField id="smtp-pass" label="Password" type="password" dir="ltr" value={v.pass} placeholder={initial.passSet ? "•••••••• saved — leave empty to keep" : ""} onChange={(x) => setV((c) => ({ ...c, pass: x }))} />
        </div>
        <TextField id="smtp-from" label="From address" dir="ltr" placeholder='"Chand Designer" <orders@embdesigens.com>' value={v.from} onChange={(x) => setV((c) => ({ ...c, from: x }))} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => save(() => saveSmtpAction(v), "Email settings saved", () => setV((c) => ({ ...c, pass: "" })))}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Save
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={testing}
          onClick={() =>
            startTest(async () => {
              const result = await testSmtpAction();
              if (!result.ok) return void toast.error(result.message);
              const data = result.data as { ok: boolean; message: string };
              if (data.ok) toast.success(data.message);
              else toast.error(data.message);
            })
          }
        >
          {testing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <MailCheck className="size-4" aria-hidden />} Send test email to me
        </button>
      </div>
    </Panel>
  );
}
