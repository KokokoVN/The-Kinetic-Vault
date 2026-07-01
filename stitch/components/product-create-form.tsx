"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductMultiImageUploadPreview } from "./product-multi-image-upload-preview";
import { ProductNameLiveCheck } from "./product-name-live-check";
import type { BackendCategory, AdminBrand } from "@/lib/api";

type ProductCreateFormProps = {
  categories: BackendCategory[];
  brands: AdminBrand[];
  allProducts: { id: string; name: string }[];
  defaultCategoryId: number | "";
  action: (formData: FormData) => Promise<{ error?: string; success?: boolean; id?: number } | void>;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function ProductCreateForm({
  categories,
  brands,
  allProducts,
  defaultCategoryId,
  action,
}: ProductCreateFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string | null>(null);
  const [uploadBytes, setUploadBytes] = useState<{ loaded: string; total: string } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const uploadFilesWithProgress = (
    productId: number,
    files: File[],
    primaryIndex: number | null
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/admin/products/${productId}/upload`);

      const uploadData = new FormData();
      files.forEach((file) => uploadData.append("files", file));
      if (primaryIndex !== null && primaryIndex >= 0) {
        uploadData.append("primaryIndex", String(primaryIndex));
      }

      let startTime = Date.now();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const loaded = event.loaded;
          const total = event.total;
          const percentage = Math.round((loaded / total) * 100);

          const elapsedTime = (Date.now() - startTime) / 1000;
          let speed = "0 KB/s";
          if (elapsedTime > 0) {
            const bps = loaded / elapsedTime;
            if (bps > 1024 * 1024) {
              speed = `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
            } else if (bps > 1024) {
              speed = `${(bps / 1024).toFixed(0)} KB/s`;
            } else {
              speed = `${bps.toFixed(0)} B/s`;
            }
          }

          setUploadProgress(percentage);
          setUploadSpeed(speed);
          setUploadBytes({
            loaded: formatBytes(loaded),
            total: formatBytes(total),
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(xhr.responseText || `Lỗi tải lên (${xhr.status})`));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Lỗi kết nối mạng proxy."));
      };

      xhr.send(uploadData);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const imageFiles = formData.getAll("productImages").filter((x): x is File => x instanceof File && x.size > 0);
    const videoFiles = formData.getAll("productVideos").filter((x): x is File => x instanceof File && x.size > 0);
    const mergedFiles = [...imageFiles, ...videoFiles];

    const primaryRaw = Math.floor(Number(String(formData.get("primaryImageIndex") ?? "0").trim()));
    const primaryIndex =
      imageFiles.length > 0 ? Math.min(Math.max(0, Number.isFinite(primaryRaw) ? primaryRaw : 0), imageFiles.length - 1) : null;

    // Check video duration (<= 60s)
    for (const file of videoFiles) {
      if (file.type.startsWith("video/")) {
        try {
          const duration = await new Promise<number>((resolve, reject) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
              window.URL.revokeObjectURL(video.src);
              resolve(video.duration);
            };
            video.onerror = () => reject(new Error("Lỗi đọc video"));
            video.src = window.URL.createObjectURL(file);
          });
          if (duration > 60) {
            setError(`Video "${file.name}" vượt quá 60 giây (hiện tại: ${Math.round(duration)}s). Vui lòng chọn video khác.`);
            return; // Dừng lại, không submit, giữ nguyên input
          }
        } catch (err) {
          setError(`Lỗi khi kiểm tra độ dài video "${file.name}".`);
          return;
        }
      }
    }

    // Delete files from formData so Next.js server actions do not buffer them
    formData.delete("productImages");
    formData.delete("productVideos");

    startTransition(async () => {
      try {
        const res = await action(formData);
        if (res && res.error) {
          setError(res.error);
          return;
        }

        const createdId = res?.id;
        if (!createdId) {
          setError("create");
          return;
        }

        if (mergedFiles.length > 0) {
          setIsUploading(true);
          setUploadProgress(0);
          setUploadSpeed("0 KB/s");
          const totalSize = mergedFiles.reduce((acc, f) => acc + f.size, 0);
          setUploadBytes({ loaded: "0 B", total: formatBytes(totalSize) });

          try {
            await uploadFilesWithProgress(createdId, mergedFiles, primaryIndex);
          } catch (err: any) {
            console.error("Lỗi upload client-side:", err);
            router.push(`/admin/products/${encodeURIComponent(String(createdId))}/edit?error=upload_images`);
            return;
          } finally {
            setIsUploading(false);
          }
        }

        router.push(`/admin/products/${encodeURIComponent(String(createdId))}/detail?success=create`);
      } catch (err: any) {
        setError(err.message || "create");
      }
    });
  };

  return (
    <div className="space-y-8">
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-indigo-600 animate-bounce">cloud_upload</span>
              <div>
                <h3 className="font-headline text-lg font-black text-slate-900">Đang tải lên phương tiện...</h3>
                <p className="text-xs text-slate-500">Vui lòng không đóng trình duyệt hoặc tải lại trang.</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                <span>Tiến trình</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100 pt-4">
              <div className="flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>{uploadSpeed}</span>
              </div>
              <div className="font-mono">
                <span>{uploadBytes?.loaded} / {uploadBytes?.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <section className="overflow-hidden rounded-[2rem] border border-outline-variant/20 dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-2xl shadow-blue-900/5 dark:shadow-none">
        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-sky-500 to-indigo-500" />
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            
            {/* Cột trái: Thông tin cơ bản */}
            <div className="md:col-span-7 lg:col-span-8 space-y-8">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="productName">
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <ProductNameLiveCheck
                  fieldClass="w-full rounded-2xl border border-outline-variant/20 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-4 text-sm font-medium outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white"
                  defaultValue=""
                  existingNames={allProducts.map((p) => p.name)}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="discription">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Mô tả (discription)
                </label>
                <textarea
                  id="discription"
                  name="discription"
                  rows={6}
                  className="w-full rounded-2xl border border-outline-variant/20 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-4 text-sm outline-none transition-all focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white"
                  placeholder="Mô tả chi tiết, đặc điểm nổi bật, chất liệu..."
                />
              </div>
              
              <div className="space-y-6">
                <ProductMultiImageUploadPreview
                  name="productImages"
                  primaryIndexFieldName="primaryImageIndex"
                  acceptType="images"
                  label="Ảnh minh họa sản phẩm"
                  hint="Có thể tải lên nhiều ảnh (JPG, PNG, WebP). Click vào ảnh xem trước để chọn ảnh đại diện chính."
                />
                <ProductMultiImageUploadPreview
                  name="productVideos"
                  acceptType="videos"
                  label="Video minh họa sản phẩm"
                  hint="Tải lên video giới thiệu sản phẩm (thời lượng bắt buộc dưới 60 giây)."
                />
              </div>
            </div>

            {/* Cột phải: Phân loại & Giá */}
            <div className="md:col-span-5 lg:col-span-4 space-y-8">
              <div className="rounded-2xl border border-outline-variant/10 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6 space-y-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="categoryId">
                    <span className="material-symbols-outlined text-[16px]">category</span>
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    required
                    defaultValue={defaultCategoryId === "" ? undefined : String(defaultCategoryId)}
                    className="w-full rounded-xl border border-outline-variant/20 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white appearance-none"
                  >
                    <option value="">— Chọn danh mục —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="brandId">
                    <span className="material-symbols-outlined text-[16px]">stars</span>
                    Thương hiệu
                  </label>
                  <select
                    id="brandId"
                    name="brandId"
                    className="w-full rounded-xl border border-outline-variant/20 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white appearance-none"
                  >
                    <option value="">— Chọn thương hiệu (Tuỳ chọn) —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={String(b.id)}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="price">
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    Giá niêm yết (VND) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min={1}
                    step={1}
                    required
                    className="w-full rounded-xl border border-outline-variant/20 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:text-white"
                    placeholder="Ví dụ: 150000"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400" htmlFor="sku">
                    <span className="material-symbols-outlined text-[16px]">barcode</span>
                    Mã SKU (Tuỳ chọn)
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    className="w-full rounded-xl border border-outline-variant/20 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-medium uppercase outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 placeholder:normal-case dark:text-white"
                    placeholder="Bỏ trống để tự động sinh"
                  />
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Tồn kho ban đầu luôn là 0. Bạn cần làm thủ tục Nhập kho sau khi tạo sản phẩm và biến thể.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/10 dark:border-slate-700">
            <Link
              prefetch
              href="/admin/products"
              className="rounded-2xl px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Huỷ
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              {isPending ? "Đang lưu..." : "Lưu & Tiếp tục thêm biến thể"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
