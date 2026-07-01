export default function AdminLoading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-6">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30">
        <span className="material-symbols-outlined absolute text-[40px] animate-pulse">bolt</span>
        <div className="absolute inset-0 rounded-3xl border-[3px] border-white/20 border-t-white animate-[spin_1.5s_linear_infinite]" />
      </div>
      <div className="text-center">
        <h2 className="font-headline text-lg font-black tracking-widest text-slate-900 dark:text-white uppercase">
          TKV Admin
        </h2>
        <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
          Đang tải dữ liệu, vui lòng chờ...
        </p>
      </div>
    </div>
  );
}
