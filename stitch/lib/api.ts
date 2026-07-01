export type BackendProduct = {
  id: number;
  productName: string;
  discription?: string;
  categoryId?: number | null;
  category?: string | null;
  categoryIds?: number[] | null;
  categoryNames?: string[] | null;
  price: number;
  effectivePrice?: number | string | null;
  minVariantPrice?: number | string | null;
  maxVariantPrice?: number | string | null;
  availability: number;
  sku?: string;
  primaryImageUrl?: string | null;
  hidden?: boolean | null;
  deletedAt?: string | number[] | null;
  brandId?: number | null;
  brandName?: string | null;
  viewCount?: number | null;
  salesCount?: number | null;
};

export type UiProduct = {
  id: string;
  name: string;
  subtitle: string;
  categoryId: number | null;
  category: string;
  categoryIds: number[];
  categoryNames: string[];
  brandId: number | null;
  brandName: string | null;
  sku: string;
  price: string;
  rawPrice: number;
  minPrice: number | null;
  maxPrice: number | null;
  hasVariantPriceRange: boolean;
  effectivePrice: number | null;
  stock: number;
  status: "Còn hàng" | "Sắp hết hàng" | "Hết hàng";
  isHidden: boolean;
  isDeleted: boolean;
  heroImage: string;
  thumbnails: string[];
  description: string;
  viewCount: number;
  salesCount: number;
  originalPrice?: string;
  badges?: string[];
};

export type ProductSearchResult = {
  items: UiProduct[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  role: string;
};

type RegisterResponse = {
  id?: number;
  userName?: string;
  activated?: boolean;
  userDetails?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

/**
 * Gốc API (gateway). Mặc định `http://localhost:8900/api`.
 * Nếu `NEXT_PUBLIC_API_BASE_URL` chỉ là đường dẫn (vd. `/api`), fetch từ server Next cần origin —
 * dùng `API_SERVER_ORIGIN` (mặc định `http://localhost:8900`) để ghép thành URL tuyệt đối.
 */
function getResolvedApiRoot(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  return `${origin}${prefix}`.replace(/\/+$/, "");
}

export function apiUrl(path: string): string {
  const base = getResolvedApiRoot();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function getResolvedCartServiceOrigin(): string {
  const raw = (process.env.CART_SERVICE_ORIGIN ?? "http://localhost:8821").trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  return `http://${raw.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function resolveBackendImageUrl(raw: string | null | undefined): string {
  const v = String(raw ?? "").trim();
  if (!v) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) {
    return v;
  }
  // Giữ nguyên relative URL (ví dụ: /api/catalog/admin/products/images/file/...)
  // Next.js (thông qua rewrites) sẽ tự proxy request về API_SERVER_ORIGIN.
  // Nhờ đó hình ảnh sẽ tải ổn định trên bất kỳ thiết bị nào (cùng IP LAN).
  if (v.startsWith("/")) {
    return v;
  }
  return `/api/catalog/admin/products/images/file/${v}`;
}

/** URL hiển thị ảnh catalog (file upload hoặc URL tuyệt đối). */
export function resolveCatalogImageUrl(raw: string | null | undefined): string {
  return resolveBackendImageUrl(raw);
}

export async function parseJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export async function parseProductApiError(res: Response, fallback: string): Promise<never> {
  const body = await parseJsonSafe<{ error?: string; message?: string }>(res);
  const code = body?.error?.trim();
  const message = body?.message?.trim();
  if (code) {
    throw new Error(`${code}:${message ?? fallback}`);
  }
  if (message) {
    throw new Error(`VALIDATION:${message}`);
  }
  throw new Error(fallback);
}

export type WebActivityLog = {
  id: number;
  actorUserId?: string | null;
  actorUsername?: string | null;
  action?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  httpMethod?: string | null;
  requestPath?: string | null;
  ipAddress?: string | null;
  detailJson?: string | null;
  createdBy?: string | null;
  /** ISO string hoặc mảng LocalDateTime từ Jackson. */
  createdAt?: string | number[] | null;
};

/** Định dạng thời gian log (hỗ trợ ISO hoặc mảng [y,m,d,h,mi,s] từ backend Java). */
export function formatWebActivityTime(createdAt: WebActivityLog["createdAt"]): string {
  if (createdAt == null) {
    return "—";
  }
  if (typeof createdAt === "string") {
    const d = new Date(createdAt);
    return Number.isNaN(d.getTime()) ? createdAt : d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }
  if (Array.isArray(createdAt) && createdAt.length >= 3) {
    const y = Number(createdAt[0]);
    const mo = Number(createdAt[1]);
    const day = Number(createdAt[2]);
    const h = createdAt.length > 3 ? Number(createdAt[3]) : 0;
    const mi = createdAt.length > 4 ? Number(createdAt[4]) : 0;
    const s = createdAt.length > 5 ? Number(createdAt[5]) : 0;
    if ([y, mo, day].some((n) => Number.isNaN(n))) {
      return "—";
    }
    return new Date(y, mo - 1, day, h, mi, s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }
  return "—";
}

export type ListWebActivityRecentOutcome = {
  logs: WebActivityLog[];
  /** Gateway trả 401 — thường do access token hết hạn (`/api/activity/**` không nằm trong public-paths). */
  unauthorized?: boolean;
  /** Lỗi mạng, HTTP khác 401, hoặc body không phải mảng JSON. */
  otherFetchFailure?: boolean;
};

/** GET /activity/recent — nhật ký gần đây (qua gateway; bắt buộc Bearer JWT hợp lệ). */
export async function listWebActivityRecent(
  limit = 100,
  options?: { accessToken?: string | null },
): Promise<ListWebActivityRecentOutcome> {
  const cap = Math.min(Math.max(1, limit), 500);
  try {
    const headers: Record<string, string> = {};
    const tok = options?.accessToken?.trim();
    if (tok) {
      headers["Authorization"] = `Bearer ${tok}`;
    }
    const res = await fetch(apiUrl(`/activity/recent?limit=${cap}`), {
      cache: "no-store",
      headers,
    });
    if (!res.ok) {
      return {
        logs: [],
        unauthorized: res.status === 401,
        otherFetchFailure: res.status !== 401,
      };
    }
    const data = await parseJsonSafe<WebActivityLog[]>(res);
    if (!Array.isArray(data)) {
      return { logs: [], otherFetchFailure: true };
    }
    return { logs: data };
  } catch {
    return { logs: [], otherFetchFailure: true };
  }
}

/** GET /activity/{id} — chi tiết một bản ghi nhật ký. */
export async function getWebActivityById(
  id: number | string,
  options?: { accessToken?: string | null },
): Promise<WebActivityLog | null> {
  try {
    const headers: Record<string, string> = {};
    const tok = options?.accessToken?.trim();
    if (tok) {
      headers["Authorization"] = `Bearer ${tok}`;
    }
    const res = await fetch(apiUrl(`/activity/${id}`), {
      cache: "no-store",
      headers,
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    const data = await parseJsonSafe<WebActivityLog>(res);
    return data && typeof data.id === "number" ? data : null;
  } catch {
    return null;
  }
}

export function adminCatalogHeaders(options?: {
  accessToken?: string | null;
  username?: string | null;
  userId?: string | null;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  const u = options?.username?.trim();
  if (u) {
    headers["X-Username"] = u;
  }
  const id = options?.userId?.trim();
  if (id) {
    headers["X-User-Id"] = id;
  }
  const tok = options?.accessToken?.trim();
  if (tok) {
    headers["Authorization"] = `Bearer ${tok}`;
  }
  return headers;
}

function asPrice(v: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
}

function toStatus(stock: number): UiProduct["status"] {
  if (stock <= 0) {
    return "Hết hàng";
  }
  if (stock < 20) {
    return "Sắp hết hàng";
  }
  return "Còn hàng";
}

function toUiProduct(p: BackendProduct): UiProduct {
  const hero = resolveBackendImageUrl(p.primaryImageUrl);
  const deleted = p.deletedAt != null && String(p.deletedAt).trim() !== "";
  const rawPrice = Number(p.price ?? 0);
  const minVariantPrice = p.minVariantPrice != null ? Number(p.minVariantPrice) : NaN;
  const maxVariantPrice = p.maxVariantPrice != null ? Number(p.maxVariantPrice) : NaN;
  const hasVariantRange =
    Number.isFinite(minVariantPrice) &&
    Number.isFinite(maxVariantPrice) &&
    minVariantPrice > 0 &&
    maxVariantPrice > 0;
  const displayPrice = hasVariantRange
    ? minVariantPrice < maxVariantPrice
      ? `${asPrice(minVariantPrice)} - ${asPrice(maxVariantPrice)}`
      : asPrice(minVariantPrice)
    : asPrice(rawPrice);
  return {
    id: String(p.id),
    name: p.productName,
    subtitle: p.discription ?? "Sản phẩm từ hệ thống backend",
    categoryId: p.categoryId != null ? Number(p.categoryId) : null,
    category: p.category ?? (p.categoryId != null ? `Danh mục #${p.categoryId}` : "Chưa phân loại"),
    categoryIds: Array.isArray(p.categoryIds) ? p.categoryIds.map(Number) : (p.categoryId != null ? [Number(p.categoryId)] : []),
    categoryNames: Array.isArray(p.categoryNames) ? p.categoryNames : (p.category ? [p.category] : []),
    brandId: p.brandId != null ? Number(p.brandId) : null,
    brandName: p.brandName ?? null,
    sku: p.sku ?? `SKU-${p.id}`,
    price: displayPrice,
    rawPrice,
    minPrice: hasVariantRange ? minVariantPrice : null,
    maxPrice: hasVariantRange ? maxVariantPrice : null,
    hasVariantPriceRange: hasVariantRange,
    effectivePrice: p.effectivePrice != null ? Number(p.effectivePrice) : null,
    stock: Number(p.availability ?? 0),
    status: toStatus(Number(p.availability ?? 0)),
    isHidden: Boolean(p.hidden),
    isDeleted: deleted,
    heroImage: hero,
    thumbnails: [hero],
    description: p.discription ?? "Chưa có mô tả.",
    viewCount: Number(p.viewCount ?? 0),
    salesCount: Number(p.salesCount ?? 0),
  };
}

export type AdminProductImage = {
  id: number;
  imageUrl?: string | null;
  storagePath: string;
  sortOrder?: number;
  primaryImage?: boolean;
  /** "IMAGE" hoặc "VIDEO" */
  mediaType?: string | null;
};

export type AdminProductSpec = {
  id: number;
  specKey: string;
  specValue: string;
  unit?: string | null;
  sortOrder?: number;
  /** Nhóm thông số kỹ thuật (ví dụ: "CPU", "Màn hình", "Pin"). */
  specGroup?: string | null;
};

export type AdminProductVariant = {
  id: number;
  size: string;
  color: string;
  variantImageUrl?: string | null;
  price?: number | string | null;
  availability?: number | null;
};

export async function listAdminProductImages(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<AdminProductImage[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/products/${productId}/images`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<AdminProductImage[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addAdminProductImage(
  productId: number,
  input: { storagePath: string; imageUrl?: string; sortOrder?: number; primaryImage?: boolean },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<AdminProductImage> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/images`), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error("Thêm ảnh thất bại");
  }
  return parseJsonSafe<AdminProductImage>(res);
}

export async function deleteAdminProductImage(
  productId: number,
  imageId: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/images/${imageId}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error("Xóa ảnh thất bại");
  }
}

export async function setPrimaryAdminProductImage(
  productId: number,
  imageId: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/images/${imageId}/primary`), {
      method: "PUT",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error("Đặt ảnh chính thất bại");
  }
}

export async function uploadAdminProductImages(
  productId: number,
  files: File[],
  primaryIndex: number | null,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  const form = new FormData();
  for (const file of files) {
    form.append("files", file);
  }
  if (primaryIndex != null && primaryIndex >= 0) {
    form.append("primaryIndex", String(primaryIndex));
  }
  if (options?.username) {
    form.append("performedBy", options.username);
  }
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/images/upload`), {
      method: "POST",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
      body: form,
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error("Upload ảnh thất bại");
  }
}

/** Upload một file ảnh sản phẩm, trả về đường dẫn dùng cho variantImageUrl (imageUrl hoặc /api/catalog/.../file/...). */
export async function uploadAdminProductImageAndGetVariantUrl(
  productId: number,
  file: File,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<string> {
  const before = await listAdminProductImages(productId, options);
  const beforeMaxId = before.reduce((m, i) => Math.max(m, Number(i.id) || 0), 0);
  await uploadAdminProductImages(productId, [file], null, options);
  const after = await listAdminProductImages(productId, options);
  if (!after.length) {
    throw new Error("Không đọc được danh sách ảnh sau upload");
  }
  const newer = after.filter((i) => (Number(i.id) || 0) > beforeMaxId);
  const img =
    newer.length > 0
      ? newer.reduce((a, b) => ((Number(a.id) || 0) >= (Number(b.id) || 0) ? a : b))
      : after.reduce((a, b) => ((Number(a.id) || 0) >= (Number(b.id) || 0) ? a : b));
  if (!img) {
    throw new Error("Upload ảnh không tạo được bản ghi ảnh");
  }
  const u = String(img.imageUrl ?? "").trim();
  if (u) return u;
  const sp = String(img.storagePath ?? "").trim();
  if (!sp) throw new Error("Thiếu đường dẫn ảnh sau upload");
  return `/api/catalog/admin/products/images/file/${encodeURIComponent(sp)}`;
}

export async function listAdminProductSpecs(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<AdminProductSpec[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/products/${productId}/specs`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminProductSpec[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function addAdminProductSpec(
  productId: number,
  input: { specKey: string; specValue: string; unit?: string; sortOrder?: number; performedBy?: string; specGroup?: string | null },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  console.log("[addAdminProductSpec] request", {
    productId,
    input,
    hasAccessToken: Boolean(options?.accessToken),
    username: options?.username ?? null,
    userId: options?.userId ?? null,
  });
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/specs`), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    console.error("[addAdminProductSpec] network_error", { productId, input });
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    const body = await parseJsonSafe<{ error?: string; message?: string }>(res);
    const msg = body?.message?.trim();
    const code = body?.error?.trim();
    console.error("[addAdminProductSpec] api_error", {
      status: res.status,
      productId,
      input,
      body,
    });
    if (msg || code) {
      throw new Error(`VALIDATION:${code ? `${code}: ` : ""}${msg ?? "Thêm thông số thất bại"}`);
    }
    throw new Error("Thêm thông số thất bại");
  }
  console.log("[addAdminProductSpec] success", { productId, input });
}

export async function deleteAdminProductSpec(
  productId: number,
  specId: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/specs/${specId}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) throw new Error("Xóa thông số thất bại");
}

export async function updateAdminProductSpec(
  productId: number,
  specId: number,
  input: { specKey: string; specValue: string; unit?: string; sortOrder?: number; performedBy?: string; specGroup?: string | null },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/specs/${specId}`), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Cập nhật thông số thất bại");
  }
}

// ======================== Brand API ========================

export type AdminBrand = {
  id: number;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
};

export async function listAdminBrands(
  options?: { accessToken?: string | null },
): Promise<AdminBrand[]> {
  try {
    const res = await fetch(apiUrl("/catalog/brands"), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminBrand[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listPublicBrands(): Promise<AdminBrand[]> {
  try {
    const res = await fetch(apiUrl("/catalog/brands"), { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminBrand[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function createAdminBrand(
  input: { name: string; description?: string | null; logoUrl?: string | null },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<AdminBrand> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/catalog/admin/brands"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Tạo thương hiệu thất bại");
  return parseJsonSafe<AdminBrand>(res);
}

export async function updateAdminBrand(
  id: number,
  input: { name: string; description?: string | null; logoUrl?: string | null },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/brands/${id}`), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Cập nhật thương hiệu thất bại");
}

export async function deleteAdminBrand(
  id: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/brands/${id}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Xóa thương hiệu thất bại");
}

export async function getAdminBrandById(
  id: number,
  options?: { accessToken?: string | null },
): Promise<AdminBrand | null> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/brands/${id}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return null;
    return await parseJsonSafe<AdminBrand>(res);
  } catch {
    return null;
  }
}

