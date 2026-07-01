export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50/50 backdrop-blur-sm dark:bg-slate-950/50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30">
          <span className="material-symbols-outlined absolute text-[32px] animate-pulse">view_in_ar</span>
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20 border-t-white animate-spin" />
        </div>
        <p className="font-headline text-sm font-bold tracking-widest text-indigo-600 dark:text-indigo-400 animate-pulse uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}
