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

      <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#fdfdff] to-[#f0f4ff] dark:from-[#050510] dark:via-[#0a0a1a] dark:to-[#050510] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-sans relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl pointer-events-none" />

        {/* Premium Page Header */}
        <div className="relative border-b border-white/20 dark:border-white/5 bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 shadow-2xl shadow-indigo-900/20 px-6 py-20">
          <div className="mx-auto max-w-screen-xl flex flex-col items-center text-center">
            <h1 className="font-headline text-4xl font-black tracking-tight text-white sm:text-5xl">
              Giỏ Hàng
            </h1>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-bold text-indigo-200/60 dark:text-indigo-200/60 max-w-md uppercase tracking-[0.2em]">
              {loading ? "Đang đồng bộ..." : items.length === 0 ? "Chưa có sản phẩm" : `${totalItems} sản phẩm đã chọn`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-screen-xl px-4 py-16 lg:flex lg:gap-16 lg:items-start sm:px-6 relative z-10">
          {/* Left — Cart Items */}
          <section className="flex-grow min-w-0">
            {error && (
              <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-md px-5 py-4 sm:px-6 text-sm font-medium text-red-800 dark:text-red-300 shadow-xl shadow-red-500/5">
                <span className="material-symbols-outlined text-red-500">error</span>
                {error}
              </div>
            )}

            {/* Select All header */}
            {!loading && items.length > 0 && (
              <div className="mb-6 flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <label className="group flex items-center gap-3 sm:gap-4 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="peer h-5 w-5 sm:h-6 sm:w-6 appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 transition-all checked:border-indigo-500 dark:checked:border-indigo-400 checked:bg-indigo-500 dark:checked:bg-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-300 cursor-pointer shadow-sm"
                    />
                    <span className="material-symbols-outlined absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" style={{ fontSize: '14px' }}>
                      check
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Chọn tất cả</span>
                </label>
                <button
                  type="button"
                  onClick={() => void clearCart()}
                  disabled={loading || items.length === 0 || busyKey != null}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4 sm:space-y-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-row items-center gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 sm:p-6 border border-white/50 dark:border-slate-800/50 shadow-xl shadow-indigo-900/5">
                    <div className="h-20 w-20 sm:h-32 sm:w-32 bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0 rounded-xl sm:rounded-2xl" />
                    <div className="flex-1 space-y-4 w-full">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                      <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-32 px-4 text-center rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-900/5">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl sm:text-5xl text-indigo-300 dark:text-indigo-500/50">shopping_cart</span>
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Chưa có sản phẩm nào</h2>
                <p className="mt-4 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">Hàng ngàn sản phẩm công nghệ đang chờ bạn khám phá. Hãy lấp đầy giỏ hàng nhé!</p>
                <Link
                  href="/products"
                  className="mt-8 sm:mt-10 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-bold tracking-wider text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/30 rounded-xl sm:rounded-2xl"
                >
                  Khám phá ngay
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}

            {/* Cart Items list */}
            {!loading && items.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
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
                        "group relative flex flex-row gap-3 sm:gap-6 rounded-2xl sm:rounded-3xl p-3 sm:p-6 transition-all duration-300 items-stretch",
                        unavailable ? "bg-slate-50/50 dark:bg-slate-900/30 opacity-60 grayscale" : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-indigo-900/5 hover:shadow-xl hover:shadow-indigo-500/10",
                      ].join(" ")}
                    >
                      {/* Checkbox (Center on mobile, top on desktop) */}
                      <div className="flex items-center sm:items-start pt-0 sm:pt-4">
                        <div className="flex-shrink-0 sm:mt-12">
                          {unavailable ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                              <span className="material-symbols-outlined text-[14px] text-red-500">block</span>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setSelectedKeys((prev) => ({ ...prev, [key]: e.target.checked }))}
                                className="peer h-5 w-5 sm:h-6 sm:w-6 appearance-none rounded-md border-2 border-slate-300 dark:border-slate-600 transition-all checked:border-indigo-500 dark:checked:border-indigo-400 checked:bg-indigo-500 dark:checked:bg-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-300 cursor-pointer shadow-sm"
                                aria-label={`Chọn ${itemTitle(it)}`}
                              />
                              <span className="material-symbols-outlined absolute text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" style={{ fontSize: '14px' }}>
                                check
                              </span>
                            </div>
                          )}
                        </div>

                      {/* Image */}
                      <div className="relative h-20 w-20 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                        {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={itemTitle(it)}
                              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700">image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info & Price & Actions */}
                      <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5 sm:py-1">
                        {/* Info & Delete */}
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="min-w-0">
                            {itemSubtitle(it) && (
                              <span className="inline-block mb-1 sm:mb-2 rounded-md bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-800/50">
                                {itemSubtitle(it)}
                              </span>
                            )}
                            <Link href={it.productId ? `/product/${it.productId}` : "#"} className="block truncate font-headline text-sm sm:text-lg lg:text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
                              {itemTitle(it)}
                            </Link>
                            
                            {/* Stock warning */}
                            {unavailable ? (
                              <p className="mt-3 flex items-center gap-1 text-xs font-bold text-red-500 uppercase tracking-widest"><span className="material-symbols-outlined text-[14px]">error</span>Hết hàng</p>
                            ) : it.variantId == null && stock != null ? (
                              <p className={`mt-3 flex items-center gap-1 text-xs font-bold uppercase tracking-widest ${stock <= 5 ? "text-amber-500" : "text-emerald-500"}`}>
                                <span className="material-symbols-outlined text-[14px]">{stock <= 5 ? "warning" : "check_circle"}</span>
                                {stock <= 5 ? `Chỉ còn ${stock}` : `Còn hàng`}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => void removeItem(it, key)}
                            className="flex-shrink-0 flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-full text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all disabled:opacity-40"
                            aria-label="Xóa sản phẩm"
                          >
                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">delete</span>
                          </button>
                        </div>

                        {/* Price & Quantity */}
                        <div className="mt-auto pt-2 sm:pt-4 flex items-end justify-between gap-2">
                          <div className="flex-shrink-0">
                            {isSale && (
                              <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 line-through mb-0.5">
                                {asMoneyVnd(originalPrice)}
                              </p>
                            )}
                            <p className="font-headline text-sm sm:text-lg lg:text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {asMoneyVnd(effectivePrice)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 sm:gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1">
                            <button
                              type="button"
                              disabled={disabled || unavailable || q <= 1}
                              onClick={() => void updateQty(it, q - 1, key)}
                              className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 shadow-sm border border-slate-200/50 dark:border-slate-600"
                            >
                              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">remove</span>
                            </button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 select-none">{q}</span>
                            <button
                              type="button"
                              disabled={disabled || unavailable || atStockLimit}
                              onClick={() => void updateQty(it, q + 1, key)}
                              className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-50 shadow-sm border border-slate-200/50 dark:border-slate-600"
                            >
                              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">add</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Busy spinner overlay */}
                      {disabled && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px]">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent shadow-lg" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Continue shopping link */}
            {!loading && items.length > 0 && (
              <div className="mt-8 sm:mt-12 flex justify-center sm:justify-start">
                <Link href="/products" className="group flex items-center gap-3 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 dark:hover:border-indigo-800">
                  <span className="material-symbols-outlined text-[16px] sm:text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                  Tiếp tục mua sắm
                </Link>
              </div>
            )}
          </section>

          {/* Right — Order Summary */}
          <aside className="mt-8 lg:mt-0 w-full flex-shrink-0 lg:w-[380px] xl:w-[420px]">
            <div className="sticky top-24 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/60 dark:border-slate-800/60 p-6 sm:p-8 shadow-2xl shadow-indigo-900/10">
              {/* Decorative element */}
              <div className="absolute -top-4 -right-4 h-24 w-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl rounded-full pointer-events-none" />
              
              <h2 className="flex items-center gap-3 font-headline text-lg sm:text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider mb-6 sm:mb-8 relative z-10">
                <span className="material-symbols-outlined text-indigo-500">receipt_long</span>
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-5 text-sm font-medium relative z-10">
                <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Tổng sản phẩm</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{totalItems.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Đã chọn</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">{selectedItemsCount.toLocaleString("vi-VN")}</span>
                </div>
                <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500 dark:text-slate-400">Phí vận chuyển</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                    Miễn phí
                  </span>
                </div>
                {savingsTotal > 0 && (
                  <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-slate-500 dark:text-slate-400">Tiết kiệm được</span>
                    <span className="text-rose-500 font-black px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20">-{asMoneyVnd(savingsTotal)}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t-2 border-indigo-500/20 relative z-10">
                <div className="flex items-end justify-between mb-6 sm:mb-8">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tạm tính</p>
                  <p className="font-headline text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{asMoneyVnd(selectedTotal)}</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    disabled={!canProceedCheckout}
                    onClick={proceedToCheckout}
                    className="group relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 sm:py-5 text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                    <span className="relative flex items-center justify-center gap-2">
                      Thanh toán ngay
                      <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
                    </span>
                  </button>
                  
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void clearCart()}
                      disabled={loading || busyKey != null}
                      className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 disabled:opacity-40"
                    >
                      Xóa toàn bộ giỏ hàng
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
