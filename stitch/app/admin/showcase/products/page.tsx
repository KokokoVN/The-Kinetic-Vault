"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  Edit,
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MoreVertical,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Box,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Copy,
  Sparkles,
  RefreshCw,
  Archive
} from "lucide-react";

// Mock Data for Static List
interface MockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  stock: number;
  status: "in_stock" | "low_stock" | "out_stock" | "hidden";
  salesCount: number;
  rating: number;
  image: string;
  updatedAt: string;
}

const INITIAL_MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "1",
    name: "MacBook Pro 16 inch M3 Max (36GB / 1TB SSD) - Space Black",
    sku: "MBP16-M3MAX-BLK",
    category: "Laptop & Macbook",
    brand: "Apple",
    price: 89990000,
    originalPrice: 94990000,
    stock: 24,
    status: "in_stock",
    salesCount: 42,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    updatedAt: "10 phút trước",
  },
  {
    id: "2",
    name: "Tai nghe chống ồn Sony WH-1000XM5 Wireless Hi-Res Audio",
    sku: "SN-WH1000XM5-SLV",
    category: "Tai nghe & Âm thanh",
    brand: "Sony",
    price: 8490000,
    originalPrice: 9990000,
    stock: 6,
    status: "low_stock",
    salesCount: 128,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    updatedAt: "2 giờ trước",
  },
  {
    id: "3",
    name: "Màn hình Dell UltraSharp 32 inch 4K IPS Black PremierColor",
    sku: "DELL-U3224KB-4K",
    category: "Màn hình đồ họa",
    brand: "Dell",
    price: 24500000,
    originalPrice: 27900000,
    stock: 15,
    status: "in_stock",
    salesCount: 34,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    updatedAt: "Hôm qua",
  },
  {
    id: "4",
    name: "Bàn phím cơ Custom Keychron Q1 Pro Full Nhôm QMK/VIA",
    sku: "KC-Q1PRO-WHT",
    category: "Bàn phím & Chuột",
    brand: "Keychron",
    price: 4850000,
    originalPrice: 5200000,
    stock: 0,
    status: "out_stock",
    salesCount: 89,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
    updatedAt: "3 ngày trước",
  },
  {
    id: "5",
    name: "iPhone 16 Pro Max 256GB Titan Tự Nhiên - Bản Quốc Tế",
    sku: "IP16PM-256-NAT",
    category: "Điện thoại & Tablet",
    brand: "Apple",
    price: 34990000,
    originalPrice: 36990000,
    stock: 58,
    status: "in_stock",
    salesCount: 215,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    updatedAt: "4 giờ trước",
  },
  {
    id: "6",
    name: "Chuột công thái học Logitech MX Master 3S Silent Dark Gray",
    sku: "LOGI-MXM3S-DGY",
    category: "Bàn phím & Chuột",
    brand: "Logitech",
    price: 2390000,
    originalPrice: 2690000,
    stock: 45,
    status: "in_stock",
    salesCount: 310,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
    updatedAt: "Hôm nay",
  },
  {
    id: "7",
    name: "Máy chơi game Sony PlayStation 5 Slim 1TB Chassis D",
    sku: "SN-PS5SLIM-1TB",
    category: "Gaming & Console",
    brand: "Sony",
    price: 13990000,
    originalPrice: 15490000,
    stock: 8,
    status: "low_stock",
    salesCount: 76,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
    updatedAt: "1 ngày trước",
  },
  {
    id: "8",
    name: "iPad Pro 11 inch M4 Ultra-thin OLED 256GB Wi-Fi Space Black",
    sku: "IPAD-M4-11-256",
    category: "Điện thoại & Tablet",
    brand: "Apple",
    price: 28990000,
    originalPrice: 30990000,
    stock: 19,
    status: "hidden",
    salesCount: 14,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    updatedAt: "5 ngày trước",
  },
];

