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
};

type CartItemLite = {
  quantity?: number | null;
  productId?: number | null;
  variantId?: number | null;
};

function variantLabel(v: Variant): string {
  const size = String(v.size ?? "").trim();
  const color = String(v.color ?? "").trim();
  if (size && color) return `${size} / ${color}`;
  return size || color || `Biến thể #${String(v.id ?? "")}`;
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
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
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

  async function addOrIncrease(productId: number, variantId: number | null): Promise<Response> {
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
      const firstInStock = list.find((v) => asInt(v.availability, 0) > 0);
      if (firstInStock?.id != null) {
        setSelectedVariantId(String(firstInStock.id));
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
    // If caller already knows there are variants, open picker immediately.
    if (props.hasVariants) {
      await openVariantPicker();
      return;
    }
    // Safety check: detect real variants from API in case hasVariants flag is stale/inaccurate.
    try {
      const res = await fetch(`/api/catalog/products/${encodeURIComponent(String(productIdNum))}/variants`, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json().catch(() => [])) as Variant[];
        const list = Array.isArray(data) ? data.filter((v) => asInt(v.id, 0) > 0) : [];
        if (list.length > 0) {
          setVariants(list);
          const firstInStock = list.find((v) => asInt(v.availability, 0) > 0) ?? list[0];
          if (firstInStock?.id != null) setSelectedVariantId(String(firstInStock.id));
          setOpen(true);
          return;
        }
      }
    } catch {
      // Ignore detection failure and continue with simple add.
    }
    await addSimple();
  }

  async function confirmVariantAdd() {
    const vid = asInt(selectedVariantId, 0);
    if (productIdNum <= 0 || vid <= 0) return;
    if (!props.isLoggedIn) {
      redirectToLogin();
      return;
    }
    const picked = (variants ?? []).find((v) => asInt(v.id, 0) === vid) ?? null;
    setBusy(true);
    try {
      const res = await addOrIncrease(productIdNum, vid);
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

  const baseBtn =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50";
  const variantOptions = useMemo(() => {
    const list = Array.isArray(variants) ? variants : [];
    const colors = Array.from(new Set(list.map((v) => String(v.color ?? "").trim()).filter(Boolean)));
    const sizes = Array.from(new Set(list.map((v) => String(v.size ?? "").trim()).filter(Boolean)));
    return { colors, sizes };
  }, [variants]);
  const selectedVariant = useMemo(
    () => (Array.isArray(variants) ? variants.find((v) => asInt(v.id, 0) === asInt(selectedVariantId, 0)) ?? null : null),
    [variants, selectedVariantId]
  );

  useEffect(() => {
    if (!open || !Array.isArray(variants) || variants.length === 0) return;
    const picked = variants.find((v) => asInt(v.id, 0) === asInt(selectedVariantId, 0)) ?? null;
    const color = String(picked?.color ?? "").trim();
    const size = String(picked?.size ?? "").trim();
    if (color) setSelectedColor(color);
    if (size) setSelectedSize(size);
  }, [open, variants, selectedVariantId]);

  useEffect(() => {
    if (!Array.isArray(variants) || variants.length === 0) return;
    const colorActive = selectedColor.trim();
    const sizeActive = selectedSize.trim();
    const match =
      variants.find((v) => {
        const c = String(v.color ?? "").trim();
        const s = String(v.size ?? "").trim();
        const inStock = asInt(v.availability, 0) > 0;
        if (!inStock) return false;
        if (colorActive && c !== colorActive) return false;
        if (sizeActive && s !== sizeActive) return false;
        return true;
      }) ??
      variants.find((v) => asInt(v.availability, 0) > 0) ??
      variants[0];
    if (match?.id != null) {
      setSelectedVariantId(String(match.id));
    }
  }, [variants, selectedColor, selectedSize]);

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
        className={[baseBtn, "w-full bg-kinetic text-white shadow-xl shadow-primary/20 hover:saturate-150"].join(" ")}
      >
        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        Thêm vào giỏ
      </button>

      {open ? (
        mounted
          ? createPortal(
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
              >
                <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-surface-container-lowest dark:bg-slate-900 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-outline-variant/10 bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent px-6 py-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Chọn biến thể</p>
                      <p className="font-headline text-xl font-extrabold text-primary">Thêm vào giỏ hàng</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpen(false);
                      }}
                      className="rounded-xl bg-surface-container dark:bg-slate-800-high px-3 py-2 text-xs font-black text-primary transition hover:bg-surface-container dark:bg-slate-800-highest"
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
                        <div className="h-11 animate-pulse rounded-xl bg-surface-container-low dark:bg-slate-800" />
                        <div className="h-11 animate-pulse rounded-xl bg-surface-container-low dark:bg-slate-800" />
                      </div>
                    ) : variants.length === 0 ? (
                      <p className="rounded-2xl border border-outline-variant/20 bg-surface-container-low dark:bg-slate-800 px-4 py-3 text-sm font-medium text-on-surface-variant">
                        Sản phẩm chưa có biến thể khả dụng.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low dark:bg-slate-800 px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Giá biến thể đã chọn</p>
                          <p className="mt-1 text-lg font-extrabold text-primary">{asMoneyVnd(selectedVariant?.price)}</p>
                        </div>

                        {variantOptions.colors.length > 0 ? (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                              Màu sắc: <span className="text-primary">{selectedColor || "—"}</span>
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {variantOptions.colors.map((color) => {
                                const hasStock = variants.some((v) => String(v.color ?? "").trim() === color && asInt(v.availability, 0) > 0);
                                const active = color === selectedColor;
                                const minPrice = variants
                                  .filter((v) => String(v.color ?? "").trim() === color && asInt(v.availability, 0) > 0)
                                  .reduce<number | null>((acc, v) => {
                                    const p = Number(v.price ?? NaN);
                                    if (!Number.isFinite(p) || p <= 0) return acc;
                                    if (acc == null) return p;
                                    return Math.min(acc, p);
                                  }, null);
                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    disabled={!hasStock}
                                    onClick={() => setSelectedColor(color)}
                                    className={[
                                      "rounded-lg border px-3 py-2 text-left text-sm font-bold transition",
                                      active ? "border-primary bg-primary text-white" : "border-primary/70 bg-transparent text-primary hover:bg-primary/10",
                                      !hasStock ? "opacity-40" : "",
                                    ].join(" ")}
                                  >
                                    <span className="block">{color}</span>
                                    <span className={["block text-[11px] font-semibold", active ? "text-white/90" : "text-primary/80"].join(" ")}>
                                      từ {asMoneyVnd(minPrice)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}

                        {variantOptions.sizes.length > 0 ? (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                              Kích cỡ: <span className="text-primary">{selectedSize || "—"}</span>
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {variantOptions.sizes.map((size) => {
                                const hasStock = variants.some((v) => {
                                  const okSize = String(v.size ?? "").trim() === size;
                                  const okColor = selectedColor ? String(v.color ?? "").trim() === selectedColor : true;
                                  return okSize && okColor && asInt(v.availability, 0) > 0;
                                });
                                const active = size === selectedSize;
                                const minPrice = variants
                                  .filter((v) => {
                                    const okSize = String(v.size ?? "").trim() === size;
                                    const okColor = selectedColor ? String(v.color ?? "").trim() === selectedColor : true;
                                    return okSize && okColor && asInt(v.availability, 0) > 0;
                                  })
                                  .reduce<number | null>((acc, v) => {
                                    const p = Number(v.price ?? NaN);
                                    if (!Number.isFinite(p) || p <= 0) return acc;
                                    if (acc == null) return p;
                                    return Math.min(acc, p);
                                  }, null);
                                return (
                                  <button
                                    key={size}
                                    type="button"
                                    disabled={!hasStock}
                                    onClick={() => setSelectedSize(size)}
                                    className={[
                                      "rounded-lg border px-3 py-2 text-left text-sm font-bold transition",
                                      active ? "border-primary bg-primary text-white" : "border-primary/70 bg-transparent text-primary hover:bg-primary/10",
                                      !hasStock ? "opacity-40" : "",
                                    ].join(" ")}
                                  >
                                    <span className="block">{size}</span>
                                    <span className={["block text-[11px] font-semibold", active ? "text-white/90" : "text-primary/80"].join(" ")}>
                                      từ {asMoneyVnd(minPrice)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                        }}
                        className={[baseBtn, "bg-surface-container dark:bg-slate-800-high text-primary hover:bg-surface-container dark:bg-slate-800-highest"].join(" ")}
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
                        className={[baseBtn, "bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110"].join(" ")}
                      >
                        Xác nhận
                      </button>
                    </div>
                    <p className="text-xs font-medium text-on-surface-variant">
                      Nếu sản phẩm đã có trong giỏ, hệ thống sẽ tự tăng số lượng thêm 1.
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

