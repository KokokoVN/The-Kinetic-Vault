"use client";

import Link from "next/link";
import { formatWebActivityTime } from "@/lib/api";
import { type NotificationMessage } from "@/lib/notification-api";

function statusPill(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s === "READ") return "rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800";
  return "rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800";
}

export function UserNotificationsPanel({ items }: { items: NotificationMessage[] }) {
  const unread = items.filter((i) => String(i.status ?? "").toUpperCase() !== "READ").length;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 py-24 text-center shadow-sm backdrop-blur-sm">
        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 shadow-inner">
          <span className="material-symbols-outlined text-5xl text-slate-300">notifications_active</span>
        </div>
        <h3 className="font-headline text-2xl font-black text-slate-800">Bạn chưa có thông báo nào</h3>
        <p className="mt-3 max-w-md text-base font-medium text-slate-500">
          Khi có thông báo về đơn hàng hoặc tin tức từ hệ thống, chúng sẽ xuất hiện tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200/60 bg-white/80 px-6 py-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {unread > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${unread > 0 ? "bg-cyan-500" : "bg-slate-300"}`}></span>
          </span>
          <p className="text-base font-bold text-slate-700">
            {unread > 0 ? (
              <span>Bạn có <span className="text-cyan-600">{unread}</span> thông báo mới</span>
            ) : (
              <span>Tất cả thông báo đã được xem</span>
            )}
          </p>
        </div>
        <Link href="/notifications" className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900">
          Làm mới
        </Link>
      </div>

      <div className="space-y-4">
        {items.map((n, idx) => {
          const read = String(n.status ?? "").toUpperCase() === "READ";
          return (
            <Link
              key={n.id}
              href={`/notifications/${encodeURIComponent(String(n.id))}`}
              className={`group flex w-full animate-in fade-in slide-in-from-bottom-4 flex-col overflow-hidden rounded-[2rem] border bg-white p-0 text-left shadow-sm transition-all duration-300 ease-out fill-mode-both hover:-translate-y-1 hover:shadow-xl ${read ? "border-slate-200/60" : "border-cyan-200 ring-2 ring-cyan-100/50"}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`h-1.5 w-full ${read ? "bg-slate-100" : "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"}`} />
              <div className="flex min-h-[7rem] items-center justify-between gap-4 p-6 sm:px-8">
                <div className="flex items-start gap-5">
                  <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${read ? "bg-slate-50 text-slate-400" : "bg-cyan-50 text-cyan-500 shadow-inner"}`}>
                    <span className="material-symbols-outlined text-[24px]">
                      {read ? "mark_email_read" : "mail"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <span className={statusPill(n.status)}>{read ? "ĐÃ ĐỌC" : "THÔNG BÁO MỚI"}</span>
                      <span className="text-sm font-semibold text-slate-400">
                        {formatWebActivityTime(n.createdAt)}
                      </span>
                    </div>
                    <h4 className={`text-xl font-black ${read ? "text-slate-700 group-hover:text-slate-900" : "text-slate-900"} transition-colors`}>
                      {n.subject ?? "(Không có tiêu đề)"}
                    </h4>
                  </div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-600">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
