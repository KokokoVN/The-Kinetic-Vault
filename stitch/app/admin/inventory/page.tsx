import { getAdminSession } from "@/lib/auth-server";
import { getAdminProductsForUi } from "@/lib/api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { InventoryDashboard } from "@/components/inventory-dashboard";
import { getInventoryBalances, getLowStockItems } from "@/lib/inventory-api";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);

  // Fetch products, initial balances count and low-stock count
  const [products, initialBalances, lowStockItems] = await Promise.all([
    getAdminProductsForUi({ accessToken: session.token, username: session.username, userId }),
    getInventoryBalances(0, 1, { accessToken: session.token }).catch(() => ({ totalElements: 0, content: [], totalPages: 1, number: 0, size: 1 })),
    getLowStockItems({ accessToken: session.token }).catch(() => []),
  ]);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {/* ==================== HERO HEADER BANNER ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300 shadow-sm">
                <span className="material-symbols-outlined text-[15px]">warehouse</span>
                Kho Vận & Tồn Kho
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống hoạt động
              </span>
            </div>

            <h1 className="mt-3.5 font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Quản lý Tồn kho & Nhập hàng
            </h1>

            <p className="mt-2.5 max-w-2xl text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Kiểm soát số lượng tồn theo thời gian thực, lập phiếu nhập kho đa biến thể, tính toán giá vốn và quản lý lịch sử xuất nhập minh bạch.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-5 py-3.5 shadow-sm backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <span className="material-symbols-outlined text-2xl">category</span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tổng mã SP tồn
                </p>
                <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">
                  {initialBalances.totalElements}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 px-5 py-3.5 shadow-sm backdrop-blur-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-2xl">warning_amber</span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Cảnh báo sắp hết
                </p>
                <p className="font-headline text-2xl font-black text-amber-600 dark:text-amber-400">
                  {lowStockItems.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== INVENTORY DASHBOARD SUITE ==================== */}
      <InventoryDashboard
        accessToken={session.token}
        username={session.username!}
        products={products.map((p) => ({
          id: Number(p.id),
          name: p.name,
          sku: p.sku,
          heroImage: p.heroImage,
        }))}
        initialTotalSkus={initialBalances.totalElements}
        initialLowStockCount={lowStockItems.length}
      />
    </div>
  );
}
