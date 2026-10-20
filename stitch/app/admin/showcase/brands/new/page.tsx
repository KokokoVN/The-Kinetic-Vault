"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Globe,
  Award,
  Sparkles,
  CheckCircle,
  Building2,
  Calendar,
  X,
  Wand2
} from "lucide-react";

export default function StaticBrandNewPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("Hoa Kỳ");
  const [established, setEstablished] = useState("2024");
  const [website, setWebsite] = useState("https://");
  const [description, setDescription] = useState(
    "Hãng công nghệ tiên phong toàn cầu, cung cấp thiết bị phần cứng cao cấp chính hãng phân phối tại The Kinetic Vault."
  );
  const [logoPreview, setLogoPreview] = useState<string | null>(
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateCode = () => {
    if (!name.trim()) {
      showToast("Vui lòng nhập tên thương hiệu trước!");
      return;
    }
    const clean = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const generated = clean.substring(0, 4) || "BRND";
    setCode(generated);
    showToast(`Đã tự tạo mã: ${generated}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("🎉 Đã thêm mới đối tác thương hiệu thành công!");
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Thêm Mới Thương Hiệu (Giao Diện Tạo Mới - Brand New View)"
        subtitle="Mẫu form khởi tạo thương hiệu đối tác mới: Upload logo đại diện kéo thả, cấu hình xuất xứ quốc gia, tạo mã thương hiệu tự động và xem trước Google SEO snippet."
        module="brands"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/showcase/brands"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Khởi Tạo Đối Tác (Brand Wizard)
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Thêm Mới Thương Hiệu Phân Phối
            </h1>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("Đã lưu bản nháp thương hiệu.")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
          >
            Lưu Bản Nháp
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Khởi Tạo Thương Hiệu</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main 8 Columns */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
              <Award className="h-4 w-4 text-indigo-500" />
              1. Thông Tin Nhận Diện Thương Hiệu
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Tên thương hiệu đối tác <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Bose Corporation, Razer Inc., Sennheiser..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">Mã thương hiệu (Code)</label>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <Wand2 className="h-3 w-3" />
                      Tự tạo mã
                    </button>
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="BOSE"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono font-bold uppercase text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Năm thành lập</label>
                  <input
                    type="text"
                    value={established}
                    onChange={(e) => setEstablished(e.target.value)}
                    placeholder="1964"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-bold text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Quốc gia xuất xứ</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  >
                    <option value="Hoa Kỳ">Hoa Kỳ 🇺🇸</option>
                    <option value="Nhật Bản">Nhật Bản 🇯🇵</option>
                    <option value="Thụy Sĩ">Thụy Sĩ 🇨🇭</option>
                    <option value="Hàn Quốc">Hàn Quốc 🇰🇷</option>
                    <option value="Đức">Đức 🇩🇪</option>
                    <option value="Đài Loan">Đài Loan 🇹🇼</option>
                    <option value="Việt Nam">Việt Nam 🇻🇳</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Website chính thức</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://bose.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Mô tả giới thiệu hãng</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 leading-relaxed text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar 4 Columns */}
        <div className="space-y-6 lg:col-span-4">
          {/* Logo Dropzone Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Logo Thương Hiệu
            </h3>

            {logoPreview ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-zinc-950">
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={() => setLogoPreview(null)}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-rose-600"
                  title="Xóa logo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-white/10">
                <UploadCloud className="h-8 w-8 text-slate-400" />
                <p className="mt-2 text-xs font-bold text-slate-700 dark:text-zinc-300">Kéo thả file logo vào đây</p>
                <p className="mt-1 text-[11px] text-slate-400">Định dạng PNG/SVG nền trong suốt</p>
              </div>
            )}
          </div>

          {/* SEO Snippet Preview */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-blue-500" />
              Xem Trước Kết Quả Tìm Kiếm (SEO)
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-white/5 dark:bg-zinc-950">
              <div className="text-[11px] text-slate-400">
                https://thekineticvault.vn/brands/{(code || "brand").toLowerCase()}
              </div>
              <div className="mt-1 line-clamp-1 font-bold text-blue-600 hover:underline dark:text-blue-400">
                {name ? `${name} Chính Hãng - The Kinetic Vault` : "Tên thương hiệu sẽ hiển thị tại đây"}
              </div>
              <div className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-400">
                {description}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
