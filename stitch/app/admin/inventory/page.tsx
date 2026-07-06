import { getAdminSession } from "@/lib/auth-server";
import { getAdminProductsForUi } from "@/lib/api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { InventoryDashboard } from "@/components/inventory-dashboard";

import { getInventoryBalances } from "@/lib/inventory-api";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);

  const products = await getAdminProductsForUi({ accessToken: session.token, username: session.username, userId });
  
  // Fetch initial balances just to get the total count for the banner
  const initialBalances = await getInventoryBalances(0, 1, { accessToken: session.token });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-white/40 dark:border-slate-700/40 bg-white/60 dark:bg-slate-900/60 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-xl md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Kho hàng
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-blue-900 dark:text-white">Quản lý Tồn kho</h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Quản lý và cập nhật số lượng hàng hóa tồn kho
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-5 py-3 backdrop-blur-sm shadow-sm">
          <span className="material-symbols-outlined text-2xl text-blue-700">warehouse</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng mã SP</p>
            <p className="font-headline text-2xl font-black text-blue-900 dark:text-white">{initialBalances.totalElements}</p>
          </div>
        </div>
      </section>

      <InventoryDashboard 
        accessToken={session.token} 
        username={session.username!} 
        products={products.map(p => ({ id: Number(p.id), name: p.name, sku: p.sku, heroImage: p.heroImage }))}
      />
    </div>
  );
}
