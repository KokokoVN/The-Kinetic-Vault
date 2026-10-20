"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminProductSpec, AdminProductVariant } from "@/lib/api";
import { resolveCatalogImageUrl } from "@/lib/api";
import { useProductCompare } from "./product-compare-context";
import { CompareProductPickerModal } from "./compare-product-picker-modal";
import { toast } from "sonner";

export type ComparedProductData = {
  id: number;
  name: string;
  category?: string | null;
  image?: string;
  rawPrice: number;
  effectivePrice?: number | null;
  stock: number;
  variants: AdminProductVariant[];
  specs: AdminProductSpec[];
  salesCount?: number | null;
};

function asCurrencyVnd(val: number | string | null | undefined): string {
  if (val == null) return "—";
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d]/g, ""));
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
}

function specValueFormatted(spec?: AdminProductSpec | null): string {
  if (!spec || !spec.specValue) return "—";
  const unit = spec.unit?.trim();
  return unit ? `${spec.specValue} ${unit}` : spec.specValue;
}

const SPEC_GROUP_ICONS: Record<string, string> = {
  "Hiệu năng": "memory",
  "Màn hình": "smartphone",
  "Camera": "photo_camera",
  "Pin & Sạc": "battery_charging_full",
  "Thiết kế": "palette",
  "Tính năng": "auto_awesome",
  "Kết nối": "wifi",
  "Bộ nhớ & Lưu trữ": "sd_storage",
  "Thông tin chung": "info",
};

