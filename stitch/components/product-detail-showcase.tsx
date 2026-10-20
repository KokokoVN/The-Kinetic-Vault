"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdminProductVariant } from "@/lib/api";
import type { SaleProgram } from "@/lib/sale-api";
import { ProductDetailPurchase } from "@/components/product-detail-purchase";

type Props = {
  productId: string;
  productName: string;
  category: string;
  description: string;
  heroImage: string;
  thumbnails: string[];
  basePrice: number;
  effectivePrice?: number | null;
  saleType?: "PERCENT" | "AMOUNT" | null;
  saleValue?: number | null;
  activeSalePrograms?: SaleProgram[];
  baseStock: number;
  variants: AdminProductVariant[];
  isLoggedIn: boolean;
  salesCount: number;
  reviewCount: number;
  averageRating: number;
};

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return [".mp4", ".webm", ".ogg", ".mov", ".mkv", ".flv", ".3gp"].some((ext) => clean.endsWith(ext));
}

export function ProductDetailShowcase({
  productId,
  productName,
  category,
  description,
  heroImage,
  thumbnails,
  basePrice,
  effectivePrice,
  saleType,
  saleValue,
  activeSalePrograms,
  baseStock,
  variants,
  isLoggedIn,
  salesCount,
  reviewCount,
  averageRating,
}: Props) {
  const [variantImage, setVariantImage] = useState("");
  const [activeThumb, setActiveThumb] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const [selectedVariantInfo, setSelectedVariantInfo] = useState<{
    price: number;
    name: string | null;
    image: string | null;
    stock: number;
  } | null>(null);

  const gallery = useMemo(() => {
    const merged = [variantImage, ...thumbnails, heroImage].filter(Boolean);
    return Array.from(new Set(merged));
  }, [heroImage, thumbnails, variantImage]);

  const activeImage = gallery[activeThumb] ?? heroImage;
  const isVideo = isVideoUrl(activeImage);

  // Floating dock on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!showcaseRef.current) return;
      const rect = showcaseRef.current.getBoundingClientRect();
      setShowFloatingBar(rect.bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setViewerCount(Math.floor(Math.random() * 21) + 12);
  }, []);

  const handleVariantImageChange = useCallback((img: string | null) => {
    const next = String(img ?? "").trim();
    setVariantImage(next);
    if (next) setActiveThumb(0);
  }, []);

  const handleVariantSelect = useCallback(
    (info: { price: number; name: string | null; image: string | null; stock: number }) => {
      setSelectedVariantInfo(info);
    },
    []
  );

  const currentFloatingPrice = selectedVariantInfo?.price ?? effectivePrice ?? basePrice;
  const currentFloatingName = selectedVariantInfo?.name
    ? `${productName} — ${selectedVariantInfo.name}`
    : productName;

  return (
    <>
      {/* ── LUXURY FLOATING BOTTOM DOCK ── */}
      {showFloatingBar && (
        <div className="fixed bottom-5 left-0 right-0 z-[100] px-4 pointer-events-none transition-all duration-300">
          <div className="mx-auto max-w-4xl rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/90 shadow-2xl backdrop-blur-2xl p-2.5 sm:px-6 sm:py-3 pointer-events-auto flex items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-900 shadow-sm">
                <img src={activeImage} alt={productName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  {currentFloatingName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-headline text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-white dark:via-slate-100 dark:to-cyan-400">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      currentFloatingPrice
                    )}
                  </span>
                  {selectedVariantInfo && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-black ${
                        selectedVariantInfo.stock > 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {selectedVariantInfo.stock > 0 ? `Còn ${selectedVariantInfo.stock} sp` : "Hết hàng"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showcaseRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl sm:rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 sm:px-7 py-2.5 sm:py-3 font-headline text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Mua ngay</span>
            </button>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN LIGHTBOX ── */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950/95 backdrop-blur-xl"
          onClick={() => setShowFullscreen(false)}
        >
          <img
            src={activeImage}
            alt={productName}
            className="max-h-[85vh] max-w-[90vw] select-none rounded-3xl object-contain shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-md"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThumb((t) => (t - 1 + gallery.length) % gallery.length);
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-md"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThumb((t) => (t + 1) % gallery.length);
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-110 bg-white/10 border border-white/20 backdrop-blur-md"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveThumb(i);
                }}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === activeThumb ? "24px" : "6px",
                  background: i === activeThumb ? "#6366f1" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN SHOWCASE GRID ── */}
      <div ref={showcaseRef} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ═══════════════ LEFT: GALLERY & VISUALS ═══════════════ */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Display Frame */}
          <div
            ref={imgRef}
            className="group relative select-none overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl transition-all duration-500"
            style={{
              aspectRatio: "1/1",
              cursor: isVideo ? "default" : "zoom-in",
            }}
            onClick={() => !isVideo && setShowFullscreen(true)}
          >
            {isVideo ? (
              <video className="relative z-10 h-full w-full object-contain" src={activeImage} controls autoPlay muted playsInline />
            ) : (
              <>
                {/* Ambient Deep Blur Backdrop */}
                <img
                  src={activeImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover blur-3xl opacity-20 dark:opacity-30 scale-125"
                />
                <img
                  className="relative z-10 h-full w-full object-contain p-6 sm:p-8 transition-transform duration-700 ease-out group-hover:scale-105"
                  src={activeImage}
                  alt={productName}
                />
              </>
            )}

            {/* LIVE Viewing Badge */}
            {viewerCount !== null && (
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-zinc-950/70 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-xl shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                LIVE · {viewerCount} người đang xem
              </div>
            )}

            {/* Fullscreen Button */}
            {!isVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFullscreen(true);
                }}
                className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-zinc-950/70 text-white shadow-lg backdrop-blur-xl transition-all hover:scale-110 hover:bg-zinc-950/90"
                title="Phóng to ảnh"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_full</span>
              </button>
            )}

            {/* Image Counter */}
            {gallery.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-zinc-950/70 px-3.5 py-1 text-[11px] font-mono font-bold text-white backdrop-blur-md shadow-lg">
                {activeThumb + 1} / {gallery.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
              {gallery.map((thumb, idx) => {
                const isVid = isVideoUrl(thumb);
                const isActive = activeThumb === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveThumb(idx)}
                    className={`relative shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                      isActive
                        ? "border-indigo-600 dark:border-cyan-400 ring-4 ring-indigo-500/20 scale-105 shadow-md shadow-indigo-500/20"
                        : "border-slate-200/80 dark:border-white/10 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                    style={{ width: "84px", height: "84px" }}
                  >
                    {isVid ? (
                      <>
                        <video className="h-full w-full object-cover" src={thumb} muted playsInline />
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
                          <span className="material-symbols-outlined text-white text-[24px]">play_circle</span>
                        </div>
                      </>
                    ) : (
                      <img className="h-full w-full object-contain p-1.5 bg-slate-50 dark:bg-zinc-900" src={thumb} alt="" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Luxury Brand Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: "local_shipping", label: "Miễn phí vận chuyển", sub: "Đơn hàng từ 500k", color: "text-emerald-500" },
              { icon: "published_with_changes", label: "30 ngày đổi trả", sub: "Thủ tục nhanh gọn", color: "text-amber-500" },
              { icon: "verified", label: "Chính hãng 100%", sub: "Bảo hành ủy quyền", color: "text-indigo-500 dark:text-cyan-400" },
            ].map((b) => (
              <div
                key={b.label}
                className="group flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-4 text-center backdrop-blur-xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className={`material-symbols-outlined text-2xl ${b.color} transition-transform group-hover:scale-110`}>
                  {b.icon}
                </span>
                <p className="mt-2 text-xs font-black text-slate-800 dark:text-slate-200">{b.label}</p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ RIGHT: PRODUCT INFO & PURCHASE ═══════════════ */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
                <span className="material-symbols-outlined text-[13px]">category</span>
                {category}
              </span>
              {baseStock <= 10 && baseStock > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 dark:border-rose-500/30 bg-rose-50/80 dark:bg-rose-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  🔥 Sắp hết hàng (Chỉ còn {baseStock})
                </span>
              )}
            </div>

            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {productName}
            </h1>

            {/* Social Proof Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    className="material-symbols-outlined text-[18px] text-amber-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm font-black text-slate-800 dark:text-white">
                {averageRating > 0 ? averageRating.toFixed(1) : "5.0"}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {reviewCount} đánh giá
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {salesCount > 0 ? salesCount.toLocaleString("vi-VN") : 0} đã bán
              </span>
            </div>
          </div>

          {/* Purchase Component (Standalone High-End Card) */}
          <ProductDetailPurchase
            productId={productId}
            productName={productName}
            basePrice={basePrice}
            effectivePrice={effectivePrice}
            saleType={saleType}
            saleValue={saleValue}
            activeSalePrograms={activeSalePrograms}
            baseStock={baseStock}
            baseImage={gallery[activeThumb] ?? heroImage}
            variants={variants}
            isLoggedIn={isLoggedIn}
            onVariantImageChange={handleVariantImageChange}
            onVariantSelect={handleVariantSelect}
          />

          {/* Product Description */}
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm dark:shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/10 px-6 py-4">
              <span className="material-symbols-outlined text-indigo-600 dark:text-cyan-400 text-[20px]">description</span>
              <h3 className="font-headline text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Mô tả sản phẩm
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
