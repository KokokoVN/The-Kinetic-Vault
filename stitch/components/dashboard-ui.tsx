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

  // Colors for dark and light modes
  const bgMain = isDark ? "bg-[#0f172a] text-slate-200" : "bg-slate-50 text-slate-800";
  const bgCard = isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm";
  const textTitle = isDark ? "text-white" : "text-slate-900";
  const textSub = isDark ? "text-slate-400" : "text-slate-500";
  const bgTable = isDark ? "bg-black/20 border-white/5" : "bg-slate-50 border-slate-100";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-slate-100";
  const svgLine = isDark ? "#a855f7" : "#8b5cf6";
  const svgPoint = isDark ? "#0f172a" : "#ffffff";
  const gridLine = isDark ? "#334155" : "#e2e8f0";

  return (
    <div className={`min-h-[calc(100vh-80px)] transition-colors duration-500 ${bgMain}`}>
      <div className="space-y-8 p-6 lg:p-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest w-fit ${isDark ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" : "border-cyan-600/30 bg-cyan-50 text-cyan-700"}`}>
              <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
              Command Center
            </div>
            <h1 className={`font-headline text-4xl font-black tracking-tight ${textTitle} ${isDark ? "drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]" : ""}`}>
              Tổng quan Hệ thống
            </h1>
            <p className={`font-medium ${textSub}`}>Báo cáo hiệu suất kinh doanh theo thời gian thực.</p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Revenue Card */}
          <article className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all ${bgCard} ${isDark ? "hover:border-emerald-500/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)]" : "hover:border-emerald-400 hover:shadow-lg"}`}>
            <div className={`absolute -right-4 -top-4 rounded-full p-8 blur-2xl transition-all ${isDark ? "bg-emerald-500/20 group-hover:bg-emerald-500/40" : "bg-emerald-100 group-hover:bg-emerald-200"}`}></div>
            <div className="relative z-10">
              <p className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                <span className="material-symbols-outlined text-[16px]">payments</span>
                Tổng doanh thu
              </p>
              <h2 className={`font-headline text-3xl font-black ${textTitle} ${isDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : ""}`}>
                {asMoneyVnd(estimatedRevenue)}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                {revenueGrowth !== 0 && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${
                    revenueGrowth > 0 
                      ? (isDark ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200")
                      : (isDark ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-rose-50 text-rose-700 border-rose-200")
                  }`}>
                    <span className="material-symbols-outlined text-[12px]">{revenueGrowth > 0 ? 'trending_up' : 'trending_down'}</span>
                    {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                  </span>
                )}
                {revenueGrowth === 0 && (
                   <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${isDark ? "bg-slate-500/20 text-slate-400 border-slate-500/30" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                     <span className="material-symbols-outlined text-[12px]">remove</span>
                     0%
                   </span>
                )}
                <span className={`text-[10px] uppercase ${textSub}`}>so với tháng trước</span>
              </div>
            </div>
          </article>

          {/* Processing Orders Card */}
          <article className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all ${bgCard} ${isDark ? "hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.2)]" : "hover:border-cyan-400 hover:shadow-lg"}`}>
            <div className={`absolute -right-4 -top-4 rounded-full p-8 blur-2xl transition-all ${isDark ? "bg-cyan-500/20 group-hover:bg-cyan-500/40" : "bg-cyan-100 group-hover:bg-cyan-200"}`}></div>
            <div className="relative z-10">
              <p className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                Chờ xác nhận
              </p>
              <h2 className={`font-headline text-3xl font-black ${textTitle} ${isDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : ""}`}>
                {processingCount.toLocaleString("vi-VN")}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${isDark ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" : "bg-cyan-50 text-cyan-700 border-cyan-200"}`}>
                  Real-time
                </span>
                <span className={`text-[10px] uppercase ${textSub}`}>Cập nhật liên tục</span>
              </div>
            </div>
          </article>

          {/* Total Orders Card */}
          <article className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all ${bgCard} ${isDark ? "hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]" : "hover:border-purple-400 hover:shadow-lg"}`}>
            <div className={`absolute -right-4 -top-4 rounded-full p-8 blur-2xl transition-all ${isDark ? "bg-purple-500/20 group-hover:bg-purple-500/40" : "bg-purple-100 group-hover:bg-purple-200"}`}></div>
            <div className="relative z-10">
              <p className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Tổng đơn hàng
              </p>
              <h2 className={`font-headline text-3xl font-black ${textTitle} ${isDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : ""}`}>
                {totalOrders.toLocaleString("vi-VN")}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${isDark ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                  <span className="material-symbols-outlined text-[12px]">database</span>
                  Toàn thời gian
                </span>
                <span className={`text-[10px] uppercase ${textSub}`}>Tổng số hệ thống</span>
              </div>
            </div>
          </article>

          {/* Customers Card */}
          <article className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl transition-all ${bgCard} ${isDark ? "hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.2)]" : "hover:border-fuchsia-400 hover:shadow-lg"}`}>
            <div className={`absolute -right-4 -top-4 rounded-full p-8 blur-2xl transition-all ${isDark ? "bg-fuchsia-500/20 group-hover:bg-fuchsia-500/40" : "bg-fuchsia-100 group-hover:bg-fuchsia-200"}`}></div>
            <div className="relative z-10">
              <p className={`mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${isDark ? "text-fuchsia-400" : "text-fuchsia-600"}`}>
                <span className="material-symbols-outlined text-[16px]">groups</span>
                Khách hàng mới
              </p>
              <h2 className={`font-headline text-3xl font-black ${textTitle} ${isDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" : ""}`}>
                {newCustomersCount.toLocaleString("vi-VN")}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold border ${isDark ? "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30" : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200"}`}>
                  <span className="material-symbols-outlined text-[12px]">group_add</span>
                  Mới
                </span>
                <span className={`text-[10px] uppercase ${textSub}`}>trong 7 ngày qua</span>
              </div>
            </div>
          </article>
        </section>

        {/* TREND CHART */}
        <section className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8 ${bgCard}`}>
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h3 className={`font-headline text-2xl font-black tracking-tight ${textTitle}`}>Xu hướng Doanh thu</h3>
              <p className={`text-sm font-medium ${textSub}`}>Biểu đồ tổng quan 7 ngày gần nhất</p>
            </div>
          </div>
          
          <div className="relative h-[320px] w-full">
            <svg className="h-full w-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={isDark ? "0.4" : "0.2"} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
                {isDark && (
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                )}
              </defs>
              <line x1="0" y1="50" x2="1000" y2="50" stroke={gridLine} strokeDasharray="4" strokeWidth="1" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke={gridLine} strokeDasharray="4" strokeWidth="1" />
              <line x1="0" y1="250" x2="1000" y2="250" stroke={gridLine} strokeDasharray="4" strokeWidth="1" />
              
              {revenueTrends.length > 1 ? (
                <>
                  <path 
                    d={`M0,250 ${revenueTrends.map((t, i) => `L${100 + i * (900 / (revenueTrends.length - 1))},${Math.max(40, 250 - (Number(t.revenue) / estimatedRevenue) * 200)}`).join(' ')} L1000,300 L0,300 Z`} 
                    fill="url(#chartGradient)" 
                  />
                  <path 
                    d={`M0,250 ${revenueTrends.map((t, i) => `L${100 + i * (900 / (revenueTrends.length - 1))},${Math.max(40, 250 - (Number(t.revenue) / estimatedRevenue) * 200)}`).join(' ')}`} 
                    fill="none" stroke={svgLine} strokeWidth="4" filter={isDark ? "url(#glow)" : undefined} strokeLinecap="round" strokeLinejoin="round" 
                  />
                  {revenueTrends.map((t, i) => (
                    <circle 
                      key={t.date}
                      cx={100 + i * (900 / (revenueTrends.length - 1))} 
                      cy={Math.max(40, 250 - (Number(t.revenue) / estimatedRevenue) * 200)} 
                      r={i === revenueTrends.length - 1 ? 7 : 5} 
                      fill={i === revenueTrends.length - 1 ? svgLine : svgPoint} 
                      stroke={i === revenueTrends.length - 1 ? "#fff" : svgLine} 
                      strokeWidth="3" 
                      filter={isDark && i === revenueTrends.length - 1 ? "url(#glow)" : undefined} 
                    />
                  ))}
                  {revenueTrends.map((t, i) => (
                    <text 
                      key={`text-${t.date}`}
                      x={100 + i * (900 / (revenueTrends.length - 1))} 
                      y="280" fill={i === revenueTrends.length - 1 ? svgLine : (isDark ? "#94a3b8" : "#64748b")} 
                      fontSize="14" textAnchor={i === revenueTrends.length - 1 ? "end" : "middle"} fontWeight="bold"
                    >
                      {new Date(t.date).toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' })}
                    </text>
                  ))}
                </>
              ) : (
                <text x="500" y="150" fill={textSub} fontSize="16" textAnchor="middle" fontWeight="bold">Chưa đủ dữ liệu biểu đồ</text>
              )}
            </svg>
            {revenueTrends.length > 0 && (
              <div className={`absolute left-[70%] lg:left-[85%] top-[10px] rounded-xl border p-3 shadow-xl backdrop-blur-md ${isDark ? "border-fuchsia-500/30 bg-fuchsia-900/40 text-white" : "border-fuchsia-200 bg-white text-fuchsia-900"}`}>
                <div className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-fuchsia-300" : "text-fuchsia-600"}`}>
                  {new Date(revenueTrends[revenueTrends.length - 1].date).toLocaleDateString('vi-VN')}
                </div>
                <div className="text-xl font-black">{asMoneyVnd(revenueTrends[revenueTrends.length - 1].revenue)}</div>
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM WIDGETS */}
        <section className="grid gap-8 xl:grid-cols-3">
          {/* RECENT TRANSACTIONS */}
          <div className={`space-y-6 rounded-3xl border p-6 backdrop-blur-xl xl:col-span-2 ${bgCard}`}>
            <div className="flex items-center justify-between">
              <h4 className={`font-headline text-xl font-black ${textTitle}`}>Giao dịch gần đây</h4>
              <Link href="/admin/orders" className={`flex items-center gap-1 text-xs font-bold hover:underline ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                Xem toàn bộ <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            
            <div className={`overflow-x-auto rounded-2xl border ${bgTable}`}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                    <th className="px-5 py-4">Mã đơn</th>
                    <th className="px-5 py-4">Khách hàng</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4 text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-slate-200"}`}>
                  {recentOrders.map((item) => (
                    <tr key={item.id} className={`transition-colors ${rowHover}`}>
                      <td className={`px-5 py-4 font-mono font-bold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>{item.orderNumber ?? `#${item.id}`}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}>
                            {(item.user?.userName || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className={`font-medium ${textTitle}`}>{item.user?.userName || "Khách vãng lai"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] ${orderStatusTone(item.status)}`}>
                          {viAdminOrderPipelineLabel(item.status)}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-headline font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{asMoneyVnd(item.total)}</td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className={`px-5 py-8 text-center ${textSub}`}>
                        Chưa có đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOW STOCK ALERT */}
          <div className={`space-y-6 rounded-3xl border p-6 backdrop-blur-xl ${bgCard}`}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-2xl">warning</span>
              <h4 className={`font-headline text-xl font-black ${textTitle}`}>Cảnh báo Tồn kho</h4>
            </div>
            <div className="space-y-5">
              {inventoryAlerts.map((item) => {
                const percent = (item.stock / item.max) * 100;
                const isCritical = item.stock === 0;
                const isLow = item.stock > 0 && item.stock <= 10;
                
                return (
                  <div key={`${item.productId}-${item.variantId}`} className={`space-y-2 rounded-xl p-4 border ${bgTable}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`font-bold text-sm ${textTitle}`}>{item.name}</div>
                        <div className={`font-mono text-[10px] ${textSub}`}>{item.sku}</div>
                      </div>
                      <span className={`text-xs font-black px-2 py-1 rounded-md ${isCritical ? (isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700') : (isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>
                        {isCritical ? 'HẾT HÀNG' : `CÒN ${item.stock}`}
                      </span>
                    </div>
                    <div className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(percent, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {inventoryAlerts.length === 0 && (
                <div className={`text-center py-4 font-medium ${textSub}`}>Tất cả sản phẩm đều đủ hàng.</div>
              )}
            </div>
            <Link href="/admin/products" className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-colors border ${isDark ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600 hover:text-white" : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"}`}>
              <span className="material-symbols-outlined text-[18px]">add_box</span>
              Quản lý Sản phẩm
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
