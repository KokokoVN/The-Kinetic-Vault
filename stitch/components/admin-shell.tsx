"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { HeaderDateTime } from "@/components/header-date-time";
import { HeaderWeather } from "@/components/header-weather";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminHeaderSearch } from "@/components/admin-header-search";

type MenuItem = {
  href: string;
  icon: string;
  label: string;
  badge?: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: "Tổng quan & Điều hành",
    items: [
      { href: "/admin/dashboard", icon: "dashboard", label: "Tổng quan" },
      { href: "/admin/reports", icon: "monitoring", label: "Báo cáo doanh thu" },
      { href: "/admin/activity-log", icon: "history", label: "Nhật ký hệ thống" },
    ],
  },
  {
    title: "Sản phẩm & Tồn kho",
    items: [
      { href: "/admin/showcase/products", icon: "auto_awesome", label: "Mẫu UI Mới (4 Trang)", badge: "Mới" },
      { href: "/admin/products", icon: "inventory_2", label: "Sản phẩm" },
      { href: "/admin/categories", icon: "category", label: "Danh mục" },
      { href: "/admin/brands", icon: "stars", label: "Thương hiệu" },
      { href: "/admin/inventory", icon: "warehouse", label: "Kho & Nhập hàng" },
    ],
  },
  {
    title: "Kinh doanh & Khách hàng",
    items: [
      { href: "/admin/orders", icon: "shopping_cart", label: "Đơn hàng" },
      { href: "/admin/carts", icon: "shopping_bag", label: "Giỏ hàng" },
      { href: "/admin/customers", icon: "group", label: "Khách hàng" },
      { href: "/admin/sales", icon: "local_offer", label: "Khuyến mãi" },
    ],
  },
  {
    title: "Hệ thống & Cài đặt",
    items: [
      { href: "/admin/notifications", icon: "mail", label: "Hộp thư & Thông báo" },
      { href: "/admin/settings", icon: "store", label: "Cửa hàng & Liên hệ" },
    ],
  },
];

const mobileDockMenu = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Tổng quan" },
  { href: "/admin/products", icon: "inventory_2", label: "Sản phẩm" },
  { href: "/admin/orders", icon: "shopping_cart", label: "Đơn hàng" },
  { href: "/admin/notifications", icon: "mail", label: "Hộp thư" },
];