export async function checkAdminBrandName(
  name: string,
  options?: { accessToken?: string | null },
): Promise<boolean> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/brands/check-name?name=${encodeURIComponent(name)}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return false;
    const data = await parseJsonSafe<{ exists: boolean }>(res);
    return data?.exists ?? false;
  } catch {
    return false;
  }
}

export async function uploadAdminBrandLogo(
  file: File,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<string> {
  let res: Response;
  const formData = new FormData();
  formData.append("file", file);
  try {
    res = await fetch(apiUrl(`/catalog/admin/brands/upload-logo`), {
      method: "POST",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
      body: formData,
    });
  } catch {
    throw new Error("Không kết nối được tới backend.");
  }
  if (!res.ok) await parseProductApiError(res, "Upload logo thất bại");
  const data = await parseJsonSafe<{ url: string }>(res);
  return data.url;
}

// ======================== Product Change Logs API ========================

export type ProductChangeLogEntry = {
  id: number;
  productId: number;
  changedField: string;
  oldValue?: string | null;
  newValue?: string | null;
  changedAt: string | number[] | null;
  changedBy?: string | null;
  changedByUserId?: string | null;
};

export async function getProductChangeLogs(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<ProductChangeLogEntry[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/products/${productId}/change-logs`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<ProductChangeLogEntry[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ======================== Product View / Sales tracker ========================

/** Tăng lượt xem sản phẩm (gọi khi user vào trang chi tiết SP). */
export async function incrementProductView(productId: number): Promise<void> {
  try {
    await fetch(apiUrl(`/catalog/products/${productId}/view`), {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    // Silent fail — không ảnh hưởng UX
  }
}

/** Thêm hàm addAdminProductImage hỗ trợ mediaType. */
export async function addAdminProductMedia(
  productId: number,
  input: { storagePath: string; imageUrl?: string; sortOrder?: number; primaryImage?: boolean; mediaType?: string },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<AdminProductImage> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/images`), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) throw new Error("Thêm media thất bại");
  return parseJsonSafe<AdminProductImage>(res);
}

