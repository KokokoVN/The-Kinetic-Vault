"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { StatusToast } from "@/components/status-toast";

export type ProductInboundVariantOption = {
  id: number;
  size: string;
  color: string;
  availability: number;
  variantName?: string | null;
  sku?: string | null;
  attributesJson?: string | null;
  selected?: boolean;
};

function formatInboundVariantLabel(v: ProductInboundVariantOption): string {
  let label = v.variantName?.trim();
  if (!label && v.attributesJson) {
    try {
      const parsed = JSON.parse(v.attributesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        label = parsed.map((p: any) => `${p.name}: ${p.value}`).join(" · ");
      }
    } catch {}
  }
  if (!label) {
    label = [v.color, v.size].filter(Boolean).join(" · ");
  }
  const skuPart = v.sku ? ` [SKU: ${v.sku}]` : "";
  return `${label || "Biến thể"}${skuPart} (Tồn hiện tại: ${v.availability})`;
}

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
  const [variantId, setVariantId] = useState<number>(variants.find((v) => v.selected)?.id ?? (variants[0]?.id ?? 0));
  const [quantity, setQuantity] = useState<number | "">(50);
  const [unitCost, setUnitCost] = useState<number | "">("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();

  const selectedVariant = useMemo(() => variants.find((v) => v.id === variantId), [variants, variantId]);

  const currentAvailability = selectedVariant ? Number(selectedVariant.availability ?? 0) : 0;
  const numQty = typeof quantity === "number" ? quantity : 0;
  const projectedAvailability = currentAvailability + (numQty > 0 ? numQty : 0);
  const numUnitCost = typeof unitCost === "number" ? unitCost : 0;
  const estimatedTotalCost = numQty * numUnitCost;

  const quickQtyOptions = [10, 20, 50, 100, 200, 500];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleAddQty = (delta: number) => {
    setQuantity((prev) => {
      const current = typeof prev === "number" ? prev : 0;
      return Math.max(1, current + delta);
    });
  };

  return (
    <>
      {toast ? <StatusToast tone={toast.tone} title={toast.title} message={toast.message} /> : null}
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        Nhập kho
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop with smooth blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
            onClick={() => !isSubmitting && setOpen(false)}
          />

          {/* Modal Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[101] my-8 max-h-[90vh] w-full sm:max-w-xl overflow-y-auto rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 sm:p-8 shadow-2xl shadow-indigo-900/20 backdrop-blur-2xl transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 dark:bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50 dark:ring-indigo-950/30">
                  <span className="material-symbols-outlined text-[24px]">input</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id={titleId} className="font-headline text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Phiếu Nhập Kho
                    </h2>
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Studio Stock-In
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
                    {productName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white disabled:opacity-50"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form
              action={async (formData: FormData) => {
                setIsSubmitting(true);
                try {
                  await inboundAction(formData);
                  setOpen(false);
                  setToast({ tone: "success", title: "Nhập kho thành công", message: `Đã nhập +${numQty} sản phẩm vào kho hàng.` });
                } catch (err: any) {
                  setToast({ tone: "error", title: "Nhập kho thất bại", message: err?.message || "Không thể cập nhật kho. Vui lòng thử lại." });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="relative mt-6 space-y-6"
            >
              {/* Variant Selector */}
              <div className="space-y-2">
                <label className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor={`var-${titleId}`}>
                  <span>Áp vào phân loại biến thể <span className="text-rose-500">*</span></span>
                  {selectedVariant && (
                    <span className="text-[11px] font-bold text-slate-400">
                      Tồn hiện tại: <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentAvailability} sp</strong>
                    </span>
                  )}
                </label>
                <div className="relative">
                  <select
                    id={`var-${titleId}`}
                    name="variantId"
                    value={variantId ? String(variantId) : ""}
                    onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : 0)}
                    required
                    className="w-full appearance-none rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 px-4 py-3.5 pr-10 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                  >
                    <option value="" disabled>— Chọn biến thể nhập kho —</option>
                    <option value="0">Tổng sản phẩm (không gán biến thể cụ thể)</option>
                    {variants.map((v) => (
                      <option key={v.id} value={String(v.id)}>
                        {formatInboundVariantLabel(v)}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">
                    unfold_more
                  </span>
                </div>
              </div>

              {/* Realtime Stock Calculation Card */}
              <div className="overflow-hidden rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-slate-50/60 dark:from-indigo-950/20 dark:via-blue-950/10 dark:to-zinc-900/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                      <span className="material-symbols-outlined text-[16px]">monitoring</span>
                    </span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-indigo-900/70 dark:text-indigo-300/70">
                        Dự báo tồn kho sau nhập
                      </p>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {selectedVariant?.variantName || (selectedVariant ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(" · ") : "Sản phẩm")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 line-through mr-1.5">{currentAvailability}</span>
                      <span className="text-sm font-bold text-slate-400">➔</span>
                      <span className="ml-1.5 font-headline text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {projectedAvailability} <span className="text-xs font-bold text-slate-500">sp</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity & Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor={`qty-${titleId}`}>
                    Số lượng nhập <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">Đơn vị: Sản phẩm / Cái</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddQty(-10)}
                    disabled={numQty <= 10}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>

                  <input
                    id={`qty-${titleId}`}
                    name="quantity"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === "" ? "" : Math.max(1, parseInt(e.target.value) || 1))}
                    placeholder="VD: 50"
                    className="w-full text-center rounded-xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 px-4 py-3 text-base font-black text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                  />

                  <button
                    type="button"
                    onClick={() => handleAddQty(10)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Cộng nhanh:</span>
                  {quickQtyOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setQuantity((prev) => (typeof prev === "number" ? prev + opt : opt))}
                      className="rounded-lg border border-slate-200/70 dark:border-white/5 bg-white dark:bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300 active:scale-95"
                    >
                      +{opt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setQuantity(50)}
                    className="ml-auto text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Đặt lại (50)
                  </button>
                </div>
              </div>

              {/* Unit Cost & Total Value Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor={`cost-${titleId}`}>
                    Đơn giá vốn nhập (VND) <span className="text-rose-500">*</span>
                  </label>
                  {estimatedTotalCost > 0 && (
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                      Tổng tiền: <strong>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(estimatedTotalCost)}</strong>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    id={`cost-${titleId}`}
                    name="unitCost"
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="VD: 150000"
                    className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 px-4 py-3.5 pr-14 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₫ / cái
                  </span>
                </div>
              </div>

              {/* Note / Reference */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor={`note-${titleId}`}>
                  Ghi chú lô hàng <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id={`note-${titleId}`}
                  name="note"
                  rows={2}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Lô hàng từ NCC Hải Âu, kèm hóa đơn số #HA-9821..."
                  className="w-full resize-none rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-4 focus:ring-indigo-500/15"
                />
              </div>

              {/* Server Clock Timestamp Tip */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-100/70 dark:bg-white/5 px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px] text-indigo-500">schedule</span>
                <span>Thời gian ghi nhận tự động theo <strong>giờ hệ thống chuẩn</strong>. Lịch sử được lưu tại Activity Log.</span>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50"
                >
                  Huỷ bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || numQty <= 0}
                  className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 bg-[length:200%_auto] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all hover:bg-right hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      <span>Đang nhập kho...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">add_task</span>
                      <span>Xác nhận nhập {numQty} sp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
