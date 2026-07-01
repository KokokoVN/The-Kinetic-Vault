"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { resolveCatalogImageUrl, type UiSimilarProduct } from "@/lib/api";

function moneyVnd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export function SimilarProductsPanel({ items }: { items: UiSimilarProduct[] }) {
  const [limit, setLimit] = useState(4);
  const visible = useMemo(() => items.slice(0, limit), [items, limit]);

  if (!items.length) return null;

  return (
    <section id="section-similar" className="scroll-mt-24 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-headline text-lg font-black text-blue-900">Sản phẩm tương tự</h3>
          <p className="mt-1 text-xs text-on-surface-variant">Lấy từ API gợi ý tương tự của backend.</p>
        </div>
        {items.length > 4 ? (
          <button
            type="button"
            className="rounded-xl border border-outline-variant/20 px-3 py-2 text-xs font-bold text-blue-900 hover:bg-surface-container-high"
            onClick={() => setLimit((prev) => (prev >= items.length ? 4 : items.length))}
          >
            {limit >= items.length ? "Thu gọn" : "Xem thêm"}
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((row) => (
          <Link
            key={row.item.id}
            prefetch
            href={`/admin/products/${encodeURIComponent(row.item.id)}/detail`}
            className="group overflow-hidden rounded-2xl border border-outline-variant/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveCatalogImageUrl(row.item.heroImage)} alt="" className="h-36 w-full object-cover" />
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-bold text-blue-900 group-hover:underline">{row.item.name}</p>
              <p className="text-xs text-on-surface-variant">{row.reason ?? "Sản phẩm tương tự"}</p>
              <p className="text-sm font-black text-blue-900">{row.item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
