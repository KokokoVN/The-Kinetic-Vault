"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  q: string;
  page: number;
  children?: React.ReactNode;
};

export function BrandListFilters({ q, page, children }: Props) {
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
    return p;
  }, [sp]);

  function pushNow(next: { q?: string; page?: number }) {
    const p = new URLSearchParams(baseParams.toString());
    const q2 = (next.q ?? localQ).trim();

    const currentQ = (sp?.get("q") ?? "").trim();
    const filtersChanged = currentQ !== q2;

    if (q2) p.set("q", q2);
    else p.delete("q");

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-in fade-in duration-200">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
          <input
            type="text"
            value={localQ}
            onChange={(e) => {
              setLocalQ(e.target.value);
              schedulePush(e.target.value);
            }}
            placeholder="Tìm kiếm thương hiệu..."
            className="w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-sm text-slate-850 dark:text-slate-200 backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>
      
      <div className="mt-6">
        {isPending ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
            <div className="p-10 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
              <p className="mt-2 text-sm font-bold">Đang tải thương hiệu...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </>
  );
}

import { useMemo } from "react";