export async function listAdminProductVariants(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<AdminProductVariant[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/products/${productId}/variants`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminProductVariant[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Biến thể cho storefront: GET /catalog/products/{id}/variants — không cần JWT admin.
 * (Trang /product/[id] dùng API này; admin-only trả [] nên khách không thấy biến thể.)
 */
export async function listPublicProductVariants(productId: number): Promise<AdminProductVariant[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/products/${productId}/variants`), {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const raw = await parseJsonSafe<
      Array<{
        id?: number;
        size?: string | null;
        color?: string | null;
        variantImageUrl?: string | null;
        price?: number | string | null;
        availability?: number | null;
      }>
    >(res);
    if (!Array.isArray(raw)) return [];
    return raw.map((row) => ({
      id: Number(row.id ?? 0),
      size: String(row.size ?? ""),
      color: String(row.color ?? ""),
      variantImageUrl: row.variantImageUrl ?? null,
      price: row.price ?? null,
      availability: row.availability ?? null,
    })).filter((v) => Number.isFinite(v.id) && v.id > 0);
  } catch {
    return [];
  }
}

export async function addAdminProductVariant(
  productId: number,
  input: { size: string; color: string; variantImageUrl?: string; price: number; availability?: number; performedBy?: string },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/variants`), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (res.status === 409) {
    const body = await parseJsonSafe<{ error?: string; message?: string }>(res);
    throw new Error(`CONFLICT:${body.message ?? "Biến thể size + màu này đã tồn tại."}`);
  }
  if (res.status === 400) {
    const body = await parseJsonSafe<{ error?: string; message?: string }>(res);
    throw new Error(`VALIDATION:${body.message ?? "Dữ liệu không hợp lệ (thiếu size hoặc màu)."}`);
  }
  if (!res.ok) {
    const body = await parseJsonSafe<{ error?: string; message?: string }>(res);
    throw new Error(body?.message ?? "Thêm biến thể thất bại");
  }
}

export async function deleteAdminProductVariant(
  productId: number,
  variantId: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/variants/${variantId}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) throw new Error("Xóa biến thể thất bại");
}

export async function updateAdminProductVariant(
  productId: number,
  variantId: number,
  input: {
    size: string;
    color: string;
    variantImageUrl?: string;
    price: number;
    availability?: number;
    performedBy?: string;
  },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${productId}/variants/${variantId}`), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (res.status === 409) {
    const body = await parseJsonSafe<{ error?: string; message?: string }>(res);
    throw new Error(`${body.error ?? "CONFLICT"}:${body.message ?? "Biến thể bị trùng"}`);
  }
  if (!res.ok) {
    await parseProductApiError(res, "Cập nhật biến thể thất bại");
  }
}

export async function login(username: string, password: string, deviceFingerprint?: string): Promise<LoginResponse> {
  let res: Response;
  try {
    console.log("[login] request", { endpoint: apiUrl("/accounts/auth/login"), username, deviceFingerprint });
    res = await fetch(apiUrl("/accounts/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, deviceFingerprint }),
      cache: "no-store",
    });
    console.log("[login] response", { status: res.status, ok: res.ok });
  } catch (e) {
    console.error("[login] network_error", e);
    throw new Error("LOGIN_NETWORK:Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    let detail = "";
    let code = "";
    try {
      const err = await parseJsonSafe<{ message?: string; error?: string }>(res);
      detail = err?.message ?? "";
      code = err?.error ?? "";
    } catch (_e) {
      detail = "";
      code = "";
    }
    if (res.status === 428) {
      throw new Error(`LOGIN_428${code ? `:${code}` : ""}${detail ? `:${detail}` : ""}`);
    }
    throw new Error(`LOGIN_${res.status}${detail ? `:${detail}` : ""}`);
  }
  return parseJsonSafe<LoginResponse>(res);
}

export async function requestPasswordlessOtp(identity: string, deviceFingerprint?: string): Promise<{ message: string }> {
  let res: Response;
  try {
    res = await fetch(apiUrl("/accounts/auth/passwordless/request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, deviceFingerprint }),
      cache: "no-store",
    });
  } catch (e) {
    throw new Error("LOGIN_NETWORK:Không kết nối được tới backend.");
  }
  if (!res.ok) {
    let detail = "";
    let code = "";
    try {
      const err = await parseJsonSafe<{ message?: string; error?: string }>(res);
      detail = err?.message ?? "";
      code = err?.error ?? "";
    } catch (_e) {
      // ignore
    }
    if (res.status === 423) {
      throw new Error(`LOGIN_423${code ? `:${code}` : ""}${detail ? `:${detail}` : ""}`);
    }
    throw new Error(`LOGIN_${res.status}${detail ? `:${detail}` : ""}`);
  }
  return parseJsonSafe<{ message: string }>(res);
}

export async function verifyLoginOtp(input: { identity: string; otp: string; deviceFingerprint: string }): Promise<LoginResponse | null> {
  const identity = input.identity.trim();
  const otp = input.otp.trim();
  const deviceFingerprint = input.deviceFingerprint.trim();
  if (!identity || !otp || !deviceFingerprint) return null;
  try {
    const res = await fetch(apiUrl("/accounts/auth/login-otp/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, otp, deviceFingerprint }),
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await parseJsonSafe<{ error?: string; message?: string }>(res);
      throw new Error(`LOGIN_OTP_${res.status}${err?.error ? `:${err.error}` : ""}${err?.message ? `:${err.message}` : ""}`);
    }
    return parseJsonSafe<LoginResponse>(res);
  } catch {
    return null;
  }
}

export async function resendLoginOtp(input: { identity: string; deviceFingerprint: string }): Promise<boolean> {
  const identity = input.identity.trim();
  const deviceFingerprint = input.deviceFingerprint.trim();
  if (!identity || !deviceFingerprint) return false;
  try {
    const res = await fetch(apiUrl("/accounts/auth/login-otp/resend"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity, deviceFingerprint }),
      cache: "no-store",
    });
    if (!res.ok) {
      const err = await parseJsonSafe<{ error?: string; message?: string }>(res);
      throw new Error(`LOGIN_OTP_RESEND_${res.status}${err?.error ? `:${err.error}` : ""}${err?.message ? `:${err.message}` : ""}`);
    }
    return true;
  } catch {
    return false;
  }
}

export async function requestForgotPassword(identity: string): Promise<void> {
  const v = identity.trim();
  if (!v) {
    throw new Error("FORGOT_400:Vui lòng nhập tài khoản/email/số điện thoại.");
  }
  let res: Response;
  try {
    res = await fetch(apiUrl("/accounts/auth/password/forgot"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: v }),
      cache: "no-store",
    });
  } catch {
    throw new Error("FORGOT_NETWORK:Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error(`FORGOT_${res.status}`);
  }
}

export async function resetPasswordByToken(token: string, newPassword: string): Promise<void> {
  const t = token.trim();
  const pwd = newPassword.trim();
  if (!t || pwd.length < 8) {
    throw new Error("RESET_400:Token hoặc mật khẩu mới không hợp lệ.");
  }
  let res: Response;
  try {
    res = await fetch(apiUrl("/accounts/auth/password/reset"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: t, newPassword: pwd }),
      cache: "no-store",
    });
  } catch {
    throw new Error("RESET_NETWORK:Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error(`RESET_${res.status}`);
  }
}

export async function registerUserAccount(input: {
  username: string;
  contact: string;
  password: string;
}): Promise<RegisterResponse> {
  const userName = input.username.trim();
  const contact = input.contact.trim();
  const password = input.password;
  if (!userName || !contact || !password) {
    throw new Error("REGISTER_400:Thiếu thông tin đăng ký.");
  }

  const isEmail = /@/.test(contact);
  const isPhone = /^[0-9+()\-\s.]{8,20}$/.test(contact);
  if (!isEmail && !isPhone) {
    throw new Error("REGISTER_400:Email hoặc số điện thoại không hợp lệ.");
  }

  let res: Response;
  try {
    res = await fetch(apiUrl("/registration"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName,
        userPassword: password,
        email: isEmail ? contact : null,
        phoneNumber: isPhone ? contact : null,
        userDetails: {
          firstName: userName,
          lastName: "User",
        },
      }),
      cache: "no-store",
    });
  } catch {
    throw new Error("REGISTER_NETWORK:Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    let detail = "";
    try {
      const err = await parseJsonSafe<{ message?: string }>(res);
      detail = err?.message ?? "";
    } catch (_e) {
      detail = "";
    }
    throw new Error(`REGISTER_${res.status}${detail ? `:${detail}` : ""}`);
  }
  return parseJsonSafe<RegisterResponse>(res);
}

