import { apiUrl, adminCatalogHeaders, parseJsonSafe, parseProductApiError } from "./api";

// ======================== Sale Program API ========================

export type SaleProgramItem = {
  id?: number;
  productId: number;
  variantId?: number | null;
  promoQtyLimit?: number | null;
};

export type SaleProgram = {
  id: number;
  name: string;
  description?: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  startAt: string;
  endAt: string;
  active: boolean;
  items: SaleProgramItem[];
};

export type SaleProgramRequest = Omit<SaleProgram, "id" | "items"> & {
  items: SaleProgramItem[];
  sendEmailNotification?: boolean;
};

export async function listAdminSalePrograms(
  options?: { accessToken?: string | null }
): Promise<SaleProgram[]> {
  try {
    const res = await fetch(apiUrl("/sales/admin/sales/programs"), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return [];
    return await parseJsonSafe<SaleProgram[]>(res);
  } catch {
    return [];
  }
}

export async function getAdminSaleProgram(
  id: number,
  options?: { accessToken?: string | null }
): Promise<SaleProgram | null> {
  try {
    const res = await fetch(apiUrl(`/sales/admin/sales/programs/${id}`), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return null;
    return await parseJsonSafe<SaleProgram>(res);
  } catch {
    return null;
  }
}

export async function createAdminSaleProgram(
  input: SaleProgramRequest,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<SaleProgram> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/sales/admin/sales/programs"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Tạo chương trình khuyến mãi thất bại");
  return parseJsonSafe<SaleProgram>(res);
}

export async function updateAdminSaleProgram(
  id: number,
  input: SaleProgramRequest,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<SaleProgram> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/sales/admin/sales/programs/${id}`), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Cập nhật chương trình khuyến mãi thất bại");
  return parseJsonSafe<SaleProgram>(res);
}

export async function deleteAdminSaleProgram(
  id: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/sales/admin/sales/programs/${id}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Xóa chương trình khuyến mãi thất bại");
}

// ======================== Voucher API ========================

export type Voucher = {
  id: number;
  code: string;
  description?: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  maxUsage?: number;
  maxUsagePerUser?: number;
  usageCount: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
};

export type VoucherUsage = {
  id: number;
  voucherId: number;
  userId: number;
  orderId?: number | null;
  usedAt?: string;
};

export type VoucherRequest = Omit<Voucher, "id" | "usageCount">;

export async function listAdminVouchers(
  options?: { accessToken?: string | null }
): Promise<Voucher[]> {
  try {
    const res = await fetch(apiUrl("/sales/admin/sales/vouchers"), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return [];
    return await parseJsonSafe<Voucher[]>(res);
  } catch {
    return [];
  }
}

export async function getAdminVoucher(
  id: number,
  options?: { accessToken?: string | null }
): Promise<Voucher | null> {
  try {
    const res = await fetch(apiUrl(`/sales/admin/sales/vouchers/${id}`), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return null;
    return await parseJsonSafe<Voucher>(res);
  } catch {
    return null;
  }
}

export async function listAdminVoucherUsages(
  id: number,
  options?: { accessToken?: string | null }
): Promise<VoucherUsage[]> {
  try {
    const res = await fetch(apiUrl(`/sales/admin/sales/vouchers/${id}/usages`), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return [];
    return await parseJsonSafe<VoucherUsage[]>(res);
  } catch {
    return [];
  }
}

export async function createAdminVoucher(
  input: VoucherRequest,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<Voucher> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/sales/admin/sales/vouchers"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Tạo voucher thất bại");
  return parseJsonSafe<Voucher>(res);
}

export async function updateAdminVoucher(
  id: number,
  input: VoucherRequest,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<Voucher> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/sales/admin/sales/vouchers/${id}`), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Cập nhật voucher thất bại");
  return parseJsonSafe<Voucher>(res);
}

export async function deleteAdminVoucher(
  id: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/sales/admin/sales/vouchers/${id}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Xóa voucher thất bại");
}

