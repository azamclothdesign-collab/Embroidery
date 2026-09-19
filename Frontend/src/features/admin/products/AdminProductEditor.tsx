"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import {
  formatShopPrice,
  shopCategoryChips,
  type ShopProduct,
} from "@/constants/shopCatalog";
import {
  createProductAction,
  updateProductAction,
  uploadAdminPackageAction,
} from "@/server/actions/adminCatalogActions";
import { type CategoryRecord } from "@/types/api/product";

type AdminProductEditorProps = {
  locale: string;
  mode: "create" | "edit";
  product?: ShopProduct | undefined;
  categories: CategoryRecord[];
  initialSection?: string | undefined;
};

const editorSections = [
  adminCopy.productsSectionBasic,
  adminCopy.productsSectionPricing,
  adminCopy.productsSectionCategory,
  adminCopy.productsSectionImages,
  adminCopy.productsSectionFiles,
  adminCopy.productsSectionSpecs,
  adminCopy.productsSectionCompat,
  adminCopy.productsSectionGuide,
  adminCopy.productsSectionLicense,
  adminCopy.productsSectionSeo,
  adminCopy.productsSectionPublish,
] as const;

function resolveInitialSection(initialSection: string | undefined): string {
  if (initialSection === "files") {
    return adminCopy.productsSectionFiles;
  }

  return adminCopy.productsSectionBasic;
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminProductEditor({
  locale,
  mode,
  product,
  categories,
  initialSection,
}: AdminProductEditorProps) {
  const localeRoot = `/${locale}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [openSection, setOpenSection] = useState<string>(
    resolveInitialSection(initialSection),
  );
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product === undefined ? "" : (product.priceCents / 100).toFixed(2),
  );
  const categoryOptions =
    categories.length > 0
      ? categories.map((category) => ({
          id: category.id,
          label: category.label,
        }))
      : shopCategoryChips
          .filter((chip) => chip.id !== "all")
          .map((chip) => ({ id: chip.id, label: chip.label }));
  const [category, setCategory] = useState<string>(
    product?.categoryId ?? categoryOptions[0]?.id ?? "",
  );
  const [imageSrc, setImageSrc] = useState(product?.imageSrc ?? "");
  const [imageAlt, setImageAlt] = useState(product?.imageAlt ?? "");
  const [stitchedImageSrc, setStitchedImageSrc] = useState(
    product?.stitchedImageSrc ?? "",
  );
  const [stitchedImageAlt, setStitchedImageAlt] = useState(
    product?.stitchedImageAlt ?? "",
  );
  const [hoopSize, setHoopSize] = useState(product?.hoopSize ?? '4 × 4"');
  const [stitchCount, setStitchCount] = useState(
    product === undefined ? "" : String(product.stitchCount),
  );
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [rating, setRating] = useState(
    product === undefined ? "5" : String(product.rating),
  );
  const [packagePath, setPackagePath] = useState(product?.packagePath ?? "");
  const [packageFileName, setPackageFileName] = useState(
    product?.packageFileName ?? "",
  );
  const [packageUploading, setPackageUploading] = useState(false);
  const packageInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(product?.isVisible !== false);
  const [saveLabel, setSaveLabel] = useState<string>(adminCopy.productsSave);
  const [toast, setToast] = useState<string | null>(null);

  const onUploadPackage = (fileList: FileList | null) => {
    const file = fileList?.[0];

    if (file === undefined) {
      return;
    }

    setPackageUploading(true);
    setToast(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadAdminPackageAction(formData);
      setPackageUploading(false);

      if (!result.ok) {
        setToast(adminCopy.productsPackageUploadFailed);
        return;
      }

      setPackagePath(result.data.packagePath);
      setPackageFileName(result.data.packageFileName);
      setToast(adminCopy.productsPackageReady);
    });
  };

  if (mode === "edit" && product === undefined) {
    return (
      <AdminEmptyState
        title={adminCopy.productsTitle}
        body={adminCopy.productsNotFound}
        action={
          <Link
            href={`${localeRoot}/admin/products`}
            className="inline-flex min-h-11 items-center text-meta uppercase tracking-[0.14em] underline-offset-4 hover:underline"
          >
            {adminCopy.productsTitle}
          </Link>
        }
      />
    );
  }

  const onSave = () => {
    const trimmedName = name.trim();
    const trimmedImageSrc = imageSrc.trim();
    const parsedPrice = Number.parseFloat(price);
    const priceCents = Number.isFinite(parsedPrice)
      ? Math.round(parsedPrice * 100)
      : product?.priceCents ?? 0;
    const slug =
      mode === "edit" && product !== undefined
        ? product.slug
        : toSlug(trimmedName);
    const parsedStitchCount = Number.parseInt(stitchCount, 10);
    const parsedRating = Number.parseFloat(rating);

    if (trimmedName.length === 0 || slug.length === 0) {
      setToast("Name is required.");
      return;
    }

    if (trimmedImageSrc.length === 0) {
      setToast(adminCopy.productsImageRequired);
      return;
    }

    if (packagePath.trim().length === 0) {
      setToast(adminCopy.productsPackageRequired);
      return;
    }

    const input = {
      slug,
      pdpSlug: product?.pdpSlug ?? slug,
      name: trimmedName,
      categoryId: category,
      rating: Number.isFinite(parsedRating) ? parsedRating : 5,
      formats: [] as string[],
      priceCents,
      hoopSize: hoopSize.trim().length > 0 ? hoopSize.trim() : '4 × 4"',
      stitchCount: Number.isFinite(parsedStitchCount) ? parsedStitchCount : 0,
      badge: badge.trim(),
      imageSrc: trimmedImageSrc,
      imageAlt:
        imageAlt.trim().length > 0 ? imageAlt.trim() : trimmedName,
      stitchedImageSrc:
        stitchedImageSrc.trim().length > 0
          ? stitchedImageSrc.trim()
          : undefined,
      stitchedImageAlt:
        stitchedImageAlt.trim().length > 0
          ? stitchedImageAlt.trim()
          : undefined,
      description:
        description.trim().length > 0 ? description.trim() : undefined,
      packagePath: packagePath.trim(),
      packageFileName:
        packageFileName.trim().length > 0
          ? packageFileName.trim()
          : `${slug}.zip`,
      isVisible,
    };

    setSaveLabel(adminCopy.productsSaving);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductAction(input)
          : await updateProductAction(slug, input);

      if (!result.ok) {
        setSaveLabel(adminCopy.productsSave);
        const message =
          result.error === "conflict"
            ? adminCopy.productsNameTaken
            : result.error.includes("name already exists")
              ? adminCopy.productsNameTaken
              : result.error;
        setToast(message);
        return;
      }

      setSaveLabel(adminCopy.productsSaved);
      setToast(adminCopy.productsSavePending);
      router.push(`${localeRoot}/admin/products`);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={
          mode === "create"
            ? adminCopy.productsCreateTitle
            : adminCopy.productsEditorTitle
        }
        body={adminCopy.productsBody}
        actions={
          <button
            type="button"
            className="inline-flex min-h-11 items-center bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper disabled:opacity-70"
            onClick={onSave}
            disabled={isPending}
          >
            {saveLabel}
          </button>
        }
      />

      {toast === null ? null : (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[0.875rem] text-ink-soft">
          {toast}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-3">
          {editorSections.map((section) => {
            const open = openSection === section;

            return (
              <section
                key={section}
                className="rounded-2xl border border-line bg-surface"
              >
                <button
                  type="button"
                  className="flex min-h-14 w-full items-center justify-between px-5 text-left text-[0.9375rem] font-medium"
                  aria-expanded={open}
                  onClick={() => {
                    setOpenSection(open ? "" : section);
                  }}
                >
                  {section}
                  <span aria-hidden="true">{open ? "−" : "+"}</span>
                </button>
                {open ? (
                  <div className="border-t border-line px-5 py-5">
                    {section === adminCopy.productsSectionBasic ? (
                      <div className="flex flex-col gap-4">
                        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                          {adminCopy.productsName}
                          <input
                            value={name}
                            onChange={(event) => {
                              setName(event.target.value);
                            }}
                            className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                          />
                        </label>
                        <label className="flex flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                          {adminCopy.productsDescription}
                          <textarea
                            value={description}
                            onChange={(event) => {
                              setDescription(event.target.value);
                            }}
                            rows={4}
                            className="border border-line bg-paper px-3 py-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                          />
                        </label>
                      </div>
                    ) : null}
                    {section === adminCopy.productsSectionPricing ? (
                      <label className="flex max-w-xs flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                        {adminCopy.productsPrice}
                        <input
                          value={price}
                          onChange={(event) => {
                            setPrice(event.target.value);
                          }}
                          className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                        />
                      </label>
                    ) : null}
                    {section === adminCopy.productsSectionCategory ? (
                      <label className="flex max-w-xs flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                        {adminCopy.productsCategory}
                        <select
                          value={category}
                          onChange={(event) => {
                            setCategory(event.target.value);
                          }}
                          className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                        >
                          {categoryOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    {section === adminCopy.productsSectionImages ? (
                      <div className="flex flex-col gap-6">
                        <AdminImageField
                          label={adminCopy.productsImageSrc}
                          value={imageSrc}
                          altLabel={adminCopy.productsImageAlt}
                          altValue={imageAlt}
                          onChange={setImageSrc}
                          onAltChange={setImageAlt}
                        />
                        <AdminImageField
                          label={adminCopy.productsStitchedSrc}
                          value={stitchedImageSrc}
                          altLabel={adminCopy.productsStitchedAlt}
                          altValue={stitchedImageAlt}
                          onChange={setStitchedImageSrc}
                          onAltChange={setStitchedImageAlt}
                        />
                      </div>
                    ) : null}
                    {section === adminCopy.productsSectionFiles ? (
                      <div className="flex flex-col gap-4">
                        <p className="text-[0.875rem] text-ink-soft">
                          {adminCopy.productsUploadPending}
                        </p>
                        <p className="text-[0.8125rem] text-ink-soft">
                          {adminCopy.productsFormatsHint}
                        </p>
                        <div className="border border-line bg-paper px-4 py-3 text-[0.875rem] text-ink">
                          {adminCopy.productsZipLabel}
                        </div>
                        <p className="text-[0.8125rem] text-ink-soft">
                          {adminCopy.productsPackageHint}
                        </p>
                        <div className="rounded-2xl border border-line bg-paper px-4 py-4">
                          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
                            {adminCopy.productsFileStatus}
                          </p>
                          <p className="mt-2 text-[0.9375rem] text-ink">
                            {packagePath.trim().length > 0
                              ? adminCopy.productsPackageReady
                              : adminCopy.productsPackageMissing}
                          </p>
                          {packageFileName.trim().length > 0 ? (
                            <p className="mt-1 text-[0.8125rem] text-ink-soft">
                              {packageFileName}
                            </p>
                          ) : null}
                        </div>
                        <input
                          ref={packageInputRef}
                          type="file"
                          accept=".zip,application/zip,application/x-zip-compressed"
                          className="sr-only"
                          onChange={(event) => {
                            onUploadPackage(event.target.files);
                            event.target.value = "";
                          }}
                        />
                        <button
                          type="button"
                          className="inline-flex min-h-11 w-fit items-center border border-line bg-paper px-4 text-meta uppercase tracking-[0.14em] text-ink disabled:opacity-70"
                          disabled={packageUploading || isPending}
                          onClick={() => {
                            packageInputRef.current?.click();
                          }}
                        >
                          {packageUploading
                            ? adminCopy.productsPackageUploading
                            : adminCopy.productsUpload}
                        </button>
                        <p className="text-[0.875rem] text-ink-soft">
                          {adminCopy.productsFileMetaPending}
                        </p>
                      </div>
                    ) : null}
                    {section === adminCopy.productsSectionSpecs ? (
                      <div className="flex flex-col gap-4">
                        <label className="flex max-w-xs flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                          {adminCopy.productsHoopSize}
                          <input
                            value={hoopSize}
                            onChange={(event) => {
                              setHoopSize(event.target.value);
                            }}
                            className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                          />
                        </label>
                        <label className="flex max-w-xs flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                          {adminCopy.productsStitchCount}
                          <input
                            value={stitchCount}
                            onChange={(event) => {
                              setStitchCount(event.target.value);
                            }}
                            inputMode="numeric"
                            className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                          />
                        </label>
                        <label className="flex max-w-xs flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                          {adminCopy.productsRating}
                          <input
                            value={rating}
                            onChange={(event) => {
                              setRating(event.target.value);
                            }}
                            inputMode="decimal"
                            className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                          />
                        </label>
                        <label className="flex max-w-xs flex-col gap-2 text-meta uppercase tracking-[0.14em] text-ink-soft">
                          {adminCopy.productsBadge}
                          <input
                            value={badge}
                            onChange={(event) => {
                              setBadge(event.target.value);
                            }}
                            className="min-h-11 border border-line bg-paper px-3 text-[0.9375rem] normal-case tracking-normal text-ink"
                          />
                        </label>
                      </div>
                    ) : null}
                    {section === adminCopy.productsSectionCompat ? (
                      <p className="text-[0.875rem] leading-6 text-ink-soft">
                        {adminCopy.productsCompatHint}
                      </p>
                    ) : null}
                    {section === adminCopy.productsSectionGuide ? (
                      <p className="text-[0.875rem] leading-6 text-ink-soft">
                        {adminCopy.productsGuideHint}
                      </p>
                    ) : null}
                    {section === adminCopy.productsSectionLicense ? (
                      <p className="text-[0.875rem] leading-6 text-ink-soft">
                        {adminCopy.productsLicenseHint}
                      </p>
                    ) : null}
                    {section === adminCopy.productsSectionSeo ? (
                      <p className="text-[0.875rem] leading-6 text-ink-soft">
                        {adminCopy.productsSeoHint}
                      </p>
                    ) : null}
                    {section === adminCopy.productsSectionPublish ? (
                      <div className="flex flex-col gap-4">
                        <label className="flex items-start gap-3 text-[0.9375rem] text-ink">
                          <input
                            type="checkbox"
                            className="mt-1 size-4"
                            checked={isVisible}
                            onChange={(event) => {
                              setIsVisible(event.target.checked);
                            }}
                          />
                          <span>
                            <span className="block font-medium">
                              {adminCopy.productsPublishToggle}
                            </span>
                            <span className="mt-1 block text-[0.875rem] leading-6 text-ink-soft">
                              {adminCopy.productsPublishToggleHint}
                            </span>
                          </span>
                        </label>
                        <p className="text-[0.875rem] leading-6 text-ink-soft">
                          {adminCopy.productsPublishHint}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 xl:sticky xl:top-24">
          <p className="text-meta uppercase tracking-[0.16em] text-ink-soft">
            {adminCopy.productsPreview}
          </p>
          <div className="relative mt-4 aspect-[4/5] overflow-hidden bg-paper">
            {imageSrc.trim().length === 0 ? (
              <div className="flex size-full items-center justify-center text-[0.875rem] text-ink-soft">
                {adminCopy.emDash}
              </div>
            ) : (
              <CoverImage
                src={imageSrc.trim()}
                alt={
                  imageAlt.trim().length > 0
                    ? imageAlt.trim()
                    : name.trim().length > 0
                      ? name.trim()
                      : adminCopy.productsPreview
                }
                sizes="320px"
                className="absolute inset-0 size-full max-w-none object-cover"
              />
            )}
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">
            {name.trim().length > 0 ? name : adminCopy.emDash}
          </h2>
          <p className="mt-2 text-[0.875rem] text-ink-soft">
            {categoryOptions.find((option) => option.id === category)?.label ??
              category}
          </p>
          <p className="mt-3 text-[1.125rem] font-medium text-ink">
            {price.trim().length > 0
              ? `$${price}`
              : product === undefined
                ? adminCopy.emDash
                : formatShopPrice(product.priceCents)}
          </p>
          <p className="mt-2 text-[0.8125rem] text-ink-soft">
            {adminCopy.productsZipLabel}
          </p>
          <p className="mt-4 text-[0.8125rem] text-ink-soft">
            {isVisible
              ? adminCopy.productsStatusLive
              : adminCopy.productsStatusUnpublished}
          </p>
        </aside>
      </div>
    </div>
  );
}
