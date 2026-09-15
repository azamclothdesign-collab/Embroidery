"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import {
  adminProductEditHref,
  adminProductNewHref,
} from "@/constants/adminNav";
import {
  formatShopPrice,
  shopCategoryChips,
  type ShopProduct,
  shopProductHref,
} from "@/constants/shopCatalog";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/server/actions/adminCatalogActions";
import { type CategoryRecord } from "@/types/api/product";

type AdminProductsPageProps = {
  locale: string;
  products: readonly ShopProduct[];
  categories?: readonly CategoryRecord[];
};

type StatusFilter = "all" | "published" | "draft" | "unpublished" | "file-issue";
type ConfirmAction = "duplicate" | "unpublish" | "delete" | null;

function isProductVisible(product: ShopProduct): boolean {
  return product.isVisible !== false;
}

function resolveCategoryLabel(
  categoryId: ShopProduct["categoryId"],
  categories: readonly CategoryRecord[],
): string {
  const fromApi = categories.find((category) => category.id === categoryId);

  if (fromApi !== undefined) {
    return fromApi.label;
  }

  return (
    shopCategoryChips.find((chip) => chip.id === categoryId)?.label ??
    categoryId
  );
}

function nextCopySlug(base: string, existing: ReadonlySet<string>): string {
  let candidate = `${base}-copy`;
  let index = 2;

  while (existing.has(candidate)) {
    candidate = `${base}-copy-${index}`;
    index += 1;
  }

  return candidate;
}

