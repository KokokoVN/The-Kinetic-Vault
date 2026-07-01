"use client";

import { useEffect, useState } from "react";

type VariantRow = {
  id: string;
  size: string;
  color: string;
  price: string;
  previewUrl: string;
  fileName: string;
};

type VariantMultiFormProps = {
  productId: string;
  action: (formData: FormData) => void | Promise<void>;
  existingVariants?: Array<{ size?: string | null; color?: string | null }>;
};

function createRow(seed: number): VariantRow {
  return {
    id: `variant-${seed}`,
    size: "",
    color: "",
    price: "",
    previewUrl: "",
    fileName: "",
  };
}

function keyOf(size: string, color: string): string {
  return `${size.trim().toLowerCase()}::${color.trim().toLowerCase()}`;
}

export function VariantMultiForm({ productId, action, existingVariants = [] }: VariantMultiFormProps) {
  const [rows, setRows] = useState<VariantRow[]>([createRow(1)]);
  const [error, setError] = useState("");
  const existingSet = new Set(
    existingVariants
      .map((v) => keyOf(v.size ?? "", v.color ?? ""))
      .filter((k) => k !== "::"),
  );

  useEffect(() => {
    return () => {
      rows.forEach((r) => {
        if (r.previewUrl) URL.revokeObjectURL(r.previewUrl);
      });
    };
  }, [rows]);

  const rowDuplicateReasons = rows.map((row, idx) => {
    const s = row.size.trim();
    const c = row.color.trim();
    if (!s || !c) return "";
    const k = keyOf(s, c);
    if (existingSet.has(k)) {
      return "Biến thể này đã tồn tại trong hệ thống.";
    }
    for (let i = 0; i < rows.length; i += 1) {
      if (i === idx) continue;
      const other = rows[i];
      if (!other.size.trim() || !other.color.trim()) continue;
      if (keyOf(other.size, other.color) === k) {
        return "Biến thể này bị trùng với dòng khác trong form.";
      }
    }
    return "";
  });

  return (
    <form
      action={action}
      className="grid gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4"
      onSubmit={(e) => {
        for (let i = 0; i < rows.length; i += 1) {
          const r = rows[i];
          const isEmpty = !r.size.trim() && !r.color.trim() && !r.price.trim();
          if (isEmpty) continue;
          if (rowDuplicateReasons[i]) {
            e.preventDefault();
            setError(`Dòng biến thể ${i + 1} bị trùng.`);
            return;
          }
          if (!r.size.trim() || !r.color.trim() || !r.price.trim()) {
            e.preventDefault();
            setError(`Dòng biến thể ${i + 1} chưa nhập đủ Size/Màu/Giá.`);
            return;
          }
          if (Number(r.price) <= 0 || Number.isNaN(Number(r.price))) {
            e.preventDefault();
            setError(`Giá ở dòng ${i + 1} không hợp lệ.`);
            return;
          }
        }
        setError("");
      }}
    >
      <input type="hidden" name="_productId" value={productId} />

      {rows.map((row, idx) => (
        <div key={row.id} className="grid gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3">
          <div className="grid gap-2 md:grid-cols-3">
            <input
              name="size"
              value={row.size}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], size: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Size"
              className={[
                "rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary",
                rowDuplicateReasons[idx] ? "ring-2 ring-rose-400" : "",
              ].join(" ")}
            />
            <input
              name="color"
              value={row.color}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], color: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Màu"
              className={[
                "rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary",
                rowDuplicateReasons[idx] ? "ring-2 ring-rose-400" : "",
              ].join(" ")}
            />
            <input
              name="variantPrice"
              type="number"
              min={1}
              step={1}
              value={row.price}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], price: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Giá (VND)"
              className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary"
            />
          </div>
          {rowDuplicateReasons[idx] ? (
            <p className="text-xs font-medium text-rose-700">Đã trùng: {rowDuplicateReasons[idx]}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, createRow(prev.length + 1)])}
              className="min-w-[88px] flex-1 whitespace-nowrap rounded-lg bg-surface-container-high px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-highest"
            >
              + Dòng
            </button>
            <button
              type="button"
              onClick={() => {
                if (rows.length <= 1) return;
                const target = rows[idx];
                if (target.previewUrl) URL.revokeObjectURL(target.previewUrl);
                setRows((prev) => prev.filter((_, i) => i !== idx));
              }}
              disabled={rows.length <= 1}
              className="min-w-[88px] flex-1 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
            >
              Xóa
            </button>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <input
              name="variantImageFile"
              type="file"
              accept="image/*"
              className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                const next = rows.slice();
                if (next[idx].previewUrl) {
                  URL.revokeObjectURL(next[idx].previewUrl);
                }
                if (file) {
                  next[idx] = {
                    ...next[idx],
                    previewUrl: URL.createObjectURL(file),
                    fileName: file.name,
                  };
                } else {
                  next[idx] = { ...next[idx], previewUrl: "", fileName: "" };
                }
                setRows(next);
              }}
            />
            {row.previewUrl ? (
              <div className="flex items-center gap-2">
                <img src={row.previewUrl} alt={row.fileName || `preview-${idx + 1}`} className="h-14 w-14 rounded-lg object-cover" />
                <span className="max-w-40 truncate text-xs text-on-surface-variant">{row.fileName}</span>
              </div>
            ) : (
              <span className="self-center text-xs text-on-surface-variant">Chưa chọn ảnh</span>
            )}
          </div>
        </div>
      ))}

      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}

      <button type="submit" className="rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 md:w-52">
        Thêm biến thể
      </button>
    </form>
  );
}