export function CompareView({
  initialProducts,
}: {
  initialProducts: ComparedProductData[];
}) {
  const router = useRouter();
  const { removeFromCompare, clearCompare, addToCompare } = useProductCompare();
  const [products, setProducts] = useState<ComparedProductData[]>(initialProducts);
  const [onlyDifferences, setOnlyDifferences] = useState<boolean>(false);
  const [specSearch, setSpecSearch] = useState<string>("");
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const maxSlots = 4;
  const alreadySelectedIds = useMemo(() => products.map((p) => Number(p.id)), [products]);

  // Handle removing a product from compare
  const handleRemove = (productId: number) => {
    removeFromCompare(productId);
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    if (updated.length > 0) {
      router.push(`/compare?ids=${updated.map((p) => p.id).join(",")}`);
    } else {
      router.push(`/compare`);
    }
  };

  // Handle adding a product to compare via modal
  const handleSelectProduct = async (newId: number) => {
    try {
      const res = await fetch(`/api/catalog/products/${newId}`);
      if (!res.ok) {
        toast.error("Không thể lấy dữ liệu sản phẩm");
        return;
      }
      const data = await res.json();

      // Fetch variants and specs in parallel via internal/Next API
      const [vRes, sRes] = await Promise.all([
        fetch(`/api/catalog/products/${newId}/variants`).catch(() => null),
        fetch(`/api/catalog/products/${newId}/specs`).catch(() => null),
      ]);

      const variants = vRes && vRes.ok ? await vRes.json().catch(() => []) : [];
      const specs = sRes && sRes.ok ? await sRes.json().catch(() => []) : [];

      const rawImg = data.imageUrl ?? data.image ?? data.primaryImageUrl;
      const resolvedImg = resolveCatalogImageUrl(rawImg);

      const newProd: ComparedProductData = {
        id: data.id,
        name: data.productName ?? data.name ?? "Sản phẩm",
        category: data.categoryName ?? data.category?.categoryName,
        image: resolvedImg,
        rawPrice: data.price ?? 0,
        effectivePrice: null,
        stock: data.availability ?? data.stock ?? 0,
        variants: Array.isArray(variants) ? variants : [],
        specs: Array.isArray(specs) ? specs : [],
        salesCount: data.salesCount ?? null,
      };

      addToCompare({
        id: newProd.id,
        title: newProd.name,
        image: newProd.image || "",
        price: newProd.rawPrice,
      });

      const updated = [...products, newProd];
      setProducts(updated);
      router.push(`/compare?ids=${updated.map((p) => p.id).join(",")}`);
    } catch {
      toast.error("Lỗi khi thêm sản phẩm vào so sánh");
    }
  };

  // ── Price Comparisons Stats ─────────────────────────────────
  const priceStats = useMemo(() => {
    if (products.length === 0) return { minPrice: 0, maxPrice: 0, diffMax: 0 };
    const prices = products.map((p) => (p.effectivePrice != null ? p.effectivePrice : p.rawPrice));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const diffMax = maxPrice - minPrice;
    return { minPrice, maxPrice, diffMax };
  }, [products]);

  // ── Specifications Matrix ───────────────────────────────────
  const { allGroups, specDifferenceCount, totalSpecsCount } = useMemo(() => {
    const groupMap = new Map<string, Set<string>>();

    products.forEach((prod) => {
      prod.specs.forEach((s) => {
        const gName = s.specGroup?.trim() || "Thông tin chung";
        if (!groupMap.has(gName)) {
          groupMap.set(gName, new Set<string>());
        }
        groupMap.get(gName)!.add(s.specKey.trim());
      });
    });

    let diffCount = 0;
    let totalCount = 0;

    const formattedGroups: Array<{
      groupName: string;
      keys: Array<{
        key: string;
        isDifferent: boolean;
        values: Array<{ productId: number; spec?: AdminProductSpec | null }>;
      }>;
    }> = [];

    groupMap.forEach((keySet, gName) => {
      const keysArray: Array<{
        key: string;
        isDifferent: boolean;
        values: Array<{ productId: number; spec?: AdminProductSpec | null }>;
      }> = [];

      keySet.forEach((key) => {
        totalCount++;
        const values = products.map((p) => {
          const spec = p.specs.find(
            (s) =>
              s.specKey.trim().toLowerCase() === key.toLowerCase() &&
              (s.specGroup?.trim() || "Thông tin chung").toLowerCase() === gName.toLowerCase()
          );
          return { productId: p.id, spec };
        });

        const renderedValues = values.map((v) => specValueFormatted(v.spec).toLowerCase());
        const hasDifference = new Set(renderedValues).size > 1;
        if (hasDifference) {
          diffCount++;
        }

        keysArray.push({
          key,
          isDifferent: hasDifference,
          values,
        });
      });

      formattedGroups.push({
        groupName: gName,
        keys: keysArray,
      });
    });

    return {
      allGroups: formattedGroups,
      specDifferenceCount: diffCount,
      totalSpecsCount: totalCount,
    };
  }, [products]);

  // Filter specs by difference toggle and search
  const displayedGroups = useMemo(() => {
    const q = specSearch.trim().toLowerCase();

    return allGroups
      .map((group) => {
        const filteredKeys = group.keys.filter((item) => {
          if (onlyDifferences && !item.isDifferent) return false;
          if (!q) return true;
          if (item.key.toLowerCase().includes(q)) return true;
          return item.values.some((v) =>
            specValueFormatted(v.spec).toLowerCase().includes(q)
          );
        });

        return {
          ...group,
          keys: filteredKeys,
        };
      })
      .filter((group) => group.keys.length > 0);
  }, [allGroups, onlyDifferences, specSearch]);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl py-24 px-4 text-center">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-pink-500/20 text-indigo-500 dark:text-indigo-400 mb-8 ring-1 ring-indigo-500/30 shadow-2xl">
          <span className="material-symbols-outlined text-[52px]">balance</span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500" />
          </span>
        </div>
        <h2 className="font-headline text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Chưa Có Sản Phẩm Nào Để Đối Chiếu
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Khám phá danh mục công nghệ hoặc bấm nút bên dưới để chọn ngay các dòng sản phẩm bạn muốn đặt lên bàn cân so sánh chi tiết.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>Chọn sản phẩm so sánh</span>
          </button>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-400 backdrop-blur-md transition-all"
          >
            <span className="material-symbols-outlined text-[19px]">explore</span>
            <span>Khám phá sản phẩm</span>
          </Link>
        </div>

        <CompareProductPickerModal
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={handleSelectProduct}
          alreadySelectedIds={alreadySelectedIds}
        />
      </div>
    );
  }

  // Identify comparison headliners (e.g. Galaxy S24 Ultra vs iPhone 16 Pro Max)
  const productA = products[0];
  const productB = products[1];

  return (
    <div className="space-y-8 pb-24">
      {/* ── VIP Top Hero Banner & Highlights ─────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/40 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-purple-950/90 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-indigo-300 backdrop-blur-md">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Flagship Comparison Engine</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bảng Đối Chiếu Siêu Phẩm Công Nghệ
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Phân tích đa chiều về bảng giá niêm yết, các biến thể dung lượng và ma trận chi tiết cấu hình phần cứng giữa {products.length} siêu phẩm đang được chọn.
            </p>
          </div>

          {/* Quick Price Delta Summary Badge */}
          {products.length >= 2 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 sm:p-5 backdrop-blur-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30">
                <span className="material-symbols-outlined text-[24px]">price_change</span>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Chênh lệch giá tối đa
                </p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-mono text-lg sm:text-xl font-black text-amber-300">
                    {asCurrencyVnd(priceStats.diffMax)}
                  </span>
                  {priceStats.minPrice > 0 && (
                    <span className="text-xs font-bold text-amber-200/80">
                      (~{Math.round((priceStats.diffMax / priceStats.minPrice) * 100)}%)
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate max-w-[220px]">
                  {products.find((p) => (p.effectivePrice ?? p.rawPrice) === priceStats.minPrice)?.name} có giá tốt nhất
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Control Bar: Filters, Differences, Add Product ──────── */}
      <div className="sticky top-20 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0b0f19]/90 p-4 sm:p-5 backdrop-blur-2xl shadow-xl transition-all">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            <span className="material-symbols-outlined text-[22px]">tune</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline text-base font-black text-slate-900 dark:text-white">
                Bộ lọc đối chiếu
              </h2>
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                {products.length}/{maxSlots} SP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {totalSpecsCount} thông số kỹ thuật • {specDifferenceCount} điểm khác biệt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Difference Toggle */}
          <button
            type="button"
            onClick={() => setOnlyDifferences((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition-all shadow-sm ${
              onlyDifferences
                ? "bg-amber-500 text-white shadow-amber-500/30 ring-2 ring-amber-400/40"
                : "bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80"
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {onlyDifferences ? "check_circle" : "difference"}
            </span>
            <span>Chỉ xem điểm khác biệt ({specDifferenceCount})</span>
          </button>

          {/* Add Product Button */}
          {products.length < maxSlots && (
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-indigo-600/25 hover:bg-indigo-500 active:scale-[0.98] transition"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Thêm sản phẩm</span>
            </button>
          )}

          {/* Clear All */}
          <button
            type="button"
            onClick={() => {
              clearCompare();
              setProducts([]);
              router.push("/compare");
            }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-900/50 transition"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* ── Main Comparison Table ──────────────────────────────── */}
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#0c101b]/95 backdrop-blur-2xl shadow-2xl">
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[840px] border-collapse text-left">
            {/* ── STICKY PRODUCT HEADER ROW ───────────────────────── */}
            <thead>
              <tr className="border-b border-slate-200/90 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-950/90 sticky top-36 z-30 backdrop-blur-2xl">
                {/* Column 0: Spec Search & Label */}
                <th className="w-1/5 min-w-[220px] p-6 align-top">
                  <div className="space-y-3">
                    <span className="font-headline text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                      Sản phẩm đối chiếu
                    </span>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[17px] text-slate-400">
                        search
                      </span>
                      <input
                        type="text"
                        value={specSearch}
                        onChange={(e) => setSpecSearch(e.target.value)}
                        placeholder="Tìm thông số..."
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      {specSearch && (
                        <button
                          type="button"
                          onClick={() => setSpecSearch("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                </th>

                {/* Columns 1..N: Product Cards */}
                {products.map((prod) => {
                  const currentPrice = prod.effectivePrice != null ? prod.effectivePrice : prod.rawPrice;
                  const isBestPrice = currentPrice === priceStats.minPrice && products.length > 1;

                  return (
                    <th
                      key={prod.id}
                      className="w-1/5 min-w-[240px] p-6 align-top border-l border-slate-100 dark:border-slate-800/80"
                    >
                      <div className="relative flex flex-col h-full group">
                        {/* Remove Cross Button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(prod.id)}
                          className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition shadow-sm"
                          title="Gỡ khỏi so sánh"
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>

                        {/* Best Price Ribbon Badge */}
                        {isBestPrice ? (
                          <div className="mb-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              Giá tốt nhất
                            </span>
                          </div>
                        ) : (
                          <div className="h-6 mb-2" />
                        )}

                        {/* Product Image Thumbnail */}
                        <Link
                          href={`/product/${prod.id}`}
                          className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 mb-3 group-hover:shadow-lg transition-all"
                        >
                          <img
                            src={prod.image || "/placeholder.png"}
                            alt={prod.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>

                        {/* Category */}
                        {prod.category && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">
                            {prod.category}
                          </span>
                        )}

                        {/* Product Name */}
                        <Link
                          href={`/product/${prod.id}`}
                          className="font-headline text-sm font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2 transition leading-snug mb-3"
                        >
                          {prod.name}
                        </Link>

                        {/* Pricing */}
                        <div className="mt-auto pt-2">
                          <p className="font-headline text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                            {asCurrencyVnd(currentPrice)}
                          </p>
                          {prod.effectivePrice != null && prod.rawPrice > prod.effectivePrice && (
                            <p className="text-[11px] line-through text-slate-400 font-bold">
                              {asCurrencyVnd(prod.rawPrice)}
                            </p>
                          )}
                        </div>

                        {/* Quick CTA Button */}
                        <div className="mt-4 flex flex-col gap-2">
                          <Link
                            href={`/product/${prod.id}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2.5 text-xs font-black text-white hover:opacity-95 shadow-md shadow-indigo-600/20 transition"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>Xem chi tiết</span>
                          </Link>
                        </div>
                      </div>
                    </th>
                  );
                })}

                {/* Empty Slot Column Placeholders */}
                {Array.from({ length: maxSlots - products.length }).map((_, idx) => (
                  <th
                    key={`empty-col-${idx}`}
                    className="w-1/5 min-w-[240px] p-6 align-top border-l border-slate-100 dark:border-slate-800/80"
                  >
                    <div
                      onClick={() => setIsPickerOpen(true)}
                      className="flex flex-col items-center justify-center h-80 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20 hover:border-indigo-500/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all cursor-pointer p-5 text-center group"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm mb-3">
                        <span className="material-symbols-outlined text-[28px]">add</span>
                      </div>
                      <p className="text-xs sm:text-sm font-black text-slate-700 dark:text-slate-300">
                        Thêm sản phẩm so sánh
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Còn trống {maxSlots - products.length} vị trí
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* ═══════════════════════════════════════════════════ */}
              {/* SECTION 1: GIÁ BÁN & KHUYẾN MÃI                     */}
              {/* ═══════════════════════════════════════════════════ */}
              <tr className="bg-gradient-to-r from-indigo-50/80 via-indigo-50/40 to-transparent dark:from-indigo-950/50 dark:via-indigo-950/20 dark:to-transparent border-t border-b border-indigo-100 dark:border-indigo-900/50">
                <td colSpan={maxSlots + 1} className="px-6 py-3.5 font-headline text-xs font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">payments</span>
                    <span>1. Đối Chiếu Bảng Giá & Khuyến Mãi</span>
                  </div>
                </td>
              </tr>

              {/* Row: Giá bán hiện tại */}
              <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                <td className="p-4 sm:p-5 font-bold text-xs text-slate-500 dark:text-slate-400">
                  Giá bán hiện tại
                </td>
                {products.map((p) => {
                  const cur = p.effectivePrice != null ? p.effectivePrice : p.rawPrice;
                  return (
                    <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80">
                      <span className="font-mono text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                        {asCurrencyVnd(cur)}
                      </span>
                    </td>
                  );
                })}
                {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                  <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                ))}
              </tr>

              {/* Row: Chênh lệch giá */}
              <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                <td className="p-4 sm:p-5 font-bold text-xs text-slate-500 dark:text-slate-400">
                  So với giá rẻ nhất
                </td>
                {products.map((p) => {
                  const cur = p.effectivePrice != null ? p.effectivePrice : p.rawPrice;
                  const diff = cur - priceStats.minPrice;
                  return (
                    <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80">
                      {diff === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
                          <span className="material-symbols-outlined text-[15px]">check_circle</span>
                          Mức giá thấp nhất
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          +{asCurrencyVnd(diff)} ({Math.round((diff / priceStats.minPrice) * 100)}%)
                        </span>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                  <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                ))}
              </tr>

              {/* Row: Khoảng giá theo biến thể */}
              <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                <td className="p-4 sm:p-5 font-bold text-xs text-slate-500 dark:text-slate-400">
                  Khoảng giá các biến thể
                </td>
                {products.map((p) => {
                  const variantPrices = p.variants
                    .map((v) => (v.price != null ? Number(v.price) : p.rawPrice))
                    .filter((pr) => !isNaN(pr));
                  const minV = variantPrices.length > 0 ? Math.min(...variantPrices) : p.rawPrice;
                  const maxV = variantPrices.length > 0 ? Math.max(...variantPrices) : p.rawPrice;

                  return (
                    <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80 text-xs font-medium font-mono text-slate-700 dark:text-slate-300">
                      {minV < maxV ? (
                        <span>
                          {asCurrencyVnd(minV)} ~ {asCurrencyVnd(maxV)}
                        </span>
                      ) : (
                        <span>Cố định {asCurrencyVnd(minV)}</span>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                  <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                ))}
              </tr>

              {/* Row: Tồn kho */}
              <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                <td className="p-4 sm:p-5 font-bold text-xs text-slate-500 dark:text-slate-400">
                  Trạng thái kho hàng
                </td>
                {products.map((p) => {
                  const totalStock = p.variants.length > 0
                    ? p.variants.reduce((sum, v) => sum + (v.availability ?? 0), 0)
                    : p.stock;

                  return (
                    <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80 text-xs">
                      {totalStock > 0 ? (
                        <span className="inline-flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Sẵn sàng giao ({totalStock} máy)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-bold text-rose-500">
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          Tạm hết hàng
                        </span>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                  <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                ))}
              </tr>

              {/* ═══════════════════════════════════════════════════ */}
              {/* SECTION 2: BIẾN THỂ & PHÂN LOẠI                     */}
              {/* ═══════════════════════════════════════════════════ */}
              <tr className="bg-gradient-to-r from-purple-50/80 via-purple-50/40 to-transparent dark:from-purple-950/50 dark:via-purple-950/20 dark:to-transparent border-t border-b border-purple-100 dark:border-purple-900/50">
                <td colSpan={maxSlots + 1} className="px-6 py-3.5 font-headline text-xs font-black uppercase tracking-[0.2em] text-purple-700 dark:text-purple-300">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">layers</span>
                    <span>2. Biến Thể, Dung Lượng & Màu Sắc</span>
                  </div>
                </td>
              </tr>

              {/* Row: Số lượng biến thể */}
              <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                <td className="p-4 sm:p-5 font-bold text-xs text-slate-500 dark:text-slate-400">
                  Số lượng tùy chọn
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80 text-xs font-black">
                    {p.variants.length > 0 ? (
                      <span className="rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 px-3 py-1">
                        {p.variants.length} phân loại có sẵn
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">Phiên bản tiêu chuẩn</span>
                    )}
                  </td>
                ))}
                {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                  <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                ))}
              </tr>

              {/* Row: Danh sách biến thể */}
              <tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition">
                <td className="p-4 sm:p-5 font-bold text-xs text-slate-500 dark:text-slate-400">
                  Chi tiết các lựa chọn
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80 align-top">
                    {p.variants.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                        {p.variants.map((v) => {
                          const name = v.variantName || `${v.color || ""} ${v.size || ""}`.trim() || `BT #${v.id}`;
                          return (
                            <span
                              key={v.id}
                              className="rounded-xl border border-purple-200/60 dark:border-purple-800/60 bg-white/80 dark:bg-slate-850 px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                              title={name}
                            >
                              {name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                ))}
                {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                  <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                ))}
              </tr>

              {/* ═══════════════════════════════════════════════════ */}
              {/* SECTION 3: MA TRẬN THÔNG SỐ KỸ THUẬT CHI TIẾT       */}
              {/* ═══════════════════════════════════════════════════ */}
              <tr className="bg-gradient-to-r from-slate-100/90 via-slate-100/40 to-transparent dark:from-slate-800/90 dark:via-slate-800/40 dark:to-transparent border-t border-b border-slate-200 dark:border-slate-700">
                <td colSpan={maxSlots + 1} className="px-6 py-3.5 font-headline text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">developer_board</span>
                    <span>3. Ma Trận Thông Số Kỹ Thuật Chi Tiết</span>
                  </div>
                </td>
              </tr>

              {displayedGroups.length === 0 ? (
                <tr>
                  <td colSpan={maxSlots + 1} className="p-8 text-center text-xs text-slate-400">
                    {specSearch
                      ? `Không tìm thấy thông số nào phù hợp với từ khóa "${specSearch}"`
                      : "Không có điểm khác biệt nào theo bộ lọc đã chọn"}
                  </td>
                </tr>
              ) : (
                displayedGroups.map((group) => {
                  const iconName = SPEC_GROUP_ICONS[group.groupName] || "settings";

                  return (
                    <React.Fragment key={group.groupName}>
                      {/* Group Header */}
                      <tr className="bg-slate-50/70 dark:bg-slate-950/50">
                        <td
                          colSpan={maxSlots + 1}
                          className="px-6 py-3 font-headline text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border-t border-b border-slate-200/50 dark:border-slate-800/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">{iconName}</span>
                            <span>{group.groupName}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Group Attributes */}
                      {group.keys.map((item) => (
                        <tr
                          key={item.key}
                          className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                            item.isDifferent
                              ? "bg-amber-500/[0.04] dark:bg-amber-400/[0.03] hover:bg-amber-500/[0.08]"
                              : "hover:bg-slate-50/50 dark:hover:bg-slate-850/40"
                          }`}
                        >
                          <td className="p-4 sm:p-5 font-bold text-xs text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2">
                              <span>{item.key}</span>
                              {item.isDifferent && (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400"
                                  title="Các sản phẩm có thông số khác nhau"
                                >
                                  Khác biệt
                                </span>
                              )}
                            </div>
                          </td>

                          {item.values.map((val) => (
                            <td
                              key={val.productId}
                              className={`p-4 sm:p-5 border-l border-slate-100 dark:border-slate-800/80 text-xs ${
                                item.isDifferent
                                  ? "font-black text-slate-900 dark:text-white"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {val.spec ? (
                                <div className="space-y-0.5">
                                  <span>{specValueFormatted(val.spec)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600">—</span>
                              )}
                            </td>
                          ))}

                          {Array.from({ length: maxSlots - products.length }).map((_, i) => (
                            <td key={i} className="p-4 border-l border-slate-100 dark:border-slate-800/80" />
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: VIP Expert Verdict & Recommendation Cards ─── */}
      <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/60 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-indigo-950/40 p-6 sm:p-10 shadow-xl">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h3 className="font-headline text-xl font-black text-slate-900 dark:text-white">
              Tổng Kết & Lời Khuyên Mua Sắm VIP
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Điểm nhấn cốt lõi giúp bạn đưa ra quyết định chọn mua phù hợp nhất
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const cur = p.effectivePrice != null ? p.effectivePrice : p.rawPrice;
            const isLowestPrice = cur === priceStats.minPrice;
            const hasMostVariants =
              p.variants.length === Math.max(...products.map((prod) => prod.variants.length)) &&
              p.variants.length > 0;
            const hasMostSpecs =
              p.specs.length === Math.max(...products.map((prod) => prod.specs.length)) &&
              p.specs.length > 0;

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850/90 p-5 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                      <img src={p.image || "/placeholder.png"} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-black text-sm text-slate-900 dark:text-white" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {asCurrencyVnd(cur)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    {isLowestPrice && (
                      <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[17px]">savings</span>
                        <span>Mức giá tối ưu ngân sách nhất</span>
                      </div>
                    )}
                    {hasMostVariants && (
                      <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined text-[17px]">palette</span>
                        <span>Nhiều lựa chọn phiên bản nhất ({p.variants.length} bản)</span>
                      </div>
                    )}
                    {hasMostSpecs && (
                      <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                        <span className="material-symbols-outlined text-[17px]">stars</span>
                        <span>Cấu hình công bố chi tiết toàn diện</span>
                      </div>
                    )}
                    {!isLowestPrice && !hasMostVariants && !hasMostSpecs && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="material-symbols-outlined text-[17px] text-indigo-500">check_circle</span>
                        <span>Trải nghiệm flagship đỉnh cao & ổn định</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/product/${p.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 text-xs font-black tracking-wide hover:opacity-90 transition-all shadow-md"
                  >
                    <span>Khám phá ngay</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CompareProductPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectProduct}
        alreadySelectedIds={alreadySelectedIds}
      />
    </div>
  );
}
