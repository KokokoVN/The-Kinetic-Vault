"use client";

import Link from "next/link";
import { useSimilarProducts } from "@/hooks/use-similar-products";
import { resolveCatalogImageUrl } from "@/lib/api";
import type { SaleProgram } from "@/lib/sale-api";
import { ProductCard } from "@/components/product-card";

type Props = {
  productId: string | number;
  limit?: number;
  activePrograms?: SaleProgram[];
};

function asCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
    >
      <div className="animate-pulse">
        <div className="bg-slate-200 dark:bg-slate-800" style={{ aspectRatio: "1/1" }} />
        <div className="space-y-2 p-4">
          <div className="h-3 rounded-full bg-slate-300 dark:bg-slate-700" style={{ width: "70%" }} />
          <div className="h-3 rounded-full bg-slate-300 dark:bg-slate-700" style={{ width: "50%" }} />
          <div className="h-5 rounded-full bg-indigo-105 dark:bg-indigo-950/40" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

export function SimilarProductsSection({ productId, limit = 8, activePrograms = [] }: Props) {
  const { items, loading, error } = useSimilarProducts(productId, limit);

  return (
    <>
      <style>{`
        @keyframes shimmer { from{background-position:-200% 0} to{background-position:200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .sim-card { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <section className="mt-20 mb-12">
        {/* Section header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-indigo-400 dark:text-indigo-400">
              Có thể bạn thích
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white tracking-tight"
            >
              Sản phẩm tương tự
            </h2>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all"
          >
            Xem thêm
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl py-12 bg-rose-50/20 dark:bg-rose-950/10 border border-dashed border-rose-200 dark:border-rose-900/40"
          >
            <span className="material-symbols-outlined text-4xl text-rose-500/40 dark:text-rose-500/30">error_outline</span>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Không thể tải sản phẩm gợi ý lúc này.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl py-12 bg-indigo-50/20 dark:bg-indigo-950/10 border border-dashed border-indigo-200 dark:border-indigo-900/40"
          >
            <span className="material-symbols-outlined text-5xl text-indigo-400/30 dark:text-indigo-400/20">search_off</span>
            <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Hiện chưa có gợi ý tương tự cho sản phẩm này.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => {
              let finalPrice = item.rawPrice ?? item.price ?? 0;
              let isSale = false;
              let originalPrice = finalPrice;
              let saleBadge = "";
              
              if (activePrograms && activePrograms.length > 0 && finalPrice > 0) {
                let bestDiscount = 0;
                activePrograms.forEach(program => {
                  const hasProduct = program.items.some(it => it.productId === item.productId && (it.promoQtyLimit == null || it.promoQtyLimit > 0));
                  if (hasProduct) {
                    let discount = 0;
                    let currentSalePrice = originalPrice;
                    let currentBadge = "";
                    if (program.discountType === "PERCENT") {
                      discount = (originalPrice * program.discountValue) / 100;
                      currentSalePrice = originalPrice - discount;
                      currentBadge = `GIẢM ${program.discountValue}%`;
                    } else if (program.discountType === "AMOUNT") {
                      discount = Math.max(0, originalPrice - program.discountValue);
                      currentSalePrice = program.discountValue;
                      if (program.discountValue >= 1000) {
                        currentBadge = `ĐỒNG GIÁ ${program.discountValue / 1000}K`;
                      } else {
                        currentBadge = "SALE";
                      }
                    }
                    if (discount > bestDiscount) {
                      bestDiscount = discount;
                      finalPrice = currentSalePrice;
                      isSale = true;
                      saleBadge = currentBadge;
                    }
                  }
                });
              }

              const badges = [];
              if (saleBadge) badges.push(saleBadge);

              return (
                <div
                  key={item.productId}
                  className="sim-card block"
                  style={{ animationDelay: `${idx * 60}ms`, height: "100%" }}
                >
                  <ProductCard
                    href={`/product/${item.productId}`}
                    image={item.heroImage ? resolveCatalogImageUrl(item.heroImage) : ""}
                    title={item.productName}
                    subtitle={item.reason}
                    price={finalPrice}
                    originalPrice={isSale ? originalPrice : null}
                    badges={badges}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
