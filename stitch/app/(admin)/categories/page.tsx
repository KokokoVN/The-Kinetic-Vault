import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminCategories, restoreCategory, type BackendCategory } from "@/lib/api";
import { CategoryListFilters } from "@/components/category-list-filters";
import { FloatingNotice } from "@/components/floating-notice";
import { CategoryListDisplay } from "@/components/category-list-display";

export const dynamic = "force-dynamic";

type PageSearchParams = {
  error?: string;
  success?: string;
  q?: string;
  deleted?: "active" | "deleted" | "all";
  page?: string;
  pageSize?: string;
  sortBy?: "updatedAt" | "createdAt" | "name" | "id" | "slug";
  sortDir?: "asc" | "desc";
};

function normalizeDeletedFilter(raw?: string): "active" | "deleted" | "all" {
  if (raw === "deleted" || raw === "all") {
    return raw;
  }
  return "active";
}

function normalizePageSize(raw?: string): number {
  const n = Number(raw ?? 20);
  if ([10, 20, 50, 100].includes(n)) {
    return n;
  }
  return 20;
}

function includesQuery(c: BackendCategory, qLower: string): boolean {
  if (!qLower) return true;
  const byName = String(c.name ?? "").toLowerCase().includes(qLower);
  const bySlug = String(c.slug ?? "").toLowerCase().includes(qLower);
  const byId = String(c.id ?? "").includes(qLower);
  return byName || bySlug || byId;
}

