"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  ArrowLeft,
  Save,
  Sparkles,
  UploadCloud,
  X,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Search,
  Eye,
  Layers,
  Sliders,
  DollarSign,
  Package,
  Cpu,
  Globe,
  Tag,
  Wand2
} from "lucide-react";

export default function StaticProductNewPage() {
  // Form States
  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("1");
  const [brand, setBrand] = useState("Apple");
  const [price, setPrice] = useState<number>(32990000);
  const [originalPrice, setOriginalPrice] = useState<number>(35990000);
  const [costPrice, setCostPrice] = useState<number>(27500000);
  const [stock, setStock] = useState<number>(25);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [description, setDescription] = useState(
    "Sản phẩm công nghệ thế hệ mới chính hãng, tích hợp chip xử lý hiệu năng đỉnh cao, thiết kế nguyên khối sang trọng và chế độ bảo hành 12 tháng 1 đổi 1."
  );

  // Uploaded media mock list
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
  ]);

  // Specifications
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "Vi xử lý (CPU)", value: "Apple M3 Pro 12-core" },
    { key: "Bộ nhớ RAM", value: "18GB Unified Memory" },
    { key: "Ổ cứng", value: "512GB PCIe NVMe SSD" },
    { key: "Màn hình", value: "14.2 inch Liquid Retina XDR 120Hz" },
  ]);

  // Variants Generator Matrix
  const [colors, setColors] = useState<string[]>(["Space Black", "Silver"]);
  const [capacities, setCapacities] = useState<string[]>(["512GB", "1TB"]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateSku = () => {
    const brandPrefix = (brand.substring(0, 3) || "PROD").toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newSku = `${brandPrefix}-GEN-${randomCode}`;
    setSku(newSku);
    showToast(`Đã tự động tạo mã SKU: ${newSku}`);
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    const next = [...specs];
    next[idx][field] = val;
    setSpecs(next);
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("🎉 Đã xuất bản sản phẩm mẫu thành công vào danh mục!");
  };

  const discountPercent =
    originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const profitMargin =
    price > costPrice ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price - costPrice) : "0 ₫";

  return (
    <div className="space-y-6 pb-28">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Thêm Mới Sản Phẩm (Giao Diện Tạo Mới - New View)"
        subtitle="Mẫu form tạo mới sản phẩm chuẩn thương mại điện tử chuyên nghiệp: Trình tạo mã SKU thông minh, upload media kéo thả, bộ tạo biến thể tự động và xem trước Google SEO snippet."
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
            href="/admin/showcase/products"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Biểu Mẫu Tạo Mới (Create Wizard)
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Thêm Mới Sản Phẩm Công Nghệ
            </h1>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast("Đã lưu bản nháp vào hệ thống.")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
          >
            Lưu Bản Nháp
          </button>
          <button
            type="button"
            onClick={handleMockSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Xuất Bản Sản Phẩm</span>
          </button>
        </div>
      </div>

      {/* FORM SECTIONS (Grid Layout) */}
      <form onSubmit={handleMockSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT MAIN COLUMN: Basic Info, Media, Variants, Specs (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* SECTION 1: Basic Information */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-cyan-500" />
                1. Thông Tin Nhận Diện Sản Phẩm
              </h3>
              <span className="text-[11px] text-slate-400">* Bắt buộc điền</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ví dụ: MacBook Pro 14 inch M3 Pro (18GB / 512GB SSD) - Space Black..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-zinc-300">
                      Mã SKU <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:underline dark:text-cyan-400"
                    >
                      <Wand2 className="h-3 w-3" />
                      Tự tạo SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="MBP14-M3PRO-BLK"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs font-semibold uppercase text-slate-900 outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Thương hiệu <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  >
                    <option value="Apple">Apple Inc.</option>
                    <option value="Sony">Sony Corporation</option>
                    <option value="Dell">Dell Technologies</option>
                    <option value="Logitech">Logitech</option>
                    <option value="Keychron">Keychron</option>
                    <option value="Samsung">Samsung Electronics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Mô tả tóm tắt sản phẩm
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-900 outline-none focus:border-cyan-500 focus:bg-white dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Media Gallery Upload */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-cyan-500" />
                2. Hình Ảnh & Video Sản Phẩm
              </h3>
              <span className="text-[11px] text-slate-400">Tối đa 10 ảnh (JPG, PNG, WebP)</span>
            </div>

            {/* Dropzone */}
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-colors hover:border-cyan-500 hover:bg-cyan-50/20 dark:border-white/10 dark:bg-zinc-950/40">
              <UploadCloud className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
              <p className="mt-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                Kéo thả hình ảnh vào đây, hoặc <span className="text-cyan-600 dark:text-cyan-400 underline">duyệt từ máy</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Độ phân giải tối ưu 1200 x 800px, dung lượng tối đa 10MB/ảnh</p>
            </div>

            {/* Current Uploaded Thumbnails */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-zinc-900"
                >
                  <img src={src} alt={`upload-${idx}`} className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-md bg-cyan-500 px-2 py-0.5 text-[9px] font-extrabold text-slate-950">
                      ẢNH CHÍNH
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
            </div>
          </div>

          {/* SECTION 3: Dynamic Specifications Builder */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="h-4 w-4 text-cyan-500" />
                3. Bảng Thông Số Kỹ Thuật (Key - Value)
              </h3>
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:underline dark:text-cyan-400"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm thông số
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {specs.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                    placeholder="Tên thông số (vd: CPU)"
                    className="w-1/3 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 font-bold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                    placeholder="Giá trị (vd: Apple M3 Pro)"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="rounded-lg p-2 text-slate-400 hover:text-rose-500"
                    title="Xóa dòng"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Pricing, Stock, Category, SEO Snippet (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Pricing Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Thiết Lập Giá Bán
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Giá bán niêm yết (VND) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-extrabold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Giá gốc trước giảm (VND)
                </label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
                {discountPercent > 0 && (
                  <span className="mt-1 inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Giảm {discountPercent}% so với giá gốc
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Giá vốn nhập kho (Cost Price)
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-slate-900 outline-none focus:border-cyan-500 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                />
                <div className="mt-1 text-[11px] text-slate-400">
                  Lợi nhuận gộp ước tính: <span className="font-bold text-emerald-600">{profitMargin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Setup */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Package className="h-4 w-4 text-cyan-500" />
              Khởi Tạo Tồn Kho
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Số lượng nhập ban đầu
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  min="0"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Ngưỡng cảnh báo sắp hết
                </label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Google Search SEO Snippet Preview */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-blue-500" />
              Xem Trước Kết Quả Tìm Kiếm (SEO)
            </h3>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-white/5 dark:bg-zinc-950">
              <div className="text-[11px] text-slate-400">https://thekineticvault.vn/products/{sku.toLowerCase() || "slug"}</div>
              <div className="mt-1 line-clamp-1 font-bold text-blue-600 hover:underline dark:text-blue-400">
                {productName || "Tên sản phẩm sẽ hiển thị tại đây"}
              </div>
              <div className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-400">
                {description}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Sticky Bottom Bar for fast action */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chế độ: Bản dựng giao diện tĩnh siêu tốc</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/showcase/products"
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-200"
            >
              Hủy Bỏ
            </Link>
            <button
              onClick={handleMockSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Xuất Bản Sản Phẩm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
