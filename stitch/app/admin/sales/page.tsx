import Link from "next/link";

export default function AdminSalesDashboardPage() {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* ==================== HEADER CARD ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 dark:border-cyan-500/30 bg-blue-50/80 dark:bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 backdrop-blur-md">
            <span className="material-symbols-outlined text-[14px]">local_offer</span>
            Sales &amp; Promotions
          </p>
          <h1 className="mt-3 font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
            Khuyến Mãi &amp; Marketing
          </h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
            Quản lý các chương trình ưu đãi giảm giá trực tiếp, mã voucher tri ân khách hàng và hệ thống banner quảng bá nổi bật.
          </p>
        </div>
      </section>

      {/* ==================== CARDS GRID ==================== */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Sale Programs */}
        <Link 
          href="/admin/sales/programs" 
          className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-cyan-500/30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-110 group-hover:rotate-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">sell</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-slate-900 dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-cyan-400">Chương trình Sale</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex-grow leading-relaxed">Thiết lập giảm giá trực tiếp theo phần trăm hoặc số tiền trên danh mục sản phẩm theo khung giờ vàng.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-cyan-400 transition-all group-hover:gap-3">
            Quản lý chương trình <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </Link>

        {/* Card 2: Vouchers */}
        <Link 
          href="/admin/sales/vouchers" 
          className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500/30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 transition-transform group-hover:scale-110 group-hover:rotate-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">redeem</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-slate-900 dark:text-white transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Mã Voucher</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex-grow leading-relaxed">Phát hành mã coupon giảm giá tự động kích hoạt ở bước thanh toán với hạn mức và số lần sử dụng.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 transition-all group-hover:gap-3">
            Quản lý voucher <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </Link>

        {/* Card 3: Banners */}
        <Link 
          href="/admin/sales/banners" 
          className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/30"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 transition-transform group-hover:scale-110 group-hover:rotate-3 mb-6">
            <span className="material-symbols-outlined text-[28px]">panorama</span>
          </div>
          <h2 className="font-headline text-2xl font-black text-slate-900 dark:text-white transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">Banner Quảng Cáo</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex-grow leading-relaxed">Cấu hình slider quảng bá chiến dịch nổi bật ở trang chủ với liên kết điều hướng và thứ tự ưu tiên.</p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 transition-all group-hover:gap-3">
            Quản lý banner <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
