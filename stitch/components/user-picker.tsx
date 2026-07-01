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
    <section className="rounded-3xl border border-outline-variant/10 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700/70">Recipients</p>
          <h3 className="mt-1 text-lg font-black text-blue-950">Chọn user nhận thông báo</h3>
          <p className="mt-1 text-sm text-slate-500">Tìm kiếm nhanh theo tên, email hoặc ID.</p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">{selectedUsers.length} đã chọn</span>
      </div>

      <div className="mt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm user..."
          className="w-full rounded-2xl border border-outline-variant/20 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-outline-variant/10 bg-slate-50 p-2">
        {filtered.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-slate-500">Không tìm thấy user phù hợp.</p>
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
                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    checked
                      ? "border-blue-300 bg-blue-50 text-blue-950 shadow-sm"
                      : "border-transparent bg-white text-slate-700 hover:border-outline-variant/20 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{u.userName ?? `User #${u.id}`}</p>
                    <p className="truncate text-xs text-slate-500">{u.email ?? "Chưa có email"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">#{u.id}</span>
                    <span className={checked ? "material-symbols-outlined text-blue-700" : "material-symbols-outlined text-slate-300"}>
                      {checked ? "check_circle" : "radio_button_unchecked"}
                    </span>
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