export async function listLatestProducts(): Promise<UiProduct[]> {
  try {
    const res = await fetch(apiUrl("/catalog/products/newest"), {
      next: { revalidate: 60 },
      cache: "force-cache",
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      console.error("[listLatestProducts] failed:", res.status, res.statusText);
      return [];
    }
    const data: BackendProduct[] = await res.json();
    return data.map(toUiProduct);
  } catch (err) {
    console.error("[listLatestProducts] err:", err);
    return [];
  }
}

export async function listHotProducts(limit: number = 8): Promise<UiProduct[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/products/hot?limit=${limit}`), {
      next: { revalidate: 60 },
      cache: "force-cache",
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      console.error("[listHotProducts] failed:", res.status, res.statusText);
      return [];
    }
    const data: BackendProduct[] = await res.json();
    return data.map(toUiProduct);
  } catch (err) {
    console.error("[listHotProducts] err:", err);
    return [];
  }
}

export async function listProductsByIds(ids: string[] | number[]): Promise<UiProduct[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const idParam = ids.join(",");
    const res = await fetch(apiUrl(`/catalog/products/batch?ids=${idParam}`), {
      next: { revalidate: 60 },
      cache: "force-cache",
    });
    if (!res.ok) {
      if (res.status === 404) return [];
      console.error("[listProductsByIds] failed:", res.status, res.statusText);
      return [];
    }
    const data: BackendProduct[] = await res.json();
    return data.map(toUiProduct);
  } catch (err) {
    console.error("[listProductsByIds] err:", err);
    return [];
  }
}

export async function verifyRegistrationToken(token: string): Promise<boolean> {
  const t = token.trim();
  if (!t) return false;
  try {
    const res = await fetch(apiUrl(`/registration/verify?token=${encodeURIComponent(t)}`), {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getProductsForUi(): Promise<UiProduct[]> {
  try {
    const res = await fetch(apiUrl("/catalog/products/available"), { next: { revalidate: 60 } });
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<BackendProduct[]>(res);
    const list = Array.isArray(data) ? data : [];
    return list.map(toUiProduct);
  } catch {
    // Gateway tắt, ECONNREFUSED, timeout, v.v. — không làm crash trang (500)
    return [];
  }
}

export async function getProductsByCategoryForUi(categoryId: number): Promise<UiProduct[]> {
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    return [];
  }
  try {
    const res = await fetch(apiUrl(`/catalog/products/available/category/${categoryId}`), { next: { revalidate: 60 } });
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<BackendProduct[]>(res);
    const list = Array.isArray(data) ? data : [];
    return list.map(toUiProduct);
  } catch {
    return [];
  }
}

export async function getNewestProductsForUi(limit = 8): Promise<UiProduct[]> {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(50, Math.floor(limit))) : 8;
  try {
    const res = await fetch(apiUrl(`/catalog/products/newest?limit=${safeLimit}`), { next: { revalidate: 60 } });
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<BackendProduct[]>(res);
    const list = Array.isArray(data) ? data : [];
    return list.map(toUiProduct);
  } catch {
    return [];
  }
}

export interface PageResponse<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function getAdminProductsPageForUi(input?: {
  page?: number;
  size?: number;
  q?: string;
  categoryId?: string;
  brandId?: string;
  filterDeleted?: string;
  sortBy?: string;
  accessToken?: string | null;
  username?: string | null;
  userId?: string | null;
}): Promise<{ items: UiProduct[]; totalElements: number; totalPages: number }> {
  try {
    const params = new URLSearchParams();
    if (input?.page !== undefined) params.append("page", input.page.toString());
    if (input?.size !== undefined) params.append("size", input.size.toString());
    if (input?.q) params.append("q", input.q);
    if (input?.categoryId && input.categoryId !== "all") params.append("categoryId", input.categoryId);
    if (input?.brandId && input.brandId !== "all") params.append("brandId", input.brandId);
    if (input?.filterDeleted) params.append("filterDeleted", input.filterDeleted);
    if (input?.sortBy) params.append("sortBy", input.sortBy);

    const qp = params.toString() ? `?${params.toString()}` : "";
    
    // Call the new paged endpoint on the backend
    const res = await fetch(apiUrl(`/catalog/admin/products/paged${qp}`), {
      cache: "no-store",
      headers: {
        ...adminCatalogHeaders({ accessToken: input?.accessToken, username: input?.username, userId: input?.userId }),
      },
    });
    
    if (!res.ok) {
      return { items: [], totalElements: 0, totalPages: 0 };
    }
    
    const data = await parseJsonSafe<PageResponse<BackendProduct>>(res);
    if (data && data.content) {
      return {
        items: data.content.map(toUiProduct),
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
      };
    }
    return { items: [], totalElements: 0, totalPages: 0 };
  } catch {
    return { items: [], totalElements: 0, totalPages: 0 };
  }
}

export async function getAdminProductsForUi(input?: {
  includeDeleted?: boolean;
  accessToken?: string | null;
  username?: string | null;
  userId?: string | null;
}): Promise<UiProduct[]> {
  try {
    const qp = input?.includeDeleted ? "?includeDeleted=true" : "";
    const res = await fetch(apiUrl(`/catalog/admin/products${qp}`), {
      cache: "no-store",
      headers: {
        ...adminCatalogHeaders({ accessToken: input?.accessToken, username: input?.username, userId: input?.userId }),
      },
    });
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<BackendProduct[]>(res);
    const list = Array.isArray(data) ? data : [];
    return list.map(toUiProduct);
  } catch {
    return [];
  }
}

export async function restoreProduct(
  id: string,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${id}/restore`), {
      method: "POST",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Khôi phục sản phẩm thất bại");
  }
}

export async function hideProduct(
  id: string,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${id}/hide`), {
      method: "POST",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Ẩn sản phẩm thất bại");
  }
}

export async function unhideProduct(
  id: string,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${id}/unhide`), {
      method: "POST",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Hiện sản phẩm thất bại");
  }
}

export async function searchProductsForUi(input?: {
  q?: string;
  status?: "all" | "in_stock" | "low_stock" | "out_stock";
  page?: number;
  size?: number;
}): Promise<ProductSearchResult> {
  const q = (input?.q ?? "").trim();
  const status = input?.status ?? "all";
  const page = Number.isFinite(input?.page as number) ? Math.max(1, Math.floor(input!.page!)) : 1;
  const size = Number.isFinite(input?.size as number) ? Math.min(50, Math.max(5, Math.floor(input!.size!))) : 10;
  const qp = new URLSearchParams();
  if (q) qp.set("q", q);
  qp.set("status", status);
  qp.set("page", String(page));
  qp.set("size", String(size));
  try {
    const res = await fetch(apiUrl(`/catalog/products/search?${qp.toString()}`), { cache: "no-store" });
    if (!res.ok) {
      return { items: [], page: 1, size, totalItems: 0, totalPages: 1 };
    }
    const data = await parseJsonSafe<{
      items?: BackendProduct[];
      page?: number;
      size?: number;
      totalItems?: number;
      totalPages?: number;
    }>(res);
    const rawItems = Array.isArray(data?.items) ? data.items : [];
    const items = rawItems.map(toUiProduct);
    return {
      items,
      page: Number(data?.page ?? 1),
      size: Number(data?.size ?? size),
      totalItems: Number(data?.totalItems ?? items.length),
      totalPages: Math.max(1, Number(data?.totalPages ?? 1)),
    };
  } catch {
    return { items: [], page: 1, size, totalItems: 0, totalPages: 1 };
  }
}

