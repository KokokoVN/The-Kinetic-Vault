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
    <form action={action} className="space-y-8 rounded-[2.5rem] border border-white bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-9 relative overflow-hidden group">
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-400/10 blur-[80px] pointer-events-none group-hover:bg-blue-400/20 transition-colors duration-700" />
      <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none group-hover:bg-cyan-400/20 transition-colors duration-700" />
      
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 p-8 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30 blur-[30px]" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-[20px]" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Compose
            </p>
            <h3 className="mt-4 font-headline text-3xl font-black tracking-tight text-white drop-shadow-sm">Tạo thông báo mới</h3>
            <p className="mt-2 text-sm font-medium text-white/90 max-w-md leading-relaxed drop-shadow-sm">Hệ thống sẽ gửi email và lưu thông báo web tùy vào kênh bạn chọn.</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <span className="material-symbols-outlined text-3xl text-white">edit_square</span>
          </div>
        </div>
      </div>

      <div className="space-y-7 relative z-10">
        <div className="rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
          <UserPicker users={users} value={selectedIds} onChange={setSelectedIds} />
        </div>

        <div className="group/field relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/10 hover:border-slate-300">
          <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within/field:text-cyan-600" htmlFor="recipient">
            Người nhận <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center px-2">
            <span className="material-symbols-outlined text-slate-400 mr-2 group-focus-within/field:text-cyan-500">group</span>
            <input
              id="recipient"
              name="recipient"
              type="text"
              required
              readOnly
              value={recipient}
              placeholder="user@example.com"
              className="w-full bg-transparent py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <div className="group/field relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/10 hover:border-slate-300">
            <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within/field:text-blue-600" htmlFor="channel">
              Kênh gửi <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center px-2">
              <span className="material-symbols-outlined text-slate-400 mr-2 group-focus-within/field:text-blue-500">send</span>
              <select id="channel" name="channel" defaultValue="BOTH" className="w-full appearance-none bg-transparent py-3 text-sm font-bold text-slate-800 outline-none cursor-pointer">
                <option value="EMAIL">Chỉ gửi Email</option>
                <option value="WEB">Chỉ lưu Web</option>
                <option value="BOTH">Cả Email & Web</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </div>
            </div>
          </div>
          
          <div className="group/field relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-fuchsia-400 focus-within:ring-4 focus-within:ring-fuchsia-500/10 hover:border-slate-300">
            <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within/field:text-fuchsia-600" htmlFor="subject">
              Tiêu đề <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center px-2">
              <span className="material-symbols-outlined text-slate-400 mr-2 group-focus-within/field:text-fuchsia-500">title</span>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                placeholder="Nhập tiêu đề thông báo"
                className="w-full bg-transparent py-3 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="group/field relative rounded-2xl border border-slate-200 bg-white p-2 transition-all focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-500/10 hover:border-slate-300">
          <label className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors group-focus-within/field:text-teal-600" htmlFor="body">
            Nội dung <span className="text-rose-500">*</span>
          </label>
          <div className="flex px-2 pt-2">
            <span className="material-symbols-outlined text-slate-400 mr-2 mt-2 group-focus-within/field:text-teal-500">notes</span>
            <textarea
              id="body"
              name="body"
              rows={7}
              required
              placeholder="Nhập nội dung chi tiết..."
              className="w-full resize-none bg-transparent py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 custom-scrollbar"
            />
          </div>
        </div>

        <label className="group/checkbox flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:bg-slate-50 hover:border-slate-300">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-lg border border-slate-300 bg-slate-50 transition-all group-hover/checkbox:border-cyan-400">
            <input type="checkbox" checked={html} onChange={(e) => setHtml(e.target.checked)} name="html" value="true" className="peer h-full w-full cursor-pointer appearance-none outline-none" />
            <span className="material-symbols-outlined absolute pointer-events-none text-[18px] text-cyan-500 opacity-0 transition-opacity peer-checked:opacity-100">check</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">Định dạng HTML</span>
            <span className="text-xs font-medium text-slate-500">Gửi nội dung dưới dạng mã HTML (chủ yếu dùng cho Email)</span>
          </div>
        </label>
      </div>

      <div className="flex justify-end pt-4 relative z-10">
        <button type="submit" className="group/btn flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:shadow-cyan-500/40">
          Gửi thông báo
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1">send</span>
        </button>
      </div>
    </form>
  );
}
