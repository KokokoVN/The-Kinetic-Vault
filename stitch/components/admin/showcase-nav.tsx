"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ListFilter, 
  Eye, 
  PlusCircle, 
  Edit3, 
  Sparkles, 
  Zap, 
  ArrowLeft,
  CheckCircle2,
  Copy,
  Layers,
  Package,
  Award
} from "lucide-react";

export function ShowcaseNav({ 
  title, 
  subtitle,
  module = "products"
}: { 
  title: string; 
  subtitle: string;
  module?: "products" | "brands";
}) {
  const pathname = usePathname();
  const [copied, setCopied] = React.useState(false);

  const productNavItems = [
    {
      href: "/admin/showcase/products",
      label: "1. Danh sách (List)",
      icon: ListFilter,
      badge: "142 SP",
      desc: "Bảng dữ liệu, bộ lọc, thẻ KPI",
    },
    {
      href: "/admin/showcase/products/show",
      label: "2. Chi tiết (Show)",
      icon: Eye,
      badge: "MacBook M3",
      desc: "Media, biến thể, kho & tài chính",
    },
    {
      href: "/admin/showcase/products/new",
      label: "3. Thêm mới (New)",
      icon: PlusCircle,
      badge: "Wizard",
      desc: "Form đa bước, upload, tự sinh biến thể",
    },
    {
      href: "/admin/showcase/products/edit",
      label: "4. Chỉnh sửa (Edit)",
      icon: Edit3,
      badge: "Pre-filled",
      desc: "Dữ liệu mẫu đầy đủ, log thay đổi",
    },
  ];

  const brandNavItems = [
    {
      href: "/admin/showcase/brands",
      label: "1. Danh sách (List)",
      icon: ListFilter,
      badge: "8 Hãng",
      desc: "Thẻ KPI, cờ quốc gia, Bento Grid & Table",
    },
    {
      href: "/admin/showcase/brands/show",
      label: "2. Chi tiết (Show)",
      icon: Eye,
      badge: "Apple Inc.",
      desc: "Hồ sơ thương hiệu, danh mục, SP phân phối",
    },
    {
      href: "/admin/showcase/brands/new",
      label: "3. Thêm mới (New)",
      icon: PlusCircle,
      badge: "Wizard",
      desc: "Form tạo thương hiệu, logo dropzone, SEO",
    },
    {
      href: "/admin/showcase/brands/edit",
      label: "4. Chỉnh sửa (Edit)",
      icon: Edit3,
      badge: "Sony Corp.",
      desc: "Pre-filled dữ liệu, thùng rác, nhật ký",
    },
  ];

  const navItems = module === "brands" ? brandNavItems : productNavItems;

  const handleCopyPath = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link 
                href={module === "brands" ? "/admin/brands" : "/admin/products"}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Về Admin {module === "brands" ? "Thương Hiệu" : "Sản Phẩm"} Thật
              </Link>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <Zap className="h-3 w-3" />
                Giao diện tĩnh 100% (Zero Latency)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3 w-3" />
                Design System Chuẩn VIP
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-300">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Module Switcher Buttons */}
            <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-1">
              <Link
                href="/admin/showcase/products"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  module === "products"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Sản Phẩm</span>
              </Link>
              <Link
                href="/admin/showcase/brands"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  module === "brands"
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Thương Hiệu</span>
              </Link>
            </div>

            <button
              onClick={handleCopyPath}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-white/20 active:scale-95"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Đã copy!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-300" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Navigation Tabs */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 transition-all ${
                  isActive
                    ? "border-cyan-400/80 bg-cyan-950/40 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40"
                    : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                        isActive
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                          : "bg-white/10 text-slate-300 group-hover:bg-white/20 group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-bold ${isActive ? "text-cyan-300" : "text-slate-200"}`}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/30"
                        : "bg-white/10 text-slate-400 border border-white/5"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 line-clamp-1">
                  {item.desc}
                </p>
                {isActive && (
                  <div className="absolute inset-x-4 -bottom-[1px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
