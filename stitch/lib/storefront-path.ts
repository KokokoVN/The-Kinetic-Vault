/**
 * Ẩn widget chat trên khu admin (route group (admin) và /admin/*).
 */
const ADMIN_FIRST_SEGMENTS = new Set([
  "dashboard",
  "orders",
  "carts",
  "customers",
  "categories",
  "warehouse",
  "warehouses",
  "activity-log",
]);

export function shouldShowStorefrontChat(pathname: string | null): boolean {
  if (!pathname || pathname === "/") return true;
  if (pathname.startsWith("/admin")) return false;
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && ADMIN_FIRST_SEGMENTS.has(first)) return false;
  return true;
}