export async function checkAdminVoucherCode(
  code: string,
  excludeVoucherId?: number,
  options?: { accessToken?: string | null }
): Promise<{ exists: boolean }> {
  const qs = new URLSearchParams({ code });
  if (excludeVoucherId) qs.append("excludeVoucherId", excludeVoucherId.toString());
  const res = await fetch(apiUrl(`/sales/admin/sales/vouchers/check-code?${qs.toString()}`), {
    cache: "no-store",
    headers: adminCatalogHeaders(options),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error: ${res.status} ${text}`);
  }
  return res.json();
}

// ======================== Promo Banner API ========================

export type PromoBanner = {
  id: number;
  title?: string;
  imageUrl?: string;
  linkUrl?: string;
  position: number;
  active: boolean;
  startAt?: string;
  endAt?: string;
};

export type PromoBannerRequest = Omit<PromoBanner, "id">;

export async function listAdminBanners(
  options?: { accessToken?: string | null }
): Promise<PromoBanner[]> {
  try {
    const res = await fetch(apiUrl("/sales/admin/sales/banners"), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return [];
    return await parseJsonSafe<PromoBanner[]>(res);
  } catch {
    return [];
  }
}

export async function getAdminBanner(
  id: number,
  options?: { accessToken?: string | null }
): Promise<PromoBanner | null> {
  try {
    const res = await fetch(apiUrl(`/sales/admin/sales/banners/${id}`), {
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (!res.ok) return null;
    return await parseJsonSafe<PromoBanner>(res);
  } catch {
    return null;
  }
}

export async function createAdminBanner(
  input: PromoBannerRequest,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<PromoBanner> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/sales/admin/sales/banners"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Tạo banner thất bại");
  return parseJsonSafe<PromoBanner>(res);
}

export async function updateAdminBanner(
  id: number,
  input: PromoBannerRequest,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<PromoBanner> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/sales/admin/sales/banners/${id}`), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Cập nhật banner thất bại");
  return parseJsonSafe<PromoBanner>(res);
}

export async function deleteAdminBanner(
  id: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<void> {
  const res = await fetch(apiUrl(`/sales/admin/sales/banners/${id}`), {
    method: "DELETE",
    headers: adminCatalogHeaders(options),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Lỗi xóa banner: ${res.status} ${text}`);
  }
}

export async function uploadAdminBannerImage(
  file: File,
  options?: { accessToken?: string | null }
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(apiUrl("/sales/admin/sales/banners/upload-image"), {
    method: "POST",
    headers: { ...adminCatalogHeaders(options) },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload ảnh thất bại: ${res.status} ${text}`);
  }

  const data = await res.json();
  if (!data.url) throw new Error("Không có URL trả về");
  return data.url;
}

// ======================== Public API ========================

export type VoucherApplyResponse = {
  valid: boolean;
  code: string;
  message?: string;
  discountAmount?: number;
  discountType?: "PERCENT" | "AMOUNT";
  discountValue?: number;
};

export async function validateVoucher(
  code: string,
  userId: number,
  orderAmount: number
): Promise<VoucherApplyResponse> {
  try {
    const res = await fetch(apiUrl("/sales/vouchers/validate"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, userId, orderAmount }),
    });
    return await parseJsonSafe<VoucherApplyResponse>(res);
  } catch {
    return { valid: false, code, message: "Lỗi kết nối" };
  }
}

export async function listActiveBanners(): Promise<PromoBanner[]> {
  try {
    const res = await fetch(apiUrl("/sales/banners"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await parseJsonSafe<PromoBanner[]>(res);
  } catch {
    return [];
  }
}

export async function listActivePrograms(): Promise<SaleProgram[]> {
  try {
    const res = await fetch(apiUrl('/sales/active'), {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      console.error('[listActivePrograms] failed:', res.status, res.statusText);
      return [];
    }
    return await parseJsonSafe<SaleProgram[]>(res);
  } catch (err) {
    console.error('[listActivePrograms] err:', err);
    return [];
  }
}

export async function listActiveVouchers(): Promise<Voucher[]> {
  try {
    const res = await fetch(apiUrl('/sales/vouchers/active'), {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await parseJsonSafe<Voucher[]>(res);
  } catch {
    return [];
  }
}

