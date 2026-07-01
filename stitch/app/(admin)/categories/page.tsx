import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { listAdminCategories, restoreCategory, type BackendCategory } from "@/lib/api";
import { CategoryListFilters } from "@/components/category-list-filters";
import { StatusToast } from "@/components/status-toast";
import { CategoryDeleteButton } from "@/components/category-delete-button";

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

  const withSlug = filtered.filter((c) => c.slug && String(c.slug).trim().length > 0).length;
  const withoutSlug = totalFiltered - withSlug;
  const deletedCount = filterDeleted !== "active"
    ? filtered.filter((c) => c.deletedAt != null).length
    : 0;

  const prevHref = `/admin/categories?${queryString({ q, deleted: filterDeleted, pageSize, page: Math.max(1, page - 1) })}`;
  const nextHref = `/admin/categories?${queryString({ q, deleted: filterDeleted, pageSize, page: Math.min(totalPages, page + 1) })}`;

  return (
    <div className="space-y-8">
      {toast ? <StatusToast tone={toast.tone} title={toast.title} message={toast.message} /> : null}

      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 dark:border-slate-800/50 dark:bg-slate-900/60 p-6 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 dark:border-slate-700/50 dark:bg-slate-800/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">dashboard_customize</span>
            Catalog Management
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-blue-900 dark:text-white">Danh mục sản phẩm</h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Quản lý nhóm sản phẩm, slug URL và trạng thái hiển thị danh mục theo cách trực quan.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800/50 dark:bg-slate-800/50 px-5 py-3 backdrop-blur-sm shadow-sm">
          <span className="material-symbols-outlined text-2xl text-blue-700 dark:text-blue-400">dashboard</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng</p>
            <p className="font-headline text-2xl font-black text-blue-900 dark:text-white">{totalFiltered}</p>
          </div>
        </div>
        {canWrite ? (
          <Link
            prefetch
            href="/admin/categories/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-headline text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Thêm danh mục mới</span>
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-slate-300 px-6 py-3.5 text-sm font-medium text-slate-500 opacity-70">
            <span className="material-symbols-outlined">lock</span>
            Không có quyền thêm danh mục
          </span>
        )}
      </section>



      <CategoryListFilters q={q} deleted={filterDeleted} pageSize={pageSize} page={page}>
      <section className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80">
              <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                  STT
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                  Danh mục
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                  Slug
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                  Trạng thái
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                  Ẩn/Hiện
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((c, index) => {
                const isDeleted = c.deletedAt != null;
                const stt = start + index + 1;
                return (
                  <tr key={c.id} className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-right font-mono text-xs uppercase tracking-tight text-slate-500 dark:text-slate-400">{stt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                          <span className="material-symbols-outlined text-2xl">category</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-headline text-sm font-bold text-blue-900 dark:text-white">{c.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Nhóm hàng #{c.id}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 font-mono text-sm text-slate-600 dark:text-slate-300">
                      {c.slug ? (
                        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1">{c.slug}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isDeleted ? "bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"}`}>
                        {isDeleted ? "Đã xóa" : "Đang hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isDeleted ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" : "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400"
                        }`}
                      >
                        {isDeleted ? "Ẩn" : "Hiện"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {!isDeleted ? (
                          <>
                            <Link
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                              href={`/admin/categories/${c.id}`}
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </Link>
                            {canWrite ? (
                              <>
                                <Link
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                                  href={`/admin/categories/${c.id}/edit`}
                                  title="Sửa"
                                >
                                  <span className="material-symbols-outlined text-[20px]">edit</span>
                                </Link>
                                <CategoryDeleteButton 
                                  categoryId={c.id} 
                                  categoryName={c.name} 
                                  className="group flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400" 
                                />
                              </>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <Link
                              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                              href={`/admin/categories/${c.id}`}
                              title="Xem chi tiết"
                            >
                              <span className="material-symbols-outlined text-[20px]">visibility</span>
                            </Link>
                            {canWrite ? (
                              <form action={restoreAction}>
                                <input type="hidden" name="_categoryId" value={String(c.id)} />
                                <button
                                  type="submit"
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                                  title="Khôi phục danh mục"
                                >
                                  <span className="material-symbols-outlined text-base">settings_backup_restore</span>
                                  Khôi phục
                                </button>
                              </form>
                            ) : null}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Trang {page}/{totalPages} · Hiển thị {items.length}/{totalFiltered} danh mục
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={prevHref}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${page <= 1 ? "pointer-events-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"}`}
            >
              Trước
            </Link>
            <Link
              href={nextHref}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${page >= totalPages ? "pointer-events-none bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"}`}
            >
              Sau
            </Link>
          </div>
        </div>
      </section>

      {items.length === 0 && (
        <p className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
          Không có danh mục phù hợp bộ lọc hiện tại.
        </p>
      )}
      </CategoryListFilters>
    </div>
  );
}
