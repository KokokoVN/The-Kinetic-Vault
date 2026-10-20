"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { resolveCatalogImageUrl, type AdminProductVariant } from "@/lib/api";
import type { SaleProgram } from "@/lib/sale-api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parseVariantTiers, getSwatchColor, type VariantTier } from "@/lib/variant-tier-utils";

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
  onVariantSelect?: (info: { price: number; name: string | null; image: string | null; stock: number }) => void;
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
  return resolveCatalogImageUrl(v);
}

export function ProductDetailPurchase({
  productId,
  productName,
  basePrice,
  effectivePrice,
  saleType,
  saleValue,
  activeSalePrograms,
  baseStock,
  baseImage,
  variants,
  isLoggedIn,
  onVariantImageChange,
  onVariantSelect,
}: Props) {
  const router = useRouter();
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const lastEmittedVariantImageRef = useRef<string | null>(null);
  const lastEmittedVariantIdRef = useRef<number | null>(null);
  const hasUserPickedVariantRef = useRef(false);

  // Extract all dynamic tiers across all variants using unified utility
  const parsedVariants = useMemo(() => {
    return variants.map((v) => ({
      ...v,
      parsed: parseVariantTiers(v),
    }));
  }, [variants]);

  const tierDefinitions = useMemo(() => {
    if (!parsedVariants.length) return [];
    const tierMap = new Map<string, string[]>();
    const tierOrder: string[] = [];

    for (const v of parsedVariants) {
      for (const attr of v.parsed.tiers) {
        if (!tierMap.has(attr.name)) {
          tierMap.set(attr.name, []);
          tierOrder.push(attr.name);
        }
        const existingList = tierMap.get(attr.name)!;
        const exists = existingList.some((ex) => normalizeOption(ex) === normalizeOption(attr.value));
        if (!exists) {
          existingList.push(attr.value);
        }
      }
    }

    if (tierOrder.length === 0 && parsedVariants.length > 0) {
      return [
        {
          name: "Phiên bản",
          isColor: false,
          options: parsedVariants.map((v) => v.parsed.fullLabel || `Biến thể #${v.id}`),
        },
      ];
    }

    return tierOrder.map((name) => ({
      name,
      isColor: /màu|mau|color/i.test(name),
      options: tierMap.get(name) || [],
    }));
  }, [parsedVariants]);

  // Find the selected variant matching all current tier selections
  const selectedVariant = useMemo(() => {
    if (!parsedVariants.length) return null;
    if (tierDefinitions.length === 0) return parsedVariants[0] ?? null;

    const allSelected = tierDefinitions.every((t) => Boolean(selectedTiers[t.name]));
    if (!allSelected) {
      const firstAvailable = parsedVariants.find((v) => Number(v.availability ?? 0) > 0) ?? parsedVariants[0];
      return firstAvailable ?? null;
    }

    const exact = parsedVariants.find((v) => {
      return tierDefinitions.every((t) => {
        const selVal = selectedTiers[t.name];
        if (!selVal) return false;
        const matchedAttr = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
        return matchedAttr && normalizeOption(matchedAttr.value) === normalizeOption(selVal);
      });
    });

    if (exact) return exact;

    // Best partial match fallback
    let bestMatch: (typeof parsedVariants)[0] = parsedVariants[0];
    let maxMatchCount = -1;
    for (const v of parsedVariants) {
      let count = 0;
      for (const t of tierDefinitions) {
        const selVal = selectedTiers[t.name];
        if (!selVal) continue;
        const matched = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
        if (matched && normalizeOption(matched.value) === normalizeOption(selVal)) {
          count++;
        }
      }
      if (count > maxMatchCount) {
        maxMatchCount = count;
        bestMatch = v;
      }
    }
    return bestMatch ?? parsedVariants[0] ?? null;
  }, [tierDefinitions, selectedTiers, parsedVariants]);

  // Check if an option can be chosen for a given tier
  const canPickTierOption = useMemo(() => {
    return (tierName: string, optionValue: string) => {
      return parsedVariants.some((v) => {
        if (Number(v.availability ?? 0) <= 0) return false;
        const thisTierAttr = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(tierName));
        if (!thisTierAttr || normalizeOption(thisTierAttr.value) !== normalizeOption(optionValue)) {
          return false;
        }
        for (const t of tierDefinitions) {
          if (normalizeOption(t.name) === normalizeOption(tierName)) continue;
          const currentOtherVal = selectedTiers[t.name];
          if (!currentOtherVal) continue;
          const otherAttr = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
          if (!otherAttr || normalizeOption(otherAttr.value) !== normalizeOption(currentOtherVal)) {
            return false;
          }
        }
        return true;
      });
    };
  }, [tierDefinitions, selectedTiers, parsedVariants]);

  // Initial selection on mount: select first available in-stock variant
  useEffect(() => {
    if (!parsedVariants.length || tierDefinitions.length === 0) return;
    const firstAvailable = parsedVariants.find((v) => Number(v.availability ?? 0) > 0) ?? parsedVariants[0];
    if (!firstAvailable) return;

    setSelectedTiers((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const t of tierDefinitions) {
        if (!next[t.name]) {
          const matchedAttr = firstAvailable.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
          next[t.name] = matchedAttr ? matchedAttr.value : t.options[0] ?? "";
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [parsedVariants, tierDefinitions]);

  const handleSelectTierOption = (tierName: string, optionValue: string) => {
    hasUserPickedVariantRef.current = true;
    const candidateTiers = { ...selectedTiers, [tierName]: optionValue };

    // 1. Check if exact variant exists with candidateTiers
    const exact = parsedVariants.find((v) => {
      return tierDefinitions.every((t) => {
        const targetVal = candidateTiers[t.name];
        if (!targetVal) return true;
        const matched = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
        return matched && normalizeOption(matched.value) === normalizeOption(targetVal);
      });
    });

    if (exact) {
      setSelectedTiers(candidateTiers);
      setQuantity(1);
      const resolved = resolveVariantImageByTiers(candidateTiers);
      emitVariantImage(resolved.id, resolved.url);
      return;
    }

    // 2. If not exact, find the best compatible variant that has this option
    const matchingVariants = parsedVariants.filter((v) => {
      const matched = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(tierName));
      return matched && normalizeOption(matched.value) === normalizeOption(optionValue);
    });

    const bestVariant =
      matchingVariants.find((v) => Number(v.availability ?? 0) > 0) ??
      matchingVariants[0];

    if (bestVariant) {
      const nextTiers: Record<string, string> = { ...selectedTiers, [tierName]: optionValue };
      for (const attr of bestVariant.parsed.tiers) {
        nextTiers[attr.name] = attr.value;
      }
      setSelectedTiers(nextTiers);
      setQuantity(1);
      const resolved = resolveVariantImageByTiers(nextTiers);
      emitVariantImage(resolved.id, resolved.url);
    } else {
      setSelectedTiers(candidateTiers);
      setQuantity(1);
    }
  };

  const originalVariantPrice = parseVariantPrice(selectedVariant?.price, basePrice).value;

  // Calculate specific sale for the selected variant
  let activeEffectivePrice = effectivePrice;
  let activeSaleType = saleType;
  let activeSaleValue = saleValue;

  if (activeSalePrograms && activeSalePrograms.length > 0) {
    let lowestSalePrice = Infinity;
    let foundProgram = false;
    const numProductId = Number(productId);

    activeSalePrograms.forEach((program) => {
      const matchingItems = program.items.filter(
        (it) => it.productId === numProductId && (it.promoQtyLimit == null || it.promoQtyLimit > 0)
      );
      if (matchingItems.length === 0) return;

      let appliesToCurrent = false;
      if (selectedVariant && selectedVariant.id != null) {
        appliesToCurrent = matchingItems.some(
          (it) => it.variantId === Number(selectedVariant.id) || it.variantId == null
        );
      } else {
        appliesToCurrent = matchingItems.some((it) => it.variantId == null);
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
      activeEffectivePrice = null;
      activeSaleType = null;
      activeSaleValue = null;
    }
  }

  const hasSale = activeEffectivePrice != null && activeSaleType != null;

  let currentPrice = originalVariantPrice;
  let displayOriginalPrice: number | null = null;
  let finalDiscountPct = 0;

  if (hasSale && activeSaleType === "AMOUNT" && activeSaleValue != null) {
    currentPrice = activeSaleValue;
    displayOriginalPrice = originalVariantPrice;
    if (activeSaleValue < originalVariantPrice) {
      finalDiscountPct = Math.round(((displayOriginalPrice - currentPrice) / displayOriginalPrice) * 100);
    }
  } else if (hasSale && activeSaleType === "PERCENT" && activeSaleValue != null) {
    currentPrice = Math.round(originalVariantPrice * (1 - activeSaleValue / 100));
    displayOriginalPrice = originalVariantPrice;
    finalDiscountPct = activeSaleValue;
  } else if (hasSale && activeEffectivePrice != null) {
    if (activeEffectivePrice < originalVariantPrice) {
      currentPrice = activeEffectivePrice;
      displayOriginalPrice = originalVariantPrice;
      finalDiscountPct = Math.round(((originalVariantPrice - activeEffectivePrice) / originalVariantPrice) * 100);
    }
  }

  const hasVariants = variants.length > 0;
  const isCombinationValid = !hasVariants || Boolean(selectedVariant);
  const currentStock = hasVariants
    ? selectedVariant
      ? Number(selectedVariant.availability ?? 0)
      : 0
    : Number(baseStock ?? 0);
  const maxQty = Math.max(1, Number.isFinite(currentStock) ? currentStock : 1);
  const variantPreview = selectedVariant?.variantImageUrl
    ? resolvePreviewImage(selectedVariant.variantImageUrl, baseImage)
    : null;
  const canBuy = isCombinationValid && currentStock > 0 && !busy;
  const stockPct = Math.min(100, Math.max(0, (currentStock / Math.max(currentStock, 50)) * 100));

  function resolveVariantImageByTiers(nextTiers: Record<string, string>): { id: number | null; url: string | null } {
    if (!parsedVariants.length) return { id: null, url: null };
    const exact = parsedVariants.find((v) => {
      return tierDefinitions.every((t) => {
        const val = nextTiers[t.name];
        if (!val) return true;
        const m = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
        return m && normalizeOption(m.value) === normalizeOption(val);
      });
    });
    if (exact?.variantImageUrl) {
      return { id: exact.id ?? null, url: resolvePreviewImage(exact.variantImageUrl, baseImage) };
    }
    const firstTier = tierDefinitions[0];
    if (firstTier && nextTiers[firstTier.name]) {
      const tierVal = nextTiers[firstTier.name];
      const withImg = parsedVariants.find((v) => {
        const m = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(firstTier.name));
        return m && normalizeOption(m.value) === normalizeOption(tierVal) && Boolean(v.variantImageUrl);
      });
      if (withImg?.variantImageUrl) {
        return { id: withImg.id ?? null, url: resolvePreviewImage(withImg.variantImageUrl, baseImage) };
      }
    }
    return { id: exact?.id ?? null, url: null };
  }

  function emitVariantImage(nextVariantId: number | null, nextUrl: string | null) {
    if (lastEmittedVariantIdRef.current === nextVariantId && lastEmittedVariantImageRef.current === nextUrl) return;
    lastEmittedVariantIdRef.current = nextVariantId;
    lastEmittedVariantImageRef.current = nextUrl;
    onVariantImageChange?.(nextUrl);
  }

  useEffect(() => {
    if (!hasUserPickedVariantRef.current) return;
    const currentVariantId = selectedVariant?.id ?? null;
    if (lastEmittedVariantIdRef.current === currentVariantId && lastEmittedVariantImageRef.current === variantPreview) return;
    lastEmittedVariantIdRef.current = currentVariantId;
    lastEmittedVariantImageRef.current = variantPreview;
    onVariantImageChange?.(variantPreview);
  }, [onVariantImageChange, selectedVariant?.id, variantPreview]);

  const computedVariantLabel = useMemo(() => {
    if (selectedVariant?.variantName?.trim()) {
      return selectedVariant.variantName.trim();
    }
    if (selectedVariant?.parsed?.fullLabel) {
      return selectedVariant.parsed.fullLabel;
    }
    if (tierDefinitions.length > 0) {
      const parts = tierDefinitions.map((t) => selectedTiers[t.name]).filter(Boolean);
      if (parts.length > 0) return parts.join(" • ");
    }
    return null;
  }, [selectedVariant, tierDefinitions, selectedTiers]);

  useEffect(() => {
    onVariantSelect?.({
      price: currentPrice,
      name: computedVariantLabel,
      image: variantPreview,
      stock: currentStock,
    });
  }, [currentPrice, computedVariantLabel, variantPreview, currentStock, onVariantSelect]);

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
    if (res.status === 409) {
      toast.error("Sản phẩm/biến thể đã hết hàng hoặc không đủ tồn kho.");
      return true;
    }
    if (low.includes("unauthorized") || low.includes("token không hợp lệ") || low.includes("bearer")) {
      toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ.");
      window.setTimeout(() => redirectToLogin(), 500);
      return true;
    }
    if (txt) {
      toast.error(`Lỗi: ${txt.slice(0, 140)}`);
      return true;
    }
    return false;
  }

  async function addToCart() {
    const pid = Number(productId);
    if (!Number.isFinite(pid) || pid <= 0 || quantity <= 0) return;
    if (!isLoggedIn) {
      redirectToLogin();
      return;
    }
    if (tierDefinitions.length > 0) {
      const missing = tierDefinitions.find((t) => !selectedTiers[t.name]);
      if (missing) {
        toast.error(`Vui lòng chọn ${missing.name} trước khi thêm vào giỏ.`);
        return;
      }
    }
    if (hasVariants && !selectedVariant) {
      toast.error("Tổ hợp phân loại đã chọn không khả dụng. Vui lòng chọn lại.");
      return;
    }
    setBusy(true);
    try {
      const qp = new URLSearchParams({ productId: String(pid), quantity: String(quantity) });
      if (selectedVariant?.id != null) qp.set("variantId", String(selectedVariant.id));
      if (computedVariantLabel) qp.set("variantLabel", computedVariantLabel);
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random()}`;
      const res = await fetch(`/api/cart?${qp.toString()}`, {
        method: "POST",
        cache: "no-store",
        headers: { "Idempotency-Key": idempotencyKey },
      });
      if (!res.ok) {
        if (await shouldRedirectLogin(res)) return;
        toast.error("Không thêm được vào giỏ hàng.");
        return;
      }
      toast.success("Đã thêm sản phẩm vào giỏ hàng thành công!");
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2200);
    } catch {
      toast.error("Không kết nối được hệ thống giỏ hàng.");
    } finally {
      setBusy(false);
    }
  }

  function proceedBuyNow() {
    const pid = Number(productId);
    if (!Number.isFinite(pid) || pid <= 0 || quantity <= 0) return;
    if (tierDefinitions.length > 0) {
      const missing = tierDefinitions.find((t) => !selectedTiers[t.name]);
      if (missing) {
        toast.error(`Vui lòng chọn ${missing.name} trước khi mua ngay.`);
        return;
      }
    }
    if (variants.length && !selectedVariant) {
      toast.error("Không xác định được biến thể. Vui lòng chọn lại.");
      return;
    }
    if (!canBuy) {
      toast.error("Sản phẩm hiện đang hết hàng.");
      return;
    }
    const variantLabel = computedVariantLabel;
    const picked = [
      {
        productId: pid,
        variantId: selectedVariant?.id != null ? Number(selectedVariant.id) : null,
        quantity,
        subTotal: Math.max(0, Number(currentPrice) * Math.max(1, Math.floor(quantity))),
        variantLabel,
        product: {
          id: pid,
          sku: selectedVariant?.sku ?? null,
          productName,
          primaryImageUrl:
            (selectedVariant?.variantImageUrl
              ? resolvePreviewImage(selectedVariant.variantImageUrl, baseImage)
              : baseImage) || null,
          effectivePrice: currentPrice ?? null,
        },
      },
    ];
    window.sessionStorage.setItem("checkout:selectedItems", JSON.stringify(picked));
    window.sessionStorage.setItem("checkout:flow", "buy-now");
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent("/checkout")}`);
      return;
    }
    router.push("/checkout");
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Đã sao chép mã ưu đãi ${code}!`);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-all duration-300">
      {/* ── Ambient Glow Orb ── */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl" />

      {/* ── FLASH SALE STRIP (When Active) ── */}
      {hasSale && (
        <div className="relative -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 overflow-hidden rounded-t-[2.5rem] bg-gradient-to-r from-amber-500 via-rose-600 to-indigo-600 p-4 text-white shadow-lg">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <span className="material-symbols-outlined text-[18px] text-amber-300 animate-pulse">
                  bolt
                </span>
              </span>
              <div>
                <p className="font-headline text-xs font-black uppercase tracking-wider text-amber-200">
                  Chương trình ưu đãi có hạn
                </p>
                <p className="text-sm font-black tracking-tight">Flash Sale Độc Quyền</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-black/30 px-3.5 py-1.5 backdrop-blur-md border border-white/15 text-xs font-black">
              <span className="material-symbols-outlined text-[15px] text-amber-300">schedule</span>
              <span>Tiết kiệm {asCurrency((displayOriginalPrice ?? currentPrice) - currentPrice)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PRICE SECTION ── */}
      <div className="relative z-10 pb-6 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200/80 dark:border-indigo-500/30">
                <span className="material-symbols-outlined text-[13px]">verified_user</span>
                Giá niêm yết chính hãng
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3 pt-1">
              <span className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-white dark:via-slate-100 dark:to-cyan-400">
                {asCurrency(currentPrice)}
              </span>
              {displayOriginalPrice && (
                <div className="flex items-center gap-2.5">
                  <span className="text-sm sm:text-base font-bold text-slate-400 dark:text-slate-500 line-through">
                    {asCurrency(displayOriginalPrice)}
                  </span>
                  {finalDiscountPct > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-md shadow-rose-500/20">
                      <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                      -{finalDiscountPct}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stock status indicator pill */}
          <div className="flex flex-col items-end gap-1.5">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-black border backdrop-blur-md transition-all ${
                !isCombinationValid
                  ? "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400"
                  : currentStock > 0
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isCombinationValid && currentStock > 0 && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    !isCombinationValid ? "bg-slate-400" : currentStock > 0 ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </span>
              <span>
                {!isCombinationValid
                  ? "Tổ hợp không khả dụng"
                  : currentStock > 0
                  ? `Còn ${currentStock.toLocaleString("vi-VN")} sp`
                  : "Tạm hết hàng"}
              </span>
            </div>

            {isCombinationValid && currentStock > 0 && (
              <div className="w-28 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stockPct}%`,
                    background:
                      stockPct > 50
                        ? "linear-gradient(90deg,#10b981,#34d399)"
                        : stockPct > 20
                        ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                        : "linear-gradient(90deg,#ef4444,#f87171)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ACTIVE VARIANT SELECTION BANNER ── */}
      {selectedVariant ? (
        <div className="relative z-10 my-5 rounded-2xl border border-indigo-200/70 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-[12px] font-black">
                ✓
              </span>
              <p className="truncate text-xs font-black text-slate-800 dark:text-slate-100">
                <span className="text-slate-400 dark:text-slate-500 font-normal mr-1.5">Phiên bản:</span>
                {computedVariantLabel || selectedVariant.variantName}
              </p>
            </div>
            {selectedVariant.sku && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                SKU: {selectedVariant.sku}
              </span>
            )}
          </div>
        </div>
      ) : hasVariants ? (
        <div className="relative z-10 my-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span className="material-symbols-outlined text-[16px] text-amber-500">info</span>
            <span>Tổ hợp phân loại này hiện đang hết hàng. Vui lòng chọn phân loại khác!</span>
          </div>
        </div>
      ) : null}

      {/* ── DYNAMIC MULTI-TIER VARIANTS SELECTOR ── */}
      {variants.length > 0 && tierDefinitions.length > 0 && (
        <div className="relative z-10 space-y-6 py-2">
          {tierDefinitions.map((tier, tierIdx) => {
            const selectedValue = selectedTiers[tier.name];

            return (
              <div key={tier.name} className="space-y-3">
                {/* Tier Title Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-lg bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Tầng {tierIdx + 1}
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                      {tier.name}
                    </h4>
                  </div>
                  {selectedValue && (
                    <span className="text-xs font-black text-indigo-600 dark:text-cyan-400">
                      {selectedValue}
                    </span>
                  )}
                </div>

                {/* Options List */}
                <div className="flex flex-wrap gap-2.5">
                  {tier.options.map((opt) => {
                    const active = selectedValue === opt;
                    const hasStockForCurrent = canPickTierOption(tier.name, opt);
                    const hasStockAnywhere = parsedVariants.some((v) => {
                      const m = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(tier.name));
                      return m && normalizeOption(m.value) === normalizeOption(opt) && Number(v.availability ?? 0) > 0;
                    });
                    const disabled = !hasStockAnywhere;

                    // Match variant for thumbnail or color
                    const matchingVariant = parsedVariants.find((v) => {
                      const m = v.parsed.tiers.find((a) => normalizeOption(a.name) === normalizeOption(tier.name));
                      return m && normalizeOption(m.value) === normalizeOption(opt);
                    });

                    const optThumb = matchingVariant?.variantImageUrl;
                    const swatchColor = tier.isColor ? getSwatchColor(opt) : null;

                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectTierOption(tier.name, opt)}
                        disabled={busy}
                        className={`group relative flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all duration-200 border ${
                          active
                            ? "border-indigo-600 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-500/15 text-indigo-700 dark:text-white ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10 scale-[1.02]"
                            : !hasStockForCurrent
                            ? "border-slate-200/70 dark:border-white/5 bg-slate-50/60 dark:bg-zinc-900/40 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-zinc-700"
                            : "border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-sm"
                        } disabled:cursor-not-allowed disabled:opacity-40 active:scale-95`}
                      >
                        {/* Color swatch circle */}
                        {swatchColor && (
                          <span
                            className="h-4 w-4 rounded-full border border-black/10 dark:border-white/20 shadow-inner shrink-0"
                            style={{ backgroundColor: swatchColor }}
                          />
                        )}

                        {/* Thumbnail image if available */}
                        {optThumb && !swatchColor && (
                          <img
                            src={resolvePreviewImage(optThumb, baseImage)}
                            alt={opt}
                            className="h-6 w-6 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 transition-transform group-hover:scale-105 shrink-0"
                          />
                        )}

                        {active && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                            ✓
                          </span>
                        )}
                        <span>{opt}</span>
                        {!hasStockForCurrent && hasStockAnywhere && (
                          <span className="text-[10px] font-normal text-rose-500 ml-0.5">(hết)</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EXCLUSIVE COUPONS QUICK PICKER ── */}
      <div className="relative z-10 my-4 rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50/70 dark:bg-zinc-900/40 p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-cyan-400">
            confirmation_number
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Mã Ưu Đãi Áp Dụng
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { code: "FREESHIP", label: "Freeship Đơn > 500k", desc: "Giảm 30.000₫" },
            { code: "VIP50K", label: "Giảm 50.000₫", desc: "Đơn từ 1.000.000₫" },
            { code: "WELCOME", label: "Thành viên mới", desc: "Giảm 5%" },
          ].map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => copyCouponCode(c.code)}
              className="group flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-500/30 bg-white dark:bg-zinc-800/80 px-3 py-1.5 text-left transition-all hover:border-indigo-500 hover:shadow-sm"
            >
              <div className="min-w-0">
                <span className="block font-mono text-[11px] font-black text-indigo-600 dark:text-cyan-400">
                  {c.code}
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {c.label}
                </span>
              </div>
              <span className="material-symbols-outlined text-[14px] text-slate-400 group-hover:text-indigo-500">
                {copiedCoupon === c.code ? "check" : "content_copy"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── QUANTITY & SUBTOTAL STEPPER ── */}
      <div className="relative z-10 pt-4 border-t border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Số lượng
            </p>
            {/* Stepper */}
            <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={busy || quantity <= 1}
                className="flex h-11 w-11 items-center justify-center text-lg font-black text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 active:scale-95"
              >
                −
              </button>
              <span className="w-12 select-none text-center font-mono text-base font-black text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={busy || quantity >= maxQty}
                className="flex h-11 w-11 items-center justify-center text-lg font-black text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Tạm tính
            </p>
            <p className="font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {asCurrency(currentPrice * quantity)}
            </p>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="relative z-10 space-y-3 pt-6">
        {/* Add to Cart */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void addToCart();
          }}
          disabled={!canBuy}
          className="group relative flex h-14 w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl font-headline text-sm font-black text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: addedToCart
              ? "linear-gradient(135deg, #10b981, #059669)"
              : "linear-gradient(135deg, #4f46e5, #6366f1, #06b6d4)",
          }}
        >
          {busy ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : addedToCart ? (
            <>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Đã thêm vào giỏ hàng thành công!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                add_shopping_cart
              </span>
              <span>Thêm vào giỏ hàng</span>
            </>
          )}
        </button>

        {/* Buy Now */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            proceedBuyNow();
          }}
          disabled={!canBuy}
          className="group flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-indigo-600 dark:border-indigo-400 bg-transparent text-indigo-600 dark:text-indigo-400 font-headline text-sm font-black transition-all duration-300 hover:bg-gradient-to-r hover:from-indigo-600 hover:via-indigo-500 hover:to-cyan-500 hover:text-white hover:border-transparent hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-12">
            bolt
          </span>
          <span>Mua ngay — {asCurrency(currentPrice * quantity)}</span>
        </button>
      </div>

      {/* ── TRUST & ASSURANCE BENEFITS ── */}
      <div className="relative z-10 grid grid-cols-2 gap-3 pt-6 border-t border-slate-200/80 dark:border-white/10 mt-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-[18px]">verified</span>
          </span>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
            Chính hãng 100% bảo hành tiêu chuẩn
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          </span>
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
            Giao hàng nhanh &amp; đồng kiểm nhận hàng
          </span>
        </div>
      </div>
    </div>
  );
}
