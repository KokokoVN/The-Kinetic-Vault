import Link from "next/link";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { createCategory, getAdminUserBrief } from "@/lib/api";
import { getAdminSession } from "@/lib/auth-server";
import { sendNotification } from "@/lib/notification-api";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { StatusToast } from "@/components/status-toast";
import { NewCategoryForm } from "@/components/new-category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const duplicateError = sp?.error === "duplicate";
  const createError = sp?.error === "create";

  async function createAction(name: string, slug?: string) {
    "use server";
    const session = await getAdminSession();
    const userId = getUserIdFromAccessToken(session.token);
    const trimmedName = name.trim();
    const trimmedSlug = slug?.trim() || undefined;
    
    try {
      const created = await createCategory(
        {
          name: trimmedName,
          slug: trimmedSlug,
        },
        { accessToken: session.token, username: session.username, userId },
      );
      await notifyCategoryAction(
        session.token,
        userId,
        session.username ?? "admin",
        "Tạo danh mục",
        `Admin vừa tạo danh mục: ${created?.name ?? trimmedName}${created?.slug ? ` (slug: ${created.slug})` : ""}.`,
      );
      revalidatePath("/admin/categories");
      redirect("/admin/categories?success=create");
    } catch (e) {
      unstable_rethrow(e);
      if (e instanceof Error && e.message.startsWith("DUPLICATE_NAME")) {
        redirect("/admin/categories/new?error=duplicate");
      }
      redirect("/admin/categories/new?error=create");
    }
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Toast notifications */}
      {duplicateError && (
        <StatusToast tone="warning" title="Trùng tên danh mục" message="Đã có danh mục cùng tên. Vui lòng chọn tên khác." />
      )}
      {createError && (
        <StatusToast tone="error" title="Tạo thất bại" message="Có lỗi xảy ra trong quá trình tạo danh mục. Vui lòng thử lại sau." />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-550 dark:text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            Thêm danh mục mới
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tạo nhóm sản phẩm mới với cấu hình xem trước thẻ trực quan theo thời gian thực.
          </p>
        </div>
      </div>

      {/* Rebuilt Form Wrapper */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500" />
        <NewCategoryForm onCreate={createAction} />
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
