"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { type UiProduct, type BackendCategory, type AdminBrand } from "@/lib/api";

type Props = {
  category: BackendCategory;
  brands: AdminBrand[];
  products: UiProduct[];
  gatewayOrigin?: string;
  canWrite?: boolean;
};

type BrandGroup = {
  id: number;
  name: string;
  slug?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  products: UiProduct[];
  productCount: number;
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  percentage: number;
};

function getCountryFlag(country?: string | null): string {
  if (!country) return "";
  const c = country.toLowerCase().trim();
  if (c.includes("mỹ") || c.includes("usa") || c.includes("united states")) return "🇺🇸";
  if (c.includes("nhật") || c.includes("japan")) return "🇯🇵";
  if (c.includes("hàn") || c.includes("korea")) return "🇰🇷";
  if (c.includes("việt") || c.includes("vietnam")) return "🇻🇳";
  if (c.includes("đức") || c.includes("germany")) return "🇩🇪";
  if (c.includes("thụy sĩ") || c.includes("switzerland")) return "🇨🇭";
  if (c.includes("pháp") || c.includes("france")) return "🇫🇷";
  if (c.includes("ý") || c.includes("italy")) return "🇮🇹";
  if (c.includes("anh") || c.includes("uk") || c.includes("england")) return "🇬🇧";
  if (c.includes("trung") || c.includes("china")) return "🇨🇳";
  return "🌐";
}

function getBrandIcon(name: string): { icon: string; gradient: string } {
  const n = String(name ?? "").toLowerCase();
  if (n.includes("apple") || n.includes("samsung") || n.includes("xiaomi") || n.includes("sony")) {
    return { icon: "devices", gradient: "from-blue-500 to-indigo-600" };
  }
  if (n.includes("nike") || n.includes("adidas") || n.includes("puma") || n.includes("lining")) {
    return { icon: "sports_handball", gradient: "from-purple-500 to-pink-600" };
  }
  if (n.includes("logitech") || n.includes("razer") || n.includes("corsair")) {
    return { icon: "mouse", gradient: "from-amber-500 to-orange-600" };
  }
  if (n.includes("dell") || n.includes("hp") || n.includes("asus") || n.includes("lenovo")) {
    return { icon: "laptop", gradient: "from-cyan-500 to-blue-600" };
  }
  return { icon: "verified", gradient: "from-blue-600 to-violet-600" };
}

function formatVnd(val: number): string {
  if (!Number.isFinite(val) || val <= 0) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
}

