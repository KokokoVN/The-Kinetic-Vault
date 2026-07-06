import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminCategories, restoreCategory, type BackendCategory } from "@/lib/api";
import { CategoryListFilters } from "@/components/category-list-filters";
import { StatusToast } from "@/components/status-toast";
import { CategoryListDisplay } from "@/components/category-list-display";

export const dynamic = "force-dynamic";

type PageSearchParams = {
  error?: string | "restore";
  success?: "create" | "update" | "delete" | "restore";
  q?: string;
  deleted?: "active" | "deleted" | "all";
  page?: string;
  pageSize?: string;
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
  if (!qLower) {
    return true;
  }
  const byName = String(c.name ?? "").toLowerCase().includes(qLower);
  const bySlug = String(c.slug ?? "").toLowerCase().includes(qLower);
  const byId = String(c.id ?? "").includes(qLower);
  return byName || bySlug || byId;
}

function queryString(base: { q: string; deleted: "active" | "deleted" | "all"; pageSize: number; page: number }): string {
  const p = new URLSearchParams();
  if (base.q.trim()) {
    p.set("q", base.q.trim());
  }
  p.set("deleted", base.deleted);
  p.set("pageSize", String(base.pageSize));
  p.set("page", String(base.page));
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

  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog;
  const categories = await listAdminCategories({ deletionFilter: filterDeleted, accessToken: session.token });

  const createError = sp?.error === "create";
  const duplicateError = sp?.error === "duplicate";
  const updateFailed = sp?.error === "update";
  const restoreFailed = sp?.error === "restore";
  const success = sp?.success;

  const successBanner =
    success === "create"
      ? "Tạo danh mục thành công."
      : success === "update"
        ? "Cập nhật danh mục thành công."
        : success === "delete"
          ? "Xóa danh mục thành công."
          : success === "restore"
            ? "Khôi phục danh mục thành công."
          : null;

  const toast = successBanner
    ? { tone: "success" as const, title: "Thành công", message: successBanner }
    : duplicateError
      ? { tone: "warning" as const, title: "Trùng tên danh mục", message: "Đã có danh mục cùng tên (không phân biệt hoa thường)." }
      : createError
        ? { tone: "error" as const, title: "Tạo danh mục thất bại", message: "Kiểm tra gateway hoặc quyền admin rồi thử lại." }
        : updateFailed
          ? { tone: "error" as const, title: "Cập nhật thất bại", message: "Lần trước cập nhật không thành công. Kiểm tra backend rồi thử lại." }
          : restoreFailed
            ? { tone: "error" as const, title: "Khôi phục thất bại", message: "Khôi phục danh mục thất bại. Kiểm tra gateway hoặc trùng tên/slug." }
            : null;

  const filtered = categories.filter((c) => includesQuery(c, qLower));
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  const prevHref = `/admin/categories?${queryString({ q, deleted: filterDeleted, pageSize, page: Math.max(1, page - 1) })}`;
  const nextHref = `/admin/categories?${queryString({ q, deleted: filterDeleted, pageSize, page: Math.min(totalPages, page + 1) })}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {toast ? <StatusToast tone={toast.tone} title={toast.title} message={toast.message} /> : null}

      {/* ==================== HEADER CARD ==================== */}
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 p-6 sm:p-8 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl md:flex-row md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">dashboard_customize</span>
            Catalog Management
          </p>
          <h1 className="mt-3 font-headline text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Danh mục sản phẩm</h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý nhóm sản phẩm, cấu hình đường dẫn và trạng thái hiển thị của toàn bộ danh mục sản phẩm trên cửa hàng.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-5 py-3.5 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">dashboard</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng số</p>
              <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{totalFiltered}</p>
            </div>
          </div>
          
          {canWrite ? (
            <Link
              prefetch
              href="/admin/categories/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-headline text-sm font-bold text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Thêm danh mục mới</span>
            </Link>
          ) : (
            <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl border border-dashed border-slate-350 dark:border-slate-800 px-6 py-4 text-sm font-medium text-slate-500 opacity-70">
              <span className="material-symbols-outlined">lock</span>
              Không có quyền thêm
            </span>
          )}
        </div>
      </section>

      {/* ==================== FILTERS & LIST DATA ==================== */}
      <CategoryListFilters q={q} deleted={filterDeleted} pageSize={pageSize} page={page}>
        <div className="space-y-6">
          <CategoryListDisplay items={items} start={start} canWrite={canWrite} onRestore={restoreAction} />

          {/* Pagination Card */}
          {items.length > 0 && (
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Trang {page}/{totalPages} · Hiển thị {items.length}/{totalFiltered} danh mục
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={prevHref}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                    page <= 1 
                      ? "pointer-events-none bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 opacity-60" 
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-700 shadow-sm"
                  }`}
                >
                  Trước
                </Link>
                <Link
                  href={nextHref}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
                    page >= totalPages 
                      ? "pointer-events-none bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 opacity-60" 
                      : "bg-white dark:bg-slate-800 border border-slate-205 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-700 shadow-sm"
                  }`}
                >
                  Sau
                </Link>
              </div>
            </div>
          )}

          {items.length === 0 && (
            <p className="rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 px-4 py-3.5 text-sm text-amber-800 dark:text-amber-450 border border-amber-200/40 dark:border-amber-900/20">
              Không có danh mục phù hợp bộ lọc hiện tại.
            </p>
          )}
        </div>
      </CategoryListFilters>
    </div>
  );
}
