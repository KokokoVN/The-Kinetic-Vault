"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CartProduct = {
  id?: number | null;
  sku?: string | null;
  productName?: string | null;
  price?: number | string | null;
  effectivePrice?: number | string | null;
  primaryImageUrl?: string | null;
  availability?: number | null;
  hidden?: boolean | null;
  deletedAt?: string | number[] | null;
};

type CartItem = {
  quantity?: number | null;
  subTotal?: number | string | null;
  originalPrice?: number | string | null;
  productId?: number | null;
  variantId?: number | null;
  variantLabel?: string | null;
  variantImageUrl?: string | null;
  variant_image_url?: string | null;
  product?: CartProduct | null;
};

type CartResponse = {
  cartId?: string | null;
  itemCount?: number | null;
  total?: number | string | null;
  items?: CartItem[] | null;
};

function toCartResponseLike(raw: unknown): CartResponse {
  if (Array.isArray(raw)) {
    const items = raw as CartItem[];
    const total = items.reduce((sum, it) => {
      const n = Number(it?.subTotal ?? 0);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    const itemCount = items.reduce((sum, it) => sum + safeQty(it), 0);
    return { cartId: null, itemCount, total, items };
  }
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const directItems =
      (Array.isArray(obj.items) ? (obj.items as CartItem[]) : null) ??
      (Array.isArray(obj.data) ? (obj.data as CartItem[]) : null) ??
      (Array.isArray(obj.content) ? (obj.content as CartItem[]) : null);
    if (directItems) {
      const total = directItems.reduce((sum, it) => {
        const n = Number(it?.subTotal ?? 0);
        return sum + (Number.isFinite(n) ? n : 0);
      }, 0);
      const itemCount = directItems.reduce((sum, it) => sum + safeQty(it), 0);
      return {
        cartId: typeof obj.cartId === "string" ? obj.cartId : null,
        itemCount,
        total,
        items: directItems,
      };
    }
    return obj as CartResponse;
  }
  return { cartId: null, itemCount: 0, total: 0, items: [] };
}

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function itemTitle(it: CartItem): string {
  const name = it.product?.productName?.trim();
  if (name) return name;
  const pid = Number(it.productId ?? 0);
  if (pid > 0) return `Sản phẩm #${pid}`;
  return "Sản phẩm";
}

function itemSubtitle(it: CartItem): string {
  const v = it.variantLabel?.trim();
  if (v) return v;
  const sku = it.product?.sku?.trim();
  if (sku) return `SKU: ${sku}`;
  return "—";
}

function safeQty(it: CartItem): number {
  const q = Math.floor(Number(it.quantity ?? 1));
  return Number.isFinite(q) && q > 0 ? q : 1;
}

function lineImageRaw(it: CartItem): string | null {
  const v = String(it.variantImageUrl ?? it.variant_image_url ?? "").trim();
  if (v) return v;
  const p = String(it.product?.primaryImageUrl ?? "").trim();
  return p || null;
}

function resolveCartImage(raw?: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  const inferredOrigin = /^https?:\/\//i.test(apiBase) ? apiBase.replace(/\/+$/, "").replace(/\/api\/?$/i, "") : "";
  const origin = (inferredOrigin || "http://localhost:8900").replace(/\/+$/, "");
  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/api/catalog/admin/products/images/file/${v}`;
}

function isUnavailableItem(it: CartItem): boolean {
  if (!it.product) return true;
  if (Boolean(it.product.hidden)) return true;
  if (it.product.deletedAt != null && String(it.product.deletedAt).trim() !== "") return true;
  return false;
}

export function CartPageClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const items = useMemo(() => (Array.isArray(cart?.items) ? cart.items : []), [cart]);
  const totalItems = useMemo(() => items.reduce((acc, it) => acc + safeQty(it), 0), [items]);

  useEffect(() => {
    setSelectedKeys((prev) => {
      if (!items.length) return {};
      const valid = new Set(items.filter((it) => !isUnavailableItem(it)).map((it, idx) => lineKey(it, idx)));
      const next: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (v && valid.has(k)) next[k] = true;
      }
      return next;
    });
  }, [items]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/items", { cache: "no-store" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        setError(txt ? `Không tải được giỏ hàng: ${txt.slice(0, 160)}` : `Không tải được giỏ hàng (HTTP ${res.status}).`);
        return;
      }
      const data = (await res.json().catch(() => null)) as unknown;
      const normalized = toCartResponseLike(data);
      const normalizedItems = Array.isArray(normalized.items) ? normalized.items : [];
      if (normalizedItems.length > 0) { setCart(normalized); return; }
      const resRaw = await fetch("/api/cart", { cache: "no-store" });
      if (resRaw.ok) {
        const rawList = (await resRaw.json().catch(() => null)) as unknown;
        setCart(toCartResponseLike(rawList));
        return;
      }
      setCart(normalized);
    } catch {
      setError("Không kết nối được tới hệ thống giỏ hàng.");
      setCart({ cartId: null, itemCount: 0, total: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function rowKey(it: CartItem): string {
    return `${Number(it.productId ?? 0)}:${it.variantId != null ? String(it.variantId) : ""}`;
  }
  function lineKey(it: CartItem, index: number): string {
    return `${rowKey(it)}#${index}`;
  }

  const mutate = useCallback(
    async (key: string, action: () => Promise<Response>, successMessage?: string) => {
      setBusyKey(key);
      setError(null);
      try {
        const res = await action();
        if (!res.ok) {
          if (res.status === 409) {
            const msg = "Số lượng vượt quá tồn kho hiện có.";
            setError(msg);
            setToast({ kind: "error", message: msg });
            return;
          }
          const txt = await res.text().catch(() => "");
          const msg = txt ? `Lỗi: ${txt.slice(0, 180)}` : "Không cập nhật được giỏ hàng.";
          setError(msg);
          setToast({ kind: "error", message: msg });
          return;
        }
        await refresh();
        if (successMessage?.trim()) setToast({ kind: "success", message: successMessage.trim() });
      } catch {
        const msg = "Không kết nối được tới hệ thống giỏ hàng.";
        setError(msg);
        setToast({ kind: "error", message: msg });
      } finally {
        setBusyKey(null);
      }
    },
    [refresh],
  );

  const clearCart = useCallback(() =>
    mutate("CLEAR", () => fetch("/api/cart/clear", { method: "DELETE", cache: "no-store" }), "Đã xóa toàn bộ giỏ hàng."),
    [mutate],
  );

  const updateQty = useCallback((it: CartItem, qty: number, key: string) => {
    const pid = Number(it.productId ?? 0);
    if (!Number.isFinite(pid) || pid <= 0) return;
    const vid = it.variantId != null ? `&variantId=${encodeURIComponent(String(it.variantId))}` : "";
    const qs = `productId=${encodeURIComponent(String(pid))}&quantity=${encodeURIComponent(String(qty))}${vid}`;
    return mutate(key, () => fetch(`/api/cart?${qs}`, { method: "PUT", cache: "no-store" }), "Đã cập nhật số lượng.");
  }, [mutate]);

  const removeItem = useCallback((it: CartItem, key: string) => {
    const pid = Number(it.productId ?? 0);
    if (!Number.isFinite(pid) || pid <= 0) return;
    const vid = it.variantId != null ? `&variantId=${encodeURIComponent(String(it.variantId))}` : "";
    const qs = `productId=${encodeURIComponent(String(pid))}${vid}`;
    return mutate(key, () => fetch(`/api/cart?${qs}`, { method: "DELETE", cache: "no-store" }), "Đã xóa sản phẩm khỏi giỏ hàng.");
  }, [mutate]);

  const summaryTotal = asMoneyVnd(cart?.total);
  const selectedItemsCount = useMemo(
    () => items.reduce((acc, it, idx) => acc + (selectedKeys[lineKey(it, idx)] && !isUnavailableItem(it) ? safeQty(it) : 0), 0),
    [items, selectedKeys],
  );
  
  const { selectedTotal, savingsTotal } = useMemo(() => {
    let subT = 0;
    let savedT = 0;
    items.forEach((it, idx) => {
      if (!selectedKeys[lineKey(it, idx)] || isUnavailableItem(it)) return;
      
      const q = safeQty(it);
      const sub = Number(it.subTotal ?? 0);
      const origPrice = Number(it.originalPrice ?? it.product?.price ?? 0);
      const effPrice = it.product?.effectivePrice != null ? Number(it.product.effectivePrice) : origPrice;
      
      subT += Number.isFinite(sub) ? sub : 0;
      
      if (origPrice > effPrice && Number.isFinite(origPrice) && Number.isFinite(effPrice)) {
        savedT += (origPrice - effPrice) * q;
      }
    });
    return { selectedTotal: subT, savingsTotal: savedT };
  }, [items, selectedKeys]);

  const allAvailableItems = items.filter((it) => !isUnavailableItem(it));
  const allSelected = allAvailableItems.length > 0 && allAvailableItems.every((it, idx) => {
    const realIdx = items.indexOf(it);
    return selectedKeys[lineKey(it, realIdx)];
  });

  const toggleSelectAll = () => {
    const next: Record<string, boolean> = {};
    if (!allSelected) {
      items.forEach((it, idx) => {
        if (!isUnavailableItem(it)) next[lineKey(it, idx)] = true;
      });
    }
    setSelectedKeys(next);
  };

  const canProceedCheckout = !loading && items.length > 0 && busyKey == null && selectedItemsCount > 0;

  const proceedToCheckout = useCallback(() => {
    const picked = items
      .filter((it, idx) => selectedKeys[lineKey(it, idx)] && !isUnavailableItem(it))
      .map((it) => ({
        productId: Number(it.productId ?? 0),
        variantId: it.variantId != null ? Number(it.variantId) : null,
        quantity: safeQty(it),
        subTotal: Number(it.subTotal ?? 0),
        variantLabel: it.variantLabel ?? null,
        product: {
          id: it.product?.id ?? null,
          sku: it.product?.sku ?? null,
          productName: it.product?.productName ?? null,
          primaryImageUrl: lineImageRaw(it) ?? it.product?.primaryImageUrl ?? null,
          effectivePrice: it.product?.effectivePrice ?? null,
        },
      }));
    window.sessionStorage.setItem("checkout:selectedItems", JSON.stringify(picked));
    window.sessionStorage.setItem("checkout:flow", "cart");
    router.push("/checkout");
  }, [items, selectedKeys]);

  return (
    <>
      {/* Toast notification */}
      {toast ? (
        <div className="pointer-events-none fixed right-5 top-5 z-[60] w-[min(400px,calc(100vw-2.5rem))]">
          <div
            className={[
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-5",
              toast.kind === "success"
                ? "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-200"
                : "border-red-500/30 bg-red-50/90 dark:bg-red-950/90 text-red-700 dark:text-red-200",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <span className={`material-symbols-outlined text-xl ${toast.kind === "success" ? "text-emerald-500" : "text-red-500"}`}>
              {toast.kind === "success" ? "check_circle" : "error"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-widest opacity-60">{toast.kind === "success" ? "Thành công" : "Lỗi"}</p>
              <p className="mt-0.5 break-words text-sm font-semibold">{toast.message}</p>
            </div>
            <button type="button" onClick={() => setToast(null)} className="rounded-xl p-1.5 text-current opacity-40 transition hover:bg-black/5 dark:hover:bg-white/10 hover:opacity-80">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans">
        {/* Minimalist Page Header */}
        <div className="relative border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a] px-6 py-20">
          <div className="mx-auto max-w-screen-xl flex flex-col items-center text-center">
            <h1 className="font-headline text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl text-black dark:text-white">
              Giỏ hàng
            </h1>
            <p className="mt-6 text-sm sm:text-base font-normal text-slate-500 dark:text-slate-400 max-w-md uppercase tracking-[0.2em]">
              {loading ? "Đang tải..." : items.length === 0 ? "Chưa có sản phẩm" : `${totalItems} sản phẩm`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-screen-xl px-4 py-16 lg:flex lg:gap-16 lg:items-start sm:px-6">
          {/* Left — Cart Items */}
          <section className="flex-grow min-w-0">
            {error && (
              <div className="mb-10 flex items-center gap-3 rounded-none border-l-2 border-red-500 bg-red-50 dark:bg-red-900/10 px-6 py-4 text-sm font-medium text-red-800 dark:text-red-300">
                <span className="material-symbols-outlined text-red-500">error</span>
                {error}
              </div>
            )}

            {/* Select All header */}
            {!loading && items.length > 0 && (
              <div className="mb-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                <label className="group flex items-center gap-4 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="peer h-5 w-5 appearance-none rounded-sm border border-black/20 dark:border-white/20 transition-all checked:border-black dark:checked:border-white checked:bg-black dark:checked:bg-white hover:border-black/50 dark:hover:border-white/50 cursor-pointer"
                    />
                    <span className="material-symbols-outlined absolute text-white dark:text-black opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" style={{ fontSize: '14px' }}>
                      check
                    </span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors">Chọn tất cả</span>
                </label>
                <button
                  type="button"
                  onClick={() => void clearCart()}
                  disabled={loading || items.length === 0 || busyKey != null}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition hover:text-black dark:hover:text-white disabled:opacity-30"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-8">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-8 border-b border-black/5 dark:border-white/5 pb-8">
                    <div className="h-32 w-24 bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0 rounded-sm" />
                    <div className="flex-1 space-y-4 w-full">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      <div className="h-8 w-3/4 bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <h2 className="font-headline text-2xl font-light text-black dark:text-white tracking-wide">Giỏ hàng của bạn đang trống</h2>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-sm">Tiếp tục mua sắm để khám phá những bộ sưu tập mới nhất.</p>
                <Link
                  href="/products"
                  className="mt-10 inline-flex items-center justify-center bg-black dark:bg-white px-10 py-4 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-transform hover:scale-105 active:scale-95"
                >
                  Khám phá ngay
                </Link>
              </div>
            )}

            {/* Cart Items list */}
            {!loading && items.length > 0 && (
              <div className="space-y-0">
                {items.map((it, idx) => {
                  const key = lineKey(it, idx);
                  const unavailable = isUnavailableItem(it);
                  const q = safeQty(it);
                  const disabled = busyKey === key || busyKey === "CLEAR";
                  const stockRaw = Number(it.product?.availability ?? NaN);
                  const stock = Number.isFinite(stockRaw) ? Math.max(0, Math.floor(stockRaw)) : null;
                  const atStockLimit = it.variantId == null && stock != null ? q >= stock : false;
                  const checked = Boolean(selectedKeys[key]);
                  const thumbUrl = resolveCartImage(lineImageRaw(it));
                  
                  const originalPrice = Number(it.originalPrice ?? it.product?.price ?? 0);
                  const effectivePrice = it.product?.effectivePrice != null ? Number(it.product.effectivePrice) : originalPrice;
                  const isSale = originalPrice > effectivePrice && effectivePrice > 0;

                  return (
                    <div
                      key={`cart-row-${idx}-${rowKey(it)}`}
                      className={[
                        "group relative flex flex-col sm:flex-row gap-6 sm:gap-10 border-b border-black/5 dark:border-white/5 py-8 transition-all duration-500",
                        unavailable ? "opacity-40 grayscale" : "",
                      ].join(" ")}
                    >
                      {/* Left: Checkbox & Image */}
                      <div className="flex items-center gap-6 sm:items-start">
                        <div className="flex-shrink-0 sm:mt-12">
                          {unavailable ? (
                            <div className="flex h-5 w-5 items-center justify-center">
                              <span className="material-symbols-outlined text-[14px] text-red-500">block</span>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setSelectedKeys((prev) => ({ ...prev, [key]: e.target.checked }))}
                                className="peer h-5 w-5 appearance-none rounded-sm border border-black/20 dark:border-white/20 transition-all checked:border-black dark:checked:border-white checked:bg-black dark:checked:bg-white hover:border-black/50 dark:hover:border-white/50 cursor-pointer"
                                aria-label={`Chọn ${itemTitle(it)}`}
                              />
                              <span className="material-symbols-outlined absolute text-white dark:text-black opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" style={{ fontSize: '14px' }}>
                                check
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-900 sm:h-40 sm:w-32">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={itemTitle(it)}
                              className="h-full w-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-slate-200 dark:text-slate-700">image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Info, Price, Actions */}
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        {/* Info & Delete */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 pt-2">
                            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{itemSubtitle(it)}</p>
                            <Link href={it.productId ? `/products/${it.productId}` : "#"} className="block truncate font-headline text-lg font-light text-black dark:text-white transition-colors hover:opacity-70 sm:text-2xl">
                              {itemTitle(it)}
                            </Link>
                            
                            {/* Stock warning */}
                            {unavailable ? (
                              <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-widest">Hết hàng</p>
                            ) : it.variantId == null && stock != null ? (
                              <p className={`mt-3 text-xs font-medium uppercase tracking-widest ${stock <= 5 ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"}`}>
                                {stock <= 5 ? `Chỉ còn ${stock}` : `Còn hàng`}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => void removeItem(it, key)}
                            className="flex-shrink-0 text-slate-300 dark:text-slate-600 transition hover:text-black dark:hover:text-white disabled:opacity-40 p-2"
                            aria-label="Xóa sản phẩm"
                          >
                            <span className="material-symbols-outlined text-[20px] font-light">close</span>
                          </button>
                        </div>

                        {/* Price & Quantity Row */}
                        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                          <div className="flex-shrink-0">
                            {isSale && (
                              <p className="text-[11px] font-medium text-slate-400 line-through mb-1">
                                {asMoneyVnd(originalPrice)}
                              </p>
                            )}
                            <p className="font-headline text-lg font-normal text-black dark:text-white sm:text-xl">
                              {asMoneyVnd(effectivePrice)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-4 border-b border-black/20 dark:border-white/20 pb-1">
                              <button
                                type="button"
                                disabled={disabled || unavailable || q <= 1}
                                onClick={() => void updateQty(it, q - 1, key)}
                                className="text-slate-400 transition-colors hover:text-black dark:hover:text-white disabled:opacity-30"
                                aria-label="Giảm"
                              >
                                <span className="material-symbols-outlined text-[16px]">remove</span>
                              </button>
                              <span className="w-6 text-center text-sm font-normal text-black dark:text-white select-none">{q}</span>
                              <button
                                type="button"
                                disabled={disabled || unavailable || atStockLimit}
                                onClick={() => void updateQty(it, q + 1, key)}
                                className="text-slate-400 transition-colors hover:text-black dark:hover:text-white disabled:opacity-30"
                                aria-label="Tăng"
                              >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                              </button>
                            </div>
                            <div className="text-right text-xs font-normal text-slate-500 uppercase tracking-widest">
                              Tổng: <span className="text-black dark:text-white font-medium">{asMoneyVnd(it.subTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Busy spinner overlay */}
                      {disabled && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-[#050505]/50 backdrop-blur-sm">
                          <div className="h-4 w-4 animate-spin rounded-full border border-black dark:border-white border-t-transparent" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Continue shopping link */}
            {!loading && items.length > 0 && (
              <div className="mt-12">
                <Link href="/products" className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-black dark:text-white transition hover:opacity-70 w-max">
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}
          </section>

          {/* Right — Order Summary */}
          <aside className="mt-16 w-full flex-shrink-0 lg:mt-0 lg:w-[380px]">
            <div className="sticky top-24 bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 p-8">
              <h2 className="font-headline text-lg font-light text-black dark:text-white uppercase tracking-[0.15em] mb-8">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-6 text-sm font-light">
                <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Tổng sản phẩm</span>
                  <span className="text-black dark:text-white font-medium">{totalItems.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Đã chọn</span>
                  <span className="text-black dark:text-white font-medium">{selectedItemsCount.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Vận chuyển</span>
                  <span className="text-black dark:text-white font-medium">Miễn phí</span>
                </div>
                {savingsTotal > 0 && (
                  <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
                    <span className="text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">Tiết kiệm</span>
                    <span className="text-black dark:text-white font-medium">-{asMoneyVnd(savingsTotal)}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-black dark:border-white">
                <div className="flex items-end justify-between mb-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tạm tính</p>
                  <p className="font-headline text-3xl font-light text-black dark:text-white">{asMoneyVnd(selectedTotal)}</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    disabled={!canProceedCheckout}
                    onClick={proceedToCheckout}
                    className="w-full bg-black dark:bg-white px-6 py-5 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-transform hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
                  >
                    Thanh toán
                  </button>
                  
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void clearCart()}
                      disabled={loading || busyKey != null}
                      className="w-full px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors hover:text-black dark:hover:text-white disabled:opacity-30"
                    >
                      Xóa giỏ hàng
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
