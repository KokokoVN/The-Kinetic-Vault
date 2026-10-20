"use client";

import { useState, useEffect } from "react";

export function ProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  products,
  currentValue
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productId: number) => void;
  products: any[];
  currentValue?: number;
}) {
  const [query, setQuery] = useState("");

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

  const q = query.trim().toLowerCase();
  const filtered = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(q)) || 
    (p.sku && p.sku.toLowerCase().includes(q)) ||
    String(p.id).includes(q)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">Chọn Sản Phẩm Áp Dụng</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {filtered.length}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chọn sản phẩm cần thêm vào chương trình khuyến mãi</p>
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

        {/* Search */}
        <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input
              autoFocus
              type="text"
              placeholder="Tìm theo tên sản phẩm, mã SP, mã SKU..."
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 py-3.5 pl-12 pr-10 text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
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
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined mb-2 text-4xl opacity-40">search_off</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không tìm thấy sản phẩm phù hợp</p>
              <p className="mt-0.5 text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            filtered.map(p => {
              const isSelected = currentValue === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(p.id);
                    onClose();
                  }}
                  className={`group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all border ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm' 
                      : 'border-slate-200/60 dark:border-slate-800/60 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-600'
                  }`}>
                    <span className="material-symbols-outlined text-xl">inventory_2</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`truncate text-sm font-bold ${
                      isSelected ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-900 dark:text-white'
                    }`}>
                      {p.name}
                    </h4>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-slate-400">Mã: #{p.id}</span>
                      {p.sku && <span className="font-mono text-slate-500 dark:text-slate-400">SKU: {p.sku}</span>}
                      {p.availability != null && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          Tồn kho: {p.availability}
                        </span>
                      )}
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
