"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type BackendCategory } from "@/lib/api";
import { CategoryDeleteButton } from "@/components/category-delete-button";
import {
  updateCategoryAction,
  createCategoryAction,
  toggleCategoryHiddenAction,
  checkCategoryNameAction,
} from "@/app/(admin)/categories/actions";

type Props = {
  items: BackendCategory[];
  start: number;
  canWrite: boolean;
  onRestore: (formData: FormData) => Promise<void>;
};

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryIcon(name: string): {
  icon: string;
  gradient: string;
  glow: string;
  badgeColor: string;
} {
  const n = String(name ?? "").toLowerCase();

  if (
    n.includes("điện thoại") ||
    n.includes("phone") ||
    n.includes("mobile") ||
    n.includes("tai nghe") ||
    n.includes("phụ kiện")
  ) {
    return {
      icon: "devices",
      gradient: "from-blue-600 to-cyan-500",
      glow: "shadow-blue-500/20",
      badgeColor:
        "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-800/40",
    };
  }
  if (
    n.includes("laptop") ||
    n.includes("máy tính") ||
    n.includes("computer") ||
    n.includes("pc")
  ) {
    return {
      icon: "laptop_chromebook",
      gradient: "from-indigo-600 to-blue-500",
      glow: "shadow-indigo-500/20",
      badgeColor:
        "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40",
    };
  }
  if (
    n.includes("áo") ||
    n.includes("quần") ||
    n.includes("thời trang") ||
    n.includes("giày") ||
    n.includes("apparel") ||
    n.includes("fashion")
  ) {
    return {
      icon: "apparel",
      gradient: "from-purple-600 to-pink-500",
      glow: "shadow-purple-500/20",
      badgeColor:
        "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
    };
  }
  if (
    n.includes("bếp") ||
    n.includes("nồi") ||
    n.includes("gia dụng") ||
    n.includes("chén") ||
    n.includes("kitchen") ||
    n.includes("dining")
  ) {
    return {
      icon: "kitchen",
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/20",
      badgeColor:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
    };
  }
  if (
    n.includes("mỹ phẩm") ||
    n.includes("son") ||
    n.includes("phấn") ||
    n.includes("skincare") ||
    n.includes("beauty")
  ) {
    return {
      icon: "face",
      gradient: "from-rose-500 to-pink-500",
      glow: "shadow-rose-500/20",
      badgeColor:
        "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
    };
  }
  if (
    n.includes("sách") ||
    n.includes("vở") ||
    n.includes("bút") ||
    n.includes("book") ||
    n.includes("stationery")
  ) {
    return {
      icon: "menu_book",
      gradient: "from-emerald-600 to-teal-500",
      glow: "shadow-emerald-500/20",
      badgeColor:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
    };
  }
  if (n.includes("đồng hồ") || n.includes("watch")) {
    return {
      icon: "watch",
      gradient: "from-cyan-600 to-blue-500",
      glow: "shadow-cyan-500/20",
      badgeColor:
        "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40",
    };
  }
  if (
    n.includes("thể thao") ||
    n.includes("dã ngoại") ||
    n.includes("xe đạp") ||
    n.includes("sports") ||
    n.includes("outdoor")
  ) {
    return {
      icon: "sports_soccer",
      gradient: "from-teal-600 to-cyan-500",
      glow: "shadow-teal-500/20",
      badgeColor:
        "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-300 border-teal-200 dark:border-teal-800/40",
    };
  }

  return {
    icon: "category",
    gradient: "from-blue-600 to-indigo-600",
    glow: "shadow-blue-500/20",
    badgeColor:
      "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700",
  };
}

