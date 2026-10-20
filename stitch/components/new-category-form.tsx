"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  checkCategoryNameAction,
  uploadCategoryImageAction,
  createCategoryAction,
  updateCategoryAction,
} from "@/app/(admin)/categories/actions";
import { type BackendCategory } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryIcon(name: string): { icon: string; gradient: string } {
  const n = String(name ?? "").toLowerCase();
  if (n.includes("điện thoại") || n.includes("phone") || n.includes("mobile") || n.includes("tai nghe") || n.includes("phụ kiện")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-500" };
  }
  if (n.includes("laptop") || n.includes("máy tính") || n.includes("computer") || n.includes("pc")) {
    return { icon: "laptop_chromebook", gradient: "from-indigo-500 to-blue-500" };
  }
  if (n.includes("áo") || n.includes("quần") || n.includes("thời trang") || n.includes("giày") || n.includes("apparel") || n.includes("fashion")) {
    return { icon: "apparel", gradient: "from-purple-500 to-pink-500" };
  }
  if (n.includes("bếp") || n.includes("nồi") || n.includes("gia dụng") || n.includes("chén") || n.includes("kitchen") || n.includes("dining")) {
    return { icon: "kitchen", gradient: "from-amber-500 to-orange-500" };
  }
  if (n.includes("mỹ phẩm") || n.includes("son") || n.includes("phấn") || n.includes("skincare") || n.includes("beauty")) {
    return { icon: "face", gradient: "from-rose-500 to-pink-500" };
  }
  if (n.includes("sách") || n.includes("vở") || n.includes("bút") || n.includes("book") || n.includes("stationery")) {
    return { icon: "menu_book", gradient: "from-emerald-500 to-teal-500" };
  }
  if (n.includes("thể thao") || n.includes("dã ngoại") || n.includes("xe đạp") || n.includes("sports") || n.includes("outdoor")) {
    return { icon: "sports_soccer", gradient: "from-teal-500 to-cyan-500" };
  }
  return { icon: "category", gradient: "from-blue-600 to-indigo-600" };
}

