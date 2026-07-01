/**
 * Phân quyền frontend dựa trên claim `role` trong JWT (user-service).
 * Cấu hình: ADMIN_ROLES, CATALOG_WRITE_ROLES (env, cách nhau bởi dấu phẩy).
 */

export type JwtPayload = {
  sub?: string;
  uid?: number | string;
  role?: string;
  typ?: string;
  exp?: number;
};

/** Giải mã payload JWT (không verify chữ ký — dùng cho UI; API backend vẫn là nguồn sự thật). */
export function parseJwtPayload(accessToken: string | undefined | null): JwtPayload | null {
  if (!accessToken || typeof accessToken !== "string") {
    return null;
  }
  const parts = accessToken.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const raw = parts[1];
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    // Edge middleware + Node: atob có sẵn trong Next.js
    const decoded = atob(b64 + pad);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function rolesFromEnv(key: string, fallback: string[]): string[] {
  const raw = process.env[key];
  if (!raw?.trim()) {
    return fallback;
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Role được phép vào toàn bộ /admin (xem dashboard, danh sách SP, …). */
export function getAllowedAdminRoles(): string[] {
  // Mặc định chỉ ROLE_ADMIN. Muốn thêm nhân viên: đặt ADMIN_ROLES=ROLE_ADMIN,ROLE_STAFF trong .env.local
  return rolesFromEnv("ADMIN_ROLES", ["ROLE_ADMIN"]);
}

/** Role được tạo/sửa/xóa sản phẩm (POST/DELETE catalog admin). */
export function getCatalogWriteRoles(): string[] {
  return rolesFromEnv("CATALOG_WRITE_ROLES", ["ROLE_ADMIN"]);
}

export function getRoleFromAccessToken(token: string | undefined | null): string | null {
  const p = parseJwtPayload(token);
  const r = p?.role;
  return typeof r === "string" && r.length > 0 ? r : null;
}

export function canAccessAdminArea(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }
  return getAllowedAdminRoles().includes(role);
}

export function canMutateCatalog(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }
  return getCatalogWriteRoles().includes(role);
}

export function getUsernameFromAccessToken(token: string | undefined | null): string | null {
  const p = parseJwtPayload(token);
  const sub = p?.sub;
  return typeof sub === "string" && sub.length > 0 ? sub : null;
}

/** User id từ claim JWT (thường là `uid` từ user-service) — dùng header X-User-Id khi gọi API admin. */
export function getUserIdFromAccessToken(token: string | undefined | null): string | null {
  const p = parseJwtPayload(token);
  const u = p?.uid;
  if (typeof u === "number" && Number.isFinite(u)) {
    return String(u);
  }
  if (typeof u === "string" && u.trim().length > 0) {
    return u.trim();
  }
  return null;
}

/**
 * Kiểm tra token đã hết hạn theo claim `exp` (unix seconds) chưa.
 * Nếu token không parse được hoặc thiếu exp thì coi như không hợp lệ để an toàn.
 */
export function isAccessTokenExpired(token: string | undefined | null, skewSeconds = 15): boolean {
  const p = parseJwtPayload(token);
  if (!p || typeof p.exp !== "number" || !Number.isFinite(p.exp)) {
    return true;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  return p.exp <= nowSec + Math.max(0, Math.floor(skewSeconds));
}
