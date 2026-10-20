"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Globe, 
  RotateCw,
  Sparkles,
  SlidersHorizontal
} from "lucide-react";

type Props = {
  q: string;
  page: number;
  deleted?: string;
  sortBy?: string;
  country?: string;
  children?: React.ReactNode;
};

const COUNTRIES = [
  { label: "Tất cả quốc gia", value: "" },
  { label: "Mỹ 🇺🇸", value: "Mỹ" },
  { label: "Nhật Bản 🇯🇵", value: "Nhật Bản" },
  { label: "Hàn Quốc 🇰🇷", value: "Hàn Quốc" },
  { label: "Thụy Sĩ 🇨🇭", value: "Thụy Sĩ" },
  { label: "Đức 🇩🇪", value: "Đức" },
  { label: "Việt Nam 🇻🇳", value: "Việt Nam" },
  { label: "Đài Loan 🇹🇼", value: "Đài Loan" },
  { label: "Anh Quốc 🇬🇧", value: "Anh" },
];

export function BrandListFilters({ 
  q, 
  page, 
  deleted = "active", 
  sortBy = "newest", 
  country = "",
  children 
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [localQ, setLocalQ] = useState(q);
  const [localPage, setLocalPage] = useState<number>(Math.max(1, Math.floor(page || 1)));
  const debounceRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setLocalQ(q), [q]);
  useEffect(() => setLocalPage(Math.max(1, Math.floor(page || 1))), [page]);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams(sp?.toString() ?? "");
    p.delete("success");
    p.delete("error");
    return p;
  }, [sp]);

  function pushNow(next: { q?: string; page?: number; deleted?: string; sortBy?: string; country?: string }) {
    const p = new URLSearchParams(baseParams.toString());
    const q2 = (next.q ?? localQ).trim();
    const deleted2 = next.deleted ?? (sp?.get("deleted") || deleted);
    const sortBy2 = next.sortBy ?? (sp?.get("sortBy") || sortBy);
    const country2 = next.country !== undefined ? next.country : (sp?.get("country") || country);

    const currentQ = (sp?.get("q") ?? "").trim();
    const filtersChanged = 
      currentQ !== q2 || 
      (next.deleted && next.deleted !== sp?.get("deleted")) || 
      (next.sortBy && next.sortBy !== sp?.get("sortBy")) ||
      (next.country !== undefined && next.country !== (sp?.get("country") || ""));

    if (q2) p.set("q", q2);
    else p.delete("q");

    if (deleted2 && deleted2 !== "active") p.set("deleted", deleted2);
    else p.delete("deleted");

    if (sortBy2 && sortBy2 !== "newest") p.set("sortBy", sortBy2);
    else p.delete("sortBy");

    if (country2) p.set("country", country2);
    else p.delete("country");

    if (filtersChanged) {
      p.set("page", "1");
    } else {
      const pageToSet = Math.max(1, Math.floor(next.page ?? localPage));
      if (pageToSet > 1) p.set("page", String(pageToSet));
      else p.delete("page");
    }

    startTransition(() => {
      router.replace(`${pathname}?${p.toString()}`);
    });
  }

  function schedulePush(nextQ: string) {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => pushNow({ q: nextQ }), 300);
  }

  const currentDeleted = sp?.get("deleted") || "active";
  const currentSort = sp?.get("sortBy") || "newest";
  const currentCountry = sp?.get("country") || "";

  return (
    <>
      {/* Controls Bar: Search, Country Filter, Status Tabs, Sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            value={localQ}
            onChange={(e) => {
              setLocalQ(e.target.value);
              schedulePush(e.target.value);
            }}
            placeholder="Tìm theo tên hãng, slug, quốc gia... (Enter)"
            className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.04] pl-10 pr-10 py-2.5 text-xs font-semibold text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-all focus:bg-white dark:focus:bg-white/[0.07] focus:border-indigo-500 dark:focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-xs"
          />
          {localQ && (
            <button
              type="button"
              onClick={() => {
                setLocalQ("");
                pushNow({ q: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="inline-flex rounded-2xl bg-slate-100/80 dark:bg-zinc-900/90 p-1 border border-slate-200/80 dark:border-white/10">
            <button
              type="button"
              onClick={() => pushNow({ deleted: "active" })}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                currentDeleted === "active"
                  ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Hoạt động
            </button>
            <button
              type="button"
              onClick={() => pushNow({ deleted: "deleted" })}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                currentDeleted === "deleted"
                  ? "bg-white dark:bg-white/10 text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Thùng rác
            </button>
            <button
              type="button"
              onClick={() => pushNow({ deleted: "all" })}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                currentDeleted === "all"
                  ? "bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Country Selector */}
          <div className="relative">
            <select
              value={currentCountry}
              onChange={(e) => pushNow({ country: e.target.value })}
              className="appearance-none rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-zinc-900/90 pl-8 pr-8 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <Globe className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-zinc-500" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => pushNow({ sortBy: e.target.value })}
              className="appearance-none rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-zinc-900/90 pl-8 pr-8 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-xs"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name_asc">Tên A → Z</option>
              <option value="name_desc">Tên Z → A</option>
            </select>
            <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-zinc-500" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        {isPending ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-12 text-center shadow-sm">
            <RotateCw className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="mt-3 text-xs font-bold text-slate-600 dark:text-zinc-300">Đang cập nhật danh sách thương hiệu...</p>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
