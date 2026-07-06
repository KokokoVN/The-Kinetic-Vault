import Link from "next/link";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { deleteAdminBrand, getAdminBrandById, getAdminProductsPageForUi } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatusToast } from "@/components/status-toast";

export const dynamic = "force-dynamic";

export default async function DeleteBrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const flowError = sp?.error;
  const numId = Number(id);
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);

  if (!Number.isFinite(numId) || numId < 1) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">ID thương hiệu không hợp lệ.</div>
    );
  }

  const brand = await getAdminBrandById(numId, { accessToken: session.token });
  if (!brand) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Không tìm thấy thương hiệu <code className="rounded bg-amber-100 px-1">{id}</code> hoặc không có quyền truy cập.
      </div>
    );
  }

  // Count products associated with this brand
  const pageData = await getAdminProductsPageForUi({
    brandId: String(numId),
    size: 1,
    accessToken: session.token,
  });
  const productCount = pageData?.totalElements ?? 0;

  async function deleteAction(formData: FormData) {
    "use server";
    const s = await getAdminSession();
    const uid = getUserIdFromAccessToken(s.token);
    const bid = Number(String(formData.get("_brandId") ?? "").trim());
    if (!Number.isFinite(bid) || bid < 1) {
      redirect("/admin/brands?error=delete");
    }
    
    let success = false;
    try {
      await deleteAdminBrand(bid, {
        accessToken: s.token,
        username: s.username,
        userId: uid,
      });
      revalidatePath("/admin/brands");
      success = true;
    } catch {
      // ignore
    }

    if (success) {
      redirect("/admin/brands?success=delete");
    } else {
      redirect(`/admin/brands/${bid}/delete?error=api`);
    }
  }

  const cancelHref = `/admin/brands/${id}`;

  return (
    <div className="relative min-h-[70vh] animate-in fade-in duration-300">
      {flowError === "api" && (
        <StatusToast tone="error" title="Xóa thất bại" message="Có lỗi xảy ra khi xóa thương hiệu. Vui lòng kiểm tra lại sau." />
      )}

      {/* Background card preview overlay */}
      <section className="grid gap-6 opacity-20 lg:grid-cols-3 pointer-events-none select-none">
        {[brand, brand, brand].map((b, index) => (
          <div
            key={`${b.id}-${index}`}
            className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              <span className="material-symbols-outlined text-3xl">sell</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{b.name}</h3>
              <p className="text-sm text-slate-500 truncate">{b.description || "Không có mô tả"}</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">#{b.id}</div>
          </div>
        ))}
      </section>

      {/* Standardized Glassmorphic Alert Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-955/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
          
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
          
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-650 dark:text-red-400 ring-8 ring-red-50/50 dark:ring-red-950/20">
              <span className="material-symbols-outlined text-3xl material-filled">warning</span>
            </div>
            
            <h2 className="mb-2 font-headline text-2xl font-black text-slate-900 dark:text-white">
              Xác nhận xóa thương hiệu
            </h2>
            
            <p className="mb-6 text-xs sm:text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa thương hiệu này không?
              <br />
              <span className="font-bold text-red-600 dark:text-red-400">Hành động này sẽ xóa vĩnh viễn và không thể khôi phục.</span>
            </p>

            {productCount > 0 ? (
              <p className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400 text-left">
                Thương hiệu này đang được liên kết với <strong>{productCount}</strong> sản phẩm. Khi xóa, các sản phẩm liên kết vẫn sẽ được giữ lại nhưng thông tin thương hiệu sẽ bị bỏ trống.
              </p>
            ) : (
              <p className="mb-6 text-xs text-slate-550 dark:text-slate-400">
                Thương hiệu này hiện không có sản phẩm nào liên kết, sẵn sàng để xóa an toàn.
              </p>
            )}

            {/* Brand Brief widget */}
            <div className="mb-8 flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-4 text-left shadow-inner">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm">
                <span className="material-symbols-outlined text-2xl">sell</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-bold leading-tight text-slate-800 dark:text-white truncate">
                  {brand.name}
                </h4>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 truncate">
                  ID #{brand.id} {brand.description ? ` · ${brand.description}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-3.5 text-sm font-bold text-slate-650 dark:text-slate-350 transition-colors"
                href={cancelHref}
              >
                Hủy bỏ
              </Link>
              <form action={deleteAction} className="w-full">
                <input type="hidden" name="_brandId" value={String(numId)} />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-red-600 hover:bg-red-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
                >
                  Xóa ngay
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-850 px-8 py-3.5">
            <span className="material-symbols-outlined text-[13px] text-slate-400">lock</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Thao tác quản trị an toàn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
