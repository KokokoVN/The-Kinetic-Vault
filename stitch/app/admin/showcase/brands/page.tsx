"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ShowcaseNav } from "@/components/admin/showcase-nav";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Globe,
  ExternalLink,
  Award,
  Package,
  Layers,
  CheckCircle,
  TrendingUp,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  Archive,
  Download,
  Building2,
  Sparkles
} from "lucide-react";

interface MockBrand {
  id: string;
  name: string;
  code: string;
  country: string;
  countryFlag: string;
  website: string;
  productCount: number;
  status: "active" | "hidden";
  logoUrl: string;
  description: string;
  established: string;
}

const INITIAL_MOCK_BRANDS: MockBrand[] = [
  {
    id: "1",
    name: "Apple Inc.",
    code: "AAPL",
    country: "Hoa Kỳ",
    countryFlag: "🇺🇸",
    website: "https://apple.com",
    productCount: 38,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80",
    description: "Tập đoàn công nghệ hàng đầu thế giới với hệ sinh thái MacBook, iPhone, iPad, Apple Watch cao cấp.",
    established: "1976",
  },
  {
    id: "2",
    name: "Sony Corporation",
    code: "SONY",
    country: "Nhật Bản",
    countryFlag: "🇯🇵",
    website: "https://sony.com.vn",
    productCount: 24,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    description: "Biểu tượng âm thanh đỉnh cao, máy ảnh Alpha không gương lật và máy chơi game PlayStation 5.",
    established: "1946",
  },
  {
    id: "3",
    name: "Dell Technologies",
    code: "DELL",
    country: "Hoa Kỳ",
    countryFlag: "🇺🇸",
    website: "https://dell.com",
    productCount: 18,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80",
    description: "Thương hiệu màn hình đồ họa UltraSharp cao cấp và dòng laptop doanh nhân XPS siêu bền bỉ.",
    established: "1984",
  },
  {
    id: "4",
    name: "Logitech",
    code: "LOGI",
    country: "Thụy Sĩ",
    countryFlag: "🇨🇭",
    website: "https://logitech.com",
    productCount: 22,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
    description: "Hãng sản xuất thiết bị ngoại vi số 1 thế giới với chuột công thái học MX Master và bàn phím cơ.",
    established: "1981",
  },
  {
    id: "5",
    name: "Keychron",
    code: "KEYCHRON",
    country: "Hồng Kông",
    countryFlag: "🇭🇰",
    website: "https://keychron.com",
    productCount: 15,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    description: "Thương hiệu bàn phím cơ Custom nhôm nguyên khối tương thích hoàn hảo cho macOS và Windows.",
    established: "2017",
  },
  {
    id: "6",
    name: "Samsung Electronics",
    code: "SMSNG",
    country: "Hàn Quốc",
    countryFlag: "🇰🇷",
    website: "https://samsung.com",
    productCount: 12,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
    description: "Tập đoàn điện tử công nghệ dẫn đầu về màn hình Odyssey Gaming, ổ cứng NVMe 990 Pro và Galaxy.",
    established: "1969",
  },
  {
    id: "7",
    name: "Sennheiser",
    code: "SENN",
    country: "Đức",
    countryFlag: "🇩🇪",
    website: "https://sennheiser.com",
    productCount: 7,
    status: "active",
    logoUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
    description: "Thương hiệu âm thanh chuẩn Audiophile đến từ Đức với các dòng tai nghe Momentum và microphone cao cấp.",
    established: "1945",
  },
  {
    id: "8",
    name: "ASUS ROG (Republic of Gamers)",
    code: "ROG",
    country: "Đài Loan",
    countryFlag: "🇹🇼",
    website: "https://rog.asus.com",
    productCount: 6,
    status: "hidden",
    logoUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
    description: "Dòng sản phẩm phần cứng gaming cao cấp: bo mạch chủ, màn hình tần số quét 540Hz và laptop gaming.",
    established: "2006",
  },
];

