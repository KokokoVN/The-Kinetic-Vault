"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatWebActivityTime } from "@/lib/api";
import { markNotificationRead, type NotificationMessage } from "@/lib/notification-api";

export type WebNotification = NotificationMessage;

function statusPill(status?: string | null) {
  const s = String(status ?? "").toUpperCase();
  if (s === "READ") {
    return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase text-emerald-700 shadow-sm backdrop-blur-md">Đã đọc</span>;
  }
  if (s === "UNREAD" || !s) {
    return <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase text-amber-700 shadow-sm backdrop-blur-md animate-pulse">Chưa đọc</span>;
  }
  return <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase text-slate-600 shadow-sm backdrop-blur-md">{s}</span>;
}

function channelBadge(channel?: string | null) {
  const c = String(channel ?? "").toUpperCase();
  if (c === "EMAIL") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-cyan-200 px-2.5 py-1 text-[10px] font-black tracking-[0.1em] text-cyan-700">
        <span className="material-symbols-outlined text-[14px]">mail</span>
        EMAIL
      </span>
    );
  }
  if (c === "WEB") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-fuchsia-200 px-2.5 py-1 text-[10px] font-black tracking-[0.1em] text-fuchsia-700">
        <span className="material-symbols-outlined text-[14px]">public</span>
        WEB
      </span>
    );
  }
  if (c === "BOTH") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-teal-200 px-2.5 py-1 text-[10px] font-black tracking-[0.1em] text-teal-700">
        <span className="material-symbols-outlined text-[14px]">hub</span>
        BOTH
      </span>
    );
  }
  return <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">{c || "—"}</span>;
}

function InboxItem({ n, router }: { n: WebNotification; router: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:bg-white hover:shadow-lg">
      <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-400 via-cyan-400 to-teal-400 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="p-6 pl-8 sm:p-7 sm:pl-9">
        <div 
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="truncate font-headline text-xl font-black text-slate-800 group-hover:text-cyan-700 transition-colors">{n.subject ?? "(Không có tiêu đề)"}</h3>
              <div className="flex items-center gap-2">
                {statusPill(n.status)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {channelBadge(n.channel)}
              <span className="flex items-center gap-1.5 font-bold text-slate-500">
                <span className="material-symbols-outlined text-[16px] text-slate-400">person</span>
                {n.recipient ?? "—"}
              </span>
              <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-auto">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {formatWebActivityTime(n.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 transition-transform duration-300 group-hover:bg-cyan-50" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-600 transition-colors">expand_more</span>
          </div>
        </div>

        <div className={`grid transition-all duration-300 ease-in-out ${expanded ? "grid-rows-[1fr] opacity-100 mt-6" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="relative rounded-2xl bg-slate-50/50 p-5 border border-slate-100">
              <div className="absolute -left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-400 to-cyan-400" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 font-medium pl-2">{n.body ?? ""}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-slate-100 pt-5">
              {String(n.status ?? "").toUpperCase() !== "READ" && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:scale-105 hover:shadow-cyan-500/40"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await markNotificationRead(n.id);
                    router.refresh();
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function NotificationInbox({ items }: { items: WebNotification[] }) {
  const router = useRouter();
  if (!items.length) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-16 text-center backdrop-blur-md">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 shadow-inner">
          <span className="material-symbols-outlined text-5xl text-blue-300">drafts</span>
        </div>
        <p className="mt-6 font-headline text-xl font-bold text-slate-800">Chưa có thông báo nào</p>
        <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-slate-500">Các email gửi từ admin hoặc thông báo hệ thống sẽ xuất hiện ở đây.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {items.map((n) => (
        <InboxItem key={n.id} n={n} router={router} />
      ))}
    </div>
  );
}
