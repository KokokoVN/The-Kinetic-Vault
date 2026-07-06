"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { resolveCatalogImageUrl } from "@/lib/api";
import { PromoBanner } from "@/lib/sale-api";

export function StorefrontHeroBanner({ banners }: { banners: PromoBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Shopee-style layout logic: if >= 3 banners, we split them.
  const hasSideBanners = banners.length >= 3;
  const sliderBanners = hasSideBanners ? banners.slice(0, banners.length - 2) : banners;
  const sideBanners = hasSideBanners ? banners.slice(banners.length - 2) : [];

  // Fix: Ensure currentIndex is within bounds if banners change
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

  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [sliderBanners.length, nextSlide]);

  if (banners.length === 0) {
    return (
      <div className="group relative flex w-full aspect-[16/9] md:aspect-[21/9] xl:aspect-[10/3] items-center justify-center overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 shadow-inner">
        <p className="text-slate-400 dark:text-slate-600 font-black tracking-widest uppercase text-sm">Trải nghiệm mua sắm đỉnh cao</p>
      </div>
    );
  }

  // Determine aspect ratio for the main slider to make it fit beautifully
  const mainSliderAspect = hasSideBanners 
    ? "aspect-[16/9] lg:aspect-[2/1] xl:aspect-[24/11]" 
    : "aspect-[16/9] md:aspect-[21/9] xl:aspect-[10/3]";

  return (
    <div className="mx-auto max-w-screen-2xl mb-4 mt-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Main Slider (Left side) */}
        <div className={`col-span-1 ${hasSideBanners ? "lg:col-span-8" : "lg:col-span-12"}`}>
          <div className={`group relative w-full ${mainSliderAspect} flex items-center justify-center overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-black shadow-2xl shadow-slate-900/20 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10`}>
            {sliderBanners.map((banner, index) => {
              const isActive = index === currentIndex;
              return (
                <Link
                  key={banner.id}
                  href={banner.linkUrl || "#"}
                  className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  {/* Ambient Blurred Background */}
                  <img
                    src={resolveCatalogImageUrl(banner.imageUrl)}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover blur-[40px] md:blur-[80px] opacity-70 transition-transform duration-1000 ease-in-out ${
                      isActive ? "scale-110" : "scale-150"
                    }`}
                  />
                  
                  {/* Main Banner Image */}
                  <div className={`relative h-full w-full transition-transform ease-out flex items-center justify-center ${isActive ? "duration-[8000ms] scale-105" : "duration-0 scale-100"}`}>
                    <img
                      className="absolute inset-0 h-full w-full object-contain"
                      src={resolveCatalogImageUrl(banner.imageUrl)}
                      alt={banner.title || "Banner khuyến mãi"}
                    />
                  </div>
                </Link>
              );
            })}

            {/* Elegant Inner Shadow / Gradient Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/40" />

            {/* Navigation Arrows */}
            {sliderBanners.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); prevSlide(); }}
                  className="absolute left-3 md:left-4 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/10 md:bg-black/30 backdrop-blur-xl border border-white/20 text-white opacity-100 md:opacity-0 transition-all duration-300 hover:bg-black/50 hover:scale-110 group-hover:opacity-100 shadow-xl"
                  aria-label="Previous"
                >
                  <span className="material-symbols-outlined text-lg md:text-2xl font-light">chevron_left</span>
                </button>
                
                <button
                  onClick={(e) => { e.preventDefault(); nextSlide(); }}
                  className="absolute right-3 md:right-4 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/10 md:bg-black/30 backdrop-blur-xl border border-white/20 text-white opacity-100 md:opacity-0 transition-all duration-300 hover:bg-black/50 hover:scale-110 group-hover:opacity-100 shadow-xl"
                  aria-label="Next"
                >
                  <span className="material-symbols-outlined text-lg md:text-2xl font-light">chevron_right</span>
                </button>
              </>
            )}
            
            {/* Premium Progress Indicators */}
            {sliderBanners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 md:gap-2.5 rounded-full bg-black/30 backdrop-blur-xl px-3 py-1.5 md:px-4 md:py-2 border border-white/10 shadow-2xl">
                {sliderBanners.map((_, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                      className={`relative h-1 md:h-1.5 overflow-hidden rounded-full transition-all duration-300 cursor-pointer ${isActive ? "w-6 md:w-10 bg-white/40" : "w-1.5 md:w-2 bg-white/60 hover:bg-white hover:w-3"}`}
                      aria-label={`Go to slide ${idx + 1}`}
                    >
                      {isActive && (
                        <span 
                          className="absolute inset-y-0 left-0 bg-white rounded-full origin-left shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                          style={{ animation: 'sliderProgress 5s linear forwards' }} 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes sliderProgress {
                0% { transform: scaleX(0); }
                100% { transform: scaleX(1); }
              }
            `}} />
          </div>
        </div>

        {/* Side Static Banners (Right side) - Hidden on Mobile, shown on Desktop */}
        {hasSideBanners && (
          <div className="hidden lg:flex flex-col gap-4 col-span-4 h-full">
            {sideBanners.map((banner, index) => (
              <Link
                key={banner.id}
                href={banner.linkUrl || "#"}
                className="group/side relative flex-1 overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-black shadow-lg shadow-slate-900/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10"
              >
                {/* Ambient Blurred Background for side banner */}
                <img
                  src={resolveCatalogImageUrl(banner.imageUrl)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover blur-[30px] opacity-60 transition-transform duration-700 group-hover/side:scale-110"
                />
                
                <div className="relative h-full w-full flex items-center justify-center transition-transform duration-700 group-hover/side:scale-105">
                  {/* Changed to object-cover if they want it to perfectly fit the frame, but let's stick to object-contain so we don't cut off text */}
                  <img
                    className="absolute inset-0 h-full w-full object-contain"
                    src={resolveCatalogImageUrl(banner.imageUrl)}
                    alt={banner.title || "Side banner"}
                  />
                </div>
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover/side:bg-white/10 z-10 pointer-events-none" />
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
