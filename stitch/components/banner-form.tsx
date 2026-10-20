"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createAdminBanner,
  updateAdminBanner,
  uploadAdminBannerImage,
  type PromoBanner,
} from "@/lib/sale-api";
import { resolveCatalogImageUrl } from "@/lib/api";

export function BannerForm({
  initialData,
  accessToken,
  username,
  userId,
}: {
  initialData?: PromoBanner;
  accessToken: string | null;
  username: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");

  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    imageUrl: initialData?.imageUrl || "",
    linkUrl: initialData?.linkUrl || "",
    position: initialData?.position ?? 0,
    active: initialData?.active ?? true,
    startAt: initialData?.startAt ? new Date(initialData.startAt).toISOString().slice(0, 16) : "",
    endAt: initialData?.endAt ? new Date(initialData.endAt).toISOString().slice(0, 16) : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        position: Number(formData.position),
        active: formData.active,
        startAt: formData.startAt ? new Date(formData.startAt).toISOString() : undefined,
        endAt: formData.endAt ? new Date(formData.endAt).toISOString() : undefined,
      };

      if (isEdit) {
        await updateAdminBanner(initialData.id, payload, { accessToken, username, userId });
      } else {
        await createAdminBanner(payload, { accessToken, username, userId });
      }

      router.push("/admin/sales/banners");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới ${MAX_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }

    setError("");
    setUploadingImage(true);
    try {
      const url = await uploadAdminBannerImage(file, { accessToken });
      setFormData({ ...formData, imageUrl: url });
    } catch (err: any) {
      setError(err.message || "Lỗi upload ảnh");
    } finally {
      setUploadingImage(false);
    }
  };

  // Quick date presets
  const applyDatePreset = (days?: number) => {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 16);
    if (!days) {
      setFormData({ ...formData, startAt: nowStr, endAt: "" });
      return;
    }
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    setFormData({
      ...formData,
      startAt: nowStr,
      endAt: end.toISOString().slice(0, 16),
    });
  };

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-xl relative">
      <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <span className="material-symbols-outlined text-3xl">panorama</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black text-slate-900 dark:text-white">
                {isEdit ? "Cập nhật Banner Quảng Cáo" : "Tạo Banner Mới"}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Thiết lập hình ảnh, link chuyển hướng và lịch hiển thị chiến dịch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Tỉ lệ khuyến nghị:</span>
            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              16:9 hoặc 1920x600px
            </span>
          </div>
        </div>

        {error && (
          <div className="animate-in fade-in slide-in-from-top-4 flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-5 text-sm text-rose-800 dark:text-rose-200 backdrop-blur-md">
            <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">error</span>
            <span>{error.replace("VALIDATION:", "")}</span>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          {/* Title */}
          <div className="group sm:col-span-2">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-indigo-600">
              Tiêu đề Banner <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Sale mùa hè rực rỡ - Giảm tới 50%..."
            />
          </div>

          {/* Image URL & Upload */}
          <div className="group sm:col-span-2">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-indigo-600">
              Hình ảnh Banner (URL hoặc Tải lên từ máy) <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-indigo-500">
                  image
                </span>
                <input
                  required
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://... hoặc tải ảnh trực tiếp bên phải"
                />
              </div>
              <div className="relative flex h-[50px] shrink-0 items-center overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                  disabled={uploadingImage}
                />
                <button
                  type="button"
                  className="flex h-full w-full items-center justify-center gap-2 bg-white dark:bg-zinc-800 px-5 text-sm font-bold text-slate-700 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-zinc-700 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {uploadingImage ? "sync" : "upload"}
                  </span>
                  <span>{uploadingImage ? "Đang tải..." : "Tải ảnh từ máy"}</span>
                </button>
              </div>
            </div>

            {/* LIVE DEVICE MOCKUP PREVIEW */}
            {formData.imageUrl && (
              <div className="mt-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/60 dark:bg-zinc-900/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-indigo-500">
                      visibility
                    </span>
                    Xem trước hiển thị thực tế:
                  </span>
                  <div className="inline-flex rounded-xl bg-white dark:bg-zinc-800 p-0.5 border border-slate-200 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setPreviewTab("desktop")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "desktop"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTab("mobile")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        previewTab === "mobile"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  {previewTab === "desktop" ? (
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 shadow-md bg-zinc-950 aspect-[16/7] relative">
                      <img
                        src={resolveCatalogImageUrl(formData.imageUrl)}
                        alt="Banner Preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-3 left-4 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white border border-white/20">
                        {formData.title || "Tiêu đề banner"}
                      </div>
                    </div>
                  ) : (
                    <div className="w-[280px] overflow-hidden rounded-3xl border-4 border-slate-700 shadow-lg bg-zinc-950 aspect-[16/9] relative">
                      <img
                        src={resolveCatalogImageUrl(formData.imageUrl)}
                        alt="Banner Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Link URL */}
          <div className="group sm:col-span-2">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-indigo-600">
              Đường dẫn đích (URL khi khách hàng bấm vào)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-indigo-500">
                link
              </span>
              <input
                type="text"
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="/products?category=dien-thoai hoặc https://..."
              />
            </div>
          </div>

          {/* Position */}
          <div className="group">
            <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors group-focus-within:text-indigo-600">
              Vị trí thứ tự ưu tiên (Số nhỏ hiển thị trước)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-indigo-500">
                format_list_numbered
              </span>
              <input
                required
                type="number"
                min="0"
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-5 py-3.5 transition-all">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-500 focus:outline-none"
              />
              <span className="material-symbols-outlined pointer-events-none absolute text-[14px] text-white opacity-0 transition-opacity peer-checked:opacity-100">
                check
              </span>
            </div>
            <label
              htmlFor="active"
              className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300"
            >
              Kích hoạt hiển thị ngay trên Storefront
            </label>
          </div>

          {/* Schedule Presets & Inputs */}
          <div className="sm:col-span-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lịch trình thời gian chạy chiến dịch
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyDatePreset()}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                >
                  Không giới hạn
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(7)}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                >
                  7 ngày
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(14)}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                >
                  14 ngày
                </button>
                <button
                  type="button"
                  onClick={() => applyDatePreset(30)}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-200"
                >
                  1 tháng
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="group">
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Từ ngày (Bắt đầu)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-5 py-3 text-xs font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 shadow-sm"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                />
              </div>

              <div className="group">
                <label className="mb-1.5 block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Đến ngày (Kết thúc)
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-5 py-3 text-xs font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 shadow-sm"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-slate-200/80 dark:border-white/10">
          <Link
            href="/admin/sales/banners"
            className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-800 px-6 py-3 text-sm font-bold text-slate-700 dark:text-white shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-700"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/35 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {loading ? "Đang lưu..." : isEdit ? "Cập nhật Banner" : "Lưu Banner"}
          </button>
        </div>
      </form>
    </section>
  );
}
