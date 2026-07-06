import Link from "next/link";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminCategory, getAdminUserBrief, updateCategory } from "@/lib/api";
import { sendNotification } from "@/lib/notification-api";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { CategoryDeleteButton } from "@/components/category-delete-button";
import { StatusToast } from "@/components/status-toast";
import { EditCategoryForm } from "@/components/edit-category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const updateFailed = sp?.error === "update";
  const duplicateError = sp?.error === "duplicate";
  const numId = Number(id);
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);

  if (!Number.isFinite(numId)) {
    return <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm">ID không hợp lệ.</div>;
  }

  const category = await getAdminCategory(numId, { accessToken: session.token });
  if (!category) {
    return (
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-805">
        Không tìm thấy danh mục `{id}`.
      </div>
    );
  }

  async function updateAction(name: string, slug?: string) {
    "use server";
    const s = await getAdminSession();
    const uid = getUserIdFromAccessToken(s.token);
    const trimmedName = name.trim();
    const trimmedSlug = slug?.trim() || undefined;
    
    try {
      const updated = await updateCategory(
        numId,
        {
          name: trimmedName,
          slug: trimmedSlug,
        },
        { accessToken: s.token, username: s.username, userId: uid },
      );
      await notifyCategoryAction(
        s.token,
        uid,
        s.username ?? "admin",
        "Cập nhật danh mục",
        `Admin vừa cập nhật danh mục #${numId}: ${updated?.name ?? trimmedName}${updated?.slug ? ` (slug: ${updated.slug})` : ""}.`,
      );
      revalidatePath("/admin/categories");
      revalidatePath(`/admin/categories/${id}`);
      redirect(`/admin/categories/${id}?success=update`);
    } catch (e) {
      unstable_rethrow(e);
      if (e instanceof Error && e.message.startsWith("DUPLICATE_NAME")) {
        redirect(`/admin/categories/${numId}/edit?error=duplicate`);
      }
      redirect(`/admin/categories/${numId}/edit?error=update`);
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Toast Error Handling */}
      {duplicateError && (
        <StatusToast tone="warning" title="Trùng tên danh mục" message="Đã có danh mục cùng tên (không phân biệt hoa thường)." />
      )}
      {updateFailed && (
        <StatusToast tone="error" title="Cập nhật thất bại" message="Có lỗi xảy ra trong quá trình cập nhật danh mục. Vui lòng thử lại sau." />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/categories/${id}`}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-550 dark:text-slate-400">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            Chỉnh sửa danh mục
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Cập nhật cấu hình của danh mục #{category.id} và xem trước kết quả trực tiếp.
          </p>
        </div>
        <div>
          <CategoryDeleteButton 
            categoryId={category.id} 
            categoryName={category.name} 
            className="group flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-250 dark:border-red-800 bg-red-50 dark:bg-red-500/10 px-5 text-xs sm:text-sm font-bold text-red-750 dark:text-red-400 shadow-sm transition-all hover:bg-red-600 dark:hover:bg-red-500 hover:text-white dark:hover:text-white" 
          />
        </div>
      </div>

      {/* Rebuilt Form Wrapper */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500" />
        <EditCategoryForm category={category} onUpdate={updateAction} />
      </section>
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