export function CategoryBrandsView({
  category,
  brands,
  products,
  gatewayOrigin = "http://localhost:8900",
  canWrite,
}: Props) {
  const [selectedBrandId, setSelectedBrandId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grouped" | "table">("grouped");

  // Map brands by ID
  const brandMap = useMemo(() => {
    const map = new Map<number, AdminBrand>();
    brands.forEach((b) => {
      map.set(b.id, b);
    });
    return map;
  }, [brands]);

  // Group products by brand
  const brandGroups: BrandGroup[] = useMemo(() => {
    const groupMap = new Map<number, UiProduct[]>();

    products.forEach((p) => {
      const bId = p.brandId ?? 0;
      const list = groupMap.get(bId) || [];
      list.push(p);
      groupMap.set(bId, list);
    });

    const groups: BrandGroup[] = [];
    const totalCount = products.length || 1;

    groupMap.forEach((prods, bId) => {
      const brandInfo = brandMap.get(bId);
      const brandName = brandInfo?.name ?? prods[0]?.brandName ?? (bId === 0 ? "Chưa gắn thương hiệu" : `Thương hiệu #${bId}`);
      const brandSlug = brandInfo?.slug ?? null;
      const brandLogo = brandInfo?.logoUrl ?? null;
      const country = brandInfo?.country ?? null;
      const totalStock = prods.reduce((sum, item) => sum + (item.stock ?? 0), 0);

      const prices = prods.map((item) => item.rawPrice ?? 0).filter((pr) => pr > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      groups.push({
        id: bId,
        name: brandName,
        slug: brandSlug,
        logoUrl: brandLogo,
        country,
        products: prods,
        productCount: prods.length,
        totalStock,
        minPrice,
        maxPrice,
        percentage: Math.round((prods.length / totalCount) * 100),
      });
    });

    // Sort by highest product count first
    groups.sort((a, b) => b.productCount - a.productCount);
    return groups;
  }, [products, brandMap]);

  // Filtered groups based on selection & search query
  const filteredGroups = useMemo(() => {
    let result = brandGroups;

    if (selectedBrandId !== "all") {
      result = result.filter((g) => g.id === selectedBrandId);
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
  }, [brandGroups, selectedBrandId, searchQuery]);

  // Flattened products for table view
  const allFilteredProducts = useMemo(() => {
    return filteredGroups.flatMap((g) => g.products);
  }, [filteredGroups]);

  const resolveLogo = (url?: string | null) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${gatewayOrigin}${url}`;
  };

  return (
    <div className="space-y-8">
      {/* ==================== BRAND OVERVIEW CARDS ==================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-headline text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 dark:text-cyan-400">stars</span>
              <span>Thương hiệu phân phối trong danh mục</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Phân bố số lượng sản phẩm, tồn kho và khoảng giá niêm yết theo từng hãng sản xuất.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-cyan-950/30 text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-cyan-800/40 w-fit">
            {brandGroups.length} thương hiệu đối tác
          </span>
        </div>

        {brandGroups.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-8 text-center text-slate-500 dark:text-zinc-400">
            <span className="material-symbols-outlined text-4xl block opacity-40 mb-2">stars</span>
            <p className="text-sm font-semibold">Chưa có thương hiệu nào liên kết với sản phẩm trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brandGroups.map((group) => {
              const isSelected = selectedBrandId === group.id;
              const flag = getCountryFlag(group.country);
              const logoSrc = resolveLogo(group.logoUrl);
              const style = getBrandIcon(group.name);

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedBrandId(isSelected ? "all" : group.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-5 transition-all duration-300 backdrop-blur-xl ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-cyan-950/30 shadow-lg shadow-blue-500/10"
                      : "border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:border-blue-300 dark:hover:border-white/20 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-1.5 shadow-xs group-hover:scale-105 transition-transform duration-300">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt={group.name}
                            fill
                            unoptimized
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className={`flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br ${style.gradient} text-white font-bold text-base shadow-xs`}>
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-headline text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {group.name}
                        </p>
                        {group.country ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400 truncate">
                            <span>{flag}</span>
                            <span>{group.country}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                            Chính hãng
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:text-zinc-400 shrink-0">
                      {group.percentage}%
                    </span>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 transition-all duration-500"
                      style={{ width: `${Math.max(6, group.percentage)}%` }}
                    />
                  </div>

                  {/* Stock & Price Range */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-white/5 pt-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                        Sản phẩm / Kho
                      </span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                        <strong className="text-slate-900 dark:text-white">{group.productCount}</strong> sp · {group.totalStock} kho
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 dark:text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">
                        Khoảng giá
                      </span>
                      <p className="font-semibold text-blue-600 dark:text-cyan-400 mt-0.5 truncate" title={`${formatVnd(group.minPrice)} - ${formatVnd(group.maxPrice)}`}>
                        {formatVnd(group.minPrice)} - {formatVnd(group.maxPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================== CONTROLS: PILLS & SEARCH & VIEW MODE ==================== */}
      <section className="space-y-4 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 shadow-sm backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand Pills Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedBrandId("all")}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                selectedBrandId === "all"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-slate-100/90 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-white/5"
              }`}
            >
              <span>Tất cả thương hiệu</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedBrandId === "all" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}>
                {products.length}
              </span>
            </button>

            {brandGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedBrandId(g.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                  selectedBrandId === g.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-slate-100/90 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-zinc-800 border border-slate-200/60 dark:border-white/5"
                }`}
              >
                <span>{g.name}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedBrandId === g.id ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}>
                  {g.productCount}
                </span>
              </button>
            ))}
          </div>

          {/* Search & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Live Search Input */}
            <div className="relative w-full sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm, SKU..."
                className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/80 pl-9 pr-8 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="inline-flex rounded-2xl bg-slate-100 dark:bg-zinc-900 p-1 border border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("grouped")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  viewMode === "grouped"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Gom nhóm theo Thương hiệu"
              >
                <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                <span className="hidden sm:inline">Theo hãng</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-cyan-400 shadow-xs"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white"
                }`}
                title="Hiển thị dạng bảng phẳng"
              >
                <span className="material-symbols-outlined text-[16px]">table_rows</span>
                <span className="hidden sm:inline">Bảng phẳng</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCTS VIEW ==================== */}
      {viewMode === "grouped" ? (
        /* ==================== 1. GROUPED VIEW BY BRAND ==================== */
        <div className="space-y-6">
          {filteredGroups.length === 0 ? (
            <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-12 text-center text-slate-500 dark:text-zinc-400 shadow-xs">
              <span className="material-symbols-outlined text-4xl block opacity-40 mb-2">search_off</span>
              <p className="font-bold text-slate-900 dark:text-white text-base">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Thử thay đổi từ khóa hoặc bộ lọc thương hiệu.</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const flag = getCountryFlag(group.country);
              const logoSrc = resolveLogo(group.logoUrl);
              const style = getBrandIcon(group.name);

              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm backdrop-blur-2xl transition-all"
                >
                  {/* Group Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/60 px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-800 p-1 shadow-xs">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt={group.name}
                            fill
                            unoptimized
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <div className={`flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient} text-white font-bold text-sm`}>
                            {group.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-headline text-base font-bold text-slate-900 dark:text-white">
                            {group.name}
                          </h3>
                          {group.country && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-zinc-300">
                              <span>{flag}</span>
                              <span>{group.country}</span>
                            </span>
                          )}
                          <span className="rounded-full bg-blue-50 dark:bg-cyan-950/40 border border-blue-200/60 dark:border-cyan-800/40 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                            {group.products.length} sản phẩm
                          </span>
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {group.totalStock} tồn kho
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Group Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {group.id > 0 && (
                        <Link
                          href={`/admin/brands/${group.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          <span>Chi tiết hãng</span>
                        </Link>
                      )}

                      {canWrite && (
                        <Link
                          href={`/admin/products/new?categoryId=${category.id}${group.id > 0 ? `&brandId=${group.id}` : ""}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Thêm vào nhóm</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Products Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                          <th className="px-6 py-3.5">Sản phẩm</th>
                          <th className="px-6 py-3.5">Mã SKU</th>
                          <th className="px-6 py-3.5 text-right">Giá niêm yết</th>
                          <th className="px-6 py-3.5 text-center">Tồn kho</th>
                          <th className="px-6 py-3.5 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {group.products.map((prod) => (
                          <tr
                            key={prod.id}
                            className="group/row transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {prod.heroImage ? (
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white shadow-xs">
                                    <img
                                      src={prod.heroImage}
                                      alt={prod.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400">
                                    <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <Link
                                    href={`/admin/products/${prod.id}/detail`}
                                    className="font-headline text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-1"
                                    title={prod.name}
                                  >
                                    {prod.name}
                                  </Link>
                                  {prod.subtitle && (
                                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                                      {prod.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">
                              {prod.sku || "—"}
                            </td>

                            <td className="px-6 py-4 text-right font-headline text-xs sm:text-sm font-black text-blue-600 dark:text-cyan-400">
                              {prod.price}
                            </td>

                            <td className="px-6 py-4 text-center font-mono text-xs text-slate-700 dark:text-zinc-300 font-bold">
                              {prod.stock}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    prod.stock > 0
                                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                                  }`}
                                >
                                  {prod.stock > 0 ? "Còn hàng" : "Hết hàng"}
                                </span>

                                <Link
                                  href={`/admin/products/${prod.id}/detail`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                                  title="Chi tiết sản phẩm"
                                >
                                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                                </Link>

                                {canWrite && (
                                  <Link
                                    href={`/admin/products/${prod.id}/edit`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs"
                                    title="Chỉnh sửa sản phẩm"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </Link>
                                )}
                              </div>
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
        /* ==================== 2. FLAT TABLE VIEW ==================== */
        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm backdrop-blur-2xl">
          <div className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/60 px-6 py-4 flex items-center justify-between">
            <span className="font-headline text-sm font-bold text-slate-900 dark:text-white">
              Tất cả sản phẩm ({allFilteredProducts.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            {allFilteredProducts.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500">
                <span className="material-symbols-outlined text-4xl block opacity-40 mb-2">search_off</span>
                <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">Không có sản phẩm nào phù hợp.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <th className="px-6 py-3.5">Sản phẩm</th>
                    <th className="px-6 py-3.5">Mã SKU</th>
                    <th className="px-6 py-3.5">Thương hiệu</th>
                    <th className="px-6 py-3.5 text-right">Giá niêm yết</th>
                    <th className="px-6 py-3.5 text-center">Tồn kho</th>
                    <th className="px-6 py-3.5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {allFilteredProducts.map((p) => {
                    const bInfo = p.brandId ? brandMap.get(p.brandId) : null;
                    const flag = getCountryFlag(bInfo?.country);

                    return (
                      <tr key={p.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/products/${p.id}/detail`}
                            className="font-headline text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-colors line-clamp-1"
                          >
                            {p.name}
                          </Link>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-zinc-400">
                          {p.sku || "—"}
                        </td>

                        <td className="px-6 py-4 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          {p.brandId ? (
                            <Link
                              href={`/admin/brands/${p.brandId}`}
                              className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-cyan-400"
                            >
                              <span>{flag}</span>
                              <span>{p.brandName || bInfo?.name || `Thương hiệu #${p.brandId}`}</span>
                            </Link>
                          ) : (
                            <span className="text-slate-400 dark:text-zinc-500">Chưa gắn</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right font-headline text-xs sm:text-sm font-black text-blue-600 dark:text-cyan-400">
                          {p.price}
                        </td>

                        <td className="px-6 py-4 text-center font-mono text-xs text-slate-700 dark:text-zinc-300 font-bold">
                          {p.stock}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                p.stock > 0
                                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                              }`}
                            >
                              {p.stock > 0 ? "Còn hàng" : "Hết hàng"}
                            </span>
                            <Link
                              href={`/admin/products/${p.id}/detail`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors shadow-xs"
                              title="Chi tiết sản phẩm"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
