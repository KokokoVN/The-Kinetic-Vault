"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { type UiProduct, type BackendCategory } from "@/lib/api";

type Props = {
  brand: {
    id: number;
    name: string;
    slug?: string | null;
    logoUrl?: string | null;
  };
  categories: BackendCategory[];
  products: UiProduct[];
  canWrite?: boolean;
};

type CategoryGroup = {
  id: number;
  name: string;
  slug?: string | null;
  imageUrl?: string | null;
  products: UiProduct[];
  productCount: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  percentage: number;
};

function getCategoryDesign(name: string): { icon: string; gradient: string; glow: string; color: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("điện thoại") || n.includes("phone") || n.includes("mobile") || n.includes("tai nghe") || n.includes("phụ kiện")) {
    return { icon: "devices", gradient: "from-blue-600 to-cyan-500", glow: "shadow-blue-500/20", color: "text-blue-600 dark:text-cyan-400" };
  }
  if (n.includes("laptop") || n.includes("máy tính") || n.includes("computer") || n.includes("pc")) {
    return { icon: "laptop_chromebook", gradient: "from-indigo-600 to-blue-500", glow: "shadow-indigo-500/20", color: "text-indigo-600 dark:text-indigo-400" };
  }
  if (n.includes("áo") || n.includes("quần") || n.includes("thời trang") || n.includes("giày") || n.includes("apparel") || n.includes("fashion")) {
    return { icon: "apparel", gradient: "from-purple-600 to-pink-500", glow: "shadow-purple-500/20", color: "text-purple-600 dark:text-purple-400" };
  }
  if (n.includes("bếp") || n.includes("nồi") || n.includes("gia dụng") || n.includes("chén") || n.includes("kitchen") || n.includes("dining")) {
    return { icon: "kitchen", gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20", color: "text-amber-600 dark:text-amber-400" };
  }
  if (n.includes("mỹ phẩm") || n.includes("son") || n.includes("phấn") || n.includes("skincare") || n.includes("beauty")) {
    return { icon: "face", gradient: "from-rose-500 to-pink-500", glow: "shadow-rose-500/20", color: "text-rose-600 dark:text-rose-400" };
  }
  if (n.includes("sách") || n.includes("vở") || n.includes("bút") || n.includes("book") || n.includes("stationery")) {
    return { icon: "menu_book", gradient: "from-emerald-600 to-teal-500", glow: "shadow-emerald-500/20", color: "text-emerald-600 dark:text-emerald-400" };
  }
  if (n.includes("đồng hồ") || n.includes("watch")) {
    return { icon: "watch", gradient: "from-cyan-600 to-blue-500", glow: "shadow-cyan-500/20", color: "text-cyan-600 dark:text-cyan-400" };
  }
  if (n.includes("thể thao") || n.includes("dã ngoại") || n.includes("xe đạp") || n.includes("sports") || n.includes("outdoor")) {
    return { icon: "sports_soccer", gradient: "from-teal-600 to-cyan-500", glow: "shadow-teal-500/20", color: "text-teal-600 dark:text-teal-400" };
  }
  
  return { icon: "category", gradient: "from-blue-600 to-indigo-600", glow: "shadow-blue-500/20", color: "text-blue-600 dark:text-indigo-400" };
}

function formatVnd(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
}

