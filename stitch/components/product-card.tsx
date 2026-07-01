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
    <article
      className="group relative flex h-full flex-col"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(145deg, #ffffff, #f8f9fe)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-8px) scale(1.01)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 24px 60px rgba(0,0,0,0.14), 0 8px 24px rgba(99,102,241,0.12)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,0,0,0.06)";
      }}
    >
      <Link href={href} className="flex h-full flex-col outline-none">
        {/* ── Image ─────────────────────────────────── */}
        <div className="relative overflow-hidden" style={{ aspectRatio: "4/5", borderRadius: "1.5rem 1.5rem 0 0" }}>
          <img
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            src={image}
            alt={safeTitle || "Sản phẩm"}
            loading="lazy"
            decoding="async"
          />

          {/* Dark gradient at bottom for price legibility on hover */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)" }}
          />

          {/* Shimmer overlay on hover */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite linear",
            }}
          />

          {/* Badges */}
          {badges.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {badges.map((badge, idx) => {
                const { bg, glow, icon } = getBadgeStyle(badge);
                return (
                  <span
                    key={idx}
                    className={`bg-gradient-to-r ${bg} flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-black tracking-wider uppercase text-white`}
                    style={{ boxShadow: `0 4px 14px ${glow}`, backdropFilter: "blur(6px)" }}
                  >
                    {icon && <span style={{ fontSize: "10px" }}>{icon}</span>}
                    {badge}
                  </span>
                );
              })}
            </div>
          )}

          {/* Discount pill - top right */}
          {hasSale && discountPct && (
            <div
              className="absolute right-3 top-3 z-10 flex h-10 w-10 flex-col items-center justify-center rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #FF4D4D, #c0392b)",
                boxShadow: "0 4px 16px rgba(255,77,77,0.5)",
                fontSize: "9px",
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              <span>-{discountPct}%</span>
            </div>
          )}

          {/* Hover CTA pill */}
          <div className="absolute inset-0 z-20 flex items-end justify-center pb-5 opacity-0 transition-all duration-400 group-hover:opacity-100">
            <span
              className="translate-y-4 rounded-full px-5 py-2.5 text-xs font-bold text-primary transition-all duration-400 group-hover:translate-y-0"
              style={{
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              🔍 Xem chi tiết
            </span>
          </div>
        </div>

        {/* ── Content ──────────────────────────────── */}
        <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
          {/* Category chip */}
          {category && (
            <span
              className="mb-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.08)",
                color: "rgba(99,102,241,0.9)",
              }}
            >
              {category}
            </span>
          )}

          {/* Title */}
          <h3
            className="mb-1 line-clamp-2 font-bold leading-snug text-on-surface transition-colors duration-300 group-hover:text-primary"
            style={{ fontSize: "0.95rem" }}
          >
            {safeTitle}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className="mb-3 line-clamp-1 text-xs font-medium text-on-surface-variant/60">{subtitle}</p>
          )}

          {/* Price block */}
          <div
            className="mt-auto flex items-center justify-between gap-2 border-t pt-3"
            style={{ borderColor: "rgba(0,0,0,0.06)" }}
          >
            <div className="flex flex-col gap-0.5">
              <p
                className="font-black tracking-tight leading-none"
                style={{
                  fontSize: hasSale ? "1.1rem" : "1.05rem",
                  background: hasSale
                    ? "linear-gradient(90deg, #FF4D4D, #e02020)"
                    : "linear-gradient(90deg, #4f46e5, #6366f1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {showRange
                  ? `Từ ${asCurrencyVnd(Number(minPrice))}`
                  : priceText || "—"}
              </p>

              {originalPrice && (
                <p className="text-[11px] font-semibold line-through" style={{ color: "rgba(0,0,0,0.35)" }}>
                  {renderPrice(originalPrice)}
                </p>
              )}

              {showRange && (
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.4)" }}>
                  ~ {asCurrencyVnd(Number(maxPrice))}
                </p>
              )}
            </div>

            {/* Mini wishlist / spark icon */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100"
              style={{
                background: hasSale ? "rgba(255,77,77,0.08)" : "rgba(99,102,241,0.08)",
                fontSize: "16px",
              }}
            >
              {hasSale ? "🏷️" : "🛍️"}
            </div>
          </div>
        </div>
      </Link>

      {/* Footer (add to cart button) */}
      {footer ? (
        <div className="px-5 pb-5 pt-0">
          {footer}
        </div>
      ) : null}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </article>
  );
}