export function NewCategoryForm({ initialCategory }: { initialCategory?: BackendCategory }) {
  const router = useRouter();
  const isEdit = !!initialCategory;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialCategory?.name || "");
  const [slug, setSlug] = useState(initialCategory?.slug || "");
  const [description, setDescription] = useState(initialCategory?.description || "");
  const [hidden, setHidden] = useState<boolean>(initialCategory?.hidden || false);

  const [file, setFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(initialCategory?.imageUrl || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialCategory?.imageUrl || null);

  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<{ message: string; variant: "error" | "success" } | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isAutoSlug, setIsAutoSlug] = useState(!initialCategory?.slug);

  const [isPending, startTransition] = useTransition();

  // Auto generate slug from name
  useEffect(() => {
    if (isAutoSlug && name.trim()) {
      setSlug(slugify(name));
    }
  }, [name, isAutoSlug]);

  // Handle file preview
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (existingImageUrl) {
      setPreviewUrl(existingImageUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file, existingImageUrl]);

  // Debounced check name
  useEffect(() => {
    if (!name.trim()) {
      setNameError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingName(true);
      try {
        const exists = await checkCategoryNameAction(name.trim(), initialCategory?.id);
        if (exists) {
          setNameError("Tên danh mục đã tồn tại trong hệ thống.");
        } else {
          setNameError(null);
        }
      } catch {
        // ignore
      } finally {
        setIsCheckingName(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [name, initialCategory?.id]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormNotice({ message: "Vui lòng nhập tên danh mục.", variant: "error" });
      return;
    }
    if (nameError) {
      setFormNotice({ message: nameError, variant: "error" });
      return;
    }

    startTransition(async () => {
      try {
        let imageUrl = existingImageUrl;
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          imageUrl = await uploadCategoryImageAction(formData);
        }

        const payload = {
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          imageUrl,
          hidden,
        };

        if (isEdit && initialCategory) {
          await updateCategoryAction(initialCategory.id, payload);
          router.push(`/admin/categories/${initialCategory.id}?success=update`);
        } else {
          await createCategoryAction(payload);
          router.push("/admin/categories?success=create");
        }
        router.refresh();
      } catch (err: any) {
        const msg = err.message || "Thao tác thất bại. Vui lòng kiểm tra lại.";
        setNameError(msg);
        setFormNotice({ message: msg, variant: "error" });
      }
    });
  };

  const style = getCategoryIcon(name);

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
      {formNotice && <FloatingNotice key={formNotice.message} message={formNotice.message} variant={formNotice.variant} />}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ==================== LEFT COLUMN: FORM INPUTS ==================== */}
        <div className="space-y-6 lg:col-span-7">
          {/* Category Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Tên danh mục <span className="text-rose-500">*</span>
              </label>
              {isCheckingName && (
                <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold animate-pulse">
                  Đang kiểm tra trùng lặp...
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Điện thoại & Phụ kiện, Máy tính xách tay, Thời trang..."
              className={`w-full rounded-2xl border ${
                nameError
                  ? "border-rose-500 bg-rose-50/40 text-rose-900"
                  : "border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-slate-900 dark:text-white"
              } px-4 py-3 text-sm font-semibold outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-white/[0.06] focus:border-blue-500 dark:focus:border-cyan-500/50 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 shadow-xs`}
            />
            {nameError && <p className="mt-1.5 text-xs font-bold text-rose-500">{nameError}</p>}
          </div>

          {/* Slug input with auto-generate toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Đường dẫn SEO (Slug)
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAutoSlug(!isAutoSlug);
                  if (!isAutoSlug && name.trim()) setSlug(slugify(name));
                }}
                className={`text-[11px] font-bold ${
                  isAutoSlug ? "text-blue-600 dark:text-cyan-400" : "text-slate-400"
                } hover:underline`}
              >
                {isAutoSlug ? "✓ Tự động sinh slug" : "Tùy chỉnh thủ công"}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 select-none">
                /categories/
              </span>
              <input
                type="text"
                value={slug}
                readOnly={isAutoSlug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setIsAutoSlug(false);
                }}
                placeholder="slug-danh-muc"
                className={`w-full rounded-2xl border ${
                  slugError
                    ? "border-rose-500 bg-rose-50/40 text-rose-900"
                    : "border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] text-slate-900 dark:text-white"
                } pl-28 pr-4 py-3 font-mono text-xs font-semibold outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-white/[0.06] focus:border-blue-500 dark:focus:border-cyan-500/50 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 shadow-xs`}
              />
            </div>
            {slugError && <p className="mt-1.5 text-xs font-bold text-rose-500">{slugError}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
              Mô tả giới thiệu
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu sơ lược về nhóm danh mục sản phẩm, chính sách bán hàng và phân loại chủ đạo..."
              className="w-full rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03] p-4 text-xs font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:bg-white dark:focus:bg-white/[0.06] focus:border-blue-500 dark:focus:border-cyan-500/50 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-cyan-500/10 shadow-xs resize-none"
            />
          </div>

          {/* Hidden toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">Ẩn khỏi trang cửa hàng khách</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Nếu bật, danh mục này sẽ không hiển thị trên thanh điều hướng hoặc bộ lọc trang chủ của khách hàng
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: IMAGE UPLOAD & LIVE PREVIEW ==================== */}
        <div className="space-y-6 lg:col-span-5">
          {/* Image Upload Box */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-6 backdrop-blur-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-3">
              Hình ảnh danh mục
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
            />

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-800 p-4 text-center">
                <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-xs">
                  <img
                    src={previewUrl}
                    alt="Category Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-slate-100 dark:bg-zinc-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-200 transition-colors shadow-xs"
                  >
                    Thay đổi ảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setExistingImageUrl(null);
                      setPreviewUrl(null);
                    }}
                    className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors shadow-xs"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 p-8 text-center cursor-pointer transition-all hover:border-blue-500 dark:hover:border-cyan-500 hover:bg-white/50 dark:hover:bg-white/[0.02]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-cyan-950/40 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                </div>
                <p className="mt-3 text-xs font-bold text-slate-700 dark:text-zinc-200">
                  Nhấp để tải lên hình ảnh
                </p>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                  Định dạng PNG, JPG, WEBP hoặc SVG (Khuyến nghị tỷ lệ vuông hoặc 16:9)
                </p>
              </div>
            )}
          </div>

          {/* Live Preview Box */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-6 backdrop-blur-md">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
              Xem trước hiển thị trực tiếp
            </span>

            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 p-4 shadow-xs flex items-start gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-800 p-1 shadow-xs">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br ${style.gradient} text-white font-bold text-sm`}>
                    {name.trim() ? name.trim().charAt(0).toUpperCase() : <span className="material-symbols-outlined text-[20px]">{style.icon}</span>}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-headline text-sm font-bold text-slate-900 dark:text-white truncate">
                  {name.trim() || "Tên danh mục"}
                </p>
                <p className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                  /categories/{slug.trim() || "slug"}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                  {description.trim() || "Mô tả danh mục sẽ hiển thị tại đây..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FOOTER ACTIONS ==================== */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/10 pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="rounded-2xl px-6 py-3 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
        >
          Hủy bỏ
        </button>

        <button
          type="submit"
          disabled={isPending || isCheckingName}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-7 py-3 font-headline text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/35 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              <span>Đang lưu...</span>
            </>
          ) : isEdit ? (
            <span>Cập nhật danh mục</span>
          ) : (
            <span>Tạo danh mục mới</span>
          )}
        </button>
      </div>
    </form>
  );
}
