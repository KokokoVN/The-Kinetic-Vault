import React from "react";

export default function NewProductLoading() {
  return (
    <div className="w-full space-y-6 pb-20 animate-pulse">
      {/* ── Breadcrumb Skeleton ── */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-zinc-800" />
        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-zinc-800" />
        <div className="h-3 w-3 rounded-full bg-slate-200 dark:bg-zinc-800" />
        <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-zinc-800" />
      </div>

      {/* ── Studio Header Skeleton ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-56 sm:w-72 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                <div className="h-6 w-28 rounded-full bg-indigo-100 dark:bg-indigo-950/50" />
              </div>
              <div className="h-4 w-80 sm:w-96 rounded bg-slate-200 dark:bg-zinc-800" />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-slate-100/80 dark:bg-zinc-900/80 p-2 border border-slate-200/60 dark:border-white/10">
            <div className="h-7 w-24 rounded-xl bg-indigo-200 dark:bg-indigo-900/60" />
            <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <div className="h-7 w-20 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-zinc-700" />
            <div className="h-7 w-20 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>

      {/* ── Step Tabs Skeleton ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-2 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-9 w-36 rounded-xl bg-indigo-200 dark:bg-indigo-950/60" />
            <div className="h-9 w-32 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <div className="h-9 w-40 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          </div>
          <div className="h-8 w-44 rounded-xl bg-slate-200 dark:bg-zinc-800 hidden sm:block" />
        </div>
      </div>

      {/* ── Form Card Skeleton ── */}
      <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 sm:p-10 shadow-sm dark:shadow-2xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="h-5 w-44 rounded-lg bg-slate-200 dark:bg-zinc-800" />
            <div className="h-3.5 w-64 rounded bg-slate-200 dark:bg-zinc-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-900" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
              <div className="h-32 w-full rounded-2xl bg-slate-100 dark:bg-zinc-900" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 p-6 space-y-5">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-900" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-900" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-12 w-full rounded-2xl bg-slate-100 dark:bg-zinc-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar Skeleton */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <div className="h-12 w-24 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
          <div className="h-12 w-48 rounded-2xl bg-indigo-300 dark:bg-indigo-900/60" />
        </div>
      </div>
    </div>
  );
}
