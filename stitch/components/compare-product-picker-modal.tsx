"use client";

import React, { useState, useEffect } from "react";

export type PickerProductItem = {
  id: number;
  name: string;
  price: number | string;
  image?: string | null;
  category?: string | null;
  sku?: string | null;
};

export function CompareProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  alreadySelectedIds = [],
  initialProducts = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productId: number) => void;
  alreadySelectedIds?: number[];
  initialProducts?: PickerProductItem[];
}) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PickerProductItem[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetch("/api/catalog/products/paged?page=0&size=40")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        const items = Array.isArray(data.content)
          ? data.content.map((p: any) => ({
              id: p.id,
              name: p.productName ?? p.name ?? "Sản phẩm",
              price: p.price ?? 0,
              image: p.imageUrl ?? p.image,
              category: p.categoryName ?? p.category?.categoryName,
              sku: p.sku,
            }))
          : [];
        setProducts(items);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialProducts]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (alreadySelectedIds.includes(Number(p.id))) return false;
    if (!q) return true;
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      String(p.id).includes(q)
    );
  });

  const formatPrice = (price: number | string) => {
    const num = typeof price === "number" ? price : parseFloat(String(price).replace(/[^\d]/g, ""));
    if (isNaN(num)) return String(price);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <span className="material-symbols-outlined text-[22px]">balance</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-black text-slate-900 dark:text-white">
                Thêm Sản Phẩm Vào So Sánh
              </h3>
              <p className="text-xs font-medium text-slate-400">
                Tìm kiếm và chọn sản phẩm để đối chiếu giá và thông số
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 px-6 sm:px-8 py-3.5">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên sản phẩm, mã SKU hoặc danh mục..."
              className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[16px]">clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-[32px] text-indigo-500 mb-2">
                progress_activity
              </span>
              <p className="text-xs font-medium">Đang tải danh sách sản phẩm...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-[44px] text-slate-300 dark:text-slate-600 mb-2">
                search_off
              </span>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Không tìm thấy sản phẩm phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa hoặc xóa bớt bộ lọc</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(Number(item.id));
                  onClose();
                }}
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-850 p-3 transition-all hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">image</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {item.category && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                      )}
                      {item.sku && (
                        <span className="text-[10px] font-mono text-slate-400">
                          SKU: {item.sku}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {formatPrice(item.price)}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
