"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveCategoryAction } from "@/actions/admin";
import type { Category } from "@/lib/types";
import { BilingualRow, SeoPreview, TextArea, TextField, Toggle, slugify } from "./fields";
import { Panel } from "./ui";
import { ImagesField } from "./uploads";

export function CategoryForm({ category, siteUrl }: { category: Category | null; siteUrl: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(category !== null);
  const [v, setV] = useState({
    slug: category?.slug ?? "",
    nameEn: category?.name.en ?? "",
    nameUr: category?.name.ur ?? "",
    introEn: category?.intro.en ?? "",
    introUr: category?.intro.ur ?? "",
    seoTitleEn: category?.seoTitle.en ?? "",
    seoTitleUr: category?.seoTitle.ur ?? "",
    seoDescriptionEn: category?.seoDescription.en ?? "",
    seoDescriptionUr: category?.seoDescription.ur ?? "",
    image: category?.image ?? null,
    sortOrder: category?.sortOrder ?? 0,
    isVisible: category?.isVisible ?? true,
  });
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => setV((current) => ({ ...current, [key]: value }));

  const save = () =>
    startTransition(async () => {
      const result = await saveCategoryAction(category?.id ?? null, { ...v, slug: v.slug || slugify(v.nameEn) });
      if (!result.ok) {
        setErrors(result.fields ?? {});
        return void toast.error(result.message);
      }
      setErrors({});
      toast.success("Category saved");
      if (category === null) router.replace(`/admin/categories/${(result.data as { id: string }).id}`);
      else router.refresh();
    });

  return (
    <form
      className="grid gap-6 xl:grid-cols-[1fr_340px]"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="space-y-6">
        <Panel title="Category">
          <div className="space-y-4">
            <BilingualRow>
              <TextField
                id="nameEn"
                label="Name (English)"
                required
                maxLength={120}
                value={v.nameEn}
                error={errors.nameEn}
                onChange={(value) => {
                  set("nameEn", value);
                  if (!slugTouched) set("slug", slugify(value));
                }}
              />
              <TextField id="nameUr" label="Name (Urdu)" dir="rtl" maxLength={120} value={v.nameUr} onChange={(value) => set("nameUr", value)} />
            </BilingualRow>
            <TextField
              id="slug"
              label="URL slug"
              dir="ltr"
              value={v.slug}
              error={errors.slug}
              help={`${siteUrl}/en/c/${v.slug || "…"}`}
              onChange={(value) => {
                setSlugTouched(true);
                set("slug", slugify(value));
              }}
            />
            <BilingualRow>
              <TextArea id="introEn" label="Intro (English)" rows={3} maxLength={600} value={v.introEn} onChange={(value) => set("introEn", value)} help="1–2 sentences that answer “what is this category?”. Shown on the page and used by Google and AI answers." />
              <TextArea id="introUr" label="Intro (Urdu)" dir="rtl" rows={3} maxLength={600} value={v.introUr} onChange={(value) => set("introUr", value)} />
            </BilingualRow>
          </div>
        </Panel>
        <Panel title="Search engines" description="Optional — a good default is generated from the name and intro.">
          <div className="space-y-4">
            <BilingualRow>
              <TextField id="seoTitleEn" label="SEO title (English)" maxLength={70} value={v.seoTitleEn} onChange={(value) => set("seoTitleEn", value)} />
              <TextField id="seoTitleUr" label="SEO title (Urdu)" dir="rtl" maxLength={70} value={v.seoTitleUr} onChange={(value) => set("seoTitleUr", value)} />
            </BilingualRow>
            <BilingualRow>
              <TextArea id="seoDescriptionEn" label="Meta description (English)" rows={3} maxLength={170} value={v.seoDescriptionEn} onChange={(value) => set("seoDescriptionEn", value)} />
              <TextArea id="seoDescriptionUr" label="Meta description (Urdu)" dir="rtl" rows={3} maxLength={170} value={v.seoDescriptionUr} onChange={(value) => set("seoDescriptionUr", value)} />
            </BilingualRow>
            <SeoPreview title={v.seoTitleEn || v.nameEn} description={v.seoDescriptionEn || v.introEn} url={`${siteUrl}/en/c/${v.slug}`} />
          </div>
        </Panel>
      </div>
      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Visibility">
          <div className="space-y-4">
            <Toggle id="isVisible" label="Show in store" checked={v.isVisible} onChange={(value) => set("isVisible", value)} help="Hidden categories also hide their designs." />
            <TextField id="sortOrder" label="Sort order" type="number" dir="ltr" value={String(v.sortOrder)} onChange={(value) => set("sortOrder", Number.parseInt(value || "0", 10) || 0)} help="Lower numbers appear first." />
            <button type="submit" className="btn btn-primary w-full" disabled={pending}>
              {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              Save category
            </button>
          </div>
        </Panel>
        <Panel title="Image">
          <ImagesField label="Category image" max={1} value={v.image === null ? [] : [v.image]} onChange={(images) => set("image", images[0] ?? null)} />
        </Panel>
      </div>
    </form>
  );
}
