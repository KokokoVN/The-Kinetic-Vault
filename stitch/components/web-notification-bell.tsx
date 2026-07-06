"use client";

import { useEffect, useMemo, useState } from "react";

type NotificationRow = {
  id?: number;
  subject?: string | null;
  body?: string | null;
  createdAt?: string | null;
  channel?: string | null;
  source?: string | null;
};

export function WebNotificationBell(props: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]);

  useEffect(() => {
    if (!props.isLoggedIn) return;
    let alive = true;
    setLoading(true);
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data?.notifications) ? (data.notifications as NotificationRow[]) : [];
        setRows(list.slice(0, 12));
      })
      .catch(() => {
        if (!alive) return;
        setRows([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [props.isLoggedIn]);

  const count = rows.length;
  const unreadLabel = useMemo(() => (count > 9 ? "9+" : String(count)), [count]);

  if (!props.isLoggedIn) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-low dark:bg-slate-800 px-3 py-2 text-on-surface-variant transition hover:bg-surface-container dark:bg-slate-800"
        aria-label="Thông báo"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-[120] w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest dark:bg-slate-900 shadow-panel">
          <div className="border-b border-outline-variant/10 px-4 py-3">
            <p className="text-sm font-extrabold text-primary">Thông báo hệ thống</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-4 text-sm text-on-surface-variant">Đang tải thông báo...</p>
            ) : rows.length === 0 ? (
              <p className="px-4 py-4 text-sm text-on-surface-variant">Chưa có thông báo.</p>
            ) : (
              rows.map((row) => (
                <div key={String(row.id ?? Math.random())} className="border-b border-outline-variant/10 px-4 py-3 last:border-b-0">
                  <p className="text-sm font-bold text-on-surface">{String(row.subject ?? "Thông báo")}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{String(row.body ?? "")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
