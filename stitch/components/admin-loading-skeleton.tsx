/** Skeleton nhẹ cho vùng nội dung admin khi chuyển route (Suspense boundary). */
export function AdminLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Đang tải">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-9 w-48 rounded-lg bg-slate-200/90" />
        <div className="h-10 w-full max-w-xs rounded-xl bg-slate-200/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/60" />
        ))}
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-white/40 p-4">
        <div className="h-4 w-full max-w-md rounded bg-slate-200/80" />
        <div className="h-64 rounded-xl bg-slate-200/50" />
      </div>
    </div>
  );
}
