"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAdminBanner, updateAdminBanner, uploadAdminBannerImage, type PromoBanner } from "@/lib/sale-api";
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
    
    // Kiểm tra dung lượng (giới hạn 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Dung lượng ảnh quá lớn. Vui lòng chọn ảnh dưới ${MAX_SIZE_MB}MB.`);
      // Xoá file đã chọn trong input (để người dùng có thể chọn lại đúng file đó nếu muốn)
      e.target.value = '';
      return;
    }

    setError(""); // Xoá lỗi cũ nếu có
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

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white shadow-xl shadow-purple-900/40 shadow-2xl backdrop-blur-xl relative">
      <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      <form onSubmit={handleSubmit} className="p-8 space-y-12">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-blue-500/30">
              <span className="material-symbols-outlined text-3xl">panorama</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black text-white">{isEdit ? "Cập nhật Banner" : "Tạo Banner Mới"}</h2>
              <p className="mt-1 text-sm font-medium text-slate-400">Thiết lập hình ảnh và thông tin chuyển hướng quảng cáo</p>
            </div>
          </div>
        </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-4 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/80 p-5 text-sm text-red-700 backdrop-blur-md">
          <span className="material-symbols-outlined">error</span>
          <span>{error.replace("VALIDATION:", "")}</span>
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="group sm:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-300 transition-colors group-focus-within:text-amber-600">Tiêu đề Banner</label>
          <input
            required
            type="text"
            className="w-full rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 px-5 py-4 text-slate-300 outline-none ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white/5 backdrop-blur-xl text-slate-200 focus:ring-amber-400/20"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Sale mùa hè rực rỡ..."
          />
        </div>

        <div className="group sm:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-300 transition-colors group-focus-within:text-amber-600">Đường dẫn Hình ảnh (URL) hoặc Tải ảnh lên</label>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500">image</span>
              <input
                required
                type="text"
                className="w-full rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 py-4 pl-14 pr-5 text-slate-300 outline-none ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white/5 backdrop-blur-xl text-slate-200 focus:ring-amber-400/20"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="relative flex h-[58px] shrink-0 items-center overflow-hidden rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 z-10 cursor-pointer opacity-0"
                disabled={uploadingImage}
              />
              <button
                type="button"
                className="flex h-full w-full items-center justify-center gap-2 bg-white/10 px-6 font-bold text-slate-400 transition-colors hover:bg-slate-200"
              >
                <span className="material-symbols-outlined">{uploadingImage ? 'sync' : 'upload'}</span>
                {uploadingImage ? 'Đang tải...' : 'Tải lên từ máy'}
              </button>
            </div>
          </div>
          {formData.imageUrl && (
            <div className="mt-6 flex justify-center">
              <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10/50 shadow-md">
                <img src={resolveCatalogImageUrl(formData.imageUrl)} alt="Banner Preview" className="h-40 w-full object-cover" />
              </div>
            </div>
          )}
        </div>

        <div className="group sm:col-span-2">
          <label className="mb-2 block text-sm font-bold text-slate-300 transition-colors group-focus-within:text-amber-600">Link Đích (URL)</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500">link</span>
            <input
              type="text"
              className="w-full rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 py-4 pl-14 pr-5 text-slate-300 outline-none ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white/5 backdrop-blur-xl text-slate-200 focus:ring-amber-400/20"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="/collections/summer-sale"
            />
          </div>
        </div>

        <div className="group">
          <label className="mb-2 block text-sm font-bold text-slate-300 transition-colors group-focus-within:text-amber-600">Vị trí (thứ tự hiển thị)</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-500">format_list_numbered</span>
            <input
              required
              type="number"
              min="0"
              className="w-full rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 py-4 pl-14 pr-5 text-slate-300 outline-none ring-4 ring-transparent transition-all placeholder:text-slate-400 focus:border-amber-400 focus:bg-white/5 backdrop-blur-xl text-slate-200 focus:ring-amber-400/20"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 px-5 py-4 transition-all hover:bg-white/5 backdrop-blur-xl text-slate-200/90">
          <div className="relative flex items-center justify-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-amber-500 checked:bg-amber-500 hover:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/20"
            />
            <span className="material-symbols-outlined pointer-events-none absolute text-[16px] text-white opacity-0 transition-opacity peer-checked:opacity-100">check</span>
          </div>
          <label htmlFor="active" className="cursor-pointer text-sm font-bold text-slate-300">Đang kích hoạt trên Storefront</label>
        </div>

        <div className="group">
          <label className="mb-2 block text-sm font-bold text-slate-300 transition-colors group-focus-within:text-amber-600">Từ ngày (Tùy chọn)</label>
          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 px-5 py-4 text-slate-300 outline-none ring-4 ring-transparent transition-all focus:border-amber-400 focus:bg-white/5 backdrop-blur-xl text-slate-200 focus:ring-amber-400/20"
            value={formData.startAt}
            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
          />
        </div>

        <div className="group">
          <label className="mb-2 block text-sm font-bold text-slate-300 transition-colors group-focus-within:text-amber-600">Đến ngày (Tùy chọn)</label>
          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-white/10/60 bg-white/5 backdrop-blur-xl text-slate-200/60 px-5 py-4 text-slate-300 outline-none ring-4 ring-transparent transition-all focus:border-amber-400 focus:bg-white/5 backdrop-blur-xl text-slate-200 focus:ring-amber-400/20"
            value={formData.endAt}
            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
          />
        </div>
      </div>

        <div className="flex items-center justify-end gap-4 pt-6 mt-8 border-t border-white/10">
          <Link
            href="/admin/sales/banners"
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-400 transition-colors hover:bg-white/10 dark:hover:bg-slate-800"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-purple-600/30 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            {loading ? "Đang lưu..." : "Lưu banner"}
          </button>
        </div>
      </form>
    </section>
  );
}
