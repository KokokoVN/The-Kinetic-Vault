"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  ArrowLeft,
  Edit3,
  Package,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Truck,
  Eye,
  ExternalLink,
  Archive,
  BarChart3,
  Calendar,
  Share2,
  Cpu,
  HardDrive,
  Monitor,
  Zap,
  Star,
  Check,
  PlusCircle,
  FileText,
  AlertCircle
} from "lucide-react";

export default function StaticProductShowPage() {
  const [activeTab, setActiveTab] = useState<"specs" | "variants" | "inventory" | "reviews">("specs");
  const [selectedImage, setSelectedImage] = useState(0);
  const [inboundModalOpen, setInboundModalOpen] = useState(false);
  const [inboundQuantity, setInboundQuantity] = useState("10");
  const [inboundNote, setInboundNote] = useState("Nhập bổ sung đợt khuyến mãi Q4");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const images = [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1200&q=80",
  ];

  const variants = [
    {
      id: "var-1",
      sku: "MBP16-M3MAX-BLK-36-1T",
      title: "Space Black • 36GB RAM • 1TB SSD",
      price: 89990000,
      stock: 14,
      costPrice: 76500000,
      status: "Sẵn hàng",
    },
    {
      id: "var-2",
      sku: "MBP16-M3MAX-SLV-36-1T",
      title: "Silver • 36GB RAM • 1TB SSD",
      price: 89990000,
      stock: 10,
      costPrice: 76500000,
      status: "Sẵn hàng",
    },
    {
      id: "var-3",
      sku: "MBP16-M3MAX-BLK-48-1T",
      title: "Space Black • 48GB RAM • 1TB SSD",
      price: 99990000,
      stock: 4,
      costPrice: 85000000,
      status: "Sắp hết",
    },
    {
      id: "var-4",
      sku: "MBP16-M3MAX-BLK-128-4T",
      title: "Space Black • 128GB RAM • 4TB SSD (CTO)",
      price: 154990000,
      stock: 2,
      costPrice: 135000000,
      status: "Hàng hiếm",
    },
  ];

  const inventoryLogs = [
    {
      id: "log-1",
      date: "Hôm nay, 10:24",
      type: "Nhập kho (Inbound)",
      quantity: "+10",
      actor: "Admin Hoàng Nam",
      note: "Lô hàng phân phối chính hãng Synnex FPT",
    },
    {
      id: "log-2",
      date: "08/10/2026, 15:40",
      type: "Xuất bán (Order #ORD-8842)",
      quantity: "-1",
      actor: "Hệ thống tự động",
      note: "Khách hàng Nguyễn Văn An (TP.HCM)",
    },
    {
      id: "log-3",
      date: "05/10/2026, 09:12",
      type: "Kiểm kê định kỳ",
      quantity: "Khớp 100%",
      actor: "Thủ kho Lê Minh",
      note: "Kiểm đếm serial và seal nguyên vẹn",
    },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMockInbound = (e: React.FormEvent) => {
    e.preventDefault();
    setInboundModalOpen(false);
    showToast(`Đã ghi nhận phiếu nhập +${inboundQuantity} sản phẩm thành công!`);
  };

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Chi Tiết Sản Phẩm (Giao Diện Xem Chi Tiết - Show View)"
        subtitle="Mẫu giao diện xem thông tin sản phẩm chuyên sâu: Bộ sưu tập media, cấu hình phần cứng, bảng ma trận biến thể, quản trị tồn kho và phân tích tài chính."
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
                MBP16-M3MAX-BLK
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đang Kinh Doanh
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                Chính hãng SA/A
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              MacBook Pro 16 inch M3 Max (36GB / 1TB SSD) - Space Black
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setInboundModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Nhập Kho Nhanh</span>
          </button>

          <Link
            href="/admin/showcase/products/edit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:brightness-110 active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            <span>Chỉnh Sửa Sản Phẩm</span>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Gallery & Tabs (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Gallery Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-950">
              <img
                src={images[selectedImage]}
                alt="Product preview"
                className="h-full w-full object-cover transition-all duration-500"
              />
              <div className="absolute left-3 top-3 flex items-center gap-2">
                <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                  Ảnh {selectedImage + 1} / {images.length}
                </span>
                <span className="rounded-full bg-cyan-500/90 px-3 py-1 text-xs font-bold text-slate-950 backdrop-blur-md">
                  Màu Space Black
                </span>
              </div>
            </div>

            {/* Thumbnail Selectors */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === idx
                      ? "border-cyan-500 ring-2 ring-cyan-500/30"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Hardware Specs Ribbon */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Vi xử lý</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Apple M3 Max 14-core</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Bộ nhớ RAM</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">36GB Unified 300GB/s</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Màn hình</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">16.2" Liquid XDR 120Hz</div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Thời lượng pin</div>
                <div className="text-xs font-extrabold text-slate-900 dark:text-white">Lên đến 22 giờ liên tục</div>
              </div>
            </div>
          </div>

          {/* Interactive Tabs Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
            {/* Tab Nav Buttons */}
            <div className="flex border-b border-slate-200/80 px-6 dark:border-white/10">
              {[
                { key: "specs", label: "Thông Số & Mô Tả", icon: FileText },
                { key: "variants", label: `Biến Thể (${variants.length})`, icon: Layers },
                { key: "inventory", label: "Lịch Sử Kho Hàng", icon: Truck },
                { key: "reviews", label: "Đánh Giá (86)", icon: Star },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as any)}
                    className={`flex items-center gap-2 border-b-2 py-4 text-xs font-bold transition-colors ${
                      isActive
                        ? "border-cyan-500 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Specs & Overview */}
            {activeTab === "specs" && (
              <div className="p-6 space-y-6 text-xs text-slate-600 dark:text-zinc-300">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Giới thiệu sản phẩm</h3>
                  <p className="mt-2 leading-relaxed">
                    MacBook Pro 16 inch trang bị chip M3 Max mang lại hiệu năng đỉnh cao dành cho các tác vụ chuyên
                    sâu của lập trình viên, nhà sáng tạo mô hình 3D và dựng phim 8K ProRes. Vỏ nhôm nguyên khối Space Black
                    sử dụng công nghệ anod hóa đột phá giúp hạn chế bám dấu vân tay tối đa.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bảng thông số kỹ thuật chi tiết</h3>
                  <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 dark:divide-white/5 dark:border-white/10">
                    {[
                      ["Thương hiệu", "Apple Inc. (California, USA)"],
                      ["Model / SKU", "MacBook Pro 16 (Late 2023) - Space Black"],
                      ["Vi xử lý (CPU)", "Apple M3 Max (14 nhân CPU: 10 hiệu năng cao + 4 tiết kiệm điện)"],
                      ["Đồ họa (GPU)", "30 nhân GPU với Dynamic Caching, Ray Tracing phần cứng"],
                      ["Bộ nhớ RAM", "36GB Unified Memory"],
                      ["Ổ cứng lưu trữ", "1TB PCIe NVMe SSD tốc độ đọc 7,400 MB/s"],
                      ["Màn hình", "16.2-inch Liquid Retina XDR (3456 x 2234), độ sáng 1600 nits, ProMotion 120Hz"],
                      ["Cổng kết nối", "3x Thunderbolt 4 / USB-C, 1x HDMI 2.1 8K, Khe thẻ SDXC, MagSafe 3, Jack 3.5mm"],
                      ["Trọng lượng", "2.16 kg"],
                      ["Hệ điều hành", "macOS Sonoma / macOS Sequoia tương thích hoàn hảo"],
                    ].map(([k, v], idx) => (
                      <div key={idx} className="flex justify-between p-3">
                        <span className="font-semibold text-slate-400">{k}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Variants */}
            {activeTab === "variants" && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-white/5">
                      <tr>
                        <th className="pb-3">Cấu Hình / Thuộc Tính</th>
                        <th className="pb-3">Mã SKU Phụ</th>
                        <th className="pb-3 text-right">Giá Bán Lẻ</th>
                        <th className="pb-3 text-center">Tồn Kho</th>
                        <th className="pb-3 text-center">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {variants.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                          <td className="py-3.5 font-bold text-slate-900 dark:text-white">{v.title}</td>
                          <td className="py-3.5 font-mono text-cyan-600 dark:text-cyan-400">{v.sku}</td>
                          <td className="py-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                            {formatVnd(v.price)}
                          </td>
                          <td className="py-3.5 text-center font-bold">{v.stock} chiếc</td>
                          <td className="py-3.5 text-center">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: Inventory Movement Timeline */}
            {activeTab === "inventory" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Nhật ký biến động kho hàng gần đây</h4>
                  <span className="text-[11px] text-slate-400">Đồng bộ tức thời với Microservice Inventory</span>
                </div>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 dark:divide-white/5 dark:border-white/10">
                  {inventoryLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{log.type}</span>
                          <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-400">
                            ({log.quantity})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{log.note}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-700 dark:text-zinc-300">{log.actor}</div>
                        <div className="text-[11px] text-slate-400">{log.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Customer Reviews */}
            {activeTab === "reviews" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold">4.9</div>
                    <div className="flex justify-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-zinc-300">
                    <div className="font-bold">Đánh giá xuất sắc (86 nhận xét đã xác thực)</div>
                    <p className="mt-0.5 text-slate-400">100% khách hàng hài lòng về hiệu năng máy và chế độ đóng gói.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Financial, Stock & Audit Sidebar (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Pricing & Profit Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chỉ Số Giá & Biên Lợi Nhuận
            </h3>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400">Giá Bán Niêm Yết</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">89.990.000 ₫</div>
                <div className="text-[11px] text-slate-400 line-through">94.990.000 ₫ (Tiết kiệm 5.000.000 ₫)</div>
              </div>

              <div className="border-t border-slate-100 pt-3 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Giá Vốn Nhập Kho</span>
                  <span className="font-bold text-slate-700 dark:text-zinc-200">76.500.000 ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lợi Nhuận Gộp / Máy</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +13.490.000 ₫ (14.9%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Health Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sức Khỏe Tồn Kho
            </h3>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tồn kho khả dụng</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">24 chiếc</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Đang được đặt giữ hàng</span>
                <span className="font-bold text-slate-700 dark:text-zinc-200">3 chiếc</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ngưỡng cảnh báo min</span>
                <span className="font-bold text-amber-500">5 chiếc</span>
              </div>

              <div className="pt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <div className="h-full w-4/5 rounded-full bg-emerald-500" />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                  <span>An toàn</span>
                  <span>Đủ hàng cho 25 ngày tới</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance & Audit Trail */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thông Tin Quản Trị
            </h3>

            <div className="space-y-2.5 text-slate-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Người tạo:</span>
                <span className="font-semibold text-slate-900 dark:text-white">Admin Hoàng Nam</span>
              </div>
              <div className="flex justify-between">
                <span>Ngày tạo:</span>
                <span className="font-semibold text-slate-900 dark:text-white">15/09/2026</span>
              </div>
              <div className="flex justify-between">
                <span>Lần sửa cuối:</span>
                <span className="font-semibold text-slate-900 dark:text-white">10 phút trước</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng lượt xem:</span>
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">4,820 views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK INBOUND MODAL MOCK */}
      {inboundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nhập Kho Nhanh: MacBook Pro 16 M3 Max
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Cộng trực tiếp số lượng vào tồn kho hiện tại (24 chiếc) mà không cần tạo phiếu phức tạp.
            </p>

            <form onSubmit={handleMockInbound} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Số lượng cần nhập thêm:</label>
                <input
                  type="number"
                  value={inboundQuantity}
                  onChange={(e) => setInboundQuantity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300">Ghi chú nhập kho:</label>
                <textarea
                  value={inboundNote}
                  onChange={(e) => setInboundNote(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-900 outline-none dark:border-white/10 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setInboundModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Xác Nhận Nhập Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
