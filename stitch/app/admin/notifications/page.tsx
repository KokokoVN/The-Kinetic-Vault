import { getAdminSession } from "@/lib/auth-server";
import { getAdminUserBrief, listAdminUsers } from "@/lib/api";
import { listNotificationsByEmail, sendNotification } from "@/lib/notification-api";
import { NotificationInbox } from "@/components/notification-inbox";
import { NotificationComposeForm } from "@/components/notification-compose-form";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage({ searchParams }: { searchParams?: Promise<{ success?: string; error?: string }> }) {
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  const uid = getUserIdFromAccessToken(session.token);
  const user = uid ? await getAdminUserBrief(uid, { accessToken: session.token }) : null;
  const meEmail = user?.email?.trim() || (session.username ? `${session.username}@gmail.com` : "");
  const inboxEmail = meEmail;
  // Show all inbox rows for this email; previous ADMIN-only filter hid WEB messages.
  const items = inboxEmail ? await listNotificationsByEmail(inboxEmail) : [];
  const users = (await listAdminUsers({ accessToken: session.token }))
    .filter((u) => Boolean(u.email?.trim()))
    .map((u) => ({ id: Number(u.id ?? 0), userName: u.userName ?? null, email: u.email ?? null }))
    .filter((u) => Number.isFinite(u.id) && u.id > 0);

  async function sendAction(formData: FormData) {
    "use server";
    const recipientRaw = String(formData.get("recipient") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const channel = String(formData.get("channel") ?? "EMAIL").trim();
    const html = formData.get("html") != null;
    const recipient = recipientRaw;
    if (!recipient || !subject || !body) {
      redirect("/admin/notifications?error=validation");
    }
    const recipients = recipient
      .split(/[;,\n]/)
      .map((v) => v.trim())
      .filter(Boolean)
      .filter((v, idx, arr) => arr.indexOf(v) === idx);
    if (recipients.length === 0) {
      redirect("/admin/notifications?error=validation");
    }
    const results = await Promise.allSettled(
      recipients.map((to) => sendNotification({ channel, recipient: to, subject, body, html })),
    );
    const okCount = results.filter((r) => r.status === "fulfilled" && r.value != null).length;
    if (okCount === 0) {
      redirect("/admin/notifications?error=send");
    }
    redirect(`/admin/notifications?success=send&sent=${encodeURIComponent(String(okCount))}`);
  }

  const unreadCount = items.filter((i) => String(i.status ?? "").toUpperCase() !== "READ").length;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200/80 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-500/10 px-4 py-1.5 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-sm text-blue-600 dark:text-blue-400">notifications_active</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Trung tâm thông báo</span>
            </div>
            <h1 className="mt-4 font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">Notification Center</h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Quản lý toàn diện các kênh thông báo. Gửi email trực tiếp, lưu trữ thông báo nội bộ và theo dõi trạng thái tương tác từ khách hàng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
                <span className="material-symbols-outlined text-xl">mark_email_unread</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Chưa đọc</p>
                <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{unreadCount}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tổng thư</p>
                <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{items.length}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 shadow-sm backdrop-blur-xl transition-all hover:scale-105">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tài khoản</p>
                <p className="max-w-[120px] truncate font-headline text-sm font-black text-slate-900 dark:text-white" title={meEmail || "—"}>{meEmail || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      <div className="px-1">
        {sp?.success === "send" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10 px-5 py-4 text-emerald-900 dark:text-emerald-200 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check_circle</span>
            <p className="text-sm font-medium">Đã gửi thông báo thành công tới các người dùng đã chọn.</p>
          </div>
        ) : null}
        {sp?.error === "validation" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-500/10 px-5 py-4 text-rose-900 dark:text-rose-200 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">error</span>
            <p className="text-sm font-medium">Vui lòng nhập đầy đủ người nhận, tiêu đề và nội dung.</p>
          </div>
        ) : null}
        {sp?.error === "send" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-500/10 px-5 py-4 text-rose-900 dark:text-rose-200 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">error</span>
            <p className="text-sm font-medium">Gửi thông báo thất bại. Vui lòng kiểm tra lại cấu hình Notification Service.</p>
          </div>
        ) : null}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">edit_square</span>
              </span>
              <h2 className="font-headline text-2xl font-black text-slate-900 dark:text-white">Soạn thông báo</h2>
            </div>
            <span className="rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-4 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 shadow-sm backdrop-blur-sm">
              {users.length} người dùng hệ thống
            </span>
          </div>
          <NotificationComposeForm action={sendAction} defaultRecipient={meEmail} users={users} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-sm backdrop-blur-md">
                <span className="material-symbols-outlined">inbox</span>
              </span>
              <h2 className="font-headline text-2xl font-black text-slate-900 dark:text-white">Hộp thư hệ thống</h2>
            </div>
            <p className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm">
              Live updates
            </p>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-xl">
            <div className="max-h-[850px] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <NotificationInbox items={items} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
