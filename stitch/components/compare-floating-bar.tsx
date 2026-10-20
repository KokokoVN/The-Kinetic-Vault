"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProductCompare } from "./product-compare-context";

function asCurrencyVnd(val: number | string): string {
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^\d]/g, ""));
  if (isNaN(num)) return String(val);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
}

export function CompareFloatingBar() {
  const pathname = usePathname();
  const { items, removeFromCompare, clearCompare } = useProductCompare();
  const [isMinimized, setIsMinimized] = useState(false);

  // When visiting the actual compare page, hide the floating bar to avoid duplicate UI
  if (pathname?.startsWith("/compare")) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  const maxSlots = 4;
  const emptySlotsCount = Math.max(0, maxSlots - items.length);

  return (
    <aside
      aria-label="Thanh so sánh sản phẩm"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl transition-all duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/20 dark:border-indigo-500/30 bg-slate-900/95 dark:bg-[#0b0f19]/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_35px_rgba(99,102,241,0.2)] text-white p-3 sm:p-4">
        {/* Top glowing ambient line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 via-purple-500 to-transparent" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Title & Counter */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                <span className="material-symbols-outlined text-[20px]">balance</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-slate-900" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline text-sm font-black tracking-tight text-white">So sánh sản phẩm</span>
                  <span className="inline-flex h-5 items-center justify-center rounded-full bg-indigo-500/25 px-2 text-[11px] font-black text-indigo-300 border border-indigo-500/40">
                    {items.length}/{maxSlots}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Đối chiếu giá, cấu hình & biến thể
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                title={isMinimized ? "Mở rộng" : "Thu gọn"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isMinimized ? "expand_less" : "expand_more"}
                </span>
              </button>
              <button
                type="button"
                onClick={clearCompare}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 underline"
              >
                Xóa
              </button>
            </div>
          </div>

          {/* Center: Selected Products Thumbnails (No scrollbar) */}
          {!isMinimized && (
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto max-w-full py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 dark:bg-slate-800/50 p-1.5 pr-3 transition-all hover:border-indigo-500/60 hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl bg-slate-800 border border-white/10">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFromCompare(item.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-rose-400"
                      title="Gỡ sản phẩm"
                    >
                      <span className="material-symbols-outlined text-[17px]">close</span>
                    </button>
                  </div>
                  <div className="max-w-[110px] sm:max-w-[130px]">
                    <h4 className="truncate text-xs font-bold text-slate-100" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-black text-indigo-400 font-mono mt-0.5">
                      {asCurrencyVnd(item.price)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Empty slot indicators */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="hidden md:flex h-12 w-24 items-center justify-center gap-1 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] text-slate-500 text-[11px] font-semibold"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Trống</span>
                </div>
              ))}
            </div>
          )}

          {/* Right: CTA Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={clearCompare}
              className="hidden sm:inline-flex items-center text-xs font-bold text-slate-400 hover:text-rose-400 px-3 py-2 transition rounded-xl hover:bg-white/5"
            >
              Xóa tất cả
            </button>

            <Link
              href={`/compare?ids=${items.map((it) => it.id).join(",")}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black tracking-wide text-white shadow-lg shadow-indigo-600/35 hover:scale-[1.03] active:scale-[0.98] transition-all hover:shadow-indigo-500/50"
            >
              <span>So sánh ngay</span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-black">
                {items.length}
              </span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
