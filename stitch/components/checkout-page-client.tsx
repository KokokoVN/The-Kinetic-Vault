"use client";

import { useEffect, useMemo, useState } from "react";
import { listActiveVouchers, type Voucher } from "@/lib/sale-api";
import { StatusToast } from "@/components/status-toast";

type SelectedItem = {
  productId: number;
  variantId: number | null;
  quantity: number;
  subTotal: number;
  variantLabel: string | null;
  product: {
    id: number | null;
    sku: string | null;
    productName: string | null;
    primaryImageUrl: string | null;
    effectivePrice: number | string | null;
  };
};

type UserAddress = {
  id?: number | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  districtCode?: string | null;
  districtName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
  streetLine?: string | null;
  fullAddress?: string | null;
  phoneNumber?: string | null;
  isDefault?: boolean | null;
};

type VnAddressOption = {
  code: string;
  name: string;
};

type AddressForm = {
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  streetLine: string;
  fullAddress: string;
  phoneNumber: string;
};

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function asMoneyVnd(raw: number): string {
  const n = Number(raw ?? 0);
  if (!Number.isFinite(n)) return "—";
  return `${n.toLocaleString("vi-VN")} VND`;
}

function resolveCartImage(raw?: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  const inferredOrigin = /^https?:\/\//i.test(apiBase) ? apiBase.replace(/\/+$/, "").replace(/\/api\/?$/i, "") : "";
  const origin = (inferredOrigin || "http://localhost:8900").replace(/\/+$/, "");
  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/api/catalog/admin/products/images/file/${encodeURIComponent(v)}`;
}

function asText(v: unknown): string {
  const s = String(v ?? "").trim();
  return s;
}

const FALLBACK_IMG =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#eef2f7"/>
      <path d="M30 115l28-30 20 21 14-14 38 43H30z" fill="#cbd5e1"/>
      <circle cx="62" cy="62" r="10" fill="#cbd5e1"/>
    </svg>`
  );

function normalizePhoneInput(raw: string): string {
  const digits = String(raw ?? "").replace(/\D+/g, "");
  if (!digits) return "";
  if (!digits.startsWith("0")) return "0";
  return digits.slice(0, 10);
}

function composeFullAddress(form: Pick<AddressForm, "streetLine" | "wardName" | "provinceName">): string {
  return [asText(form.streetLine), asText(form.wardName), asText(form.provinceName)].filter(Boolean).join(", ");
}

async function purgePurchasedItemsFromCart(items: SelectedItem[]): Promise<void> {
  const targets = Array.isArray(items) ? items : [];
  for (const row of targets) {
    const productId = Number(row?.productId ?? 0);
    if (!Number.isFinite(productId) || productId <= 0) continue;
    const params = new URLSearchParams({ productId: String(Math.floor(productId)) });
    const variantId = Number(row?.variantId ?? 0);
    if (Number.isFinite(variantId) && variantId > 0) {
      params.set("variantId", String(Math.floor(variantId)));
    }
    try {
      await fetch(`/api/cart?${params.toString()}`, {
        method: "DELETE",
        cache: "no-store",
      });
    } catch {
      // Keep checkout success path even if cart clean-up fails.
    }
  }
}

