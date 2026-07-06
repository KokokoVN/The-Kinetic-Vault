"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  image: string;
  title: string;
  category?: string | null;
  subtitle?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  badges?: string[];
  hasVariantPriceRange?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
  footer?: ReactNode;
};

function asCurrencyVnd(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function renderPrice(price: string | number): string {
  if (typeof price === "number" && Number.isFinite(price)) return asCurrencyVnd(price);
  return String(price ?? "").trim();
}

function calcDiscount(price: string | number, originalPrice: string | number | null | undefined): number | null {
  if (!originalPrice) return null;
  const sale = typeof price === "number" ? price : parseFloat(String(price).replace(/[^\d]/g, ""));
  const orig = typeof originalPrice === "number" ? originalPrice : parseFloat(String(originalPrice).replace(/[^\d]/g, ""));
  if (!orig || !sale || orig <= sale) return null;
  return Math.round(((orig - sale) / orig) * 100);
}

function getBadgeStyle(badge: string): { bg: string; glow: string; icon: string } {
  const b = badge.toLowerCase();
  if (b.includes("giảm") || b.includes("sale") || b.includes("đồng giá"))
    return { bg: "from-[#FF4D4D] to-[#e02020]", glow: "rgba(255,77,77,0.5)", icon: "🔥" };
  if (b.includes("hot") || b.includes("bán chạy"))
    return { bg: "from-[#FF8C00] to-[#e06000]", glow: "rgba(255,140,0,0.5)", icon: "⚡" };
  if (b.includes("mới") || b.includes("new"))
    return { bg: "from-[#1a73e8] to-[#0050c8]", glow: "rgba(26,115,232,0.5)", icon: "✨" };
  return { bg: "from-primary to-primary/80", glow: "rgba(99,102,241,0.5)", icon: "" };
}

export function ProductCard({
  href,
  image,
  title,
  category,
  subtitle,
  price,
  originalPrice,
  badges = [],
  hasVariantPriceRange,
  minPrice,
  maxPrice,
  footer,
}: Props) {
  const safeTitle = String(title ?? "").trim();
  const priceText = renderPrice(price);
  const showRange =
    Boolean(hasVariantPriceRange) &&
    minPrice != null &&
    maxPrice != null &&
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    minPrice < maxPrice;
  const discountPct = calcDiscount(price, originalPrice);
  const hasSale = Boolean(originalPrice) && discountPct != null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10 hover:-translate-y-2">
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />

      <Link href={href} className="flex h-full flex-col outline-none relative z-10">
        {/* ── Image Section ─────────────────────────────────── */}
        <div className="relative overflow-hidden m-1.5 md:m-2 rounded-2xl md:rounded-[2rem]" style={{ aspectRatio: "4/5" }}>
          {/* Main Image */}
          <img
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            src={image}
            alt={safeTitle || "Sản phẩm"}
            loading="lazy"
            decoding="async"
          />

          {/* Elegant Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Badges Overlay */}
          {badges.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
              {badges.map((badge, idx) => {
                const b = badge.toLowerCase();
                let colors = "from-indigo-500 to-purple-500 shadow-indigo-500/30 ring-indigo-400/30";
                let icon = "✨";
                if (b.includes("sale") || b.includes("giảm")) {
                  colors = "from-rose-500 to-pink-500 shadow-rose-500/30 ring-rose-400/30";
                  icon = "🔥";
                }
                if (b.includes("hot")) {
                  colors = "from-amber-500 to-orange-500 shadow-amber-500/30 ring-amber-400/30";
                  icon = "⚡";
                }
                if (b.includes("mới")) {
                  colors = "from-emerald-500 to-teal-500 shadow-emerald-500/30 ring-emerald-400/30";
                  icon = "🌟";
                }
                
                return (
                  <span
                    key={idx}
                    className={`bg-gradient-to-r ${colors} flex items-center gap-1.5 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md ring-1`}
                  >
                    <span className="text-[10px] md:text-xs">{icon}</span>
                    {badge}
                  </span>
                );
              })}
            </div>
          )}

          {/* Floating Discount Tag */}
          {hasSale && discountPct && (
            <div className="absolute right-2 top-2 md:right-3 md:top-3 z-10 flex h-9 w-9 md:h-12 md:w-12 flex-col items-center justify-center rounded-full bg-white/95 dark:bg-slate-900/95 text-rose-600 dark:text-rose-400 font-black text-[10px] md:text-xs shadow-xl backdrop-blur-md border border-rose-100 dark:border-rose-900/50 transform transition-transform md:group-hover:scale-110">
              <span className="leading-none text-[7px] md:text-[9px] uppercase tracking-tighter text-slate-500 dark:text-slate-400 mb-0.5">Giảm</span>
              <span className="leading-none text-[11px] md:text-sm">{discountPct}%</span>
            </div>
          )}

          {/* Quick View Button (Hidden on Mobile) */}
          <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100 bg-black/10 backdrop-blur-[2px]">
            <span className="translate-y-4 rounded-full px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-slate-800/50 shadow-2xl transition-all duration-500 group-hover:translate-y-0 hover:scale-105 hover:bg-white dark:hover:bg-slate-800">
              Xem chi tiết
            </span>
          </div>
        </div>

        {/* ── Content Section ──────────────────────────────── */}
        <div className="flex flex-1 flex-col px-3 pb-3 pt-2 md:px-5 md:pb-5 md:pt-4">
          <div className="flex items-center justify-between mb-2">
            {category ? (
              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {category}
              </span>
            ) : <div />}
            
            {/* Wishlist Heart Icon */}
            <button className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-300 z-20 hover:scale-110 active:scale-95" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined text-[20px] font-bold">favorite</span>
            </button>
          </div>

          <h3 className="mb-1 md:mb-2 line-clamp-2 font-headline font-black text-sm sm:text-base md:text-lg text-slate-800 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight">
            {safeTitle}
          </h3>

          {subtitle && (
            <p className="mb-4 line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
            <div>
              {originalPrice && (
                <p className="text-[11px] font-bold line-through text-slate-400 dark:text-slate-500 mb-0.5">
                  {renderPrice(originalPrice)}
                </p>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Giá</span>
                <p className={`font-headline font-black text-base sm:text-lg md:text-xl ${hasSale ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                  {showRange ? asCurrencyVnd(Number(minPrice)) : priceText || "—"}
                </p>
              </div>
              {showRange && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 inline-block bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">
                  Đến {asCurrencyVnd(Number(maxPrice))}
                </p>
              )}
            </div>
            
            {/* Animated Arrow (Visible on Mobile, Animated on Desktop) */}
            <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-indigo-50 md:bg-slate-50 dark:bg-slate-800 text-indigo-600 md:text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 md:group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300 md:-translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
              <span className="material-symbols-outlined text-[16px] md:text-[18px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Footer / Add to Cart */}
      {footer ? (
        <div className="px-3 pb-3 pt-0 md:px-5 md:pb-5 relative z-20">
          <div className="w-full relative overflow-hidden rounded-[1.25rem] transition-transform hover:scale-[1.02] active:scale-[0.98]">
            {footer}
          </div>
        </div>
      ) : null}
    </article>
  );
}
