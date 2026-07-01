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
    // don't keep stale success banners forever
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
    <div className="grid gap-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5 backdrop-blur-xl">
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tìm kiếm</label>
        <input
          type="text"
          value={localQ}
          onChange={(e) => {
            const v = e.target.value;
            setLocalQ(v);
            schedulePush(v);
          }}
          placeholder="Tên, slug hoặc ID danh mục..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 backdrop-blur-md"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Lọc trạng thái</label>
        <select
          value={localDeleted}
          onChange={(e) => {
            const v = (e.target.value as "active" | "deleted" | "all") ?? "active";
            setLocalDeleted(v);
            pushNow({ deleted: v });
          }}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 backdrop-blur-md appearance-none"
        >
          <option value="active">Còn tồn tại</option>
          <option value="deleted">Đã xóa mềm</option>
          <option value="all">Tất cả</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Số dòng / trang</label>
        <select
          value={String(localPageSize)}
          onChange={(e) => {
            const n = clampPageSize(Number(e.target.value));
            setLocalPageSize(n);
            pushNow({ pageSize: String(n) });
          }}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 backdrop-blur-md appearance-none"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sắp xếp theo</label>
        <select
          value={localSortBy}
          onChange={(e) => {
            const v = normalizeSortBy(e.target.value);
            setLocalSortBy(v);
            pushNow({ sortBy: v });
          }}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 backdrop-blur-md appearance-none"
        >
          <option value="updatedAt">Mới cập nhật</option>
          <option value="createdAt">Mới tạo</option>
          <option value="name">Tên</option>
          <option value="id">ID</option>
          <option value="slug">Slug</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Chiều</label>
        <select
          value={localSortDir}
          onChange={(e) => {
            const v = normalizeSortDir(e.target.value);
            setLocalSortDir(v);
            pushNow({ sortDir: v });
          }}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 backdrop-blur-md appearance-none"
        >
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>
      </div>
    </div>
    <div className="mt-8">
      {isPending ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
            <p className="mt-2 text-sm font-bold">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
    </>
  );
}

