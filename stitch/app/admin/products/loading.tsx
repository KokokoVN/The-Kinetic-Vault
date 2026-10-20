import React from "react";

export default function AdminProductsLoading() {
  return (
    <div className="w-full space-y-6 pb-12 animate-pulse">
      {/* ── Header Skeleton ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-52 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
          </div>
          <div className="h-4 w-72 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-10 w-36 rounded-xl bg-indigo-200 dark:bg-indigo-950/60" />
        </div>
      </div>

      {/* ── Filter / Search Bar Skeleton ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-full sm:w-80 rounded-xl bg-slate-100 dark:bg-zinc-800/60" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* ── Products Table Skeleton ── */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="h-5 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
        </div>

        {/* Table Rows Skeleton */}
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between py-3.5 border-b border-slate-100/70 dark:border-zinc-800/70 last:border-0"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
              <div className="space-y-2">
                <div className="h-4 w-44 sm:w-64 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-16 rounded bg-slate-100 dark:bg-zinc-800/60" />
                  <div className="h-3 w-20 rounded bg-slate-100 dark:bg-zinc-800/60" />
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-4 w-16 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