export function AdminProductsPage({
  locale,
  products,
  categories = [],
}: AdminProductsPageProps) {
  const localeRoot = `/${locale}`;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmProduct, setConfirmProduct] = useState<ShopProduct | null>(
    null,
  );

  const existingSlugs = useMemo(
    () => new Set(products.map((product) => product.slug)),
    [products],
  );

  const publishedCount = products.length;
  const draftsCount = 0;
  const fileIssueCount = 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return products.filter((product) => {
      const visible = isProductVisible(product);
      const hasPackage = product.packagePath !== undefined;

      if (statusFilter === "published" && !visible) {
        return false;
      }

      if (statusFilter === "unpublished" && visible) {
        return false;
      }

      if (statusFilter === "file-issue" && hasPackage) {
        return false;
      }

      if (statusFilter === "draft") {
        return false;
      }

      if (q.length === 0) {
        return true;
      }

      return (
        product.name.toLowerCase().includes(q) ||
        resolveCategoryLabel(product.categoryId, categories)
          .toLowerCase()
          .includes(q)
      );
    });
  }, [products, query, statusFilter, categories]);

  const statusChips: ReadonlyArray<{ id: StatusFilter; label: string }> = [
    { id: "all", label: adminCopy.productsFilterAll },
    { id: "published", label: adminCopy.productsFilterPublished },
    { id: "unpublished", label: adminCopy.productsFilterUnpublished },
    { id: "file-issue", label: adminCopy.productsFilterFileIssue },
  ];

  const closeConfirm = () => {
    setConfirmAction(null);
    setConfirmProduct(null);
  };

  const openConfirm = (action: ConfirmAction, product: ShopProduct) => {
    setOpenMenuSlug(null);
    setConfirmProduct(product);
    setConfirmAction(action);
  };

  const toMutationInput = (
    product: ShopProduct,
    overrides: Partial<{
      slug: string;
      pdpSlug: string;
      name: string;
      isVisible: boolean;
    }> = {},
  ) => ({
    slug: overrides.slug ?? product.slug,
    pdpSlug: overrides.pdpSlug ?? product.pdpSlug,
    name: overrides.name ?? product.name,
    categoryId: product.categoryId,
    rating: product.rating,
    formats: [...product.formats],
    priceCents: product.priceCents,
    hoopSize: product.hoopSize,
    stitchCount: product.stitchCount,
    badge: product.badge,
    imageSrc: product.imageSrc,
    imageAlt: product.imageAlt,
    stitchedImageSrc: product.stitchedImageSrc,
    stitchedImageAlt: product.stitchedImageAlt,
    description: product.description,
    packagePath: product.packagePath,
    packageFileName: product.packageFileName,
    isVisible: overrides.isVisible ?? isProductVisible(product),
  });

  const runDuplicate = () => {
    if (confirmProduct === null) {
      return;
    }

    const product = confirmProduct;
    const slug = nextCopySlug(product.slug, existingSlugs);
    closeConfirm();

    startTransition(async () => {
      const result = await createProductAction(
        toMutationInput(product, {
          slug,
          pdpSlug: slug,
          name: `${product.name} Copy`,
          isVisible: false,
        }),
      );

      if (!result.ok) {
        setToast(result.error || adminCopy.productsActionFailed);
        return;
      }

      setToast(adminCopy.productsDuplicated);
      router.push(`${localeRoot}${adminProductEditHref(result.data.pdpSlug)}`);
      router.refresh();
    });
  };

  const runVisibilityToggle = () => {
    if (confirmProduct === null) {
      return;
    }

    const product = confirmProduct;
    const nextVisible = !isProductVisible(product);
    closeConfirm();

    startTransition(async () => {
      const result = await updateProductAction(
        product.slug,
        toMutationInput(product, { isVisible: nextVisible }),
      );

      if (!result.ok) {
        setToast(result.error || adminCopy.productsActionFailed);
        return;
      }

      router.refresh();
    });
  };

  const runDelete = () => {
    if (confirmProduct === null) {
      return;
    }

    const slug = confirmProduct.slug;
    closeConfirm();

    startTransition(async () => {
      const result = await deleteProductAction(slug);

      if (!result.ok) {
        setToast(result.error || adminCopy.productsActionFailed);
        return;
      }

      router.refresh();
    });
  };

  const confirmIsVisible =
    confirmProduct === null ? true : isProductVisible(confirmProduct);

  const renderMenu = (product: ShopProduct) => (
    <div className="absolute right-0 z-10 mt-1 w-48 rounded-2xl border border-line bg-surface py-2 text-left text-[0.8125rem] shadow-lg lg:right-4">
      <Link
        href={`${localeRoot}${adminProductEditHref(product.pdpSlug)}`}
        className="block px-4 py-2 hover:bg-paper"
        onClick={() => setOpenMenuSlug(null)}
      >
        {adminCopy.productsMenuEdit}
      </Link>
      <Link
        href={shopProductHref(locale, product.slug)}
        className="block px-4 py-2 hover:bg-paper"
        target="_blank"
        rel="noreferrer"
        onClick={() => setOpenMenuSlug(null)}
      >
        {adminCopy.productsMenuPreview}
      </Link>
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
        onClick={() => openConfirm("duplicate", product)}
      >
        {adminCopy.productsMenuDuplicate}
      </button>
      <Link
        href={`${localeRoot}${adminProductEditHref(product.pdpSlug, { section: "files" })}`}
        className="block px-4 py-2 text-ink-soft hover:bg-paper"
        onClick={() => setOpenMenuSlug(null)}
      >
        {adminCopy.productsMenuFiles}
      </Link>
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
        onClick={() => openConfirm("unpublish", product)}
      >
        {isProductVisible(product)
          ? adminCopy.productsMenuUnpublish
          : adminCopy.productsMenuPublish}
      </button>
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
        onClick={() => openConfirm("delete", product)}
      >
        {adminCopy.productsMenuDelete}
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.productsTitle}
        body={adminCopy.productsBody}
        actions={
          <Link
            href={`${localeRoot}${adminProductNewHref}`}
            className="inline-flex min-h-11 items-center bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper"
          >
            {adminCopy.productsCreate}
          </Link>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.productsTotal}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {products.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.productsPublished}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.productsDrafts}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {draftsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.productsFileIssues}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {fileIssueCount}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={adminCopy.productsSearch}
          className="min-h-12 w-full border border-line bg-surface px-4 text-[0.9375rem] text-ink"
        />
        <div className="flex flex-wrap gap-2">
          {statusChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={
                statusFilter === chip.id
                  ? "inline-flex min-h-10 items-center bg-ink px-3 text-meta uppercase tracking-[0.14em] text-paper"
                  : "inline-flex min-h-10 items-center border border-line px-3 text-meta uppercase tracking-[0.14em] text-ink"
              }
              onClick={() => {
                setStatusFilter(chip.id);
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          title={adminCopy.productsTitle}
          body={adminCopy.productsEmpty}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
            <table className="w-full border-collapse text-left text-[0.875rem]">
              <thead className="border-b border-line text-meta uppercase tracking-[0.14em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.productsColProduct}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.productsColCategory}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.productsColPrice}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.productsColFiles}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.productsColStatus}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.slug}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 overflow-hidden bg-paper">
                          <CoverImage
                            src={product.imageSrc}
                            alt={product.imageAlt}
                            sizes="48px"
                            className="absolute inset-0 size-full max-w-none object-cover transition-transform duration-500 hover:scale-[1.02]"
                          />
                        </div>
                        <Link
                          href={`${localeRoot}${adminProductEditHref(product.pdpSlug)}`}
                          className="font-medium text-ink underline-offset-4 hover:underline"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink-soft">
                      {resolveCategoryLabel(product.categoryId, categories)}
                    </td>
                    <td className="px-4 py-4">
                      {formatShopPrice(product.priceCents)}
                    </td>
                    <td className="px-4 py-4">
                      {product.packagePath !== undefined
                        ? "ZIP"
                        : adminCopy.emDash}
                    </td>
                    <td className="px-4 py-4">
                      {adminCopy.productsStatusPublished}
                    </td>
                    <td className="relative px-4 py-4">
                      <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center text-ink"
                        aria-expanded={openMenuSlug === product.slug}
                        disabled={isPending}
                        onClick={() => {
                          setOpenMenuSlug((current) =>
                            current === product.slug ? null : product.slug,
                          );
                        }}
                      >
                        •••
                      </button>
                      {openMenuSlug === product.slug
                        ? renderMenu(product)
                        : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex list-none flex-col gap-3 p-0 lg:hidden">
            {filtered.map((product) => (
              <li
                key={product.slug}
                className="rounded-2xl border border-line bg-surface p-4"
              >
                <div className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden bg-paper">
                    <CoverImage
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      sizes="64px"
                      className="absolute inset-0 size-full max-w-none object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`${localeRoot}${adminProductEditHref(product.pdpSlug)}`}
                      className="font-medium text-ink"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-[0.8125rem] text-ink-soft">
                      {resolveCategoryLabel(product.categoryId, categories)} ·{" "}
                      {formatShopPrice(product.priceCents)}
                    </p>
                    <p className="mt-1 text-[0.8125rem] text-ink-soft">
                      {product.packagePath !== undefined
                        ? "ZIP ready"
                        : "ZIP missing"}{" "}
                      · {adminCopy.productsStatusPublished}
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      className="inline-flex size-11 items-center justify-center text-ink"
                      aria-expanded={openMenuSlug === product.slug}
                      disabled={isPending}
                      onClick={() => {
                        setOpenMenuSlug((current) =>
                          current === product.slug ? null : product.slug,
                        );
                      }}
                    >
                      •••
                    </button>
                    {openMenuSlug === product.slug
                      ? renderMenu(product)
                      : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <AdminConfirmDialog
        open={confirmAction === "duplicate" && confirmProduct !== null}
        title={adminCopy.productsConfirmDuplicateTitle}
        body={adminCopy.productsConfirmDuplicateBody}
        confirmLabel={adminCopy.productsConfirmDuplicate}
        onClose={closeConfirm}
        onConfirm={runDuplicate}
      />

      <AdminConfirmDialog
        open={confirmAction === "unpublish" && confirmProduct !== null}
        title={
          confirmIsVisible
            ? adminCopy.productsConfirmUnpublishTitle
            : adminCopy.productsConfirmPublishTitle
        }
        body={
          confirmIsVisible
            ? adminCopy.productsConfirmUnpublishBody
            : adminCopy.productsConfirmPublishBody
        }
        confirmLabel={
          confirmIsVisible
            ? adminCopy.productsConfirmUnpublish
            : adminCopy.productsConfirmPublish
        }
        onClose={closeConfirm}
        onConfirm={runVisibilityToggle}
      />

      <AdminConfirmDialog
        open={confirmAction === "delete" && confirmProduct !== null}
        title={adminCopy.productsConfirmDeleteTitle}
        body={adminCopy.productsConfirmDeleteBody}
        confirmLabel={adminCopy.productsConfirmDelete}
        onClose={closeConfirm}
        onConfirm={runDelete}
      />

      {toast === null ? null : (
        <p
          className="fixed bottom-28 left-1/2 z-40 -translate-x-1/2 border border-line bg-paper px-5 py-3 text-meta text-ink"
          role="status"
        >
          {toast}
        </p>
      )}
    </div>
  );
}
