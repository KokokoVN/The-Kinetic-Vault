"use client";

import { useEffect, useState } from "react";
import { StoreContact, DEFAULT_STORE_CONTACT } from "@/lib/api";

export default function AdminStoreSettingsPage() {
  const [formData, setFormData] = useState<StoreContact>(DEFAULT_STORE_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/store-contact");
        if (res.ok) {
          const data = await res.json();
          setFormData((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load store contact", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/store-contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Lỗi khi lưu thông tin cửa hàng");
      }

      const updated = await res.json();
      setFormData((prev) => ({ ...prev, ...updated }));
      setFeedback({
        type: "success",
        message: "Đã lưu thông tin liên hệ và địa chỉ cửa hàng thành công!",
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Có lỗi xảy ra khi lưu thông tin.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <span className="material-symbols-outlined animate-spin text-3xl text-indigo-500">progress_activity</span>
          <p className="text-xs font-semibold">Đang tải thông tin cửa hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 text-slate-800 dark:text-zinc-100">
      {/* ==================== HERO HEADER CARD ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 dark:border-cyan-500/30 bg-blue-50/80 dark:bg-cyan-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400 backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]">storefront</span>
              System Configuration
            </p>
            <h1 className="mt-3 font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              Cài Đặt Cửa Hàng &amp; Liên Hệ
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Quản lý số điện thoại hotline, địa chỉ cơ sở, khung giờ làm việc và đồng bộ tự động lên toàn bộ chân trang cùng các kênh liên hệ trực tuyến.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 px-6 py-3.5 font-headline text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Đang lưu cấu hình...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>Lưu tất cả thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Config Stat Badges */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-white/10 pt-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-cyan-400">verified</span>
              <span>Tên cửa hàng</span>
            </div>
            <p className="mt-2 font-headline text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              {formData.storeName || "The Kinetic Vault"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">phone_in_talk</span>
              <span>Hotline CSKH</span>
            </div>
            <p className="mt-2 font-headline text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 truncate">
              {formData.hotline || "1900 6868"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">place</span>
              <span>Khu vực</span>
            </div>
            <p className="mt-2 font-headline text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400 truncate">
              {formData.province || "TP. Hồ Chí Minh"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px] text-cyan-600 dark:text-cyan-400">sync</span>
              <span>Đồng bộ</span>
            </div>
            <p className="mt-2 font-headline text-sm sm:text-base font-black text-cyan-600 dark:text-cyan-400">
              Toàn hệ thống
            </p>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-medium backdrop-blur-md transition-all ${
            feedback.type === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              : "border border-rose-500/20 bg-rose-500/10 text-rose-800 dark:text-rose-300"
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {feedback.type === "success" ? "check_circle" : "error"}
          </span>
          <p>{feedback.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main form columns (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Card 1: Thông tin cơ bản */}
          <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <span className="material-symbols-outlined text-xl">badge</span>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  1. Thông tin chung &amp; Hotline
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Tên thương hiệu nhận diện, các kênh liên lạc chính và slogan</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tên thương hiệu / Cửa hàng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="storeName"
                  required
                  value={formData.storeName || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: The Kinetic Vault Cyber Store"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hotline tổng đài (CSKH) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="hotline"
                  required
                  value={formData.hotline || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: 1900 6868"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Số điện thoại di động / Bàn
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0901 234 567"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hộp thư Email hỗ trợ
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: support@thekineticvault.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Giờ mở cửa / Thời gian làm việc
                </label>
                <input
                  type="text"
                  name="openingHours"
                  value={formData.openingHours || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: Thứ 2 - Chủ Nhật: 08:30 - 21:30"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mô tả ngắn gọn / Slogan cửa hàng
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description || ""}
                  onChange={handleChange}
                  placeholder="Giới thiệu nhanh hiển thị tại phần chân trang..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Địa chỉ & Định vị */}
          <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  2. Địa chỉ cửa hàng &amp; Google Maps
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Vị trí địa lý trụ sở chính và liên kết bản đồ điều hướng</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phường / Xã
                </label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward || ""}
                  onChange={handleChange}
                  placeholder="Phường Bến Nghé"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district || ""}
                  onChange={handleChange}
                  placeholder="Quận 1"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tỉnh / Thành phố
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province || ""}
                  onChange={handleChange}
                  placeholder="TP. Hồ Chí Minh"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đường dẫn vị trí Google Maps (URL)
                </label>
                <input
                  type="url"
                  name="googleMapsUrl"
                  value={formData.googleMapsUrl || ""}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Kênh Mạng xã hội & Chat */}
          <div className="rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                <span className="material-symbols-outlined text-xl">share</span>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  3. Kênh Mạng Xã Hội &amp; CSKH Trực Tuyến
                </h2>
                <p className="text-xs text-slate-400 dark:text-zinc-500">Kết nối các mạng xã hội chính thức để khách hàng liên hệ trực tiếp</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Số điện thoại Zalo Chat
                </label>
                <input
                  type="text"
                  name="zaloPhone"
                  value={formData.zaloPhone || ""}
                  onChange={handleChange}
                  placeholder="Ví dụ: 0901234567"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đường dẫn Facebook Fanpage
                </label>
                <input
                  type="text"
                  name="facebookUrl"
                  value={formData.facebookUrl || ""}
                  onChange={handleChange}
                  placeholder="https://facebook.com/thekineticvault"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đường dẫn Kênh TikTok
                </label>
                <input
                  type="text"
                  name="tiktokUrl"
                  value={formData.tiktokUrl || ""}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@thekineticvault"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đường dẫn Trang Instagram
                </label>
                <input
                  type="text"
                  name="instagramUrl"
                  value={formData.instagramUrl || ""}
                  onChange={handleChange}
                  placeholder="https://instagram.com/thekineticvault"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column (1 col) */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-cyan-400">
                <span className="material-symbols-outlined text-base">preview</span>
                Xem trước giao diện
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Hiển thị thực tế
              </span>
            </div>

            {/* Preview Box mimicking storefront footer widget */}
            <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 shadow-xs dark:border-white/5 dark:bg-zinc-900/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-md">
                  <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {formData.storeName || "Tên cửa hàng"}
                  </h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                    Cyber Flagship Store
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {formData.description || "Mô tả cửa hàng..."}
              </p>

              <div className="space-y-2.5 border-t border-slate-200/60 pt-3.5 text-xs text-slate-600 dark:border-white/5 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined shrink-0 text-base text-indigo-500 dark:text-cyan-400">location_on</span>
                  <span className="leading-snug">{formData.address || "Chưa nhập địa chỉ"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined shrink-0 text-base text-indigo-500 dark:text-cyan-400">call</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formData.hotline || formData.phoneNumber || "Chưa nhập hotline"}
                  </span>
                </div>

                {formData.email && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined shrink-0 text-base text-indigo-500 dark:text-cyan-400">mail</span>
                    <span>{formData.email}</span>
                  </div>
                )}

                {formData.openingHours && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined shrink-0 text-base text-indigo-500 dark:text-cyan-400">schedule</span>
                    <span>{formData.openingHours}</span>
                  </div>
                )}
              </div>

              {/* Social badges in preview */}
              <div className="flex flex-wrap gap-2 border-t border-slate-200/60 pt-3 dark:border-white/5">
                {formData.facebookUrl && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    Facebook
                  </span>
                )}
                {formData.zaloPhone && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                    Zalo {formData.zaloPhone}
                  </span>
                )}
                {formData.tiktokUrl && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-600 dark:bg-pink-950/40 dark:text-pink-400">
                    TikTok
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">Ghi chú:</span> Mọi thay đổi lưu tại đây sẽ lập tức có hiệu lực và đồng bộ lên toàn bộ chân trang (footer) cùng các kênh liên hệ trực tuyến của khách hàng.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
