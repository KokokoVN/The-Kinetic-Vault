"use client";

import React, { useState, useTransition } from "react";
import { ProductNameLiveCheck } from "./product-name-live-check";
import type { BackendProduct, BackendCategory, AdminBrand } from "@/lib/api";
import { toast } from "sonner";

/** Check if a thrown value is a Next.js redirect (should NOT be treated as error) */
function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as any).digest === "string" &&
    (err as any).digest.startsWith("NEXT_REDIRECT")
  );
}

type ProductEditFormProps = {
  product: BackendProduct;
  categoryOptions: BackendCategory[];
  brands: AdminBrand[];
  allProducts: { id: string; name: string }[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15";

const labelClass =
  "mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400";

export function ProductEditForm({
  product,
  categoryOptions,
  brands,
  allProducts,
  action,
}: ProductEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const pid = String(product.id);
  const priceDisplay = Number(product.price ?? 0);
  const [editPrice, setEditPrice] = useState<string>(
    String(Number.isFinite(priceDisplay) && priceDisplay >= 1 ? Math.round(priceDisplay) : 1)
  );
  const [description, setDescription] = useState<string>(product.discription ?? "");

  const appendTemplate = (text: string) => {
    setDescription((prev) => (prev ? `${prev.trim()}\n\n${text}` : text));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const res = await action(formData);
        if (res && res.error) {
          setError(res.error);
          toast.error(
            res.error === "validation"
              ? "Vui lòng nhập tên, chọn danh mục và giá hợp lệ."
              : res.error === "sku"
              ? "Mã SKU đã tồn tại. Vui lòng chọn mã khác."
              : "Cập nhật sản phẩm thất bại. Vui lòng thử lại."
          );
        } else {
          setSaved(true);
          toast.success("Đã cập nhật sản phẩm thành công!");
        }
      } catch (err: any) {
        // Next.js redirect() throws a special error — ignore it
        if (isNextRedirect(err)) return;
        setError(err.message || "update");
        toast.error("Đã xảy ra lỗi khi cập nhật.");
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Main card ── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/8 dark:shadow-none">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/5 blur-2xl" />

        <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-10">
          {/* Section title */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <span className="material-symbols-outlined text-[22px]">edit_square</span>
            </div>
            <div>
              <h2 className="font-headline text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Thông tin sản phẩm
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Vui lòng điền đủ các trường bắt buộc (*)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* ─ Left: Name + Description ─ */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product name */}
              <div>
                <label className={labelClass}>
                  <span className="material-symbols-outlined text-[15px] text-indigo-500">
                    label
                  </span>
                  Tên sản phẩm <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <ProductNameLiveCheck
                  fieldClass={inputClass}
                  defaultValue={product.productName}
                  existingNames={allProducts
                    .filter((p) => String(p.id) !== pid)
                    .map((p) => p.name)}
                  currentId={pid}
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className={labelClass} htmlFor="discription">
                    <span className="material-symbols-outlined text-[15px] text-indigo-500">
                      description
                    </span>
                    Mô tả sản phẩm <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {description.length} ký tự · {description.trim() ? description.trim().split(/\s+/).length : 0} từ
                  </span>
                </div>

                {/* Quick description template snippets */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                    Chèn mẫu nhanh:
                  </span>
                  <button
                    type="button"
                    onClick={() => appendTemplate("• Đặc điểm nổi bật:\n- Thiết kế hiện đại, sang trọng\n- Chất liệu cao cấp, độ bền cao\n- Dễ dàng sử dụng và bảo quản")}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-colors"
                  >
                    + Đặc điểm nổi bật
                  </button>
                  <button
                    type="button"
                    onClick={() => appendTemplate("• Thông số sản phẩm:\n- Xuất xứ: Chính hãng\n- Quy cách: Đóng gói tiêu chuẩn\n- Kích thước & Trọng lượng: Tiêu chuẩn")}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-colors"
                  >
                    + Thông số cơ bản
                  </button>
                  <button
                    type="button"
                    onClick={() => appendTemplate("• Chính sách bảo hành:\n- Bảo hành chính hãng 12 tháng\n- Hỗ trợ đổi mới trong 30 ngày nếu có lỗi do nhà sản xuất")}
                    className="rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 px-2 py-1 text-[10px] font-bold text-slate-600 dark:text-zinc-300 transition-colors"
                  >
                    + Bảo hành
                  </button>
                </div>

                <textarea
                  id="discription"
                  name="discription"
                  rows={9}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về chất liệu, đặc điểm, công dụng..."
                  className={`${inputClass} resize-none leading-relaxed font-sans`}
                />
              </div>
            </div>

            {/* ─ Right: Category, Brand, Price, SKU ─ */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 p-6 space-y-6">
                {/* Category */}
                <div>
                  <label className={labelClass} htmlFor="categoryId">
                    <span className="material-symbols-outlined text-[15px] text-indigo-500">
                      category
                    </span>
                    Danh mục <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="categoryId"
                      name="categoryId"
                      required
                      defaultValue={
                        product.categoryId != null
                          ? String(product.categoryId)
                          : ""
                      }
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled>— Chọn danh mục —</option>
                      {categoryOptions.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">expand_more</span>
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <label className={labelClass} htmlFor="brandId">
                    <span className="material-symbols-outlined text-[15px] text-indigo-500">
                      stars
                    </span>
                    Thương hiệu <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="brandId"
                      name="brandId"
                      required
                      defaultValue={
                        product.brandId != null ? String(product.brandId) : ""
                      }
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="" disabled>— Chọn thương hiệu —</option>
                      {brands.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">expand_more</span>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className={labelClass} htmlFor="price">
                    <span className="material-symbols-outlined text-[15px] text-emerald-500">
                      payments
                    </span>
                    Giá niêm yết (VND){" "}
                    <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min={1}
                      step={1}
                      required
                      inputMode="numeric"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className={`${inputClass} pr-16`}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      VND
                    </span>
                  </div>
                  {Number(editPrice) > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Định dạng: {Number(editPrice).toLocaleString("vi-VN")} ₫</span>
                    </p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={labelClass} htmlFor="sku">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        barcode
                      </span>
                      Mã SKU <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById("sku") as HTMLInputElement | null;
                        if (input) {
                          const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
                          input.value = `PRD-${rand}`;
                        }
                      }}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">shuffle</span>
                      <span>Tạo SKU ngẫu nhiên</span>
                    </button>
                  </div>
                  <input
                    id="sku"
                    name="sku"
                    autoComplete="off"
                    required
                    defaultValue={product.sku ?? ""}
                    placeholder="Mã SKU (VD: SP001)"
                    className={`${inputClass} font-mono uppercase placeholder:normal-case placeholder:font-sans`}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {/* Shine sweep */}
                  <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="material-symbols-outlined text-[20px]">
                    {isPending ? "sync" : "save"}
                  </span>
                  <span className={isPending ? "animate-pulse" : ""}>
                    {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </span>
                  <kbd className="hidden sm:inline-block rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono font-medium text-white ml-2">
                    Ctrl+S
                  </kbd>
                </button>

                <div className="flex items-center justify-between gap-3">
                  <a
                    href={`/admin/products/${pid}/detail`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Xem chi tiết</span>
                  </a>
                  <a
                    href={`/product/${pid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Xem trên web</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