export function CategoryListDisplay({ items, start, canWrite, onRestore }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<BackendCategory[]>(items);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Modals state
  const [quickEditCat, setQuickEditCat] = useState<BackendCategory | null>(null);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  const [, startTransition] = useTransition();

  useEffect(() => {
    setCategories(items);
  }, [items]);

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("category_view_mode");
    if (saved === "grid" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("category_view_mode", mode);
  };

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastNotice({ text, type });
    setTimeout(() => setToastNotice(null), 3000);
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(`/${slug}`);
    setCopiedSlug(slug);
    showToast(`Đã sao chép đường dẫn /${slug}`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Toggle Hidden/Visible on Storefront
  const handleToggleHidden = async (c: BackendCategory) => {
    if (!canWrite || togglingId !== null) return;
    setTogglingId(c.id);

    // Optimistic
    setCategories((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, hidden: !item.hidden } : item))
    );

    const res = await toggleCategoryHiddenAction(c.id, !!c.hidden);
    setTogglingId(null);

    if (res.success) {
      showToast(`Đã ${res.hidden ? "ẩn" : "hiện"} danh mục "${c.name}" trên Storefront`);
      startTransition(() => {
        router.refresh();
      });
    } else {
      // Revert
      setCategories((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, hidden: c.hidden } : item))
      );
      showToast(res.error || "Lỗi cập nhật trạng thái", "error");
    }
  };

  // Quick Edit Submit
  const handleSaveQuickEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quickEditCat || !canWrite) return;
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
    const hidden = formData.get("hidden") === "on";

    if (!name) {
      showToast("Tên danh mục không được để trống", "error");
      setIsSaving(false);
      return;
    }

    try {
      const isDuplicate = await checkCategoryNameAction(name, quickEditCat.id);
      if (isDuplicate) {
        showToast("Tên danh mục đã tồn tại, vui lòng chọn tên khác", "error");
        setIsSaving(false);
        return;
      }

      await updateCategoryAction(quickEditCat.id, {
        name,
        slug: slug || slugify(name),
        imageUrl,
        hidden,
      });

      setCategories((prev) =>
        prev.map((item) =>
          item.id === quickEditCat.id
            ? {
                ...item,
                name,
                slug: slug || slugify(name),
                imageUrl: imageUrl || undefined,
                hidden,
              }
            : item
        )
      );

      showToast(`Đã cập nhật danh mục "${name}"`);
      setQuickEditCat(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Lỗi lưu danh mục", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Create Submit
  const handleSaveQuickCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canWrite) return;
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
    const hidden = formData.get("hidden") === "on";

    if (!name) {
      showToast("Tên danh mục không được để trống", "error");
      setIsSaving(false);
      return;
    }

    try {
      const isDuplicate = await checkCategoryNameAction(name);
      if (isDuplicate) {
        showToast("Tên danh mục đã tồn tại, vui lòng chọn tên khác", "error");
        setIsSaving(false);
        return;
      }

      const created = await createCategoryAction({
        name,
        slug: slug || slugify(name),
        imageUrl,
        hidden,
      });

      showToast(`Đã tạo thành công danh mục "${created.name}"`);
      setIsQuickCreateOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast(err.message || "Lỗi tạo danh mục", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ${
            toastNotice.type === "success"
              ? "bg-emerald-600/90 shadow-emerald-600/30 border border-emerald-400/40"
              : "bg-rose-600/90 shadow-rose-600/30 border border-rose-400/40"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastNotice.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastNotice.text}</span>
        </div>
      )}

      {/* Control Bar: Quick Add Button & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {canWrite && (
            <button
              type="button"
              onClick={() => setIsQuickCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Thêm nhanh danh mục</span>
            </button>
          )}
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            Hiển thị {categories.length} danh mục
          </span>
        </div>

        {/* View Mode Toggle Controls */}
        <div className="inline-flex rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-1 border border-slate-200/70 dark:border-white/5 backdrop-blur-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleToggleView("grid")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Dạng lưới</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleView("table")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-sm border border-slate-200/80 dark:border-white/10"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_rows</span>
            <span>Dạng bảng</span>
          </button>
        </div>
      </div>

      {/* ==================== 1. GRID VIEW MODE ==================== */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-200">
          {categories.map((c, index) => {
            const isDeleted = c.deletedAt != null;
            const isHidden = !!c.hidden;
            const style = getCategoryIcon(c.name);
            const productCount = typeof c.productCount === "number" ? c.productCount : 0;
            const isToggling = togglingId === c.id;

            return (
              <div
                key={c.id}
                className={`group relative overflow-hidden rounded-[2rem] border bg-white/95 dark:bg-zinc-950/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-2xl flex flex-col justify-between min-h-[260px] ${
                  isDeleted
                    ? "border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10"
                    : isHidden
                    ? "border-amber-200/80 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10"
                    : "border-slate-200/80 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-cyan-500/40"
                }`}
              >
                {/* Visual Top Accent Line */}
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${
                    isDeleted
                      ? "from-rose-500 to-red-500"
                      : isHidden
                      ? "from-amber-400 to-orange-400"
                      : style.gradient
                  }`}
                />

                {/* Card Header: Icon/Image + Action Buttons */}
                <div className="flex items-start justify-between gap-4">
                  {c.imageUrl ? (
                    <div className="relative h-13 w-13 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white shadow-md group-hover:scale-105 transition-transform duration-300">
                      <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${style.gradient} text-white shadow-md ${style.glow} group-hover:scale-105 transition-transform duration-300`}
                    >
                      <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center gap-1">
                    {!isDeleted ? (
                      <>
                        <Link
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-blue-50 dark:hover:bg-cyan-500/20 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                          href={`/admin/categories/${c.id}`}
                          title="Chi tiết danh mục"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                        {canWrite && (
                          <>
                            <button
                              type="button"
                              onClick={() => setQuickEditCat(c)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                              title="Sửa nhanh thông tin"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                edit_note
                              </span>
                            </button>

                            <Link
                              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                              href={`/admin/categories/${c.id}/edit`}
                              title="Chỉnh sửa toàn bộ"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </Link>

                            <CategoryDeleteButton
                              categoryId={c.id}
                              categoryName={c.name}
                              className="group flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-blue-50 dark:hover:bg-cyan-500/20 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                          href={`/admin/categories/${c.id}`}
                          title="Chi tiết danh mục"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                        {canWrite && (
                          <form action={onRestore}>
                            <input type="hidden" name="_categoryId" value={String(c.id)} />
                            <button
                              type="submit"
                              className="flex h-8 items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95 shadow-xs"
                              title="Khôi phục danh mục"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                restore_from_trash
                              </span>
                              <span>Khôi phục</span>
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border border-slate-200/80 dark:border-white/5">
                      #{c.id}
                    </span>

                    {/* Direct link to view all products in category */}
                    {productCount > 0 ? (
                      <Link
                        href={`/admin/products?q=${encodeURIComponent(c.name)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-cyan-950/40 hover:bg-blue-100 dark:hover:bg-cyan-900/60 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-cyan-900/40 transition-colors"
                        title="Bấm để xem danh sách sản phẩm thuộc danh mục này"
                      >
                        <span className="material-symbols-outlined text-[12px]">inventory_2</span>
                        {productCount} sản phẩm
                      </Link>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                        Chưa có sản phẩm
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                    {c.name}
                  </h3>

                  {/* Slug with Copy Helper */}
                  <div className="mt-2 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-white/5">
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 truncate">
                      /{c.slug ?? "—"}
                    </span>
                    {c.slug && (
                      <button
                        type="button"
                        onClick={() => copySlug(c.slug!)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors ml-1"
                        title="Sao chép slug"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedSlug === c.slug ? "done" : "content_copy"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer: Status Pill & Toggle Switch */}
                <div className="mt-5 border-t border-slate-100 dark:border-white/5 pt-3.5 flex items-center justify-between">
                  {/* Status Pill */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDeleted
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                        : isHidden
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isDeleted
                          ? "bg-rose-500"
                          : isHidden
                          ? "bg-amber-500"
                          : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                    {isDeleted ? "Thùng rác" : isHidden ? "Đang ẩn" : "Hiển thị"}
                  </span>

                  {/* Quick Toggle Hidden button */}
                  {!isDeleted && canWrite && (
                    <button
                      type="button"
                      onClick={() => handleToggleHidden(c)}
                      disabled={isToggling}
                      className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 transition-colors"
                      title={isHidden ? "Hiện danh mục lên Storefront" : "Ẩn khỏi Storefront"}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          isToggling ? "animate-spin" : ""
                        }`}
                      >
                        {isToggling ? "sync" : isHidden ? "visibility_off" : "visibility"}
                      </span>
                      <span>{isHidden ? "Bật hiện" : "Ẩn"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== 2. TABLE VIEW MODE ==================== */
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-900/80 border-b border-slate-200/80 dark:border-white/10">
                  <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400 w-16">
                    Mã
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                    Danh mục
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                    Đường dẫn (Slug)
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                    Sản phẩm
                  </th>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                    Trạng thái
                  </th>
                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {categories.map((c) => {
                  const isDeleted = c.deletedAt != null;
                  const isHidden = !!c.hidden;
                  const style = getCategoryIcon(c.name);
                  const productCount = typeof c.productCount === "number" ? c.productCount : 0;
                  const isToggling = togglingId === c.id;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors ${
                        isDeleted ? "opacity-60 bg-rose-50/10" : ""
                      }`}
                    >
                      <td className="px-5 py-4 text-center font-mono text-xs font-bold text-slate-500">
                        #{c.id}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-white/10"
                            />
                          ) : (
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {style.icon}
                              </span>
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/categories/${c.id}`}
                              className="font-headline text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                            >
                              {c.name}
                            </Link>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-zinc-400">
                        <span className="bg-slate-100/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-white/5">
                          /{c.slug ?? "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {productCount > 0 ? (
                          <Link
                            href={`/admin/products?q=${encodeURIComponent(c.name)}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50/80 dark:bg-cyan-950/40 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-100 dark:border-cyan-900/40 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              inventory_2
                            </span>
                            {productCount}
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-zinc-500">0</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isDeleted
                                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                                : isHidden
                                ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
                                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isDeleted
                                  ? "bg-rose-500"
                                  : isHidden
                                  ? "bg-amber-500"
                                  : "bg-emerald-500 animate-pulse"
                              }`}
                            />
                            {isDeleted ? "Thùng rác" : isHidden ? "Đang ẩn" : "Hoạt động"}
                          </span>

                          {!isDeleted && canWrite && (
                            <button
                              type="button"
                              onClick={() => handleToggleHidden(c)}
                              disabled={isToggling}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                              title={isHidden ? "Bật hiện" : "Ẩn"}
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] ${
                                  isToggling ? "animate-spin" : ""
                                }`}
                              >
                                {isToggling ? "sync" : isHidden ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-blue-50 dark:hover:bg-cyan-500/20 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                            href={`/admin/categories/${c.id}`}
                            title="Chi tiết danh mục"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              visibility
                            </span>
                          </Link>

                          {!isDeleted && canWrite && (
                            <>
                              <button
                                type="button"
                                onClick={() => setQuickEditCat(c)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-cyan-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                                title="Sửa nhanh"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  edit_note
                                </span>
                              </button>

                              <Link
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                                href={`/admin/categories/${c.id}/edit`}
                                title="Chỉnh sửa toàn bộ"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </Link>

                              <CategoryDeleteButton
                                categoryId={c.id}
                                categoryName={c.name}
                                className="group flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/90 dark:bg-zinc-900/80 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs"
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================== MODAL 1: QUICK EDIT CATEGORY ==================== */}
      {quickEditCat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setQuickEditCat(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400">
                  <span className="material-symbols-outlined text-2xl">category</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">
                    Sửa Nhanh Danh Mục
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Mã #{quickEditCat.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditCat(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="quick_edit_name"
                  defaultValue={quickEditCat.name}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  onChange={(e) => {
                    const slugInput = document.getElementById(
                      "quick_edit_slug"
                    ) as HTMLInputElement;
                    if (slugInput && !slugInput.dataset.manual) {
                      slugInput.value = slugify(e.target.value);
                    }
                  }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Đường dẫn (Slug)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const nameInput = document.getElementById(
                        "quick_edit_name"
                      ) as HTMLInputElement;
                      const slugInput = document.getElementById(
                        "quick_edit_slug"
                      ) as HTMLInputElement;
                      if (nameInput && slugInput) {
                        slugInput.value = slugify(nameInput.value);
                      }
                    }}
                    className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    Tạo tự động từ tên
                  </button>
                </div>
                <input
                  type="text"
                  name="slug"
                  id="quick_edit_slug"
                  defaultValue={quickEditCat.slug || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  onInput={(e) => ((e.target as HTMLElement).dataset.manual = "true")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  URL Hình ảnh (Tùy chọn)
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  defaultValue={quickEditCat.imageUrl || ""}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="quick_cat_hidden"
                  name="hidden"
                  defaultChecked={!!quickEditCat.hidden}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <label
                  htmlFor="quick_cat_hidden"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Ẩn danh mục khỏi thanh menu Storefront khách hàng
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setQuickEditCat(null)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">save</span>
                  )}
                  <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL 2: QUICK CREATE CATEGORY ==================== */}
      {isQuickCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setIsQuickCreateOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[2.5rem] border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c101d]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                  <span className="material-symbols-outlined text-2xl">add</span>
                </div>
                <div>
                  <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">
                    Thêm Nhanh Danh Mục
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Tạo danh mục mới trong vài giây
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCreateOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveQuickCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="create_name"
                  required
                  placeholder="Ví dụ: Phụ Kiện Gaming..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  onChange={(e) => {
                    const slugInput = document.getElementById(
                      "create_slug"
                    ) as HTMLInputElement;
                    if (slugInput && !slugInput.dataset.manual) {
                      slugInput.value = slugify(e.target.value);
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  Đường dẫn (Slug)
                </label>
                <input
                  type="text"
                  name="slug"
                  id="create_slug"
                  placeholder="phu-kien-gaming"
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  onInput={(e) => ((e.target as HTMLElement).dataset.manual = "true")}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1">
                  URL Hình ảnh (Tùy chọn)
                </label>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="create_hidden"
                  name="hidden"
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <label
                  htmlFor="create_hidden"
                  className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Tạm ẩn danh mục (chưa hiển thị công khai ngay)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsQuickCreateOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] disabled:opacity-60"
                >
                  {isSaving ? (
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  )}
                  <span>{isSaving ? "Đang tạo..." : "Tạo danh mục"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
