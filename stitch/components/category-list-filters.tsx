"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  q: string;
  deleted: "active" | "deleted" | "all";
  pageSize: number;
  page: number;
  sortBy?: "updatedAt" | "createdAt" | "name" | "id" | "slug";
  sortDir?: "asc" | "desc";
  children?: React.ReactNode;
};

function clampPageSize(n: number): number {
  if ([10, 20, 50, 100].includes(n)) {
    return n;
  }
  return 20;
}

function normalizeSortBy(raw?: string): "updatedAt" | "createdAt" | "name" | "id" | "slug" {
  if (raw === "createdAt" || raw === "name" || raw === "id" || raw === "slug") return raw;
  return "updatedAt";
}

function normalizeSortDir(raw?: string): "asc" | "desc" {
  return raw === "desc" ? "desc" : "asc";
}

export function CategoryListFilters({ q, deleted, pageSize, page, sortBy, sortDir, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [localQ, setLocalQ] = useState(q);
  const [localDeleted, setLocalDeleted] = useState<"active" | "deleted" | "all">(deleted);
  const [localPageSize, setLocalPageSize] = useState<number>(clampPageSize(pageSize));
  const [localPage, setLocalPage] = useState<number>(Math.max(1, Math.floor(page || 1)));
  const [localSortBy, setLocalSortBy] = useState(normalizeSortBy(sortBy));
  const [localSortDir, setLocalSortDir] = useState<"asc" | "desc">(normalizeSortDir(sortDir));
  const debounceRef = useRef<number | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setLocalQ(q), [q]);
  useEffect(() => setLocalDeleted(deleted), [deleted]);
  useEffect(() => setLocalPageSize(clampPageSize(pageSize)), [pageSize]);
  useEffect(() => setLocalPage(Math.max(1, Math.floor(page || 1))), [page]);
  useEffect(() => setLocalSortBy(normalizeSortBy(sortBy)), [sortBy]);
  useEffect(() => setLocalSortDir(normalizeSortDir(sortDir)), [sortDir]);

  const baseParams = useMemo(() => {
    const p = new URLSearchParams(sp?.toString() ?? "");
    p.delete("success");
    return p;
  }, [sp]);

  function pushNow(next: { q?: string; deleted?: string; pageSize?: string; page?: number; sortBy?: string; sortDir?: string }) {
    const p = new URLSearchParams(baseParams.toString());
    const q2 = (next.q ?? localQ).trim();
    const deleted2 = next.deleted ?? localDeleted;
    const pageSize2 = Number(next.pageSize ?? String(localPageSize));
    const sortBy2 = normalizeSortBy(next.sortBy ?? localSortBy);
    const sortDir2 = normalizeSortDir(next.sortDir ?? localSortDir);

    const currentQ = (sp?.get("q") ?? "").trim();
    const currentDeleted = (sp?.get("deleted") ?? "active").trim();
    const currentPageSize = clampPageSize(Number(sp?.get("pageSize") ?? "20"));
    const currentSortBy = normalizeSortBy(sp?.get("sortBy") ?? "updatedAt");
    const currentSortDir = normalizeSortDir(sp?.get("sortDir") ?? "asc");
    const filtersChanged =
      currentQ !== q2 ||
      currentDeleted !== deleted2 ||
      currentPageSize !== clampPageSize(pageSize2) ||
      currentSortBy !== sortBy2 ||
      currentSortDir !== sortDir2;

    if (q2) p.set("q", q2);
    else p.delete("q");
    p.set("deleted", deleted2);
    p.set("pageSize", String(clampPageSize(pageSize2)));
    p.set("sortBy", sortBy2);
    p.set("sortDir", sortDir2);
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
    debounceRef.current = window.setTimeout(() => pushNow({ q: nextQ }), 350);
  }

  return (
    <>
      {/* Luxury White Filter Panel with Ambient Styling */}
      <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-5 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        
        {/* Top Row: Search & Status Tabs */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-[20px]">
              search
            </span>
            <input
              type="text"
              value={localQ}
              onChange={(e) => {
                const v = e.target.value;
                setLocalQ(v);
                schedulePush(v);
              }}
              placeholder="Tìm theo tên danh mục, slug hoặc ID..."
              className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/20 shadow-xs"
            />
            {localQ && (
              <button
                type="button"
                onClick={() => {
                  setLocalQ("");
                  pushNow({ q: "" });
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                title="Xóa tìm kiếm"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
              </button>
            )}
          </div>

          {/* Status Tabs: Segmented Pill Controller */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 p-1.5 border border-slate-200/70 dark:border-white/5 self-start lg:self-auto">
            {(
              [
                { id: "active", label: "Đang hoạt động", icon: "check_circle" },
                { id: "deleted", label: "Thùng rác", icon: "delete" },
                { id: "all", label: "Tất cả", icon: "apps" },
              ] as const
            ).map((tab) => {
              const active = localDeleted === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setLocalDeleted(tab.id);
                    pushNow({ deleted: tab.id });
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    active
                      ? tab.id === "deleted"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: Secondary Filters (SortBy, SortDir, PageSize) */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          
          {/* Sort By Field */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Sắp xếp theo
            </label>
            <div className="relative">
              <select
                value={localSortBy}
                onChange={(e) => {
                  const v = normalizeSortBy(e.target.value);
                  setLocalSortBy(v);
                  pushNow({ sortBy: v });
                }}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 dark:text-zinc-200 outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 appearance-none"
              >
                <option value="updatedAt">Mới cập nhật</option>
                <option value="createdAt">Mới tạo nhất</option>
                <option value="name">Tên danh mục</option>
                <option value="id">ID danh mục</option>
                <option value="slug">Đường dẫn slug</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Sort Direction */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Thứ tự hiển thị
            </label>
            <div className="relative">
              <select
                value={localSortDir}
                onChange={(e) => {
                  const v = normalizeSortDir(e.target.value);
                  setLocalSortDir(v);
                  pushNow({ sortDir: v });
                }}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 dark:text-zinc-200 outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 appearance-none"
              >
                <option value="asc">Tăng dần (A-Z / Cũ trước)</option>
                <option value="desc">Giảm dần (Z-A / Mới trước)</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Page Size */}
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Số lượng / trang
            </label>
            <div className="relative">
              <select
                value={String(localPageSize)}
                onChange={(e) => {
                  const n = clampPageSize(Number(e.target.value));
                  setLocalPageSize(n);
                  pushNow({ pageSize: String(n) });
                }}
                className="w-full rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-3 py-2 pr-8 text-xs font-semibold text-slate-800 dark:text-zinc-200 outline-none transition-all focus:border-blue-500 dark:focus:border-cyan-400 appearance-none"
              >
                <option value="10">10 danh mục / trang</option>
                <option value="20">20 danh mục / trang</option>
                <option value="50">50 danh mục / trang</option>
                <option value="100">100 danh mục / trang</option>
              </select>
              <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Dynamic Content Container */}
      <div className="mt-6">
        {isPending ? (
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
            <div className="p-16 text-center text-slate-500 dark:text-zinc-400">
              <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 dark:text-cyan-400">sync</span>
              <p className="mt-3 text-sm font-bold text-slate-700 dark:text-zinc-300">Đang lọc danh mục sản phẩm...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}
