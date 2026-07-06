"use client";

import { useMemo, useState } from "react";
import type { NotificationUserOption } from "@/components/notification-compose-form";

export function UserPicker({
  users,
  value,
  onChange,
}: {
  users: NotificationUserOption[];
  value: number[];
  onChange: (next: number[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = String(u.userName ?? "").toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      const id = String(u.id);
      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [users, query]);

  const selectedUsers = useMemo(() => users.filter((u) => value.includes(u.id)), [users, value]);

  function toggle(id: number) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-600">Recipients</p>
          <h3 className="mt-1 font-headline text-xl font-black text-slate-900">Chọn user nhận thông báo</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Tìm kiếm nhanh theo tên, email hoặc ID.</p>
        </div>
        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold text-cyan-700 shadow-sm backdrop-blur-sm">
          {selectedUsers.length} đã chọn
        </span>
      </div>

      <div className="mt-5">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-500">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm user..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 shadow-sm"
          />
        </div>
      </div>

      <div className="mt-4 max-h-[300px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-inner custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
            <p className="text-sm font-bold text-slate-500">Không tìm thấy user phù hợp.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {filtered.map((u) => {
              const checked = value.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggle(u.id)}
                  className={[
                    "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                    checked
                      ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-blue-50 shadow-sm"
                      : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p className={["truncate font-headline text-base font-bold transition-colors", checked ? "text-cyan-800" : "text-slate-800"].join(" ")}>
                      {u.userName ?? `User #${u.id}`}
                    </p>
                    <p className={["truncate text-xs font-medium transition-colors mt-0.5", checked ? "text-cyan-600/80" : "text-slate-500"].join(" ")}>
                      {u.email ?? "Chưa có email"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={["rounded-full px-3 py-1 text-[11px] font-black tracking-wider transition-colors", checked ? "bg-cyan-100 text-cyan-700" : "bg-slate-100 text-slate-500"].join(" ")}>
                      #{u.id}
                    </span>
                    <div className={["flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all", checked ? "border-cyan-500 bg-cyan-500 shadow-sm" : "border-slate-300 bg-white"].join(" ")}>
                      {checked && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