export default function StaticBrandListPage() {
  const [brands, setBrands] = useState<MockBrand[]>(INITIAL_MOCK_BRANDS);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchSearch =
        search.trim() === "" ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.country.toLowerCase().includes(search.toLowerCase());

      const matchCountry = selectedCountry === "all" || b.country === selectedCountry;
      const matchStatus = statusFilter === "all" || b.status === statusFilter;

      return matchSearch && matchCountry && matchStatus;
    });
  }, [brands, search, selectedCountry, statusFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBrands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBrands.map((b) => b.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = (id: string) => {
    setBrands((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const next = b.status === "active" ? "hidden" : "active";
          showToast(`Đã ${next === "hidden" ? "ẩn" : "kích hoạt"} thương hiệu ${b.name}`);
          return { ...b, status: next };
        }
        return b;
      })
    );
  };

  const handleDelete = (id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    showToast("Đã xóa thương hiệu mẫu thành công");
  };

  const handleResetData = () => {
    setBrands(INITIAL_MOCK_BRANDS);
    setSelectedIds([]);
    setSearch("");
    setStatusFilter("all");
    setSelectedCountry("all");
    showToast("Đã khôi phục dữ liệu thương hiệu ban đầu");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation Bar with Quick Switcher */}
      <ShowcaseNav
        title="Quản Lý Thương Hiệu (Giao Diện Danh Sách - Brands List View)"
        subtitle="Mẫu giao diện bảng đối tác thương hiệu phân phối: Thẻ KPI thống kê quốc gia, bộ lọc thông minh, chuyển đổi Bento Grid / Table và hành động hàng loạt."
        module="brands"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="h-5 w-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tổng Thương Hiệu
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">8</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +25% Quý này
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Đối tác phân phối ủy quyền</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Quốc Gia Đối Tác
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Globe className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">6</span>
            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Toàn cầu
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Mỹ 🇺🇸, Nhật 🇯🇵, Đức 🇩🇪, Thụy Sĩ 🇨🇭...</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Sản Phẩm Thuộc Hãng
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">142</span>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">SKUs</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Trung bình 17.7 sản phẩm / hãng</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tỷ Lệ Hoạt Động
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">87.5%</span>
            <span className="text-xs font-medium text-slate-400">7/8 Hãng</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">1 Hãng đang tạm ẩn chuẩn bị ra mắt</p>
        </div>
      </div>

      {/* Main Filter & Action Container */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-white/5">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "Tất Cả", count: brands.length },
              { key: "active", label: "Đang Hoạt Động", count: brands.filter((b) => b.status === "active").length },
              { key: "hidden", label: "Đang Ẩn", count: brands.filter((b) => b.status === "hidden").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  statusFilter === tab.key
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950"
                    : "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    statusFilter === tab.key
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
            </div>

            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Khôi phục mẫu"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Khôi phục mẫu</span>
            </button>

            {/* Direct Link to New Brand Page */}
            <Link
              href="/admin/showcase/brands/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>+ Thêm Thương Hiệu</span>
            </Link>
          </div>
        </div>

        {/* Search & Country Selectors */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hãng, mã thương hiệu, quốc gia (vd: Apple, Sony, Hoa Kỳ)..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">Mọi Quốc Gia (Tất cả)</option>
              <option value="Hoa Kỳ">Hoa Kỳ 🇺🇸</option>
              <option value="Nhật Bản">Nhật Bản 🇯🇵</option>
              <option value="Thụy Sĩ">Thụy Sĩ 🇨🇭</option>
              <option value="Hàn Quốc">Hàn Quốc 🇰🇷</option>
              <option value="Đức">Đức 🇩🇪</option>
              <option value="Hồng Kông">Hồng Kông 🇭🇰</option>
              <option value="Đài Loan">Đài Loan 🇹🇼</option>
            </select>
          </div>
        </div>

        {/* BENTO GRID VIEW */}
        {viewMode === "grid" ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredBrands.map((b) => (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-zinc-950"
              >
                <div>
                  {/* Brand Header with Logo & Country Flag */}
                  <div className="flex items-center justify-between">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-1.5 shadow-xs dark:border-white/10 dark:bg-zinc-900">
                      <img
                        src={b.logoUrl}
                        alt={b.name}
                        className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        <span>{b.countryFlag}</span>
                        <span>{b.country}</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">Est. {b.established}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
                        {b.code}
                      </span>
                      {b.status === "active" ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      )}
                    </div>
                    <Link
                      href="/admin/showcase/brands/show"
                      className="mt-1 line-clamp-1 text-base font-extrabold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      {b.name}
                    </Link>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                      {b.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="mt-5 border-t border-slate-100 pt-3 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
                      <Package className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{b.productCount} sản phẩm</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href="/admin/showcase/brands/show"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-zinc-800"
                        title="Xem chi tiết (Show)"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/admin/showcase/brands/edit"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-800"
                        title="Chỉnh sửa (Edit)"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(b.id)}
                        className={`rounded-lg p-1.5 ${
                          b.status === "hidden"
                            ? "text-emerald-500 hover:bg-emerald-50"
                            : "text-slate-400 hover:bg-slate-100"
                        }`}
                        title={b.status === "hidden" ? "Hiện hãng" : "Ẩn hãng"}
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200/70 dark:border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-zinc-950/60 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3.5">Logo & Thương Hiệu</th>
                  <th className="px-4 py-3.5">Mã Hãng</th>
                  <th className="px-4 py-3.5">Quốc Gia</th>
                  <th className="px-4 py-3.5 text-center">Số Sản Phẩm</th>
                  <th className="px-4 py-3.5 text-center">Trạng Thái</th>
                  <th className="px-4 py-3.5 text-right">Website</th>
                  <th className="px-4 py-3.5 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.logoUrl}
                          alt={b.name}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-200/80 dark:border-white/10"
                        />
                        <div>
                          <Link
                            href="/admin/showcase/brands/show"
                            className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white"
                          >
                            {b.name}
                          </Link>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{b.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {b.code}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-200">
                        <span>{b.countryFlag}</span>
                        <span>{b.country}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-extrabold text-slate-900 dark:text-white">
                      {b.productCount} SP
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {b.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Hoạt Động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                          Đang Ẩn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[11px]">
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-600 hover:underline dark:text-cyan-400"
                      >
                        {b.website.replace("https://", "")}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href="/admin/showcase/brands/show"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href="/admin/showcase/brands/edit"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600"
                          title="Sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
