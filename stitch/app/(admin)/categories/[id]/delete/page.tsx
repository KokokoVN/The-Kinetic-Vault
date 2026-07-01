import Link from "next/link";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { deleteCategoryRequest, getAdminCategory, getCategoryDeletePreview } from "@/lib/api";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminUserBrief } from "@/lib/api";
import { sendNotification } from "@/lib/notification-api";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  /** Gửi confirm=true khi còn SP (cùng logic delete-preview). */
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

  /** Khi không có preview, gửi confirm=false rồi để server action xử lý REQUIRES_CONFIRMATION. */
  const confirmFieldValue =
    previewMissing ? "false" : confirmDeleteWithProducts ? "true" : "false";

  const cancelHref = `/admin/categories/${id}`;

  return (
    <div className="relative min-h-[70vh]">
      <section className="grid gap-6 opacity-40 lg:grid-cols-3">
        {[category, category, category].map((c, index) => (
          <div
            key={`${c.id}-${index}`}
            className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm"
          >
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-surface-container text-primary">
              <span className="material-symbols-outlined text-3xl">category</span>
            </div>
            <div className="flex-1">
              <h3 className={`font-bold ${index === 1 ? "text-error" : "text-blue-900"}`}>{c.name}</h3>
              <p className="text-sm text-on-surface-variant">{c.slug ? `Slug: ${c.slug}` : "Chưa có slug"}</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-500">#{c.id}</div>
          </div>
        ))}
      </section>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-900/80 p-6 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-[1.25rem] border border-white/20 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-md">
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <span className="material-symbols-outlined material-filled text-4xl text-red-600 dark:text-red-400">warning</span>
            </div>
            <h2 className="mb-2 font-headline text-2xl font-bold text-blue-900 dark:text-white">Xác nhận xóa danh mục</h2>
            <p className="mb-6 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              Bạn có chắc muốn xóa danh mục này?
              <br />
              <span className="font-bold text-red-600 dark:text-red-400">Danh mục sẽ được xóa mềm (có thể khôi phục từ nhật ký).</span>
            </p>

            {flowError === "children" && (
              <p className="mb-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-sm text-rose-900 dark:text-rose-400">
                Còn danh mục con — không xóa được. Xử lý danh mục con trước.
              </p>
            )}
            {flowError === "api" && (
              <p className="mb-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 text-sm text-rose-900 dark:text-rose-400">
                Xóa thất bại. Kiểm tra gateway, catalog và thử lại.
              </p>
            )}

            {previewMissing ? (
              <p className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-400">
                Không tải được bản xem trước xóa (gateway hoặc phiên đăng nhập). Bạn vẫn có thể thử xóa — nếu còn sản phẩm,
                backend sẽ yêu cầu xác nhận lần hai.
              </p>
            ) : hasChildren ? (
              <p className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-400">
                Không thể xóa: còn <strong>{childCount}</strong> danh mục con. Hãy xóa hoặc gỡ danh mục con trước.
              </p>
            ) : productCount > 0 ? (
              <p className="mb-6 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-400">
                Danh mục này hiện có <strong>{productCount}</strong> sản phẩm liên quan. Khi xóa, hệ thống sẽ tự động{" "}
                <strong>ẩn danh mục</strong> và giữ nguyên thông tin tồn kho của các sản phẩm đó.
              </p>
            ) : (
              <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Không có sản phẩm đang gắn trực tiếp theo thống kê hiện tại.</p>
            )}

            <div className="mb-8 flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 text-left">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm">
                <span className="material-symbols-outlined text-3xl">category</span>
              </div>
              <div>
                <h4 className="text-base font-bold leading-tight text-blue-900 dark:text-white">{category.name}</h4>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  ID #{category.id}
                  {category.slug ? ` · ${category.slug}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                href={cancelHref}
              >
                Hủy
              </Link>
              {hasChildren ? (
                <Link
                  href="/admin/categories"
                  className="flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 px-6 py-4 font-bold text-blue-600 dark:text-blue-400 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Về danh sách
                </Link>
              ) : (
                <form action={deleteAction}>
                  <input type="hidden" name="_categoryId" value={String(numId)} />
                  <input type="hidden" name="confirmWithProducts" value={confirmFieldValue} />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-red-600 dark:bg-red-500 px-6 py-4 font-bold text-white shadow-lg shadow-red-600/20 dark:shadow-red-500/20 transition-all hover:saturate-150"
                  >
                    Xóa danh mục
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-8 py-3">
            <span className="material-symbols-outlined text-[12px] text-slate-400">lock</span>
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