export async function getProductForUi(id: string): Promise<UiProduct | null> {
  try {
    const res = await fetch(apiUrl(`/catalog/products/${id}`), { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    const data = await parseJsonSafe<BackendProduct>(res);
    if (!data || typeof data !== "object" || data.id == null) {
      return null;
    }
    return toUiProduct(data);
  } catch {
    return null;
  }
}

export async function createProduct(
  input: {
    productName: string;
    discription: string;
    categoryId: number;
    price: number;
    sku?: string | null;
    brandId?: number | null;
    availability?: number | null;
  },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<BackendProduct> {
  let res: Response;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...adminCatalogHeaders(options),
  };
  const body: Record<string, unknown> = {
    productName: input.productName,
    discription: input.discription,
    categoryId: input.categoryId,
    price: input.price,
  };
  const skuTrim = String(input.sku ?? "").trim();
  if (skuTrim) {
    body.sku = skuTrim;
  }
  if (input.brandId != null && Number.isFinite(Number(input.brandId))) {
    body.brandId = Number(input.brandId);
  }
  if (input.availability != null && Number.isFinite(Number(input.availability))) {
    body.availability = Math.max(0, Math.floor(Number(input.availability)));
  }

  const writeLog = (msg: string) => {
    if (typeof window === "undefined") {
      try {
        const fs = eval("require('fs')");
        fs.appendFileSync("create_product_debug.log", `[${new Date().toISOString()}] ${msg}\n`);
      } catch {}
    }
  };

  writeLog(`[createProduct] input: ${JSON.stringify(input)}`);

  try {
    res = await fetch(apiUrl("/catalog/admin/products"), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err: any) {
    writeLog(`[createProduct] FETCH ERROR: ${err?.message || err}`);
    console.error("[createProduct] FETCH ERROR:", err?.message || err);
    throw new Error("Không kết nối được tới backend (gateway).");
  }

  const status = res.status;
  const headersObj = [...res.headers.entries()];
  const text = await res.text();

  writeLog(`[createProduct] Response Status: ${status}`);
  writeLog(`[createProduct] Response Headers: ${JSON.stringify(headersObj)}`);
  writeLog(`[createProduct] Response Body: ${text}`);

  console.log("[createProduct] Response Status:", status);
  console.log("[createProduct] Response Headers:", JSON.stringify(headersObj));
  console.log("[createProduct] Response Body:", text);

  if (status >= 400) {
    const dummyRes = new Response(text, { status, headers: res.headers });
    await parseProductApiError(dummyRes, "Tạo sản phẩm thất bại");
  }

  let created: BackendProduct = {} as BackendProduct;
  if (text) {
    try {
      created = JSON.parse(text) as BackendProduct;
    } catch (e: any) {
      writeLog(`[createProduct] JSON Parse Error: ${e.message}`);
      console.error("[createProduct] JSON Parse Error:", e.message);
    }
  }

  if (created && created.id != null) {
    writeLog(`[createProduct] Success: Found created.id = ${created.id}`);
    console.log("[createProduct] Success: Found created.id =", created.id);
    return created;
  }

  const loc = res.headers.get("Location") ?? res.headers.get("location");
  writeLog(`[createProduct] Location header: ${loc}`);
  console.log("[createProduct] Location header:", loc);
  if (loc) {
    const m = loc.match(/\/(\d+)(?:\?.*)?$/);
    const id = m?.[1] ? String(m[1]) : "";
    writeLog(`[createProduct] Parsed Location ID: ${id}`);
    console.log("[createProduct] Parsed Location ID:", id);
    if (id) {
      const fetched = await getBackendProductById(id);
      if (fetched && fetched.id != null) {
        writeLog(`[createProduct] Success: Fetched product by Location ID: ${fetched.id}`);
        console.log("[createProduct] Success: Fetched product by Location ID:", fetched.id);
        return fetched;
      }
      writeLog(`[createProduct] Fallback: Returning mock product with ID ${id}`);
      console.log("[createProduct] Fallback: Returning mock product with ID", id);
      return {
        id: Number(id),
        productName: input.productName,
        discription: input.discription,
        categoryId: input.categoryId,
        price: input.price,
        availability: 0,
      };
    }
  }

  if (status === 201 || status === 200) {
    writeLog(`[createProduct] Status is ${status} but ID not found in body/header. Searching for created product by name...`);
    console.log("[createProduct] Status is", status, "but ID not found in body/header. Searching for created product by name...");
    try {
      const queryName = encodeURIComponent(input.productName);
      const searchRes = await fetch(apiUrl(`/catalog/products?name=${queryName}`), { cache: "no-store" });
      if (searchRes.ok) {
        const list = await parseJsonSafe<BackendProduct[]>(searchRes);
        if (list && list.length > 0) {
          const matched = list.reduce((prev, current) => (Number(prev.id) > Number(current.id)) ? prev : current);
          if (matched && matched.id != null) {
            writeLog(`[createProduct] Success: Found created product by name query: ID = ${matched.id}`);
            console.log("[createProduct] Success: Found created product by name query: ID =", matched.id);
            return matched;
          }
        }
      }
    } catch (e: any) {
      writeLog(`[createProduct] Error searching product by name: ${e.message}`);
      console.error("[createProduct] Error searching product by name:", e.message);
    }

    try {
      const listRes = await fetch(apiUrl("/catalog/products"), { cache: "no-store" });
      if (listRes.ok) {
        const list = await parseJsonSafe<BackendProduct[]>(listRes);
        if (list && list.length > 0) {
          const latest = list.reduce((prev, current) => (Number(prev.id) > Number(current.id)) ? prev : current);
          if (latest && latest.id != null) {
            writeLog(`[createProduct] Success: Found latest created product from list: ID = ${latest.id}`);
            console.log("[createProduct] Success: Found latest created product from list: ID =", latest.id);
            return latest;
          }
        }
      }
    } catch (e: any) {
      writeLog(`[createProduct] Error getting products list: ${e.message}`);
      console.error("[createProduct] Error getting products list:", e.message);
    }
  }

  writeLog(`[createProduct] FAILED to find any created product ID.`);
  console.error("[createProduct] FAILED to find any created product ID.");
  throw new Error("Tạo sản phẩm thất bại");
}

/** GET /catalog/products/{id} — dữ liệu thô cho admin (giá số, tồn kho). */
export async function getBackendProductById(id: string): Promise<BackendProduct | null> {
  try {
    const res = await fetch(apiUrl(`/catalog/products/${id}`), { cache: "no-store" });
    if (!res.ok) {
      return null;
    }
    const data = await parseJsonSafe<BackendProduct>(res);
    if (!data || data.id == null) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/** GET /catalog/admin/products/{id} — chi tiết đầy đủ cho quản trị (kể cả ẩn / đã xóa mềm). */
export async function getAdminBackendProductById(
  id: string,
  options?: { accessToken?: string | null },
): Promise<BackendProduct | null> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/products/${id}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) {
      return null;
    }
    const data = await parseJsonSafe<BackendProduct>(res);
    if (!data || data.id == null) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function updateProduct(
  id: string,
  input: {
    productName: string;
    discription: string;
    categoryId: number;
    price: number;
    sku?: string | null;
    brandId?: number | null;
  },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...adminCatalogHeaders(options),
  };
  const body: Record<string, unknown> = {
    productName: input.productName,
    discription: input.discription,
    categoryId: input.categoryId,
    price: input.price,
  };
  const skuTrim = String(input.sku ?? "").trim();
  if (skuTrim) {
    body.sku = skuTrim;
  }
  if (input.brandId != null && Number.isFinite(Number(input.brandId))) {
    body.brandId = Number(input.brandId);
  }
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${id}`), {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Cập nhật sản phẩm thất bại");
  }
}

export async function stockInbound(
  input: { productId: number; variantId?: number; quantity: number; note?: string; unitCost?: number; movementAt?: string },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  const body = {
    productId: input.productId,
    variantId: Number.isFinite(input.variantId as number) && Number(input.variantId) > 0 ? Number(input.variantId) : undefined,
    quantity: Math.max(1, Math.floor(input.quantity)),
    note: input.note?.trim() || undefined,
    unitCost: Number.isFinite(input.unitCost as number) ? Number(input.unitCost) : undefined,
    movementAt: input.movementAt?.trim() || undefined,
    performedBy: options?.username ?? undefined,
  };
  try {
    res = await fetch(apiUrl("/inventory/admin/stock/inbound"), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Nhập kho thất bại");
  }
}

export type AdminStockBalance = {
  id: number;
  productId?: number | null;
  variantId?: number | null;
  quantityOnHand?: number | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
};

export async function listAdminStockBalances(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<AdminStockBalance[]> {
  try {
    const res = await fetch(apiUrl(`/inventory/admin/stock/balance/${productId}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminStockBalance[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export type AdminStockMovement = {
  id: number;
  productId?: number | null;
  variantId?: number | null;
  movementType?: string | null;
  quantity?: number | null;
  referenceType?: string | null;
  referenceId?: number | null;
  note?: string | null;
  unitCost?: number | string | null;
  movementAt?: string | number[] | null;
  balanceAfter?: number | null;
  variant?: {
    id?: number | null;
    size?: string | null;
    color?: string | null;
  } | null;
  createdBy?: string | null;
  createdAt?: string | number[] | null;
};

export async function listAdminStockMovements(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<AdminStockMovement[]> {
  try {
    const res = await fetch(apiUrl(`/inventory/admin/stock/movements/${productId}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminStockMovement[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export type ManualProductRecommendationRow = {
  id: number;
  sourceProductId: number;
  targetProductId: number;
  sortOrder?: number | null;
  reason?: string | null;
  targetProduct?: {
    id?: number | null;
    productName?: string | null;
    sku?: string | null;
  } | null;
};

export type SimilarProductRecommendationRow = {
  productId?: number | null;
  productName?: string | null;
  sku?: string | null;
  categoryId?: number | null;
  price?: number | string | null;
  priceDelta?: number | string | null;
  reason?: string | null;
};

export type UiSimilarProduct = {
  item: UiProduct;
  reason?: string | null;
  priceDelta?: number | null;
};

export async function listAdminManualProductRecommendations(
  productId: number,
  options?: { accessToken?: string | null },
): Promise<ManualProductRecommendationRow[]> {
  try {
    const res = await fetch(apiUrl(`/review/products/${productId}/manual-recommendations`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<ManualProductRecommendationRow[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listAdminSimilarProductRecommendations(
  productId: number,
  options?: { accessToken?: string | null; limit?: number },
): Promise<SimilarProductRecommendationRow[]> {
  const limit = Number.isFinite(options?.limit) ? Number(options?.limit) : 8;
  try {
    const res = await fetch(apiUrl(`/review/products/${productId}/similar-recommendations?limit=${encodeURIComponent(String(limit))}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<SimilarProductRecommendationRow[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listSimilarProductsForUi(
  productId: number,
  options?: { limit?: number },
): Promise<UiSimilarProduct[]> {
  const rows = await listAdminSimilarProductRecommendations(productId, { limit: options?.limit ?? 8 });
  if (!rows.length) {
    return [];
  }

  const enriched = await Promise.all(
    rows.map(async (row) => {
      const pid = Number(row.productId ?? 0);
      if (!Number.isFinite(pid) || pid <= 0) {
        return null;
      }
      const item = await getProductForUi(String(pid));
      if (!item) {
        return null;
      }
      const delta = row.priceDelta != null ? Number(row.priceDelta) : NaN;
      return {
        item,
        reason: row.reason ?? null,
        priceDelta: Number.isFinite(delta) ? delta : null,
      } as UiSimilarProduct;
    }),
  );

  return enriched.filter((it): it is UiSimilarProduct => it != null);
}

export async function createAdminManualProductRecommendation(
  productId: number,
  input: { targetProductId: number; sortOrder?: number | null; reason?: string | null },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  const body = {
    targetProductId: input.targetProductId,
    sortOrder: input.sortOrder ?? undefined,
    reason: input.reason?.trim() || undefined,
    performedBy: options?.username ?? undefined,
  };
  try {
    res = await fetch(apiUrl(`/review/products/${productId}/manual-recommendations`), {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    // Dùng chung parser message cho admin UX (gateway trả text/json tùy service).
    await parseProductApiError(res, "Tạo gợi ý sản phẩm thất bại");
  }
}

export async function deleteAdminManualProductRecommendation(
  productId: number,
  rowId: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  const qs = options?.username ? `?performedBy=${encodeURIComponent(options.username)}` : "";
  try {
    res = await fetch(apiUrl(`/review/products/${productId}/manual-recommendations/${rowId}${qs}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Xóa gợi ý sản phẩm thất bại");
  }
}

export async function deleteProduct(
  id: string,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/products/${id}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Xóa sản phẩm thất bại");
  }
}

export type AdminOrderItem = {
  id?: number | null;
  quantity?: number | null;
  subTotal?: number | string | null;
  productNameSnapshot?: string | null;
  productSkuSnapshot?: string | null;
  productImageSnapshot?: string | null;
  variantId?: number | null;
  variantLabel?: string | null;
  product?: {
    id?: number | null;
    productName?: string | null;
    sku?: string | null;
    price?: number | string | null;
    primaryImageUrl?: string | null;
  } | null;
};

export type AdminOrder = {
  id?: number | null;
  orderNumber?: string | null;
  orderedDate?: string | number[] | null;
  /** Mã vận đơn (có khi shop xác nhận mới sinh). */
  mvd?: string | null;
  /** 4 số cuối SĐT đặt hàng (phục vụ xác minh tra cứu). */
  phoneLast4?: string | null;
  /** Ngày giao dự kiến (LocalDate từ backend Java). */
  estimatedDeliveryDate?: string | number[] | null;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  shippingAddress?: string | null;
  total?: number | string | null;
  userId?: number | null;
  userName?: string | null;
  user?: {
    id?: number | null;
    userName?: string | null;
  } | null;
  items?: AdminOrderItem[] | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
};

export type AdminCart = {
  cartId?: string | null;
  itemCount?: number | null;
  total?: number | string | null;
  items?: AdminOrderItem[] | null;
};

export type AdminUserBrief = {
  id?: number | null;
  userName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  activated?: boolean | null;
  membershipLevel?: string | null;
  totalSpent?: number | string | null;
  completedOrdersCount?: number | null;
  lastLoginAt?: string | number[] | null;
  lastLoginIp?: string | null;
  failedLoginAttempts?: number | null;
  lockoutEndTime?: string | number[] | null;
  createdAt?: string | number[] | null;
  updatedAt?: string | number[] | null;
  role?: {
    id?: number | null;
    roleName?: string | null;
  } | null;
};

export type AdminUserProfile = AdminUserBrief & {
  userDetails?: {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    birthDate?: string | number[] | null;
    gender?: string | null;
    address?: {
      fullAddress?: string | null;
      provinceName?: string | null;
      districtName?: string | null;
      wardName?: string | null;
      streetLine?: string | null;
      isDefault?: boolean | null;
    } | null;
    changeLogs?: Array<{
      id?: number | null;
      changedField?: string | null;
      oldValue?: string | null;
      newValue?: string | null;
      changedAt?: string | number[] | null;
      changedBy?: string | null;
    }> | null;
  } | null;
};

export type AdminUserDevice = {
  id?: number | null;
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
  lastLoginIp?: string | null;
  lastLoginLocation?: string | null;
  lastLoginTimezone?: string | null;
  lastLoginLocale?: string | null;
  lastSeenAt?: string | number[] | null;
  createdAt?: string | number[] | null;
};

export type AdminUserAddress = {
  id?: number | null;
  fullAddress?: string | null;
  provinceName?: string | null;
  districtName?: string | null;
  wardName?: string | null;
  streetLine?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
  isDefault?: boolean | null;
};

export async function listAdminUsers(options?: { accessToken?: string | null }): Promise<AdminUserBrief[]> {
  try {
    const res = await fetch(apiUrl("/accounts/users"), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminUserBrief[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function updateAdminUserRole(
  userId: number,
  input: { roleName: string; performedBy?: string | null },
  options?: { accessToken?: string | null },
): Promise<AdminUserBrief | null> {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const roleName = String(input.roleName ?? "").trim();
  if (!roleName) return null;
  try {
    const res = await fetch(apiUrl(`/accounts/users/${encodeURIComponent(String(id))}/role`), {
      method: "PUT",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...adminCatalogHeaders({ accessToken: options?.accessToken }),
      },
      body: JSON.stringify({
        roleName,
        performedBy: input.performedBy ?? null,
      }),
    });
    if (!res.ok) return null;
    const data = await parseJsonSafe<AdminUserBrief>(res);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export async function unlockAdminUser(
  userId: number,
  options?: { accessToken?: string | null },
): Promise<boolean> {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return false;
  try {
    const res = await fetch(apiUrl(`/accounts/users/${encodeURIComponent(String(id))}/unlock`), {
      method: "PUT",
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listAdminUserDevices(
  userId: number,
  options?: { accessToken?: string | null },
): Promise<AdminUserDevice[]> {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return [];
  try {
    const res = await fetch(apiUrl(`/accounts/users/${encodeURIComponent(String(id))}/devices`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminUserDevice[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listAdminUserAddresses(
  userId: number,
  options?: { accessToken?: string | null },
): Promise<AdminUserAddress[]> {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return [];
  try {
    const res = await fetch(apiUrl(`/accounts/users/${encodeURIComponent(String(id))}/addresses`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminUserAddress[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listAdminOrders(
  options?: { accessToken?: string | null; userId?: number | null },
): Promise<AdminOrder[]> {
  const qs = options?.userId ? `?userId=${encodeURIComponent(String(options.userId))}` : "";
  try {
    const res = await fetch(apiUrl(`/shop/orders${qs}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<AdminOrder[]>(res);
    return Array.isArray(data) ? data.map(normalizeAdminOrder) : [];
  } catch {
    return [];
  }
}

export type AdminOrderPage = {
  items: AdminOrder[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type UserOrder = AdminOrder;
export type ManualOrderLineItemInput = {
  productId: number;
  quantity: number;
  variantId?: number | null;
  variantLabel?: string | null;
};

export async function searchAdminOrdersPage(input?: {
  accessToken?: string | null;
  userId?: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  q?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  page?: number | null;
  size?: number | null;
}): Promise<AdminOrderPage> {
  const params = new URLSearchParams();
  if (input?.userId != null) params.set("userId", String(input.userId));
  if (input?.status) params.set("status", input.status);
  if (input?.paymentStatus) params.set("paymentStatus", input.paymentStatus);
  if (input?.q) params.set("q", input.q);
  if (input?.startDate) params.set("startDate", input.startDate);
  if (input?.endDate) params.set("endDate", input.endDate);
  if (input?.page != null) params.set("page", String(input.page));
  if (input?.size != null) params.set("size", String(input.size));
  const qs = params.toString() ? `?${params.toString()}` : "";

  try {
    const res = await fetch(apiUrl(`/shop/orders/page${qs}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: input?.accessToken }),
    });
    if (!res.ok) {
      return { items: [], page: Number(input?.page ?? 0), size: Number(input?.size ?? 20), totalItems: 0, totalPages: 0 };
    }
    const data = await parseJsonSafe<Partial<AdminOrderPage>>(res);
    return {
      items: Array.isArray(data?.items) ? (data?.items as AdminOrder[]).map(normalizeAdminOrder) : [],
      page: Number(data?.page ?? input?.page ?? 0),
      size: Number(data?.size ?? input?.size ?? 20),
      totalItems: Number(data?.totalItems ?? 0),
      totalPages: Number(data?.totalPages ?? 0),
    };
  } catch {
    return { items: [], page: Number(input?.page ?? 0), size: Number(input?.size ?? 20), totalItems: 0, totalPages: 0 };
  }
}

export async function getAdminOrderById(
  orderId: number,
  options?: { accessToken?: string | null },
): Promise<AdminOrder | null> {
  try {
    const res = await fetch(apiUrl(`/shop/orders/${orderId}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return null;
    const data = await parseJsonSafe<AdminOrder>(res);
    return data && typeof data === "object" ? normalizeAdminOrder(data) : null;
  } catch {
    return null;
  }
}

export async function listMyOrders(options: { accessToken?: string | null; userId?: number | string | null }): Promise<UserOrder[]> {
  const userId = Number(options?.userId);
  if (!Number.isFinite(userId) || userId <= 0) return [];
  try {
    const qs = new URLSearchParams({ userId: String(userId) });
    const res = await fetch(apiUrl(`/shop/orders?${qs.toString()}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return [];
    const data = await parseJsonSafe<UserOrder[]>(res);
    const rows = Array.isArray(data) ? data.map(normalizeAdminOrder) : [];
    return rows.filter((o) => Number(o.user?.id ?? o.userId ?? 0) === userId);
  } catch {
    return [];
  }
}

export async function getMyOrderById(
  orderId: number,
  options: { accessToken?: string | null; userId?: number | string | null },
): Promise<UserOrder | null> {
  const userId = Number(options?.userId);
  if (!Number.isFinite(orderId) || orderId <= 0) return null;
  if (!Number.isFinite(userId) || userId <= 0) return null;
  try {
    const res = await fetch(apiUrl(`/shop/orders/${orderId}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return null;
    const data = await parseJsonSafe<UserOrder>(res);
    if (!data || typeof data !== "object") return null;
    const normalized = normalizeAdminOrder(data);
    const ownerId = Number(normalized.user?.id ?? normalized.userId ?? 0);
    return ownerId === userId ? normalized : null;
  } catch {
    return null;
  }
}

export async function createManualOrder(
  input: {
    userId: number;
    shippingAddress?: string | null;
    paymentMethod?: string | null;
    items: ManualOrderLineItemInput[];
  },
  options?: { accessToken?: string | null },
): Promise<AdminOrder> {
  const userId = Number(input.userId);
  const items = Array.isArray(input.items) ? input.items : [];
  if (!Number.isFinite(userId) || userId <= 0 || items.length === 0) {
    throw new Error("Dữ liệu tạo đơn không hợp lệ.");
  }
  let res: Response;
  try {
    res = await fetch(apiUrl("/shop/orders/manual"), {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...adminCatalogHeaders({ accessToken: options?.accessToken }),
      },
      body: JSON.stringify({
        userId: Math.floor(userId),
        shippingAddress: input.shippingAddress ?? null,
        paymentMethod: input.paymentMethod ?? null,
        items,
      }),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    throw new Error("Đặt lại đơn hàng thất bại.");
  }
  const data = await parseJsonSafe<AdminOrder>(res);
  if (!data || typeof data !== "object") {
    throw new Error("Dữ liệu đơn hàng trả về không hợp lệ.");
  }
  return normalizeAdminOrder(data);
}

export async function checkOrderByMvd(
  mvd: string,
  phoneLast4: string,
  options?: { accessToken?: string | null },
): Promise<AdminOrder | null> {
  const normalizedMvd = String(mvd ?? "").trim();
  const normalizedPhoneLast4 = String(phoneLast4 ?? "").replace(/\D/g, "").slice(-4);
  if (!normalizedMvd || normalizedPhoneLast4.length !== 4) {
    return null;
  }
  const qs = new URLSearchParams({
    mvd: normalizedMvd,
    phoneLast4: normalizedPhoneLast4,
  });
  try {
    const res = await fetch(apiUrl(`/shop/orders/check?${qs.toString()}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) {
      return null;
    }
    const data = await parseJsonSafe<AdminOrder>(res);
    return data && typeof data === "object" ? normalizeAdminOrder(data) : null;
  } catch {
    return null;
  }
}

function normalizeAdminOrder(order: AdminOrder): AdminOrder {
  const userId = order.user?.id ?? order.userId ?? null;
  const userName = order.user?.userName ?? order.userName ?? null;
  return {
    ...order,
    userId,
    userName,
    user: {
      id: userId,
      userName,
    },
  };
}

export async function updateAdminOrderStatus(
  orderId: number,
  input: { status: string; shippingAddress?: string },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<void> {
  let res: Response;
  const body = {
    status: input.status.trim(),
    shippingAddress: input.shippingAddress?.trim() || undefined,
    performedBy: options?.username ?? undefined,
  };
  try {
    res = await fetch(apiUrl(`/shop/orders/${orderId}/status`), {
      method: "PATCH",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (!res.ok) {
    await parseProductApiError(res, "Cập nhật trạng thái đơn hàng thất bại");
  }
}

export async function listAdminCarts(
  options?: { accessToken?: string | null },
): Promise<AdminCart[]> {
  const headers = adminCatalogHeaders({ accessToken: options?.accessToken });
  const gatewayUrl = apiUrl("/shop/carts/admin");
  const directUrl = `${getResolvedCartServiceOrigin()}/carts/admin`;
  const urls = [gatewayUrl, directUrl];
  try {
    for (const url of urls) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(url, {
          cache: "no-store",
          headers,
          signal: controller.signal,
        });
        if (!res.ok) continue;
        const data = await parseJsonSafe<AdminCart[]>(res);
        if (Array.isArray(data)) {
          return data;
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function clearAllAdminCarts(
  options?: { accessToken?: string | null },
): Promise<boolean> {
  const headers = adminCatalogHeaders({ accessToken: options?.accessToken });
  const gatewayUrl = apiUrl("/shop/carts/admin/clear-all");
  const directUrl = `${getResolvedCartServiceOrigin()}/carts/admin/clear-all`;
  const urls = [gatewayUrl, directUrl];
  try {
    for (const url of urls) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(url, {
          method: "DELETE",
          cache: "no-store",
          headers,
          signal: controller.signal,
        });
        if (res.ok) {
          return true;
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function getAdminUserBrief(
  userId: number | string,
  options?: { accessToken?: string | null },
): Promise<AdminUserBrief | null> {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(apiUrl(`/accounts/users/${encodeURIComponent(String(id))}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await parseJsonSafe<AdminUserBrief>(res);
    if (!data || typeof data !== "object") return null;
    return data;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function getAdminUserProfile(
  userId: number | string,
  options?: { accessToken?: string | null },
): Promise<AdminUserProfile | null> {
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return null;
  try {
    const res = await fetch(apiUrl(`/accounts/users/${encodeURIComponent(String(id))}/profile`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return null;
    const data = await parseJsonSafe<AdminUserProfile>(res);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

export type BackendCategory = {
  id: number;
  name: string;
  slug?: string | null;
  deletedAt?: string | number[] | null;
};

/** GET /catalog/categories — danh sách danh mục public (chưa xóa, không ẩn). */
export async function listPublicCategories(): Promise<BackendCategory[]> {
  try {
    const res = await fetch(apiUrl("/catalog/categories"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<BackendCategory[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** GET /catalog/admin/categories — danh sách danh mục (admin). */
export async function listAdminCategories(
  options?: { deletionFilter?: "active" | "deleted" | "all"; accessToken?: string | null },
): Promise<BackendCategory[]> {
  const deleted = options?.deletionFilter ?? "active";
  const qs = `?deleted=${encodeURIComponent(deleted)}`;
  try {
    const res = await fetch(apiUrl(`/catalog/admin/categories${qs}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<BackendCategory[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** POST /catalog/admin/categories — tạo danh mục (name bắt buộc; slug tuỳ chọn, backend có thể tự sinh). */
export async function createCategory(
  input: { name: string; slug?: string },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<BackendCategory> {
  let res: Response;
  const body: Record<string, string> = { name: input.name.trim() };
  if (input.slug?.trim()) {
    body.slug = input.slug.trim();
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...adminCatalogHeaders(options),
  };
  try {
    res = await fetch(apiUrl("/catalog/admin/categories"), {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (res.status === 409) {
    const err = await parseJsonSafe<{ message?: string }>(res);
    throw new Error(`DUPLICATE_NAME:${err?.message ?? "Tên danh mục đã tồn tại"}`);
  }
  if (!res.ok) {
    throw new Error("Tạo danh mục thất bại");
  }
  return parseJsonSafe<BackendCategory>(res);
}

/** GET /catalog/admin/categories/check-name — kiểm tra trùng tên danh mục. */
export async function checkAdminCategoryName(
  name: string,
  excludeId?: number,
  options?: { accessToken?: string | null },
): Promise<boolean> {
  try {
    const query = `name=${encodeURIComponent(name)}` + (excludeId ? `&excludeId=${excludeId}` : "");
    const res = await fetch(apiUrl(`/catalog/admin/categories/check-name?${query}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (!res.ok) return false;
    const data = await parseJsonSafe<{ exists: boolean }>(res);
    return data?.exists ?? false;
  } catch {
    return false;
  }
}

/** GET /catalog/admin/categories/{id} */
export async function getAdminCategory(
  categoryId: number,
  options?: { accessToken?: string | null },
): Promise<BackendCategory | null> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/categories/${categoryId}`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    return parseJsonSafe<BackendCategory>(res);
  } catch {
    return null;
  }
}

/** Sản phẩm liên quan tới danh mục (admin) — GET /catalog/admin/categories/{id}/products */
export type AdminCategoryProductRow = {
  id: number;
  productName: string;
  sku?: string | null;
  price?: number | string | null;
  availability?: number | null;
  categoryId?: number | null;
};

export async function listAdminCategoryProducts(
  categoryId: number,
  options?: { accessToken?: string | null },
): Promise<AdminCategoryProductRow[]> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/categories/${categoryId}/products`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (res.status === 404) {
      return [];
    }
    if (!res.ok) {
      return [];
    }
    const data = await parseJsonSafe<AdminCategoryProductRow[]>(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** POST /catalog/admin/categories/{id}/restore — khôi phục sau xóa mềm (giữ id). */
export async function restoreCategory(
  categoryId: number,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<BackendCategory> {
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/categories/${categoryId}/restore`), {
      method: "POST",
      headers: { ...adminCatalogHeaders(options) },
      cache: "no-store",
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (res.status === 409) {
    const err = await parseJsonSafe<{ error?: string; message?: string }>(res);
    const code = err?.error ?? "CONFLICT";
    throw new Error(`${code}:${err?.message ?? "Không khôi phục được"}`);
  }
  if (!res.ok) {
    const body = await parseJsonSafe<{ message?: string }>(res);
    throw new Error(body?.message?.trim() || "Khôi phục danh mục thất bại");
  }
  return parseJsonSafe<BackendCategory>(res);
}

/** PUT /catalog/admin/categories/{id} */
export async function updateCategory(
  categoryId: number,
  input: { name: string; slug?: string },
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<BackendCategory> {
  const body: Record<string, string> = { name: input.name.trim() };
  if (input.slug?.trim()) {
    body.slug = input.slug.trim();
  }
  let res: Response;
  try {
    res = await fetch(apiUrl(`/catalog/admin/categories/${categoryId}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...adminCatalogHeaders(options) },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new Error("Không kết nối được tới backend (gateway).");
  }
  if (res.status === 409) {
    const err = await parseJsonSafe<{ message?: string }>(res);
    throw new Error(`DUPLICATE_NAME:${err?.message ?? "Tên danh mục đã tồn tại"}`);
  }
  if (!res.ok) {
    throw new Error("Cập nhật danh mục thất bại");
  }
  return parseJsonSafe<BackendCategory>(res);
}

export type CategoryDeletePreviewRes = {
  categoryId: number;
  name: string;
  slug?: string | null;
  productCount: number;
  childCategoryCount: number;
  requiresProductDeleteConfirm: boolean;
};

/** GET …/admin/categories/{id}/delete-preview */
export async function getCategoryDeletePreview(
  categoryId: number,
  options?: { accessToken?: string | null },
): Promise<CategoryDeletePreviewRes | null> {
  try {
    const res = await fetch(apiUrl(`/catalog/admin/categories/${categoryId}/delete-preview`), {
      cache: "no-store",
      headers: adminCatalogHeaders({ accessToken: options?.accessToken }),
    });
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      return null;
    }
    return parseJsonSafe<CategoryDeletePreviewRes>(res);
  } catch {
    return null;
  }
}

export type DeleteCategoryConflict =
  | { error: "REQUIRES_CONFIRMATION"; productCount: number; message?: string }
  | { error: "HAS_CHILD_CATEGORIES"; childCategoryCount: number; message?: string };

/** DELETE …/admin/categories/{id}; nếu còn SP thì đặt confirm=true sau khi người dùng đã xác nhận. */
export async function deleteCategoryRequest(
  categoryId: number,
  confirm: boolean,
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null },
): Promise<{ ok: true } | { ok: false; status: number; conflict?: DeleteCategoryConflict }> {
  const qs = confirm ? "?confirm=true" : "";
  try {
    const res = await fetch(apiUrl(`/catalog/admin/categories/${categoryId}${qs}`), {
      method: "DELETE",
      cache: "no-store",
      headers: adminCatalogHeaders(options),
    });
    if (res.status === 204 || res.status === 200) {
      return { ok: true };
    }
    if (res.status === 409) {
      const body = await parseJsonSafe<{
        error?: string;
        productCount?: number;
        childCategoryCount?: number;
        message?: string;
      }>(res);
      if (body?.error === "REQUIRES_CONFIRMATION") {
        return {
          ok: false,
          status: 409,
          conflict: {
            error: "REQUIRES_CONFIRMATION",
            productCount: Number(body.productCount ?? 0),
            message: body.message,
          },
        };
      }
      if (body?.error === "HAS_CHILD_CATEGORIES") {
        return {
          ok: false,
          status: 409,
          conflict: {
            error: "HAS_CHILD_CATEGORIES",
            childCategoryCount: Number(body.childCategoryCount ?? 0),
            message: body.message,
          },
        };
      }
    }
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

export type ProductExcelRowDto = {
  rowId: number;
  sku: string;
  productName: string;
  description: string;
  price: number;
  brandId?: number;
  brandName?: string;
  categoryId?: number;
  categoryName?: string;
  size: string;
  color: string;
  variantPrice?: number;
  valid: boolean;
  errorMessages: string[];
  specs?: { group?: string; key: string; value: string; unit?: string }[];
};

export async function downloadProductExcelTemplate(options?: { accessToken?: string | null }) {
  const res = await fetch(apiUrl("/catalog/admin/products/excel/template"), {
    method: "GET",
    headers: adminCatalogHeaders(options),
  });

  if (!res.ok) {
    throw new Error("Không thể tải file mẫu");
  }

  return await res.blob();
}

export async function downloadSelectiveInventoryTemplate(
  payload: { productIds: number[]; variantIds: number[] }, 
  options?: { accessToken?: string | null }
) {
  const res = await fetch(apiUrl("/catalog/admin/products/excel/inventory-template"), {
    method: "POST",
    headers: {
      ...adminCatalogHeaders(options),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Không thể tải file mẫu nhập kho");
  }

  return await res.blob();
}

export async function previewProductExcel(
  file: File,
  options?: { accessToken?: string | null; username?: string | null }
): Promise<ProductExcelRowDto[]> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: any = {
    Authorization: `Bearer ${options?.accessToken || ""}`,
  };

  const res = await fetch(apiUrl("/catalog/admin/products/excel/preview"), {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await parseJsonSafe<any>(res);
    throw new Error(err?.message || "Lỗi khi đọc file Excel");
  }

  return await parseJsonSafe<ProductExcelRowDto[]>(res);
}

export async function confirmProductExcelImport(
  rows: ProductExcelRowDto[],
  options?: { accessToken?: string | null; username?: string | null; userId?: string | null }
): Promise<{ successCount: number; errors: string[] }> {
  const headers: any = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${options?.accessToken || ""}`,
    "X-Username": options?.username || "",
    "X-User-Id": options?.userId || "",
  };

  const res = await fetch(apiUrl("/catalog/admin/products/excel/confirm"), {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const err = await parseJsonSafe<any>(res);
    if (err?.errors) {
      return err;
    }
    throw new Error("Lỗi khi lưu dữ liệu");
  }

  return await parseJsonSafe<{ successCount: number; errors: string[] }>(res);
}
export async function getAdminRevenueTrends(input: { accessToken?: string | null; startDate?: string; endDate?: string }): Promise<Array<{ date: string; revenue: number }>> {
  let path = "/shop/admin/analytics/revenue-trends";
  if (input.startDate && input.endDate) {
    path += `?startDate=${input.startDate}&endDate=${input.endDate}`;
  }
  const url = apiUrl(path);
  const res = await fetch(url, {
    headers: adminCatalogHeaders({ accessToken: input.accessToken }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch revenue trends");
    return [];
  }
  return res.json();
}

export async function getAdminLowStockAlerts(input: { accessToken?: string | null; threshold?: number }): Promise<Array<any>> {
  const url = apiUrl(`/inventory/admin/analytics/low-stock?threshold=${input.threshold ?? 10}`);
  const res = await fetch(url, {
    headers: adminCatalogHeaders({ accessToken: input.accessToken }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch low stock");
    return [];
  }
  return res.json();
}

export async function getAdminNewCustomersCount(input: { accessToken?: string | null; startDate?: string; endDate?: string }): Promise<number> {
  let path = "/accounts/admin/analytics/new-customers";
  if (input.startDate && input.endDate) {
    path += `?startDate=${input.startDate}&endDate=${input.endDate}`;
  }
  const url = apiUrl(path);
  const res = await fetch(url, {
    headers: adminCatalogHeaders({ accessToken: input.accessToken }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("Failed to fetch new customers count");
    return 0;
  }
  const data = await res.json();
  return data.newCustomers ?? 0;
}