export function BrandCategoriesView({ brand, categories, products, canWrite }: Props) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");

  // Map category details by id
  const categoryMap = useMemo(() => {
    const map = new Map<number, BackendCategory>();
    categories.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [categories]);

  // Group products by category
  const categoryGroups: CategoryGroup[] = useMemo(() => {
    const groupMap = new Map<number, UiProduct[]>();

    products.forEach((p) => {
      const catId = p.categoryId ?? 0;
      const list = groupMap.get(catId) || [];
      list.push(p);
      groupMap.set(catId, list);
    });

    const groups: CategoryGroup[] = [];
    const totalCount = products.length || 1;

    groupMap.forEach((prods, catId) => {
      const catInfo = categoryMap.get(catId);
      const catName = catInfo?.name ?? prods[0]?.category ?? (catId === 0 ? "Chưa phân loại" : `Danh mục #${catId}`);
      const catSlug = catInfo?.slug ?? null;
      const catImage = catInfo?.imageUrl ?? null;
      const totalStock = prods.reduce((sum, item) => sum + (item.stock ?? 0), 0);
      
      const prices = prods.map((item) => item.rawPrice ?? 0).filter((pr) => pr > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      groups.push({
        id: catId,
        name: catName,
        slug: catSlug,
        imageUrl: catImage,
        products: prods,
        productCount: prods.length,
        totalStock,
        minPrice,
        maxPrice,
        percentage: Math.round((prods.length / totalCount) * 100),
      });
    });

    // Sort groups with highest product count first
    groups.sort((a, b) => b.productCount - a.productCount);
    return groups;
  }, [products, categoryMap]);

  // Filtered groups & products based on selection & search
  const filteredGroups = useMemo(() => {
    let result = categoryGroups;

    if (selectedCategoryId !== "all") {
      result = result.filter((g) => g.id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result
        .map((g) => ({
          ...g,
          products: g.products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              (p.sku && p.sku.toLowerCase().includes(q))
          ),
        }))
        .filter((g) => g.products.length > 0);
    }

    return result;
  }, [categoryGroups, selectedCategoryId, searchQuery]);

  // Flattened products for table view
  const allFilteredProducts = useMemo(() => {
    return filteredGroups.flatMap((g) => g.products);
  }, [filteredGroups]);

  return (
    <div className="space-y-8">
      {/* ==================== CATEGORY OVERVIEW CARDS ==================== */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-cyan-400">category</span>
              <span>Danh mục phân phối của {brand.name} ({categoryGroups.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nhấp vào từng danh mục để lọc nhanh các dòng sản phẩm tương ứng.
            </p>
          </div>
          {selectedCategoryId !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId("all")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Xem tất cả danh mục</span>
            </button>
          )}
        </div>

        {categoryGroups.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 p-8 text-center text-slate-400 dark:text-zinc-500 backdrop-blur-xl">
            <span className="material-symbols-outlined text-4xl block mb-2 opacity-40">category</span>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Thương hiệu chưa được gắn vào danh mục nào</p>
            <p className="text-xs mt-1">Các sản phẩm thuộc {brand.name} khi tạo mới sẽ tự động được phân nhóm danh mục tại đây.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {categoryGroups.map((group) => {
              const design = getCategoryDesign(group.name);
              const isSelected = selectedCategoryId === group.id;

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedCategoryId(isSelected ? "all" : group.id)}
                  className={`group relative overflow-hidden rounded-[2rem] border p-5 cursor-pointer transition-all duration-300 backdrop-blur-2xl flex flex-col justify-between ${
                    isSelected
                      ? "border-blue-500 dark:border-cyan-500 bg-blue-50/50 dark:bg-cyan-950/30 ring-4 ring-blue-500/10 dark:ring-cyan-500/10 shadow-md -translate-y-1"
                      : "border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  {/* Top accent line */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${design.gradient} transition-opacity ${
                      isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-100"
                    }`}
                  />

                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      {group.imageUrl ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white shadow-xs group-hover:scale-105 transition-transform">
                          <img
                            src={group.imageUrl}
                            alt={group.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${design.gradient} text-white shadow-md ${design.glow} group-hover:scale-105 transition-transform`}
                        >
                          <span className="material-symbols-outlined text-2xl">{design.icon}</span>
                        </div>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-white/5"
                        }`}
                      >
                        {group.productCount} SP
                      </span>
                    </div>

                    <h3 className="font-headline text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {group.name}
                    </h3>

                    <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                      <span>Tồn kho: <strong>{group.totalStock}</strong></span>
                      <span>{group.percentage}% tỷ trọng</span>
                    </p>
                  </div>

                  {/* Progress bar of category share */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                      <div
                        className={`h-full bg-gradient-to-r ${design.gradient} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(group.percentage, 5)}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                      <span>Khoảng giá:</span>
                      <span className="font-bold text-slate-700 dark:text-zinc-200">
                        {group.minPrice === group.maxPrice
                          ? formatVnd(group.minPrice)
                          : `${formatVnd(group.minPrice)} - ${formatVnd(group.maxPrice)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================== CONTROLS & FILTER BAR ==================== */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-5 sm:p-6 backdrop-blur-2xl shadow-sm lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills (Tabs) */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategoryId("all")}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              selectedCategoryId === "all"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-slate-100/90 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-white/10"
            }`}
          >
            Tất cả ({products.length})
          </button>
          {categoryGroups.map((g) => {
            const isSelected = selectedCategoryId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedCategoryId(g.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "bg-slate-100/90 dark:bg-white/5 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-white/10"
                }`}
              >
                <span>{g.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-zinc-400"
                  }`}
                >
                  {g.productCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & View Mode Switch */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên SP, SKU..."
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-xs"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => setViewMode("grouped")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === "grouped"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Gom nhóm theo danh mục"
            >
              <span className="material-symbols-outlined text-[16px]">view_agenda</span>
              <span className="hidden sm:inline">Theo nhóm</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
              }`}
              title="Danh sách bảng đầy đủ"
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              <span className="hidden sm:inline">Bảng phẳng</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCTS DISPLAY: GROUPED VIEW ==================== */}
      {viewMode === "grouped" ? (
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-12 text-center text-slate-400 dark:text-zinc-500 shadow-sm">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">search_off</span>
              <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const design = getCategoryDesign(group.name);

              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm backdrop-blur-2xl"
                >
                  {/* Category Group Header */}
                  <div className="flex flex-col gap-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3.5">
                      {group.imageUrl ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white shadow-xs">
                          <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${design.gradient} text-white shadow-xs`}
                        >
                          <span className="material-symbols-outlined text-[18px]">{design.icon}</span>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white">
                            {group.name}
                          </h3>
                          <span className="rounded-full bg-blue-50 dark:bg-cyan-950/40 border border-blue-200/60 dark:border-cyan-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                            {group.products.length} sản phẩm
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
                          Tổng tồn kho: {group.totalStock} · Giá từ {formatVnd(group.minPrice)} đến {formatVnd(group.maxPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {group.id > 0 && (
                        <Link
                          href={`/admin/categories/${group.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-xs"
                          title="Đến trang quản lý danh mục này"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          <span>Chi tiết danh mục</span>
                        </Link>
                      )}
                      {canWrite && (
                        <Link
                          href={`/admin/products/new?brandId=${brand.id}${group.id > 0 ? `&categoryId=${group.id}` : ""}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-blue-50 dark:bg-white/5 border border-blue-200/80 dark:border-white/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:bg-blue-100 transition-all"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Thêm vào nhóm</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Group Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        <tr>
                          <th className="px-6 py-3.5">Sản phẩm</th>
                          <th className="px-6 py-3.5">Mã SKU</th>
                          <th className="px-6 py-3.5 text-right">Giá bán</th>
                          <th className="px-6 py-3.5 text-center">Tồn kho</th>
                          <th className="px-6 py-3.5">Trạng thái</th>
                          <th className="px-6 py-3.5 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-slate-700 dark:text-zinc-300">
                        {group.products.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800">
                                  {p.heroImage ? (
                                    <Image src={p.heroImage} alt={p.name} fill unoptimized className="object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                      <span className="material-symbols-outlined text-[18px]">image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/admin/products/${p.id}`}
                                    className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-1"
                                  >
                                    {p.name}
                                  </Link>
                                  {p.subtitle && (
                                    <p className="text-[10px] text-slate-400 truncate">{p.subtitle}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-zinc-400">
                              {p.sku || "—"}
                            </td>
                            <td className="px-6 py-3.5 text-right font-bold text-blue-600 dark:text-cyan-400">
                              {p.price}
                            </td>
                            <td className="px-6 py-3.5 text-center font-mono font-semibold">
                              {p.stock ?? 0}
                            </td>
                            <td className="px-6 py-3.5">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                  (p.stock ?? 0) > 0
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <Link
                                href={`/admin/products/${p.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 transition-all shadow-xs"
                                title="Xem chi tiết sản phẩm"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ==================== PRODUCTS DISPLAY: UNIFIED TABLE VIEW ==================== */
        <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm backdrop-blur-2xl">
          <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] px-6 py-4">
            <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white">
              Toàn bộ danh sách sản phẩm ({allFilteredProducts.length})
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
              Hiển thị dạng bảng phẳng tất cả sản phẩm thuộc {brand.name}.
            </p>
          </div>

          <div className="overflow-x-auto">
            {allFilteredProducts.length === 0 ? (
              <div className="px-6 py-16 text-center text-slate-400 dark:text-zinc-500">
                <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">inventory_2</span>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Không có sản phẩm nào</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-6 py-4">Sản phẩm</th>
                    <th className="px-6 py-4">Danh mục</th>
                    <th className="px-6 py-4">Mã SKU</th>
                    <th className="px-6 py-4 text-right">Giá bán</th>
                    <th className="px-6 py-4 text-center">Tồn kho</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-slate-700 dark:text-zinc-300">
                  {allFilteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800">
                            {p.heroImage ? (
                              <Image src={p.heroImage} alt={p.name} fill unoptimized className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">image</span>
                              </div>
                            )}
                          </div>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-1"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-white/5">
                          {p.category || "Chưa phân loại"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">
                        {p.sku || "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-blue-600 dark:text-cyan-400">
                        {p.price}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-semibold">
                        {p.stock ?? 0}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            (p.stock ?? 0) > 0
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 transition-all shadow-xs"
                          title="Xem chi tiết sản phẩm"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
