"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { resolveCatalogImageUrl } from "@/lib/api";
import { PromoBanner } from "@/lib/sale-api";

// Fallback curated slides when no banners are configured yet
const DEFAULT_SLIDES: PromoBanner[] = [
  {
    id: -1,
    title: "iPhone 16 Pro Max - Sẵn Hàng Giao Ngay",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1400&q=80",
    linkUrl: "/products/1",
    active: true,
    position: 1,
  },
  {
    id: -2,
    title: "Galaxy S24 Ultra - Quyền Năng Galaxy AI",
    imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1400&q=80",
    linkUrl: "/products/2",
    active: true,
    position: 2,
  },
  {
    id: -3,
    title: "MacBook Pro M3 Pro - Trạm Sáng Tạo Di Động",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80",
    linkUrl: "/products/3",
    active: true,
    position: 3,
  },
];

// Rich curated badges and descriptions matched to tech flagship products
const SLIDE_METADATA: Record<string, { badge: string; icon: string; subtitle: string; tag: string }> = {
  "iPhone 16 Pro Max": {
    badge: "Siêu Phẩm Flagship 2026",
    icon: "bolt",
    subtitle: "Khung Titan tự nhiên siêu bền, chip Apple A18 Pro và camera 48MP Fusion đột phá.",
    tag: "Chỉ từ 29.990.000₫",
  },
  "Galaxy S24 Ultra": {
    badge: "Quyền Năng Galaxy AI",
    icon: "auto_awesome",
    subtitle: "Màn hình phẳng Dynamic AMOLED 2X rực rỡ, khung viền Titan và bút S-Pen quyền năng.",
    tag: "Trợ giá thu cũ 3 Triệu",
  },
  "MacBook Pro M3 Pro": {
    badge: "Trạm Sáng Tạo Di Động",
    icon: "laptop_mac",
    subtitle: "Màn hình Liquid Retina XDR sắc nét, chip Apple M3 Pro và pin kỷ lục 22 giờ liên tục.",
    tag: "Bảo hành 1 đổi 1",
  },
  "ROG Zephyrus G16": {
    badge: "Chiến Binh Gaming Đỉnh Cao",
    icon: "sports_esports",
    subtitle: "Màn hình OLED 240Hz siêu mượt, đồ họa RTX 4080 và bộ vi xử lý Intel Core Ultra 9.",
    tag: "Tặng Balo ROG VIP",
  },
  "Sony WH-1000XM5": {
    badge: "Chống Ồn Không Gian Số 1",
    icon: "headphones",
    subtitle: "Bộ vi xử lý kép V1/QN1 khử ồn chủ động, âm thanh Hi-Res Audio không dây đỉnh cao.",
    tag: "Giảm ngay 15%",
  },
  "Marshall Stanmore III": {
    badge: "Chất Âm Huyền Thoại",
    icon: "speaker",
    subtitle: "Thiết kế Vintage sang trọng đậm chất Rock, trường âm rộng hơn và Bluetooth 5.2.",
    tag: "Chính Hãng ASH",
  },
  "Keychron Q1 Pro": {
    badge: "Bàn Phím Cơ Custom Cao Cấp",
    icon: "keyboard",
    subtitle: "Vỏ nhôm CNC nguyên khối, kết nối Bluetooth đa thiết bị và tùy biến switch hotswap.",
    tag: "Full Phụ Kiện",
  },
  "Logitech MX Master 3S": {
    badge: "Đỉnh Cao Công Thái Học",
    icon: "mouse",
    subtitle: "Cảm biến Darkfield 8000 DPI lướt trên mọi bề mặt, cuộn MagSpeed điện từ siêu êm.",
    tag: "Best Seller",
  },
  "Apple Watch Ultra 2": {
    badge: "Chinh Phục Mọi Giới Hạn",
    icon: "watch",
    subtitle: "Vỏ Titan 49mm chuẩn quân đội, màn hình siêu sáng 3000 nits và chuẩn lặn 40m.",
    tag: "Sẵn Hàng Titan",
  },
  "Dell UltraSharp 4K": {
    badge: "Chuẩn Màu Đồ Họa Chuyên Nghiệp",
    icon: "monitor",
    subtitle: "Tấm nền IPS Black tương phản 2000:1, chuẩn 98% DCI-P3 và cổng Type-C sạc nhanh 90W.",
    tag: "Cân màu miễn phí",
  },
};