function NavItem({
  href,
  icon,
  label,
  badge,
  active,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  badge?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  if (href === "#") {
    return (
      <span
        className="flex items-center gap-3 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-50"
        aria-disabled="true"
        title="Tính năng đang cập nhật"
      >
        <span className="material-symbols-outlined text-[19px]">{icon}</span>
        <span>{label}</span>
      </span>
    );
  }

  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs transition-all duration-200 select-none ${
        active
          ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-bold shadow-[0_4px_18px_rgba(99,102,241,0.38)] ring-1 ring-white/30 translate-x-1"
          : "text-slate-600 dark:text-zinc-400 font-semibold hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06] hover:translate-x-1"
      }`}
    >
      {/* Icon with micro-glow on active / hover */}
      <span
        className={`material-symbols-outlined text-[20px] transition-all duration-200 ${
          active
            ? "material-filled text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            : "text-slate-400 dark:text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 group-hover:scale-110"
        }`}
      >
        {icon}
      </span>

      <span className="tracking-tight truncate">{label}</span>

      {/* Optional Badge */}
      {badge && (
        <span className="ml-auto rounded-full bg-indigo-100 dark:bg-cyan-950/60 text-indigo-700 dark:text-cyan-300 px-1.5 py-0.2 text-[9px] font-black uppercase">
          {badge}
        </span>
      )}

      {/* Active Pulse Beacon or Hover Indicator */}
      {active ? (
        <span className="ml-auto relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_#ffffff]" />
        </span>
      ) : (
        <span className="material-symbols-outlined ml-auto text-[15px] text-slate-300 dark:text-zinc-600 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-600 dark:group-hover:text-cyan-400">
          chevron_right
        </span>
      )}
    </Link>
  );
}

const titleMap: Record<string, string> = {
  "/admin/dashboard": "tổng quan",
  "/admin/categories": "danh mục",
  "/admin/brands": "thương hiệu",
  "/admin/products": "sản phẩm",
  "/admin/inventory": "kho hàng",
  "/admin/orders": "đơn hàng",
  "/admin/carts": "giỏ hàng",
  "/admin/customers": "khách hàng",
  "/admin/sales": "khuyến mãi",
  "/admin/activity-log": "nhật ký",
  "/admin/reports": "báo cáo",
  "/admin/settings": "thông tin cửa hàng & liên hệ",
};

function pageTitleFromPath(pathname: string): string {
  const key = Object.keys(titleMap).find((k) => pathname.startsWith(k));
  const t = key ? titleMap[key] : "quản trị";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function roleLabel(role: string | null | undefined): string {
  if (!role) {
    return "—";
  }
  if (role === "ROLE_ADMIN") {
    return "Quản trị";
  }
  if (role === "ROLE_STAFF") {
    return "Nhân viên";
  }
  if (role === "ROLE_USER") {
    return "Người dùng";
  }
  return role.replace(/^ROLE_/, "");
}

export function AdminShell({
  children,
  userRole,
  username,
  canMutateCatalog,
}: {
  children: React.ReactNode;
  userRole?: string | null;
  username?: string | null;
  canMutateCatalog?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [telegramToken, setTelegramToken] = useState<string | null>(null);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const generateTelegramToken = async () => {
    try {
      setIsGeneratingToken(true);
      const res = await fetch("/api/telegram/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramToken(data.token);
      } else {
        alert("Có lỗi xảy ra khi tạo mã liên kết.");
      }
    } catch (e) {
      alert("Lỗi kết nối.");
    } finally {
      setIsGeneratingToken(false);
    }
  };

  useEffect(() => {
    router.prefetch("/admin/dashboard");
    router.prefetch("/admin/categories");
    router.prefetch("/admin/categories/new");
    router.prefetch("/admin/brands");
    router.prefetch("/admin/products");
    router.prefetch("/admin/inventory");
    router.prefetch("/admin/orders");
    router.prefetch("/admin/carts");
    router.prefetch("/admin/customers");
    router.prefetch("/admin/sales");
    router.prefetch("/admin/activity-log");
    router.prefetch("/admin/reports");
  }, [router]);

  const title = pageTitleFromPath(pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-zinc-100 selection:bg-blue-500/20 transition-colors duration-300">
      
      {/* ==================== DESKTOP SIDEBAR ==================== */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[280px] flex-col bg-white/85 dark:bg-[#060810]/85 border-r border-slate-200/70 dark:border-white/[0.08] p-5 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.03)] dark:shadow-2xl backdrop-blur-2xl lg:flex transition-colors duration-300">
        {/* Brand Logo Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <Link href="/admin/dashboard" className="group flex items-center gap-3 transition-transform duration-200">
            {/* Holographic 3D Gem */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-[0_4px_20px_rgba(99,102,241,0.38)] ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_28px_rgba(6,182,212,0.6)] overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl" />
              <span className="material-symbols-outlined text-[24px] relative z-10 transition-transform duration-300 group-hover:rotate-6 drop-shadow-sm">
                view_in_ar
              </span>
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300 shadow-[0_0_6px_#22d3ee]" />
              </span>
            </div>
            
            <div className="flex flex-col items-start leading-none gap-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-headline text-lg font-black tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-800 dark:from-white dark:via-cyan-100 dark:to-indigo-200 bg-clip-text text-transparent whitespace-nowrap drop-shadow-xs">
                  TKV Admin
                </h1>
                <span className="rounded-md bg-indigo-500/10 dark:bg-cyan-400/10 px-1 py-0.5 font-mono text-[9px] font-black text-indigo-600 dark:text-cyan-400 border border-indigo-500/20 dark:border-cyan-400/20">
                  PRO
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50/80 dark:bg-cyan-950/40 border border-indigo-200/60 dark:border-cyan-500/30 px-2 py-0.5 shadow-xs">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.22em] text-indigo-700 dark:text-cyan-300 whitespace-nowrap">
                  Operational
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Grouped Navigation Sections */}
        <nav className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400/90 dark:text-zinc-500 flex items-center justify-between">
                <span>{section.title}</span>
                <span className="h-px flex-1 bg-slate-200/60 dark:bg-white/[0.06] ml-2" />
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={item.href !== "#" && pathname.startsWith(item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions & User Profile */}
        <div className="mt-3 space-y-2.5 border-t border-slate-200/80 dark:border-white/10 pt-3.5 pb-1">
          {/* Quick link to Storefront */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:border-indigo-400/60 hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300 transition-all shadow-xs"
            title="Mở trang bán hàng Storefront trong tab mới"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-indigo-600 dark:text-cyan-400 transition-transform group-hover:scale-110">
                storefront
              </span>
              <span>Xem trang bán hàng</span>
            </div>
            <span className="material-symbols-outlined text-[15px] text-slate-400 dark:text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              open_in_new
            </span>
          </Link>

          {/* Telegram Bot Token Action */}
          {telegramToken ? (
            <div className="rounded-2xl bg-indigo-50/90 dark:bg-cyan-950/40 p-2.5 border border-indigo-200/80 dark:border-cyan-500/30 text-center shadow-xs backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-0.5">Mã liên kết Telegram Bot</p>
              <p className="font-mono text-sm font-black text-indigo-950 dark:text-white tracking-widest">{telegramToken}</p>
              <p className="text-[9.5px] text-slate-500 dark:text-zinc-400 mt-1">Gửi <span className="font-bold text-indigo-600 dark:text-cyan-400">/login {telegramToken}</span> cho bot</p>
            </div>
          ) : (
            <button
              onClick={generateTelegramToken}
              disabled={isGeneratingToken}
              className="w-full group flex items-center justify-center gap-2 rounded-2xl border border-indigo-200/80 dark:border-cyan-500/30 bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-indigo-50/80 dark:from-indigo-950/30 dark:via-cyan-950/25 dark:to-indigo-950/30 px-3.5 py-2 text-xs font-bold text-indigo-700 dark:text-cyan-300 shadow-xs backdrop-blur-xl transition-all hover:border-indigo-400 dark:hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] active:scale-[0.99] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">send</span>
              <span>{isGeneratingToken ? "Đang tạo mã..." : "Liên kết Telegram Bot"}</span>
            </button>
          )}

          {/* Master Admin Identity Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] p-2.5 shadow-xs backdrop-blur-xl flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white font-black text-xs shadow-md shadow-indigo-500/30 ring-1 ring-white/30">
              {username ? username.charAt(0).toUpperCase() : "A"}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#07090e] shadow-[0_0_6px_#10b981]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1 leading-tight">
              <span className="font-black text-slate-900 dark:text-white text-xs truncate">{username ?? "Admin"}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  {roleLabel(userRole)}
                </span>
                {canMutateCatalog === false && (
                  <span className="text-[8px] text-slate-400">· Read-only</span>
                )}
              </div>
            </div>
          </div>

          <LogoutButton />
        </div>
      </aside>

      {/* ==================== MOBILE DRAWER MENU ==================== */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md lg:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[290px] bg-white/95 dark:bg-[#07090e]/95 p-5 shadow-2xl lg:hidden border-r border-slate-200/90 dark:border-white/10 flex flex-col backdrop-blur-2xl transition-transform duration-300 ease-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="group relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] ring-1 ring-white/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
              <span className="material-symbols-outlined text-[22px] material-filled drop-shadow-sm">bolt</span>
            </div>
            <div>
              <h1 className="font-headline text-base font-black tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                TKV Admin
              </h1>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-cyan-400">
                  Control Center
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-white/15 transition-all shadow-xs"
            title="Đóng menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mb-3">
          <AdminHeaderSearch title={title} className="block w-full" />
        </div>

        {/* Mobile Grouped Nav */}
        <nav className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-1">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400/90 dark:text-zinc-500 flex items-center justify-between">
                <span>{section.title}</span>
                <span className="h-px flex-1 bg-slate-200/60 dark:bg-white/[0.06] ml-2" />
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={item.href !== "#" && pathname.startsWith(item.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 space-y-2.5 border-t border-slate-200/80 dark:border-white/10 pt-3">
          {telegramToken ? (
            <div className="relative overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-cyan-500/30 bg-gradient-to-br from-indigo-50/90 to-cyan-50/50 dark:from-indigo-950/40 dark:to-cyan-950/30 p-2.5 text-center shadow-xs">
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-cyan-400 mb-0.5">Mã Bot Telegram</p>
              <p className="font-mono text-sm font-black text-slate-900 dark:text-white tracking-widest">{telegramToken}</p>
            </div>
          ) : (
            <button
              onClick={generateTelegramToken}
              disabled={isGeneratingToken}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/80 dark:from-indigo-950/40 dark:via-zinc-900/60 dark:to-cyan-950/40 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-cyan-300 shadow-xs transition-all active:scale-98 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[17px] text-indigo-600 dark:text-cyan-400">send</span>
              <span>{isGeneratingToken ? "Đang tạo..." : "Liên kết Bot Telegram"}</span>
            </button>
          )}

          <LogoutButton />
        </div>
      </aside>

      {/* ==================== MAIN WORKSPACE AREA ==================== */}
      <main className="min-h-screen lg:ml-[280px] flex flex-col justify-between">
        
        {/* ==================== HEADER ==================== */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#07090e]/85 backdrop-blur-2xl shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gradient-to-r after:from-transparent after:via-indigo-500/60 dark:after:via-cyan-400/50 after:to-transparent after:shadow-[0_0_12px_rgba(99,102,241,0.5)]">
          <div className="mx-auto flex h-20 items-center justify-between gap-4 lg:gap-6 px-6 lg:px-10">
            
            {/* Left Header section: Mobile menu, Brand Gem, Live Chrono & Atmospheric Hub, Omnibar Search */}
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-cyan-400 transition-all lg:hidden shadow-xs border border-slate-200/80 dark:border-white/10"
                title="Mở menu"
              >
                <span className="material-symbols-outlined text-[22px]">menu</span>
              </button>

              {/* Mobile Brand Gem */}
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/30">
                  <span className="material-symbols-outlined text-[20px] material-filled">bolt</span>
                </div>
                <span className="font-headline text-lg font-black tracking-tight text-slate-900 dark:text-white">TKV</span>
              </div>

              {/* Live Cyber Cockpit: Chrono Radar & Atmospheric Weather Hub */}
              <div className="hidden lg:flex items-center gap-2">
                <HeaderDateTime />
                <HeaderWeather />
              </div>

              {/* Omnibar Spotlight Search */}
              <AdminHeaderSearch title={title} />
            </div>

            {/* Right Header section: Executive Actions, Quick Controls, VIP Identity Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* + Sản phẩm (Cyber Gradient Action Capsule) */}
              <Link
                href="/admin/products/new"
                className="group relative hidden lg:inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 h-10 text-xs font-black text-white shadow-[0_6px_20px_-3px_rgba(99,102,241,0.45)] ring-1 ring-white/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_25px_-3px_rgba(99,102,241,0.65)] active:scale-95"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md">
                  <span className="material-symbols-outlined text-[15px] font-bold transition-transform duration-300 group-hover:rotate-90">add</span>
                </div>
                <span className="tracking-wide">Sản phẩm</span>
              </Link>

              {/* + Danh mục (Executive Glass Capsule) */}
              <Link
                href="/admin/categories/new"
                className="group relative hidden lg:inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 dark:border-white/12 bg-white/80 dark:bg-white/[0.05] px-4 h-10 text-xs font-bold text-slate-700 dark:text-zinc-200 shadow-xs backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] hover:border-indigo-400/60 hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300 hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)] active:scale-95"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400 group-hover:bg-indigo-100 dark:group-hover:bg-cyan-400/20 group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                  <span className="material-symbols-outlined text-[15px] font-bold transition-transform duration-300 group-hover:rotate-90">add</span>
                </div>
                <span className="tracking-wide">Danh mục</span>
              </Link>
              
              <div className="h-6 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-white/15 to-transparent mx-0.5 hidden sm:block" />

              {/* Theme Switcher */}
              <ThemeToggle />

              {/* Notification Center with Radar Ping */}
              <Link
                href="/admin/notifications"
                prefetch
                className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-slate-600 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-indigo-400/60 hover:bg-indigo-50/70 hover:text-indigo-600 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(99,102,241,0.2)] active:scale-95"
                title="Thông báo hệ thống"
              >
                <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                  notifications
                </span>
                <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 ring-2 ring-white dark:ring-[#07090e] shadow-[0_0_8px_#f43f5e]" />
                </span>
              </Link>

              {/* Executive VIP Identity Capsule */}
              <div className="group hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-white/12 bg-white/80 dark:bg-[#0c101d]/80 p-1.5 pl-3.5 shadow-xs backdrop-blur-xl hover:border-indigo-400/50 dark:hover:border-cyan-400/50 hover:shadow-md transition-all duration-300 cursor-default">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                      {username ?? "Admin"}
                    </p>
                    <span className="material-symbols-outlined text-[13px] text-amber-500 drop-shadow-xs material-filled">
                      verified
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-[0.16em] bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-cyan-400 dark:to-indigo-300 bg-clip-text text-transparent">
                      {roleLabel(userRole)}
                    </span>
                  </div>
                </div>

                {/* Avatar with cyber neon aura */}
                <div className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] shadow-md shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
                  <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-gradient-to-tr from-indigo-600 to-cyan-500 text-xs font-black text-white">
                    {username ? username.charAt(0).toUpperCase() : "A"}
                  </div>
                  {/* Micro online beacon */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0c101d] shadow-[0_0_6px_#10b981]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ==================== CONTENT BODY ==================== */}
        <div className="p-6 lg:p-10 pb-24 lg:pb-10 flex-1">{children}</div>

        {/* ==================== BOTTOM FIXED MOBILE NAVIGATION ==================== */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 border-t border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#07090e]/95 backdrop-blur-2xl shadow-2xl px-4 py-2 lg:hidden transition-colors duration-300">
          {mobileDockMenu.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 ${
                  active
                    ? "text-indigo-600 dark:text-cyan-400 font-bold"
                    : "text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium"
                }`}
              >
                {active && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_#6366f1]" />
                )}
                <span className={`material-symbols-outlined text-[20px] transition-transform ${active ? "material-filled scale-110 drop-shadow-xs" : ""}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ==================== FOOTER ==================== */}
        <footer className="mx-auto w-full flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 dark:border-white/[0.06] bg-white/60 dark:bg-[#07090e]/60 px-6 py-6 text-xs font-medium text-slate-500 dark:text-zinc-500 sm:flex-row lg:px-10 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-headline font-black text-slate-800 dark:text-white">The Kinetic Vault Admin Control Panel</span>
            <span>· Enterprise Edition</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-slate-500 dark:text-zinc-400">Hệ thống bảo mật 2FA & RBAC kích hoạt</span>
          </div>
        </footer>
      </main>

    </div>
  );
}
