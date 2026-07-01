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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            aria-label="Đóng popup"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[101] max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-2xl shadow-slate-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id={titleId} className="font-headline text-lg font-black text-blue-900">
                  Nhập kho
                </h2>
                <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">{productName}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-blue-900"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Thời gian ghi nhận dùng <strong>giờ server</strong> tự động (không cần chọn ngày giờ).
            </p>

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
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-bold text-blue-900" htmlFor={`qty-${titleId}`}>
                  Số lượng nhập <span className="text-rose-600">*</span>
                </label>
                <input
                  id={`qty-${titleId}`}
                  name="quantity"
                  type="number"
                  min={1}
                  step={1}
                  required
                  className="w-full rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-blue-900" htmlFor={`var-${titleId}`}>
                  Áp vào biến thể (tuỳ chọn)
                </label>
                <select
                  id={`var-${titleId}`}
                  name="variantId"
                  value={variantId ? String(variantId) : ""}
                  onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : 0)}
                  className="w-full rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Tổng sản phẩm (không gán biến thể)</option>
                  {variants.map((v) => (
                    <option key={v.id} value={String(v.id)}>
                      {v.size} · {v.color} (tồn: {v.availability})
                    </option>
                  ))}
                </select>
                {selectedVariant ? (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Đang nhập cho: <span className="font-semibold text-blue-900">{selectedVariant.size} · {selectedVariant.color}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Đang nhập cho: <span className="font-semibold text-blue-900">Tổng sản phẩm</span>
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-blue-900" htmlFor={`note-${titleId}`}>
                  Ghi chú
                </label>
                <textarea
                  id={`note-${titleId}`}
                  name="note"
                  rows={2}
                  className="w-full rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Nhà cung cấp, số phiếu…"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-blue-900" htmlFor={`cost-${titleId}`}>
                  Đơn giá nhập (VND, tuỳ chọn)
                </label>
                <input
                  id={`cost-${titleId}`}
                  name="unitCost"
                  type="number"
                  min={0}
                  step={1}
                  className="w-full rounded-xl border border-outline-variant/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-kinetic px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95"
                >
                  Xác nhận nhập kho
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-blue-900 hover:bg-surface-container-high"
                >
                  Huỷ
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