function parseBannerInfo(title: string | undefined | null) {
  const safeTitle = String(title || "").trim();
  const parts = safeTitle.split(" - ");
  const productKey = parts[0]?.trim() || safeTitle;
  const rawSubtitle = parts.slice(1).join(" - ").trim();

  // Check matching metadata
  let meta: { badge: string; icon: string; subtitle: string; tag: string } | undefined = SLIDE_METADATA[productKey];
  if (!meta) {
    // Find partial match
    const foundKey = Object.keys(SLIDE_METADATA).find((k) => productKey.toLowerCase().includes(k.toLowerCase()));
    meta = foundKey ? SLIDE_METADATA[foundKey] : undefined;
  }

  return {
    productName: productKey,
    highlight: rawSubtitle || meta?.subtitle || "Chính hãng 100% • Bảo hành 1 đổi 1 trong 30 ngày • Giao nhanh 2H.",
    badge: meta?.badge || "Special Cyber Drop",
    icon: meta?.icon || "bolt",
    tag: meta?.tag || "Ưu Đãi Đặc Biệt",
    description: meta?.subtitle || "Khám phá danh mục công nghệ và phụ kiện cao cấp với chính sách bảo hành chính hãng và giao hàng hỏa tốc trong 2h.",
  };
}

export function StorefrontHeroBanner({ banners }: { banners: PromoBanner[] }) {
  const effectiveBanners = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;

  // Use up to 8 banners for slider, and the last 2 for side bento cards
  const hasSideBanners = effectiveBanners.length >= 3;
  const sliderBanners = hasSideBanners ? effectiveBanners.slice(0, effectiveBanners.length - 2) : effectiveBanners;
  const sideBanners = hasSideBanners ? effectiveBanners.slice(effectiveBanners.length - 2) : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Keep index within bounds if slide count changes
  useEffect(() => {
    if (currentIndex >= sliderBanners.length && sliderBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [sliderBanners.length, currentIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (sliderBanners.length || 1));
  }, [sliderBanners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, sliderBanners.length - 1) : prev - 1));
  }, [sliderBanners.length]);

  // Autoplay with pause on hover
  useEffect(() => {
    if (sliderBanners.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [sliderBanners.length, nextSlide, isPaused]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <div className="mx-auto max-w-screen-2xl mb-8 mt-1">
      {/* Outer ambient container with flagship glass border */}
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 p-2.5 sm:p-3.5 shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/70 backdrop-blur-2xl transition-colors">
        
        {/* Subtle ambient light halos behind the frame */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rounded-full bg-indigo-500/15 dark:bg-indigo-600/25 blur-[90px]" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-72 w-72 rounded-full bg-cyan-500/15 dark:bg-cyan-500/20 blur-[90px]" />

        {/* 8 : 4 Grid Layout (Always side-by-side on desktop lg:) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          
          {/* ================= LEFT: MAIN HERO SLIDER (8 Columns on Desktop) ================= */}
          <div
            className="col-span-1 lg:col-span-8 flex flex-col"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="group relative w-full flex-1 min-h-[440px] sm:min-h-[480px] lg:min-h-[500px] xl:min-h-[530px] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-zinc-950 shadow-inner ring-1 ring-black/10 dark:ring-white/10">
              
              {sliderBanners.map((banner, index) => {
                const isActive = index === currentIndex;
                const hasRealImage = banner.imageUrl && !banner.imageUrl.startsWith("placeholder") && banner.imageUrl.trim().length > 0;
                const info = parseBannerInfo(banner.title);
                const displayImageUrl = hasRealImage ? resolveCatalogImageUrl(banner.imageUrl) : "";

                return (
                  <div
                    key={banner.id ?? index}
                    className={`absolute inset-0 h-full w-full transition-all duration-700 ease-out ${
                      isActive ? "opacity-100 scale-100 z-10 visible" : "opacity-0 scale-105 z-0 invisible pointer-events-none"
                    }`}
                  >
                    {/* Background Layer: Image with ambient glow */}
                    {hasRealImage && (
                      <div className="absolute inset-0 h-full w-full overflow-hidden">
                        {/* Ambient Deep Blur */}
                        <img
                          src={displayImageUrl}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover blur-[60px] opacity-40 dark:opacity-30 scale-110"
                        />
                        {/* Main Backdrop Image positioned gracefully on the right */}
                        <img
                          src={displayImageUrl}
                          alt={banner.title || "Banner khuyến mãi"}
                          className="absolute inset-y-0 right-0 h-full w-full lg:w-[72%] object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}

                    {/* Gradient Overlay Mask: Provides dark readable contrast on the left & bottom */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-slate-950/85 sm:via-slate-950/70 lg:via-slate-950/85 to-transparent" />
                    <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/75 pointer-events-none" />

                    {/* Subtle Cyber Grid Accent */}
                    <div
                      className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
                      style={{
                        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />

                    {/* Foreground Content: Title, Badges, Selling Points & CTAs */}
                    <div className="relative z-20 flex h-full w-full flex-col justify-between p-6 sm:p-10 lg:p-12 text-white">
                      
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-md shadow-lg shadow-cyan-500/20">
                          <span className="material-symbols-outlined text-xs text-cyan-400">{info.icon}</span>
                          {info.badge}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                          <span className="material-symbols-outlined text-xs text-amber-400">verified</span>
                          Chính Hãng 100%
                        </span>
                        <span className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-200 backdrop-blur-md">
                          {info.tag}
                        </span>
                      </div>

                      {/* Center Content: Product Name, Slogan & Description */}
                      <div className="max-w-xl my-auto py-4">
                        <h2 className="font-headline text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white drop-shadow-xl">
                          {info.productName}
                        </h2>
                        
                        <div className="mt-2 text-base sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-white drop-shadow">
                          {info.highlight}
                        </div>

                        <p className="mt-3 text-xs sm:text-sm font-normal text-slate-300/90 leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-3">
                          {info.description}
                        </p>

                        {/* Feature Micro-Badges */}
                        <div className="mt-4 hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-cyan-400">local_shipping</span>
                            Giao Hỏa Tốc 2H
                          </span>
                          <span className="h-3 w-px bg-white/20" />
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-indigo-400">verified_user</span>
                            1 Đổi 1 Trong 30 Ngày
                          </span>
                          <span className="h-3 w-px bg-white/20" />
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-amber-400">credit_card</span>
                            Trả Góp 0%
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action CTAs */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 pb-6 sm:pb-2">
                        <Link
                          href={banner.linkUrl || "/products"}
                          className="group/btn inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-cyan-500/40 active:scale-95"
                        >
                          <span>Khám Phá Ngay</span>
                          <span className="material-symbols-outlined text-base transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                        </Link>
                        
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 hover:bg-white/20 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white backdrop-blur-xl transition-all active:scale-95 shadow-md"
                        >
                          <span className="material-symbols-outlined text-base text-amber-300">local_activity</span>
                          <span>Săn Voucher VIP</span>
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Navigation Arrows */}
              {sliderBanners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      prevSlide();
                    }}
                    className="absolute left-3 sm:left-4 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-white backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:bg-black/70 hover:border-white/40 shadow-lg active:scale-95"
                    aria-label="Slide trước"
                  >
                    <span className="material-symbols-outlined text-[22px] sm:text-[26px]">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      nextSlide();
                    }}
                    className="absolute right-3 sm:right-4 top-1/2 z-30 -translate-y-1/2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-white backdrop-blur-xl transition-all duration-200 hover:scale-110 hover:bg-black/70 hover:border-white/40 shadow-lg active:scale-95"
                    aria-label="Slide tiếp theo"
                  >
                    <span className="material-symbols-outlined text-[22px] sm:text-[26px]">chevron_right</span>
                  </button>
                </>
              )}

              {/* Modern Progress Pill Indicators */}
              {sliderBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/50 px-4 py-2 backdrop-blur-xl shadow-2xl">
                  {/* Current index readout */}
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300 mr-1 hidden sm:inline">
                    {String(currentIndex + 1).padStart(2, "0")} / {String(sliderBanners.length).padStart(2, "0")}
                  </span>

                  {sliderBanners.map((_, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentIndex(idx);
                        }}
                        className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 ${
                          isActive ? "w-8 bg-white/40" : "w-2 bg-white/60 hover:bg-white hover:w-3"
                        }`}
                        aria-label={`Chuyển tới slide ${idx + 1}`}
                      >
                        {isActive && !isPaused && (
                          <span
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full origin-left shadow-[0_0_8px_#22d3ee]"
                            style={{ animation: "heroSliderProgress 5s linear forwards" }}
                          />
                        )}
                        {isActive && isPaused && (
                          <span className="absolute inset-y-0 left-0 w-full bg-cyan-400 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: SIDE BENTO SECTION (4 Columns on Desktop) ================= */}
          <div className="col-span-1 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-3 sm:gap-4 h-full">
            {hasSideBanners ? (
              /* Case 1: When user has side banners configured */
              sideBanners.map((banner, index) => {
                const hasImg = banner.imageUrl && !banner.imageUrl.startsWith("placeholder") && banner.imageUrl.trim().length > 0;
                const info = parseBannerInfo(banner.title);
                const displayImg = hasImg ? resolveCatalogImageUrl(banner.imageUrl) : "";
                const isFirst = index === 0;

                return (
                  <Link
                    key={banner.id ?? index}
                    href={banner.linkUrl || "/products"}
                    className="group/side relative flex-1 min-h-[210px] sm:min-h-[235px] flex flex-col justify-between overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-slate-900 p-5 sm:p-6 text-white shadow-md transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/50 hover:scale-[1.01] active:scale-95"
                  >
                    {/* Background Graphic & Atmosphere */}
                    {hasImg ? (
                      <div className="absolute inset-0 h-full w-full overflow-hidden">
                        <img
                          src={displayImg}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full object-cover blur-md opacity-40 scale-110 transition-transform duration-700 group-hover/side:scale-125"
                        />
                        <img
                          src={displayImg}
                          alt={banner.title || "Banner phụ"}
                          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover/side:scale-105"
                        />
                        {/* Dark Gradient Mask for pristine text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-zinc-900" />
                    )}

                    {/* Ambient Spotlight Glow */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-[50px] group-hover/side:scale-125 transition-transform duration-500" />

                    {/* Top Header Tag */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                        isFirst 
                          ? "border-amber-400/40 bg-amber-500/20 text-amber-300" 
                          : "border-cyan-400/40 bg-cyan-500/20 text-cyan-300"
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {isFirst ? "local_fire_department" : "bolt"}
                        </span>
                        {isFirst ? "Hot Deal Tuần Này" : "Đặc Quyền Pro"}
                      </span>

                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md group-hover/side:rotate-12 transition-transform shadow-sm">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>

                    {/* Middle Content */}
                    <div className="relative z-10 my-2">
                      <h4 className="font-headline font-black text-lg sm:text-xl text-white group-hover/side:text-cyan-300 transition-colors leading-snug drop-shadow-md">
                        {info.productName}
                      </h4>
                      <p className="mt-1 text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
                        {info.highlight}
                      </p>
                    </div>

                    {/* Bottom CTA */}
                    <div className="relative z-10 flex items-center justify-between pt-1 border-t border-white/10 text-[11px] font-bold text-cyan-300">
                      <span className="text-amber-300 font-black">{info.tag}</span>
                      <span className="flex items-center gap-1 group-hover/side:translate-x-1 transition-transform">
                        Săn deal ngay <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>

                    {/* Subtle interactive shine on hover */}
                    <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover/side:bg-white/5 z-20 pointer-events-none" />
                  </Link>
                );
              })
            ) : (
              /* Case 2: Curated VIP Bento Cards */
              <>
                {/* Bento Card 1: Voucher & Deals */}
                <Link
                  href="/products"
                  className="group/bento relative flex-1 min-h-[210px] sm:min-h-[235px] flex flex-col justify-between overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-indigo-950/90 dark:via-purple-950/70 dark:to-zinc-950 p-5 sm:p-6 text-white shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] active:scale-95"
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-[50px] group-hover/bento:scale-125 transition-transform duration-500" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200 backdrop-blur-md">
                      <span className="material-symbols-outlined text-xs">local_activity</span>
                      Voucher VIP
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md group-hover/bento:rotate-12 transition-transform shadow-sm">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </span>
                  </div>

                  <div className="relative z-10 my-2">
                    <h3 className="font-headline text-lg sm:text-xl font-black tracking-tight text-white group-hover/bento:text-cyan-200 transition-colors">
                      Săn Mã Giảm Đến 50%
                    </h3>
                    <p className="mt-1 text-xs text-indigo-100/90 dark:text-slate-300 leading-relaxed">
                      Áp dụng cho mọi đơn hàng công nghệ. Nhập mã tại giỏ hàng để nhận chiết khấu trực tiếp.
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-[11px] font-bold text-cyan-200">
                    <span>Nhận voucher ngay</span>
                    <span className="material-symbols-outlined text-xs transition-transform group-hover/bento:translate-x-1">arrow_forward</span>
                  </div>
                </Link>

                {/* Bento Card 2: Cyber Privilege */}
                <Link
                  href="/products"
                  className="group/bento relative flex-1 min-h-[210px] sm:min-h-[235px] flex flex-col justify-between overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-cyan-200/80 dark:border-cyan-500/30 bg-gradient-to-br from-teal-600 via-cyan-700 to-slate-900 dark:from-cyan-950/90 dark:via-teal-950/70 dark:to-zinc-950 p-5 sm:p-6 text-white shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] active:scale-95"
                >
                  <div className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-indigo-500/20 blur-[50px] group-hover/bento:scale-125 transition-transform duration-500" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200 backdrop-blur-md">
                      <span className="material-symbols-outlined text-xs">verified_user</span>
                      Chính Hãng 100%
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-md group-hover/bento:rotate-12 transition-transform shadow-sm">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </span>
                  </div>

                  <div className="relative z-10 my-2">
                    <h3 className="font-headline text-lg sm:text-xl font-black tracking-tight text-white group-hover/bento:text-cyan-200 transition-colors">
                      Đặc Quyền Giao Siêu Tốc 2H
                    </h3>
                    <p className="mt-1 text-xs text-cyan-100/90 dark:text-slate-300 leading-relaxed">
                      Bảo hành 1 đổi 1 trong 30 ngày, hoàn tiền 200% nếu phát hiện hàng không chuẩn chính hãng.
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-[11px] font-bold text-cyan-200">
                    <span>Khám phá bộ sưu tập</span>
                    <span className="material-symbols-outlined text-xs transition-transform group-hover/bento:translate-x-1">arrow_forward</span>
                  </div>
                </Link>
              </>
            )}
          </div>

        </div>

        {/* ================= STORE TRUST & BENEFITS STRIP ================= */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-200/60 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 px-2">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.03]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <span className="material-symbols-outlined text-lg">bolt</span>
            </span>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">Giao Nhanh 2H</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Nội thành Hà Nội & TP.HCM</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.03]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <span className="material-symbols-outlined text-lg">verified</span>
            </span>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">Chính Hãng 100%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Đầy đủ VAT & bảo hành hãng</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.03]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500 dark:text-cyan-400">
              <span className="material-symbols-outlined text-lg">sync</span>
            </span>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">1 Đổi 1 Trong 30 Ngày</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Nếu phát sinh lỗi từ nhà SX</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100/50 dark:bg-white/[0.03]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <span className="material-symbols-outlined text-lg">credit_score</span>
            </span>
            <div>
              <div className="text-xs font-black text-slate-800 dark:text-white">Trả Góp 0% Lãi Suất</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Thủ tục nhanh qua thẻ tín dụng</div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes heroSliderProgress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}} />
    </div>
  );
}
