"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type UiProduct } from "@/lib/api";
import { ProductExcelImport } from "@/components/product-excel-import";
import {
  hideAction,
  restoreAction,
  unhideAction,
  deleteAction,
  bulkDeleteAction,
  bulkHideAction,
  bulkUnhideAction,
  quickUpdateProductAction,
} from "@/app/admin/products/actions";
import { toast } from "sonner";

export function ProductsDashboard({
  accessToken,
  username,
  userId,
  brands,
  categories,
  initialProducts,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  qParam,
  categoryParam,
  brandParam,
  filterDeletedParam,
  sortByParam,
  canWrite,
}: {
  accessToken: string;
  username: string;
  userId: string;
  brands: any[];
  categories: any[];
  initialProducts: UiProduct[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  qParam: string;
  categoryParam: string;
  brandParam: string;
  filterDeletedParam: string;
  sortByParam: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"list" | "import">("list");

  const [q, setQ] = useState(qParam);
  const [filterDeleted, setFilterDeleted] = useState<string>(filterDeletedParam);
  const [filterCategory, setFilterCategory] = useState<string>(categoryParam);
  const [filterBrand, setFilterBrand] = useState<string>(brandParam);
  const [sortBy, setSortBy] = useState<string>(sortByParam);
  const [limit, setLimit] = useState(pageSize);

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<UiProduct[]>(initialProducts);
  const isUserAction = useRef(false);

  // Selection state for Bulk Operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Quick Edit Modal state
  const [quickEditProduct, setQuickEditProduct] = useState<UiProduct | null>(null);
  const [quickName, setQuickName] = useState("");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickSku, setQuickSku] = useState("");
  const [quickCategoryId, setQuickCategoryId] = useState("");
  const [quickBrandId, setQuickBrandId] = useState("");
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);

  // Delete Target Modal state
  const [deleteTarget, setDeleteTarget] = useState<UiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Delete Modal state
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Sync state from props when they change
  useEffect(() => {
    setQ(qParam);
    setFilterDeleted(filterDeletedParam);
    setFilterCategory(categoryParam);
    setFilterBrand(brandParam);
    setSortBy(sortByParam);
    setLimit(pageSize);
    setProducts(initialProducts);
    setLoading(false);
    setSelectedIds(new Set());
  }, [qParam, filterDeletedParam, categoryParam, brandParam, sortByParam, pageSize, initialProducts]);

  // Listen to searchParams to show floating toast messages
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");
    if (errorParam === "readonly") {
      toast.error("Bạn không có quyền thực hiện hành động này (Chỉ đọc)!");
      const params = new URLSearchParams(window.location.search);
      params.delete("error");
      router.replace(`?${params.toString()}`);
    } else if (errorParam) {
      toast.error(`Lỗi: ${errorParam}`);
      const params = new URLSearchParams(window.location.search);
      params.delete("error");
      router.replace(`?${params.toString()}`);
    }
    if (successParam === "create") {
      toast.success("Tạo sản phẩm thành công!");
      const params = new URLSearchParams(window.location.search);
      params.delete("success");
      router.replace(`?${params.toString()}`);
    } else if (successParam) {
      toast.success(`Thành công: ${successParam}`);
      const params = new URLSearchParams(window.location.search);
      params.delete("success");
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, router]);

  // Debounced navigation - ONLY when user intentionally changes filters
  useEffect(() => {
    if (!isUserAction.current) return;
    const timer = setTimeout(() => {
      isUserAction.current = false;
      const params = new URLSearchParams(searchParams.toString());

      let changed = false;
      const updateParam = (key: string, value: string, defaultVal: string) => {
        if (value !== defaultVal) {
          if (params.get(key) !== value) {
            params.set(key, value);
            changed = true;
          }
        } else {
          if (params.has(key)) {
            params.delete(key);
            changed = true;
          }
        }
      };

      updateParam("q", q, "");
      updateParam("filterDeleted", filterDeleted, "active");
      updateParam("categoryId", filterCategory, "all");
      updateParam("brandId", filterBrand, "all");
      updateParam("sortBy", sortBy, "newest");

      if (limit !== 20) {
        if (params.get("size") !== String(limit)) {
          params.set("size", String(limit));
          changed = true;
        }
      } else {
        if (params.has("size")) {
          params.delete("size");
          changed = true;
        }
      }

      if (changed) {
        params.delete("page");
        setLoading(true);
        router.push(`?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [q, filterDeleted, filterCategory, filterBrand, sortBy, limit, searchParams, router]);

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    setLoading(true);
    router.push(`?${params.toString()}`);
  };

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Load view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("product_view_mode");
    if (saved === "grid" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  const handleToggleView = (mode: "grid" | "table") => {
    setViewMode(mode);
    localStorage.setItem("product_view_mode", mode);
  };

  // Keyboard shortcut listener for Esc and Quick Edit Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuickEditProduct(null);
        setDeleteTarget(null);
        setBulkDeleteModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Row and Individual Actions
  const handleAction = async (action: "hide" | "unhide" | "restore", id: string) => {
    setLoading(true);
    let res;
    if (action === "hide") {
      res = await hideAction(id);
      if (!res?.error) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isHidden: true } : p)));
      }
    } else if (action === "unhide") {
      res = await unhideAction(id);
      if (!res?.error) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isHidden: false } : p)));
      }
    } else if (action === "restore") {
      res = await restoreAction(id);
      if (!res?.error) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isDeleted: false } : p)));
      }
    }

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Thao tác thành công");
    }
    setLoading(false);
  };

  // Single Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteAction(deleteTarget.id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã chuyển sản phẩm #${deleteTarget.id} vào thùng rác.`);
        // Optimistic update
        if (filterDeleted === "active") {
          setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        } else {
          setProducts((prev) => prev.map((p) => (p.id === deleteTarget.id ? { ...p, isDeleted: true } : p)));
        }
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id);
          return next;
        });
        setDeleteTarget(null);
      }
    } catch {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  // Bulk Delete Confirmation Handler
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await bulkDeleteAction(ids);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã xóa ${res?.count ?? ids.length} sản phẩm vào thùng rác!`);
        if (filterDeleted === "active") {
          setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
        } else {
          setProducts((prev) =>
            prev.map((p) => (selectedIds.has(p.id) ? { ...p, isDeleted: true } : p))
          );
        }
        setSelectedIds(new Set());
        setBulkDeleteModalOpen(false);
      }
    } catch {
      toast.error("Lỗi khi thực hiện xóa hàng loạt");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Hide Handler
  const handleBulkHide = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await bulkHideAction(ids);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã tạm ẩn ${res?.count ?? ids.length} sản phẩm khỏi sàn.`);
        setProducts((prev) =>
          prev.map((p) => (selectedIds.has(p.id) ? { ...p, isHidden: true } : p))
        );
        setSelectedIds(new Set());
      }
    } catch {
      toast.error("Lỗi khi ẩn hàng loạt");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Unhide Handler
  const handleBulkUnhide = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkProcessing(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await bulkUnhideAction(ids);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã hiển thị lại ${res?.count ?? ids.length} sản phẩm trên sàn.`);
        setProducts((prev) =>
          prev.map((p) => (selectedIds.has(p.id) ? { ...p, isHidden: false } : p))
        );
        setSelectedIds(new Set());
      }
    } catch {
      toast.error("Lỗi khi hiện hàng loạt");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Open Quick Edit Modal
  const handleOpenQuickEdit = (p: UiProduct) => {
    setQuickEditProduct(p);
    setQuickName(p.name);
    setQuickPrice(String(p.rawPrice || 0));
    setQuickSku(p.sku || "");
    setQuickCategoryId(p.categoryId ? String(p.categoryId) : "");
    setQuickBrandId(p.brandId ? String(p.brandId) : "");
  };

  // Quick SKU Generator
  const generateRandomSku = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setQuickSku(`PRD-${random}`);
  };

  // Submit Quick Edit
  const handleSaveQuickEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditProduct) return;
    const priceNum = Number(quickPrice);
    if (!quickName.trim()) {
      toast.error("Tên sản phẩm không được để trống");
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Giá sản phẩm phải lớn hơn 0");
      return;
    }

    setIsSavingQuickEdit(true);
    try {
      const catId = quickCategoryId ? Number(quickCategoryId) : undefined;
      const bId = quickBrandId ? Number(quickBrandId) : undefined;

      const res = await quickUpdateProductAction(quickEditProduct.id, {
        productName: quickName.trim(),
        price: priceNum,
        sku: quickSku.trim() || undefined,
        categoryId: catId,
        brandId: bId,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã cập nhật sản phẩm #${quickEditProduct.id}!`);
        // Optimistic update
        const selectedCatName = categories.find((c) => String(c.id) === quickCategoryId)?.name;
        const selectedBrandName = brands.find((b) => String(b.id) === quickBrandId)?.name;

        setProducts((prev) =>
          prev.map((item) =>
            item.id === quickEditProduct.id
              ? {
                  ...item,
                  name: quickName.trim(),
                  rawPrice: priceNum,
                  price: `${priceNum.toLocaleString("vi-VN")} ₫`,
                  sku: quickSku.trim(),
                  categoryId: catId ?? item.categoryId,
                  category: selectedCatName ?? item.category,
                  brandId: bId ?? item.brandId,
                  brandName: selectedBrandName ?? item.brandName,
                }
              : item
          )
        );
        setQuickEditProduct(null);
      }
    } catch {
      toast.error("Lỗi khi lưu sản phẩm");
    } finally {
      setIsSavingQuickEdit(false);
    }
  };

  const hasActiveFilters =
    Boolean(q) ||
    filterDeleted !== "active" ||
    filterCategory !== "all" ||
    filterBrand !== "all" ||
    sortBy !== "newest";

  const handleResetFilters = () => {
    isUserAction.current = false;
    setQ("");
    setFilterDeleted("active");
    setFilterCategory("all");
    setFilterBrand("all");
    setSortBy("newest");
    setLoading(true);
    router.push(window.location.pathname);
  };

  function formatDisplayPrice(p: UiProduct) {
    if (p.hasVariantPriceRange && p.minPrice != null && p.maxPrice != null) {
      return `${p.minPrice.toLocaleString("vi-VN")} ₫ - ${p.maxPrice.toLocaleString("vi-VN")} ₫`;
    }
    if (p.price) return p.price;
    if (p.rawPrice) return `${p.rawPrice.toLocaleString("vi-VN")} ₫`;
    return "Chưa cập nhật giá";
  }

  const pagedProducts = products;

  return (
    <div className="space-y-6 text-slate-800 dark:text-zinc-100">
      {/* ==================== TABS BAR ==================== */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-1">
        <div className="flex gap-4">
          <button
            type="button"
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "list"
                ? "border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400 drop-shadow-xs"
                : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            }`}
            onClick={() => setActiveTab("list")}
          >
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
            <span>Danh sách Sản phẩm</span>
          </button>
          {canWrite && (
            <button
              type="button"
              className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all border-b-2 ${
                activeTab === "import"
                  ? "border-emerald-600 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 drop-shadow-xs"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
              onClick={() => setActiveTab("import")}
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Import Bằng Excel</span>
            </button>
          )}
        </div>

        {activeTab === "list" && (
          <div className="flex items-center gap-3">
            {canWrite && (
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Thêm mới</span>
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Hiển thị:
              </span>
              <div className="inline-flex rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-1 border border-slate-200/80 dark:border-white/10 shadow-xs">
                <button
                  type="button"
                  onClick={() => handleToggleView("table")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-white/10 text-blue-600 dark:text-cyan-300 shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                  title="Xem dạng bảng"
                >
                  <span className="material-symbols-outlined text-[16px]">table_rows</span>
                  <span>Bảng</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleView("grid")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-white/10 text-blue-600 dark:text-cyan-300 shadow-xs"
                      : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                  }`}
                  title="Xem dạng lưới"
                >
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                  <span>Lưới</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== EXCEL IMPORT TAB ==================== */}
      {activeTab === "import" && (
        <ProductExcelImport
          accessToken={accessToken}
          username={username}
          userId={userId}
          brands={brands}
          categories={categories}
        />
      )}

      {/* ==================== LIST TAB ==================== */}
      {activeTab === "list" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2.5 w-full">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 dark:text-zinc-500">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Tìm tên, mã SKU, nhãn hiệu..."
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 backdrop-blur-md outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 shadow-xs"
                  value={q}
                  onChange={(e) => {
                    isUserAction.current = true;
                    setQ(e.target.value);
                  }}
                />
                {q && (
                  <button
                    type="button"
                    onClick={() => {
                      isUserAction.current = true;
                      setQ("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={filterDeleted}
                  onChange={(e) => {
                    isUserAction.current = true;
                    setFilterDeleted(e.target.value);
                  }}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 backdrop-blur-md outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 appearance-none shadow-xs cursor-pointer"
                >
                  <option value="active" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    🟢 Đang bán
                  </option>
                  <option value="deleted" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    🗑️ Đã xóa mềm
                  </option>
                  <option value="all" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    📋 Tất cả trạng thái
                  </option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Category filter */}
              <div className="relative max-w-[190px]">
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    isUserAction.current = true;
                    setFilterCategory(e.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 backdrop-blur-md outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 appearance-none truncate shadow-xs cursor-pointer"
                >
                  <option value="all" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    Tất cả Danh mục
                  </option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={String(c.id)} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Brand filter */}
              <div className="relative max-w-[190px]">
                <select
                  value={filterBrand}
                  onChange={(e) => {
                    isUserAction.current = true;
                    setFilterBrand(e.target.value);
                  }}
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 backdrop-blur-md outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 appearance-none truncate shadow-xs cursor-pointer"
                >
                  <option value="all" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    Tất cả Thương hiệu
                  </option>
                  {brands?.map((b: any) => (
                    <option key={b.id} value={String(b.id)} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                      {b.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Sort by */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    isUserAction.current = true;
                    setSortBy(e.target.value);
                  }}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 backdrop-blur-md outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 appearance-none shadow-xs cursor-pointer"
                >
                  <option value="newest" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    Mới nhất
                  </option>
                  <option value="oldest" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    Cũ nhất
                  </option>
                  <option value="price_asc" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    Giá: Thấp → Cao
                  </option>
                  <option value="price_desc" className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">
                    Giá: Cao → Thấp
                  </option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Page size */}
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    isUserAction.current = true;
                    setLimit(Number(e.target.value));
                  }}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 py-2.5 pl-3.5 pr-8 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 backdrop-blur-md outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-blue-500/15 dark:focus:ring-cyan-500/15 appearance-none shadow-xs cursor-pointer"
                >
                  <option value={10} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">10 / trang</option>
                  <option value={20} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">20 / trang</option>
                  <option value={50} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">50 / trang</option>
                  <option value={100} className="bg-white text-slate-900 dark:bg-zinc-900 dark:text-white">100 / trang</option>
                </select>
                <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  expand_more
                </span>
              </div>

              {/* Reset filter button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95 shadow-xs"
                  title="Đặt lại tất cả bộ lọc"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>

          {/* ==================== LOADING STATE ==================== */}
          {loading ? (
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-16 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-2xl shadow-sm">
              <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 dark:text-cyan-400">
                sync
              </span>
              <p className="mt-3 text-sm font-bold text-slate-800 dark:text-zinc-200">
                Đang làm mới dữ liệu sản phẩm...
              </p>
            </div>
          ) : pagedProducts.length === 0 ? (
            /* ==================== EMPTY STATE ==================== */
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-16 text-center text-slate-500 dark:text-zinc-400 backdrop-blur-2xl shadow-sm">
              <span className="material-symbols-outlined mx-auto text-5xl mb-3 block opacity-30 text-blue-600 dark:text-cyan-400">
                inventory_2
              </span>
              <p className="text-base font-bold text-slate-800 dark:text-zinc-200">
                Không tìm thấy sản phẩm nào phù hợp
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                Hãy thử thay đổi từ khóa tìm kiếm, danh mục hoặc đặt lại bộ lọc để hiển thị nhiều sản phẩm hơn.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 dark:bg-cyan-950/40 border border-blue-200 dark:border-cyan-800/50 px-4 py-2 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-cyan-900/40 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  <span>Đặt lại bộ lọc</span>
                </button>
              )}
            </div>
          ) : viewMode === "table" ? (
            /* ==================== TABLE VIEW ==================== */
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <tr>
                      {canWrite && (
                        <th className="w-12 px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleToggleSelectAll}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 cursor-pointer"
                            title="Chọn tất cả trên trang"
                          />
                        </th>
                      )}
                      <th className="px-4 py-4">#</th>
                      <th className="px-6 py-4">Sản phẩm & Nhãn hàng</th>
                      <th className="px-6 py-4">Danh mục</th>
                      <th className="px-6 py-4">Giá bán & Biến thể</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-300">
                    {pagedProducts.map((p, idx) => {
                      const stt = (currentPage - 1) * pageSize + idx + 1;
                      const isSelected = selectedIds.has(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors ${
                            isSelected ? "bg-blue-50/40 dark:bg-cyan-950/20" : ""
                          } ${p.isDeleted ? "opacity-60 bg-rose-50/15 dark:bg-rose-950/10" : ""}`}
                        >
                          {canWrite && (
                            <td className="px-4 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(p.id)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 cursor-pointer"
                              />
                            </td>
                          )}

                          <td className="px-4 py-4 font-mono font-bold text-slate-400">
                            #{stt}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-inner group">
                                {p.heroImage ? (
                                  <img
                                    src={p.heroImage}
                                    alt={p.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-slate-400 dark:text-zinc-600 text-2xl">
                                    inventory_2
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <Link
                                  href={`/admin/products/${p.id}/detail`}
                                  className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-2"
                                  title={p.name}
                                >
                                  {p.name}
                                </Link>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:text-cyan-300">
                                    ID: #{p.id}
                                  </span>
                                  {p.sku && (
                                    <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                                      SKU: {p.sku}
                                    </span>
                                  )}
                                  {p.brandName && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:text-cyan-300">
                                      <span className="material-symbols-outlined text-[11px]">verified</span>
                                      {p.brandName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {p.category ? (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                <span className="material-symbols-outlined text-[13px] text-blue-600 dark:text-cyan-400">
                                  category
                                </span>
                                <span>{p.category}</span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-xs text-slate-900 dark:text-white">
                              {formatDisplayPrice(p)}
                            </div>
                            <div className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                              {p.hasVariantPriceRange ? "Đa mức giá biến thể" : "1 mức giá cố định"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {p.isDeleted ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                <span className="material-symbols-outlined text-[14px]">auto_delete</span>
                                <span>Đã xóa mềm</span>
                              </span>
                            ) : p.isHidden ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                                <span>Tạm ẩn</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                <span>Đang bán</span>
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Xem chi tiết */}
                              <Link
                                href={`/admin/products/${p.id}/detail`}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-all"
                                title="Xem chi tiết"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </Link>

                              {/* Sửa nhanh (Modal) */}
                              {canWrite && !p.isDeleted && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenQuickEdit(p)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all active:scale-95"
                                  title="Sửa nhanh (Không cần rời trang)"
                                >
                                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                                </button>
                              )}

                              {/* Chỉnh sửa toàn diện */}
                              {canWrite && !p.isDeleted && (
                                <Link
                                  href={`/admin/products/${p.id}/edit`}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/20 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all active:scale-95"
                                  title="Chỉnh sửa chi tiết & biến thể"
                                >
                                  <span className="material-symbols-outlined text-[16px]">edit</span>
                                </Link>
                              )}

                              {/* Tạm ẩn / Hiện */}
                              {canWrite && !p.isDeleted && !p.isHidden && (
                                <button
                                  type="button"
                                  onClick={() => handleAction("hide", String(p.id))}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                                  title="Tạm ẩn sản phẩm"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                                </button>
                              )}

                              {canWrite && !p.isDeleted && p.isHidden && (
                                <button
                                  type="button"
                                  onClick={() => handleAction("unhide", String(p.id))}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                                  title="Hiển thị lại trên sàn"
                                >
                                  <span className="material-symbols-outlined text-[16px]">public</span>
                                </button>
                              )}

                              {/* Xóa (Chuyển thùng rác) */}
                              {canWrite && !p.isDeleted && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteTarget(p)}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95"
                                  title="Xóa vào thùng rác"
                                >
                                  <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
                              )}

                              {/* Khôi phục */}
                              {canWrite && p.isDeleted && (
                                <button
                                  type="button"
                                  onClick={() => handleAction("restore", String(p.id))}
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                                  title="Khôi phục sản phẩm"
                                >
                                  <span className="material-symbols-outlined text-[16px]">restore_from_trash</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination footer */}
              {totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/10 px-6 py-4 bg-slate-50/60 dark:bg-white/[0.01]">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    Trang <span className="font-bold text-blue-600 dark:text-cyan-400">{currentPage}</span> / {totalPages} · Tổng {totalElements} sản phẩm
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                        currentPage <= 1
                          ? "border-slate-200/40 dark:border-white/5 text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-blue-500 dark:hover:border-cyan-400"
                      }`}
                    >
                      Trang trước
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                        currentPage >= totalPages
                          ? "border-slate-200/40 dark:border-white/5 text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-blue-500 dark:hover:border-cyan-400"
                      }`}
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ==================== GRID VIEW ==================== */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {pagedProducts.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-4 shadow-sm dark:shadow-xl backdrop-blur-2xl transition-all duration-300 hover:border-blue-400/40 dark:hover:border-cyan-500/40 hover:shadow-xl hover:-translate-y-1 ${
                        isSelected ? "ring-2 ring-blue-500 dark:ring-cyan-400" : ""
                      } ${p.isDeleted ? "opacity-60 bg-rose-50/10 dark:bg-rose-950/10" : ""}`}
                    >
                      <div>
                        {/* Image wrapper */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-white/5">
                          {p.heroImage ? (
                            <img
                              src={p.heroImage}
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-zinc-700">
                              <span className="material-symbols-outlined text-4xl">inventory_2</span>
                            </div>
                          )}

                          {/* Checkbox overlay */}
                          {canWrite && (
                            <div className="absolute left-2.5 top-2.5 z-10">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(p.id)}
                                className="h-4 w-4 rounded border-white/60 bg-black/40 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-md"
                              />
                            </div>
                          )}

                          {/* Floating Category Tag */}
                          {p.category && (
                            <div className="absolute left-9 top-2.5">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white shadow-xs">
                                <span className="material-symbols-outlined text-[12px] text-cyan-400">category</span>
                                <span>{p.category}</span>
                              </span>
                            </div>
                          )}

                          {/* Floating Status Tag */}
                          <div className="absolute right-2.5 top-2.5">
                            {p.isDeleted ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white shadow-xs">
                                <span className="material-symbols-outlined text-[12px]">auto_delete</span>
                                <span>Đã xóa</span>
                              </span>
                            ) : p.isHidden ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-600/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white shadow-xs">
                                <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                                <span>Ẩn</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-white shadow-xs">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                <span>Đang bán</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title and details */}
                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                            <span>#{p.id}</span>
                            {p.brandName && (
                              <span className="font-sans font-bold text-blue-600 dark:text-cyan-400 truncate max-w-[120px]">
                                {p.brandName}
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/admin/products/${p.id}/detail`}
                            className="block font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-2 min-h-[40px]"
                            title={p.name}
                          >
                            {p.name}
                          </Link>

                          {/* Price */}
                          <div className="pt-1">
                            <p className="font-headline font-black text-base text-blue-600 dark:text-cyan-400">
                              {formatDisplayPrice(p)}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                              {p.hasVariantPriceRange ? "Đa mức giá biến thể" : "1 mức giá cố định"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div className="mt-4 border-t border-slate-100 dark:border-white/10 pt-3 flex items-center justify-between gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}/detail`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          <span>Chi tiết</span>
                        </Link>

                        <div className="flex items-center gap-1">
                          {canWrite && !p.isDeleted && (
                            <button
                              type="button"
                              onClick={() => handleOpenQuickEdit(p)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all active:scale-95"
                              title="Sửa nhanh"
                            >
                              <span className="material-symbols-outlined text-[15px]">bolt</span>
                            </button>
                          )}

                          {canWrite && !p.isDeleted && (
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/80 dark:bg-blue-950/20 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all active:scale-95"
                              title="Chỉnh sửa"
                            >
                              <span className="material-symbols-outlined text-[15px]">edit</span>
                            </Link>
                          )}

                          {canWrite && !p.isDeleted && !p.isHidden && (
                            <button
                              type="button"
                              onClick={() => handleAction("hide", String(p.id))}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
                              title="Ẩn"
                            >
                              <span className="material-symbols-outlined text-[15px]">visibility_off</span>
                            </button>
                          )}

                          {canWrite && !p.isDeleted && p.isHidden && (
                            <button
                              type="button"
                              onClick={() => handleAction("unhide", String(p.id))}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                              title="Hiện lại"
                            >
                              <span className="material-symbols-outlined text-[15px]">public</span>
                            </button>
                          )}

                          {canWrite && !p.isDeleted && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(p)}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95"
                              title="Xóa vào thùng rác"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          )}

                          {canWrite && p.isDeleted && (
                            <button
                              type="button"
                              onClick={() => handleAction("restore", String(p.id))}
                              className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-95"
                              title="Khôi phục"
                            >
                              <span className="material-symbols-outlined text-[15px]">restore_from_trash</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Pagination footer */}
              {totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 px-6 py-4 shadow-sm backdrop-blur-2xl">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    Trang <span className="font-bold text-blue-600 dark:text-cyan-400">{currentPage}</span> / {totalPages} · Tổng {totalElements} sản phẩm
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                        currentPage <= 1
                          ? "border-slate-200/40 dark:border-white/5 text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-blue-500 dark:hover:border-cyan-400"
                      }`}
                    >
                      Trang trước
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                        currentPage >= totalPages
                          ? "border-slate-200/40 dark:border-white/5 text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                          : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-blue-500 dark:hover:border-cyan-400"
                      }`}
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== FLOATING BULK ACTIONS BAR ==================== */}
      {selectedIds.size > 0 && canWrite && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-full border border-slate-200/80 dark:border-white/20 bg-white/95 dark:bg-zinc-900/95 px-5 py-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-zinc-100 pr-2 border-r border-slate-200 dark:border-white/10">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 dark:bg-cyan-500 text-[10px] text-white">
              {selectedIds.size}
            </span>
            <span>Đã chọn</span>
          </div>

          {/* Bulk Hide */}
          <button
            type="button"
            onClick={handleBulkHide}
            disabled={isBulkProcessing}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">visibility_off</span>
            <span>Tạm ẩn</span>
          </button>

          {/* Bulk Unhide */}
          <button
            type="button"
            onClick={handleBulkUnhide}
            disabled={isBulkProcessing}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>Hiện lại</span>
          </button>

          {/* Bulk Delete */}
          <button
            type="button"
            onClick={() => setBulkDeleteModalOpen(true)}
            disabled={isBulkProcessing}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Xóa đã chọn</span>
          </button>

          {/* Clear Selection */}
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-all"
            title="Bỏ chọn tất cả"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* ==================== QUICK EDIT MODAL ==================== */}
      {quickEditProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Sửa nhanh sản phẩm
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: #{quickEditProduct.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-zinc-200 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveQuickEdit} className="mt-4 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="Nhập tên sản phẩm..."
                />
              </div>

              {/* Price & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                    Giá niêm yết (₫) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/50 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {Number(quickPrice) > 0 && (
                    <p className="mt-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                      ≈ {Number(quickPrice).toLocaleString("vi-VN")} ₫
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Mã SKU
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomSku}
                      className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline"
                    >
                      Tạo ngẫu nhiên
                    </button>
                  </div>
                  <input
                    type="text"
                    value={quickSku}
                    onChange={(e) => setQuickSku(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/50 px-4 py-2.5 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    placeholder="VD: PRD-IPHONE15"
                  />
                </div>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                    Danh mục
                  </label>
                  <select
                    value={quickCategoryId}
                    onChange={(e) => setQuickCategoryId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/50 px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">(Chưa chọn)</option>
                    {categories?.map((c: any) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                    Thương hiệu
                  </label>
                  <select
                    value={quickBrandId}
                    onChange={(e) => setQuickBrandId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/50 px-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">(Không có)</option>
                    {brands?.map((b: any) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Full Edit Link notice */}
              <div className="rounded-2xl bg-blue-50/60 dark:bg-cyan-950/20 border border-blue-200/60 dark:border-cyan-900/40 p-3 text-[11px] text-blue-700 dark:text-cyan-300 flex items-center justify-between">
                <span>Cần sửa biến thể, hình ảnh gallery hoặc mô tả dài?</span>
                <Link
                  href={`/admin/products/${quickEditProduct.id}/edit`}
                  className="font-bold underline ml-2 shrink-0 hover:text-blue-900 dark:hover:text-cyan-100"
                >
                  Mở trang sửa đầy đủ →
                </Link>
              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setQuickEditProduct(null)}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickEdit}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 dark:bg-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-400 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSavingQuickEdit ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Lưu thay đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE SINGLE CONFIRMATION MODAL ==================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Xác nhận xóa sản phẩm?
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Hành động này sẽ chuyển sản phẩm vào Thùng rác (Xóa mềm).
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/60 p-3.5 flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-zinc-800">
                {deleteTarget.heroImage ? (
                  <img src={deleteTarget.heroImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400 text-xl">inventory_2</span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                  {deleteTarget.name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  #{deleteTarget.id} · {formatDisplayPrice(deleteTarget)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              💡 Bạn vẫn có thể khôi phục sản phẩm bất kỳ lúc nào từ bộ lọc &quot;Đã xóa mềm&quot;.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== BULK DELETE CONFIRMATION MODAL ==================== */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <span className="material-symbols-outlined text-2xl">auto_delete</span>
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Xóa hàng loạt {selectedIds.size} sản phẩm?
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Tất cả các sản phẩm đã chọn sẽ được chuyển vào thùng rác.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed rounded-2xl bg-slate-50 dark:bg-zinc-900 p-3 border border-slate-100 dark:border-white/5">
              Số lượng sản phẩm: <span className="font-bold text-rose-600 dark:text-rose-400">{selectedIds.size} mục</span>. Sau khi xóa, bạn có thể chuyển bộ lọc sang &quot;Đã xóa mềm&quot; để khôi phục khi cần.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setBulkDeleteModalOpen(false)}
                className="rounded-2xl border border-slate-200 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkProcessing}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isBulkProcessing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Xác nhận xóa tất cả</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
