import React from "react";

export default function ProductEditLoading() {
  return (
    <div className="w-full space-y-6 pb-16 animate-pulse">
      {/* ── Breadcrumb Skeleton ── */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-zinc-800" />
        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-zinc-800" />
        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="h-4 w-36 rounded-md bg-slate-200 dark:bg-zinc-800" />
      </div>

      {/* ── Compact Header Bar Skeleton ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-4 sm:p-5 shadow-sm dark:shadow-xl backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Back button */}
            <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            {/* Thumbnail */}
            <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-48 sm:w-64 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                <div className="h-5 w-12 rounded-md bg-slate-200 dark:bg-zinc-800" />
                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* ── Tabs Bar Skeleton ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-2 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-36 rounded-xl bg-indigo-200 dark:bg-indigo-950/60" />
            <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 w-36 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 w-36 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 w-40 rounded-xl bg-slate-200 dark:bg-zinc-800 hidden md:block" />
          </div>
          <div className="h-8 w-44 rounded-xl bg-slate-200 dark:bg-zinc-800 hidden sm:block" />
        </div>
      </div>

      {/* ── Form Card Skeleton ── */}
      <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-6 sm:p-10 shadow-xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-zinc-800" />
            <div className="h-3 w-64 rounded bg-slate-200 dark:bg-zinc-800" />
          </div>
        </div>

        {/* Form fields skeleton grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
            <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
          </div>
        </div>

        {/* Textarea skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-zinc-800" />
          <div className="h-28 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800/60" />
        </div>

        {/* Save button skeleton */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="h-12 w-44 rounded-2xl bg-indigo-300 dark:bg-indigo-900/60" />
        </div>
      </div>
    </div>
  );
}
