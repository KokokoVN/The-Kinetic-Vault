import Link from "next/link";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { createCategory, getAdminUserBrief } from "@/lib/api";
import { getAdminSession } from "@/lib/auth-server";
import { CategoryNameAutoCheckField } from "@/components/category-name-auto-check-field";
import { sendNotification } from "@/lib/notification-api";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</label>
        {hint ? <p className="text-xs text-slate-500/80 dark:text-slate-400/80">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const duplicateError = sp?.error === "duplicate";
  const createError = sp?.error === "create";

  async function createAction(formData: FormData) {
    "use server";
    const session = await getAdminSession();
    const userId = getUserIdFromAccessToken(session.token);
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim() || undefined;
    try {
      const created = await createCategory(
        {
          name,
          slug,
        },
        { accessToken: session.token, username: session.username, userId },
      );
      await notifyCategoryAction(
        session.token,
        userId,
        session.username ?? "admin",
        "Tạo danh mục",
        `Admin vừa tạo danh mục: ${created?.name ?? name}${created?.slug ? ` (slug: ${created.slug})` : ""}.`,
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
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/categories"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 shadow-sm border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl transition-transform hover:scale-105 hover:bg-white dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            Thêm danh mục mới
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tạo nhóm sản phẩm với giao diện gọn, rõ trạng thái và hỗ trợ kiểm tra trùng tên ngay trong lúc nhập.
          </p>
        </div>
      </div>



      {/* Form Card */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500" />
        <form action={createAction} className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">Thông tin cơ bản</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Nhập tên danh mục, hệ thống sẽ tự động kiểm tra trùng lặp.</p>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md px-6 py-6 transition-colors hover:bg-white/80 dark:hover:bg-slate-800 shadow-sm">
                  <CategoryNameAutoCheckField />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold text-slate-800 dark:text-slate-200">Cấu hình URL</h3>
                <FieldShell label="Đường dẫn (Slug)" hint="Để trống để hệ thống tự tạo từ tên danh mục.">
                  <input
                    name="slug"
                    placeholder="vd: do-dung-bep"
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-4 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 backdrop-blur-md"
                  />
                </FieldShell>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mẹo thiết lập</p>
                <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span> Tên rõ ràng, dễ hiểu.</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span> Slug tự động chuẩn SEO.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-slate-200/60 dark:border-slate-800/60 pt-6">
            <Link
              href="/admin/categories"
              className="rounded-xl px-6 py-3 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-800/80 backdrop-blur-sm"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:scale-110">add_circle</span>
              Tạo danh mục
            </button>
          </div>
        </form>
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
    // Notification is best-effort and should not block category flow.
  }
}
