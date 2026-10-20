"use client";

import React, { useState, useMemo } from "react";
import { VariantEditFormLiveCheck } from "./variant-edit-form-live-check";
import { resolveCatalogImageUrl, type AdminProductVariant } from "@/lib/api";

type ProductEditVariantListProps = {
  variants: AdminProductVariant[];
  pid: string;
  numId: number;
  updateVariantAction: (formData: FormData) => Promise<void> | void;
  deleteVariantAction: (formData: FormData) => Promise<void> | void;
  variantEditInputClass: string;
};

function moneyVnd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export function ProductEditVariantList({
  variants,
  pid,
  numId,
  updateVariantAction,
  deleteVariantAction,
  variantEditInputClass,
}: ProductEditVariantListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"id_asc" | "id_desc" | "price_asc" | "price_desc" | "stock_desc">("id_asc");

  // Unique colors for filtering
  const uniqueColors = useMemo(() => {
    const set = new Set<string>();
    for (const v of variants) {
      const c = String(v.color ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set);
  }, [variants]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalStock = 0;
    const prices: number[] = [];
    for (const v of variants) {
      totalStock += Number(v.availability ?? 0);
      const p = Number(v.price ?? 0);
      if (p > 0) prices.push(p);
    }
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    return {
      count: variants.length,
      totalStock,
      minPrice,
      maxPrice,
    };
  }, [variants]);

  // Filtered & sorted list
  const filteredVariants = useMemo(() => {
    let result = variants;

    // Filter by color
    if (selectedColor !== "ALL") {
      result = result.filter((v) => String(v.color ?? "").trim().toLowerCase() === selectedColor.toLowerCase());
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((v) => {
        const c = String(v.color ?? "").toLowerCase();
        const s = String(v.size ?? "").toLowerCase();
        const n = String(v.variantName ?? "").toLowerCase();
        const sku = String(v.sku ?? "").toLowerCase();
        const id = String(v.id);
        return c.includes(q) || s.includes(q) || n.includes(q) || sku.includes(q) || id.includes(q);
      });
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === "id_asc") return a.id - b.id;
      if (sortBy === "id_desc") return b.id - a.id;
      if (sortBy === "price_asc") return Number(a.price ?? 0) - Number(b.price ?? 0);
      if (sortBy === "price_desc") return Number(b.price ?? 0) - Number(a.price ?? 0);
      if (sortBy === "stock_desc") return Number(b.availability ?? 0) - Number(a.availability ?? 0);
      return 0;
    });
  }, [variants, selectedColor, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* ── Header & Stats Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
        <div>
          <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">style</span>
            Danh sách biến thể ({variants.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Mỗi biến thể có thể có giá bán, giá niêm yết, ảnh riêng và tồn kho độc lập.
          </p>
        </div>

        {/* Quick stat badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 border border-slate-200/80 dark:border-slate-700 shadow-2xs font-bold text-slate-700 dark:text-slate-200">
            <span className="material-symbols-outlined text-[16px] text-indigo-500">inventory_2</span>
            <span>Tổng tồn kho:</span>
            <strong className="text-indigo-600 dark:text-indigo-400">{stats.totalStock}</strong>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-2 border border-slate-200/80 dark:border-slate-700 shadow-2xs font-bold text-slate-700 dark:text-slate-200">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">payments</span>
            <span>Khoảng giá:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">
              {stats.minPrice > 0 ? (stats.minPrice === stats.maxPrice ? moneyVnd(stats.minPrice) : `${moneyVnd(stats.minPrice)} ~ ${moneyVnd(stats.maxPrice)}`) : "—"}
            </strong>
          </div>
        </div>
      </div>

      {/* ── Search, Color Tabs & Sorting Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo màu, size, SKU, tên biến thể..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
          >
            <option value="id_asc">ID tăng dần (Mặc định)</option>
            <option value="id_desc">ID mới nhất</option>
            <option value="price_asc">Giá: Thấp $\rightarrow$ Cao</option>
            <option value="price_desc">Giá: Cao $\rightarrow$ Thấp</option>
            <option value="stock_desc">Tồn kho nhiều nhất</option>
          </select>
        </div>
      </div>

      {/* Color Filter Pills */}
      {uniqueColors.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">Lọc màu:</span>
          <button
            type="button"
            onClick={() => setSelectedColor("ALL")}
            className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
              selectedColor === "ALL"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            Tất cả ({variants.length})
          </button>
          {uniqueColors.map((col) => {
            const count = variants.filter((v) => String(v.color ?? "").trim().toLowerCase() === col.toLowerCase()).length;
            const isSelected = selectedColor.toLowerCase() === col.toLowerCase();
            return (
              <button
                key={col}
                type="button"
                onClick={() => setSelectedColor(isSelected ? "ALL" : col)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                {col} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* ── Variants Cards List ── */}
      {filteredVariants.length > 0 ? (
        <div className="max-h-[min(75vh,60rem)] overflow-y-auto pr-2 custom-scrollbar">
          <ul className="flex w-full flex-col gap-4">
            {filteredVariants.map((v) => {
              const variantPriceNum = Number(v.price);
              const safePrice = Number.isFinite(variantPriceNum) && variantPriceNum >= 1 ? Math.round(variantPriceNum) : 1;
              const variantThumb = v.variantImageUrl?.trim() ? resolveCatalogImageUrl(v.variantImageUrl) : null;

              // Parse Tiers
              let attrs: Array<{ name: string; value: string }> = [];
              if (v.attributesJson) {
                try {
                  const p = JSON.parse(v.attributesJson);
                  if (Array.isArray(p)) {
                    attrs = p
                      .map((it: any) => ({
                        name: String(it.tierName || it.name || it.key || "").trim(),
                        value: String(it.value || it.val || "").trim(),
                      }))
                      .filter((x) => x.value);
                  } else if (typeof p === "object" && p !== null) {
                    attrs = Object.entries(p)
                      .map(([k, val]) => ({
                        name: String(k).trim(),
                        value: String(val ?? "").trim(),
                      }))
                      .filter((x) => x.value);
                  }
                } catch {}
              }
              if (attrs.length === 0 && v.size && v.size.includes(" - ")) {
                const parts = v.size.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
                if (v.color) attrs.push({ name: "Màu sắc", value: v.color });
                parts.forEach((part, idx) => {
                  attrs.push({
                    name: idx === 0 ? "Kích cỡ" : idx === 1 ? "Phiên bản" : `Tầng ${idx + 2}`,
                    value: part,
                  });
                });
              }

              return (
                <li key={v.id} className="min-w-0 w-full group/card">
                  <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-500/80">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850">
                      {/* Thumbnail */}
                      <div className="relative mx-auto shrink-0 sm:mx-0">
                        {variantThumb ? (
                          <a
                            href={variantThumb}
                            target="_blank"
                            rel="noreferrer"
                            className="block relative overflow-hidden rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-xs"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={variantThumb}
                              alt={`${v.size} ${v.color}`}
                              className="h-24 w-24 object-cover transition-transform duration-500 hover:scale-110 sm:h-28 sm:w-28"
                            />
                          </a>
                        ) : (
                          <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 sm:h-28 sm:w-28">
                            <span className="material-symbols-outlined text-2xl opacity-50">image_not_supported</span>
                            <span className="text-[10px] font-bold">Chưa có ảnh</span>
                          </div>
                        )}
                        <span className="absolute -bottom-2 -right-2 rounded-xl bg-indigo-600 px-2.5 py-0.5 font-mono text-[10px] font-black tracking-wider text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                          #{v.id}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 text-center sm:text-left">
                        {/* Tiers Badges */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1.5">
                          {attrs.length > 0 ? (
                            attrs.map((a, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                              >
                                <span className="text-[10px] text-indigo-500 font-normal">{a.name}:</span>
                                <span>{a.value}</span>
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-black text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                                {v.color || "—"}
                              </span>
                              <span className="text-slate-300 dark:text-slate-700">×</span>
                              <span className="rounded-lg bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 text-xs font-black text-violet-700 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/60">
                                {v.size || "—"}
                              </span>
                            </>
                          )}
                          {v.sku && (
                            <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                              SKU: {v.sku}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <p className="font-headline text-base font-black text-slate-900 dark:text-white">
                          {v.variantName || `${v.color} - ${v.size}`}
                        </p>

                        {/* Price & Stock info */}
                        <div className="mt-3 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs ring-1 ring-slate-200/80 dark:ring-slate-700">
                            <span className="material-symbols-outlined text-[16px] text-emerald-500">payments</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {v.price != null ? moneyVnd(Number(v.price)) : "—"}
                            </span>
                            {v.originalPrice != null && Number(v.originalPrice) > Number(v.price ?? 0) && (
                              <span className="text-[11px] text-slate-400 line-through ml-1">
                                {moneyVnd(Number(v.originalPrice))}
                              </span>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-300 shadow-2xs ring-1 ring-indigo-500/20">
                            <span className="material-symbols-outlined text-[16px] text-indigo-500">inventory_2</span>
                            Tồn kho: {v.availability ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions bottom strip */}
                    <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/40 p-3 sm:flex-row sm:items-center sm:px-5">
                      <div className="flex-1 min-w-0">
                        <VariantEditFormLiveCheck
                          action={updateVariantAction}
                          variantId={v.id}
                          defaultSize={String(v.size ?? "")}
                          defaultColor={String(v.color ?? "")}
                          defaultPrice={safePrice}
                          defaultVariantImageUrl={String(v.variantImageUrl ?? "")}
                          availabilityPreserve={Number(v.availability ?? 0)}
                          otherVariants={variants
                            .filter((x) => x.id !== v.id)
                            .map((x) => ({ size: String(x.size ?? ""), color: String(x.color ?? "") }))}
                          inputClassName={variantEditInputClass}
                          defaultVariantName={v.variantName}
                          defaultSku={v.sku}
                          defaultOriginalPrice={v.originalPrice != null ? Number(v.originalPrice) : null}
                          defaultAttributesJson={v.attributesJson}
                        />
                      </div>
                      <form action={deleteVariantAction} className="shrink-0 w-full sm:w-auto">
                        <input type="hidden" name="variantId" value={String(v.id)} />
                        <button
                          type="submit"
                          className="h-[46px] w-full sm:w-auto px-5 rounded-2xl border border-rose-200 bg-white dark:bg-slate-900 text-rose-600 shadow-2xs transition-all hover:bg-rose-50 hover:border-rose-300 hover:shadow-xs flex items-center justify-center gap-1.5 font-bold text-xs"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Xóa biến thể
                        </button>
                      </form>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/50 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy biến thể nào phù hợp.</p>
          <p className="text-xs text-slate-400 mt-1">Thử xóa bộ lọc hoặc từ khóa tìm kiếm để xem toàn bộ danh sách.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedColor("ALL");
            }}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition-all"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
