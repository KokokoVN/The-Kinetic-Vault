"use client";

import { useMemo, useState } from "react";

type ProductNameLiveCheckProps = {
  fieldClass: string;
  defaultValue: string;
  existingNames: string[];
  currentId?: string;
};

const PRODUCT_NAME_RE = /^[\p{L}0-9][\p{L}0-9\s-]*[\p{L}0-9]$/u;

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function ProductNameLiveCheck({ fieldClass, defaultValue, existingNames, currentId }: ProductNameLiveCheckProps) {
  const [name, setName] = useState(defaultValue);

  const error = useMemo(() => {
    const value = normalize(name);
    if (!value) return "Tên sản phẩm là bắt buộc.";
    if (value.length < 2) return "Tên sản phẩm quá ngắn.";
    if (value.length > 255) return "Tên sản phẩm không được vượt quá 255 ký tự.";
    if (!PRODUCT_NAME_RE.test(value)) return "Chỉ cho phép chữ, số, khoảng trắng và dấu gạch ngang.";
    const duplicate = existingNames.some((item) => normalize(item) === value);
    if (duplicate) return "Tên sản phẩm này đã tồn tại.";
    return "";
  }, [name, existingNames]);

  const invalid = Boolean(error);

  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-blue-900" htmlFor="productName">
        Tên sản phẩm <span className="text-rose-600">*</span>
      </label>
      <input
        id="productName"
        name="productName"
        required
        autoComplete="off"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`${fieldClass} ${invalid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200" : ""}`}
        aria-invalid={invalid}
        aria-describedby="productName-help"
      />
      {invalid ? (
        <p id="productName-help" className="mt-1 text-xs font-semibold text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
