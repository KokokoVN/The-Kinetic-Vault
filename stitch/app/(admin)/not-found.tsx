"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

/**
 * Trang 404 cho khu vực Admin Portal.
 *
 * Phong cách: Cyber / Console — phù hợp với AdminShell.
 * Bao gồm: stack trace giả, mã lỗi terminal, breadcrumb debug, danh sách nơi hay truy cập.
 */
export default function AdminNotFound() {
  const pathname = usePathname();
  const requestedPath = pathname || "/admin/unknown";
  const timestamp = new Date().toISOString();

  return (
    <AdminShell userRole="ADMIN" username="system">
      <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-cyan-500/10 blur-[120px]" />

        <div className="relative z-10 w-full">
          {/* Terminal-style status header */}
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-zinc-950/80 shadow-2xl backdrop-blur-2xl">
            {/* Window chrome */}
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-amber-400 shadow-sm" />
                <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-500">
                tkv-admin://terminal/404
              </div>
              <div className="font-mono text-[10px] text-slate-400 dark:text-zinc-600">
                v2.3.1
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-10 sm:px-10 sm:py-12">
              {/* Console-style 404 */}
              <div className="mb-6 font-mono text-xs text-slate-500 dark:text-zinc-500">
                <span className="text-emerald-500 dark:text-emerald-400">$</span>{" "}
                <span className="text-slate-700 dark:text-zinc-300">route</span>{" "}
                <span className="text-amber-500 dark:text-amber-400">--resolve</span>{" "}
                <span className="text-rose-500 dark:text-rose-400">{requestedPath}</span>
              </div>

              <div className="flex items-start gap-4">
                <div className="hidden shrink-0 sm:block">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 ring-1 ring-rose-500/30">
                    <span className="material-symbols-outlined text-3xl text-rose-500 dark:text-rose-400">
                      error
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="font-headline text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    <span className="font-mono text-rose-500 dark:text-rose-400">[404]</span>{" "}
                    Endpoint không tồn tại
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                    Đường dẫn quản trị bạn yêu cầu không có trong hệ thống. Có thể route đã bị thu hồi,
                    quyền truy cập không đủ, hoặc URL bị nhập sai.
                  </p>
                </div>
              </div>

              {/* Fake stack trace */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-zinc-900/60 p-4 font-mono text-[11px] leading-relaxed">
                <div className="text-slate-500 dark:text-zinc-500">
                  <span className="text-rose-500 dark:text-rose-400">NoResourceFoundException</span>: No handler found for {requestedPath}
                </div>
                <div className="mt-1 text-slate-400 dark:text-zinc-600">
                  at{" "}
                  <span className="text-cyan-600 dark:text-cyan-400">
                    Router.resolveRoute
                  </span>{" "}
                  (router.tsx:142:18)
                </div>
                <div className="text-slate-400 dark:text-zinc-600">
                  at{" "}
                  <span className="text-cyan-600 dark:text-cyan-400">
                    AdminGuard.check
                  </span>{" "}
                  (admin-shell.tsx:213:5)
                </div>
                <div className="mt-2 text-slate-500 dark:text-zinc-500">
                  <span className="text-amber-500 dark:text-amber-400">request_id</span>: req_log_{Math.floor(Math.random() * 1e9).toString(36)}
                </div>
                <div className="text-slate-500 dark:text-zinc-500">
                  <span className="text-amber-500 dark:text-amber-400">timestamp</span>: {timestamp}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/admin/dashboard"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40 dark:from-cyan-500 dark:via-indigo-600 dark:to-indigo-700 dark:shadow-cyan-400/25"
                >
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>Về Dashboard</span>
                </Link>

                <Link
                  href="/admin/products"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-white backdrop-blur-md shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  <span>Sản phẩm</span>
                </Link>

                <Link
                  href="/admin/orders"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-white backdrop-blur-md shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                  <span>Đơn hàng</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Debug / quick links grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickLink href="/admin/dashboard" icon="dashboard" label="Tổng quan" />
            <QuickLink href="/admin/categories" icon="category" label="Danh mục" />
            <QuickLink href="/admin/brands" icon="stars" label="Thương hiệu" />
            <QuickLink href="/admin/inventory" icon="warehouse" label="Kho hàng" />
            <QuickLink href="/admin/customers" icon="group" label="Khách hàng" />
            <QuickLink href="/admin/sales" icon="local_offer" label="Khuyến mãi" />
            <QuickLink href="/admin/activity-log" icon="history" label="Nhật ký" />
            <QuickLink href="/admin/reports" icon="monitoring" label="Báo cáo" />
          </div>

          {/* Help banner */}
          <div className="mt-8 rounded-2xl border border-indigo-500/20 bg-indigo-50/80 dark:bg-indigo-950/30 px-5 py-4 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-xl text-indigo-600 dark:text-cyan-400">
                info
              </span>
              <div className="text-xs text-slate-700 dark:text-zinc-300">
                <p className="font-bold text-slate-900 dark:text-white">Cần hỗ trợ?</p>
                <p className="mt-1 text-slate-600 dark:text-zinc-400">
                  Nếu bạn cho rằng đây là lỗi hệ thống, hãy liên hệ team kỹ thuật qua bot kê.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-zinc-950/60 p-3.5 backdrop-blur-md transition-all hover:scale-[1.03] hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:shadow-lg"
    >
      <span className="material-symbols-outlined text-xl text-slate-500 transition-colors group-hover:text-indigo-600 dark:text-zinc-400 dark:group-hover:text-cyan-400">
        {icon}
      </span>
      <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-200">
        {label}
      </span>
    </Link>
  );
}