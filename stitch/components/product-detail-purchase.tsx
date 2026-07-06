"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminProductVariant } from "@/lib/api";
import type { SaleProgram } from "@/lib/sale-api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  productId: string;
  productName: string;
  basePrice: number;
  effectivePrice?: number | null;
  saleType?: "PERCENT" | "AMOUNT" | null;
  saleValue?: number | null;
  activeSalePrograms?: SaleProgram[];
  baseStock: number;
  baseImage: string;
  variants: AdminProductVariant[];
  isLoggedIn: boolean;
  onVariantImageChange?: (image: string | null) => void;
};

function asCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function normalizeOption(v: string): string {
  return v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseVariantPrice(raw: number | string | null | undefined, fallback: number): { value: number; valid: boolean } {
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return { value: raw, valid: true };
  if (typeof raw === "string") {
    const clean = raw.replace(/[^\d]/g, "");
    const parsed = Number(clean);
    if (Number.isFinite(parsed) && parsed >= 0) return { value: parsed, valid: true };
  }
  return { value: fallback, valid: false };
}

function resolvePreviewImage(raw: string | null | undefined, fallback: string): string {
  const v = String(raw ?? "").trim();
  if (!v) return fallback;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const publicApiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  const inferredOrigin = /^https?:\/\//i.test(publicApiBase)
    ? publicApiBase.replace(/\/+$/, "").replace(/\/api\/?$/i, "") : "";
  const origin = (inferredOrigin || "http://localhost:8900").replace(/\/+$/, "");
  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/api/catalog/admin/products/images/file/${v}`;
}

export function ProductDetailPurchase({
  productId, productName, basePrice, effectivePrice, saleType, saleValue, activeSalePrograms, baseStock, baseImage, variants, isLoggedIn, onVariantImageChange,
}: Props) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const lastEmittedVariantImageRef = useRef<string | null>(null);
  const lastEmittedVariantIdRef = useRef<number | null>(null);
  const hasUserPickedVariantRef = useRef(false);

  const sizeOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of variants) {
      const raw = (v.size ?? "").trim();
      if (!raw) continue;
      const key = normalizeOption(raw);
      if (!m.has(key)) m.set(key, raw);
    }
    return Array.from(m.values());
  }, [variants]);

  const colorOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of variants) {
      const raw = (v.color ?? "").trim();
      if (!raw) continue;
      const key = normalizeOption(raw);
      if (!m.has(key)) m.set(key, raw);
    }
    return Array.from(m.values());
  }, [variants]);

  const variantLookup = useMemo(() => {
    const m = new Map<string, AdminProductVariant>();
    for (const v of variants) {
      const colorKey = normalizeOption(v.color ?? "");
      const sizeKey = normalizeOption(v.size ?? "");
      const key = `${colorKey}||${sizeKey}`;
      if (!m.has(key)) m.set(key, v);
    }
    return m;
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    const requireSize = sizeOptions.length > 0;
    const requireColor = colorOptions.length > 0;
    if ((requireSize && !selectedSize) || (requireColor && !selectedColor)) return null;
    const colorKey = requireColor ? normalizeOption(selectedColor) : "";
    const sizeKey = requireSize ? normalizeOption(selectedSize) : "";
    const key = `${colorKey}||${sizeKey}`;
    return variantLookup.get(key) ?? null;
  }, [colorOptions.length, selectedColor, selectedSize, sizeOptions.length, variants, variantLookup]);

  const canPickSize = useMemo(() => (size: string) =>
    variants.some((v) => {
      const vs = normalizeOption(v.size ?? "");
      const vc = normalizeOption(v.color ?? "");
      if (vs !== normalizeOption(size)) return false;
      if (selectedColor && vc !== normalizeOption(selectedColor)) return false;
      return Number(v.availability ?? 0) > 0;
    }), [selectedColor, variants]);

  const canPickColor = useMemo(() => (color: string) =>
    variants.some((v) => {
      const vs = normalizeOption(v.size ?? "");
      const vc = normalizeOption(v.color ?? "");
      if (vc !== normalizeOption(color)) return false;
      if (selectedSize && vs !== normalizeOption(selectedSize)) return false;
      return Number(v.availability ?? 0) > 0;
    }), [selectedSize, variants]);

  const originalVariantPrice = parseVariantPrice(selectedVariant?.price, basePrice).value;
  
  // Calculate specific sale for the selected variant (or base product if no variant selected)
  let activeEffectivePrice = effectivePrice;
  let activeSaleType = saleType;
  let activeSaleValue = saleValue;

  if (activeSalePrograms && activeSalePrograms.length > 0) {
    let lowestSalePrice = Infinity;
    let foundProgram = false;
    const numProductId = Number(productId);
    
    activeSalePrograms.forEach(program => {
      // Find items in the program matching this product
      const matchingItems = program.items.filter(it => it.productId === numProductId && (it.promoQtyLimit == null || it.promoQtyLimit > 0));
      if (matchingItems.length === 0) return;

      // Check if it applies to the currently selected variant
      let appliesToCurrent = false;
      if (selectedVariant && selectedVariant.id != null) {
        // If variant is selected, does this program apply to IT specifically, or to the whole product?
        appliesToCurrent = matchingItems.some(it => it.variantId === Number(selectedVariant.id) || it.variantId == null);
      } else {
        // If no variant selected, does it apply to the whole product?
        appliesToCurrent = matchingItems.some(it => it.variantId == null);
      }

      if (appliesToCurrent) {
        foundProgram = true;
        let currentSalePrice = originalVariantPrice;
        if (program.discountType === "PERCENT") {
          currentSalePrice = originalVariantPrice - (originalVariantPrice * program.discountValue) / 100;
        } else if (program.discountType === "AMOUNT") {
          currentSalePrice = program.discountValue;
        }
        
        if (currentSalePrice < lowestSalePrice) {
          lowestSalePrice = currentSalePrice;
          activeEffectivePrice = currentSalePrice;
          activeSaleType = program.discountType;
          activeSaleValue = program.discountValue;
        }
      }
    });
    
    if (!foundProgram) {
      // No active program found for this variant, reset to null
      activeEffectivePrice = null;
      activeSaleType = null;
      activeSaleValue = null;
    }
  }

  // A sale exists if we found an active program, EVEN if it's technically higher than original
  const hasSale = activeEffectivePrice != null && activeSaleType != null;
  
  let currentPrice = originalVariantPrice;
  let displayOriginalPrice = null;
  let finalDiscountPct = 0;

  if (hasSale && activeSaleType === "AMOUNT" && activeSaleValue != null) {
    currentPrice = activeSaleValue; // Fixed price (Đồng giá)
    displayOriginalPrice = originalVariantPrice;
    
    if (activeSaleValue > originalVariantPrice) {
      // Fixed price is magically higher than the original price. Show it as a special fixed price anyway.
      // E.g., showing a 0% discount but still explicitly highlighting it's a fixed program.
      finalDiscountPct = 0;
    } else {
      finalDiscountPct = Math.round(((displayOriginalPrice - currentPrice) / displayOriginalPrice) * 100);
    }
  } else if (hasSale && activeSaleType === "PERCENT" && activeSaleValue != null) {
    currentPrice = Math.round(originalVariantPrice * (1 - activeSaleValue / 100)); // Percentage discount
    displayOriginalPrice = originalVariantPrice;
    finalDiscountPct = activeSaleValue;
  } else if (hasSale && activeEffectivePrice != null) {
    if (activeEffectivePrice < originalVariantPrice) {
      currentPrice = activeEffectivePrice; 
      displayOriginalPrice = originalVariantPrice;
      finalDiscountPct = Math.round(((originalVariantPrice - activeEffectivePrice) / originalVariantPrice) * 100);
    }
  }
  const currentStock = Number(selectedVariant?.availability ?? baseStock);
  const maxQty = Math.max(1, Number.isFinite(currentStock) ? currentStock : 1);
  const variantPreview = selectedVariant?.variantImageUrl
    ? resolvePreviewImage(selectedVariant.variantImageUrl, baseImage) : null;
  const canBuy = currentStock > 0 && !busy;
  const stockPct = Math.min(100, Math.max(0, (currentStock / Math.max(currentStock, 50)) * 100));

  function resolveVariantImageBySelection(nextColor: string, nextSize: string): { id: number | null; url: string | null } {
    if (!variants.length) return { id: null, url: null };
    const requireSize = sizeOptions.length > 0;
    const requireColor = colorOptions.length > 0;
    if ((requireSize && !nextSize) || (requireColor && !nextColor)) return { id: null, url: null };
    const key = `${requireColor ? normalizeOption(nextColor) : ""}||${requireSize ? normalizeOption(nextSize) : ""}`;
    const v = variantLookup.get(key) ?? null;
    const raw = v?.variantImageUrl ? resolvePreviewImage(v.variantImageUrl, baseImage) : null;
    return { id: v?.id ?? null, url: raw };
  }

  function emitVariantImage(nextVariantId: number | null, nextUrl: string | null) {
    if (lastEmittedVariantIdRef.current === nextVariantId && lastEmittedVariantImageRef.current === nextUrl) return;
    lastEmittedVariantIdRef.current = nextVariantId;
    lastEmittedVariantImageRef.current = nextUrl;
    onVariantImageChange?.(nextUrl);
  }

  useEffect(() => {
    if (!variants.length) return;
    const firstAvailable = variants.find((v) => Number(v.availability ?? 0) > 0) ?? variants[0];
    if (!firstAvailable) return;
    const initColor = (firstAvailable.color ?? "").trim();
    const initSize = (firstAvailable.size ?? "").trim();
    if (!selectedColor && initColor) setSelectedColor(initColor);
    if (!selectedSize && initSize) setSelectedSize(initSize);
  }, [selectedColor, selectedSize, variants]);

  useEffect(() => {
    if (!hasUserPickedVariantRef.current) return;
    const currentVariantId = selectedVariant?.id ?? null;
    if (lastEmittedVariantIdRef.current === currentVariantId && lastEmittedVariantImageRef.current === variantPreview) return;
    lastEmittedVariantIdRef.current = currentVariantId;
    lastEmittedVariantImageRef.current = variantPreview;
    onVariantImageChange?.(variantPreview);
  }, [onVariantImageChange, selectedVariant?.id, variantPreview]);

  function redirectToLogin() {
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    router.push(`/login?next=${next}`);
  }

  async function shouldRedirectLogin(res: Response): Promise<boolean> {
    if (res.status === 401 || res.status === 403) {
      toast.error("Phiên đăng nhập đã hết hạn. Đang chuyển tới trang đăng nhập...");
      window.setTimeout(() => redirectToLogin(), 500);
      return true;
    }
    const txt = await res.text().catch(() => "");
    const low = txt.toLowerCase();
    if (res.status === 409) { toast.error("Sản phẩm/biến thể đã hết hàng hoặc không đủ tồn kho."); return true; }
    if (low.includes("unauthorized") || low.includes("token không hợp lệ") || low.includes("bearer")) {
      toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ.");
      window.setTimeout(() => redirectToLogin(), 500);
      return true;
    }
    if (txt) { toast.error(`Lỗi: ${txt.slice(0, 140)}`); return true; }
    return false;
  }

  async function addToCart() {
    const pid = Number(productId);
    if (!Number.isFinite(pid) || pid <= 0 || quantity <= 0) return;
    if (!isLoggedIn) { redirectToLogin(); return; }
    setBusy(true);
    try {
      const qp = new URLSearchParams({ productId: String(pid), quantity: String(quantity) });
      if (selectedVariant?.id != null) qp.set("variantId", String(selectedVariant.id));
      const res = await fetch(`/api/cart?${qp.toString()}`, { method: "POST", cache: "no-store" });
      if (!res.ok) { if (await shouldRedirectLogin(res)) return; toast.error("Không thêm được vào giỏ hàng."); return; }
      toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!");
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch { toast.error("Không kết nối được hệ thống giỏ hàng."); }
    finally { setBusy(false); }
  }

  function proceedBuyNow() {
    const pid = Number(productId);
    if (!Number.isFinite(pid) || pid <= 0 || quantity <= 0) return;
    const requireSize = sizeOptions.length > 0;
    const requireColor = colorOptions.length > 0;
    if ((requireSize && !selectedSize) || (requireColor && !selectedColor)) { toast.error("Vui lòng chọn đầy đủ màu/kích cỡ trước khi mua ngay."); return; }
    if (variants.length && !selectedVariant) { toast.error("Không xác định được biến thể. Vui lòng chọn lại."); return; }
    if (!canBuy) { toast.error("Sản phẩm hiện đang hết hàng."); return; }
    const variantLabel = [selectedColor, selectedSize].map((x) => String(x ?? "").trim()).filter(Boolean).join(" • ") || null;
    const picked = [{
      productId: pid,
      variantId: selectedVariant?.id != null ? Number(selectedVariant.id) : null,
      quantity,
      subTotal: Math.max(0, Number(currentPrice) * Math.max(1, Math.floor(quantity))),
      variantLabel,
      product: {
        id: pid, sku: null, productName,
        primaryImageUrl: (selectedVariant?.variantImageUrl ? resolvePreviewImage(selectedVariant.variantImageUrl, baseImage) : baseImage) || null,
        effectivePrice: currentPrice ?? null,
      },
    }];
    window.sessionStorage.setItem("checkout:selectedItems", JSON.stringify(picked));
    window.sessionStorage.setItem("checkout:flow", "buy-now");
    if (!isLoggedIn) { router.push(`/login?next=${encodeURIComponent("/checkout")}`); return; }
    router.push("/checkout");
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900/60">
      {/* ── Price block ── */}
      <div className="px-6 py-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Giá bán</p>
            <div className="flex flex-col gap-1 mt-1">
              <p
                className="font-black tracking-tight leading-none inline-block text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 drop-shadow-sm"
              >
                {asCurrency(currentPrice)}
              </p>
              {displayOriginalPrice && (
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 line-through opacity-60">
                    {asCurrency(displayOriginalPrice)}
                  </p>
                  {finalDiscountPct > 0 && (
                    <span className="rounded bg-rose-500/10 dark:bg-rose-500/20 px-2 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      -{finalDiscountPct}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stock pill */}
          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black border ${
                currentStock > 0
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/20 border-rose-250/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${currentStock > 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
              {currentStock > 0 ? `Còn ${currentStock.toLocaleString("vi-VN")} sp` : "Hết hàng"}
            </span>
            {/* Stock progress bar */}
            {currentStock > 0 && (
              <div className="w-28 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stockPct}%`,
                    background: stockPct > 50 ? "linear-gradient(90deg,#10b981,#34d399)" : stockPct > 20 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Variants ── */}
      {variants.length > 0 && (
        <div className="space-y-5 px-6 py-5">
          {colorOptions.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Màu sắc</p>
                {selectedColor && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">{selectedColor}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => {
                  const active = selectedColor === color;
                  const disabled = !canPickColor(color);
                  return (
                    <button
                      key={color} type="button"
                      onClick={() => {
                        hasUserPickedVariantRef.current = true;
                        setSelectedColor(color); setQuantity(1);
                        const resolved = resolveVariantImageBySelection(color, selectedSize);
                        emitVariantImage(resolved.id, resolved.url);
                      }}
                      disabled={disabled || busy}
                      className={`relative overflow-hidden rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 border ${
                        active 
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20" 
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
                      } disabled:cursor-not-allowed disabled:opacity-35`}
                    >
                      {active && <span className="mr-1 text-[10px]">✓</span>}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {sizeOptions.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Kích cỡ</p>
                {selectedSize && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400">{selectedSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => {
                  const active = selectedSize === size;
                  const disabled = !canPickSize(size);
                  return (
                    <button
                      key={size} type="button"
                      onClick={() => {
                        hasUserPickedVariantRef.current = true;
                        setSelectedSize(size); setQuantity(1);
                        const resolved = resolveVariantImageBySelection(selectedColor, size);
                        emitVariantImage(resolved.id, resolved.url);
                      }}
                      disabled={disabled || busy}
                      className={`relative min-w-[52px] overflow-hidden rounded-xl px-3 py-2 text-sm font-bold transition-all duration-200 border ${
                        active 
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20" 
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800"
                      } disabled:cursor-not-allowed disabled:opacity-35`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Quantity + Subtotal ── */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Qty stepper */}
        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <button
            type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={busy || quantity <= 1}
            className="flex h-11 w-11 items-center justify-center font-black text-lg text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-50 dark:hover:bg-indigo-955/40 disabled:opacity-30"
          >−</button>
          <span className="w-12 select-none text-center text-base font-black text-slate-800 dark:text-white">{quantity}</span>
          <button
            type="button" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={busy || quantity >= maxQty}
            className="flex h-11 w-11 items-center justify-center font-black text-lg text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-50 dark:hover:bg-indigo-955/40 disabled:opacity-30"
          >+</button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Thành tiền</p>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{asCurrency(currentPrice * quantity)}</p>
        </div>
      </div>

      {/* ── CTA Buttons ── */}
      <div className="space-y-3 px-6 py-5">
        {/* Add to cart */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); void addToCart(); }}
          disabled={!canBuy}
          className="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl font-black text-white text-sm transition-all duration-300 disabled:opacity-50"
          style={{
            background: addedToCart
              ? "linear-gradient(135deg,#10b981,#059669)"
              : "linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa)",
            boxShadow: addedToCart
              ? "0 8px 28px rgba(16,185,129,.4)"
              : "0 8px 28px rgba(99,102,241,.4)",
          }}
        >
          {/* Shine sweep */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(110deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%)",
              backgroundSize: "200% 100%",
              animation: canBuy ? "shine 2.5s linear infinite" : "none",
            }}
          />
          <style>{`@keyframes shine{from{background-position:-200% 0}to{background-position:200% 0}}`}</style>
          {busy ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : addedToCart ? (
            <><span className="material-symbols-outlined text-[20px]">check_circle</span>Đã thêm vào giỏ!</>
          ) : (
            <><span className="material-symbols-outlined text-[20px]">shopping_bag</span>Thêm vào giỏ hàng</>
          )}
        </button>

        {/* Buy now */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); proceedBuyNow(); }}
          disabled={!canBuy}
          className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-600 dark:border-indigo-500 bg-transparent text-indigo-600 dark:text-indigo-400 text-sm font-black transition-all hover:bg-indigo-600 hover:text-white dark:hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[20px]">bolt</span>
          Mua ngay — {asCurrency(currentPrice * quantity)}
        </button>
      </div>
    </div>
  );
}
