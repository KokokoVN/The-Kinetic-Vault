"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type NavLinkResult = {
  label: string;
  icon: string;
  href: string;
};

type ProductResult = {
  id: string;
  name: string;
  sku: string;
  price: string;
  heroImage: string;
  stock: number;
  status: string;
  href: string;
};

type OrderResult = {
  id: number;
  orderNumber: string;
  userName: string;
  total: string;
  status: string;
  paymentStatus: string;
  href: string;
};

type CategoryResult = {
  id: number;
  name: string;
  slug: string;
  href: string;
};

type CustomerResult = {
  id: number;
  userName: string;
  email: string;
  phoneNumber: string;
  role: string;
  href: string;
};

type SearchResponse = {
  query: string;
  navLinks: NavLinkResult[];
  products: ProductResult[];
  orders: OrderResult[];
  categories: CategoryResult[];
  customers: CustomerResult[];
};

export function AdminHeaderSearch({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);

  // Global hotkey Ctrl+K / Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API search
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
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = useCallback(
    (href: string) => {
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      setIsOpen(false);
      const q = encodeURIComponent(query.trim());
      // If user is currently in a specific section, search within that section
      if (pathname.startsWith("/admin/orders")) {
        router.push(`/admin/orders?q=${q}`);
      } else if (pathname.startsWith("/admin/categories")) {
        router.push(`/admin/categories?q=${q}`);
      } else if (pathname.startsWith("/admin/customers")) {
        router.push(`/admin/customers?q=${q}`);
      } else {
        router.push(`/admin/products?q=${q}`);
      }
    }
  };

  const hasAnyResults =
    results &&
    (results.navLinks.length > 0 ||
      results.products.length > 0 ||
      results.orders.length > 0 ||
      results.categories.length > 0 ||
      results.customers.length > 0);

  return (
    <div ref={containerRef} className={`relative w-full max-w-sm xl:max-w-md ${className || "hidden lg:block"}`}>
      {/* Input Bar */}
      <div className="group relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-slate-400 dark:text-zinc-500 text-[20px] pointer-events-none transition-all duration-300 group-focus-within:text-indigo-600 dark:group-focus-within:text-cyan-400 group-focus-within:scale-105">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          className="w-full rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.07] py-2.5 pl-10.5 pr-20 text-xs font-semibold text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:bg-white dark:focus:bg-[#0c101d] focus:border-indigo-500/60 dark:focus:border-cyan-400/60 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-cyan-500/15 focus:shadow-[0_0_24px_rgba(99,102,241,0.22)] shadow-xs backdrop-blur-xl"
          placeholder={`Tìm kiếm trong ${title.toLowerCase()}...`}
        />

        {/* Right controls: loading spinner / clear button / ⌘K badge */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-600 dark:border-cyan-400/30 dark:border-t-cyan-400" />
          )}

          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery("");
                setResults(null);
                inputRef.current?.focus();
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              title="Xóa tìm kiếm"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}

          <div className="hidden sm:inline-flex items-center gap-0.5 rounded-xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-white/[0.08] px-2 py-0.5 shadow-2xs select-none">
            <span className="font-sans text-[11px] leading-none text-slate-500 dark:text-zinc-400">⌘</span>
            <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-zinc-200">K</span>
          </div>
        </div>
      </div>

      {/* Dropdown Results Box */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 max-h-[460px] overflow-y-auto rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#0c1017]/95 shadow-2xl shadow-slate-900/10 dark:shadow-black/60 backdrop-blur-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 no-scrollbar">
          {isLoading && !results && (
            <div className="flex items-center justify-center py-8 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span className="material-symbols-outlined mr-2 animate-spin text-[18px]">progress_activity</span>
              Đang tìm kiếm trong hệ thống...
            </div>
          )}

          {!isLoading && !hasAnyResults && (
            <div className="py-8 text-center text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span className="material-symbols-outlined mb-1 text-[28px] text-slate-400 dark:text-zinc-600">
                search_off
              </span>
              <p>Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;</p>
              <p className="mt-1 text-[11px] text-slate-400">Thử tìm theo tên sản phẩm, mã đơn hàng, hoặc danh mục</p>
            </div>
          )}

          {hasAnyResults && (
            <div className="space-y-3.5">
              {/* 1. Quick Navigation links */}
              {results.navLinks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <span className="material-symbols-outlined text-[14px]">explore</span>
                    Điều hướng nhanh
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.navLinks.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => handleSelectResult(item.href)}
                        className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-cyan-400">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                        <span className="ml-auto text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                          {item.href}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Products */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                    Sản phẩm ({results.products.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.products.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectResult(p.href)}
                        className="w-full flex items-center gap-3 rounded-2xl p-2 text-left hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors group"
                      >
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800">
                          {p.heroImage ? (
                            <Image
                              src={p.heroImage}
                              alt={p.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-[20px]">image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                            {p.sku && <span className="font-mono text-[10px] uppercase">{p.sku}</span>}
                            <span>·</span>
                            <span className="font-bold text-blue-600 dark:text-cyan-400">{p.price}</span>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                            p.stock > 0
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          }`}
                        >
                          {p.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Orders */}
              {results.orders.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                    Đơn hàng ({results.orders.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.orders.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => handleSelectResult(o.href)}
                        className="w-full flex items-center justify-between rounded-2xl px-3 py-2 text-left hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {o.orderNumber}
                            <span className="ml-2 font-normal text-slate-500 dark:text-zinc-400">· {o.userName}</span>
                          </p>
                          <p className="mt-0.5 text-[11px] font-bold text-blue-600 dark:text-cyan-400">{o.total}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-zinc-300">
                          {o.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Categories */}
              {results.categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <span className="material-symbols-outlined text-[14px]">category</span>
                    Danh mục ({results.categories.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectResult(c.href)}
                        className="w-full flex items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors group"
                      >
                        <span className="group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {c.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">/{c.slug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    Khách hàng ({results.customers.length})
                  </div>
                  <div className="mt-1 space-y-1">
                    {results.customers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectResult(u.href)}
                        className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 text-left hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 text-xs font-bold shrink-0">
                          {u.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {u.userName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email || u.phoneNumber || u.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Jump / Enter instruction */}
          <div className="mt-3 border-t border-slate-200/80 dark:border-white/10 pt-2.5 px-2 flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push(`/admin/products?q=${encodeURIComponent(query)}`);
              }}
              className="text-blue-600 dark:text-cyan-400 hover:underline font-bold"
            >
              Xem tất cả kết quả sản phẩm &quot;{query}&quot; →
            </button>
            <span>Nhấn ↵ để tìm · ESC để đóng</span>
          </div>
        </div>
      )}
    </div>
  );
}