export function CheckoutPageClient() {
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "sepay_qr">("cod");
  const [sepayQr, setSepayQr] = useState<{ qrImageUrl: string; code: string; paymentId: number; orderId: number; orderNumber?: string | null } | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [openAddressForm, setOpenAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  const [toast, setToast] = useState<{ id: number; tone: "success" | "error" | "warning" | "info"; title: string; message: string } | null>(null);

  function showToast(tone: "success" | "error" | "warning" | "info", title: string, message: string) {
    setToast({ id: Date.now(), tone, title, message });
  }
  const [addressForm, setAddressForm] = useState<AddressForm>({
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
    streetLine: "",
    fullAddress: "",
    phoneNumber: "",
  });
  const [provinceOptions, setProvinceOptions] = useState<VnAddressOption[]>([]);
  const [wardOptions, setWardOptions] = useState<VnAddressOption[]>([]);
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);
  const [paying, setPaying] = useState(false);

  /* ── Voucher popup ── */
  const [voucherPopupOpen, setVoucherPopupOpen] = useState(false);
  const [voucherList, setVoucherList] = useState<Voucher[]>([]);
  const [userVoucherUsage, setUserVoucherUsage] = useState<Record<string, number>>({});
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);

  useEffect(() => {
    const picked = safeJsonParse<SelectedItem[]>(window.sessionStorage.getItem("checkout:selectedItems"), []);
    setItems(Array.isArray(picked) ? picked : []);
    // Dọn dữ liệu địa chỉ giả cũ từng lưu trên trình duyệt.
    window.localStorage.removeItem("checkout:addressBook");
  }, []);

  const userAddress = useMemo(() => {
    if (!addresses.length) return null;
    if (selectedAddressId == null) {
      return addresses.find((a) => Boolean(a?.isDefault)) ?? addresses[0] ?? null;
    }
    return addresses.find((a) => Number(a?.id) === selectedAddressId) ?? null;
  }, [addresses, selectedAddressId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingAddress(true);
      try {
        const res = await fetch("/api/me/addresses", { cache: "no-store" });
        if (!res.ok) {
          setAddresses([]);
          setSelectedAddressId(null);
          return;
        }
        const data = (await res.json().catch(() => null)) as { addresses?: UserAddress[] | null };
        if (!cancelled) {
          const list = Array.isArray(data?.addresses) ? data.addresses : [];
          setAddresses(list);
          const defaultAddress = list.find((a) => Boolean(a?.isDefault)) ?? list[0] ?? null;
          const nextSelectedId = defaultAddress?.id != null ? Number(defaultAddress.id) : null;
          setSelectedAddressId(nextSelectedId);
          setEditingAddressId(null);
          setAddressForm({
            provinceCode: asText(defaultAddress?.provinceCode),
            provinceName: asText(defaultAddress?.provinceName),
            wardCode: asText(defaultAddress?.wardCode),
            wardName: asText(defaultAddress?.wardName),
            streetLine: asText(defaultAddress?.streetLine),
            fullAddress: asText(defaultAddress?.fullAddress),
            phoneNumber: asText(defaultAddress?.phoneNumber),
          });
        }
      } catch {
        if (!cancelled) {
          setAddresses([]);
          setSelectedAddressId(null);
        }
      } finally {
        if (!cancelled) setLoadingAddress(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reloadAddress() {
    setLoadingAddress(true);
    try {
      const res = await fetch("/api/me/addresses", { cache: "no-store" });
      if (!res.ok) {
        setAddresses([]);
        setSelectedAddressId(null);
        return;
      }
      const data = (await res.json().catch(() => null)) as { addresses?: UserAddress[] | null };
      const list = Array.isArray(data?.addresses) ? data.addresses : [];
      setAddresses(list);
      const defaultAddress = list.find((a) => Boolean(a?.isDefault)) ?? list[0] ?? null;
      if (defaultAddress?.id != null) setSelectedAddressId(Number(defaultAddress.id));
      else setSelectedAddressId(null);
      setAddressForm({
        provinceCode: asText(defaultAddress?.provinceCode),
        provinceName: asText(defaultAddress?.provinceName),
        wardCode: asText(defaultAddress?.wardCode),
        wardName: asText(defaultAddress?.wardName),
        streetLine: asText(defaultAddress?.streetLine),
        fullAddress: asText(defaultAddress?.fullAddress),
        phoneNumber: asText(defaultAddress?.phoneNumber),
      });
    } catch {
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setLoadingAddress(false);
    }
  }

  async function saveAddress() {
    setSavingAddress(true);
    try {
      if (!addressForm.provinceCode || !addressForm.wardCode) {
        showToast("error", "Lỗi", "Vui lòng chọn đầy đủ Tỉnh/Thành và Phường/Xã.");
        return;
      }
      const phoneNorm = normalizePhoneInput(addressForm.phoneNumber);
      if (phoneNorm.length > 0 && (phoneNorm.length !== 10 || !phoneNorm.startsWith("0"))) {
        showToast("error", "Lỗi", "Số điện thoại phải bắt đầu bằng 0 và đúng 10 chữ số (hoặc để trống để xóa).");
        return;
      }
      const isEdit = editingAddressId != null;
      // Không gửi/lưu code (mã). Chỉ lưu theo tên địa chỉ.
      const payload = {
        provinceName: addressForm.provinceName,
        wardName: addressForm.wardName,
        streetLine: addressForm.streetLine,
        fullAddress: addressForm.fullAddress,
        phoneNumber: phoneNorm.length ? phoneNorm : null,
        isDefault: selectedAddressId == null && !isEdit,
      };
      const res = await fetch(isEdit ? `/api/me/addresses/${editingAddressId}` : "/api/me/addresses", {
        method: isEdit ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        showToast("error", "Lỗi", txt || "Không lưu được địa chỉ.");
        return;
      }
      await reloadAddress();
      setOpenAddressForm(false);
      showToast("success", "Thành công", editingAddressId != null ? "Cập nhật địa chỉ thành công." : "Thêm địa chỉ thành công.");
    } catch {
      showToast("error", "Lỗi", "Không kết nối được tới dịch vụ địa chỉ.");
    } finally {
      setSavingAddress(false);
    }
  }

  function startAddAddress() {
    setEditingAddressId(null);
    setAddressForm({
      provinceCode: "",
      provinceName: "",
      wardCode: "",
      wardName: "",
      streetLine: "",
      fullAddress: "",
      phoneNumber: "",
    });
    setOpenAddressForm(true);
  }

  function startEditAddress() {
    if (!userAddress?.id) return;
    setEditingAddressId(Number(userAddress.id));
    setAddressForm({
      provinceCode: asText(userAddress.provinceCode),
      provinceName: asText(userAddress.provinceName),
      wardCode: asText(userAddress.wardCode),
      wardName: asText(userAddress.wardName),
      streetLine: asText(userAddress.streetLine),
      fullAddress: asText(userAddress.fullAddress),
      phoneNumber: asText(userAddress.phoneNumber),
    });
    setOpenAddressForm(true);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadProvinces() {
      setLoadingProvince(true);
      try {
        const res = await fetch("/api/vn-address?type=provinces", { cache: "force-cache" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as { rows?: VnAddressOption[] };
        if (!cancelled) setProvinceOptions(Array.isArray(data?.rows) ? data.rows : []);
      } finally {
        if (!cancelled) setLoadingProvince(false);
      }
    }
    void loadProvinces();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadWards() {
      if (!addressForm.provinceCode) {
        setWardOptions([]);
        return;
      }
      setLoadingWard(true);
      try {
        const res = await fetch(`/api/vn-address?type=wards&provinceCode=${encodeURIComponent(addressForm.provinceCode)}`, { cache: "force-cache" });
        if (!res.ok) return;
        const data = (await res.json().catch(() => null)) as { rows?: VnAddressOption[] };
        if (!cancelled) setWardOptions(Array.isArray(data?.rows) ? data.rows : []);
      } finally {
        if (!cancelled) setLoadingWard(false);
      }
    }
    void loadWards();
    return () => {
      cancelled = true;
    };
  }, [addressForm.provinceCode]);

  useEffect(() => {
    setAddressForm((prev) => ({
      ...prev,
      fullAddress: composeFullAddress(prev),
    }));
  }, [addressForm.streetLine, addressForm.wardName, addressForm.provinceName]);

  async function removeAddress() {
    if (selectedAddressId == null) return;
    setSavingAddress(true);
    try {
      const res = await fetch(`/api/me/addresses/${selectedAddressId}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok && res.status !== 404) {
        const txt = await res.text().catch(() => "");
        showToast("error", "Lỗi", txt || "Không xóa được địa chỉ.");
        return;
      }
      await reloadAddress();
      setOpenAddressForm(false);
      showToast("success", "Thành công", "Xóa địa chỉ thành công.");
    } catch {
      showToast("error", "Lỗi", "Không kết nối được tới dịch vụ địa chỉ.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function setAddressDefault() {
    if (selectedAddressId == null) return;
    setSavingAddress(true);
    try {
      const res = await fetch(`/api/me/addresses/${selectedAddressId}`, { method: "PATCH", cache: "no-store" });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        showToast("error", "Lỗi", txt || "Không đặt được địa chỉ mặc định.");
        return;
      }
      await reloadAddress();
      showToast("success", "Thành công", "Đã đặt địa chỉ mặc định thành công.");
    } catch {
      showToast("error", "Lỗi", "Không kết nối được tới dịch vụ địa chỉ.");
    } finally {
      setSavingAddress(false);
    }
  }

  const computedItems = useMemo(() => {
    return items.map(it => {
      const ep = Number(it.product?.effectivePrice);
      const origUnitPrice = it.quantity > 0 ? it.subTotal / it.quantity : 0;
      const computedUnitPrice = ep > 0 ? ep : origUnitPrice;
      const computedSubTotal = computedUnitPrice * it.quantity;
      return { ...it, computedUnitPrice, computedSubTotal };
    });
  }, [items]);

  const subTotal = useMemo(() => computedItems.reduce((sum, it) => sum + it.computedSubTotal, 0), [computedItems]);
  const totalQty = useMemo(() => computedItems.reduce((sum, it) => sum + Math.max(0, Math.floor(Number(it.quantity ?? 0))), 0), [computedItems]);

  const appliedVoucher = useMemo(() => {
    return voucherList.find(v => v.code === appliedVoucherCode) || null;
  }, [voucherList, appliedVoucherCode]);

  const voucherDiscountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.minOrderAmount != null && subTotal < appliedVoucher.minOrderAmount) return 0;
    
    let discount = 0;
    if (appliedVoucher.discountType === "PERCENT") {
      discount = (subTotal * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscountAmount != null && appliedVoucher.maxDiscountAmount > 0) {
        discount = Math.min(discount, appliedVoucher.maxDiscountAmount);
      }
    } else {
      discount = appliedVoucher.discountValue;
    }
    return Math.floor(discount);
  }, [appliedVoucher, subTotal]);

  const finalTotal = Math.max(0, subTotal - voucherDiscountAmount);

  function shippingAddressForOrder(): string {
    const full = asText(userAddress?.fullAddress);
    if (full) return full;
    const parts = [
      asText(userAddress?.streetLine),
      [asText(userAddress?.wardName), asText(userAddress?.provinceName)].filter(Boolean).join(", "),
    ].filter(Boolean);
    return parts.join("\n");
  }

  /** SĐT của địa chỉ đang chọn để ghép vào đơn (MVD / liên lạc). */
  function contactPhoneForOrder(): string {
    const p = normalizePhoneInput(asText(userAddress?.phoneNumber));
    return p.length === 10 && p.startsWith("0") ? p : "";
  }

  async function createCodOrder() {
    setPaying(true);
    setSepayQr(null);
    try {
      const phoneDigits = contactPhoneForOrder();
      if (!phoneDigits) {
        showToast("error", "Lỗi thanh toán", "Vui lòng chọn địa chỉ có số điện thoại nhận hàng hợp lệ (10 số, bắt đầu bằng 0). Bạn có thể Sửa địa chỉ để cập nhật SĐT.");
        setPaying(false);
        return;
      }
      const shippingAddress = shippingAddressForOrder();
      const res = await fetch("/api/orders/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          phoneNumber: phoneDigits,
          paymentMethod: "COD",
          voucherCode: appliedVoucherCode,
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            variantId: it.variantId,
            variantLabel: it.variantLabel,
          })),
        }),
        cache: "no-store",
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        showToast("error", "Lỗi thanh toán", txt || `Không tạo được đơn COD (HTTP ${res.status}).`);
        return;
      }
      const data = (await res.json().catch(() => null)) as { id?: number | null; orderNumber?: string | null };
      await purgePurchasedItemsFromCart(items);
      const q = new URLSearchParams();
      if (data?.id != null) q.set("orderId", String(data.id));
      if (data?.orderNumber) q.set("orderNumber", String(data.orderNumber));
      window.location.href = `/checkout/success${q.toString() ? `?${q.toString()}` : ""}`;
    } catch {
      showToast("error", "Lỗi thanh toán", "Không kết nối được tới hệ thống đặt hàng COD.");
    } finally {
      setPaying(false);
    }
  }

  async function startSepayQr() {
    setPaying(true);
    setSepayQr(null);
    try {
      const phoneDigits = contactPhoneForOrder();
      if (!phoneDigits) {
        showToast("error", "Lỗi thanh toán", "Vui lòng chọn địa chỉ có số điện thoại nhận hàng hợp lệ (10 số, bắt đầu bằng 0). Bạn có thể Sửa địa chỉ để cập nhật SĐT.");
        setPaying(false);
        return;
      }
      const shippingAddress = shippingAddressForOrder();
      const orderRes = await fetch("/api/orders/manual", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          phoneNumber: phoneDigits,
          paymentMethod: "SEPAY",
          voucherCode: appliedVoucherCode,
          items: items.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            variantId: it.variantId,
            variantLabel: it.variantLabel,
          })),
        }),
        cache: "no-store",
      });
      if (!orderRes.ok) {
        const txt = await orderRes.text().catch(() => "");
        showToast("error", "Lỗi thanh toán", txt || `Không tạo được đơn SePay (HTTP ${orderRes.status}).`);
        return;
      }
      const createdOrder = (await orderRes.json().catch(() => null)) as { id?: number | null; orderNumber?: string | null } | null;
      const orderId = Number(createdOrder?.id ?? 0);
      if (!Number.isFinite(orderId) || orderId <= 0) {
        showToast("error", "Lỗi thanh toán", "Không nhận được orderId để thanh toán SePay.");
        return;
      }

      const payRes = await fetch("/api/payments/sepay/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          orderId,
          orderNumber: createdOrder?.orderNumber ?? null,
          amountVnd: finalTotal,
        }),
      });
      if (!payRes.ok) {
        const txt = await payRes.text().catch(() => "");
        showToast("error", "Lỗi thanh toán", txt || `Không tạo được QR SePay (HTTP ${payRes.status}).`);
        return;
      }
      const data = (await payRes.json().catch(() => null)) as any;
      const qrImageUrl = String(data?.qrImageUrl ?? "").trim();
      const code = String(data?.code ?? "").trim();
      const paymentId = Number(data?.paymentId ?? 0);
      if (!qrImageUrl || !code || !Number.isFinite(paymentId) || paymentId <= 0) {
        showToast("error", "Lỗi thanh toán", "Dữ liệu QR SePay không hợp lệ.");
        return;
      }
      setSepayQr({ qrImageUrl, code, paymentId: Math.floor(paymentId), orderId, orderNumber: createdOrder?.orderNumber ?? null });
    } catch {
      showToast("error", "Lỗi thanh toán", "Không kết nối được tới hệ thống thanh toán SePay.");
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!sepayQr?.paymentId) return;
    const id = sepayQr.paymentId;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/payments/sepay/status?paymentId=${encodeURIComponent(String(id))}`, { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json().catch(() => null)) as any;
        const status = String(json?.status ?? "").toUpperCase();
        if (status === "COMPLETED") {
          cancelled = true;
          window.clearInterval(timer);
          try {
            await purgePurchasedItemsFromCart(items);
          } catch {
            // ignore
          }
          try {
            const oid = Number(sepayQr.orderId ?? 0);
            if (Number.isFinite(oid) && oid > 0) {
              await fetch("/api/payments/reconcile-order", {
                method: "POST",
                headers: { "content-type": "application/json" },
                cache: "no-store",
                body: JSON.stringify({ orderId: oid }),
              });
            }
          } catch {
            // success page reconciles again
          }
          const q = new URLSearchParams();
          q.set("orderId", String(sepayQr.orderId));
          if (sepayQr.orderNumber) q.set("orderNumber", String(sepayQr.orderNumber));
          window.location.href = `/checkout/success?${q.toString()}`;
        }
      } catch {
        // ignore
      }
    }, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sepayQr?.paymentId]);

  
  return (
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-white font-body selection:bg-indigo-200 dark:selection:bg-indigo-900 min-h-screen">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Thanh toán an toàn</h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">lock</span> Bảo mật 100%</p>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          
          {/* CỘT TRÁI (MAIN) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. SẢN PHẨM */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 p-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <span className="material-symbols-outlined font-bold">shopping_bag</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold">Sản phẩm trong đơn hàng</h2>
                  <p className="text-xs font-medium text-slate-500">{totalQty.toLocaleString("vi-VN")} sản phẩm</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {computedItems.length === 0 ? (
                  <p className="text-sm font-medium text-slate-500 text-center py-4">Chưa có sản phẩm được chọn từ giỏ hàng.</p>
                ) : (
                  computedItems.map((it, idx) => (
                    <div key={`${it.productId}:${it.variantId ?? ""}:${idx}`} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white">
                        {resolveCartImage(it.product?.primaryImageUrl) ? (
                          <img
                            className="h-full w-full object-cover"
                            src={resolveCartImage(it.product?.primaryImageUrl) ?? FALLBACK_IMG}
                            alt={it.product?.productName ?? "Sản phẩm"}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p className="truncate text-base font-bold text-slate-900 dark:text-white">{it.product?.productName ?? `Sản phẩm #${it.productId}`}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{it.variantLabel ?? it.product?.sku ?? "—"}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-flex h-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                            SL: {it.quantity}
                          </span>
                          <div className="text-right">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-base">{asMoneyVnd(it.computedSubTotal)}</span>
                            {it.computedUnitPrice < (it.quantity > 0 ? it.subTotal / it.quantity : 0) && (
                              <p className="text-xs text-slate-400 line-through">{asMoneyVnd(it.subTotal)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* 2. ĐỊA CHỈ */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                    <span className="material-symbols-outlined font-bold">local_shipping</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-lg font-bold">Giao hàng tới</h2>
                    <p className="text-xs font-medium text-slate-500">Thông tin người nhận</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                {userAddress ? (
                  <div 
                    onClick={() => setOpenAddressForm(true)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-900 p-5 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md"
                  >
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Thay đổi</span>
                      <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">chevron_right</span>
                    </div>
                    
                    <div className="flex items-start gap-4 pr-16">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                        <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">Khách hàng</span>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{asText(userAddress.phoneNumber) || "—"}</span>
                          {userAddress.isDefault && (
                            <span className="ml-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Mặc định</span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {asText(userAddress.fullAddress) || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setOpenAddressForm(true)}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-2xl">add_location_alt</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Chưa có địa chỉ giao hàng</p>
                    <p className="mt-1 text-xs text-slate-500">Nhấn vào đây để thêm địa chỉ mới</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. PHƯƠNG THỨC THANH TOÁN */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/20 p-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined font-bold">payments</span>
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold">Phương thức thanh toán</h2>
                  <p className="text-xs font-medium text-slate-500">Bảo mật &amp; an toàn</p>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="group relative cursor-pointer">
                    <input className="peer sr-only" name="payment" type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                    <div className="flex items-start gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/30 dark:peer-checked:bg-indigo-900/10">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-indigo-600">
                        <div className={`h-2.5 w-2.5 rounded-full bg-indigo-600 transition-opacity ${paymentMethod === "cod" ? "opacity-100" : "opacity-0"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">Thanh toán khi nhận hàng</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Phí thu hộ: Miễn phí</p>
                      </div>
                      <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-indigo-500 peer-checked:text-indigo-600">money</span>
                    </div>
                  </label>
                  
                  <label className="group relative cursor-pointer">
                    <input className="peer sr-only" name="payment" type="radio" checked={paymentMethod === "sepay_qr"} onChange={() => setPaymentMethod("sepay_qr")} />
                    <div className="flex items-start gap-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 peer-checked:border-indigo-600 peer-checked:bg-indigo-50/30 dark:peer-checked:bg-indigo-900/10">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 peer-checked:border-indigo-600">
                        <div className={`h-2.5 w-2.5 rounded-full bg-indigo-600 transition-opacity ${paymentMethod === "sepay_qr" ? "opacity-100" : "opacity-0"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">Chuyển khoản QR (SePay)</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tự động xác nhận 24/7</p>
                      </div>
                      <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-indigo-500 peer-checked:text-indigo-600">qr_code_scanner</span>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (SIDEBAR) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[90px]">
            {/* VOUCHER & SUMMARY */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-900/5 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-headline text-lg font-bold">Mã giảm giá</h3>
                <button
                  type="button"
                  onClick={async () => {
                    setVoucherPopupOpen(true);
                    if (voucherList.length === 0) {
                      setLoadingVouchers(true);
                      try {
                        const [vouchers, usageRes] = await Promise.all([
                          listActiveVouchers(),
                          fetch("/api/me/vouchers/usage", { cache: "no-store" })
                        ]);
                        setVoucherList(vouchers);
                        if (usageRes.ok) {
                          const usageMap = await usageRes.json();
                          setUserVoucherUsage(usageMap || {});
                        }
                      } catch { /* ignore */ }
                      finally { setLoadingVouchers(false); }
                    } else {
                      try {
                        const usageRes = await fetch("/api/me/vouchers/usage", { cache: "no-store" });
                        if (usageRes.ok) setUserVoucherUsage((await usageRes.json()) || {});
                      } catch {}
                    }
                  }}
                  className={`mt-4 group relative flex w-full items-center justify-between overflow-hidden rounded-xl border-2 transition-all p-4 ${appliedVoucherCode ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-indigo-100 dark:border-indigo-900/40 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-600/60 hover:shadow-sm"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${appliedVoucherCode ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"}`}>
                      <span className="material-symbols-outlined text-xl transition-transform group-hover:scale-110">local_activity</span>
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${appliedVoucherCode ? "text-emerald-700 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                        {appliedVoucherCode ? "Đã áp dụng mã" : "Chọn mã giảm giá"}
                      </p>
                      <p className={`text-xs font-semibold ${appliedVoucherCode ? "text-emerald-600 dark:text-emerald-500" : "text-slate-500 dark:text-slate-400"}`}>
                        {appliedVoucherCode ? appliedVoucherCode : "Bấm để chọn mã"}
                      </p>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined transition-transform group-hover:translate-x-1 ${appliedVoucherCode ? "text-emerald-500" : "text-slate-400"}`}>
                    {appliedVoucherCode ? "check_circle" : "chevron_right"}
                  </span>
                </button>
              </div>
              
              <div className="p-5 space-y-4 text-sm font-medium">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tổng tiền hàng ({totalQty})</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{asMoneyVnd(subTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Miễn phí</span>
                </div>
                {appliedVoucherCode && voucherDiscountAmount > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Voucher giảm giá</span>
                    <span className="font-bold text-emerald-600">-{asMoneyVnd(voucherDiscountAmount)}</span>
                  </div>
                )}
                
                <div className="my-2 border-t border-dashed border-slate-200 dark:border-slate-700" />
                
                <div className="flex items-end justify-between">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Tổng thanh toán</span>
                  <div className="text-right">
                    {appliedVoucherCode && voucherDiscountAmount > 0 && (
                      <p className="text-xs text-slate-400 line-through mb-0.5">{asMoneyVnd(subTotal)}</p>
                    )}
                    <span className="font-headline text-3xl font-black text-indigo-600 dark:text-indigo-400">{asMoneyVnd(finalTotal)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    if (paymentMethod === "cod") { void createCodOrder(); return; }
                    void startSepayQr();
                  }}
                  disabled={paying || finalTotal < 0 || !userAddress}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {paying ? (
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  )}
                  {paymentMethod === "cod"
                    ? paying ? "Đang xử lý..." : "Đặt hàng ngay (COD)"
                    : sepayQr ? "Đang chờ thanh toán..." : paying ? "Đang tạo mã QR..." : "Thanh toán (SePay)"}
                </button>
                {!userAddress && (
                  <p className="text-center mt-3 text-xs font-medium text-rose-500">Vui lòng chọn địa chỉ để tiếp tục.</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-6">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">verified_user</span>
              Thông tin được bảo mật mã hóa SSL
            </div>
          </div>
        </div>
      </main>

      {/* MODAL / BOTTOM SHEET ADDRESS MANAGEMENT */}
      {openAddressForm && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:items-center sm:justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setOpenAddressForm(false)}>
          <div 
            className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-headline text-xl font-bold text-slate-900 dark:text-white">
                {editingAddressId != null ? "Cập nhật địa chỉ" : addresses.length === 0 || addressForm.provinceCode || (editingAddressId === null && addressForm.phoneNumber === '') ? "Thêm địa chỉ mới" : "Chọn địa chỉ giao hàng"}
              </h3>
              <button type="button" onClick={() => setOpenAddressForm(false)} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Nếu đang trong chế độ CHỌN ĐỊA CHỈ */}
              {addresses.length > 0 && editingAddressId == null && !addressForm.provinceCode && (
                <div className="space-y-4 mb-6">
                  {addresses.map((addr) => {
                    const id = addr?.id != null ? Number(addr.id) : null;
                    const active = id != null && id === selectedAddressId;
                    return (
                      <div key={id ?? `${addr.fullAddress}`} className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer ${active ? "border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700"}`} onClick={() => { if (id != null) { setSelectedAddressId(id); setOpenAddressForm(false); } }}>
                        {active && <div className="absolute top-4 right-4 h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center"><span className="material-symbols-outlined text-[14px]">check</span></div>}
                        <div className="pr-10">
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Khách hàng <span className="text-slate-300">|</span> {asText(addr.phoneNumber) || "—"}
                            {addr.isDefault && <span className="ml-1 rounded px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400">Mặc định</span>}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{asText(addr.fullAddress) || "—"}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <button type="button" onClick={(e) => { e.stopPropagation(); if (id) { setEditingAddressId(id); setAddressForm({ provinceCode: asText(addr.provinceCode), provinceName: asText(addr.provinceName), wardCode: asText(addr.wardCode), wardName: asText(addr.wardName), streetLine: asText(addr.streetLine), fullAddress: asText(addr.fullAddress), phoneNumber: asText(addr.phoneNumber) }); } }} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide">Sửa</button>
                          {!active && (
                            <button type="button" onClick={async (e) => { e.stopPropagation(); if (id) { setSelectedAddressId(id); await removeAddress(); } }} className="text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wide">Xóa</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <button type="button" onClick={() => startAddAddress()} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Thêm địa chỉ mới
                  </button>
                </div>
              )}

              {/* FORM THÊM / SỬA */}
              {(addresses.length === 0 || editingAddressId != null || addressForm.provinceCode || (editingAddressId === null && addressForm.phoneNumber === '')) && (
                <div className="space-y-5 animate-in fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-widest">Tỉnh / Thành phố <span className="text-rose-500">*</span></label>
                      <select value={addressForm.provinceCode} onChange={(e) => { const code = e.target.value; const selected = provinceOptions.find((x) => x.code === code); setAddressForm((prev) => ({ ...prev, provinceCode: code, provinceName: selected?.name ?? "", wardCode: "", wardName: "" })); }} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all">
                        <option value="">{loadingProvince ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                        {provinceOptions.map((row) => <option key={row.code} value={row.code}>{row.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-widest">Phường / Xã <span className="text-rose-500">*</span></label>
                      <select value={addressForm.wardCode} onChange={(e) => { const code = e.target.value; const selected = wardOptions.find((x) => x.code === code); setAddressForm((prev) => ({ ...prev, wardCode: code, wardName: selected?.name ?? "" })); }} disabled={!addressForm.provinceCode} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                        <option value="">{loadingWard ? "Đang tải..." : "Chọn phường/xã"}</option>
                        {wardOptions.map((row) => <option key={row.code} value={row.code}>{row.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-widest">Số nhà, Tên đường</label>
                    <input value={addressForm.streetLine} onChange={(e) => setAddressForm({ ...addressForm, streetLine: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="Ví dụ: 123 Đường ABC" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-widest">Số điện thoại nhận hàng <span className="text-rose-500">*</span></label>
                    <input value={addressForm.phoneNumber} onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: normalizePhoneInput(e.target.value) })} inputMode="numeric" pattern="0[0-9]{9}" maxLength={10} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold tracking-wider outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="0xxxxxxxxx" />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => { setEditingAddressId(null); setAddressForm({ provinceCode: "", provinceName: "", wardCode: "", wardName: "", streetLine: "", fullAddress: "", phoneNumber: "" }); }} className="flex-1 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Quay lại
                      </button>
                    )}
                    <button type="button" onClick={saveAddress} disabled={savingAddress || !addressForm.provinceCode || !addressForm.wardCode || addressForm.phoneNumber.length !== 10} className="flex-1 sm:flex-[2] py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VOUCHER POPUP */}
      {voucherPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={() => setVoucherPopupOpen(false)}>
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 p-5">
              <h3 className="font-headline text-xl font-bold">Chọn Voucher</h3>
              <button type="button" onClick={() => setVoucherPopupOpen(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {loadingVouchers ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">progress_activity</span>
                  <p className="mt-4 text-sm font-medium text-slate-500">Đang tải danh sách voucher...</p>
                </div>
              ) : voucherList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700">confirmation_number</span>
                  <p className="mt-4 text-sm font-medium text-slate-500">Hiện không có voucher nào đang hoạt động.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {voucherList.map((v) => {
                    const isApplied = appliedVoucherCode === v.code;
                    const isPercent = v.discountType === "PERCENT";
                    const discountLabel = isPercent ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString("vi-VN")}đ`;
                    const hasMinOrder = v.minOrderAmount != null && v.minOrderAmount > 0;
                    const meetsMinOrder = !hasMinOrder || subTotal >= (v.minOrderAmount ?? 0);
                    const expiresAt = v.expiresAt ? new Date(v.expiresAt) : null;
                    const remainingUses = v.maxUsage != null ? v.maxUsage - v.usageCount : null;

                    const userUses = userVoucherUsage[v.code] || 0;
                    const maxUsesUser = v.maxUsagePerUser ?? 1;
                    const isExhaustedUser = userUses >= maxUsesUser;

                    return (
                      <div key={v.id} className={`group relative overflow-hidden rounded-xl border-2 transition-all ${isExhaustedUser ? "border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 grayscale opacity-50 cursor-not-allowed" : isApplied ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-md" : meetsMinOrder ? "border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm" : "border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 opacity-60"}`}>
                        <div className="flex items-stretch">
                          <div className={`flex w-24 flex-shrink-0 flex-col items-center justify-center border-r border-dashed p-3 ${isApplied ? "border-emerald-500/20 bg-emerald-500/10" : "border-slate-200 dark:border-slate-700/50 bg-slate-50/60 dark:bg-slate-800/60"}`}>
                            <span className={`material-symbols-outlined text-2xl ${isApplied ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}`}>sell</span>
                            <span className={`mt-1 text-lg font-black ${isApplied ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}`}>{discountLabel}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">giảm</span>
                          </div>

                          <div className="flex flex-1 flex-col justify-between p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-black tracking-wider text-slate-800 dark:text-white">{v.code}</span>
                                {isApplied && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                    <span className="material-symbols-outlined text-[12px]">check</span> Đang dùng
                                  </span>
                                )}
                              </div>
                              {v.description && <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-2">{v.description}</p>}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
                              {hasMinOrder && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">shopping_cart</span>Đơn tối thiểu {Number(v.minOrderAmount).toLocaleString("vi-VN")}đ</span>}
                              {isPercent && v.maxDiscountAmount != null && v.maxDiscountAmount > 0 && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">arrow_downward</span>Giảm tối đa {Number(v.maxDiscountAmount).toLocaleString("vi-VN")}đ</span>}
                              {expiresAt && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">schedule</span>HSD: {expiresAt.toLocaleDateString("vi-VN")}</span>}
                              {remainingUses != null && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">inventory</span>Còn {remainingUses} lượt</span>}
                            </div>
                          </div>

                          <div className="flex items-center pr-4">
                            {isApplied ? (
                              <button type="button" onClick={() => setAppliedVoucherCode(null)} className="rounded-lg border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/40">Bỏ chọn</button>
                            ) : isExhaustedUser ? (
                              <button type="button" disabled className="rounded-lg bg-slate-200 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed">Đã dùng</button>
                            ) : (
                              <button type="button" disabled={!meetsMinOrder} onClick={async () => {
                                try {
                                  const res = await fetch('/api/sales/vouchers/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: v.code, orderAmount: subTotal }) });
                                  const data = await res.json();
                                  if (data.valid) { setAppliedVoucherCode(v.code); setVoucherPopupOpen(false); showToast("success", "Thành công", "Áp dụng voucher thành công."); }
                                  else { showToast("error", "Lỗi voucher", data.message || "Voucher không hợp lệ hoặc đã dùng hết lượt."); }
                                } catch { showToast("error", "Lỗi", "Không thể kiểm tra voucher."); }
                              }} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Áp dụng</button>
                            )}
                          </div>
                        </div>
                        {!meetsMinOrder && !isExhaustedUser && <div className="border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">⚠️ Đơn hàng chưa đạt giá trị tối thiểu {Number(v.minOrderAmount).toLocaleString("vi-VN")}đ</div>}
                        {isExhaustedUser && <div className="border-t border-error/10 bg-error-container/20 px-4 py-2 text-[11px] font-medium text-error">⚠️ Bạn đã hết lượt sử dụng voucher này ({userUses}/{maxUsesUser} lượt)</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEPAY QR MODAL */}
      {sepayQr && paymentMethod === "sepay_qr" ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">Thanh toán qua SePay QR</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Quét QR và giữ nguyên popup này, hệ thống sẽ tự xác nhận.</p>
              </div>
              <button type="button" onClick={() => setSepayQr(null)} className="rounded-full p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-6 flex flex-col justify-center items-center text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Mã thanh toán</p>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl shadow-sm mb-4">
                  <p className="font-mono text-3xl font-black text-indigo-600 dark:text-indigo-400">{sepayQr.code}</p>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Ghi đúng mã này trong nội dung chuyển khoản để hệ thống xác nhận tự động.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-6 flex items-center justify-center">
                <img
                  src={sepayQr.qrImageUrl}
                  alt="SePay QR"
                  className="mx-auto w-full max-w-[280px] rounded-xl bg-white p-3 shadow-lg cursor-pointer transition hover:scale-105"
                  loading="lazy"
                  title="Click vào QR để giả lập thanh toán thành công (Dành cho Dev)"
                  onClick={async () => {
                    if (!confirm("Bạn có muốn giả lập thanh toán thành công cho mã " + sepayQr.code + "?")) return;
                    try {
                      await fetch("/api/payments/sepay/webhook", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": "sepay_webhook_9f3a2c1f7e8b4a6c" },
                        body: JSON.stringify({ code: sepayQr.code, transferType: "in", transferAmount: finalTotal, referenceCode: "TEST_UI_CLICK" })
                      });
                    } catch (err) { console.error("Test webhook failed", err); }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* TOAST */}
      {toast ? <StatusToast key={toast.id} tone={toast.tone} title={toast.title} message={toast.message} /> : null}
    </div>
  );
}
