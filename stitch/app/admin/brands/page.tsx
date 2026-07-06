import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { listAdminBrands, deleteAdminBrand, type AdminBrand } from "@/lib/api";
import { StatusToast } from "@/components/status-toast";
import Link from "next/link";
import { BrandListFilters } from "@/components/brand-list-filters";
import { BrandListDisplay } from "@/components/brand-list-display";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; q?: string; page?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const canWrite = session.canMutateCatalog;

  let brands = await listAdminBrands({ accessToken: session.token });

  const q = sp?.q?.trim().toLowerCase() || "";
  if (q) {
    brands = brands.filter(
      (b) => b.name.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
    );
  }

  const pageParam = parseInt(sp?.page || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 12; // increased to 12 for grid alignment
  const totalItems = brands.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBrands = brands.slice(startIndex, endIndex);

  const gatewayOrigin = process.env.API_SERVER_ORIGIN || "http://localhost:8900";

  const toast =
    sp?.success === "create"
      ? { tone: "success" as const, title: "Thành công", message: "Đã tạo thương hiệu mới." }
      : sp?.success === "update"
        ? { tone: "success" as const, title: "Thành công", message: "Đã cập nhật thương hiệu." }
        : sp?.success === "delete"
          ? { tone: "success" as const, title: "Thành công", message: "Đã xóa thương hiệu." }
          : null;

  const errorToast =
    sp?.error === "delete"
      ? { tone: "error" as const, title: "Thất bại", message: "Xóa thương hiệu thất bại." }
      : null;

  async function deleteAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    const id = Number(formData.get("_brandId") ?? 0);
    if (!id) redirect("/admin/brands?error=delete");
    try {
      await deleteAdminBrand(id, {
        accessToken: session2.token,
        username: session2.username,
        userId: uid,
      });
      revalidatePath("/admin/brands");
    } catch {
      redirect("/admin/brands?error=delete");
    }
    redirect("/admin/brands?success=delete");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {toast && <StatusToast tone={toast.tone} title={toast.title} message={toast.message} />}
      {errorToast && <StatusToast tone={errorToast.tone} title={errorToast.title} message={errorToast.message} />}

      {/* ==================== HEADER ==================== */}
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-6 sm:p-8 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl md:flex-row md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">sell</span>
            Catalog Management
          </p>
          <h1 className="mt-3 font-headline text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">Thương hiệu</h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Quản lý danh sách đối tác thương hiệu liên kết với sản phẩm, đồng bộ logo hiển thị trên cửa hàng.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-5 py-3.5 backdrop-blur-sm shadow-sm">
            <span className="material-symbols-outlined text-2xl text-purple-705 dark:text-purple-400">inventory_2</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tổng số</p>
              <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{totalItems}</p>
            </div>
          </div>
          
          {canWrite && (
            <Link
              href="/admin/brands/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-headline text-sm font-bold text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all hover:scale-[1.02] hover:shadow-xl"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Thêm thương hiệu mới</span>
            </Link>
          )}
        </div>
      </section>

      {/* ==================== FILTERS & DISPLAY SWITCHER ==================== */}
      <BrandListFilters q={sp?.q || ""} page={currentPage}>
        <div className="space-y-6">
          <BrandListDisplay
            items={currentBrands}
            startIndex={startIndex}
            canWrite={canWrite}
            gatewayOrigin={gatewayOrigin}
            onDelete={deleteAction}
          />

          {/* Pagination Card */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Trang {currentPage} / {totalPages} · Hiển thị {currentBrands.length} / {totalItems} thương hiệu
              </span>
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/admin/brands?page=${currentPage - 1}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                    className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                  >
                    Trước
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/admin/brands?page=${currentPage + 1}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                    className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
                  >
                    Sau
                  </Link>
                )}
              </div>
            </div>
          )}

          {currentBrands.length === 0 && (
            <div className="rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 px-4 py-3.5 text-sm text-amber-800 dark:text-amber-450 border border-amber-200/40 dark:border-amber-900/20 text-center py-10">
              Không có thương hiệu nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </BrandListFilters>
    </div>
  );
}
