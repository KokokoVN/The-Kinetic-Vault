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
    <div className="space-y-6">
      {isUploading && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-slate-900 p-6 shadow-sm mb-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Đang tải lên hình ảnh & video</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Vui lòng giữ trình duyệt mở, không tải lại trang</p>
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

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
              <div className="flex items-center gap-1.5 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>{uploadSpeed}</span>
              </div>
              <div className="font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                <span>{uploadBytes?.loaded} / {uploadBytes?.total}</span>
              </div>
            </div>
          </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 p-4 border border-rose-100 dark:border-rose-500/20 text-sm font-medium text-rose-600 dark:text-rose-400 flex items-start gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>{error === "validation" ? "Vui lòng nhập đầy đủ các trường bắt buộc." : error}</span>
        </div>
      )}

      {/* Form Card */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/5 dark:shadow-none">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/5 blur-2xl" />

        <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-10 space-y-8">
          
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <span className="material-symbols-outlined text-[22px]">add_circle</span>
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
            
            {/* Cột trái: Thông tin cơ bản */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" htmlFor="productName">
                  <span className="material-symbols-outlined text-[15px] text-indigo-500">label</span>
                  Tên sản phẩm <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <ProductNameLiveCheck
                  fieldClass="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15"
                  defaultValue=""
                  existingNames={allProducts.map((p) => p.name)}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" htmlFor="discription">
                  <span className="material-symbols-outlined text-[15px] text-indigo-500">description</span>
                  Mô tả chi tiết <span className="text-rose-500 ml-0.5">*</span>
                </label>
                <textarea
                  id="discription"
                  name="discription"
                  rows={8}
                  required
                  className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15 leading-relaxed"
                  placeholder="Mô tả chất liệu, đặc điểm nổi bật..."
                />
              </div>
              
              <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
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
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 p-6 space-y-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" htmlFor="categoryId">
                    <span className="material-symbols-outlined text-[15px] text-indigo-500">category</span>
                    Danh mục <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="categoryId"
                      name="categoryId"
                      required
                      defaultValue={defaultCategoryId === "" ? undefined : String(defaultCategoryId)}
                      className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15"
                    >
                      <option value="" disabled>— Chọn danh mục —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">expand_more</span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" htmlFor="brandId">
                    <span className="material-symbols-outlined text-[15px] text-indigo-500">stars</span>
                    Thương hiệu <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="brandId"
                      name="brandId"
                      required
                      className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15"
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

                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" htmlFor="price">
                    <span className="material-symbols-outlined text-[15px] text-emerald-500">payments</span>
                    Giá niêm yết <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min={1}
                      step={1}
                      required
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 pr-16 text-sm font-medium text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15"
                      placeholder="Ví dụ: 150000"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      VND
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400" htmlFor="sku">
                    <span className="material-symbols-outlined text-[15px] text-slate-400">barcode</span>
                    Mã SKU <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    required
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 px-5 py-3.5 text-sm font-medium uppercase text-slate-800 dark:text-white outline-none transition-all placeholder:font-sans placeholder:normal-case placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/15"
                    placeholder="Mã SKU (VD: SP001)"
                  />
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/10 p-3 border border-indigo-100/50 dark:border-indigo-500/20">
                    <span className="material-symbols-outlined text-[16px] text-indigo-500 mt-0.5">info</span>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium leading-relaxed">
                      Tồn kho ban đầu luôn là 0. Sau khi tạo sản phẩm và biến thể, bạn cần vào trang chi tiết để làm thủ tục Nhập kho.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-8 border-t border-slate-100 dark:border-slate-800">
            <Link
              prefetch
              href="/admin/products"
              className="w-full sm:w-auto text-center rounded-2xl px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Huỷ bỏ
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/15 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>{isPending ? "Đang lưu..." : "Lưu & Tiếp tục"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
