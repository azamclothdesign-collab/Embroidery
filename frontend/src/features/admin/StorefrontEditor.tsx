"use client";

import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { saveSettingAction } from "@/actions/admin";
import type { Localized, Storefront } from "@/lib/types";
import { BilingualRow, TextArea, TextField, Toggle } from "./fields";
import { Panel } from "./ui";
import { useSave } from "./useSave";

function SaveBar({ pending, onSave, label }: { pending: boolean; onSave: () => void; label: string }) {
  return (
    <button type="button" className="btn btn-primary mt-5" onClick={onSave} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} {label}
    </button>
  );
}

function move<T>(list: T[], index: number, delta: number): T[] {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target] as T, next[index] as T];
  return next;
}

export function HomeEditor({ initial }: { initial: Storefront["home"] }) {
  const [v, setV] = useState(initial);
  const { save, pending } = useSave();
  const loc = (key: "heading" | "text" | "primaryCta" | "secondaryCta", lang: "en" | "ur", value: string) =>
    setV((c) => ({ ...c, [key]: { ...c[key], [lang]: value } }));
  return (
    <Panel title="Home page" description="Header → heading and text (centered) → announcement strip → all categories, then the optional sections below.">
      <div className="space-y-4">
        <BilingualRow>
          <TextField id="h-en" label="Heading (English)" maxLength={120} value={v.heading.en} onChange={(x) => loc("heading", "en", x)} />
          <TextField id="h-ur" label="Heading (Urdu)" dir="rtl" maxLength={120} value={v.heading.ur} onChange={(x) => loc("heading", "ur", x)} />
        </BilingualRow>
        <BilingualRow>
          <TextArea id="t-en" label="Text (English)" rows={3} maxLength={300} value={v.text.en} onChange={(x) => loc("text", "en", x)} />
          <TextArea id="t-ur" label="Text (Urdu)" dir="rtl" rows={3} maxLength={300} value={v.text.ur} onChange={(x) => loc("text", "ur", x)} />
        </BilingualRow>
        <BilingualRow>
          <TextField id="p-en" label="Main button (English)" maxLength={40} value={v.primaryCta.en} onChange={(x) => loc("primaryCta", "en", x)} />
          <TextField id="p-ur" label="Main button (Urdu)" dir="rtl" maxLength={40} value={v.primaryCta.ur} onChange={(x) => loc("primaryCta", "ur", x)} />
        </BilingualRow>
        <BilingualRow>
          <TextField id="s-en" label="Second button (English)" maxLength={40} value={v.secondaryCta.en} onChange={(x) => loc("secondaryCta", "en", x)} />
          <TextField id="s-ur" label="Second button (Urdu)" dir="rtl" maxLength={40} value={v.secondaryCta.ur} onChange={(x) => loc("secondaryCta", "ur", x)} />
        </BilingualRow>
        <div className="grid gap-2 border-t border-line pt-4 md:grid-cols-2">
          <Toggle id="sn" label="New arrivals" checked={v.showNewArrivals} onChange={(x) => setV((c) => ({ ...c, showNewArrivals: x }))} />
          <Toggle id="ss" label="On-sale designs" checked={v.showSale} onChange={(x) => setV((c) => ({ ...c, showSale: x }))} />
          <Toggle id="sh" label="How it works" checked={v.showHowItWorks} onChange={(x) => setV((c) => ({ ...c, showHowItWorks: x }))} />
          <Toggle id="sf" label="Machine formats" checked={v.showFormats} onChange={(x) => setV((c) => ({ ...c, showFormats: x }))} />
          <Toggle id="sq" label="FAQ" checked={v.showFaq} onChange={(x) => setV((c) => ({ ...c, showFaq: x }))} />
        </div>
      </div>
      <SaveBar pending={pending} label="Save home page" onSave={() => save(() => saveSettingAction("home", v), "Home page saved")} />
    </Panel>
  );
}

