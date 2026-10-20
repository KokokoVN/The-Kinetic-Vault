"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type NavLinkSuggestion = {
  label: string;
  icon: string;
  description: string;
  href: string;
};

type OrderSuggestion = {
  id: number;
  orderNumber: string;
  total: string;
  status: string;
  orderDate?: string;
  href: string;
};

type ProductSuggestion = {
  id: string;
  name: string;
  sku: string;
  price: string;
  heroImage: string;
  category: string;
  stock: number;
  href: string;
};

type CategorySuggestion = {
  id: number;
  name: string;
  href: string;
};

type PromotionSuggestion = {
  id: number;
  name: string;
  discountType: string;
  discountValue: number;
  href: string;
};

type SearchResultPayload = {
  query: string;
  navLinks: NavLinkSuggestion[];
  orders: OrderSuggestion[];
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  promotions: PromotionSuggestion[];
};

export function StorefrontHeaderSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultPayload | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
      setResults(null);
    }
  }, [isOpen]);

  // Debounced API search to /api/search?q=
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SearchResultPayload = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm client:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults =
    results &&
    (results.navLinks.length > 0 ||
      results.orders.length > 0 ||
      results.products.length > 0 ||
      results.categories.length > 0 ||
      results.promotions.length > 0);

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Tìm kiếm toàn trang (Ctrl+K)"
        title="Tìm kiếm toàn trang (Ctrl+K)"
        className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95"
      >
        <span className="material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-110">
          search
        </span>
      </button>

      {/* Spotlight Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 sm:p-6 md:p-16 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)} />

          <div className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur-2xl transition-all">
            {/* Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center border-b border-slate-200/80 dark:border-white/10 px-6 py-4"
            >
              <span className="material-symbols-outlined text-slate-400 dark:text-zinc-500 text-[24px] mr-3">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm toàn trang: đơn hàng, giỏ hàng, iPhone, Marshall..."
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />

              <div className="flex items-center gap-2 shrink-0">
                {isLoading && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-600 dark:border-cyan-400/30 dark:border-t-cyan-400" />
                )}

                {query && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setResults(null);
                      inputRef.current?.focus();
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                >
                  ESC
                </button>
              </div>
            </form>

            {/* Results Body */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 no-scrollbar space-y-4">
              {/* Initial State / Suggestions when empty */}
              {!query.trim() && (
                <div className="py-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 mb-3">
                    <span className="material-symbols-outlined text-[24px]">travel_explore</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                    Tìm kiếm toàn hệ thống The Kinetic Vault
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    Bạn có thể tìm kiếm sản phẩm, đơn hàng đã đặt, giỏ hàng, hoặc trang dịch vụ.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {["đơn hàng", "giỏ hàng", "iPhone 15", "Marshall", "MacBook", "Apple Watch"].map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => {
                          setQuery(keyword);
                        }}
                        className="rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-zinc-900 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results Found */}
              {query.trim() && !isLoading && !hasResults && (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-[36px] text-slate-300 dark:text-zinc-600 mb-2">
                    search_off
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                    Không tìm thấy kết quả nào cho &quot;{query}&quot;
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    Thử tìm từ khóa ngắn gọn hơn như &quot;đơn hàng&quot;, &quot;giỏ hàng&quot; hoặc tên sản phẩm.
                  </p>
                </div>
              )}

              {/* Has Results */}
              {hasResults && (
                <div className="space-y-4">
                  {/* 1. Quick Pages & Navigation */}
                  {results.navLinks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">explore</span>
                        Trang & Điều hướng nhanh ({results.navLinks.length})
                      </p>
                      <div className="space-y-1.5">
                        {results.navLinks.map((nav) => (
                          <button
                            key={nav.href}
                            type="button"
                            onClick={() => handleSelect(nav.href)}
                            className="w-full flex items-center justify-between rounded-2xl p-2.5 text-left border border-transparent hover:border-slate-200/80 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-200/80 dark:border-indigo-500/20">
                                <span className="material-symbols-outlined text-[18px]">{nav.icon}</span>
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                                  {nav.label}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-1">{nav.description}</p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">
                              arrow_forward
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. My Orders */}
                  {results.orders.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                        Đơn hàng của bạn ({results.orders.length})
                      </p>
                      <div className="space-y-1.5">
                        {results.orders.map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => handleSelect(o.href)}
                            className="w-full flex items-center justify-between rounded-2xl p-2.5 text-left border border-transparent hover:border-slate-200/80 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition-all group"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400">
                                {o.orderNumber}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                Tổng: <span className="font-bold text-indigo-600 dark:text-cyan-400">{o.total}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                                {o.status}
                              </span>
                              <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:translate-x-1 transition-transform">
                                arrow_forward
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Matching Categories */}
                  {results.categories.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">category</span>
                        Danh mục ({results.categories.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {results.categories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelect(c.href)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:scale-105 transition"
                          >
                            <span className="material-symbols-outlined text-[14px]">category</span>
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Matching Products */}
                  {results.products.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                        Sản phẩm ({results.products.length})
                      </p>
                      <div className="space-y-1.5">
                        {results.products.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelect(p.href)}
                            className="w-full flex items-center gap-3.5 rounded-2xl p-2.5 text-left border border-transparent hover:border-slate-200/80 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition-all group"
                          >
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-zinc-800">
                              {p.heroImage ? (
                                <Image
                                  src={p.heroImage}
                                  alt={p.name}
                                  fill
                                  unoptimized
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <span className="material-symbols-outlined text-[18px]">image</span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                                {p.category && <span>{p.category}</span>}
                                {p.sku && (
                                  <>
                                    <span>·</span>
                                    <span className="font-mono text-[10px]">{p.sku}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="font-headline font-black text-xs sm:text-sm text-indigo-600 dark:text-cyan-400">
                                {p.price}
                              </p>
                              <span
                                className={`text-[10px] font-bold ${
                                  p.stock > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-500"
                                }`}
                              >
                                {p.stock > 0 ? "Còn hàng" : "Hết hàng"}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/50 px-6 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả kết quả toàn trang cho &quot;{query || "..."}&quot;</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
              <span className="hidden sm:inline text-[11px]">
                Nhấn <kbd className="rounded bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> để tìm toàn trang · <kbd className="rounded bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd> để đóng
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
