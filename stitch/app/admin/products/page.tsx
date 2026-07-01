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
  const page = resolvedSearchParams.page ? Number(resolvedSearchParams.page) - 1 : 0; // Spring starts at 0
  const size = resolvedSearchParams.size ? Number(resolvedSearchParams.size) : 20;
  const q = resolvedSearchParams.q as string | undefined;
  const categoryId = resolvedSearchParams.categoryId as string | undefined;
  const brandId = resolvedSearchParams.brandId as string | undefined;
  const filterDeleted = (resolvedSearchParams.filterDeleted as string) || "active";
  const sortBy = (resolvedSearchParams.sortBy as string) || "newest";

  // Fetch paginated products from server
  const pageData = await getAdminProductsPageForUi({
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
  });

  // Fetch brands and categories for the Excel import tab
  const brands = await listAdminBrands({ accessToken: session.token });
  const categories = await listAdminCategories({ accessToken: session.token });

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 dark:border-slate-800/50 dark:bg-slate-900/60 p-6 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 dark:border-slate-700/50 dark:bg-slate-800/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Catalog
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-blue-900 dark:text-white">Sản phẩm</h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Quản lý tập trung danh sách sản phẩm, giá cả và trạng thái hiển thị
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800/50 dark:bg-slate-800/50 px-5 py-3 backdrop-blur-sm shadow-sm">
          <span className="material-symbols-outlined text-2xl text-blue-700 dark:text-blue-400">category</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng</p>
            <p className="font-headline text-2xl font-black text-blue-900 dark:text-white">{pageData.totalElements}</p>
          </div>
        </div>
      </section>

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
