import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/logout-button";
import { HeaderDateTime } from "@/components/header-date-time";
import { getResolvedApiRoot, getResolvedCartServiceOrigin } from "@/app/api/cart/_shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAdminUserBrief, listMyOrders } from "@/lib/api";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { listNotificationsByEmail } from "@/lib/notification-api";

type StorefrontLayoutProps = {
  children: React.ReactNode;
  isLoggedIn: boolean;
  username?: string | null;
  activeMenu?: "home" | "products" | "orders" | "cart" | "profile";
};

type HeaderCounts = {
  notifications: number;
  cart: number;
  orders: number;
};

function menuClass(active: boolean): string {
  return active
    ? "relative flex items-center gap-2 rounded-full bg-indigo-50/80 px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition-all dark:bg-indigo-500/20 dark:text-indigo-300"
    : "relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400";
}

function badge(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n > 99) return "99+";
  return String(Math.floor(n));
}

function cartCountFromPayload(raw: unknown): number {
  function qtyFromList(list: unknown[]): number {
    const qty = list.reduce<number>((sum, it) => {
      if (!it || typeof it !== "object") return sum + 1;
      const row = it as { quantity?: unknown; qty?: unknown; count?: unknown };
      const n = Number(row.quantity ?? row.qty ?? row.count ?? 1);
      return sum + (Number.isFinite(n) && n > 0 ? Math.floor(n) : 1);
    }, 0);
    return Math.max(0, qty);
  }

  function extractCount(value: unknown, depth = 0): number {
    if (depth > 5) return 0;
    if (Array.isArray(value)) return qtyFromList(value);
    if (!value || typeof value !== "object") return 0;
    const obj = value as Record<string, unknown>;

    const direct = Number(obj.itemCount ?? obj.totalItems ?? obj.totalQuantity ?? obj.quantity);
    if (Number.isFinite(direct) && direct > 0) return Math.floor(direct);

    const list =
      (Array.isArray(obj.items) ? obj.items : null) ??
      (Array.isArray(obj.data) ? obj.data : null) ??
      (Array.isArray(obj.content) ? obj.content : null) ??
      (Array.isArray(obj.rows) ? obj.rows : null);
    if (list) return qtyFromList(list);

    const nested =
      obj.cart ??
      obj.payload ??
      obj.result ??
      (obj.data && typeof obj.data === "object" ? obj.data : null) ??
      (obj.content && typeof obj.content === "object" ? obj.content : null);
    return nested ? extractCount(nested, depth + 1) : 0;
  }

  return extractCount(raw);
}

async function fetchCartCount(headers: Record<string, string>): Promise<number> {
  const direct = getResolvedCartServiceOrigin();
  const apiRoot = getResolvedApiRoot();
  const candidates = [`${direct}/cart/items`, `${apiRoot}/shop/cart/items`, `${direct}/cart`, `${apiRoot}/shop/cart`];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store", headers });
      if (!res.ok) continue;
      const data = (await res.json().catch(() => null)) as unknown;
      const count = cartCountFromPayload(data);
      if (count > 0) return count;
    } catch {
      // Try next candidate endpoint.
    }
  }
  return 0;
}

async function resolveHeaderCounts(isLoggedIn: boolean): Promise<HeaderCounts> {
  if (!isLoggedIn) {
    return { notifications: 0, cart: 0, orders: 0 };
  }
  try {
    const jar = await cookies();
    const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
    const userId = getUserIdFromAccessToken(accessToken);
    const numericUserId = Number(userId);

    const isUserValid = Number.isFinite(numericUserId) && numericUserId > 0 && accessToken;
    const cookieCartId = jar.get("cartId")?.value?.trim() ?? "";
    const effectiveCartId = isUserValid ? `cart:user:${Math.floor(numericUserId)}` : cookieCartId;
    
    const headers: Record<string, string> = {};
    if (effectiveCartId) headers.Cookie = `cartId=${effectiveCartId}`;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    // Parallelize promises
    const userPromise = isUserValid ? getAdminUserBrief(numericUserId, { accessToken }).catch(() => null) : Promise.resolve(null);
    const ordersPromise = isUserValid ? listMyOrders({ accessToken, userId: numericUserId }).catch(() => []) : Promise.resolve([]);
    const cartPromise = fetchCartCount(headers).catch(() => 0);

    const [user, myOrders, cart] = await Promise.all([userPromise, ordersPromise, cartPromise]);

    let notifications = 0;
    const email = String(user?.email ?? "").trim();
    if (email) {
      const rows = await listNotificationsByEmail(email).catch(() => []);
      notifications = rows.filter((x) => String(x.status ?? "").toUpperCase() !== "READ").length;
    }

    const orders = myOrders.length;
    return { notifications, cart, orders };
  } catch {
    return { notifications: 0, cart: 0, orders: 0 };
  }
}

