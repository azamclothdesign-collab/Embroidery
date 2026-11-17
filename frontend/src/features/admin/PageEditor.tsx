"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { savePageAction } from "@/actions/admin";
import type { CmsPage } from "@/lib/types";
import { BilingualRow, TextArea, TextField, slugify } from "./fields";
import { Panel } from "./ui";
import { useSave } from "./useSave";

export function PageEditor({ page, siteUrl }: { page: CmsPage | null; siteUrl: string }) {
  const router = useRouter();
  const { save, pending } = useSave();
  const [v, setV] = useState({
    slug: page?.slug ?? "",
    titleEn: page?.title.en ?? "",
    titleUr: page?.title.ur ?? "",
    bodyEn: page?.body.en ?? "",
    bodyUr: page?.body.ur ?? "",
    seoDescriptionEn: page?.seoDescription.en ?? "",
    seoDescriptionUr: page?.seoDescription.ur ?? "",
  });
  const set = <K extends keyof typeof v>(key: K, value: string) => setV((c) => ({ ...c, [key]: value }));
  const slug = v.slug || slugify(v.titleEn);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => savePageAction(page?.slug ?? slug, { ...v, slug }), "Page saved", (data) => {
          const saved = (data as { slug: string }).slug;
          if (saved !== page?.slug) router.replace(`/admin/pages/${saved}`);
        });
      }}
    >
      <Panel title="Page">
        <div className="space-y-4">
          <BilingualRow>
            <TextField id="titleEn" label="Title (English)" required maxLength={120} value={v.titleEn} onChange={(x) => set("titleEn", x)} />
            <TextField id="titleUr" label="Title (Urdu)" dir="rtl" maxLength={120} value={v.titleUr} onChange={(x) => set("titleUr", x)} />
          </BilingualRow>
          <TextField id="slug" label="URL slug" dir="ltr" value={v.slug} help={`${siteUrl}/en/p/${slug || "…"}`} onChange={(x) => set("slug", slugify(x))} />
          <BilingualRow>
            <TextArea id="bodyEn" label="Content (English)" rows={16} value={v.bodyEn} onChange={(x) => set("bodyEn", x)} help="Blank line = new paragraph · ## Heading · - bullet · **bold** · [link](https://…)" />
            <TextArea id="bodyUr" label="Content (Urdu)" dir="rtl" rows={16} value={v.bodyUr} onChange={(x) => set("bodyUr", x)} />
          </BilingualRow>
          <BilingualRow>
            <TextArea id="seoEn" label="Meta description (English)" rows={2} maxLength={170} value={v.seoDescriptionEn} onChange={(x) => set("seoDescriptionEn", x)} />
            <TextArea id="seoUr" label="Meta description (Urdu)" dir="rtl" rows={2} maxLength={170} value={v.seoDescriptionUr} onChange={(x) => set("seoDescriptionUr", x)} />
          </BilingualRow>
        </div>
        <button type="submit" className="btn btn-primary mt-5" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Save page
        </button>
      </Panel>
    </form>
  );
}
