import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { listAdminBrands, deleteAdminBrand, type AdminBrand } from "@/lib/api";
import { StatusToast } from "@/components/status-toast";
import Link from "next/link";
import { ClientConfirmSubmitButton } from "@/components/client-confirm-submit-button";

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
  const pageSize = 10;
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
    <div className="space-y-8">
      {toast && <StatusToast tone={toast.tone} title={toast.title} message={toast.message} />}
      {errorToast && <StatusToast tone={errorToast.tone} title={errorToast.title} message={errorToast.message} />}

      {/* Header */}
      <section className="flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 p-6 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl md:flex-row md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-sm">sell</span>
            Catalog
          </p>
          <h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-purple-900 dark:text-purple-400">Thương hiệu</h1>
          <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
            Quản lý danh sách thương hiệu. Thương hiệu được gán vào sản phẩm khi tạo hoặc chỉnh sửa.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white/60 dark:bg-slate-800/50 px-5 py-3 backdrop-blur-sm shadow-sm">
          <span className="material-symbols-outlined text-2xl text-purple-700 dark:text-purple-400">inventory_2</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tổng</p>
            <p className="font-headline text-2xl font-black text-purple-900 dark:text-white">{totalItems}</p>
          </div>
        </div>
      </section>

      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form method="GET" action="/admin/brands" className="flex items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
            <input
              type="text"
              name="q"
              defaultValue={sp?.q}
              placeholder="Tìm kiếm thương hiệu..."
              className="w-full sm:w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
          >
            Tìm
          </button>
        </form>
        {canWrite && (
          <Link
            href="/admin/brands/new"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-blue-600/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Thêm thương hiệu mới
          </Link>
        )}
      </div>

      {/* Brand List */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80">
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  STT
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Logo
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Tên thương hiệu
                </th>
                <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Mô tả
                </th>
                {canWrite && (
                  <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentBrands.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    Chưa có thương hiệu nào. Thêm thương hiệu đầu tiên bên trên.
                  </td>
                </tr>
              )}
              {currentBrands.map((brand, idx) => (
                <tr
                  key={brand.id}
                  className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                >
                  <td className="px-6 py-4 text-right font-mono text-xs text-slate-500 dark:text-slate-400">{startIndex + idx + 1}</td>
                  <td className="px-6 py-4">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl.startsWith("http") ? brand.logoUrl : `${gatewayOrigin}${brand.logoUrl}`}
                        alt={brand.name}
                        className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                        <span className="material-symbols-outlined text-sm text-indigo-500 dark:text-indigo-400">sell</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-headline text-sm font-bold text-blue-900 dark:text-white">{brand.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID #{brand.id}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate">{brand.description ?? "—"}</td>
                  {canWrite && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/brands/${brand.id}`}
                          title="Xem chi tiết"
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </Link>
                        <Link
                          href={`/admin/brands/${brand.id}/edit`}
                          title="Chỉnh sửa"
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                        <form action={deleteAction}>
                          <input type="hidden" name="_brandId" value={brand.id} />
                          <ClientConfirmSubmitButton
                            title="Xóa thương hiệu"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                            confirmMessage={`Xóa thương hiệu "${brand.name}"? Hành động không thể hoàn tác.`}
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </ClientConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            {currentPage > 1 && (
              <Link
                href={`/admin/brands?page=${currentPage - 1}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
              >
                Trước
              </Link>
            )}
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Trang {currentPage} / {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/admin/brands?page=${currentPage + 1}${sp?.q ? `&q=${encodeURIComponent(sp.q)}` : ""}`}
                className="rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
              >
                Sau
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
