import Link from "next/link";

export default function AdminSalesDashboardPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-8 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">local_offer</span>
            Sales Management
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
            Khuyến mãi & Marketing
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Quản lý các chương trình giảm giá, mã voucher và banner quảng cáo trên trang chủ.
          </p>
        </div>
      </section>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1 */}
        <Link 
          href="/admin/sales/programs" 
          className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-8 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800/50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">sell</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-slate-800 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">Chương trình Sale</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex-grow">Giảm giá trực tiếp trên sản phẩm trong khoảng thời gian nhất định.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 opacity-80 transition-opacity group-hover:opacity-100">
            Quản lý <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </Link>

        {/* Card 2 */}
        <Link 
          href="/admin/sales/vouchers" 
          className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-8 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-800/50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">redeem</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-slate-800 dark:text-white transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Mã Voucher</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex-grow">Mã giảm giá áp dụng ở bước thanh toán. Giới hạn số lần dùng.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 opacity-80 transition-opacity group-hover:opacity-100">
            Quản lý <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </Link>

        {/* Card 3 */}
        <Link 
          href="/admin/sales/banners" 
          className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-8 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-200 dark:hover:border-amber-800/50"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">panorama</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-slate-800 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">Banner Quảng Cáo</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex-grow">Quản lý hình ảnh và liên kết cho slider chính trên trang chủ.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 opacity-80 transition-opacity group-hover:opacity-100">
            Quản lý <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
