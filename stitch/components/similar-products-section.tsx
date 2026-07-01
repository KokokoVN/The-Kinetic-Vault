"use client";

import Link from "next/link";
import { useSimilarProducts } from "@/hooks/use-similar-products";

type Props = {
  productId: string | number;
  limit?: number;
};

function asCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function SkeletonCard() {
  return (
    <div
      className="overflow-hidden"
      style={{ borderRadius: "1.5rem", background: "#f1f5f9", border: "1.5px solid rgba(0,0,0,0.05)" }}
    >
      <div className="animate-pulse">
        <div style={{ aspectRatio: "1/1", background: "linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
        <div className="space-y-2 p-4">
          <div className="h-3 rounded-full bg-slate-200" style={{ width: "70%" }} />
          <div className="h-3 rounded-full bg-slate-200" style={{ width: "50%" }} />
          <div className="h-5 rounded-full bg-indigo-100" style={{ width: "60%" }} />
        </div>
      </div>
    </div>
  );
}

export function SimilarProductsSection({ productId, limit = 8 }: Props) {
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
            <p className="mb-1 text-xs font-black uppercase tracking-widest" style={{ color: "#818cf8" }}>
              Có thể bạn thích
            </p>
            <h2
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "#0f0f23", letterSpacing: "-0.02em" }}
            >
              Sản phẩm tương tự
            </h2>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary/10"
            style={{ border: "1.5px solid rgba(99,102,241,0.25)" }}
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
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-12"
            style={{ background: "rgba(239,68,68,0.04)", border: "1.5px dashed rgba(239,68,68,0.2)" }}
          >
            <span className="material-symbols-outlined text-4xl" style={{ color: "rgba(239,68,68,0.4)" }}>error_outline</span>
            <p className="mt-2 text-sm font-semibold" style={{ color: "rgba(0,0,0,0.4)" }}>
              Không thể tải sản phẩm gợi ý lúc này.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-12"
            style={{ background: "rgba(99,102,241,0.04)", border: "1.5px dashed rgba(99,102,241,0.2)" }}
          >
            <span className="material-symbols-outlined text-5xl" style={{ color: "rgba(99,102,241,0.25)" }}>search_off</span>
            <p className="mt-3 text-sm font-semibold" style={{ color: "rgba(0,0,0,0.4)" }}>
              Hiện chưa có gợi ý tương tự cho sản phẩm này.
            </p>
          </div>
        )}

        {/* Product grid */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
              <Link
                key={item.productId}
                href={`/product/${item.productId}`}
                className="sim-card group block"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <article
                  className="flex h-full flex-col overflow-hidden transition-all duration-400"
                  style={{
                    borderRadius: "1.5rem",
                    background: "linear-gradient(145deg,#fff,#fafbff)",
                    border: "1.5px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  }}
                  onMouseEnter={e => {
                    Object.assign((e.currentTarget as HTMLElement).style, {
                      transform: "translateY(-6px) scale(1.01)",
                      boxShadow: "0 20px 48px rgba(99,102,241,0.15), 0 4px 16px rgba(0,0,0,0.06)",
                      borderColor: "rgba(99,102,241,0.25)",
                    });
                  }}
                  onMouseLeave={e => {
                    Object.assign((e.currentTarget as HTMLElement).style, {
                      transform: "translateY(0) scale(1)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                      borderColor: "rgba(0,0,0,0.06)",
                    });
                  }}
                >
                  {/* Image */}
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "1/1", background: "linear-gradient(135deg,#eef2ff,#e0e7ff)" }}
                  >
                    {item.heroImage ? (
                      <img
                        src={item.heroImage}
                        alt={item.productName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="material-symbols-outlined text-4xl" style={{ color: "rgba(99,102,241,0.3)" }}>image</span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: "linear-gradient(to top,rgba(0,0,0,0.35),transparent)" }}
                    >
                      <span
                        className="translate-y-3 rounded-full px-4 py-2 text-xs font-bold text-white transition-transform duration-300 group-hover:translate-y-0"
                        style={{ background: "rgba(99,102,241,0.9)", backdropFilter: "blur(8px)" }}
                      >
                        Xem sản phẩm →
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3
                      className="line-clamp-2 text-sm font-bold leading-snug transition-colors group-hover:text-primary"
                      style={{ color: "#0f0f23" }}
                    >
                      {item.productName}
                    </h3>

                    {item.reason && (
                      <p
                        className="mt-1 line-clamp-1 text-[11px] font-medium"
                        style={{ color: "rgba(0,0,0,0.4)" }}
                      >
                        {item.reason}
                      </p>
                    )}

                    <div className="mt-auto pt-3 flex items-center justify-between">
                      {item.price != null && item.price > 0 ? (
                        <p
                          className="font-black"
                          style={{
                            fontSize: "0.95rem",
                            background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {asCurrency(item.price)}
                        </p>
                      ) : (
                        <p className="text-sm font-bold" style={{ color: "rgba(0,0,0,0.3)" }}>—</p>
                      )}

                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_outward</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
