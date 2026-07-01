"use client";

import { useMemo, useState } from "react";
import { UserPicker } from "@/components/user-picker";

export type NotificationComposeAction = (formData: FormData) => void | Promise<void>;

export type NotificationUserOption = {
  id: number;
  userName?: string | null;
  email?: string | null;
};

export function NotificationComposeForm({
  action,
  defaultRecipient,
  users,
}: {
  action: NotificationComposeAction;
  defaultRecipient?: string;
  users: NotificationUserOption[];
}) {
  const [html, setHtml] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>(users.slice(0, 1).map((u) => u.id));

  const selectedUsers = useMemo(() => users.filter((u) => selectedIds.includes(u.id)), [users, selectedIds]);
  const recipient = selectedUsers.map((u) => u.email?.trim()).filter(Boolean).join(", ") || defaultRecipient || "";

  return (
    <form action={action} className="space-y-7 rounded-[2.5rem] border border-white bg-white/70 p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] backdrop-blur-2xl sm:p-9">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-[30px]" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-[20px]" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="inline-block rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">Compose</p>
            <h3 className="mt-3 text-2xl font-black tracking-tight">Tạo thông báo mới</h3>
            <p className="mt-1 text-sm font-medium text-white/80">Hệ thống sẽ gửi email và lưu thông báo web tùy vào kênh bạn chọn.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <span className="material-symbols-outlined text-3xl text-white">edit_square</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <UserPicker users={users} value={selectedIds} onChange={setSelectedIds} />
        </div>

        <div className="group relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
          <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-blue-600" htmlFor="recipient">
            Người nhận <span className="text-rose-500">*</span>
          </label>
          <input
            id="recipient"
            name="recipient"
            type="text"
            required
            readOnly
            value={recipient}
            placeholder="user@example.com"
            className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-700 outline-none"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-blue-600" htmlFor="channel">
              Kênh gửi <span className="text-rose-500">*</span>
            </label>
            <select id="channel" name="channel" defaultValue="BOTH" className="w-full appearance-none bg-transparent px-3 py-3 text-sm font-medium text-slate-700 outline-none">
              <option value="EMAIL">Chỉ gửi Email</option>
              <option value="WEB">Chỉ lưu Web</option>
              <option value="BOTH">Cả Email & Web</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-slate-400">expand_more</span>
            </div>
          </div>
          <div className="group relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
            <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-blue-600" htmlFor="subject">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="Nhập tiêu đề thông báo"
              className="w-full bg-transparent px-3 py-3 text-sm font-medium text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="group relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
          <label className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold uppercase tracking-wider text-slate-500 group-focus-within:text-blue-600" htmlFor="body">
            Nội dung <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="body"
            name="body"
            rows={7}
            required
            placeholder="Nhập nội dung chi tiết..."
            className="w-full resize-none bg-transparent px-3 py-3 text-sm font-medium text-slate-700 outline-none"
          />
        </div>

        <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50">
          <div className="relative flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white transition-colors group-hover:border-blue-500">
            <input type="checkbox" checked={html} onChange={(e) => setHtml(e.target.checked)} name="html" value="true" className="peer h-full w-full cursor-pointer appearance-none outline-none" />
            <span className="material-symbols-outlined absolute pointer-events-none text-[16px] text-white peer-checked:text-blue-600">check</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700">Định dạng HTML</span>
            <span className="text-xs text-slate-500">Gửi nội dung dưới dạng mã HTML (chủ yếu dùng cho Email)</span>
          </div>
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
          Gửi thông báo
          <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">send</span>
        </button>
      </div>
    </form>
  );
}
