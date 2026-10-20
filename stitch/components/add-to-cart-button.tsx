"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

type Variant = {
  id?: number | null;
  productId?: number | null;
  size?: string | null;
  color?: string | null;
  variantImageUrl?: string | null;
  price?: number | string | null;
  availability?: number | null;
  variantName?: string | null;
  attributesJson?: string | null;
  sku?: string | null;
};

type CartItemLite = {
  quantity?: number | null;
  productId?: number | null;
  variantId?: number | null;
};

function normalizeOption(v: string): string {
  return v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function parseVariantAttributes(v: Variant): Array<{ name: string; value: string }> {
  if (v.attributesJson) {
    try {
      const parsed = JSON.parse(v.attributesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const pairs: Array<{ name: string; value: string }> = [];
        for (const item of parsed) {
          if (typeof item === "object" && item !== null) {
            const name = String((item as any).tierName || (item as any).name || (item as any).key || (item as any).label || "").trim();
            const val = String((item as any).value || (item as any).val || "").trim();
            if (name && val) pairs.push({ name, value: val });
          }
        }
        if (pairs.length > 0) return pairs;
      } else if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const pairs: Array<{ name: string; value: string }> = [];
        for (const [key, val] of Object.entries(parsed)) {
          const name = String(key).trim();
          const strVal = String(val ?? "").trim();
          if (name && strVal) pairs.push({ name, value: strVal });
        }
        if (pairs.length > 0) return pairs;
      }
    } catch {
      // fallback
    }
  }

  // Fallback for legacy variants or composite size strings
  const pairs: Array<{ name: string; value: string }> = [];
  const color = (v.color ?? "").trim();
  const size = (v.size ?? "").trim();
  if (color) pairs.push({ name: "Màu sắc", value: color });

  if (size) {
    const parts = size.split(/\s+[-•/]\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      parts.forEach((part, idx) => {
        const tierName = idx === 0 ? "Kích cỡ / Dung lượng" : idx === 1 ? "Phiên bản / Chất liệu" : `Tầng ${idx + 2}`;
        pairs.push({ name: tierName, value: part });
      });
    } else {
      pairs.push({ name: "Kích cỡ", value: size });
    }
  }
  return pairs;
}

function variantLabel(v: Variant): string {
  if (v.variantName && v.variantName.trim()) return v.variantName.trim();
  const size = String(v.size ?? "").trim();
  const color = String(v.color ?? "").trim();
  if (size && color) return `${color} • ${size}`;
  return color || size || `Biến thể #${String(v.id ?? "")}`;
}

function asInt(raw: unknown, fallback: number): number {
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) ? n : fallback;
}

function asMoneyVnd(raw?: number | string | null): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

function toCartItems(raw: unknown): CartItemLite[] {
  if (Array.isArray(raw)) return raw as CartItemLite[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as CartItemLite[];
    if (Array.isArray(obj.data)) return obj.data as CartItemLite[];
    if (Array.isArray(obj.content)) return obj.content as CartItemLite[];
  }
  return [];
}

