"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CoverImage } from "@/components/CoverImage";
import { adminCopy } from "@/constants/adminCopy";
import { categoryHubTiles } from "@/constants/categoriesHubCopy";
import { AdminCategoryDialog } from "@/features/admin/categories/AdminCategoryDialog";
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/server/actions/adminCatalogActions";
import { type CategoryRecord } from "@/types/api/product";

function categoryImageDefaults(category: CategoryRecord | null): {
  imageSrc: string;
  imageAlt: string;
} {
  if (category === null) {
    return { imageSrc: "", imageAlt: "" };
  }

  const fallback = categoryHubTiles.find((tile) => tile.id === category.id);

  return {
    imageSrc: category.imageSrc ?? fallback?.imageSrc ?? "",
    imageAlt: category.imageAlt ?? fallback?.imageAlt ?? category.label,
  };
}

type AdminCategoriesPageProps = {
  locale: string;
  categories: CategoryRecord[];
};

type StatusFilter = "all" | "visible" | "hidden";
type ConfirmAction = "hide" | "delete" | null;

export function AdminCategoriesPage({
  locale: _locale,
  categories,
}: AdminCategoriesPageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editCategory, setEditCategory] = useState<CategoryRecord | null>(null);
  const [dialogResetKey, setDialogResetKey] = useState(0);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmCategory, setConfirmCategory] = useState<CategoryRecord | null>(
    null,
  );

  const handleCreate = () => {
    setDialogMode("create");
    setEditCategory(null);
    setDialogResetKey((key) => key + 1);
    setDialogOpen(true);
  };

  const handleEdit = (category: CategoryRecord) => {
    setDialogMode("edit");
    setEditCategory(category);
    setDialogResetKey((key) => key + 1);
    setDialogOpen(true);
    setOpenMenuId(null);
  };

  const openHideConfirm = (category: CategoryRecord) => {
    setOpenMenuId(null);
    setConfirmCategory(category);
    setConfirmAction("hide");
  };

  const openDeleteConfirm = (category: CategoryRecord) => {
    setOpenMenuId(null);
    setConfirmCategory(category);
    setConfirmAction("delete");
  };

  const closeConfirm = () => {
    setConfirmAction(null);
    setConfirmCategory(null);
  };

  const runHide = () => {
    if (confirmCategory === null) {
      return;
    }

    const category = confirmCategory;
    const defaults = categoryImageDefaults(category);
    closeConfirm();

    startTransition(async () => {
      const result = await updateCategoryAction({
        id: category.id,
        label: category.label,
        sortOrder: category.sortOrder,
        isVisible: !category.isVisible,
        imageSrc: defaults.imageSrc.length > 0 ? defaults.imageSrc : undefined,
        imageAlt: defaults.imageAlt.length > 0 ? defaults.imageAlt : undefined,
      });

      if (!result.ok) {
        setToast(result.error || adminCopy.categoriesActionFailed);
        return;
      }

      router.refresh();
    });
  };

  const runDelete = () => {
    if (confirmCategory === null) {
      return;
    }

    const categoryId = confirmCategory.id;
    closeConfirm();

    startTransition(async () => {
      const result = await deleteCategoryAction(categoryId);

      if (!result.ok) {
        setToast(result.error || adminCopy.categoriesActionFailed);
        return;
      }

      router.refresh();
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return categories.filter((cat) => {
      if (statusFilter === "visible" && !cat.isVisible) {
        return false;
      }

      if (statusFilter === "hidden" && cat.isVisible) {
        return false;
      }

      if (q.length === 0) {
        return true;
      }

      return (
        cat.label.toLowerCase().includes(q) || cat.id.toLowerCase().includes(q)
      );
    });
  }, [categories, query, statusFilter]);

  const statusChips: ReadonlyArray<{ id: StatusFilter; label: string }> = [
    { id: "all", label: adminCopy.categoriesFilterAll },
    { id: "visible", label: adminCopy.categoriesFilterVisible },
    { id: "hidden", label: adminCopy.categoriesFilterHidden },
  ];

  const visibleCount = categories.filter((cat) => cat.isVisible).length;
  const hiddenCount = categories.length - visibleCount;
  const editDefaults = categoryImageDefaults(editCategory);
  const confirmIsVisible = confirmCategory?.isVisible ?? true;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={adminCopy.categoriesTitle}
        body={adminCopy.categoriesBody}
        actions={
          <button
            type="button"
            className="inline-flex min-h-11 items-center bg-ink px-5 text-meta uppercase tracking-[0.14em] text-paper"
            onClick={handleCreate}
          >
            {adminCopy.categoriesCreate}
          </button>
        }
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.categoriesTotal}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {categories.length}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.categoriesVisible}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">{visibleCount}</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-meta uppercase tracking-[0.14em] text-ink-soft">
            {adminCopy.categoriesHidden}
          </p>
          <p className="mt-2 text-2xl font-semibold text-ink">{hiddenCount}</p>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder={adminCopy.categoriesSearch}
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
          title={adminCopy.categoriesTitle}
          body={adminCopy.categoriesEmpty}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-line bg-surface lg:block">
            <table className="w-full border-collapse text-left text-[0.875rem]">
              <thead className="border-b border-line text-meta uppercase tracking-[0.14em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.categoriesColCategory}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    {adminCopy.categoriesColStatus}
                  </th>
                  <th className="px-4 py-3 font-normal">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => {
                  const image = categoryImageDefaults(cat);

                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-4 py-4 font-medium text-ink">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden border border-line bg-paper">
                            {image.imageSrc.length === 0 ? (
                              <div className="flex size-full items-center justify-center text-[0.75rem] text-ink-soft">
                                {adminCopy.emDash}
                              </div>
                            ) : (
                              <CoverImage
                                src={image.imageSrc}
                                alt={image.imageAlt}
                                sizes="48px"
                                className="absolute inset-0 size-full max-w-none object-cover"
                              />
                            )}
                          </div>
                          <span>{cat.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {cat.isVisible
                          ? adminCopy.categoriesStatusLive
                          : adminCopy.categoriesStatusHidden}
                      </td>
                      <td className="relative px-4 py-4 text-right">
                        <button
                          type="button"
                          className="inline-flex size-11 items-center justify-center text-ink"
                          aria-expanded={openMenuId === cat.id}
                          disabled={isPending}
                          onClick={() => {
                            setOpenMenuId((current) =>
                              current === cat.id ? null : cat.id,
                            );
                          }}
                        >
                          •••
                        </button>
                        {openMenuId === cat.id ? (
                          <div className="absolute right-4 z-10 mt-1 w-48 rounded-2xl border border-line bg-surface py-2 text-left text-[0.8125rem] shadow-lg">
                            <button
                              type="button"
                              className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
                              onClick={() => handleEdit(cat)}
                            >
                              {adminCopy.categoriesMenuEdit}
                            </button>
                            <button
                              type="button"
                              className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
                              onClick={() => openHideConfirm(cat)}
                            >
                              {cat.isVisible
                                ? adminCopy.categoriesMenuHide
                                : adminCopy.categoriesMenuShow}
                            </button>
                            <button
                              type="button"
                              className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
                              onClick={() => openDeleteConfirm(cat)}
                            >
                              {adminCopy.categoriesMenuDelete}
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="flex list-none flex-col gap-3 p-0 lg:hidden">
            {filtered.map((cat) => {
              const image = categoryImageDefaults(cat);

              return (
                <li
                  key={cat.id}
                  className="rounded-2xl border border-line bg-surface p-4"
                >
                  <div className="flex gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden border border-line bg-paper">
                      {image.imageSrc.length === 0 ? (
                        <div className="flex size-full items-center justify-center text-[0.75rem] text-ink-soft">
                          {adminCopy.emDash}
                        </div>
                      ) : (
                        <CoverImage
                          src={image.imageSrc}
                          alt={image.imageAlt}
                          sizes="56px"
                          className="absolute inset-0 size-full max-w-none object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{cat.label}</p>
                      <p className="mt-1 text-[0.8125rem] text-ink-soft">
                        {cat.isVisible
                          ? adminCopy.categoriesStatusLive
                          : adminCopy.categoriesStatusHidden}
                      </p>
                    </div>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center text-ink"
                        aria-expanded={openMenuId === cat.id}
                        disabled={isPending}
                        onClick={() => {
                          setOpenMenuId((current) =>
                            current === cat.id ? null : cat.id,
                          );
                        }}
                      >
                        •••
                      </button>
                      {openMenuId === cat.id ? (
                        <div className="absolute right-0 z-10 mt-1 w-48 rounded-2xl border border-line bg-surface py-2 text-left text-[0.8125rem] shadow-lg">
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
                            onClick={() => handleEdit(cat)}
                          >
                            {adminCopy.categoriesMenuEdit}
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
                            onClick={() => openHideConfirm(cat)}
                          >
                            {cat.isVisible
                              ? adminCopy.categoriesMenuHide
                              : adminCopy.categoriesMenuShow}
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-ink-soft hover:bg-paper"
                            onClick={() => openDeleteConfirm(cat)}
                          >
                            {adminCopy.categoriesMenuDelete}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <AdminCategoryDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        initialCategoryId={editCategory?.id ?? ""}
        initialCategoryLabel={editCategory?.label ?? ""}
        initialSortOrder={editCategory?.sortOrder ?? 0}
        initialIsVisible={editCategory?.isVisible ?? true}
        initialImageSrc={editDefaults.imageSrc}
        initialImageAlt={editDefaults.imageAlt}
        resetKey={dialogResetKey}
      />

      <AdminConfirmDialog
        open={confirmAction === "hide" && confirmCategory !== null}
        title={
          confirmIsVisible
            ? adminCopy.categoriesConfirmHideTitle
            : adminCopy.categoriesConfirmShowTitle
        }
        body={
          confirmIsVisible
            ? adminCopy.categoriesConfirmHideBody
            : adminCopy.categoriesConfirmShowBody
        }
        confirmLabel={
          confirmIsVisible
            ? adminCopy.categoriesConfirmHide
            : adminCopy.categoriesConfirmShow
        }
        onClose={closeConfirm}
        onConfirm={runHide}
      />

      <AdminConfirmDialog
        open={confirmAction === "delete" && confirmCategory !== null}
        title={adminCopy.categoriesConfirmDeleteTitle}
        body={adminCopy.categoriesConfirmDeleteBody}
        confirmLabel={adminCopy.categoriesConfirmDelete}
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
