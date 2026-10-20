"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseLabelToTiers } from "@/lib/variant-tier-utils";

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

const FREE_SHIPPING_THRESHOLD = 500000;

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
  if (!Number.isFinite(n)) return "0₫";
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
  return "";
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

  const selectedItemsCount = useMemo(
    () => items.reduce((acc, it, idx) => acc + (selectedKeys[lineKey(it, idx)] && !isUnavailableItem(it) ? safeQty(it) : 0), 0),
    [items, selectedKeys],
  );
  
  const { selectedTotal, originalSubTotal, savingsTotal } = useMemo(() => {
    let subT = 0;
    let origT = 0;
    let savedT = 0;
    items.forEach((it, idx) => {
      if (!selectedKeys[lineKey(it, idx)] || isUnavailableItem(it)) return;
      
      const q = safeQty(it);
      const sub = Number(it.subTotal ?? 0);
      const origPrice = Number(it.originalPrice ?? it.product?.price ?? 0);
      const effPrice = it.product?.effectivePrice != null ? Number(it.product.effectivePrice) : origPrice;
      
      subT += Number.isFinite(sub) && sub > 0 ? sub : (effPrice * q);
      origT += origPrice * q;
      
      if (origPrice > effPrice && Number.isFinite(origPrice) && Number.isFinite(effPrice)) {
        savedT += (origPrice - effPrice) * q;
      }
    });
    return { selectedTotal: subT, originalSubTotal: origT, savingsTotal: savedT };
  }, [items, selectedKeys]);

  const allAvailableItems = items.filter((it) => !isUnavailableItem(it));
  const allSelected = allAvailableItems.length > 0 && allAvailableItems.every((it) => {
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

  const freeShippingProgress = Math.min(100, Math.round((selectedTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - selectedTotal);

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
  }, [items, selectedKeys, router]);

  return (
    <>
      {/* Toast notification */}
      {toast ? (
        <div className="pointer-events-none fixed right-5 top-5 z-[60] w-[min(400px,calc(100vw-2.5rem))]">
          <div
            className={[
              "pointer-events-auto flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-top-5",
              toast.kind === "success"
                ? "border-emerald-500/30 bg-emerald-950/90 text-emerald-200"
                : "border-red-500/30 bg-red-950/90 text-red-200",
            ].join(" ")}
            role="status"
            aria-live="polite"
          >
            <span className={`material-symbols-outlined text-xl ${toast.kind === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {toast.kind === "success" ? "check_circle" : "error"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-widest opacity-60">{toast.kind === "success" ? "Thành công" : "Lỗi"}</p>
              <p className="mt-0.5 break-words text-sm font-semibold">{toast.message}</p>
            </div>
            <button type="button" onClick={() => setToast(null)} className="rounded-xl p-1.5 text-current opacity-40 transition hover:bg-white/10 hover:opacity-80">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative min-h-screen text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
        {/* Abstract background ambient glows */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-600/20 dark:via-purple-600/10 dark:to-transparent blur-[140px]" />

        {/* Flagship Page Header */}
        <div className="relative border-b border-slate-200/80 dark:border-white/[0.08] px-4 sm:px-6 lg:px-8 pt-8 pb-8 text-center">
          <div className="mx-auto max-w-screen-xl flex flex-col items-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300 backdrop-blur-xl">
              <span className="material-symbols-outlined text-sm">shopping_bag</span>
              Túi Mua Sắm Cao Cấp
            </span>
            <h1 className="font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {loading ? "Đang đồng bộ dữ liệu..." : items.length === 0 ? "Chưa có sản phẩm nào" : `${totalItems} sản phẩm trong giỏ hàng`}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8 lg:flex lg:gap-10 lg:items-start relative z-10">
          {/* Left — Cart Items Column */}
          <section className="flex-grow min-w-0">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 backdrop-blur-xl px-5 py-4 text-xs font-semibold text-rose-600 dark:text-rose-300 shadow-xl">
                <span className="material-symbols-outlined text-rose-500 dark:text-rose-400">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Free Shipping Progress Meter */}
            {!loading && items.length > 0 && selectedItemsCount > 0 && (
              <div className="mb-6 rounded-[2rem] border border-indigo-500/25 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-indigo-950/50 p-5 backdrop-blur-2xl shadow-sm dark:shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold gap-2 mb-2.5">
                  {selectedTotal >= FREE_SHIPPING_THRESHOLD ? (
                    <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Chúc mừng! Đơn hàng của bạn đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400">local_shipping</span>
                      Mua thêm <span className="text-indigo-600 dark:text-cyan-400 font-black">{asMoneyVnd(remainingForFreeShipping)}</span> để nhận <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase">Freeship</span>!
                    </span>
                  )}
                  <span className="text-indigo-600 dark:text-indigo-300 font-mono text-xs font-bold">{freeShippingProgress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-700 rounded-full shadow-sm" 
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Select All Bar */}
            {!loading && items.length > 0 && (
              <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0c1017]/80 p-4 backdrop-blur-xl shadow-sm">
                <label className="group flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="peer h-5 w-5 appearance-none rounded-lg border-2 border-slate-300 dark:border-white/20 transition-all checked:border-indigo-500 checked:bg-indigo-600 hover:border-indigo-400 cursor-pointer shadow-sm"
                    />
                    <span className="material-symbols-outlined absolute text-white font-black opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none text-sm">
                      check
                    </span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Chọn tất cả ({allAvailableItems.length} sản phẩm khả dụng)
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => void clearCart()}
                  disabled={loading || items.length === 0 || busyKey != null}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors disabled:opacity-30 px-3 py-1.5 rounded-xl hover:bg-rose-500/10"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  <span>Xóa tất cả</span>
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 rounded-3xl bg-[#0c1017]/70 backdrop-blur-xl p-6 border border-white/[0.06] animate-pulse">
                    <div className="h-24 w-24 bg-white/5 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-48 bg-white/5 rounded-full" />
                      <div className="h-4 w-32 bg-white/5 rounded-full" />
                      <div className="h-6 w-24 bg-white/5 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-[2.5rem] bg-white/90 dark:bg-[#0c1017]/60 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm dark:shadow-2xl">
                <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 shadow-inner">
                  <span className="material-symbols-outlined text-5xl">remove_shopping_cart</span>
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Giỏ hàng của bạn đang trống</h2>
                <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 max-w-md">
                  Chưa có sản phẩm nào được chọn. Hãy khám phá hàng trăm sản phẩm công nghệ hot với giá ưu đãi ngay!
                </p>
                <Link
                  href="/products"
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105"
                >
                  Khám phá mua sắm ngay
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}

            {/* Cart Items List */}
            {!loading && items.length > 0 && (
              <div className="space-y-4">
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
                  const discountPercent = isSale ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : 0;
                  const lineSubtotal = Number(it.subTotal ?? (effectivePrice * q));

                  // Multi-tier attributes breakdown
                  const tiers = parseLabelToTiers(it.variantLabel);

                  return (
                    <div
                      key={`cart-row-${idx}-${rowKey(it)}`}
                      className={[
                        "group relative flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-[2rem] p-4 sm:p-6 transition-all duration-300 border backdrop-blur-2xl",
                        unavailable 
                          ? "bg-slate-100/50 dark:bg-white/[0.01] border-slate-200 dark:border-white/5 opacity-50 grayscale" 
                          : checked
                            ? "bg-white dark:bg-[#0c1017]/90 border-indigo-500/50 dark:border-indigo-500/40 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500/20"
                            : "bg-white/80 dark:bg-[#0c1017]/70 border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:border-indigo-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-[#0c1017]/85 hover:shadow-md",
                      ].join(" ")}
                    >
                      {/* Left: Checkbox & Product Image */}
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {unavailable ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                              <span className="material-symbols-outlined text-sm">block</span>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => setSelectedKeys((prev) => ({ ...prev, [key]: e.target.checked }))}
                                className="peer h-5 w-5 appearance-none rounded-lg border-2 border-slate-300 dark:border-white/20 transition-all checked:border-indigo-500 checked:bg-indigo-600 hover:border-indigo-400 cursor-pointer shadow-sm"
                                aria-label={`Chọn ${itemTitle(it)}`}
                              />
                              <span className="material-symbols-outlined absolute text-white font-black opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none text-sm">
                                check
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        <Link 
                          href={it.productId ? `/product/${it.productId}` : "#"}
                          className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:border-indigo-500/30 transition-all"
                        >
                          {thumbUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={thumbUrl}
                              alt={itemTitle(it)}
                              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-600">image</span>
                            </div>
                          )}
                        </Link>
                      </div>

                      {/* Middle: Info, Multi-tier Badges, Stock Warning */}
                      <div className="flex flex-1 flex-col justify-between min-w-0 py-0.5">
                        <div className="space-y-1.5">
                          {/* Title */}
                          <div className="flex items-start justify-between gap-3">
                            <Link 
                              href={it.productId ? `/product/${it.productId}` : "#"} 
                              className="font-headline text-sm sm:text-base font-bold text-slate-900 dark:text-white transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 line-clamp-1"
                            >
                              {itemTitle(it)}
                            </Link>

                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => void removeItem(it, key)}
                              className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all disabled:opacity-40"
                              title="Xóa sản phẩm"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>

                          {/* Multi-tier variant chips */}
                          {tiers.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {tiers.map((t, tidx) => (
                                <span
                                  key={tidx}
                                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/25 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300"
                                >
                                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t.name}:</span>
                                  <span>{t.value}</span>
                                </span>
                              ))}
                            </div>
                          ) : itemSubtitle(it) ? (
                            <span className="inline-block rounded-lg bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200/80 dark:border-indigo-500/25 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              {itemSubtitle(it)}
                            </span>
                          ) : null}

                          {/* Stock status indicator */}
                          {unavailable ? (
                            <p className="flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                              <span className="material-symbols-outlined text-xs">error</span>
                              Sản phẩm hiện không khả dụng
                            </p>
                          ) : it.variantId == null && stock != null ? (
                            <p className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${stock <= 5 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                              <span className="material-symbols-outlined text-xs">{stock <= 5 ? "warning" : "check_circle"}</span>
                              {stock <= 5 ? `Chỉ còn ${stock} sản phẩm trong kho` : `Sẵn sàng giao`}
                            </p>
                          ) : null}
                        </div>

                        {/* Bottom Row: Prices & Quantity Stepper */}
                        <div className="mt-4 pt-3 flex flex-wrap items-end justify-between gap-3 border-t border-slate-100 dark:border-white/[0.06]">
                          {/* Price Display */}
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-headline text-lg sm:text-xl font-black text-indigo-600 dark:text-cyan-400">
                                {asMoneyVnd(effectivePrice)}
                              </span>
                              {isSale && (
                                <span className="rounded-md bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[10px] font-black text-rose-600 dark:text-rose-400">
                                  -{discountPercent}%
                                </span>
                              )}
                            </div>
                            {isSale && (
                              <p className="text-xs font-semibold text-slate-400 line-through">
                                {asMoneyVnd(originalPrice)}
                              </p>
                            )}
                          </div>

                          {/* Stepper and Subtotal */}
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tạm tính</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{asMoneyVnd(lineSubtotal)}</p>
                            </div>

                            <div className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 p-1 backdrop-blur-sm">
                              <button
                                type="button"
                                disabled={disabled || unavailable || q <= 1}
                                onClick={() => void updateQty(it, q - 1, key)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 shadow-sm"
                                title="Giảm số lượng"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">remove</span>
                              </button>
                              <span className="w-9 text-center text-xs font-black text-slate-900 dark:text-white select-none">{q}</span>
                              <button
                                type="button"
                                disabled={disabled || unavailable || atStockLimit}
                                onClick={() => void updateQty(it, q + 1, key)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-40 shadow-sm"
                                title="Tăng số lượng"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Busy spinner overlay */}
                      {disabled && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] bg-slate-950/60 backdrop-blur-sm">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 dark:border-cyan-400 border-t-transparent shadow-lg" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Continue shopping link */}
            {!loading && items.length > 0 && (
              <div className="mt-8 flex justify-center sm:justify-start">
                <Link 
                  href="/products" 
                  className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all backdrop-blur-xl shadow-sm"
                >
                  <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
                  Tiếp tục khám phá sản phẩm khác
                </Link>
              </div>
            )}
          </section>

          {/* Right — Sticky Order Summary Sidebar */}
          <aside className="mt-8 lg:mt-0 w-full flex-shrink-0 lg:w-[380px] xl:w-[420px]">
            <div className="sticky top-24 rounded-[2.5rem] border border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c1017]/85 p-6 sm:p-8 backdrop-blur-2xl shadow-xl dark:shadow-2xl relative overflow-hidden">
              {/* Decorative ambient aura */}
              <div className="pointer-events-none absolute -top-8 -right-8 h-36 w-36 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 blur-3xl rounded-full" />
              
              <h2 className="flex items-center gap-2.5 font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6 relative z-10">
                <span className="material-symbols-outlined text-indigo-600 dark:text-cyan-400">receipt_long</span>
                Tóm Tắt Đơn Hàng
              </h2>

              <div className="space-y-4 text-xs font-medium relative z-10">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="text-slate-500 dark:text-slate-400">Tổng sản phẩm</span>
                  <span className="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-xl">
                    {totalItems.toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="text-slate-500 dark:text-slate-400">Đã chọn thanh toán</span>
                  <span className="text-indigo-600 dark:text-cyan-400 font-bold bg-indigo-50 dark:bg-cyan-500/10 px-3 py-1 rounded-xl border border-indigo-200 dark:border-cyan-500/20">
                    {selectedItemsCount.toLocaleString("vi-VN")} sản phẩm
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                  <span className="text-slate-500 dark:text-slate-400">Phí vận chuyển</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="material-symbols-outlined text-sm">local_shipping</span>
                    {selectedTotal >= FREE_SHIPPING_THRESHOLD || selectedItemsCount === 0 ? "Miễn phí toàn quốc" : "30.000₫ (Tiêu chuẩn)"}
                  </span>
                </div>
                {savingsTotal > 0 && (
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-slate-400">Tiết kiệm được</span>
                    <span className="text-rose-600 dark:text-rose-400 font-black px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                      -{asMoneyVnd(savingsTotal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total & Checkout button */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.08] relative z-10">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Tổng tiền thanh toán ({selectedItemsCount} SP)
                    </p>
                    <p className="mt-1 font-headline text-2xl sm:text-3xl font-black bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-white dark:via-slate-100 dark:to-cyan-300 bg-clip-text text-transparent">
                      {asMoneyVnd(selectedTotal)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    disabled={!canProceedCheckout}
                    onClick={proceedToCheckout}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                    <span className="relative flex items-center justify-center gap-2">
                      Tiến hành đặt hàng ngay
                      <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </span>
                  </button>
                  
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void clearCart()}
                      disabled={loading || busyKey != null}
                      className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 disabled:opacity-40"
                    >
                      Xóa tất cả sản phẩm
                    </button>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-1">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-lg">verified_user</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Chính hãng 100%</p>
                  </div>
                  <div className="space-y-1">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg">local_shipping</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Giao 2-3 ngày</p>
                  </div>
                  <div className="space-y-1">
                    <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-lg">published_with_changes</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Đổi trả 7 ngày</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
