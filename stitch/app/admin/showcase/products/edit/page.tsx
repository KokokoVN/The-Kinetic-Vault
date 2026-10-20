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
  Plus,
  Layers,
  DollarSign,
  Package,
  Cpu,
  FileText,
  RotateCcw,
  Sparkles
} from "lucide-react";

export default function StaticProductEditPage() {
  // Pre-filled Form States
  const [productName, setProductName] = useState(
    "Tai nghe chống ồn Sony WH-1000XM5 Wireless Hi-Res Audio"
  );
  const [sku, setSku] = useState("SN-WH1000XM5-SLV");
  const [category, setCategory] = useState("Tai nghe & Âm thanh");
  const [brand, setBrand] = useState("Sony");
  const [price, setPrice] = useState<number>(8490000);
  const [originalPrice, setOriginalPrice] = useState<number>(9990000);
  const [costPrice, setCostPrice] = useState<number>(6800000);
  const [stock, setStock] = useState<number>(6);
  const [status, setStatus] = useState<"in_stock" | "low_stock" | "hidden">("low_stock");
  const [description, setDescription] = useState(
    "Tai nghe chụp tai flagship đầu bảng của Sony với 2 bộ xử lý chuyên dụng V1 và QN1 kiểm soát 8 micro chống ồn đỉnh cao. Thời lượng pin 30 giờ, công nghệ đàm thoại AI Precise Voice Pickup và chất âm Hi-Res Audio chuẩn phòng thu."
  );

  // Gallery
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
  ]);

  // Variants
  const [variants, setVariants] = useState([
    { id: "1", color: "Bạc (Silver)", sku: "SN-WH1000XM5-SLV", price: 8490000, stock: 4 },
    { id: "2", color: "Đen (Black)", sku: "SN-WH1000XM5-BLK", price: 8490000, stock: 2 },
    { id: "3", color: "Xanh Midnight", sku: "SN-WH1000XM5-MID", price: 8990000, stock: 0 },
  ]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("💾 Đã cập nhật thông tin sản phẩm và đồng bộ kho hàng thành công!");
  };

  const handleToggleHide = () => {
    const next = status === "hidden" ? "in_stock" : "hidden";
    setStatus(next);
    showToast(`Đã ${next === "hidden" ? "ẩn sản phẩm khỏi storefront" : "kích hoạt hiển thị sản phẩm"}!`);
  };

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <div className="space-y-6 pb-28">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Chỉnh Sửa Sản Phẩm (Giao Diện Chỉnh Sửa - Edit View)"
        subtitle="Mẫu form chỉnh sửa sản phẩm toàn diện: Dữ liệu được điền sẵn sống động, thanh lịch sử thay đổi (Audit Log), quản lý kho đa chi nhánh, và khối thao tác bảo mật nguy hiểm (Danger Zone)."
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/showcase/products"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">
                {sku}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                Phiên bản v4.2
              </span>
              <span className="text-[11px] text-slate-400">Sửa 2 giờ trước bởi Admin Thu Hà</span>
            </div>
            <h1 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Chỉnh Sửa: {productName}
            </h1>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/showcase/products/show"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Xem Trang Chi Tiết</span>
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:brightness-110 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Form Layout */}
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Main Form & Variants (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* SECTION 1: Product Core Info */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
              <FileText className="h-4 w-4 text-cyan-500" />
              1. Thông Tin Nhận Diện
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Tên sản phẩm niêm yết</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Mã SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono font-bold uppercase text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  >
                    <option value="Tai nghe & Âm thanh">Tai nghe & Âm thanh</option>
                    <option value="Laptop & Macbook">Laptop & Macbook</option>
                    <option value="Màn hình đồ họa">Màn hình đồ họa</option>
                    <option value="Bàn phím & Chuột">Bàn phím & Chuột</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">Hãng sản xuất</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  >
                    <option value="Sony">Sony Corporation</option>
                    <option value="Apple">Apple Inc.</option>
                    <option value="Dell">Dell Technologies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Mô tả sản phẩm</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 leading-relaxed text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Media Management */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
              <UploadCloud className="h-4 w-4 text-cyan-500" />
              2. Quản Lý Thư Viện Hình Ảnh
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-zinc-900"
                >
                  <img src={src} alt={`edit-thumb-${idx}`} className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-cyan-500 px-2 py-0.5 text-[9px] font-extrabold text-slate-950">
                      ẢNH ĐẠI DIỆN
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-rose-600 group-hover:opacity-100"
                    title="Xóa ảnh"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setImages([
                    ...images,
                    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
                  ]);
                  showToast("Đã thêm 1 ảnh mẫu mới vào thư viện");
                }}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:border-white/10"
              >
                <Plus className="h-5 w-5" />
                <span className="mt-1 text-[11px] font-bold">+ Thêm ảnh</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: Color Variants Matrix */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/5">
              <Layers className="h-4 w-4 text-cyan-500" />
              3. Quản Lý Biến Thể Sản Phẩm
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 dark:border-white/5">
                  <tr>
                    <th className="pb-3">Màu Sắc</th>
                    <th className="pb-3">Mã SKU Phụ</th>
                    <th className="pb-3 text-right">Đơn Giá</th>
                    <th className="pb-3 text-center">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {variants.map((v) => (
                    <tr key={v.id}>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{v.color}</td>
                      <td className="py-3 font-mono text-cyan-600 dark:text-cyan-400">{v.sku}</td>
                      <td className="py-3 text-right font-extrabold">{formatVnd(v.price)}</td>
                      <td className="py-3 text-center font-bold">{v.stock} chiếc</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: Danger Zone */}
          <div className="rounded-3xl border border-rose-500/20 bg-rose-50/20 p-6 shadow-sm dark:border-rose-500/10 dark:bg-rose-950/20 space-y-4">
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Khu Vực Nguy Hiểm (Danger Zone)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Các thao tác này sẽ ảnh hưởng trực tiếp đến trạng thái kinh doanh của sản phẩm trên Storefront.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {status === "hidden" ? "Sản phẩm hiện đang bị ẩn" : "Ẩn khỏi cửa hàng"}
                </div>
                <div className="text-[11px] text-slate-400">Khách hàng sẽ không tìm thấy sản phẩm này trên website.</div>
              </div>
              <button
                type="button"
                onClick={handleToggleHide}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {status === "hidden" ? "Hiện Lại Sản Phẩm" : "Ẩn Sản Phẩm"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rose-200/50 pt-3 dark:border-white/5">
              <div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Xóa sản phẩm này</div>
                <div className="text-[11px] text-slate-400">Chuyển vào thùng rác lưu trữ (Soft delete).</div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(true)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
              >
                Xóa Sản Phẩm
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pricing, Stock & Audit Log (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Pricing Config Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Thiết Lập Giá Bán
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Giá bán hiện tại (VND)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-extrabold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Giá niêm yết cũ (VND)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-3 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Lợi nhuận gộp ước tính: {formatVnd(price - costPrice)} / sản phẩm
              </div>
            </div>
          </div>

          {/* Stock Config Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-cyan-500" />
              Kiểm Soát Tồn Kho
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Tồn kho tổng hiện tại</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-white/5">
                <div className="flex justify-between text-slate-500">
                  <span>Kho Tổng Quận 1:</span>
                  <span className="font-bold text-slate-900 dark:text-white">4 chiếc</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Kho Chi Nhánh Hà Nội:</span>
                  <span className="font-bold text-slate-900 dark:text-white">2 chiếc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-500" />
              Nhật Ký Chỉnh Sửa Gần Nhất
            </h3>

            <div className="space-y-3 text-xs">
              <div className="border-l-2 border-cyan-500 pl-3">
                <div className="font-bold text-slate-900 dark:text-white">Cập nhật giá bán</div>
                <p className="text-[11px] text-slate-400">Giảm từ 8.990.000 ₫ xuống 8.490.000 ₫</p>
                <span className="text-[10px] text-slate-400">2 giờ trước • Admin Thu Hà</span>
              </div>

              <div className="border-l-2 border-slate-200 pl-3 dark:border-zinc-700">
                <div className="font-bold text-slate-900 dark:text-white">Nhập bổ sung 10 chiếc</div>
                <p className="text-[11px] text-slate-400">Phiếu nhập kho #INB-2026-904</p>
                <span className="text-[10px] text-slate-400">3 ngày trước • Thủ kho Lê Minh</span>
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
              Xác nhận xóa sản phẩm?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Sản phẩm "{productName}" sẽ được đưa vào thùng rác và không còn hiển thị cho người mua.
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
                  showToast("Đã xóa sản phẩm thành công!");
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
              >
                Đồng Ý Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar for fast action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Mẫu chỉnh sửa: Sẵn sàng áp dụng cho các module Admin khác</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/showcase/products"
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-200"
            >
              Hủy Thay Đổi
            </Link>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Lưu Thông Tin Sản Phẩm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
