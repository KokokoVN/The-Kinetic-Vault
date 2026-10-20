import React from "react";

export default function BrandsLoading() {
  return (
    <div className="w-full space-y-6 pb-12 animate-pulse">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-4 w-60 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-indigo-200 dark:bg-indigo-950/60" />
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-zinc-800 last:border-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
            </div>
            <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
