"use client";

import { useRouter } from "next/navigation";
import { formatWebActivityTime } from "@/lib/api";
import { markNotificationRead, type NotificationMessage } from "@/lib/notification-api";

export type WebNotification = NotificationMessage;

function statusPill(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s === "READ") return "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-700 shadow-sm";
  if (s === "UNREAD" || !s) return "rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold tracking-widest text-amber-700 shadow-sm";
  return "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold tracking-widest text-slate-700 shadow-sm";
}

function channelBadge(channel?: string | null) {
  const c = String(channel ?? "").toUpperCase();
  if (c === "EMAIL") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
        <span className="material-symbols-outlined text-[14px]">mail</span>
        EMAIL
      </span>
    );
  }
  if (c === "WEB") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
        <span className="material-symbols-outlined text-[14px]">public</span>
        WEB
      </span>
    );
  }
  if (c === "BOTH") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
        <span className="material-symbols-outlined text-[14px]">hub</span>
        BOTH
      </span>
    );
  }
  return <span className="font-semibold text-slate-700">{c || "—"}</span>;
}

export function NotificationInbox({ items }: { items: WebNotification[] }) {
  const router = useRouter();
  if (!items.length) {
    return (
      <div className="grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center backdrop-blur-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
          <span className="material-symbols-outlined text-4xl text-slate-300">drafts</span>
        </div>
        <p className="mt-5 text-base font-bold text-slate-700">Chưa có thông báo nào</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">Các email gửi từ admin hoặc thông báo hệ thống sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((n) => (
        <article key={n.id} className="group relative overflow-hidden rounded-[2rem] border border-white bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-blue-500 via-cyan-400 to-emerald-400 opacity-70 transition-opacity group-hover:opacity-100" />
          <div className="p-6 pl-8 sm:p-7 sm:pl-9">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="truncate text-lg font-black text-slate-900 group-hover:text-blue-900 transition-colors">{n.subject ?? "(Không có tiêu đề)"}</h3>
                  <div className="flex items-center gap-2">
                    {statusPill(n.status)}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {channelBadge(n.channel)}
                  <span className="flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    {n.recipient ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative mt-5">
              <div className="absolute -left-3 top-0 h-full w-1 rounded-full bg-slate-100" />
              <p className="whitespace-pre-wrap pl-4 text-sm leading-relaxed text-slate-600">{n.body ?? ""}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {formatWebActivityTime(n.createdAt)}
              </div>
              {String(n.status ?? "").toUpperCase() !== "READ" ? (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
                  onClick={async () => {
                    await markNotificationRead(n.id);
                    router.refresh();
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  Đánh dấu đã đọc
                </button>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-400">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Đã đọc
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
