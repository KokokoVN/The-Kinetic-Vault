"use client";

import { useState } from "react";

type SpecRow = {
  id: string;
  specKey: string;
  specValue: string;
  unit: string;
  specGroup: string;
};

type ProductSpecMultiFormProps = {
  productId: string;
  action: (formData: FormData) => void | Promise<void>;
  existingSpecs?: Array<{ specKey?: string | null }>;
  /** Danh sách nhóm gợi ý từ spec đã có */
  existingGroups?: string[];
};

function createRow(seed: number): SpecRow {
  return {
    id: `row-${seed}-${Date.now()}`,
    specKey: "",
    specValue: "",
    unit: "",
    specGroup: "",
  };
}

function keyOf(specKey: string): string {
  return specKey.trim().toLowerCase();
}

export function ProductSpecMultiForm({
  productId,
  action,
  existingSpecs = [],
  existingGroups = [],
}: ProductSpecMultiFormProps) {
  const [rows, setRows] = useState<SpecRow[]>([createRow(1)]);
  const existingSet = new Set(
    existingSpecs
      .map((s) => keyOf(s.specKey ?? ""))
      .filter(Boolean),
  );

  const rowDuplicateReasons = rows.map((row, idx) => {
    const key = keyOf(row.specKey);
    if (!key) return "";
    if (existingSet.has(key)) {
      return "Thông số này đã tồn tại trong hệ thống.";
    }
    for (let i = 0; i < rows.length; i += 1) {
      if (i === idx) continue;
      if (keyOf(rows[i].specKey) === key) {
        return "Thông số này bị trùng với dòng khác trong form.";
      }
    }
    return "";
  });

  // Gợi ý nhóm: lấy từ existingGroups + các nhóm đã nhập trong form
  const suggestedGroups = Array.from(new Set([
    ...existingGroups,
    ...rows.map((r) => r.specGroup.trim()).filter(Boolean),
  ]));

  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4" noValidate>
      <input type="hidden" name="_productId" value={productId} />

      {rows.map((row, idx) => (
        <div
          key={row.id}
          className="grid gap-3 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3"
        >
          {/* Nhóm thông số */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">folder_open</span>
            <input
              name="specGroup"
              value={row.specGroup}
              list={`group-suggestions-${idx}`}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], specGroup: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Nhóm thông số (ví dụ: CPU, Màn hình, Pin…)"
              className="flex-1 rounded-lg border border-outline-variant/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <datalist id={`group-suggestions-${idx}`}>
              {suggestedGroups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          {/* Tên, Giá trị, Đơn vị */}
          <div className="grid gap-2 md:grid-cols-3">
            <input
              name="specKey"
              value={row.specKey}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], specKey: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Tên thông số"
              className={[
                "rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary",
                rowDuplicateReasons[idx] ? "ring-2 ring-rose-400" : "",
              ].join(" ")}
            />
            <input
              name="specValue"
              value={row.specValue}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], specValue: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Giá trị"
              className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary"
            />
            <input
              name="unit"
              value={row.unit}
              onChange={(e) => {
                const next = rows.slice();
                next[idx] = { ...next[idx], unit: e.currentTarget.value };
                setRows(next);
              }}
              placeholder="Đơn vị (GHz, GB, inch…)"
              className="rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-sm outline-none focus:border-secondary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, createRow(prev.length + 1)])}
              className="min-w-[96px] flex-1 whitespace-nowrap rounded-lg bg-surface-container-high px-3 py-2 text-sm font-bold text-primary transition-colors hover:bg-surface-container-highest"
            >
              + Thêm dòng
            </button>
            <button
              type="button"
              onClick={() => {
                if (rows.length <= 1) return;
                setRows((prev) => prev.filter((_, i) => i !== idx));
              }}
              disabled={rows.length <= 1}
              className="min-w-[96px] flex-1 whitespace-nowrap rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
            >
              Xóa dòng
            </button>
          </div>
        </div>
      ))}

      {rowDuplicateReasons.map((reason, idx) =>
        reason ? (
          <p key={`spec-dup-${idx}`} className="text-xs font-medium text-rose-700">
            Dòng {idx + 1}: Đã trùng - {reason}
          </p>
        ) : null,
      )}

      <button type="submit" className="rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 md:w-44">
        Thêm thông số
      </button>
    </form>
  );
}
