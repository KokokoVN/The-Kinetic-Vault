/**
 * useSimilarProducts — React hook để fetch sản phẩm liên quan qua API route.
 * Dùng phía client để không block server rendering.
 */
"use client";

import { useEffect, useState } from "react";

export type SimilarProductItem = {
  productId: number;
  productName: string;
  sku?: string | null;
  categoryId?: number | null;
  price?: number | null;
  priceDelta?: number | null;
  reason?: string | null;
  heroImage?: string | null;
  rawPrice?: number | null;
};

type State = {
  items: SimilarProductItem[];
  loading: boolean;
  error: string | null;
};

/**
 * Fetch danh sách sản phẩm liên quan từ recommendation service.
 * @param productId - ID sản phẩm hiện tại
 * @param limit     - Số lượng tối đa (mặc định 8)
 */
export function useSimilarProducts(productId: string | number, limit = 8): State {
  const [state, setState] = useState<State>({ items: [], loading: true, error: null });

  useEffect(() => {
    const pid = Number(productId);
    if (!Number.isFinite(pid) || pid <= 0) {
      setState({ items: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState(prev => ({ ...prev, loading: true, error: null }));

    (async () => {
      try {
        const res = await fetch(`/api/products/${pid}/similar?limit=${limit}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setState({ items: [], loading: false, error: `HTTP ${res.status}` });
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          const rows: SimilarProductItem[] = Array.isArray(data)
            ? data
                .filter((r: any) => r?.productId != null)
                .map((r: any) => ({
                  productId: Number(r.productId),
                  productName: String(r.productName ?? ""),
                  sku: r.sku ?? null,
                  categoryId: r.categoryId != null ? Number(r.categoryId) : null,
                  price: r.price != null ? Number(r.price) : null,
                  priceDelta: r.priceDelta != null ? Number(r.priceDelta) : null,
                  reason: r.reason ?? null,
                  heroImage: r.heroImage ?? r.primaryImageUrl ?? null,
                  rawPrice: r.price != null ? Number(r.price) : null,
                }))
            : [];
          setState({ items: rows, loading: false, error: null });
        }
      } catch (err: any) {
        if (!cancelled) setState({ items: [], loading: false, error: err?.message ?? "Network error" });
      }
    })();

    return () => { cancelled = true; };
  }, [productId, limit]);

  return state;
}