export function AddToCartButton(props: { productId: string; hasVariants: boolean; isLoggedIn: boolean; className?: string }) {
  const router = useRouter();
  const productIdNum = useMemo(() => asInt(props.productId, 0), [props.productId]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; message: string } | null>(null);

  const [open, setOpen] = useState(false);
  const [variants, setVariants] = useState<Variant[] | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  function redirectToLogin(): void {
    const next = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    router.push(`/login?next=${next}`);
  }

  async function handleAuthOrGeneralError(res: Response): Promise<boolean> {
    if (res.status === 401 || res.status === 403) {
      setToast({ kind: "error", message: "Phiên đăng nhập đã hết hạn. Đang chuyển tới trang đăng nhập..." });
      window.setTimeout(() => redirectToLogin(), 500);
      return true;
    }
    const txt = await res.text().catch(() => "");
    const low = txt.toLowerCase();
    if (res.status === 409) {
      setToast({ kind: "error", message: "Sản phẩm không đủ tồn kho để thêm vào giỏ." });
      return true;
    }
    if (
      low.includes("unauthorized") ||
      low.includes("token không hợp lệ") ||
      low.includes("bearer access token")
    ) {
      setToast({ kind: "error", message: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ." });
      window.setTimeout(() => redirectToLogin(), 500);
      return true;
    }
    return false;
  }

  async function addSimple() {
    if (productIdNum <= 0) return;
    if (!props.isLoggedIn) {
      redirectToLogin();
      return;
    }
    setBusy(true);
    try {
      const res = await addOrIncrease(productIdNum, null);
      if (!res.ok) {
        if (await handleAuthOrGeneralError(res)) {
          return;
        }
        if (res.status === 409) {
          setToast({ kind: "error", message: "Sản phẩm không đủ tồn kho để thêm vào giỏ." });
          return;
        }
        setToast({ kind: "error", message: "Không thêm được vào giỏ hàng." });
        return;
      }
      setToast({ kind: "success", message: "Đã thêm vào giỏ hàng." });
    } catch {
      setToast({ kind: "error", message: "Không kết nối được tới hệ thống giỏ hàng." });
    } finally {
      setBusy(false);
    }
  }

  async function addOrIncrease(productId: number, variantId: number | null, variantLabelStr?: string | null): Promise<Response> {
    try {
      const existingRes = await fetch("/api/cart/items", { cache: "no-store" });
      if (existingRes.ok) {
        const payload = (await existingRes.json().catch(() => null)) as unknown;
        const items = toCartItems(payload);
        const hit = items.find((it) => {
          const pid = asInt(it.productId, 0);
          const vid = it.variantId == null ? null : asInt(it.variantId, 0);
          return pid === productId && (variantId == null ? vid == null : vid === variantId);
        });
        if (hit) {
          const current = Math.max(1, asInt(hit.quantity, 1));
          const qs = new URLSearchParams({
            productId: String(productId),
            quantity: String(current + 1),
          });
          if (variantId != null) qs.set("variantId", String(variantId));
          if (variantLabelStr) qs.set("variantLabel", variantLabelStr);
          return fetch(`/api/cart?${qs.toString()}`, { method: "PUT", cache: "no-store" });
        }
      }
    } catch {
      // Ignore lookup failure and fallback to POST.
    }
    const createQs = new URLSearchParams({
      productId: String(productId),
      quantity: "1",
    });
    if (variantId != null) createQs.set("variantId", String(variantId));
    if (variantLabelStr) createQs.set("variantLabel", variantLabelStr);
    return fetch(`/api/cart?${createQs.toString()}`, { method: "POST", cache: "no-store" });
  }

  async function openVariantPicker() {
    if (productIdNum <= 0) return;
    if (!props.isLoggedIn) {
      redirectToLogin();
      return;
    }
    setOpen(true);
    if (variants != null) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/catalog/products/${encodeURIComponent(String(productIdNum))}/variants`, { cache: "no-store" });
      if (!res.ok) {
        setVariants([]);
        setToast({ kind: "error", message: "Không tải được danh sách biến thể." });
        return;
      }
      const data = (await res.json().catch(() => [])) as Variant[];
      const list = Array.isArray(data) ? data : [];
      setVariants(list);
      const firstInStock = list.find((v) => asInt(v.availability, 0) > 0) ?? list[0];
      if (firstInStock?.id != null) {
        setSelectedVariantId(String(firstInStock.id));
        const attrs = parseVariantAttributes(firstInStock);
        const map: Record<string, string> = {};
        for (const a of attrs) map[a.name] = a.value;
        setSelectedTiers(map);
      }
    } catch {
      setVariants([]);
      setToast({ kind: "error", message: "Không tải được danh sách biến thể." });
    } finally {
      setBusy(false);
    }
  }

  async function smartAddToCart() {
    if (productIdNum <= 0) return;
    if (!props.isLoggedIn) {
      redirectToLogin();
      return;
    }
    if (props.hasVariants) {
      await openVariantPicker();
      return;
    }
    try {
      const res = await fetch(`/api/catalog/products/${encodeURIComponent(String(productIdNum))}/variants`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json().catch(() => [])) as Variant[];
        const list = Array.isArray(data) ? data.filter((v) => asInt(v.id, 0) > 0) : [];
        if (list.length > 0) {
          setVariants(list);
          const firstInStock = list.find((v) => asInt(v.availability, 0) > 0) ?? list[0];
          if (firstInStock?.id != null) {
            setSelectedVariantId(String(firstInStock.id));
            const attrs = parseVariantAttributes(firstInStock);
            const map: Record<string, string> = {};
            for (const a of attrs) map[a.name] = a.value;
            setSelectedTiers(map);
          }
          setOpen(true);
          return;
        }
      }
    } catch {
      // Ignore detection failure and continue with simple add.
    }
    await addSimple();
  }

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50";

  const tierDefinitions = useMemo(() => {
    const list = Array.isArray(variants) ? variants : [];
    if (!list.length) return [];
    const tierMap = new Map<string, string[]>();
    const tierOrder: string[] = [];

    for (const v of list) {
      const attrs = parseVariantAttributes(v);
      for (const attr of attrs) {
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

    return tierOrder.map((name) => ({
      name,
      options: tierMap.get(name) || [],
    }));
  }, [variants]);

  const selectedVariant = useMemo(() => {
    const list = Array.isArray(variants) ? variants : [];
    if (!list.length) return null;
    if (tierDefinitions.length === 0) {
      return list.find((v) => asInt(v.id, 0) === asInt(selectedVariantId, 0)) ?? list[0] ?? null;
    }
    const match = list.find((v) => {
      const attrs = parseVariantAttributes(v);
      return tierDefinitions.every((t) => {
        const selVal = selectedTiers[t.name];
        if (!selVal) return false;
        const matched = attrs.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
        return matched && normalizeOption(matched.value) === normalizeOption(selVal);
      });
    });
    return match ?? null;
  }, [variants, tierDefinitions, selectedTiers, selectedVariantId]);

  useEffect(() => {
    if (selectedVariant?.id != null) {
      setSelectedVariantId(String(selectedVariant.id));
    }
  }, [selectedVariant]);

  const canPickTierOption = useMemo(() => {
    const list = Array.isArray(variants) ? variants : [];
    return (tierName: string, optionValue: string) => {
      return list.some((v) => {
        if (asInt(v.availability, 0) <= 0) return false;
        const attrs = parseVariantAttributes(v);
        const thisAttr = attrs.find((a) => normalizeOption(a.name) === normalizeOption(tierName));
        if (!thisAttr || normalizeOption(thisAttr.value) !== normalizeOption(optionValue)) return false;
        for (const t of tierDefinitions) {
          if (normalizeOption(t.name) === normalizeOption(tierName)) continue;
          const curVal = selectedTiers[t.name];
          if (!curVal) continue;
          const otherAttr = attrs.find((a) => normalizeOption(a.name) === normalizeOption(t.name));
          if (!otherAttr || normalizeOption(otherAttr.value) !== normalizeOption(curVal)) return false;
        }
        return true;
      });
    };
  }, [variants, tierDefinitions, selectedTiers]);

  function getMinPriceForOption(tierName: string, optionValue: string): number | null {
    const list = Array.isArray(variants) ? variants : [];
    return list
      .filter((v) => {
        const attrs = parseVariantAttributes(v);
        const thisAttr = attrs.find((a) => normalizeOption(a.name) === normalizeOption(tierName));
        return thisAttr && normalizeOption(thisAttr.value) === normalizeOption(optionValue) && asInt(v.availability, 0) > 0;
      })
      .reduce<number | null>((acc, v) => {
        const p = Number(v.price ?? NaN);
        if (!Number.isFinite(p) || p <= 0) return acc;
        if (acc == null) return p;
        return Math.min(acc, p);
      }, null);
  }

  async function confirmVariantAdd() {
    const vid = asInt(selectedVariant?.id ?? selectedVariantId, 0);
    if (productIdNum <= 0 || vid <= 0) return;
    if (!props.isLoggedIn) {
      redirectToLogin();
      return;
    }
    setBusy(true);
    try {
      const variantLabelStr = selectedVariant?.variantName?.trim() ||
        tierDefinitions.map((t) => selectedTiers[t.name]).filter(Boolean).join(" • ") ||
        variantLabel(selectedVariant ?? {});
      const res = await addOrIncrease(productIdNum, vid, variantLabelStr);
      if (!res.ok) {
        if (await handleAuthOrGeneralError(res)) {
          return;
        }
        if (res.status === 409) {
          setToast({ kind: "error", message: "Biến thể không đủ tồn kho để thêm vào giỏ." });
          return;
        }
        setToast({ kind: "error", message: "Không thêm được vào giỏ hàng." });
        return;
      }
      setToast({ kind: "success", message: "Đã thêm vào giỏ hàng." });
      setOpen(false);
    } catch {
      setToast({ kind: "error", message: "Không kết nối được tới hệ thống giỏ hàng." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={props.className ?? ""}>
      {mounted && toast
        ? createPortal(
            <div className="pointer-events-none fixed right-4 top-4 z-[100] w-[min(420px,calc(100vw-2rem))]">
              <div
                className={[
                  "pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-panel backdrop-blur",
                  toast.kind === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-error/20 bg-error-container text-on-error-container",
                ].join(" ")}
                role="status"
                aria-live="polite"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">{toast.kind === "success" ? "SUCCESS" : "ERROR"}</p>
                  <p className="mt-0.5 break-words text-sm font-semibold">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="rounded-xl bg-white/40 px-3 py-2 text-xs font-black text-current transition hover:bg-white/60"
                >
                  Đóng
                </button>
              </div>
            </div>,
            document.body
          )
        : null}

      <button
        type="button"
        disabled={busy || productIdNum <= 0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void smartAddToCart();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        <span>{busy ? "Đang xử lý..." : "Thêm vào giỏ"}</span>
      </button>

      {open ? (
        mounted
          ? createPortal(
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                <div className="w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/50 px-6 py-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-cyan-400">Chọn biến thể</p>
                      <p className="font-headline text-xl font-black text-slate-900 dark:text-white">Thêm vào giỏ hàng</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(false);
                      }}
                      className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-800/80 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition"
                    >
                      Đóng
                    </button>
                  </div>

                  <div
                    className="space-y-5 px-6 py-6"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {variants == null ? (
                      <div className="space-y-2">
                        <div className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-800" />
                        <div className="h-11 animate-pulse rounded-xl bg-slate-100 dark:bg-zinc-800" />
                      </div>
                    ) : variants.length === 0 ? (
                      <p className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Sản phẩm chưa có biến thể khả dụng.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/80 px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Giá biến thể đã chọn</p>
                            <p className="mt-1 text-lg font-black text-indigo-600 dark:text-cyan-400">{asMoneyVnd(selectedVariant?.price)}</p>
                          </div>
                          {selectedVariant?.variantName && (
                            <span className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 max-w-[200px] truncate">
                              {selectedVariant.variantName}
                            </span>
                          )}
                        </div>

                        {tierDefinitions.map((tier, idx) => (
                          <div key={tier.name}>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                              {idx + 1}. {tier.name}: <span className="text-indigo-600 dark:text-cyan-400 font-bold">{selectedTiers[tier.name] || "—"}</span>
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {tier.options.map((opt) => {
                                const hasStock = canPickTierOption(tier.name, opt);
                                const hasStockAnywhere = (variants ?? []).some((v) => {
                                  const attrs = parseVariantAttributes(v);
                                  const a = attrs.find((x) => normalizeOption(x.name) === normalizeOption(tier.name));
                                  return a && normalizeOption(a.value) === normalizeOption(opt) && asInt(v.availability, 0) > 0;
                                });
                                const active = selectedTiers[tier.name] === opt;
                                const minPrice = getMinPriceForOption(tier.name, opt);

                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    disabled={!hasStockAnywhere}
                                    onClick={() => setSelectedTiers((prev) => ({ ...prev, [tier.name]: opt }))}
                                    className={[
                                      "rounded-xl border px-3.5 py-2 text-left text-xs font-bold transition",
                                      active 
                                        ? "border-indigo-500 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20" 
                                        : "border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900 text-slate-800 dark:text-slate-200 hover:border-indigo-400",
                                      !hasStock ? "opacity-50" : "",
                                      !hasStockAnywhere ? "opacity-30 cursor-not-allowed" : "",
                                    ].join(" ")}
                                  >
                                    <span className="block">{opt}</span>
                                    {minPrice != null && (
                                      <span className={["block text-[10px] font-semibold mt-0.5", active ? "text-white/90" : "text-slate-500 dark:text-slate-400"].join(" ")}>
                                        từ {asMoneyVnd(minPrice)}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                        }}
                        className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 py-3 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={busy || variants == null || variants.length === 0 || asInt(selectedVariantId, 0) <= 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void confirmVariantAdd();
                        }}
                        className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.98] transition disabled:opacity-50"
                      >
                        Xác nhận
                      </button>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center">
                      Nếu sản phẩm đã có trong giỏ, hệ thống sẽ tự động tăng số lượng thêm 1.
                    </p>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null
      ) : null}
    </div>
  );
}

