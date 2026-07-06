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
  return [".mp4",".webm",".ogg",".mov",".mkv",".flv",".3gp"].some(ext => clean.endsWith(ext));
}

export function ProductDetailShowcase({
  productId, productName, category, description, heroImage,
  thumbnails, basePrice, effectivePrice, saleType, saleValue, activeSalePrograms, baseStock, variants, isLoggedIn, salesCount, reviewCount, averageRating
}: Props) {
  const [variantImage, setVariantImage] = useState("");
  const [activeThumb, setActiveThumb] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const gallery = useMemo(() => {
    const merged = [variantImage, ...thumbnails, heroImage].filter(Boolean);
    return Array.from(new Set(merged));
  }, [heroImage, thumbnails, variantImage]);

  const activeImage = gallery[activeThumb] ?? heroImage;
  const isVideo = isVideoUrl(activeImage);

  // Floating bar on scroll
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
    setViewerCount(Math.floor(Math.random() * 24) + 8);
  }, []);

  // No tilt handler anymore

  const handleVariantImageChange = useCallback((img: string | null) => {
    const next = String(img ?? "").trim();
    setVariantImage(next);
    if (next) setActiveThumb(0);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeLeft  { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(32px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn    { from{opacity:0}                              to{opacity:1} }
        @keyframes shimmer   { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes blink-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
        @keyframes ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .anim-left { animation:fadeLeft .6s cubic-bezier(.22,1,.36,1) both }
        .anim-up   { animation:fadeUp   .6s cubic-bezier(.22,1,.36,1) .08s both }
        .slide-up  { animation:slideUp  .4s cubic-bezier(.22,1,.36,1) both }
        .thumb-strip::-webkit-scrollbar { display:none }
      `}</style>

      {/* ─── FLOATING BUY BAR ─── */}
      {showFloatingBar && (
        <div
          className="slide-up fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg"
        >
          <div className="mx-auto flex max-w-screen-2xl items-center gap-4 px-6 py-3">
            <img src={activeImage} alt={productName} className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-black text-slate-800 dark:text-white">{productName}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(effectivePrice ?? basePrice)}
                </p>
                {(effectivePrice ?? basePrice) < basePrice && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through opacity-70">
                    {new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(basePrice)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => showcaseRef.current?.scrollIntoView({behavior:"smooth"})}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white bg-gradient-to-r from-indigo-500 to-purple-650 hover:brightness-110 shadow-md shadow-indigo-500/20"
            >
              <span className="material-symbols-outlined" style={{fontSize:"18px"}}>shopping_bag</span>
              Mua ngay
            </button>
          </div>
        </div>
      )}

      {/* ─── FULLSCREEN LIGHTBOX ─── */}
      {showFullscreen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-md"
          onClick={() => setShowFullscreen(false)}
        >
          <img
            src={activeImage}
            alt={productName}
            className="max-h-[90vh] max-w-[90vw] select-none rounded-3xl object-contain shadow-2xl border border-slate-800"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-110 bg-white/10 dark:bg-slate-900/40 border border-white/25 dark:border-slate-800 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          {/* Nav arrows in lightbox */}
          {gallery.length > 1 && (
            <>
              <button onClick={e=>{e.stopPropagation();setActiveThumb(t=>(t-1+gallery.length)%gallery.length)}}
                className="absolute left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-110 bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800 backdrop-blur-sm">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={e=>{e.stopPropagation();setActiveThumb(t=>(t+1)%gallery.length)}}
                className="absolute right-20 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:scale-110 bg-white/10 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800 backdrop-blur-sm">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {gallery.map((_,i) => (
              <button key={i} onClick={e=>{e.stopPropagation();setActiveThumb(i)}}
                className="h-1.5 rounded-full transition-all"
                style={{width: i===activeThumb?"24px":"6px", background: i===activeThumb?"#818cf8":"rgba(255,255,255,0.4)"}} />
            ))}
          </div>
        </div>
      )}

      <div ref={showcaseRef} className="grid grid-cols-1 gap-14 lg:grid-cols-12">
        {/* ═══════════════ LEFT ═══════════════ */}
        <div className="lg:col-span-5 lg:col-start-2 anim-left">

          {/* ── Main image with 3D tilt ── */}
          <div
            ref={imgRef}
            className="relative select-none overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-850 dark:to-slate-900/60 border border-slate-200/60 dark:border-slate-800"
            style={{
              borderRadius:"2.25rem",
              aspectRatio:"1/1",
              boxShadow: "0 12px 48px rgba(99,102,241,.12), 0 4px 16px rgba(0,0,0,.06)",
              cursor: isVideo ? "default" : "pointer",
            }}
          >
            {isVideo ? (
              <video className="h-full w-full object-contain" src={activeImage} controls autoPlay muted playsInline />
            ) : (
              <img
                className="h-full w-full object-cover"
                src={activeImage}
                alt={productName}
              />
            )}

            {/* Ambient glow overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-[2.25rem]"
              style={{boxShadow:"inset 0 0 60px rgba(99,102,241,.08)"}} />

            {/* Bottom gradient */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 rounded-b-[2.25rem]"
              style={{background:"linear-gradient(to top,rgba(15,15,35,.5),transparent)"}} />

            {/* LIVE badge */}
            {viewerCount !== null && (
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-white"
                style={{background:"rgba(0,0,0,.6)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.15)"}}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                LIVE · {viewerCount} đang xem
              </div>
            )}

            {/* Fullscreen btn */}
            {!isVideo && (
              <button onClick={() => setShowFullscreen(true)}
                className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-all hover:scale-110"
                style={{background:"rgba(0,0,0,.55)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.2)"}}>
                <span className="material-symbols-outlined" style={{fontSize:"20px"}}>open_in_full</span>
              </button>
            )}

            {/* Image counter */}
            {gallery.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-[11px] font-black text-white"
                style={{background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)"}}>
                {activeThumb+1} / {gallery.length}
              </div>
            )}
          </div>

          {/* ── Thumbnail strip ── */}
          {gallery.length > 1 && (
            <div className="thumb-strip mt-4 flex gap-3 overflow-x-auto">
              {gallery.map((thumb, idx) => {
                const isVid = isVideoUrl(thumb);
                const isActive = activeThumb === idx;
                return (
                  <button key={idx} type="button" onClick={() => setActiveThumb(idx)}
                    className="relative shrink-0 overflow-hidden transition-all duration-300"
                    style={{
                      width:"80px", height:"80px",
                      borderRadius:"1.125rem",
                      border: isActive ? "3px solid #818cf8" : "2px solid rgba(0,0,0,0.07)",
                      boxShadow: isActive ? "0 0 0 4px rgba(129,140,248,.3),0 8px 24px rgba(79,70,229,.25)" : "0 2px 8px rgba(0,0,0,0.05)",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      background:"linear-gradient(135deg,#eef2ff,#e0e7ff)",
                    }}>
                    {isVid ? (
                      <>
                        <video className="h-full w-full object-cover opacity-70" src={thumb} muted playsInline />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="material-symbols-outlined text-white" style={{fontSize:"20px"}}>play_circle</span>
                        </div>
                      </>
                    ) : (
                      <img className="h-full w-full object-cover" src={thumb} alt="" />
                    )}
                    {isActive && (
                      <div className="absolute inset-0 rounded-[1rem]"
                        style={{boxShadow:"inset 0 0 0 2.5px rgba(129,140,248,.6)"}} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Trust strip ── */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {icon:"local_shipping",label:"Miễn phí ship",sub:"Từ 500.000đ",from:"#10b981",to:"#34d399"},
              {icon:"replay",label:"Đổi trả 7 ngày",sub:"Không điều kiện",from:"#f59e0b",to:"#fbbf24"},
              {icon:"verified_user",label:"Chính hãng 100%",sub:"Cam kết xác thực",from:"#6366f1",to:"#818cf8"},
            ].map(b => (
              <div key={b.label} className="group flex flex-col items-center rounded-2xl p-3.5 text-center transition-all hover:-translate-y-0.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800"
              >
                <span className="material-symbols-outlined transition-transform group-hover:scale-110"
                  style={{fontSize:"22px",color:b.from}}>{b.icon}</span>
                <p className="mt-1.5 text-[11px] font-black leading-tight text-slate-700 dark:text-slate-300">{b.label}</p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════ RIGHT ═══════════════ */}
        <div className="space-y-5 lg:col-span-5 anim-up">

          {/* Breadcrumb pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
            >
              <span className="material-symbols-outlined" style={{fontSize:"12px"}}>category</span>
              {category}
            </span>
            {baseStock <= 10 && baseStock > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
              >
                🔥 Chỉ còn {baseStock} sản phẩm
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-[1.9rem] font-extrabold leading-tight text-slate-800 dark:text-white tracking-tight"
          >
            {productName}
          </h1>

          {/* Rating row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s=>(
                <span key={s} className="material-symbols-outlined"
                  style={{fontSize:"17px",color:s<=averageRating?"#f59e0b":"#e2e8f0",fontVariationSettings:"'FILL' 1"}}>star</span>
              ))}
            </div>
            <span className="text-sm font-black text-amber-500 dark:text-amber-400">{averageRating > 0 ? averageRating.toFixed(1) : "5.0"}</span>
            <span className="text-sm text-slate-300 dark:text-slate-700">|</span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{reviewCount} đánh giá</span>
            <span className="text-sm text-slate-300 dark:text-slate-700">|</span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{salesCount > 0 ? salesCount : 0} đã bán</span>
          </div>

          {/* Purchase card — with rainbow top border */}
          <div className="rounded-[1.75rem] bg-gradient-to-br from-white to-slate-50/5 dark:from-slate-900 dark:to-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
          >
            {/* Animated top bar */}
            <div style={{
              height:"3px",
              background:"linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#f59e0b,#10b981,#6366f1)",
              backgroundSize:"300% 100%",
              animation:"shimmer 4s linear infinite",
            }} />
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
            />
          </div>

          {/* Description */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/60 dark:border-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-650"
              >
                <span className="material-symbols-outlined text-white" style={{fontSize:"16px"}}>description</span>
              </div>
              <span className="font-black text-sm text-slate-800 dark:text-white">Mô tả sản phẩm</span>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm leading-7 text-slate-650 dark:text-slate-350 whitespace-pre-wrap"
              >
                {description || "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
