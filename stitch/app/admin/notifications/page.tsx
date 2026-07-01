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
    <div className="space-y-8 pb-10">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white/70 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] ring-1 ring-black/5 backdrop-blur-2xl md:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-purple-50/50" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-[80px]" />
        <div className="absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-cyan-400/20 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-sm text-blue-600">notifications_active</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Trung tâm thông báo</span>
            </div>
            <h1 className="mt-5 font-headline text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Notification Center</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-500">
              Quản lý toàn diện các kênh thông báo. Gửi email trực tiếp, lưu trữ thông báo nội bộ và theo dõi trạng thái tương tác từ khách hàng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="group flex flex-col items-center justify-center rounded-3xl border border-white bg-white/60 p-5 shadow-sm transition hover:scale-[1.02] hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <span className="material-symbols-outlined text-xl">mark_email_unread</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Chưa đọc</p>
                  <p className="font-headline text-2xl font-black text-slate-900">{unreadCount}</p>
                </div>
              </div>
            </div>
            <div className="group flex flex-col items-center justify-center rounded-3xl border border-white bg-white/60 p-5 shadow-sm transition hover:scale-[1.02] hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <span className="material-symbols-outlined text-xl">notifications</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tổng thư</p>
                  <p className="font-headline text-2xl font-black text-slate-900">{items.length}</p>
                </div>
              </div>
            </div>
            <div className="group flex flex-col items-center justify-center rounded-3xl border border-white bg-white/60 p-5 shadow-sm transition hover:scale-[1.02] hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tài khoản</p>
                  <p className="max-w-[100px] truncate font-headline text-sm font-black text-slate-900" title={meEmail || "—"}>{meEmail || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALERTS */}
      <div className="px-2">
        {sp?.success === "send" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-emerald-900 shadow-sm backdrop-blur-sm">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <p className="text-sm font-medium">Đã gửi thông báo thành công tới các người dùng đã chọn.</p>
          </div>
        ) : null}
        {sp?.error === "validation" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-rose-900 shadow-sm backdrop-blur-sm">
            <span className="material-symbols-outlined text-rose-600">error</span>
            <p className="text-sm font-medium">Vui lòng nhập đầy đủ người nhận, tiêu đề và nội dung.</p>
          </div>
        ) : null}
        {sp?.error === "send" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-5 py-4 text-rose-900 shadow-sm backdrop-blur-sm">
            <span className="material-symbols-outlined text-rose-600">error</span>
            <p className="text-sm font-medium">Gửi thông báo thất bại. Vui lòng kiểm tra lại cấu hình Notification Service.</p>
          </div>
        ) : null}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <span className="material-symbols-outlined text-sm">edit_square</span>
              </span>
              <h2 className="text-lg font-black text-slate-800">Soạn thông báo</h2>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{users.length} người dùng hệ thống</span>
          </div>
          <NotificationComposeForm action={sendAction} defaultRecipient={meEmail} users={users} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                <span className="material-symbols-outlined text-sm">inbox</span>
              </span>
              <h2 className="text-lg font-black text-slate-800">Hộp thư hệ thống</h2>
            </div>
            <p className="text-xs font-medium text-slate-500">Cập nhật theo thời gian thực</p>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-white bg-white/40 shadow-xl shadow-blue-900/5 backdrop-blur-xl">
            <div className="max-h-[850px] overflow-y-auto p-3 sm:p-5">
              <NotificationInbox items={items} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
