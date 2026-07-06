import Link from "next/link";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { deleteCategoryRequest, getAdminCategory, getCategoryDeletePreview } from "@/lib/api";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminUserBrief } from "@/lib/api";
import { sendNotification } from "@/lib/notification-api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatusToast } from "@/components/status-toast";

export const dynamic = "force-dynamic";

export default async function DeleteCategoryPage({
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
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">ID danh mục không hợp lệ.</div>
    );
  }

  const category = await getAdminCategory(numId, { accessToken: session.token });
  const preview = await getCategoryDeletePreview(numId, { accessToken: session.token });

  if (!category) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Không tìm thấy danh mục <code className="rounded bg-amber-100 px-1">{id}</code> hoặc không có quyền truy cập.
      </div>
    );
  }

  const childCount = preview?.childCategoryCount ?? 0;
  const productCount = preview?.productCount ?? 0;
  const hasChildren = childCount > 0;
  const confirmDeleteWithProducts = productCount > 0;
  const previewMissing = preview == null;

  async function deleteAction(formData: FormData) {
    "use server";
    const s = await getAdminSession();
    const uid = getUserIdFromAccessToken(s.token);
    const cid = Number(String(formData.get("_categoryId") ?? "").trim());
    if (!Number.isFinite(cid) || cid < 1) {
      redirect("/admin/categories?error=delete");
    }
    const confirm =
      String(formData.get("confirmWithProducts") ?? "").trim() === "true";
    let result = await deleteCategoryRequest(cid, confirm, {
      accessToken: s.token,
      username: s.username,
      userId: uid,
    });
    if (result.ok) {
      await notifyCategoryAction(
        s.token,
        uid,
        s.username ?? "admin",
        "Xóa danh mục",
        `Admin vừa xóa danh mục #${cid}${category?.name ? `: ${category.name}` : ""}.`,
      );
      revalidatePath("/admin/categories");
      revalidatePath(`/admin/categories/${cid}`);
      redirect("/admin/categories?success=delete");
    }
    if (result.conflict?.error === "HAS_CHILD_CATEGORIES") {
      redirect(`/admin/categories/${cid}/delete?error=children`);
    }
    if (result.conflict?.error === "REQUIRES_CONFIRMATION") {
      result = await deleteCategoryRequest(cid, true, {
        accessToken: s.token,
        username: s.username,
        userId: uid,
      });
      if (result.ok) {
        await notifyCategoryAction(
          s.token,
          uid,
          s.username ?? "admin",
          "Xóa danh mục",
          `Admin vừa xóa danh mục #${cid}${category?.name ? `: ${category.name}` : ""}.`,
        );
        revalidatePath("/admin/categories");
        revalidatePath(`/admin/categories/${cid}`);
        redirect("/admin/categories?success=delete");
      }
      if (result.conflict?.error === "HAS_CHILD_CATEGORIES") {
        redirect(`/admin/categories/${cid}/delete?error=children`);
      }
    }
    redirect(`/admin/categories/${cid}/delete?error=api`);
  }

  const confirmFieldValue =
    previewMissing ? "false" : confirmDeleteWithProducts ? "true" : "false";

  const cancelHref = `/admin/categories/${id}`;

  return (
    <div className="relative min-h-[70vh] animate-in fade-in duration-300">
      {/* Toast Error Messages instead of static red boxes inside the modal */}
      {flowError === "children" && (
        <StatusToast tone="error" title="Không thể xóa" message="Còn danh mục con — không xóa được. Vui lòng xử lý danh mục con trước." />
      )}
      {flowError === "api" && (
        <StatusToast tone="error" title="Xóa thất bại" message="Xóa thất bại. Kiểm tra kết nối gateway và thử lại." />
      )}

      <section className="grid gap-6 opacity-20 lg:grid-cols-3 pointer-events-none select-none">
        {[category, category, category].map((c, index) => (
          <div
            key={`${c.id}-${index}`}
            className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              <span className="material-symbols-outlined text-3xl">category</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{c.name}</h3>
              <p className="text-sm text-slate-500">{c.slug ? `Slug: ${c.slug}` : "Chưa có slug"}</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">#{c.id}</div>
          </div>
        ))}
      </section>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-200">
          
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-rose-600" />
          
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 ring-8 ring-red-50/50 dark:ring-red-950/10">
              <span className="material-symbols-outlined text-3xl material-filled">warning</span>
            </div>
            <h2 className="mb-2 font-headline text-2xl font-black text-slate-900 dark:text-white">Xác nhận xóa danh mục</h2>
            <p className="mb-6 text-xs sm:text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn xóa danh mục này?
              <br />
              <span className="font-bold text-red-600 dark:text-red-400">Hành động này sẽ ẩn danh mục khỏi cửa hàng (có thể khôi phục lại sau).</span>
            </p>

            {previewMissing ? (
              <p className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400 text-left">
                Không tải được bản xem trước xóa. Bạn vẫn có thể thử xóa — nếu còn sản phẩm liên kết, hệ thống sẽ tự động chuyển sang chế độ ẩn danh mục.
              </p>
            ) : hasChildren ? (
              <p className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 text-xs text-rose-800 dark:text-rose-400 text-left">
                Không thể xóa: Còn <strong>{childCount}</strong> danh mục con đang trực thuộc. Vui lòng xóa hoặc thay đổi danh mục cha của các danh mục con trước.
              </p>
            ) : productCount > 0 ? (
              <p className="mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-400 text-left">
                Danh mục này đang chứa <strong>{productCount}</strong> sản phẩm. Khi xóa, các sản phẩm này sẽ được giữ nguyên thông tin kho nhưng sẽ bị ẩn danh mục phân loại.
              </p>
            ) : (
              <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">Danh mục này hiện đang trống, sẵn sàng để xóa an toàn.</p>
            )}

            <div className="mb-8 flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 p-4 text-left shadow-inner">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm">
                <span className="material-symbols-outlined text-2xl">category</span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-bold leading-tight text-slate-800 dark:text-white truncate">{category.name}</h4>
                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 truncate">
                  ID #{category.id} {category.slug ? ` · ${category.slug}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors"
                href={cancelHref}
              >
                Hủy bỏ
              </Link>
              {hasChildren ? (
                <Link
                  href="/admin/categories"
                  className="flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 px-4 py-3.5 text-sm font-bold text-blue-600 dark:text-blue-400 transition-colors"
                >
                  Về danh sách
                </Link>
              ) : (
                <form action={deleteAction}>
                  <input type="hidden" name="_categoryId" value={String(numId)} />
                  <input type="hidden" name="confirmWithProducts" value={confirmFieldValue} />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-red-650 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 dark:shadow-red-500/20 transition-all hover:scale-[1.02]"
                  >
                    Xóa ngay
                  </button>
                </form>
              )}
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

async function notifyCategoryAction(
  accessToken: string | null | undefined,
  userId: string | null,
  username: string,
  title: string,
  message: string,
) {
  try {
    if (!accessToken) return;
    const uid = Number(userId);
    const actor = Number.isFinite(uid) && uid > 0 ? await getAdminUserBrief(uid, { accessToken }) : null;
    const recipient = String(actor?.email ?? `${username}@gmail.com`).trim();
    if (!recipient) return;
    await sendNotification({
      channel: "WEB",
      recipient,
      subject: `[Danh mục] ${title}`,
      body: message,
      html: false,
    });
  } catch {
    // best-effort
  }
}