function queryString(base: {
  q: string;
  deleted: "active" | "deleted" | "all";
  pageSize: number;
  page: number;
  sortBy?: string;
  sortDir?: string;
}): string {
  const p = new URLSearchParams();
  if (base.q.trim()) {
    p.set("q", base.q.trim());
  }
  p.set("deleted", base.deleted);
  p.set("pageSize", String(base.pageSize));
  p.set("page", String(base.page));
  if (base.sortBy) p.set("sortBy", base.sortBy);
  if (base.sortDir) p.set("sortDir", base.sortDir);
  return p.toString();
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<PageSearchParams>;
}) {
  async function restoreAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const userId = getUserIdFromAccessToken(session2.token);
    const categoryId = Number(String(formData.get("_categoryId") ?? "").trim());
    if (!Number.isFinite(categoryId) || categoryId < 1) {
      redirect("/admin/categories?error=restore");
    }

    try {
      await restoreCategory(categoryId, {
        accessToken: session2.token,
        username: session2.username,
        userId,
      });
      revalidatePath("/admin/categories");
      revalidatePath(`/admin/categories/${categoryId}`);
    } catch {
      redirect("/admin/categories?error=restore");
    }

    redirect("/admin/categories?success=restore");
  }

  const sp = searchParams ? await searchParams : undefined;
  const filterDeleted = normalizeDeletedFilter(sp?.deleted);
  const q = String(sp?.q ?? "").trim();
  const qLower = q.toLowerCase();
  const pageSize = normalizePageSize(sp?.pageSize);
  const pageRaw = Number(sp?.page ?? 1);
  const requestedPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const sortBy = sp?.sortBy ?? "updatedAt";
  const sortDir = sp?.sortDir ?? "desc";

  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog;

  // 1. Fetch both active and deleted categories to calculate statistics accurately
  const [activeCategories, deletedCategories] = await Promise.all([
    listAdminCategories({ deletionFilter: "active", accessToken: session.token }),
    listAdminCategories({ deletionFilter: "deleted", accessToken: session.token }),
  ]);

  const totalActive = activeCategories.length;
  const totalDeleted = deletedCategories.length;
  const totalAll = totalActive + totalDeleted;
  const totalProductCount = activeCategories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // 2. Select the base list for current filter
  const baseCategories =
    filterDeleted === "deleted"
      ? deletedCategories
      : filterDeleted === "all"
        ? [...activeCategories, ...deletedCategories]
        : activeCategories;

  // 3. Search filter
  const filtered = baseCategories.filter((c) => includesQuery(c, qLower));

  // 4. Sort
  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortBy === "name") {
      cmp = String(a.name ?? "").localeCompare(String(b.name ?? ""), "vi");
    } else if (sortBy === "slug") {
      cmp = String(a.slug ?? "").localeCompare(String(b.slug ?? ""));
    } else if (sortBy === "id") {
      cmp = (a.id ?? 0) - (b.id ?? 0);
    } else {
      // Default: updatedAt or createdAt
      cmp = (b.id ?? 0) - (a.id ?? 0);
    }
    return sortDir === "desc" ? cmp : -cmp;
  });

  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  // Notice Notification
  const notice =
    sp?.success === "create"
      ? { variant: "success" as const, title: "Thành Công", message: "Đã tạo danh mục mới thành công." }
      : sp?.success === "update"
        ? { variant: "success" as const, title: "Thành Công", message: "Đã cập nhật thông tin danh mục thành công." }
        : sp?.success === "delete"
          ? { variant: "success" as const, title: "Thành Công", message: "Đã chuyển danh mục vào thùng rác." }
          : sp?.success === "restore"
            ? { variant: "success" as const, title: "Khôi Phục Thành Công", message: "Đã khôi phục danh mục trở lại hoạt động." }
            : sp?.error === "duplicate"
              ? { variant: "warning" as const, title: "Trùng Tên Danh Mục", message: "Đã có danh mục cùng tên (không phân biệt hoa thường)." }
              : sp?.error === "create"
                ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Tạo danh mục thất bại. Kiểm tra kết nối backend." }
                : sp?.error === "update"
                  ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Cập nhật danh mục thất bại." }
                  : sp?.error === "restore"
                    ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Khôi phục danh mục thất bại." }
                    : null;

  const prevHref = `/admin/categories?${queryString({ q, deleted: filterDeleted, pageSize, page: Math.max(1, page - 1), sortBy, sortDir })}`;
  const nextHref = `/admin/categories?${queryString({ q, deleted: filterDeleted, pageSize, page: Math.min(totalPages, page + 1), sortBy, sortDir })}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 text-slate-800 dark:text-zinc-100 pb-20">
      {notice && <FloatingNotice variant={notice.variant} title={notice.title} message={notice.message} />}

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
              <span className="material-symbols-outlined text-[14px]">category</span>
              Catalog Categories
            </p>
            <h1 className="mt-3 font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              Danh Mục Sản Phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Quản lý phân loại sản phẩm, cấu trúc cây danh mục và tối ưu hóa điều hướng trải nghiệm mua sắm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {canWrite ? (
              <Link
                prefetch
                href="/admin/categories/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 px-6 py-3.5 font-headline text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35 active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                <span>Thêm danh mục mới</span>
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
              <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-cyan-400">category</span>
              <span>Tổng danh mục</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-slate-900 dark:text-white">{totalAll}</p>
          </div>

          <Link
            href="/admin/categories?deleted=active"
            className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs hover:border-emerald-400/50 transition-all group"
          >
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Đang hoạt động</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalActive}</p>
          </Link>

          <Link
            href="/admin/categories?deleted=deleted"
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
              <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">inventory_2</span>
              <span>Sản phẩm liên kết</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-slate-900 dark:text-white">{totalProductCount}</p>
          </div>
        </div>
      </section>

      {/* ==================== FILTERS & LIST DATA ==================== */}
      <CategoryListFilters
        q={q}
        deleted={filterDeleted}
        pageSize={pageSize}
        page={page}
        sortBy={sortBy}
        sortDir={sortDir}
      >
        <div className="space-y-6">
          <CategoryListDisplay items={items} start={start} canWrite={canWrite} onRestore={restoreAction} />

          {/* ==================== PAGINATION ==================== */}
          {items.length > 0 && (
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-5 shadow-sm dark:shadow-2xl sm:flex-row sm:items-center sm:justify-between backdrop-blur-2xl">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Trang <span className="font-bold text-blue-600 dark:text-cyan-400">{page}</span>/{totalPages} · Hiển thị {items.length}/{totalFiltered} danh mục
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={prevHref}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    page <= 1 
                      ? "pointer-events-none bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 opacity-50 border border-slate-200 dark:border-white/5" 
                      : "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-blue-300 dark:hover:border-cyan-500/30 shadow-xs"
                  }`}
                >
                  Trước
                </Link>
                <Link
                  href={nextHref}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    page >= totalPages 
                      ? "pointer-events-none bg-slate-100 dark:bg-zinc-900 text-slate-400 dark:text-zinc-600 opacity-50 border border-slate-200 dark:border-white/5" 
                      : "bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-blue-300 dark:hover:border-cyan-500/30 shadow-xs"
                  }`}
                >
                  Sau
                </Link>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <div className="rounded-3xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-12 text-center backdrop-blur-xl">
              <span className="material-symbols-outlined text-4xl text-amber-500 mb-2">category</span>
              <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">Không tìm thấy danh mục</h3>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
                Không có danh mục nào khớp với bộ lọc hoặc từ khóa tìm kiếm hiện tại. Thử đổi bộ lọc hoặc tạo danh mục mới.
              </p>
            </div>
          )}
        </div>
      </CategoryListFilters>
    </div>
  );
}