export function AnnouncementEditor({ initial }: { initial: Storefront["announcement"] }) {
  const [v, setV] = useState(initial);
  const { save, pending } = useSave();
  const update = (index: number, lang: keyof Localized, value: string) =>
    setV((c) => ({ ...c, items: c.items.map((item, i) => (i === index ? { ...item, [lang]: value } : item)) }));
  return (
    <Panel title="Announcement strip" description="A slim scrolling line under the heading — keep each message short (sale, offer, free formats…).">
      <Toggle id="ann-on" label="Show announcement strip" checked={v.enabled} onChange={(x) => setV((c) => ({ ...c, enabled: x }))} />
      <ul className="mt-4 space-y-3">
        {v.items.map((item, index) => (
          <li key={index} className="flex flex-col gap-2 rounded-xl border border-line p-3 md:flex-row md:items-center">
            <input aria-label={`Message ${index + 1} English`} className="field" maxLength={80} value={item.en} onChange={(e) => update(index, "en", e.target.value)} placeholder="English" />
            <input aria-label={`Message ${index + 1} Urdu`} className="field" dir="rtl" maxLength={80} value={item.ur} onChange={(e) => update(index, "ur", e.target.value)} placeholder="اردو" />
            <div className="flex shrink-0 gap-1">
              <button type="button" className="icon-btn" aria-label="Move up" onClick={() => setV((c) => ({ ...c, items: move(c.items, index, -1) }))}><ArrowUp className="size-4" aria-hidden /></button>
              <button type="button" className="icon-btn" aria-label="Move down" onClick={() => setV((c) => ({ ...c, items: move(c.items, index, 1) }))}><ArrowDown className="size-4" aria-hidden /></button>
              <button type="button" className="icon-btn text-danger" aria-label="Remove" onClick={() => setV((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }))}><Trash2 className="size-4" aria-hidden /></button>
            </div>
          </li>
        ))}
      </ul>
      {v.items.length < 10 && (
        <button type="button" className="btn btn-ghost mt-3" onClick={() => setV((c) => ({ ...c, items: [...c.items, { en: "", ur: "" }] }))}>
          <Plus className="size-4" aria-hidden /> Add message
        </button>
      )}
      <div><SaveBar pending={pending} label="Save announcement" onSave={() => save(() => saveSettingAction("announcement", v), "Announcement saved")} /></div>
    </Panel>
  );
}

export function FaqEditor({ initial }: { initial: Storefront["faq"] }) {
  const [items, setItems] = useState(initial.items);
  const { save, pending } = useSave();
  const update = (index: number, part: "q" | "a", lang: keyof Localized, value: string) =>
    setItems((c) => c.map((item, i) => (i === index ? { ...item, [part]: { ...item[part], [lang]: value } } : item)));
  return (
    <Panel title="FAQ" description="Shown on the home page and /faq, and published as FAQ structured data for Google and AI answers. Write direct, factual answers.">
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="rounded-xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">Question {index + 1}</span>
              <div className="flex gap-1">
                <button type="button" className="icon-btn size-9" aria-label="Move up" onClick={() => setItems((c) => move(c, index, -1))}><ArrowUp className="size-4" aria-hidden /></button>
                <button type="button" className="icon-btn size-9" aria-label="Move down" onClick={() => setItems((c) => move(c, index, 1))}><ArrowDown className="size-4" aria-hidden /></button>
                <button type="button" className="icon-btn size-9 text-danger" aria-label="Remove question" onClick={() => setItems((c) => c.filter((_, i) => i !== index))}><Trash2 className="size-4" aria-hidden /></button>
              </div>
            </div>
            <div className="space-y-3">
              <BilingualRow>
                <TextField id={`q-en-${index}`} label="Question (English)" value={item.q.en} onChange={(x) => update(index, "q", "en", x)} />
                <TextField id={`q-ur-${index}`} label="Question (Urdu)" dir="rtl" value={item.q.ur} onChange={(x) => update(index, "q", "ur", x)} />
              </BilingualRow>
              <BilingualRow>
                <TextArea id={`a-en-${index}`} label="Answer (English)" rows={3} value={item.a.en} onChange={(x) => update(index, "a", "en", x)} />
                <TextArea id={`a-ur-${index}`} label="Answer (Urdu)" dir="rtl" rows={3} value={item.a.ur} onChange={(x) => update(index, "a", "ur", x)} />
              </BilingualRow>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-ghost mt-3" onClick={() => setItems((c) => [...c, { q: { en: "", ur: "" }, a: { en: "", ur: "" } }])}>
        <Plus className="size-4" aria-hidden /> Add question
      </button>
      <div><SaveBar pending={pending} label="Save FAQ" onSave={() => save(() => saveSettingAction("faq", { items: items.filter((i) => i.q.en.trim() && i.a.en.trim()) }), "FAQ saved")} /></div>
    </Panel>
  );
}

export function SeoEditor({ initial }: { initial: Storefront["seo"] }) {
  const [v, setV] = useState(initial);
  const { save, pending } = useSave();
  return (
    <Panel title="Default SEO" description="Used on the home page and wherever a page has no description of its own.">
      <div className="space-y-4">
        <TextField id="seo-suffix" label="Title suffix" help='Added after every page title, e.g. "Neckline designs | Chand Designer".' maxLength={60} value={v.titleSuffix} onChange={(x) => setV((c) => ({ ...c, titleSuffix: x }))} />
        <BilingualRow>
          <TextArea id="seo-en" label="Default description (English)" rows={3} maxLength={170} value={v.description.en} onChange={(x) => setV((c) => ({ ...c, description: { ...c.description, en: x } }))} />
          <TextArea id="seo-ur" label="Default description (Urdu)" dir="rtl" rows={3} maxLength={170} value={v.description.ur} onChange={(x) => setV((c) => ({ ...c, description: { ...c.description, ur: x } }))} />
        </BilingualRow>
      </div>
      <SaveBar pending={pending} label="Save SEO" onSave={() => save(() => saveSettingAction("seo", v), "SEO saved")} />
    </Panel>
  );
}
