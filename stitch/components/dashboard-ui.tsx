"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { orderStatusTone, viAdminOrderPipelineLabel } from "@/lib/order-status";

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

export function DashboardUI({
  recentOrders,
  totalOrders,
  processingCount,
  newCustomersCount,
  revenueTrends,
  estimatedRevenue,
  revenueGrowth,
  inventoryAlerts,
}: {
  recentOrders: any[];
  totalOrders: number;
  processingCount: number;
  newCustomersCount: number;
  revenueTrends: any[];
  estimatedRevenue: number;
  revenueGrowth: number;
  inventoryAlerts: any[];
}) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = mounted && currentTheme === "dark";

  // Styles adaptive to light/dark themes
  const bgMain = isDark ? "bg-[#0b0f19] text-slate-200" : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100";
  const bgCard = isDark 
    ? "bg-slate-900/60 border-slate-900 shadow-2xl backdrop-blur-xl" 
    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 shadow-sm shadow-slate-100 backdrop-blur-xl";
  const textTitle = isDark ? "text-white" : "text-slate-900";
  const textSub = isDark ? "text-slate-400" : "text-slate-500";
  const bgTable = isDark ? "bg-slate-950/30 border-slate-800/80" : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60";
  const rowHover = isDark ? "hover:bg-slate-900/40" : "hover:bg-slate-100/50 dark:bg-slate-800/50";
  const svgLine = isDark ? "#6366f1" : "#4f46e5"; // Indigo curve line
  const svgPoint = isDark ? "#0f172a" : "#ffffff";
  const gridLine = isDark ? "#1e293b" : "#f1f5f9";

  // Calculate Bezier points for chart (safe height bounds)
  const points = (revenueTrends || []).map((t, i) => {
    const x = 100 + i * (900 / Math.max(1, revenueTrends.length - 1));
    const y = Math.max(50, 250 - (estimatedRevenue > 0 ? (Number(t.revenue) / estimatedRevenue) * 160 : 0));
    return { x, y, date: t.date, revenue: t.revenue };
  });

  // Calculate Bezier curve path string
  let linePath = "";
  let areaPath = "";

  if (points.length > 1) {
    // Line Path
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

    // Area Path (closed polygon)
    areaPath = `M ${points[0].x} 250 L ${points[0].x} ${points[0].y}`;
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
    areaPath += ` L ${points[points.length - 1].x} 250 Z`;
  }

  return (
    <div className={`min-h-[calc(100vh-80px)] transition-colors duration-500 ${bgMain}`}>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        
        {/* ==================== HEADER SECTION ==================== */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest w-fit ${
              isDark 
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" 
                : "border-cyan-600/30 bg-cyan-50 text-cyan-700"
            }`}>
              <span className="material-symbols-outlined text-[12px]">rocket_launch</span>
              Command Center
            </div>
            <h1 className={`font-headline text-2xl sm:text-4xl font-black tracking-tight ${textTitle} ${isDark ? "drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]" : ""}`}>
              Tổng quan Hệ thống
            </h1>
            <p className={`font-medium text-xs sm:text-base ${textSub}`}>Báo cáo hiệu suất kinh doanh theo thời gian thực.</p>
          </div>
        </div>

        {/* ==================== SUMMARY STATS CARDS ==================== */}
        <section className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          
          {/* Card 1: Revenue */}
          <article className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${bgCard} hover:-translate-y-1 hover:shadow-lg`}>
            {/* Glowing Accent Overlay */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl transition-all duration-500 group-hover:scale-125" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  Tổng doanh thu
                </p>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-inner">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px] material-filled">payments</span>
                </div>
              </div>
              <div>
                <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
                  {asMoneyVnd(estimatedRevenue)}
                </h2>
                <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {revenueGrowth !== 0 ? (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black border ${
                      revenueGrowth > 0 
                        ? (isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-250")
                        : (isDark ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-rose-50 text-rose-700 border-rose-250")
                    }`}>
                      <span className="material-symbols-outlined text-[9px] sm:text-[10px]">{revenueGrowth > 0 ? 'trending_up' : 'trending_down'}</span>
                      {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black border ${isDark ? "bg-slate-50 dark:bg-slate-8000/20 text-slate-400 border-slate-500/30" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"}`}>
                      <span className="material-symbols-outlined text-[9px] sm:text-[10px]">remove</span>
                      0%
                    </span>
                  )}
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${textSub}`}>so với tháng trước</span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 2: Confirmed Orders */}
          <article className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${bgCard} hover:-translate-y-1 hover:shadow-lg`}>
            {/* Glowing Accent Overlay */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-500/10 blur-xl transition-all duration-500 group-hover:scale-125" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                  Chờ xác nhận
                </p>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 shadow-inner">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px] material-filled">pending_actions</span>
                </div>
              </div>
              <div>
                <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
                  {processingCount.toLocaleString("vi-VN")}
                </h2>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black border ${
                    isDark ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-cyan-50 text-cyan-700 border-cyan-200"
                  }`}>
                    <span className="relative flex h-1 w-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1 w-1 bg-cyan-500" />
                    </span>
                    Real-time
                  </span>
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${textSub}`}>Đang chờ duyệt</span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 3: Total Orders */}
          <article className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${bgCard} hover:-translate-y-1 hover:shadow-lg`}>
            {/* Glowing Accent Overlay */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-purple-500/10 blur-xl transition-all duration-500 group-hover:scale-125" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                  Tổng đơn hàng
                </p>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shadow-inner">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px] material-filled">receipt_long</span>
                </div>
              </div>
              <div>
                <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
                  {totalOrders.toLocaleString("vi-VN")}
                </h2>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black border ${
                    isDark ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}>
                    <span className="material-symbols-outlined text-[9px] sm:text-[10px]">database</span>
                    Hệ thống
                  </span>
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${textSub}`}>Tích lũy</span>
                </div>
              </div>
            </div>
          </article>

          {/* Card 4: New Customers */}
          <article className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${bgCard} hover:-translate-y-1 hover:shadow-lg`}>
            {/* Glowing Accent Overlay */}
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-fuchsia-500/10 blur-xl transition-all duration-500 group-hover:scale-125" />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? "text-fuchsia-400" : "text-fuchsia-600"}`}>
                  Khách hàng mới
                </p>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 shadow-inner">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px] material-filled">groups</span>
                </div>
              </div>
              <div>
                <h2 className={`font-headline text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textTitle}`}>
                  {newCustomersCount.toLocaleString("vi-VN")}
                </h2>
                <div className="mt-2.5 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black border ${
                    isDark ? "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30" : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"
                  }`}>
                    <span className="material-symbols-outlined text-[9px] sm:text-[10px]">group_add</span>
                    Mới
                  </span>
                  <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${textSub}`}>Trong 7 ngày</span>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* ==================== TREND CHART SECTION ==================== */}
        <section className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-6 lg:p-8 ${bgCard}`}>
          <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <h3 className={`font-headline text-lg sm:text-2xl font-black tracking-tight ${textTitle}`}>Xu hướng Doanh thu</h3>
              <p className={`text-xs font-medium ${textSub}`}>Biểu đồ tổng quan 7 ngày gần nhất sử dụng đường cong Bezier mượt mà</p>
            </div>
          </div>
          
          <div className="relative h-[220px] sm:h-[320px] w-full">
            <svg className="h-full w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity={isDark ? "0.35" : "0.2"} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
                {isDark && (
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                )}
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="50" x2="1000" y2="50" stroke={gridLine} strokeDasharray="6 6" strokeWidth="1" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke={gridLine} strokeDasharray="6 6" strokeWidth="1" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke={gridLine} strokeDasharray="6 6" strokeWidth="1" />
              
              {points.length > 1 ? (
                <>
                  {/* Shadow / Area gradient */}
                  <path d={areaPath} fill="url(#chartGradient)" />

                  {/* Bezier spline curve line */}
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke={svgLine} 
                    strokeWidth="4" 
                    filter={isDark ? "url(#glow)" : undefined} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />

                  {/* Interactive dots */}
                  {points.map((pt, i) => {
                    const isLast = i === points.length - 1;
                    return (
                      <g key={pt.date} className="cursor-pointer group/dot">
                        {isLast && (
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="12" 
                            fill={svgLine} 
                            className="animate-ping opacity-25" 
                          />
                        )}
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={isLast ? 7 : 5} 
                          fill={isLast ? svgLine : svgPoint} 
                          stroke={isLast ? "#fff" : svgLine} 
                          strokeWidth="3.5" 
                          className="transition-all duration-300 hover:r-8" 
                        />
                      </g>
                    );
                  })}

                  {/* Labels */}
                  {points.map((pt, i) => (
                    <text 
                      key={`text-${pt.date}`}
                      x={pt.x} 
                      y="280" 
                      fill={i === points.length - 1 ? svgLine : (isDark ? "#94a3b8" : "#64748b")} 
                      fontSize="12" 
                      fontFamily="var(--font-inter)"
                      textAnchor={i === points.length - 1 ? "end" : "middle"} 
                      fontWeight="bold"
                    >
                      {new Date(pt.date).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                    </text>
                  ))}
                </>
              ) : (
                <text x="500" y="150" fill={textSub} fontSize="16" textAnchor="middle" fontWeight="bold">Chưa đủ dữ liệu biểu đồ</text>
              )}
            </svg>
            
            {/* Tooltip Card Overlay for Current Date (Responsive absolute positioning) */}
            {points.length > 0 && (
              <div className={`absolute right-4 sm:right-6 top-4 sm:top-6 rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 shadow-xl backdrop-blur-md transition-colors duration-300 ${
                isDark 
                  ? "border-indigo-500/20 bg-indigo-950/40 text-white" 
                  : "border-indigo-100 bg-white/90 dark:bg-slate-900/90 text-indigo-950 shadow-indigo-100/50"
              }`}>
                <div className={`mb-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                  Mới nhất: {new Date(points[points.length - 1].date).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-sm sm:text-xl font-black">{asMoneyVnd(points[points.length - 1].revenue)}</div>
              </div>
            )}
          </div>
        </section>

        {/* ==================== BOTTOM TABLES & WIDGETS ==================== */}
        <section className="grid gap-6 sm:gap-8 xl:grid-cols-3">
          
          {/* Recent Transactions list */}
          <div className={`space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${bgCard} xl:col-span-2`}>
            <div className="flex items-center justify-between">
              <h4 className={`font-headline text-base sm:text-xl font-black ${textTitle}`}>Giao dịch gần đây</h4>
              <Link href="/admin/orders" className={`flex items-center gap-1 text-[11px] sm:text-xs font-bold hover:underline transition-colors ${
                isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
              }`}>
                Xem toàn bộ <span className="material-symbols-outlined text-[12px] sm:text-[14px]">arrow_forward</span>
              </Link>
            </div>
            
            <div className={`overflow-x-auto rounded-2xl border ${bgTable}`}>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className={`border-b text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${
                    isDark ? "border-slate-800/85 text-slate-400" : "border-slate-200 dark:border-slate-700/60 text-slate-500"
                  }`}>
                    <th className="px-3 sm:px-5 py-4">Mã đơn</th>
                    <th className="px-3 sm:px-5 py-4">Khách hàng</th>
                    <th className="px-3 sm:px-5 py-4">Trạng thái</th>
                    <th className="px-3 sm:px-5 py-4 text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-200/60"}`}>
                  {recentOrders.map((item) => (
                    <tr key={item.id} className={`transition-colors duration-250 ${rowHover}`}>
                      <td className={`px-3 sm:px-5 py-3 sm:py-4 font-mono font-bold text-xs ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                        {item.orderNumber ?? `#${item.id}`}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full font-bold text-[10px] sm:text-xs shadow-sm ${
                            isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700 dark:text-slate-200"
                          }`}>
                            {(item.user?.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-semibold text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none ${textTitle}`}>
                            {item.user?.userName || "Khách vãng lai"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${orderStatusTone(item.status)}`}>
                          {viAdminOrderPipelineLabel(item.status)}
                        </span>
                      </td>
                      <td className={`px-3 sm:px-5 py-3 sm:py-4 text-right font-headline font-bold text-xs ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}>
                        {asMoneyVnd(item.total)}
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className={`px-5 py-8 text-center text-xs font-semibold ${textSub}`}>
                        Chưa có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Alerts list */}
          <div className={`space-y-4 sm:space-y-6 rounded-2xl sm:rounded-3xl border p-4 sm:p-6 transition-all duration-300 ${bgCard}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-2xl material-filled animate-pulse">warning</span>
              <h4 className={`font-headline text-base sm:text-xl font-black ${textTitle}`}>Cảnh báo Tồn kho</h4>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {inventoryAlerts.map((item) => {
                const percent = (item.stock / item.max) * 100;
                const isCritical = item.stock === 0;
                const isLow = item.stock > 0 && item.stock <= 10;
                
                return (
                  <div key={`${item.productId}-${item.variantId}`} className={`space-y-2 rounded-xl p-3 sm:p-4 border ${bgTable} shadow-sm`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`font-bold text-xs sm:text-sm truncate ${textTitle}`}>{item.name}</div>
                        <div className={`font-mono text-[9px] tracking-wide mt-0.5 ${textSub}`}>{item.sku}</div>
                      </div>
                      <span className={`text-[8px] sm:text-[9px] font-black px-2 py-0.5 sm:py-1 rounded-lg shrink-0 ${
                        isCritical 
                          ? (isDark ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-rose-50 text-rose-700 border border-rose-100') 
                          : (isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-100')
                      }`}>
                        {isCritical ? 'HẾT HÀNG' : `CÒN ${item.stock}`}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className={`h-1.5 sm:h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCritical 
                              ? 'bg-gradient-to-r from-rose-600 to-rose-400' 
                              : isLow 
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {inventoryAlerts.length === 0 && (
                <div className={`text-center py-6 font-semibold text-xs ${textSub}`}>Tất cả sản phẩm đều đủ hàng.</div>
              )}
            </div>
            
            <Link 
              href="/admin/products" 
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition-all border ${
                isDark 
                  ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white" 
                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
              }`}
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add_box</span>
              Quản lý Sản phẩm
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
