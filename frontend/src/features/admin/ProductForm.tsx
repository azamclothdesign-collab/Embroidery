"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProductAction } from "@/actions/admin";
import type { Category, Product } from "@/lib/types";
import { BilingualRow, SeoPreview, TextArea, TextField, Toggle, fromMinor, slugify, toMinor } from "./fields";
import { Panel } from "./ui";
import { ImagesField, ZipField, type PackageInfo } from "./uploads";

const FORMATS = ["DST", "EMB"] as const;

export function ProductForm({ product, categories, siteUrl }: { product: Product | null; categories: Category[]; siteUrl: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(product !== null);
  const [v, setV] = useState({
    nameEn: product?.name.en ?? "",
    nameUr: product?.name.ur ?? "",
    slug: product?.slug ?? "",
    categoryId: product?.category.id ?? categories[0]?.id ?? "",
    price: fromMinor(product?.priceMinor ?? null),
    salePrice: fromMinor(product?.salePriceMinor ?? null),
    formats: (() => {
      const allowed = new Set<string>(FORMATS);
      const fromProduct = (product?.formats ?? []).filter((f) => allowed.has(f));
      return fromProduct.length > 0 ? fromProduct : ["DST", "EMB"];
    })(),
    hoopSize: product?.hoopSize ?? "",
    stitchCount: product?.stitchCount ? String(product.stitchCount) : "",
    descriptionEn: product?.description.en ?? "",
    descriptionUr: product?.description.ur ?? "",
    images: product?.images ?? [],
    status: product?.status ?? "draft",
    isFeatured: product?.isFeatured ?? false,
    seoTitleEn: product?.seoTitle.en ?? "",
    seoTitleUr: product?.seoTitle.ur ?? "",
    seoDescriptionEn: product?.seoDescription.en ?? "",
    seoDescriptionUr: product?.seoDescription.ur ?? "",
  });
  const [pkg, setPkg] = useState<PackageInfo | null>(product?.package ?? null);
  const set = <K extends keyof typeof v>(key: K, value: (typeof v)[K]) => setV((current) => ({ ...current, [key]: value }));

  const save = () => {
    const priceMinor = toMinor(v.price);
    const saleMinor = v.salePrice.trim() === "" ? null : toMinor(v.salePrice);
    const local: Record<string, string> = {};
    if (v.nameEn.trim() === "") local.nameEn = "Required";
    if (priceMinor === null) local.priceMinor = "Enter a price like 2999";
    if (v.salePrice.trim() !== "" && saleMinor === null) local.salePriceMinor = "Enter a valid price";
    if (v.status === "published" && pkg === null) local.packageId = "Upload the ZIP before publishing";
    setErrors(local);
    if (Object.keys(local).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    startTransition(async () => {
      const result = await saveProductAction(product?.id ?? null, {
        slug: v.slug || slugify(v.nameEn),
        categoryId: v.categoryId,
        nameEn: v.nameEn,
        nameUr: v.nameUr,
        descriptionEn: v.descriptionEn,
        descriptionUr: v.descriptionUr,
        priceMinor,
        salePriceMinor: saleMinor,
        formats: v.formats,
        hoopSize: v.hoopSize,
        stitchCount: Number.parseInt(v.stitchCount || "0", 10) || 0,
        images: v.images,
        status: v.status,
        isFeatured: v.isFeatured,
        seoTitleEn: v.seoTitleEn,
        seoTitleUr: v.seoTitleUr,
        seoDescriptionEn: v.seoDescriptionEn,
        seoDescriptionUr: v.seoDescriptionUr,
        packageId: pkg?.id ?? null,
      });
      if (!result.ok) {
        setErrors(result.fields ?? {});
        toast.error(result.message);
        return;
      }
      toast.success("Design saved");
      if (product === null) router.replace(`/admin/products/${(result.data as { id: string }).id}`);
      else router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 xl:grid-cols-[1fr_360px]"
    >
      <div className="space-y-6">
        <Panel title="Details">
          <div className="space-y-4">
            <BilingualRow>
              <TextField
                id="nameEn"
                label="Name (English)"
                required
                value={v.nameEn}
                maxLength={160}
                error={errors.nameEn}
                onChange={(value) => {
                  set("nameEn", value);
                  if (!slugTouched) set("slug", slugify(value));
                }}
              />
              <TextField id="nameUr" label="Name (Urdu)" dir="rtl" value={v.nameUr} maxLength={160} onChange={(value) => set("nameUr", value)} />
            </BilingualRow>
            <TextField
              id="slug"
              label="URL slug"
              dir="ltr"
              value={v.slug}
              error={errors.slug}
              help={`${siteUrl}/en/d/${v.slug || "…"}`}
              onChange={(value) => {
                setSlugTouched(true);
                set("slug", slugify(value));
              }}
            />
            <BilingualRow>
              <TextArea id="descriptionEn" label="Description (English)" value={v.descriptionEn} rows={6} maxLength={5000} onChange={(value) => set("descriptionEn", value)} help="Use ## for headings and - for bullet points." />
              <TextArea id="descriptionUr" label="Description (Urdu)" dir="rtl" value={v.descriptionUr} rows={6} maxLength={5000} onChange={(value) => set("descriptionUr", value)} />
            </BilingualRow>
          </div>
        </Panel>

        <Panel title="Media and file">
          <div className="space-y-6">
            <ImagesField value={v.images} onChange={(images) => set("images", images)} />
            <ZipField value={pkg} onChange={setPkg} error={errors.packageId} />
          </div>
        </Panel>

        <Panel title="Search engines and AI answers" description="Leave empty to generate from the name, formats and price automatically.">
          <div className="space-y-4">
            <BilingualRow>
              <TextField id="seoTitleEn" label="SEO title (English)" value={v.seoTitleEn} maxLength={70} onChange={(value) => set("seoTitleEn", value)} />
              <TextField id="seoTitleUr" label="SEO title (Urdu)" dir="rtl" value={v.seoTitleUr} maxLength={70} onChange={(value) => set("seoTitleUr", value)} />
            </BilingualRow>
            <BilingualRow>
              <TextArea id="seoDescriptionEn" label="Meta description (English)" rows={3} value={v.seoDescriptionEn} maxLength={170} onChange={(value) => set("seoDescriptionEn", value)} />
              <TextArea id="seoDescriptionUr" label="Meta description (Urdu)" dir="rtl" rows={3} value={v.seoDescriptionUr} maxLength={170} onChange={(value) => set("seoDescriptionUr", value)} />
            </BilingualRow>
            <SeoPreview title={v.seoTitleEn || v.nameEn} description={v.seoDescriptionEn || `${v.nameEn} machine embroidery design in ${v.formats.join(", ")}. Instant ZIP download.`} url={`${siteUrl}/en/d/${v.slug}`} />
          </div>
        </Panel>
      </div>

      <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
        <Panel title="Publishing">
          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="field-label">Status</label>
              <select id="status" className="field" value={v.status} onChange={(e) => set("status", e.target.value as typeof v.status)}>
                <option value="draft">Draft — hidden</option>
                <option value="published">Published — visible in store</option>
                <option value="archived">Archived — hidden, old orders still download</option>
              </select>
            </div>
            <Toggle id="isFeatured" label="Featured" help="Highlight on the home page" checked={v.isFeatured} onChange={(value) => set("isFeatured", value)} />
            <button type="submit" className="btn btn-primary w-full" disabled={pending}>
              {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              Save design
            </button>
          </div>
        </Panel>

        <Panel title="Pricing and category">
          <div className="space-y-4">
            <div>
              <label htmlFor="categoryId" className="field-label">Category</label>
              <select id="categoryId" className="field" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name.en}</option>)}
              </select>
            </div>
            <TextField id="price" label="Price" prefix="Rs" required value={v.price} error={errors.priceMinor} onChange={(value) => set("price", value)} dir="ltr" />
            <TextField id="salePrice" label="Sale price" prefix="Rs" value={v.salePrice} error={errors.salePriceMinor} help="Optional. Must be lower than the price." onChange={(value) => set("salePrice", value)} dir="ltr" />
          </div>
        </Panel>

        <Panel title="File details">
          <fieldset>
            <legend className="field-label">Formats in the ZIP</legend>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((format) => (
                <label key={format} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold has-[:checked]:border-ink has-[:checked]:bg-sand">
                  <input
                    type="checkbox"
                    className="accent-ink"
                    checked={v.formats.includes(format)}
                    onChange={(e) => set("formats", e.target.checked ? [...v.formats, format] : v.formats.filter((f) => f !== format))}
                  />
                  {format}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TextField id="hoopSize" label="Hoop size" value={v.hoopSize} placeholder={'5 × 7"'} onChange={(value) => set("hoopSize", value)} />
            <TextField id="stitchCount" label="Stitches" type="number" value={v.stitchCount} onChange={(value) => set("stitchCount", value.replaceAll(/\D/g, ""))} dir="ltr" />
          </div>
        </Panel>
      </div>
    </form>
  );
}
