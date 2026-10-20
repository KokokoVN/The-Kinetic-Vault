"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useProductCompare } from "./product-compare-context";
import { resolveCatalogImageUrl, FALLBACK_IMAGE } from "@/lib/api";

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

  const [isFavorited, setIsFavorited] = useState(false);
  const { isInCompare, toggleCompare } = useProductCompare();
  const matchId = href.match(/\/product\/(\d+)/);
  const productId = matchId ? Number(matchId[1]) : null;
  const inCompare = productId ? isInCompare(productId) : false;

  const safeImageUrl = resolveCatalogImageUrl(image);
  const [imgSrc, setImgSrc] = useState(safeImageUrl);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] bg-white/90 dark:bg-zinc-950/80 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-xl backdrop-blur-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/15 dark:hover:shadow-cyan-500/10 hover:border-indigo-500/40 dark:hover:border-cyan-400/40">
      
      {/* Ambient Radial Hover Sheen */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl z-0" />

      <Link href={href} className="flex h-full flex-col outline-none relative z-10">
        {/* ── Image Section ─────────────────────────────────── */}
        <div className="relative overflow-hidden m-2 sm:m-2.5 rounded-[1.5rem] sm:rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/70 aspect-[4/4.8]">
          {/* Ambient blurred backdrop of the product image */}
          <img
            src={imgSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-20 dark:opacity-30 scale-125 transition-transform duration-700 ease-out group-hover:scale-150"
            onError={() => setImgSrc(FALLBACK_IMAGE)}
          />

          {/* Main Product Image */}
          <img
            className="relative z-10 h-full w-full object-contain object-center p-3 sm:p-4 transition-transform duration-700 ease-out group-hover:scale-108"
            src={imgSrc}
            alt={safeTitle || "Sản phẩm"}
            loading="lazy"
            decoding="async"
            onError={() => {
              setImgSrc(FALLBACK_IMAGE);
            }}
          />

          {/* Elegant Dark/Light Gradient Vignette */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Floating Badges (Top Left) */}
          <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 flex flex-col gap-1.5 z-20">
            {badges.slice(0, 2).map((badge, idx) => {
              const b = badge.toLowerCase();
              let gradient = "from-indigo-600 to-purple-600 shadow-indigo-500/25";
              let icon = "stars";
              if (b.includes("sale") || b.includes("giảm") || b.includes("đồng giá")) {
                gradient = "from-rose-500 to-pink-600 shadow-rose-500/30";
                icon = "local_fire_department";
              } else if (b.includes("hot") || b.includes("bán chạy")) {
                gradient = "from-amber-500 to-orange-600 shadow-amber-500/30";
                icon = "bolt";
              } else if (b.includes("mới") || b.includes("new")) {
                gradient = "from-emerald-500 to-teal-600 shadow-emerald-500/30";
                icon = "auto_awesome";
              }

              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${gradient} px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md ring-1 ring-white/20`}
                >
                  <span className="material-symbols-outlined text-[11px] sm:text-[12px]">{icon}</span>
                  {badge}
                </span>
              );
            })}
          </div>

          {/* Floating Discount Tag (Top Right) */}
          {hasSale && discountPct && (
            <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 z-20 flex h-9 w-9 sm:h-10 sm:w-10 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white font-black shadow-lg shadow-rose-500/30 ring-2 ring-white/30 transform transition-transform duration-300 group-hover:scale-110">
              <span className="text-[7px] uppercase tracking-tighter leading-none opacity-90">Giảm</span>
              <span className="text-[11px] sm:text-xs leading-none">-{discountPct}%</span>
            </div>
          )}

          {/* Quick View Button overlay on hover */}
          <div className="hidden sm:flex absolute inset-0 z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="translate-y-3 group-hover:translate-y-0 inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-zinc-900/95 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-2xl backdrop-blur-md border border-slate-200/80 dark:border-white/10 transition-all hover:scale-105 hover:bg-white">
              <span className="material-symbols-outlined text-sm">visibility</span>
              Xem chi tiết
            </span>
          </div>
        </div>

        {/* ── Content Section ──────────────────────────────── */}
        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-1.5 sm:px-4 sm:pb-4 sm:pt-2">
          
          {/* Header Row: Category Pill & Floating Actions */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {category && (
                <span className="truncate inline-flex items-center text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-500/20">
                  {category}
                </span>
              )}
              {showRange && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-200/60 dark:border-cyan-500/20">
                  <span className="material-symbols-outlined text-[10px]">tune</span>
                  Đa biến thể
                </span>
              )}
            </div>

            {/* Quick Actions (Compare & Favorite) */}
            <div className="flex items-center gap-1 shrink-0 z-20">
              {productId && (
                <button
                  type="button"
                  title={inCompare ? "Đang so sánh (Click để gỡ)" : "Thêm vào so sánh"}
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                    inCompare
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleCompare({
                      id: productId,
                      title: safeTitle,
                      image,
                      price,
                      originalPrice,
                      category,
                      minPrice,
                      maxPrice,
                    });
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">balance</span>
                </button>
              )}

              <button
                type="button"
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isFavorited
                    ? "bg-rose-500/15 text-rose-500 border border-rose-500/30"
                    : "text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFavorited(!isFavorited);
                }}
                title={isFavorited ? "Đã yêu thích" : "Thêm vào yêu thích"}
              >
                <span className={`material-symbols-outlined text-[16px] ${isFavorited ? "fill-1 text-rose-500" : ""}`}>
                  favorite
                </span>
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 font-headline font-black text-sm sm:text-base text-slate-900 dark:text-white transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 leading-snug min-h-[2.5rem]">
            {safeTitle}
          </h3>

          {/* Subtitle / Description excerpt */}
          {subtitle && (
            <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}

          {/* Price Section */}
          <div className="mt-auto pt-3 border-t border-slate-100 dark:border-white/5 flex items-end justify-between gap-2">
            <div>
              {originalPrice && (
                <p className="text-[11px] font-bold line-through text-slate-400 dark:text-slate-500 leading-none mb-1">
                  {renderPrice(originalPrice)}
                </p>
              )}
              <div className="flex items-baseline gap-1.5">
                <p className={`font-headline font-black text-base sm:text-lg lg:text-xl leading-none ${
                  hasSale ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                }`}>
                  {showRange ? asCurrencyVnd(Number(minPrice)) : priceText || "—"}
                </p>
              </div>
              {showRange && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                  ~ {asCurrencyVnd(Number(maxPrice))}
                </p>
              )}
            </div>

            {/* Kinetic Arrow Circle */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/20 group-hover:scale-105">
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Footer / Add to Cart Button */}
      {footer && (
        <div className="px-3.5 pb-3.5 pt-0 sm:px-4 sm:pb-4 relative z-20">
          <div className="w-full relative overflow-hidden rounded-2xl transition-transform hover:scale-[1.01] active:scale-[0.98]">
            {footer}
          </div>
        </div>
      )}
    </article>
  );
}
