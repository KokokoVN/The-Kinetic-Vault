export default function Loading() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center text-slate-500 animate-in fade-in duration-500">
      <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      <p className="mt-4 text-sm font-bold">Đang tải dữ liệu...</p>
    </div>
  );
}
