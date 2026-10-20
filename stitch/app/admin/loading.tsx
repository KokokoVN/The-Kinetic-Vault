import React from "react";

export default function AdminLoading() {
  return (
    <div className="w-full space-y-6 pb-12 animate-pulse">
      {/* ── Top Header Bar Skeleton ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-72 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-10 w-32 rounded-xl bg-indigo-200 dark:bg-indigo-950/60" />
        </div>
      </div>

      {/* ── Metric / Stats Cards Skeleton (4 columns) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            </div>
            <div className="h-7 w-32 rounded-lg bg-slate-200 dark:bg-zinc-800" />
            <div className="h-3.5 w-20 rounded bg-slate-100 dark:bg-zinc-800/60" />
          </div>
        ))}
      </div>

      {/* ── Filter / Search Bar Skeleton ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-900/90 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-full sm:w-80 rounded-xl bg-slate-100 dark:bg-zinc-800/60" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>

      {/* ── Main Content Table / Card Skeleton ── */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="h-5 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
        </div>

        {/* Table Rows Skeleton */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between py-3 border-b border-slate-100/70 dark:border-zinc-800/70 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 sm:w-56 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-3 w-24 rounded bg-slate-100 dark:bg-zinc-800/60" />
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 rounded-lg bg-slate-200 dark:bg-zinc-800" />
              <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
