"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  Award,
  Package,
  Layers,
  Globe,
  TrendingUp,
  DollarSign,
  Calendar,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Share2,
  FileText,
  Star,
  Plus
} from "lucide-react";

export default function StaticBrandShowPage() {
  const [activeTab, setActiveTab] = useState<"products" | "categories" | "contract">("products");

  const brandProducts = [
    {
      id: "1",
      name: "MacBook Pro 16 inch M3 Max (36GB / 1TB SSD) - Space Black",
      sku: "MBP16-M3MAX-BLK",
      price: 89990000,
      stock: 24,
      sales: 42,
      category: "Laptop & Macbook",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "2",
      name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên - Bản Quốc Tế",
      sku: "IP16PM-256-NAT",
      price: 34990000,
      stock: 58,
      sales: 215,
      category: "Điện thoại & Tablet",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "3",
      name: "iPad Pro 11 inch M4 Ultra-thin OLED 256GB Wi-Fi Space Black",
      sku: "IPAD-M4-11-256",
      price: 28990000,
      stock: 19,
      sales: 14,
      category: "Điện thoại & Tablet",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "4",
      name: "Đồng hồ thông minh Apple Watch Ultra 2 Titanium Case 49mm",
      sku: "AW-ULTRA2-49",
      price: 21490000,
      stock: 12,
      sales: 38,
      category: "Đồng hồ thông minh",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <div className="space-y-6 pb-24">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Hồ Sơ Thương Hiệu (Giao Diện Chi Tiết - Brand Show View)"
        subtitle="Mẫu giao diện xem thông tin thương hiệu chi tiết: Thông tin đối tác ủy quyền, phân tích doanh thu thương hiệu, danh mục ngành hàng và danh sách sản phẩm phân phối."
        module="brands"
      />

      {/* Top Header Controls */}
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
                AAPL
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đại Lý Cấp 1 (Tier 1)
              </span>
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                <span>🇺🇸</span>
                <span>Hoa Kỳ</span>
              </span>
            </div>
            <h1 className="mt-0.5 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              Apple Inc. (California, USA)
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="https://apple.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Mở Trang Chủ Hãng</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          <Link
            href="/admin/showcase/brands/edit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95"
          >
            <Edit3 className="h-4 w-4" />
            <span>Chỉnh Sửa Thương Hiệu</span>
          </Link>
        </div>
      </div>

      {/* Brand Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-2 shadow-sm dark:border-white/10 dark:bg-zinc-950">
            <img
              src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80"
              alt="Apple Logo"
              className="h-full w-full rounded-xl object-cover"
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Apple Inc.</h2>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Mã: AAPL
              </span>
              <span className="text-xs text-slate-400">Thành lập năm 1976 tại Cupertino, California</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
              Tập đoàn công nghệ giá trị nhất hành tinh, chuyên cung cấp máy tính xách tay MacBook Pro/Air, điện thoại
              thông minh iPhone, máy tính bảng iPad, phụ kiện MagSafe và các thiết bị âm thanh AirPods chính hãng VN/A.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Tabs & Products List (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-200/80 px-6 dark:border-white/10">
              {[
                { key: "products", label: "Sản Phẩm Đang Phân Phối (38)", icon: Package },
                { key: "categories", label: "Danh Mục Phủ Sóng (4)", icon: Layers },
                { key: "contract", label: "Hồ Sơ Hợp Đồng & Đại Lý", icon: ShieldCheck },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key as any)}
                    className={`flex items-center gap-2 border-b-2 py-4 text-xs font-bold transition-colors ${
                      isActive
                        ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                        : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Products */}
            {activeTab === "products" && (
              <div className="p-6">
                <div className="flex items-center justify-between pb-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Sản phẩm tiêu biểu của Apple trong hệ thống
                  </h3>
                  <Link
                    href="/admin/showcase/products/new"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    + Thêm SP mới cho hãng
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 dark:divide-white/5 dark:border-white/10">
                  {brandProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-12 w-12 rounded-xl object-cover border border-slate-100 dark:border-white/10"
                        />
                        <div>
                          <Link
                            href="/admin/showcase/products/show"
                            className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white"
                          >
                            {p.name}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="font-mono text-cyan-600 dark:text-cyan-400">{p.sku}</span>
                            <span>•</span>
                            <span>{p.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {formatVnd(p.price)}
                          </div>
                          <div className="text-[11px] text-slate-400">Kho: {p.stock} SP</div>
                        </div>

                        <Link
                          href="/admin/showcase/products/show"
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-zinc-200"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Categories */}
            {activeTab === "categories" && (
              <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                {[
                  { name: "Laptop & Macbook", count: 18, share: "47.3% Doanh thu" },
                  { name: "Điện thoại & Tablet", count: 12, share: "34.1% Doanh thu" },
                  { name: "Đồng hồ thông minh", count: 5, share: "11.2% Doanh thu" },
                  { name: "Phụ kiện chính hãng", count: 3, share: "7.4% Doanh thu" },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-4 dark:border-white/10"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.count} sản phẩm đang bán</div>
                    </div>
                    <span className="rounded-lg bg-indigo-50 px-2 py-1 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {c.share}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: Contract */}
            {activeTab === "contract" && (
              <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-zinc-300">
                <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
                  <div className="font-bold">Đại lý ủy quyền chính thức APR (Apple Premium Reseller)</div>
                  <p className="mt-1 text-slate-500 dark:text-zinc-400">
                    Hợp đồng có hiệu lực đến 31/12/2028. Phân phối trực tiếp qua các nhà phân phối Synnex FPT & Viettel
                    Distribution.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Performance & Revenue (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Doanh Số Thương Hiệu
            </h3>

            <div>
              <span className="text-xs text-slate-400">Doanh thu tích lũy quý này</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">1.45 Tỷ ₫</div>
              <div className="mt-1 text-xs font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Chiếm 78.4% tổng doanh thu store
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 dark:border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Số máy đã giao:</span>
                <span className="font-bold text-slate-900 dark:text-white">309 sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tỷ lệ đổi trả bảo hành:</span>
                <span className="font-bold text-emerald-600">0.4% (Rất thấp)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đánh giá trung bình:</span>
                <span className="font-bold text-amber-500">4.9 / 5.0 ⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
