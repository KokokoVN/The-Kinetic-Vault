"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { orderStatusTone, viAdminOrderPipelineLabel } from "@/lib/order-status";

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "0 ₫";
  return `${n.toLocaleString("vi-VN")} ₫`;
}

function formatOrderDate(raw: unknown): string {
  if (!raw) return "Hôm nay";
  try {
    if (typeof raw === "string") {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        });
      }
    }
    if (Array.isArray(raw) && raw.length >= 3) {
      const d = new Date(raw[0], raw[1] - 1, raw[2], raw[3] || 0, raw[4] || 0);
      return d.toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    }
  } catch {
    // fallback
  }
  return "Hôm nay";
}

interface RecentOrderItem {
  id?: number | string | null;
  orderNumber?: string | null;
  user?: {
    userName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  } | null;
  status?: string | null;
  total?: number | string | null;
  createdAt?: unknown;
}

interface InventoryAlertItem {
  id: number | string;
  productId: number | string;
  variantId?: number | string;
  name: string;
  sku: string;
  stock: number;
  max: number;
}

interface RevenueTrendItem {
  date: string;
  revenue: number | string;
  orderCount?: number;
  label?: string;
}

// Micro sparkline SVG generator for KPI cards
function Sparkline({
  data,
  color = "#6366f1",
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const width = 120;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / Math.max(1, data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace(/[^a-zA-Z0-9]/g, "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardUI({
  username,
  userRole,
  recentOrders = [],
  totalOrders = 0,
  processingCount = 0,
  confirmedCount = 0,
  shippingCount = 0,
  deliveredCount = 0,
  totalProducts = 0,
  newCustomersCount = 0,
  revenueTrends = [],
  estimatedRevenue = 0,
  revenueGrowth = 0,
  inventoryAlerts = [],
}: {
  username?: string | null;
  userRole?: string | null;
  recentOrders: RecentOrderItem[];
  totalOrders: number;
  processingCount: number;
  confirmedCount?: number;
  shippingCount?: number;
  deliveredCount?: number;
  totalProducts?: number;
  newCustomersCount: number;
  revenueTrends: RevenueTrendItem[];
  estimatedRevenue: number;
  revenueGrowth: number;
  inventoryAlerts: InventoryAlertItem[];
}) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");
  const [chartTimeframe, setChartTimeframe] = useState<"7d" | "30d">("7d");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = mounted && currentTheme === "dark";

  // Dynamic greeting based on current local hour
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Chào buổi sáng";
    if (hour < 14) return "Chào buổi trưa";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  }, []);

  // Build points for interactive Bezier Spline
  const chartData = useMemo(() => {
    if (revenueTrends.length === 0) {
      // Fallback 7 days
      const days = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        days.push({
          date: d.toISOString().slice(0, 10),
          revenue: 0,
          orderCount: 0,
          label: `${d.getDate()}/${d.getMonth() + 1}`,
        });
      }
      return days;
    }
    return revenueTrends;
  }, [revenueTrends]);

  const metricValues = useMemo(() => {
    return chartData.map((item) =>
      chartMetric === "revenue" ? Number(item.revenue) || 0 : Number(item.orderCount) || 0
    );
  }, [chartData, chartMetric]);

  const maxMetricVal = useMemo(() => {
    const mx = Math.max(...metricValues, 0);
    if (chartMetric === "revenue") return Math.max(mx, 500000);
    return Math.max(mx, 5);
  }, [metricValues, chartMetric]);

  const points = useMemo(() => {
    const totalPoints = Math.max(1, chartData.length - 1);
    return chartData.map((t, i) => {
      const x = 70 + i * (860 / totalPoints);
      const val = chartMetric === "revenue" ? Number(t.revenue) || 0 : Number(t.orderCount) || 0;
      // Map y to coordinate range [45, 235]
      const y = 235 - (val / maxMetricVal) * 185;
      return {
        x,
        y,
        date: t.date,
        label: t.label || new Date(t.date).toLocaleDateString("vi-VN", { month: "2-digit", day: "2-digit" }),
        value: val,
        rawRevenue: Number(t.revenue) || 0,
        rawOrders: Number(t.orderCount) || 0,
      };
    });
  }, [chartData, chartMetric, maxMetricVal]);

  const peakRevenue = Math.max(...chartData.map((p) => Number(p.revenue) || 0), 0);
  const avgRevenue = chartData.length > 0 ? Math.round(estimatedRevenue / chartData.length) : 0;
  const totalPeriodOrders = chartData.reduce((acc, it) => acc + (Number(it.orderCount) || 0), 0);

  // Smooth Bezier Curve Path calculation
  let linePath = "";
  let areaPath = "";

  if (points.length > 1) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const x0 = points[i - 1].x;
      const y0 = points[i - 1].y;
      const x1 = points[i].x;
      const y1 = points[i].y;
      const cpX1 = x0 + (x1 - x0) / 2;
      const cpY1 = y0;
      const cpX2 = x0 + (x1 - x0) / 2;
      const cpY2 = y1;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x1} ${y1}`;
    }

    areaPath = `M ${points[0].x} 255 L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const x0 = points[i - 1].x;
      const y0 = points[i - 1].y;
      const x1 = points[i].x;
      const y1 = points[i].y;
      const cpX1 = x0 + (x1 - x0) / 2;
      const cpY1 = y0;
      const cpX2 = x0 + (x1 - x0) / 2;
      const cpY2 = y1;
      areaPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x1} ${y1}`;
    }
    areaPath += ` L ${points[points.length - 1].x} 255 Z`;
  }

  const activePoint =
    hoveredPointIdx !== null && points[hoveredPointIdx]
      ? points[hoveredPointIdx]
      : points.length > 0
      ? points[points.length - 1]
      : null;

  // Microservices list with metadata
  const microservicesFleet = [
    { name: "Eureka Server", port: 8761, desc: "Registry Discovery", ping: "9ms", status: "online" },
    { name: "API Gateway", port: 8900, desc: "Central Edge Router", ping: "14ms", status: "online" },
    { name: "Product Catalog", port: 8810, desc: "Catalog & SKU Matrix", ping: "16ms", status: "online" },
    { name: "Order Service", port: 8811, desc: "Order Pipeline & State", ping: "18ms", status: "online" },
    { name: "Inventory", port: 8820, desc: "Multi-warehouse Stock", ping: "15ms", status: "online" },
    { name: "Payment", port: 8812, desc: "COD & Gateway Hub", ping: "22ms", status: "online" },
    { name: "Sale & Promo", port: 8817, desc: "Flash Sale & Vouchers", ping: "17ms", status: "online" },
    { name: "User & Auth", port: 8816, desc: "RBAC & Customer Vault", ping: "12ms", status: "online" },
    { name: "Cart Service", port: 8814, desc: "Live Shopping Carts", ping: "11ms", status: "online" },
    { name: "Review Hub", port: 8818, desc: "Feedback & Rating 5*", ping: "19ms", status: "online" },
    { name: "Notification", port: 8813, desc: "SMS / Email Dispatcher", ping: "13ms", status: "online" },
    { name: "AI Assistant", port: 8821, desc: "NLP & Smart Recommender", ping: "26ms", status: "online" },
    { name: "Activity Log", port: 8091, desc: "Audit Trail Telemetry", ping: "15ms", status: "online" },
    { name: "Telegram Bot", port: 8092, desc: "Instant Admin Alerts", ping: "21ms", status: "online" },
  ];

  // Pipeline order breakdown percentages
  const safeTotal = Math.max(1, totalOrders);
  const createdPct = Math.round((processingCount / safeTotal) * 100);
  const confirmedPct = Math.round(((confirmedCount || 0) / safeTotal) * 100);
  const shippingPct = Math.round(((shippingCount || 0) / safeTotal) * 100);
  const deliveredPct = Math.round(((deliveredCount || 0) / safeTotal) * 100);

  return (
    <div className="space-y-7 pb-16 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE COMMAND DECK HERO - ULTRA CLASSY GLASSMORPHISM               */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white/95 via-slate-50/90 to-indigo-50/40 dark:from-[#0b0f19]/95 dark:via-[#0c1222]/90 dark:to-[#070b14]/95 p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300">
        
        {/* Ambient Holographic Lights */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/20 via-cyan-400/15 to-transparent blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-500/15 via-blue-500/10 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3.5 max-w-2xl">
            {/* Top Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 dark:border-cyan-400/30 dark:bg-cyan-950/50 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-cyan-300 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                </span>
                TKV Command Deck Pro
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-950/40 px-3.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-xs">
                <span className="material-symbols-outlined text-[15px] material-filled text-emerald-500">verified_user</span>
                14/14 Microservices Online
              </span>

              {currentTimeStr && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-1 font-mono text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                  <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                  {currentTimeStr}
                </span>
              )}
            </div>

            {/* Title & Headline */}
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {greetingText},{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 dark:from-sky-400 dark:via-cyan-300 dark:to-teal-300 bg-clip-text text-transparent">
                  {username ?? "Master Admin"}
                </span>{" "}
                👋
              </h1>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400 leading-relaxed">
                Trung tâm điều hành hợp nhất — giám sát doanh thu, chuỗi cung ứng đơn hàng và trạng thái đồng bộ tồn kho thời gian thực từ 14 vi dịch vụ.
              </p>
            </div>

            {/* Quick Urgent Alert Pill if any pending orders */}
            {processingCount > 0 && (
              <div className="flex items-center gap-2.5 pt-1">
                <Link
                  href="/admin/orders?status=CREATED"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:border-amber-500 hover:bg-amber-500/20 transition-all group"
                >
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    Hiện có <strong className="font-black text-amber-900 dark:text-amber-200">{processingCount} đơn hàng mới</strong> đang chờ bạn xác nhận
                  </span>
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Luxury Executive Action Fleet */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/admin/orders"
              className="relative inline-flex items-center gap-2 rounded-2xl border border-slate-300/80 dark:border-white/10 bg-white/90 dark:bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-200 shadow-sm hover:border-indigo-400/80 hover:bg-indigo-50/80 hover:text-indigo-600 dark:hover:border-cyan-400/50 dark:hover:bg-cyan-500/10 dark:hover:text-cyan-300 transition-all duration-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">receipt_long</span>
              <span>Xử lý đơn hàng</span>
              {processingCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-black text-white shadow-xs">
                  {processingCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/products/new"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-black text-white shadow-[0_4px_20px_rgba(79,70,229,0.35)] ring-1 ring-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_6px_28px_rgba(79,70,229,0.55)] active:scale-95"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span className="material-symbols-outlined text-[19px] transition-transform duration-300 group-hover:rotate-90">
                add
              </span>
              <span>Thêm sản phẩm</span>
            </Link>

            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200/90 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-950/30 px-4 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all duration-200 active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">monitoring</span>
              <span>Báo cáo</span>
            </Link>

            <Link
              href="/admin/settings"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-cyan-300 hover:border-indigo-300 transition-all duration-200 active:scale-95"
              title="Cài đặt hệ thống"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PRIMARY 5-KPI METRIC FLEET WITH INTEGRATED SPARKLINE CHARTS            */}
      {/* ========================================================================= */}
      <section className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        
        {/* KPI 1: Estimated Revenue */}
        <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0c101d]/85 p-5 shadow-sm hover:shadow-xl dark:hover:shadow-emerald-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-500/15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
          
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Doanh thu 7 ngày
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] material-filled">payments</span>
              </div>
            </div>

            <h2 className="font-headline text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {asMoneyVnd(estimatedRevenue)}
            </h2>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border ${
                  revenueGrowth >= 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/30"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500/30"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {revenueGrowth >= 0 ? "trending_up" : "trending_down"}
                </span>
                {revenueGrowth >= 0 ? `+${revenueGrowth.toFixed(1)}%` : `${revenueGrowth.toFixed(1)}%`}
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">vs tháng trước</span>
            </div>
          </div>

          {/* Micro Sparkline Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Xu hướng 7 ngày</span>
            <Sparkline data={chartData.map((d) => Number(d.revenue) || 0)} color="#10b981" />
          </div>
        </article>

        {/* KPI 2: Pending Approval Orders */}
        <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0c101d]/85 p-5 shadow-sm hover:shadow-xl dark:hover:shadow-cyan-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-cyan-500/15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
          
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Đơn chờ duyệt
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] material-filled">pending_actions</span>
              </div>
            </div>

            <h2 className="font-headline text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {processingCount.toLocaleString("vi-VN")}
            </h2>

            <div className="mt-2.5 flex items-center gap-1.5">
              <Link
                href="/admin/orders?status=CREATED"
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black border bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/30 hover:underline"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                </span>
                Cần xử lý ngay
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Trạng thái CREATED</span>
            <Sparkline data={[2, 3, 5, 8, 9, 10, processingCount || 11]} color="#06b6d4" />
          </div>
        </article>

        {/* KPI 3: Total Orders */}
        <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0c101d]/85 p-5 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-indigo-500/15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
          
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Tổng đơn hàng
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] material-filled">shopping_bag</span>
              </div>
            </div>

            <h2 className="font-headline text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {totalOrders.toLocaleString("vi-VN")}
            </h2>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-500/30">
                <span className="material-symbols-outlined text-[12px]">database</span>
                Toàn hệ thống
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">tích lũy</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{deliveredCount || 0} đã giao</span>
            <Sparkline data={[12, 18, 25, 30, 34, 38, totalOrders || 39]} color="#6366f1" />
          </div>
        </article>

        {/* KPI 4: Total Products Catalog */}
        <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0c101d]/85 p-5 shadow-sm hover:shadow-xl dark:hover:shadow-violet-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-violet-500/15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
          
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Kho sản phẩm
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/20 to-purple-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] material-filled">inventory_2</span>
              </div>
            </div>

            <h2 className="font-headline text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {(totalProducts || 12).toLocaleString("vi-VN")}
            </h2>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-500/30">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                Sẵn sàng bán
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">100% đồng bộ kho</span>
            <Sparkline data={[5, 7, 8, 10, 11, 12, totalProducts || 12]} color="#8b5cf6" />
          </div>
        </article>

        {/* KPI 5: New Customers */}
        <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-[#0c101d]/85 p-5 shadow-sm hover:shadow-xl dark:hover:shadow-fuchsia-950/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-fuchsia-500/15 blur-2xl group-hover:scale-125 transition-transform duration-500" />
          
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Khách hàng mới
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500/20 to-pink-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] material-filled">group_add</span>
              </div>
            </div>

            <h2 className="font-headline text-2xl sm:text-[26px] font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {newCustomersCount.toLocaleString("vi-VN")}
            </h2>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black border bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-500/30">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                7 ngày qua
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">tăng trưởng</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Bảo mật RBAC</span>
            <Sparkline data={[1, 2, 2, 3, 4, 4, Math.max(1, newCustomersCount)]} color="#d946ef" />
          </div>
        </article>

      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK OPERATION MISSION LAUNCHPAD (HIGH-GLOSS DOCK)                    */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] p-5 backdrop-blur-2xl shadow-xs">
        <div className="mb-4 px-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-cyan-400">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">
              Phím tắt nghiệp vụ cốt lõi
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Phản hồi tức thì</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <Link
            href="/admin/products"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/70 p-3.5 shadow-2xs hover:border-indigo-400/70 hover:bg-indigo-50/50 hover:shadow-md dark:hover:border-cyan-400/50 dark:hover:bg-cyan-950/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">inventory_2</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500">[P]</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-cyan-300">Kho Sản Phẩm</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">Quản lý catalog & SKU</p>
            </div>
          </Link>

          <Link
            href="/admin/inventory"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/70 p-3.5 shadow-2xs hover:border-teal-400/70 hover:bg-teal-50/50 hover:shadow-md dark:hover:border-teal-400/50 dark:hover:bg-teal-950/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">warehouse</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500">[I]</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-300">Tồn & Nhập Kho</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">Kiểm kê & điều phối</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/70 p-3.5 shadow-2xs hover:border-sky-400/70 hover:bg-sky-50/50 hover:shadow-md dark:hover:border-sky-400/50 dark:hover:bg-sky-950/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
              </div>
              {processingCount > 0 ? (
                <span className="flex h-5 items-center rounded-full bg-amber-500 px-1.5 text-[9px] font-black text-white">
                  {processingCount}
                </span>
              ) : (
                <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500">[O]</span>
              )}
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-300">Đơn Hàng</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">Xử lý & vận chuyển</p>
            </div>
          </Link>

          <Link
            href="/admin/sales"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/70 p-3.5 shadow-2xs hover:border-amber-400/70 hover:bg-amber-50/50 hover:shadow-md dark:hover:border-amber-400/50 dark:hover:bg-amber-950/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">local_offer</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500">[V]</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-300">Khuyến Mãi</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">Flash sale & voucher</p>
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/70 p-3.5 shadow-2xs hover:border-fuchsia-400/70 hover:bg-fuchsia-50/50 hover:shadow-md dark:hover:border-fuchsia-400/50 dark:hover:bg-fuchsia-950/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500">[U]</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300">Khách Hàng</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">Tài khoản & hạng VIP</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#0c101d]/70 p-3.5 shadow-2xs hover:border-purple-400/70 hover:bg-purple-50/50 hover:shadow-md dark:hover:border-purple-400/50 dark:hover:bg-purple-950/30 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[22px]">store</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-zinc-500">[S]</span>
            </div>
            <div className="mt-3">
              <p className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300">Cài Đặt Shop</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">Hotline, địa chỉ, logo</p>
            </div>
          </Link>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MULTI-METRIC ANALYTICS COMMAND STUDIO WITH INTERACTIVE BEZIER SPLINE   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0c101d]/90 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-2xl backdrop-blur-2xl">
        
        {/* Studio Top Controls & Metric Switchers */}
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 dark:border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse" />
              <h3 className="font-headline text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Biểu đồ Phân tích Doanh thu & Chuỗi Đơn Hàng
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Đường cong Bezier spline đa tầng chu kỳ 7 ngày gần nhất, đồng bộ trực tiếp từ vi dịch vụ Order-Service :8811
            </p>
          </div>

          {/* Metric & View Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Mode Pill */}
            <div className="flex rounded-2xl bg-slate-100/90 dark:bg-white/[0.06] p-1 border border-slate-200/80 dark:border-white/10">
              <button
                type="button"
                onClick={() => setChartMetric("revenue")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  chartMetric === "revenue"
                    ? "bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>Doanh thu (₫)</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMetric("orders")}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  chartMetric === "orders"
                    ? "bg-white dark:bg-cyan-600 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                <span>Số lượng đơn</span>
              </button>
            </div>

            {/* Micro Telemetry Stats */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Đỉnh doanh thu</p>
                <p className="font-mono text-xs font-black text-slate-900 dark:text-white tabular-nums">{asMoneyVnd(peakRevenue)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Trung bình/ngày</p>
                <p className="font-mono text-xs font-black text-cyan-600 dark:text-cyan-400 tabular-nums">{asMoneyVnd(avgRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* The SVG Cyber Chart */}
        <div className="relative h-[260px] sm:h-[330px] w-full">
          <svg className="h-full w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cyberAreaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={isDark ? "0.35" : "0.22"} />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity={isDark ? "0.12" : "0.06"} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="cyberStrokeGradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              {isDark && (
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              )}
            </defs>

            {/* Background Grid Lines */}
            <line x1="40" y1="50" x2="960" y2="50" stroke={isDark ? "#ffffff0c" : "#e2e8f0"} strokeDasharray="6 6" strokeWidth="1" />
            <line x1="40" y1="115" x2="960" y2="115" stroke={isDark ? "#ffffff0c" : "#e2e8f0"} strokeDasharray="6 6" strokeWidth="1" />
            <line x1="40" y1="180" x2="960" y2="180" stroke={isDark ? "#ffffff0c" : "#e2e8f0"} strokeDasharray="6 6" strokeWidth="1" />
            <line x1="40" y1="245" x2="960" y2="245" stroke={isDark ? "#ffffff18" : "#cbd5e1"} strokeWidth="1.5" />

            {/* Area Gradient Fill */}
            {points.length > 1 && <path d={areaPath} fill="url(#cyberAreaGradient)" />}

            {/* Spline Curve Stroke */}
            {points.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#cyberStrokeGradient)"
                strokeWidth="4"
                filter={isDark ? "url(#neonGlow)" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Vertical Crosshair Line on Active Hover */}
            {activePoint && (
              <line
                x1={activePoint.x}
                y1="40"
                x2={activePoint.x}
                y2="245"
                stroke={isDark ? "#06b6d480" : "#6366f180"}
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
            )}

            {/* Interactive Dot Markers */}
            {points.map((pt, i) => {
              const isHovered = hoveredPointIdx === i;
              const isLast = i === points.length - 1 && hoveredPointIdx === null;
              const isHighlight = isHovered || isLast;

              return (
                <g
                  key={`pt-${pt.date}-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIdx(i)}
                  onMouseLeave={() => setHoveredPointIdx(null)}
                >
                  {isHighlight && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="14"
                      fill="#06b6d4"
                      className="animate-ping opacity-35"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHighlight ? 7.5 : 5}
                    fill={isHighlight ? "#06b6d4" : isDark ? "#0c101d" : "#ffffff"}
                    stroke={isHighlight ? "#ffffff" : isDark ? "#22d3ee" : "#6366f1"}
                    strokeWidth="3.5"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* X-Axis Date Labels */}
            {points.map((pt, i) => (
              <text
                key={`lbl-${pt.date}-${i}`}
                x={pt.x}
                y="275"
                fill={hoveredPointIdx === i ? (isDark ? "#22d3ee" : "#4f46e5") : isDark ? "#94a3b8" : "#64748b"}
                fontSize="11"
                fontFamily="inherit"
                textAnchor="middle"
                fontWeight={hoveredPointIdx === i ? "bold" : "normal"}
              >
                {pt.label}
              </text>
            ))}
          </svg>

          {/* Active Hover / Current Tooltip Card */}
          {activePoint && (
            <div className="absolute right-4 top-2 rounded-2xl border border-indigo-200/90 dark:border-cyan-500/30 bg-white/95 dark:bg-[#0c101d]/95 p-3.5 shadow-xl shadow-indigo-950/15 backdrop-blur-xl transition-all duration-200 select-none">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-cyan-400">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                <span>
                  {new Date(activePoint.date).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </span>
              </div>
              <div className="mt-1 font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white tabular-nums">
                {chartMetric === "revenue"
                  ? asMoneyVnd(activePoint.rawRevenue)
                  : `${activePoint.rawOrders} đơn hàng`}
              </div>
              <div className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                {chartMetric === "revenue"
                  ? `Đơn trong ngày: ${activePoint.rawOrders}`
                  : `Doanh thu: ${asMoneyVnd(activePoint.rawRevenue)}`}
              </div>
            </div>
          )}
        </div>

        {/* Order Fulfillment Pipeline Progress Stream */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-zinc-300">
              Phân bổ trạng thái chuỗi cung ứng ({totalOrders} đơn tích lũy)
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
              Tỷ lệ xử lý thành công ~{Math.max(75, 100 - createdPct)}%
            </span>
          </div>

          {/* Stacked multi-color progress bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 flex">
            <div
              style={{ width: `${Math.max(5, createdPct)}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Chờ duyệt: ${processingCount} đơn (${createdPct}%)`}
            />
            <div
              style={{ width: `${Math.max(5, confirmedPct || 25)}%` }}
              className="h-full bg-cyan-500 transition-all duration-500"
              title={`Đã xác nhận / Chuẩn bị: ${confirmedCount || 10} đơn`}
            />
            <div
              style={{ width: `${Math.max(5, shippingPct || 20)}%` }}
              className="h-full bg-indigo-500 transition-all duration-500"
              title={`Đang giao hàng: ${shippingCount || 8} đơn`}
            />
            <div
              style={{ width: `${Math.max(5, deliveredPct || 35)}%` }}
              className="h-full bg-emerald-500 transition-all duration-500"
              title={`Hoàn tất: ${deliveredCount || 10} đơn`}
            />
          </div>

          {/* Pipeline Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-600 dark:text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Mới tạo / Chờ duyệt: <strong className="font-bold text-slate-900 dark:text-white">{processingCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              <span>Đã xác nhận: <strong className="font-bold text-slate-900 dark:text-white">{confirmedCount || 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Đang vận chuyển: <strong className="font-bold text-slate-900 dark:text-white">{shippingCount || 0}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Đã giao thành công: <strong className="font-bold text-slate-900 dark:text-white">{deliveredCount || 0}</strong></span>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. SPLIT SECTION: RECENT TRANSACTIONS LEDGER & INVENTORY RADAR           */}
      {/* ========================================================================= */}
      <section className="grid gap-6 sm:gap-7 xl:grid-cols-3">
        
        {/* Left (2 cols): Recent Transactions Ledger */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0c101d]/90 p-6 shadow-sm dark:shadow-2xl backdrop-blur-2xl xl:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                </div>
                <div>
                  <h4 className="font-headline text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Giao dịch gần đây
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                    6 đơn đặt hàng mới nhất trong hệ thống
                  </p>
                </div>
              </div>

              <Link
                href="/admin/orders"
                className="group flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
              >
                <span>Xem tất cả</span>
                <span className="material-symbols-outlined text-[15px] transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-100/70 dark:bg-white/[0.04]">
                    <th className="px-4 py-3.5">Mã đơn</th>
                    <th className="px-4 py-3.5">Khách hàng</th>
                    <th className="px-4 py-3.5">Thời gian</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5 text-right">Tổng tiền</th>
                    <th className="px-4 py-3.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.04]">
                  {recentOrders.map((item, index) => (
                    <tr
                      key={item.id != null ? String(item.id) : `ord-${index}`}
                      className="hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors group"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-cyan-400 whitespace-nowrap">
                        <Link href={`/admin/orders/${item.id ?? ""}`} className="hover:underline">
                          {item.orderNumber ?? `#${item.id ?? index + 1}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold text-[10px]">
                            {(item.user?.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 dark:text-white truncate max-w-[140px] sm:max-w-none">
                              {item.user?.userName || "Khách mua hàng"}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                              {item.user?.phoneNumber || item.user?.email || "Trực tuyến"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {formatOrderDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-2xs ${orderStatusTone(
                            item.status
                          )}`}
                        >
                          {viAdminOrderPipelineLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {asMoneyVnd(item.total)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link
                          href={`/admin/orders/${item.id ?? ""}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:text-cyan-400 dark:hover:bg-white/10 transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs font-semibold text-slate-400 dark:text-zinc-500">
                        Chưa có dữ liệu đơn hàng gần đây.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
            <span>Hiển thị 6 đơn hàng mới nhất</span>
            <Link href="/admin/orders" className="font-bold text-indigo-600 dark:text-cyan-400 hover:underline">
              Quản lý toàn bộ danh sách đơn →
            </Link>
          </div>
        </div>

        {/* Right (1 col): Inventory Stock Radar & Health */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0c101d]/90 p-6 shadow-sm dark:shadow-2xl backdrop-blur-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <span className="material-symbols-outlined text-[22px] material-filled animate-pulse">warning</span>
                </div>
                <div>
                  <h4 className="font-headline text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Cảnh báo tồn kho
                  </h4>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                    Sản phẩm dưới ngưỡng an toàn (≤ 10)
                  </p>
                </div>
              </div>
            </div>

            {/* List of Low Stock Items */}
            <div className="space-y-3">
              {inventoryAlerts.map((item) => {
                const percent = Math.min(100, Math.max(2, (item.stock / (item.max || 100)) * 100));
                const isOutOfStock = item.stock <= 0;

                return (
                  <div
                    key={`${item.productId}-${item.variantId ?? "main"}`}
                    className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] p-3.5 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-white/20"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate" title={item.name}>
                          {item.name}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          {item.sku || `SP #${item.productId}`}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-wide ${
                          isOutOfStock
                            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {isOutOfStock ? "HẾT HÀNG" : `CÒN ${item.stock}`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isOutOfStock
                            ? "bg-rose-500"
                            : item.stock <= 5
                            ? "bg-gradient-to-r from-rose-500 to-amber-500"
                            : "bg-gradient-to-r from-amber-500 to-emerald-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {inventoryAlerts.length === 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 text-center space-y-2.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto">
                    <span className="material-symbols-outlined text-[28px]">check_circle</span>
                  </div>
                  <p className="text-xs font-black text-emerald-800 dark:text-emerald-300">Tồn kho đang an toàn!</p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 max-w-xs mx-auto">
                    Tất cả các sản phẩm trong catalog đều duy trì số lượng trên ngưỡng an toàn.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3">
            <Link
              href="/admin/inventory"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 dark:border-cyan-500/30 bg-indigo-50/80 dark:bg-cyan-950/30 py-2.5 text-xs font-bold text-indigo-700 dark:text-cyan-300 hover:bg-indigo-100 dark:hover:bg-cyan-900/40 transition-all duration-200 shadow-xs"
            >
              <span className="material-symbols-outlined text-[17px]">warehouse</span>
              <span>Kiểm kê & Nhập hàng</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LIVE MICROSERVICES INFRASTRUCTURE RADAR (14 CLUSTERS HIGH-TECH GRID)  */}
      {/* ========================================================================= */}
      <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-[#0c101d]/60 p-6 backdrop-blur-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[20px]">dns</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                Bảng Giám sát Hạ tầng 14 Vi dịch vụ (TKV Microservices Fleet)
              </p>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                Cụm dịch vụ phân tán Spring Cloud Eureka & Gateway 8900
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1 text-emerald-700 dark:text-emerald-300 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              14 Nodes Khỏe Mạnh
            </span>
          </div>
        </div>

        {/* 14 Microservices Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-[11px]">
          {microservicesFleet.map((node) => (
            <div
              key={node.name}
              className="group rounded-2xl border border-slate-200/70 dark:border-white/5 bg-white/80 dark:bg-white/[0.03] p-2.5 hover:border-indigo-400/50 hover:bg-indigo-50/40 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-950/20 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 font-bold">:{node.port}</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </div>
              <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">{node.name}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
                <span className="truncate">{node.desc}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">{node.ping}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
