"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { resolveCatalogImageUrl } from "@/lib/api";
import { PromoBanner } from "@/lib/sale-api";

export function StorefrontHeroBanner({ banners }: { banners: PromoBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="group relative flex min-h-[430px] items-center overflow-hidden rounded-3xl bg-primary-container">
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFnPPil-xKkENhy_TTDCiYOTBtrlW7vdi1UcR-wYOMzgNpU8j6PPPZQIQfERv9nOQi8viFa-pDXMtoUny07QVPKzJprlTDJYl6-69-AkPqdH4qJRLj2gaTN9wzktExF9zsg1kiwP8jjEeTQPlFVZZyRb8Z3i1rEvCx4qXo-Zgy7Qu5IGIs2yredcQCoczF270XIO-FxOYreZq8A5ZW-nOOKozaXq8L0bDpf8x1bAs9dXMpdJv5x4-I7_nfJI6mQtoZwKJx4YF6Kwag"
          alt="Bộ sưu tập công nghệ cao cấp"
        />
        <div className="relative z-10 max-w-3xl px-8 md:px-16">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Tech Commerce Hub
          </p>
          <h3 className="mb-5 font-headline text-5xl font-extrabold leading-tight tracking-tighter text-white md:text-7xl">
            TRUNG TÂM <br />
            <span className="text-secondary-fixed">BÁN HÀNG CÔNG NGHỆ</span>
          </h3>
          <p className="mb-6 max-w-2xl text-lg font-medium text-surface-container-lowest/85">
            Tập trung sản phẩm công nghệ hot, giá cạnh tranh và cập nhật liên tục theo tồn kho thực tế từ hệ thống backend.
          </p>
          <div className="mb-8 flex flex-wrap gap-4">
            <a className="rounded-xl bg-white px-8 py-4 font-extrabold text-primary transition-all hover:-translate-y-0.5 hover:shadow-2xl" href="#san-pham-noi-bat">
              MUA NGAY
            </a>
            <Link className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/20" href="/cart">
              XEM GIỎ HÀNG
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/85">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Điện thoại - Laptop - Phụ kiện</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Nhiều biến thể giá linh hoạt</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">Giao nhanh toàn quốc</span>
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="group relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-3xl bg-surface-container">
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.linkUrl || "#"}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            src={resolveCatalogImageUrl(banner.imageUrl)}
            alt={banner.title || "Banner khuyến mãi"}
          />
        </Link>
      ))}
      
      {/* Indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full shadow-sm transition-all ${
                idx === currentIndex ? "w-8 bg-primary" : "w-2.5 bg-white/80 hover:bg-white"
              }`}
              aria-label={`Chuyển đến banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
