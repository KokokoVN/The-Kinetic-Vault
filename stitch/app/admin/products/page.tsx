import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminProductsPageForUi, listAdminBrands, listAdminCategories } from "@/lib/api";
import { ProductsDashboard } from "@/components/products-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const canWrite = session.canMutateCatalog;

  const resolvedSearchParams = await searchParams;

  // Extract query params for filtering
  const page = resolvedSearchParams.page ? Math.max(0, Number(resolvedSearchParams.page) - 1) : 0;
  const size = resolvedSearchParams.size ? Number(resolvedSearchParams.size) : 20;
  const q = resolvedSearchParams.q as string | undefined;
  const categoryId = resolvedSearchParams.categoryId as string | undefined;
  const brandId = resolvedSearchParams.brandId as string | undefined;
  const filterDeleted = (resolvedSearchParams.filterDeleted as string) || "active";
  const sortBy = (resolvedSearchParams.sortBy as string) || "newest";

  // Fetch paginated products and statistics counts in parallel
  const [pageData, activeStats, deletedStats, brands, categories] = await Promise.all([
    getAdminProductsPageForUi({
      page,
      size,
      q,
      categoryId,
      brandId,
      filterDeleted,
      sortBy,
      accessToken: session.token,
      username: session.username,
      userId,
    }),
    getAdminProductsPageForUi({
      size: 1,
      filterDeleted: "active",
      accessToken: session.token,
      username: session.username,
      userId,
    }),
    getAdminProductsPageForUi({
      size: 1,
      filterDeleted: "deleted",
      accessToken: session.token,
      username: session.username,
      userId,
    }),
    listAdminBrands({ accessToken: session.token }),
    listAdminCategories({ accessToken: session.token }),
  ]);

  const totalActive = activeStats.totalElements;
  const totalDeleted = deletedStats.totalElements;
  const totalAll = totalActive + totalDeleted;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 text-slate-800 dark:text-zinc-100">
      {/* ==================== HEADER CARD ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 dark:border-cyan-500/30 bg-blue-50/80 dark:bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">inventory_2</span>
              Catalog Products
            </p>
            <h1 className="mt-3 font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              Sản Phẩm & Hàng Hóa
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Quản lý tập trung toàn bộ danh mục sản phẩm, biến thể đa cấp, phân phối giá niêm yết và trạng thái bán hàng trên toàn sàn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canWrite ? (
              <Link
                prefetch
                href="/admin/products/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 px-6 py-3.5 font-headline text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Thêm sản phẩm mới</span>
              </Link>
            ) : (
              <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 px-6 py-3.5 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Chế độ chỉ đọc
              </span>
            )}
          </div>
        </div>

        {/* ==================== 4 STAT CARDS ==================== */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-white/10 pt-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-cyan-400">inventory_2</span>
              <span>Tổng sản phẩm</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-slate-900 dark:text-white">{totalAll}</p>
          </div>

          <Link
            href="/admin/products?filterDeleted=active"
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs hover:border-emerald-400/50 transition-all group"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Đang bán</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalActive}</p>
          </Link>

          <Link
            href="/admin/products?filterDeleted=deleted"
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs hover:border-rose-400/50 transition-all group"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-rose-600 dark:text-rose-400">auto_delete</span>
              <span className="group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Trong thùng rác</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-rose-600 dark:text-rose-400">{totalDeleted}</p>
          </Link>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">category</span>
              <span>Ngành & Thương hiệu</span>
            </div>
            <p className="mt-2 font-headline text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {categories.length} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">mục</span> · {brands.length} <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">hiệu</span>
            </p>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCTS DASHBOARD ==================== */}
      <ProductsDashboard
        accessToken={session.token ?? ""}
        username={session.username!}
        userId={String(userId)}
        brands={brands}
        categories={categories}
        initialProducts={pageData.items}
        totalElements={pageData.totalElements}
        totalPages={pageData.totalPages}
        currentPage={page + 1}
        pageSize={size}
        qParam={q || ""}
        categoryParam={categoryId || "all"}
        brandParam={brandId || "all"}
        filterDeletedParam={filterDeleted}
        sortByParam={sortBy}
        canWrite={canWrite}
      />
    </div>
  );
}
