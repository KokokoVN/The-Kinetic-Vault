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

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-white/[0.06] bg-slate-100/60 dark:bg-slate-900/40 p-4">
      <div className="animate-pulse space-y-4">
        <div className="rounded-2xl bg-slate-200 dark:bg-slate-800" style={{ aspectRatio: "1/1" }} />
        <div className="space-y-2">
          <div className="h-3.5 rounded-full bg-slate-200 dark:bg-slate-800" style={{ width: "75%" }} />
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800" style={{ width: "50%" }} />
          <div className="h-5 rounded-full bg-indigo-500/20" style={{ width: "60%" }} />
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
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .sim-card { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

      <section className="relative mt-20 mb-12">
        {/* Section header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              <span>Gợi ý cho bạn</span>
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Sản phẩm tương tự
            </h2>
          </div>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 backdrop-blur hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
          >
            <span>Khám phá thêm</span>
            <span className="material-symbols-outlined text-sm transition-transform duration-200 group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-3xl py-12 bg-rose-50/30 dark:bg-rose-950/10 border border-dashed border-rose-200 dark:border-rose-900/40 text-center">
            <span className="material-symbols-outlined text-4xl text-rose-400">error_outline</span>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Không thể tải gợi ý sản phẩm lúc này.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl py-14 bg-indigo-500/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Hiện chưa có gợi ý tương tự cho sản phẩm này.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
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