export async function StorefrontLayout({
  children,
  isLoggedIn,
  username,
  activeMenu = "home",
}: StorefrontLayoutProps) {
  const counts = await resolveHeaderCounts(isLoggedIn);
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-indigo-200 dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-indigo-900/50">
      {/* Top Banner */}
      <div className="hidden bg-indigo-900 px-4 py-1.5 text-center text-[11px] font-medium text-white sm:block">
        Tưng bừng mua sắm — Freeship toàn quốc cho mọi đơn hàng từ 500k. Đăng ký ngay!
      </div>

      {/* Main Glassmorphism Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/70">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo Section */}
          <div className="flex flex-1 items-center gap-2">
            <Link href="/" className="group relative flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/50">
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]">view_in_ar</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">The Kinetic Vault</h1>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Premium</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden flex-1 justify-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/50 p-1 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
              <Link className={menuClass(activeMenu === "home")} href="/">
                Trang chủ
              </Link>
              <Link className={menuClass(activeMenu === "products")} href="/products">
                Sản phẩm
              </Link>
              <Link className={menuClass(activeMenu === "orders")} href="/my-orders">
                Đơn hàng
              </Link>
            </div>
          </nav>

          {/* Right Section: Utilities & Auth */}
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
            <div className="hidden lg:block">
              <HeaderDateTime />
            </div>

            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <Link href="/notifications" className="group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px] transition-transform group-hover:scale-110">notifications</span>
                  {counts.notifications > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 animate-pulse items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] sm:text-[10px] font-bold text-white dark:border-slate-950">
                      {badge(counts.notifications)}
                    </span>
                  )}
                </Link>

                <Link href="/cart" className="hidden sm:flex group relative h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">shopping_cart</span>
                  {counts.cart > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-[10px] font-bold text-white dark:border-slate-950">
                      {badge(counts.cart)}
                    </span>
                  )}
                </Link>

                <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

                <div className="hidden flex-col items-end sm:flex">
                  <span className="whitespace-nowrap text-[10px] font-bold uppercase text-slate-400">Xin chào</span>
                  <Link href="/profile" className="whitespace-nowrap text-sm font-bold text-slate-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                    {username ?? "User"}
                  </Link>
                </div>
                
                <div className="hidden sm:block">
                  <LogoutButton 
                    variant="header" 
                    redirectTo="/" 
                    className="flex h-10 items-center justify-center rounded-full bg-rose-50 px-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20" 
                  />
                </div>
              </>
            ) : (
              <>
                <Link
                  className="hidden rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:block"
                  href="/login"
                >
                  Đăng nhập
                </Link>
                <Link
                  className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40"
                  href="/register"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-screen pb-32 pt-8 md:pb-16">{children}</main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-200 bg-white pt-16 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            
            {/* Brand Section */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <span className="material-symbols-outlined text-[20px]">view_in_ar</span>
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">The Kinetic Vault</span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Hệ thống thương mại điện tử hiện đại, mang đến trải nghiệm mua sắm mượt mà, nhanh chóng và an toàn tuyệt đối.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400">
                  <span className="material-symbols-outlined">public</span>
                </a>
                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400">
                  <span className="material-symbols-outlined">share</span>
                </a>
              </div>
            </div>

            {/* Links Section 1 */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Dịch vụ khách hàng</h3>
              <ul className="space-y-4">
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Trung tâm hỗ trợ</Link></li>
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Hướng dẫn mua hàng</Link></li>
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Chính sách giao hàng</Link></li>
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Chính sách đổi trả</Link></li>
              </ul>
            </div>

            {/* Links Section 2 */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Về chúng tôi</h3>
              <ul className="space-y-4">
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Giới thiệu công ty</Link></li>
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Tuyển dụng</Link></li>
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Điều khoản sử dụng</Link></li>
                <li><Link href="/" className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">Chính sách bảo mật</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">Đăng ký nhận tin</h3>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Nhận các ưu đãi đặc biệt và thông tin sản phẩm mới nhất.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button type="button" className="flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-white transition-all hover:bg-indigo-700">
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-slate-100 bg-slate-50 py-6 dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8 lg:text-left">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              &copy; {new Date().getFullYear()} The Kinetic Vault. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Thiết kế bằng</span>
              <span className="material-symbols-outlined text-rose-500">favorite</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-3rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-white/20 bg-slate-900/80 px-2 py-2 backdrop-blur-xl shadow-2xl shadow-indigo-500/20 dark:bg-slate-800/90 md:hidden">
        <Link 
          href="/" 
          className={`relative flex flex-col items-center justify-center p-2 transition-all ${activeMenu === "home" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          {activeMenu === "home" && <div className="absolute inset-0 rounded-full bg-white/10" />}
          <span className="material-symbols-outlined relative z-10 text-[24px]">home</span>
          <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest mt-1">Home</span>
        </Link>
        <Link 
          href="/products" 
          className={`relative flex flex-col items-center justify-center p-2 transition-all ${activeMenu === "products" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          {activeMenu === "products" && <div className="absolute inset-0 rounded-full bg-white/10" />}
          <span className="material-symbols-outlined relative z-10 text-[24px]">storefront</span>
          <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest mt-1">Shop</span>
        </Link>
        <Link 
          href="/cart" 
          className={`relative flex flex-col items-center justify-center p-2 transition-all ${activeMenu === "cart" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          {activeMenu === "cart" && <div className="absolute inset-0 rounded-full bg-white/10" />}
          <span className="material-symbols-outlined relative z-10 text-[24px]">shopping_bag</span>
          {counts.cart > 0 && <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[8px] font-bold text-white shadow-sm">{badge(counts.cart)}</span>}
          <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest mt-1">Cart</span>
        </Link>
        <Link 
          href="/my-orders" 
          className={`relative flex flex-col items-center justify-center p-2 transition-all ${activeMenu === "orders" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          {activeMenu === "orders" && <div className="absolute inset-0 rounded-full bg-white/10" />}
          <span className="material-symbols-outlined relative z-10 text-[24px]">receipt_long</span>
          <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest mt-1">Orders</span>
        </Link>
        <Link 
          href={isLoggedIn ? "/profile" : "/login"} 
          className={`relative flex flex-col items-center justify-center p-2 transition-all ${activeMenu === "profile" ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
        >
          {activeMenu === "profile" && <div className="absolute inset-0 rounded-full bg-white/10" />}
          <span className="material-symbols-outlined relative z-10 text-[24px]">person</span>
          <span className="relative z-10 text-[9px] font-bold uppercase tracking-widest mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
