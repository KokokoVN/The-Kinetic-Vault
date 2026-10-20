import Link from "next/link";
import { cookies } from "next/headers";
import { LogoutButton } from "@/components/logout-button";
import { HeaderDateTime } from "@/components/header-date-time";
import { HeaderWeather } from "@/components/header-weather";
import { getResolvedApiRoot, getResolvedCartServiceOrigin } from "@/app/api/cart/_shared";
import { ThemeToggle } from "@/components/theme-toggle";
import { StorefrontHeaderSearch } from "@/components/storefront-header-search";
import { getAdminUserBrief, listMyOrders, getStoreContact, DEFAULT_STORE_CONTACT, fetchWithTimeout } from "@/lib/api";
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
    ? "relative flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white px-4 py-2 text-xs font-black shadow-[0_4px_16px_rgba(99,102,241,0.35)] ring-1 ring-white/25 transition-all duration-200 backdrop-blur-md whitespace-nowrap shrink-0"
    : "relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-300 transition-all duration-200 hover:bg-slate-200/60 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-cyan-300 hover:scale-[1.02] whitespace-nowrap shrink-0";
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
  const apiRoot = getResolvedApiRoot();
  const direct = getResolvedCartServiceOrigin();
  const candidates = [`${apiRoot}/shop/cart`, `${direct}/cart`];
  for (const url of candidates) {
    try {
      const res = await fetchWithTimeout(url, { cache: "no-store", headers }, 2000);
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
  const contact = await getStoreContact().catch(() => DEFAULT_STORE_CONTACT);
  return (
    <div className="bg-[#f8fafc] dark:bg-[#060810] min-h-screen text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 relative overflow-x-hidden transition-colors duration-300">
      {/* Top Banner with subtle shimmering gradient */}
      <div className="hidden relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0a0d18] to-slate-950 text-white border-b border-indigo-500/20 px-4 py-2 text-center text-xs font-semibold sm:block backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_12px_rgba(251,146,60,0.6)] animate-pulse">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              VIP PRIVILEGE
            </span>
            <span className="text-zinc-300 font-medium tracking-wide">
              Freeship toàn quốc từ 500.000₫ · Bảo hành chính hãng 1 đổi 1 trong 30 ngày.
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-[11px] font-bold text-zinc-400">
            <span className="inline-flex items-center gap-1 text-cyan-400">
              <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
              Hỏa tốc 2H
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              100% Chính Hãng
            </span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphism Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-white/[0.06] bg-white/75 dark:bg-[#060810]/75 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gradient-to-r after:from-transparent after:via-indigo-500/50 dark:after:via-cyan-400/40 after:to-transparent after:shadow-[0_0_8px_rgba(99,102,241,0.5)]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          
          {/* Logo Section */}
          <div className="flex shrink-0 items-center">
            <Link href="/" className="group relative flex shrink-0 items-center gap-3">
              {/* Ambient Hover Glow behind Logo */}
              <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-indigo-500/15 dark:bg-cyan-500/15 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

              {/* 3D Cyber Emblem / Holographic Gem */}
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] ring-1 ring-white/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_4px_28px_rgba(6,182,212,0.55)] overflow-hidden">
                {/* Specular glass reflection on top half */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent rounded-t-2xl" />
                
                {/* Core 3D AR Icon */}
                <span className="material-symbols-outlined text-[24px] relative z-10 transition-transform duration-300 group-hover:rotate-6 drop-shadow-sm">
                  view_in_ar
                </span>

                {/* Integrated Cyber Corner Notch Indicator (Không lòi ra ngoài) */}
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 z-20">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300 shadow-[0_0_6px_#22d3ee]" />
                </span>
              </div>

              {/* Brand Typography & Cyber Tagline */}
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="font-headline text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-800 dark:from-white dark:via-cyan-100 dark:to-indigo-200 bg-clip-text text-transparent whitespace-nowrap transition-colors duration-200 drop-shadow-xs">
                  The Kinetic Vault
                </span>
                
                {/* Cyber Flagship Micro-Capsule */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50/80 dark:bg-cyan-950/40 border border-indigo-200/60 dark:border-cyan-500/30 px-2 py-0.5 shadow-xs transition-all duration-200 group-hover:border-indigo-400/80 dark:group-hover:border-cyan-400/60">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                  </span>
                  <span className="text-[8.5px] font-black uppercase tracking-[0.25em] text-indigo-700 dark:text-cyan-300 whitespace-nowrap">
                    Cyber Flagship
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Capsule */}
          <nav className="hidden shrink-0 items-center justify-center md:flex">
            <div className="flex items-center gap-1 rounded-full border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-1.5 shadow-xs dark:shadow-2xl backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/[0.05]">
              <Link className={menuClass(activeMenu === "home")} href="/">
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span className="whitespace-nowrap">Trang chủ</span>
              </Link>
              <Link className={menuClass(activeMenu === "products")} href="/products">
                <span className="material-symbols-outlined text-[18px]">storefront</span>
                <span className="whitespace-nowrap">Sản phẩm</span>
              </Link>
              <Link className={menuClass(activeMenu === "orders")} href="/my-orders">
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                <span className="whitespace-nowrap">Đơn hàng</span>
              </Link>
            </div>
          </nav>

          {/* Right Section: Utilities & Auth */}
          <div className="flex shrink-0 items-center justify-end gap-2.5 sm:gap-3">
            <StorefrontHeaderSearch />

            <HeaderDateTime />

            <HeaderWeather />

            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <Link 
                  href="/notifications" 
                  aria-label="Thông báo"
                  title="Thông báo hệ thống"
                  className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-110">notifications</span>
                  {counts.notifications > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full border-2 border-white dark:border-[#060810] bg-gradient-to-r from-rose-500 to-pink-500 text-[9px] font-black text-white shadow-[0_0_8px_rgba(244,63,94,0.5)]">
                      {badge(counts.notifications)}
                    </span>
                  )}
                </Link>

                <Link 
                  href="/cart" 
                  aria-label="Giỏ hàng"
                  title="Giỏ hàng của bạn"
                  className="hidden sm:flex group relative h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-slate-700 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[19px] transition-transform duration-200 group-hover:scale-110">shopping_cart</span>
                  {counts.cart > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] px-1 items-center justify-center rounded-full border-2 border-white dark:border-[#060810] bg-gradient-to-r from-indigo-600 to-cyan-500 text-[9px] font-black text-white shadow-[0_0_8px_rgba(99,102,241,0.5)]">
                      {badge(counts.cart)}
                    </span>
                  )}
                </Link>

                <div className="hidden h-6 w-px bg-slate-200/80 dark:bg-white/10 sm:block shrink-0" />

                {/* Cyber Identity Card */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Link 
                    href="/profile" 
                    className="group flex items-center gap-2.5 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-3 py-1.5 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    title="Xem hồ sơ cá nhân"
                  >
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-xs">
                      <span className="material-symbols-outlined text-[18px]">
                        {username?.toLowerCase() === "admin" ? "shield_person" : "person"}
                      </span>
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <div className="flex items-center gap-1.5">
                        {username?.toLowerCase() === "admin" ? (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                            <span className="material-symbols-outlined text-[10px]">verified</span>
                            ADMIN VIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-500/15 dark:bg-cyan-500/20 px-1.5 py-0.2 text-[8px] font-black uppercase text-indigo-700 dark:text-cyan-300">
                            VIP MEMBER
                          </span>
                        )}
                      </div>
                      <span className="whitespace-nowrap text-xs font-black text-slate-900 dark:text-white transition-colors group-hover:text-indigo-600 dark:group-hover:text-cyan-300">
                        {username ?? "User"}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5">
                      arrow_forward_ios
                    </span>
                  </Link>

                  {username?.toLowerCase() === "admin" && (
                    <Link
                      href="/admin"
                      title="Truy cập Portal Quản trị viên"
                      className="hidden lg:inline-flex items-center gap-1 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-700 dark:text-cyan-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      <span>Quản trị</span>
                    </Link>
                  )}

                  <LogoutButton 
                    variant="header" 
                    redirectTo="/" 
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  className="hidden sm:inline-flex shrink-0 whitespace-nowrap items-center rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-4.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-white"
                  href="/login"
                >
                  Đăng nhập
                </Link>
                <Link
                  className="shrink-0 whitespace-nowrap rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 px-5 py-2 text-xs font-black text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 transition-all duration-200 hover:scale-105 hover:shadow-indigo-500/45 active:scale-95"
                  href="/register"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-screen pb-32 pt-6 md:pb-16">{children}</main>

      {/* Flagship Luxury Footer */}
      <footer className="relative overflow-hidden border-t border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#07090e] pt-16 pb-12 transition-colors duration-300">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -left-48 bottom-0 h-96 w-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-48 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* 4 Trust pillars */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Giao Hàng Siêu Tốc</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Nội thành 2h, toàn quốc 2-3 ngày</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">100% Chính Hãng</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Cam kết bảo hành ủy quyền toàn quốc</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span className="material-symbols-outlined text-2xl">published_with_changes</span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Đổi Trả 7 Ngày</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Miễn phí nếu phát sinh lỗi phần cứng</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-white/[0.02] p-5 backdrop-blur-xl">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Hỗ Trợ 24/7</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Đội ngũ kỹ thuật viên chuyên sâu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            
            {/* Brand & Store Contact Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/30">
                  <span className="material-symbols-outlined text-[22px]">view_in_ar</span>
                </div>
                <div>
                  <span className="font-headline text-lg font-black tracking-tight text-slate-900 dark:text-white">{contact.storeName || "The Kinetic Vault"}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Cyber Flagship Store</p>
                </div>
              </Link>
              
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {contact.description || "Hệ sinh thái thương mại điện tử công nghệ cao, cam kết sản phẩm chính hãng và dịch vụ tận tâm."}
              </p>

              {/* Dynamic Store Contact Details */}
              <div className="space-y-2 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-indigo-500 shrink-0 text-[18px]">location_on</span>
                  <div className="leading-snug">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{contact.address}</span>
                    {contact.googleMapsUrl && (
                      <div>
                        <a 
                          href={contact.googleMapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500 dark:text-cyan-400 dark:hover:text-cyan-300 inline-flex items-center gap-1 mt-0.5"
                        >
                          Xem bản đồ đường đi
                          <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-indigo-500 shrink-0 text-[18px]">call</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {contact.hotline && (
                      <span className="font-bold text-slate-900 dark:text-white">Hotline: {contact.hotline}</span>
                    )}
                    {contact.phoneNumber && contact.phoneNumber !== contact.hotline && (
                      <span className="text-slate-500 dark:text-slate-400 font-medium">({contact.phoneNumber})</span>
                    )}
                  </div>
                </div>

                {contact.email && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-indigo-500 shrink-0 text-[18px]">mail</span>
                    <a href={`mailto:${contact.email}`} className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-cyan-400 font-medium">
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.openingHours && (
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-indigo-500 shrink-0 text-[18px]">schedule</span>
                    <span>{contact.openingHours}</span>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="flex gap-2.5 pt-1">
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-base">public</span>
                  </a>
                )}
                {contact.zaloPhone && (
                  <a
                    href={`https://zalo.me/${contact.zaloPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Zalo: ${contact.zaloPhone}`}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-colors hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-white/10 text-[11px] font-black"
                  >
                    Zalo
                  </a>
                )}
                {contact.tiktokUrl && (
                  <a
                    href={contact.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-colors hover:text-pink-500 dark:hover:text-pink-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-base">music_note</span>
                  </a>
                )}
                {contact.instagramUrl && (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-colors hover:text-purple-500 dark:hover:text-purple-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                  </a>
                )}
              </div>
            </div>

            {/* Links Section 1 */}
            <div>
              <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Dịch vụ khách hàng</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Trung tâm trợ giúp & CSKH</Link></li>
                <li><Link href="/products" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Danh mục sản phẩm chính hãng</Link></li>
                <li><Link href="/my-orders" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Tra cứu đơn hàng trực tuyến</Link></li>
                <li><Link href="/" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Chính sách giao nhận & thanh toán</Link></li>
              </ul>
            </div>

            {/* Links Section 2 */}
            <div>
              <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Hệ thống & Đối tác</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Về The Kinetic Vault</Link></li>
                <li><Link href="/admin/dashboard" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Cổng quản trị (Admin Portal)</Link></li>
                <li><Link href="/" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Điều khoản & Bảo mật thông tin</Link></li>
                <li><Link href="/" className="text-xs text-slate-600 dark:text-slate-400 transition-colors hover:text-indigo-600 dark:hover:text-cyan-400">Chính sách hoàn tiền 100%</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Bản tin công nghệ</h3>
              <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">Đăng ký để nhận voucher ưu đãi 100k và cập nhật sản phẩm công nghệ mới nhất.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  className="w-full min-w-0 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10"
                />
                <button 
                  type="button" 
                  className="flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-white transition-all hover:scale-105 shadow-md shadow-indigo-500/20"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-slate-200/80 dark:border-white/[0.06] pt-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 lg:px-8 lg:text-left">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} The Kinetic Vault E-Commerce Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Bản quyền phát triển bởi</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">Kinetic Dev Team</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Navigation */}
      <nav className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-full border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-[#0b0f19]/90 px-3 py-2 backdrop-blur-2xl shadow-xl shadow-slate-300/40 dark:shadow-2xl dark:shadow-black/80 md:hidden ring-1 ring-slate-200/50 dark:ring-white/10">
        <Link 
          href="/" 
          className={`relative flex flex-col items-center justify-center px-3 py-1.5 transition-all ${activeMenu === "home" ? "text-indigo-600 dark:text-cyan-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
        >
          {activeMenu === "home" && <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 ring-1 ring-indigo-500/30 dark:ring-cyan-500/30" />}
          <span className="material-symbols-outlined relative z-10 text-[22px]">home</span>
          <span className="relative z-10 text-[8px] uppercase tracking-wider mt-0.5">Trang chủ</span>
        </Link>
        <Link 
          href="/products" 
          className={`relative flex flex-col items-center justify-center px-3 py-1.5 transition-all ${activeMenu === "products" ? "text-indigo-600 dark:text-cyan-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
        >
          {activeMenu === "products" && <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 ring-1 ring-indigo-500/30 dark:ring-cyan-500/30" />}
          <span className="material-symbols-outlined relative z-10 text-[22px]">storefront</span>
          <span className="relative z-10 text-[8px] uppercase tracking-wider mt-0.5">Cửa hàng</span>
        </Link>
        <Link 
          href="/cart" 
          className={`relative flex flex-col items-center justify-center px-3 py-1.5 transition-all ${activeMenu === "cart" ? "text-indigo-600 dark:text-cyan-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
        >
          {activeMenu === "cart" && <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 ring-1 ring-indigo-500/30 dark:ring-cyan-500/30" />}
          <div className="relative">
            <span className="material-symbols-outlined relative z-10 text-[22px]">shopping_cart</span>
            {counts.cart > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[8px] font-black text-white shadow-sm ring-1 ring-white/20">
                {badge(counts.cart)}
              </span>
            )}
          </div>
          <span className="relative z-10 text-[8px] uppercase tracking-wider mt-0.5">Giỏ hàng</span>
        </Link>
        <Link 
          href="/my-orders" 
          className={`relative flex flex-col items-center justify-center px-3 py-1.5 transition-all ${activeMenu === "orders" ? "text-indigo-600 dark:text-cyan-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
        >
          {activeMenu === "orders" && <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 ring-1 ring-indigo-500/30 dark:ring-cyan-500/30" />}
          <span className="material-symbols-outlined relative z-10 text-[22px]">receipt_long</span>
          <span className="relative z-10 text-[8px] uppercase tracking-wider mt-0.5">Đơn mua</span>
        </Link>
        <Link 
          href={isLoggedIn ? "/profile" : "/login"} 
          className={`relative flex flex-col items-center justify-center px-3 py-1.5 transition-all ${activeMenu === "profile" ? "text-indigo-600 dark:text-cyan-400 font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"}`}
        >
          {activeMenu === "profile" && <div className="absolute inset-0 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 ring-1 ring-indigo-500/30 dark:ring-cyan-500/30" />}
          <span className="material-symbols-outlined relative z-10 text-[22px]">person</span>
          <span className="relative z-10 text-[8px] uppercase tracking-wider mt-0.5">Cá nhân</span>
        </Link>
      </nav>
    </div>
  );
}

