"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { StatusToast } from "@/components/status-toast";

export type ProductInboundVariantOption = {
  id: number;
  size: string;
  color: string;
  availability: number;
  selected?: boolean;
};

export function ProductInboundModal({
  triggerClassName,
  productName,
  variants,
  inboundAction,
}: {
  triggerClassName: string;
  productName: string;
  variants: ProductInboundVariantOption[];
  inboundAction: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ tone: "success" | "error"; title: string; message: string } | null>(null);
  const [variantId, setVariantId] = useState(variants.find((v) => v.selected)?.id ?? (variants[0]?.id ?? 0));
  const titleId = useId();

  const selectedVariant = useMemo(() => variants.find((v) => v.id === variantId), [variants, variantId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {toast ? <StatusToast tone={toast.tone} title={toast.title} message={toast.message} /> : null}
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Nhập kho
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            aria-label="Đóng popup"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[101] max-h-[90vh] w-full sm:max-w-md lg:max-w-lg overflow-y-auto rounded-[2rem] border border-white/20 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="font-headline text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Nhập kho
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                  {productName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <div className="mt-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 p-4 border border-indigo-100/50 dark:border-indigo-500/20">
              <p className="text-[13px] text-indigo-700 dark:text-indigo-300 font-medium flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                <span>Thời gian ghi nhận dùng <strong>giờ server</strong> tự động (không cần chọn ngày giờ). Vui lòng điền đủ thông tin bắt buộc (*).</span>
              </p>
            </div>

            <form
              action={async (formData: FormData) => {
                try {
                  await inboundAction(formData);
                  setOpen(false);
                  setToast({ tone: "success", title: "Nhập kho thành công", message: "Dữ liệu kho đã được cập nhật." });
                } catch {
                  setToast({ tone: "error", title: "Nhập kho thất bại", message: "Không thể cập nhật kho. Vui lòng thử lại." });
                }
              }}
              className="mt-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Quantity */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor={`qty-${titleId}`}>
                    Số lượng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`qty-${titleId}`}
                    name="quantity"
                    type="number"
                    min={1}
                    step={1}
                    required
                    placeholder="VD: 50"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </div>
                
                {/* Unit Cost */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor={`cost-${titleId}`}>
                    Đơn giá (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id={`cost-${titleId}`}
                    name="unitCost"
                    type="number"
                    min={0}
                    step={1}
                    required
                    placeholder="VD: 150000"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Variant Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor={`var-${titleId}`}>
                  Áp vào biến thể <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id={`var-${titleId}`}
                    name="variantId"
                    value={variantId ? String(variantId) : ""}
                    onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : 0)}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                  >
                    <option value="" disabled>— Chọn biến thể nhập kho —</option>
                    <option value="0">Tổng sản phẩm (không gán biến thể cụ thể)</option>
                    {variants.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {v.size} · {v.color} (tồn hiện tại: {v.availability})
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor={`note-${titleId}`}>
                  Ghi chú lô hàng <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={`note-${titleId}`}
                  name="note"
                  rows={2}
                  required
                  placeholder="Ví dụ: Lô hàng từ NCC A, ngày 10/10..."
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto rounded-xl px-6 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                  Xác nhận nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
