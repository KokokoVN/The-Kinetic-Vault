"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SpecLike = {
  specKey: string;
};

type SpecFormLiveCheckProps = {
  action: (formData: FormData) => void | Promise<void>;
  fieldClass: string;
  existingSpecs: SpecLike[];
  existingGroups?: string[];
};

function normalize(v: string): string {
  return v.trim().toLowerCase();
}

export function SpecFormLiveCheck({ action, fieldClass, existingSpecs, existingGroups = [] }: SpecFormLiveCheckProps) {
  const [specKey, setSpecKey] = useState("");
  const [specGroup, setSpecGroup] = useState(existingGroups.length > 0 ? existingGroups[0] : "");
  const [isNewGroup, setIsNewGroup] = useState(existingGroups.length === 0);
  const [formSeed, setFormSeed] = useState(0);

  useEffect(() => {
    // Khi danh sách thông số thay đổi (thường là thêm thành công), reset form thêm mới.
    setSpecKey("");
    setFormSeed((v) => v + 1);
  }, [existingSpecs]);

  const duplicate = useMemo(() => {
    const nk = normalize(specKey);
    if (!nk) return false;
    return existingSpecs.some((s) => normalize(s.specKey) === nk);
  }, [specKey, existingSpecs]);

  const inputClass = `${fieldClass} ${duplicate ? "border-rose-400 bg-rose-50/40 focus:border-rose-500 focus:ring-rose-200" : ""}`;

  return (
    <form
      key={`spec-form-${formSeed}`}
      action={async (formData: FormData) => {
        try {
          await action(formData);
          toast.success("Thêm thông số thành công", { description: "Thông số kỹ thuật đã được lưu." });
        } catch {
          toast.error("Thêm thông số thất bại", { description: "Không thể thêm thông số. Vui lòng thử lại." });
        }
      }}
      className="mt-4 w-full min-w-0 space-y-4"
    >
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/60 p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500" htmlFor="specKey">
            <span className="material-symbols-outlined text-[16px] text-indigo-500">key</span>
            Khóa (Tên thông số) <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            id="specKey"
            name="specKey"
            required
            maxLength={120}
            className={`w-full rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm font-medium outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15 ${duplicate ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-200" : ""}`}
            placeholder="Ví dụ: Kích thước"
            value={specKey}
            onChange={(e) => setSpecKey(e.target.value)}
            aria-invalid={duplicate}
            aria-describedby={duplicate ? "specKey-error" : undefined}
          />
          <p id="specKey-error" className={`mt-1.5 text-[11px] font-semibold ${duplicate ? "text-rose-600" : "text-slate-400"}`}>
            {duplicate ? "Khóa này đã tồn tại." : "Tên không phân biệt chữ hoa/thường."}
          </p>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500" htmlFor="specValue">
            <span className="material-symbols-outlined text-[16px] text-indigo-500">notes</span>
            Giá trị chi tiết <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <textarea id="specValue" name="specValue" required maxLength={1000} rows={1} className="w-full rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/15" placeholder="Ví dụ: 15x20x10 cm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-12">
          <div className="space-y-2 sm:col-span-6">
            <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500" htmlFor="specGroup">
              <span className="flex items-center gap-1 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-sky-500 shrink-0">category</span>
                <span className="truncate">Nhóm thông số (Tuỳ chọn)</span>
              </span>
              {existingGroups.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewGroup(!isNewGroup);
                    setSpecGroup("");
                  }}
                  className="shrink-0 ml-2 text-[10px] text-sky-600 hover:text-sky-800 transition-colors bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold whitespace-nowrap"
                >
                  {isNewGroup ? "CÓ SẴN" : "+ MỚI"}
                </button>
              )}
            </label>
            {existingGroups.length > 0 && !isNewGroup ? (
              <select
                id="specGroup"
                name="specGroup"
                value={specGroup}
                onChange={(e) => setSpecGroup(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/15"
              >
                <option value="" disabled>-- Chọn nhóm --</option>
                {existingGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            ) : (
              <input
                id="specGroup"
                name="specGroup"
                maxLength={120}
                value={specGroup}
                onChange={(e) => setSpecGroup(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm outline-none transition-all focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-500/15"
                placeholder="Ví dụ: Màn hình, Pin..."
              />
            )}
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500" htmlFor="unit">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">straighten</span>
              Đơn vị đo lường
            </label>
            <input id="unit" name="unit" maxLength={64} className="w-full rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15" placeholder="Ví dụ: g, mm, inch" />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500" htmlFor="sortOrder">
              <span className="material-symbols-outlined text-[16px] text-violet-500">sort</span>
              Vị trí sắp xếp
            </label>
            <input id="sortOrder" name="sortOrder" type="number" min={0} step={1} className="w-full rounded-2xl border border-slate-200 bg-white/60 px-5 py-3 text-sm outline-none transition-all focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/15" placeholder="0" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={duplicate}
          className="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full" />
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Lưu thông số
        </button>
      </div>
    </form>
  );
}
