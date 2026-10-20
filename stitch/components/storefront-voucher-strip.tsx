"use client";

import { useState } from "react";
import { Voucher } from "@/lib/sale-api";

export function StorefrontVoucherStrip({ vouchers }: { vouchers: Voucher[] }) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!vouchers || vouchers.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const formatVoucherDiscount = (v: Voucher) => {
    if (String(v.discountType || "").toUpperCase().includes("PERCENT")) {
      return `GIẢM ${v.discountValue}%`;
    }
    const val = Number(v.discountValue);
    if (val >= 1000000) {
      return `GIẢM ${(val / 1000000).toLocaleString("vi-VN")}TR`;
    }
    if (val >= 1000) {
      return `GIẢM ${(val / 1000).toLocaleString("vi-VN")}K`;
    }
    return `GIẢM ${val.toLocaleString("vi-VN")}₫`;
  };

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 my-4">
      <div className="mx-auto max-w-screen-2xl">
        {/* Container with flagship glass styling */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-indigo-200/60 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-50/80 via-white to-cyan-50/80 dark:from-indigo-950/40 dark:via-zinc-950/80 dark:to-cyan-950/30 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
          
          {/* Ambient decorative blurs */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-indigo-500/15 blur-[60px]" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-cyan-500/15 blur-[60px]" />

          {/* Header row */}
          <div className="relative z-10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
                <span className="material-symbols-outlined text-xl sm:text-2xl">local_activity</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Kho Voucher <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Đặc Quyền VIP</span>
                  </h3>
                  <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                    Hot Deals
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Lưu ngay mã ưu đãi để áp dụng giảm trực tiếp khi thanh toán giỏ hàng.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-indigo-600 dark:text-cyan-400 self-start sm:self-auto flex items-center gap-1">
              {vouchers.length} mã đang khả dụng
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </span>
          </div>

          {/* Horizontal scrollable coupon tickets */}
          <div className="relative z-10 -mx-2 px-2 overflow-x-auto no-scrollbar pb-2">
            <div className="flex gap-4 min-w-max">
              {vouchers.slice(0, 8).map((v) => {
                const isCopied = copiedCode === v.code;
                const discountText = formatVoucherDiscount(v);

                return (
                  <div
                    key={v.id ?? v.code}
                    className="group relative flex w-[280px] sm:w-[320px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-400/50 dark:hover:border-cyan-400/50 backdrop-blur-xl"
                  >
                    {/* Top ticket accent */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm shadow-rose-500/25">
                        <span className="material-symbols-outlined text-[13px]">percent</span>
                        {discountText}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                        {v.code}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="my-2 text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      {v.description || "Áp dụng cho mọi đơn hàng đủ điều kiện tại The Kinetic Vault."}
                    </p>

                    {/* Condition details */}
                    <div className="mt-1 mb-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-white/10 pt-2.5">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {v.minOrderAmount ? `${(Number(v.minOrderAmount)).toLocaleString("vi-VN")}₫` : "0₫"}
                      </span>
                    </div>

                    {/* Copy action button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(v.code)}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                        isCopied
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-cyan-500 hover:text-white hover:shadow-md hover:shadow-indigo-500/20 active:scale-95"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isCopied ? "check_circle" : "content_copy"}
                      </span>
                      <span>{isCopied ? "Đã lưu mã ✓" : "Lưu mã"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
