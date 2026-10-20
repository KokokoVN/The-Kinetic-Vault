"use client";

import { useState, useEffect } from "react";
import { parseVariantTiers } from "@/lib/variant-tier-utils";

function moneyVnd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "-";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export function VariantPickerModal({
  isOpen,
  onClose,
  onSelect,
  variants,
  currentValue
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (variantId: number | undefined) => void;
  variants: any[];
  currentValue?: number;
}) {
  const [query, setQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");

  // Block body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  const parsedVariants = variants.map(v => ({
    raw: v,
    parsed: parseVariantTiers(v)
  }));

  const inStockCount = parsedVariants.filter(x => (x.parsed.availability ?? 0) > 0).length;
  const outOfStockCount = parsedVariants.length - inStockCount;

  const filtered = parsedVariants.filter(({ raw, parsed }) => {
    // Stock filter
    if (stockFilter === "in_stock" && (parsed.availability ?? 0) <= 0) return false;
    if (stockFilter === "out_of_stock" && (parsed.availability ?? 0) > 0) return false;

    if (!normalizedQuery) return true;
    if (String(parsed.id).includes(normalizedQuery)) return true;
    if (parsed.sku && parsed.sku.toLowerCase().includes(normalizedQuery)) return true;
    if (parsed.fullLabel.toLowerCase().includes(normalizedQuery)) return true;
    return parsed.tiers.some(
      t => t.name.toLowerCase().includes(normalizedQuery) || t.value.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <span className="material-symbols-outlined text-2xl">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">Chọn Biến Thể Khuyến Mãi</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {variants.length} biến thể
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chọn biến thể nhiều tầng hoặc áp dụng cho toàn bộ sản phẩm</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Search & Stock Filter Bar */}
        <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 p-4 space-y-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              autoFocus
              type="text"
              placeholder="Tìm theo màu sắc, kích cỡ, chất liệu, SKU, mã biến thể..."
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 py-3 pl-12 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: `Tất cả (${parsedVariants.length})` },
              { id: "in_stock", label: `Còn hàng (${inStockCount})` },
              { id: "out_of_stock", label: `Hết hàng (${outOfStockCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStockFilter(tab.id as any)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                  stockFilter === tab.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variant list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {/* Apply to all variants button */}
          <button
            type="button"
            onClick={() => {
              onSelect(undefined);
              onClose();
            }}
            className={`group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all border ${
              !currentValue 
                ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20' 
                : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
              !currentValue 
                ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <span className="material-symbols-outlined text-xl">all_inclusive</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-black ${!currentValue ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-100'}`}>
                  Áp dụng cho toàn bộ sản phẩm
                </h4>
                <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Tất cả biến thể
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                Khuyến mãi có hiệu lực cho tất cả các tầng biến thể của sản phẩm này
              </p>
            </div>
            {!currentValue && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                <span className="material-symbols-outlined text-sm font-bold">check</span>
              </div>
            )}
          </button>

          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined mb-2 text-4xl opacity-40">filter_none</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy biến thể phù hợp</p>
              <p className="mt-0.5 text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            filtered.map(({ raw, parsed }) => {
              const isSelected = currentValue === parsed.id;
              const hasStock = (parsed.availability ?? 0) > 0;

              return (
                <button
                  key={parsed.id}
                  type="button"
                  onClick={() => {
                    onSelect(parsed.id);
                    onClose();
                  }}
                  className={`group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all border ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20' 
                      : 'border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600'
                  }`}>
                    <span className="material-symbols-outlined text-xl">layers</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Multi-tier chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {parsed.tiers.length > 0 ? (
                        parsed.tiers.map((t, idx) => (
                          <span 
                            key={idx}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                              isSelected
                                ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/40'
                            }`}
                          >
                            <span className="text-slate-400 dark:text-slate-500 font-semibold">{t.name}:</span>
                            <span>{t.value}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {parsed.fullLabel}
                        </span>
                      )}
                    </div>

                    {/* Metadata line: SKU, ID, Price, Availability */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-slate-400">ID #{parsed.id}</span>
                      {parsed.sku && (
                        <span className="font-mono text-slate-500 dark:text-slate-400">SKU: {parsed.sku}</span>
                      )}
                      {parsed.price != null && (
                        <span className="font-bold text-slate-800 dark:text-slate-100">
                          {moneyVnd(parsed.price)}
                        </span>
                      )}
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        hasStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {hasStock ? 'inventory_2' : 'warning'}
                        </span>
                        Tồn: {parsed.availability ?? 0}
                      </span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      arrow_forward
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
