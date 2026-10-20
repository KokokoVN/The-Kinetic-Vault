"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  ArrowLeft,
  Save,
  Trash2,
  Archive,
  Eye,
  CheckCircle2,
  Clock,
  History,
  AlertTriangle,
  UploadCloud,
  X,
  Globe,
  Award,
  Layers,
  Package,
  ExternalLink
} from "lucide-react";

export default function StaticBrandEditPage() {
  const [name, setName] = useState("Sony Corporation");
  const [code, setCode] = useState("SONY");
  const [country, setCountry] = useState("Nhật Bản");
  const [established, setEstablished] = useState("1946");
  const [website, setWebsite] = useState("https://sony.com.vn");
  const [status, setStatus] = useState<"active" | "hidden">("active");
  const [description, setDescription] = useState(
    "Tập đoàn điện tử và giải trí hàng đầu Nhật Bản, sở hữu dòng tai nghe chống ồn 1000X, máy chơi game PlayStation 5 và cảm biến máy ảnh Alpha đỉnh cao thế giới."
  );
  const [logoUrl, setLogoUrl] = useState(
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("💾 Đã lưu thay đổi thông tin thương hiệu thành công!");
  };

  const handleToggleHide = () => {
    const next = status === "hidden" ? "active" : "hidden";
    setStatus(next);
    showToast(`Đã ${next === "hidden" ? "ẩn thương hiệu khỏi storefront" : "kích hoạt thương hiệu"}!`);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Chỉnh Sửa Thương Hiệu (Giao Diện Chỉnh Sửa - Brand Edit View)"
        subtitle="Mẫu form chỉnh sửa thương hiệu phân phối: Dữ liệu mẫu Sony Corp điền sẵn, thay đổi logo đại diện, trạng thái hợp đồng, vùng thao tác nguy hiểm (Danger Zone) và nhật ký cập nhật."
        module="brands"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5" />
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
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {code}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                <span>🇯🇵</span>
                <span>Nhật Bản</span>
              </span>
              <span className="text-[11px] text-slate-400">24 sản phẩm liên kết</span>
            </div>
            <h1 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Chỉnh Sửa: {name}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/showcase/brands/show"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Xem Hồ Sơ Hãng</span>
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main 8 Columns */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
              <Award className="h-4 w-4 text-indigo-500" />
              1. Thông Tin Nhận Diện
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Tên thương hiệu</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Mã thương hiệu (Code)</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono font-bold uppercase text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Năm thành lập</label>
                  <input
                    type="text"
                    value={established}
                    onChange={(e) => setEstablished(e.target.value)}
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
                    <option value="Nhật Bản">Nhật Bản 🇯🇵</option>
                    <option value="Hoa Kỳ">Hoa Kỳ 🇺🇸</option>
                    <option value="Thụy Sĩ">Thụy Sĩ 🇨🇭</option>
                    <option value="Hàn Quốc">Hàn Quốc 🇰🇷</option>
                    <option value="Đức">Đức 🇩🇪</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Website chính thức</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Mô tả giới thiệu</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 leading-relaxed text-slate-900 outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-3xl border border-rose-500/20 bg-rose-50/20 p-6 shadow-sm dark:border-rose-500/10 dark:bg-rose-950/20 space-y-4">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Khu Vực Nguy Hiểm (Danger Zone)
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {status === "hidden" ? "Thương hiệu hiện đang bị ẩn" : "Ẩn thương hiệu"}
                </div>
                <div className="text-[11px] text-slate-400">Tạm ẩn logo và bộ lọc thương hiệu này trên Storefront.</div>
              </div>
              <button
                type="button"
                onClick={handleToggleHide}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {status === "hidden" ? "Hiện Lại Hãng" : "Ẩn Khỏi Storefront"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rose-200/50 pt-3 dark:border-white/5">
              <div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Xóa thương hiệu</div>
                <div className="text-[11px] text-slate-400">Chuyển thương hiệu vào danh sách đã xóa.</div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(true)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
              >
                Xóa Thương Hiệu
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar 4 Columns */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Logo Thương Hiệu
            </h3>

            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-zinc-950">
              <img src={logoUrl} alt="Sony Logo" className="h-full w-full object-contain" />
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => showToast("Mở hộp thoại tải logo mới...")}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-200"
              >
                Thay Đổi Logo
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thông Tin Đối Tác
            </h3>
            <div className="space-y-2 text-slate-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Số sản phẩm:</span>
                <span className="font-bold text-slate-900 dark:text-white">24 SP</span>
              </div>
              <div className="flex justify-between">
                <span>Cấp đại lý:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Ủy Quyền Chính Thức</span>
              </div>
              <div className="flex justify-between">
                <span>Hợp đồng:</span>
                <span className="font-bold text-emerald-600">Còn hiệu lực</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* CONFIRM DELETE MODAL */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Xác nhận xóa thương hiệu?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Thương hiệu "{name}" sẽ được chuyển vào thùng rác. Các sản phẩm thuộc thương hiệu này sẽ không bị xóa.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteModal(false);
                  showToast("Đã xóa thương hiệu mẫu thành công!");
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
