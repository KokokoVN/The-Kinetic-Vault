import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminBanners } from "@/lib/sale-api";
import { BannersDashboard } from "@/components/banners-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog !== false;

  const banners = await listAdminBanners({ accessToken: session.token });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300 shadow-sm">
              <span className="material-symbols-outlined text-[15px]">panorama</span>
              Tiếp Thị & Quảng Cáo
            </div>
            <h1 className="mt-4 font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Banner Quảng Cáo
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Quản lý các banner hiển thị tại trang chủ, chiến dịch khuyến mãi và vị trí nổi bật với chế độ xem thử thiết bị.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-5 py-3.5 shadow-sm backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-2xl">panorama</span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Tổng banner</p>
                <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{banners.length}</p>
              </div>
            </div>
            {canWrite && (
              <Link
                href="/admin/sales/banners/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] hover:shadow-indigo-500/35 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Tạo banner mới
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Dashboard with Grid/Table views, Quick Edit, & Device Mockups */}
      <BannersDashboard initialBanners={banners} canWrite={canWrite} />
    </div>
  );
}
