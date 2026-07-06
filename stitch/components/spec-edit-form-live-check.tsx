"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

function normalize(v: string): string {
  return v.trim().toLowerCase();
}

export type SpecEditFormLiveCheckProps = {
  action: (formData: FormData) => void | Promise<void>;
  specId: number;
  defaultSpecKey: string;
  defaultSpecValue: string;
  defaultUnit: string;
  defaultSortOrder: number;
  defaultSpecGroup: string;
  otherSpecKeys: string[];
  inputClassName: string;
  existingGroups?: string[];
};

export function SpecEditFormLiveCheck({
  action,
  specId,
  defaultSpecKey,
  defaultSpecValue,
  defaultUnit,
  defaultSortOrder,
  defaultSpecGroup,
  otherSpecKeys,
  existingGroups = [],
}: SpecEditFormLiveCheckProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [specKey, setSpecKey] = useState(defaultSpecKey);
  const [specGroup, setSpecGroup] = useState(defaultSpecGroup || (existingGroups.length > 0 ? existingGroups[0] : ""));
  const [isNewGroup, setIsNewGroup] = useState(
    existingGroups.length === 0 || (defaultSpecGroup !== "" && !existingGroups.includes(defaultSpecGroup))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const duplicate = useMemo(() => {
    const nk = normalize(specKey);
    if (!nk) return false;
    return otherSpecKeys.some((k) => normalize(k) === nk);
  }, [specKey, otherSpecKeys]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-100 hover:border-indigo-300"
      >
        <span className="material-symbols-outlined text-[16px]">edit</span> Chỉnh sửa
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-headline text-lg font-black text-indigo-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-indigo-500">edit_square</span>
                Chỉnh sửa thông số
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <form
              action={async (formData: FormData) => {
                try {
                  await action(formData);
                  toast.success("Cập nhật thông số thành công", { description: "Thông số kỹ thuật đã được lưu." });
                  setIsOpen(false);
                } catch {
                  toast.error("Cập nhật thông số thất bại", { description: "Không thể cập nhật thông số. Vui lòng thử lại." });
                }
              }}
              className="p-6 sm:p-8"
            >
              <input type="hidden" name="specId" value={String(specId)} />

              <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50 p-6 shadow-inner">
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-[16px] text-indigo-500">key</span>
                    Khóa (Tên thông số) <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    name="specKey"
                    required
                    maxLength={120}
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className={`w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-medium outline-none transition-all focus:border-indigo-400 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 ${duplicate ? "border-rose-400 bg-rose-50/50 ring-1 ring-rose-200 focus:border-rose-500" : ""}`}
                    aria-invalid={duplicate}
                  />
                  <p className={`mt-1.5 text-[11px] font-semibold ${duplicate ? "text-rose-600" : "text-slate-400"}`}>
                    {duplicate ? "Khóa này đã tồn tại." : "Tên không phân biệt chữ hoa/thường."}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="material-symbols-outlined text-[16px] text-indigo-500">notes</span>
                    Giá trị chi tiết <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <textarea name="specValue" required rows={2} maxLength={1000} defaultValue={defaultSpecValue} className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-5 py-3 text-sm outline-none transition-all focus:border-indigo-400 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15" />
                </div>
                <div className="grid gap-4 sm:grid-cols-12">
                  <div className="space-y-2 sm:col-span-6">
                    <label className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-1 min-w-0">
                        <span className="material-symbols-outlined text-[16px] text-sky-500 shrink-0">category</span>
                        <span className="truncate">Nhóm thông số (Tuỳ chọn)</span>
                      </span>
                      {existingGroups.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewGroup(!isNewGroup);
                            if (!isNewGroup) setSpecGroup("");
                            else setSpecGroup(existingGroups[0]);
                          }}
                          className="shrink-0 ml-2 text-[10px] text-sky-600 hover:text-sky-800 transition-colors bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold whitespace-nowrap"
                        >
                          {isNewGroup ? "CÓ SẴN" : "+ MỚI"}
                        </button>
                      )}
                    </label>
                    {existingGroups.length > 0 && !isNewGroup ? (
                      <select
                        name="specGroup"
                        value={specGroup}
                        onChange={(e) => setSpecGroup(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-5 py-3 text-sm outline-none transition-all focus:border-sky-400 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-sky-500/15"
                      >
                        <option value="" disabled>-- Chọn nhóm --</option>
                        {existingGroups.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name="specGroup"
                        maxLength={120}
                        value={specGroup}
                        onChange={(e) => setSpecGroup(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-5 py-3 text-sm outline-none transition-all focus:border-sky-400 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-sky-500/15"
                        placeholder="Ví dụ: Màn hình, Pin..."
                      />
                    )}
                  </div>
                  <div className="space-y-2 sm:col-span-3">
                    <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span className="material-symbols-outlined text-[16px] text-emerald-500">straighten</span>
                      Đơn vị đo lường
                    </label>
                    <input name="unit" maxLength={64} defaultValue={defaultUnit} className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-5 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-emerald-500/15" />
                  </div>
                  <div className="space-y-2 sm:col-span-3">
                    <label className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500">
                      <span className="material-symbols-outlined text-[16px] text-violet-500">sort</span>
                      Vị trí sắp xếp
                    </label>
                    <input name="sortOrder" type="number" min={0} step={1} defaultValue={String(defaultSortOrder)} className="w-full rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-5 py-3 text-sm outline-none transition-all focus:border-violet-400 focus:bg-white dark:bg-slate-900 focus:ring-4 focus:ring-violet-500/15" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-8 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:bg-slate-800 hover:text-slate-900"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={duplicate}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white dark:bg-slate-900/15 transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