export default function StaticProductListPage() {
  const [products, setProducts] = useState<MockProduct[]>(INITIAL_MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [statusTab, setStatusTab] = useState<"all" | "in_stock" | "low_stock" | "out_stock" | "hidden">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "stock_desc">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchSearch =
        search.trim() === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      // Category
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;

      // Brand
      const matchBrand = selectedBrand === "all" || p.brand === selectedBrand;

      // Status
      const matchStatus = statusTab === "all" || p.status === statusTab;

      return matchSearch && matchCategory && matchBrand && matchStatus;
    }).sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "stock_desc") return b.stock - a.stock;
      return 0; // default order
    });
  }, [products, search, selectedCategory, selectedBrand, statusTab, sortBy]);

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Actions
  const handleToggleStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "hidden" ? "in_stock" : "hidden";
          showToast(`Đã ${nextStatus === "hidden" ? "ẩn" : "hiển thị"} sản phẩm ${p.sku}`);
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    showToast("Đã xóa sản phẩm khỏi danh sách mẫu thành công");
  };

  const handleBulkDelete = () => {
    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    showToast(`Đã xóa ${selectedIds.length} sản phẩm đã chọn`);
    setSelectedIds([]);
  };

  const handleResetData = () => {
    setProducts(INITIAL_MOCK_PRODUCTS);
    setSelectedIds([]);
    setSearch("");
    setStatusTab("all");
    showToast("Đã khôi phục dữ liệu mẫu ban đầu");
  };

  const formatVnd = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Quản Lý Sản Phẩm (Giao Diện Danh Sách - List View)"
        subtitle="Mẫu giao diện bảng sản phẩm tĩnh hoàn chỉnh, tích hợp thẻ KPI thống kê, bộ lọc đa năng, chế độ xem Bento Grid / Table và thanh thao tác hàng loạt."
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tổng Sản Phẩm
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">142</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12.4% MoM
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Phân bố trên 8 danh mục chính</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Còn Hàng (In-Stock)
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">128</span>
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              90.1% Tỷ lệ
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Sẵn sàng xuất kho ngay lập tức</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Cảnh Báo Tồn Kho
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">8</span>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">mặt hàng &lt; 10 SP</span>
          </div>
          <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">Khuyến nghị tạo phiếu nhập kho</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Giá Trị Kho Hàng
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">1.85 Tỷ</span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">VNĐ</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Tổng giá trị vốn đang lưu kho</p>
        </div>
      </div>

      {/* Main Filter & Action Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-2xl">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "Tất Cả", count: products.length },
              { key: "in_stock", label: "Còn Hàng", count: products.filter((p) => p.status === "in_stock").length },
              { key: "low_stock", label: "Sắp Hết", count: products.filter((p) => p.status === "low_stock").length },
              { key: "out_stock", label: "Hết Hàng", count: products.filter((p) => p.status === "out_stock").length },
              { key: "hidden", label: "Đang Ẩn", count: products.filter((p) => p.status === "hidden").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  statusTab === tab.key
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    statusTab === tab.key
                      ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-950"
                      : "bg-slate-200/70 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-zinc-950">
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                }`}
                title="Dạng bảng chi tiết"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
                }`}
                title="Dạng lưới thẻ Bento"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Reset dữ liệu mẫu"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Khôi phục mẫu</span>
            </button>

            {/* Direct Link to New Page */}
            <Link
              href="/admin/showcase/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm Sản Phẩm Mới</span>
            </Link>
          </div>
        </div>

        {/* Search, Filter Selectors & Sort */}
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, mã SKU (vd: MacBook, SN-WH1000XM5)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:focus:border-cyan-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">Mọi Danh Mục (Tất cả)</option>
              <option value="Laptop & Macbook">Laptop & Macbook</option>
              <option value="Tai nghe & Âm thanh">Tai nghe & Âm thanh</option>
              <option value="Màn hình đồ họa">Màn hình đồ họa</option>
              <option value="Bàn phím & Chuột">Bàn phím & Chuột</option>
              <option value="Điện thoại & Tablet">Điện thoại & Tablet</option>
              <option value="Gaming & Console">Gaming & Console</option>
            </select>

            {/* Brand Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">Mọi Thương Hiệu</option>
              <option value="Apple">Apple</option>
              <option value="Sony">Sony</option>
              <option value="Dell">Dell</option>
              <option value="Logitech">Logitech</option>
              <option value="Keychron">Keychron</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
              <option value="stock_desc">Tồn kho: Nhiều nhất</option>
            </select>
          </div>
        </div>

        {/* Batch Action Floating Pill (when items selected) */}
        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-50/50 p-3 text-xs dark:bg-cyan-950/40">
            <div className="flex items-center gap-2 font-semibold text-cyan-950 dark:text-cyan-300">
              <CheckCircle className="h-4 w-4 text-cyan-500" />
              <span>Đang chọn {selectedIds.length} / {filteredProducts.length} sản phẩm</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast(`Đã xuất file Excel cho ${selectedIds.length} sản phẩm`);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
                Xuất Excel
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa các mục đã chọn
              </button>
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" ? (
          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-zinc-950/60 dark:text-zinc-400">
                <tr>
                  <th className="w-10 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="px-4 py-3.5">Sản Phẩm & SKU</th>
                  <th className="px-4 py-3.5">Danh Mục / Hãng</th>
                  <th className="px-4 py-3.5 text-right">Đơn Giá</th>
                  <th className="px-4 py-3.5 text-center">Tồn Kho</th>
                  <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-4 py-3.5 text-center">Đã Bán</th>
                  <th className="px-4 py-3.5 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                      <Box className="mx-auto h-8 w-8 text-slate-300 dark:text-zinc-600" />
                      <p className="mt-2 font-medium">Không tìm thấy sản phẩm nào phù hợp bộ lọc.</p>
                      <button
                        onClick={handleResetData}
                        className="mt-3 text-xs font-bold text-cyan-500 hover:underline"
                      >
                        Xóa toàn bộ bộ lọc
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isSelected = selectedIds.includes(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`group transition-colors ${
                          isSelected
                            ? "bg-cyan-50/40 dark:bg-cyan-950/20"
                            : "hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(p.id)}
                            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                        </td>

                        {/* Product Info */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 dark:border-white/10 dark:bg-zinc-800">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <Link
                                href="/admin/showcase/products/show"
                                className="line-clamp-1 font-bold text-slate-900 transition-colors hover:text-cyan-600 dark:text-white dark:hover:text-cyan-400"
                              >
                                {p.name}
                              </Link>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                                <span className="font-mono text-cyan-600 dark:text-cyan-400">{p.sku}</span>
                                <span>•</span>
                                <span>{p.updatedAt}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Brand */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-700 dark:text-zinc-200">
                              {p.category}
                            </span>
                            <div className="text-[11px] font-medium text-slate-400">{p.brand}</div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {formatVnd(p.price)}
                          </div>
                          {p.originalPrice > p.price && (
                            <div className="text-[11px] text-slate-400 line-through">
                              {formatVnd(p.originalPrice)}
                            </div>
                          )}
                        </td>

                        {/* Stock Level Bar */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-extrabold ${
                                p.stock === 0
                                  ? "text-rose-500"
                                  : p.stock < 10
                                  ? "text-amber-500"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {p.stock} chiếc
                            </span>
                            <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                              <div
                                className={`h-full rounded-full ${
                                  p.stock === 0
                                    ? "bg-rose-500 w-0"
                                    : p.stock < 10
                                    ? "bg-amber-500 w-1/4"
                                    : "bg-emerald-500 w-3/4"
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 text-center">
                          {p.status === "in_stock" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Còn Hàng
                            </span>
                          )}
                          {p.status === "low_stock" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Sắp Hết
                            </span>
                          )}
                          {p.status === "out_stock" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Tạm Hết
                            </span>
                          )}
                          {p.status === "hidden" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Đang Ẩn
                            </span>
                          )}
                        </td>

                        {/* Sales count */}
                        <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-zinc-300">
                          {p.salesCount} SP
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Show / View Detail */}
                            <Link
                              href="/admin/showcase/products/show"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-cyan-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-cyan-400"
                              title="Xem chi tiết (Show)"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            {/* Edit */}
                            <Link
                              href="/admin/showcase/products/edit"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                              title="Chỉnh sửa (Edit)"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>

                            {/* Toggle Hide/Unhide */}
                            <button
                              onClick={() => handleToggleStatus(p.id)}
                              className={`rounded-lg p-1.5 ${
                                p.status === "hidden"
                                  ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                              }`}
                              title={p.status === "hidden" ? "Hiện sản phẩm" : "Ẩn sản phẩm"}
                            >
                              <Archive className="h-4 w-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* BENTO GRID VIEW */
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-zinc-950"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute right-2 top-2">
                      <span className="rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        {p.brand}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">{p.sku}</div>
                    <Link
                      href="/admin/showcase/products/show"
                      className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-900 hover:text-cyan-600 dark:text-white"
                    >
                      {p.name}
                    </Link>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatVnd(p.price)}
                      </span>
                      <div className="text-[10px] text-slate-400">Tồn kho: {p.stock} SP</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href="/admin/showcase/products/show"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href="/admin/showcase/products/edit"
                        className="rounded-lg bg-cyan-500 p-1.5 text-white hover:bg-cyan-600"
                        title="Sửa"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row dark:border-white/5 dark:text-zinc-400">
          <div>
            Hiển thị <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> trong số{" "}
            <span className="font-bold text-slate-900 dark:text-white">{products.length}</span> sản phẩm mẫu
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:border-white/10"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Trước
            </button>
            <span className="rounded-xl bg-cyan-50 px-3 py-1.5 text-xs font-extrabold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
              Trang 1 / 1
            </span>
            <button
              disabled
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400 dark:border-white/10"
            >
              Tiếp
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
