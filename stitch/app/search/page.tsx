import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { StorefrontLayout } from "@/components/storefront-layout";
import { ProductCard } from "@/components/product-card";
import { searchProductsForUi, listPublicCategories, listMyOrders, resolveCatalogImageUrl, type UiProduct } from "@/lib/api";
import { getUserIdFromAccessToken, getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { listActivePrograms } from "@/lib/sale-api";
import { viOrderStatusLabel, storefrontOrderBadgeTone } from "@/lib/order-status";

export const dynamic = "force-dynamic";

const QUICK_PAGES = [
  {
    label: "Đơn hàng của tôi",
    icon: "receipt_long",
    description: "Theo dõi tiến độ giao hàng, lịch sử mua và chi tiết hóa đơn",
    href: "/my-orders",
    badge: "Đơn hàng",
    keywords: ["don hang", "don", "order", "my orders", "tra cuu don", "hoa don", "lich su mua", "mua hang"],
  },
  {
    label: "Giỏ hàng",
    icon: "shopping_cart",
    description: "Xem và thanh toán các sản phẩm trong giỏ hàng hiện tại",
    href: "/cart",
    badge: "Thanh toán",
    keywords: ["gio hang", "cart", "thanh toan", "gio", "checkout", "mua ngay"],
  },
  {
    label: "Tất cả sản phẩm",
    icon: "storefront",
    description: "Khám phá danh mục thiết bị công nghệ & phụ kiện cao cấp",
    href: "/products",
    badge: "Cửa hàng",
    keywords: ["san pham", "cua hang", "shop", "products", "danh muc", "hang hoa", "thiet bi"],
  },
  {
    label: "Hộp thư thông báo",
    icon: "notifications",
    description: "Cập nhật trạng thái đơn hàng, ưu đãi và tin tức hệ thống",
    href: "/notifications",
    badge: "Tin nhắn",
    keywords: ["thong bao", "notification", "hop thu", "tin nhan", "tin tuc", "alerts"],
  },
  {
    label: "Trang chủ",
    icon: "home",
    description: "The Kinetic Vault - Siêu thị công nghệ Cyber Flagship",
    href: "/",
    badge: "Trang chủ",
    keywords: ["trang chu", "home", "the kinetic vault", "cyber flagship"],
  },
];

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export default async function GlobalSearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tab?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;
  const userId = isLoggedIn ? Number(getUserIdFromAccessToken(accessToken)) : null;

  const sp = searchParams ? await searchParams : undefined;
  const q = String(sp?.q ?? "").trim();
  const activeTab = String(sp?.tab ?? "all");

  const qNorm = removeVietnameseTones(q);

  // 1. Quick Pages matching query
  const matchedPages = q
    ? QUICK_PAGES.filter((p) => {
        const labelNorm = removeVietnameseTones(p.label);
        if (labelNorm.includes(qNorm)) return true;
        return p.keywords.some((kw) => kw.includes(qNorm) || qNorm.includes(kw));
      })
    : QUICK_PAGES;

  // 2. Parallel data retrieval
  const ordersPromise =
    isLoggedIn && userId && userId > 0
      ? listMyOrders({ accessToken, userId }).catch(() => [])
      : Promise.resolve([]);

  const productsPromise = q
    ? searchProductsForUi({ q, status: "all", page: 1, size: 24 }).catch(() => ({
        items: [],
        page: 1,
        size: 24,
        totalItems: 0,
        totalPages: 1,
      }))
    : Promise.resolve({ items: [], page: 1, size: 24, totalItems: 0, totalPages: 1 });

  const categoriesPromise = listPublicCategories().catch(() => []);
  const activeProgramsPromise = listActivePrograms().catch(() => []);

  const [myOrders, searchRes, allCategories, activePrograms] = await Promise.all([
    ordersPromise,
    productsPromise,
    categoriesPromise,
    activeProgramsPromise,
  ]);

  // 3. Matched Orders
  const matchedOrders = q
    ? (myOrders || []).filter((o: any) => {
        const orderIdStr = String(o.id ?? "");
        const orderNumberStr = String(o.orderNumber ?? "");
        const statusStr = String(o.orderStatus ?? o.status ?? "");
        const trackingStr = String(o.trackingNumber ?? "");

        if (
          orderIdStr.includes(q) ||
          orderNumberStr.toLowerCase().includes(q.toLowerCase()) ||
          removeVietnameseTones(statusStr).includes(qNorm) ||
          trackingStr.toLowerCase().includes(q.toLowerCase())
        ) {
          return true;
        }

        if (qNorm.includes("don hang") || qNorm.includes("order") || qNorm.includes("don")) {
          return true;
        }

        if (Array.isArray(o.items)) {
          return o.items.some((it: any) => {
            const pName = removeVietnameseTones(String(it.productName ?? ""));
            return pName.includes(qNorm);
          });
        }
        return false;
      })
    : [];

  // 4. Matched Categories
  const matchedCategories = q
    ? allCategories.filter((c) => {
        const nameNorm = removeVietnameseTones(c.name || "");
        return nameNorm.includes(qNorm);
      })
    : [];

  // 5. Matched Products
  const matchedProducts: UiProduct[] = (searchRes.items || []).filter(
    (p) => !p.isHidden && !p.isDeleted
  );

  const totalResultsCount =
    (matchedPages.length > 0 ? matchedPages.length : 0) +
    matchedOrders.length +
    matchedProducts.length +
    matchedCategories.length;

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="products">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* HERO SEARCH HEADER */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-700 dark:text-indigo-300">
              <span className="material-symbols-outlined text-[15px]">travel_explore</span>
              Tìm kiếm toàn trang
            </span>

            <h1 className="mt-3 font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {q ? (
                <>
                  Kết quả cho <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">&quot;{q}&quot;</span>
                </>
              ) : (
                "Khám phá toàn bộ hệ thống"
              )}
            </h1>

            <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">
              Tìm kiếm sản phẩm, đơn hàng đã đặt, danh mục sản phẩm, hoặc chuyển nhanh tới các trang chức năng.
            </p>

            {/* Main Search Input Form */}
            <form action="/search" method="GET" className="mt-6 flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[22px]">
                  search
                </span>
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Nhập tên sản phẩm, mã đơn hàng, 'đơn hàng', 'giỏ hàng'..."
                  className="w-full rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-zinc-900/90 py-3.5 pl-12 pr-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Tìm kiếm</span>
              </button>
            </form>

            {/* Quick Popular Keywords */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-bold">Gợi ý nhanh:</span>
              {["đơn hàng", "giỏ hàng", "iPhone 15", "Marshall", "MacBook", "Apple Watch"].map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 px-3 py-1 font-semibold text-slate-600 dark:text-zinc-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* RESULTS OVERVIEW TABS */}
        {q && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-4">
            <Link
              href={`/search?q=${encodeURIComponent(q)}&tab=all`}
              className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
              }`}
            >
              Tất cả ({totalResultsCount})
            </Link>

            {matchedPages.length > 0 && (
              <Link
                href={`/search?q=${encodeURIComponent(q)}&tab=pages`}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                  activeTab === "pages"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                }`}
              >
                Trang & Dịch vụ ({matchedPages.length})
              </Link>
            )}

            {matchedOrders.length > 0 && (
              <Link
                href={`/search?q=${encodeURIComponent(q)}&tab=orders`}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                  activeTab === "orders"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                }`}
              >
                Đơn hàng của tôi ({matchedOrders.length})
              </Link>
            )}

            {matchedProducts.length > 0 && (
              <Link
                href={`/search?q=${encodeURIComponent(q)}&tab=products`}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                  activeTab === "products"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                }`}
              >
                Sản phẩm ({matchedProducts.length})
              </Link>
            )}

            {matchedCategories.length > 0 && (
              <Link
                href={`/search?q=${encodeURIComponent(q)}&tab=categories`}
                className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                  activeTab === "categories"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                }`}
              >
                Danh mục ({matchedCategories.length})
              </Link>
            )}
          </div>
        )}

        {/* 1. SECTION: QUICK PAGES & NAVIGATION JUMPS */}
        {(activeTab === "all" || activeTab === "pages") && matchedPages.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-cyan-400 text-[20px]">
                  explore
                </span>
                <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Trang & Dịch vụ phù hợp
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {matchedPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group relative flex items-start gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 border border-indigo-200/80 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[24px]">{page.icon}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors">
                        {page.label}
                      </h3>
                      <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                        {page.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                      {page.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-cyan-400">
                      <span>Đi tới trang</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 2. SECTION: MY ORDERS (If logged in & keyword relates to orders or has matches) */}
        {(activeTab === "all" || activeTab === "orders") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-cyan-400 text-[20px]">
                  receipt_long
                </span>
                <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Đơn hàng của bạn {matchedOrders.length > 0 && `(${matchedOrders.length})`}
                </h2>
              </div>

              <Link
                href="/my-orders"
                className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả đơn hàng</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {!isLoggedIn ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-zinc-950/40 p-6 sm:p-8 text-center backdrop-blur-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 mb-3">
                  <span className="material-symbols-outlined text-[24px]">lock</span>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Đăng nhập để xem và tra cứu đơn hàng của bạn
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Bạn có thể tìm kiếm đơn hàng theo mã đơn, sản phẩm đã mua hoặc trạng thái giao hàng.
                </p>
                <Link
                  href="/login?next=/my-orders"
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  Đăng nhập ngay
                </Link>
              </div>
            ) : matchedOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matchedOrders.map((o: any) => {
                  const statusLabel = viOrderStatusLabel(o.orderStatus || o.status);
                  const tone = storefrontOrderBadgeTone(o.orderStatus || o.status);
                  return (
                    <Link
                      key={o.id}
                      href={`/my-orders`}
                      className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-headline font-black text-sm text-slate-900 dark:text-white">
                            {o.orderNumber || `#${o.id}`}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${tone}`}>
                            {statusLabel}
                          </span>
                        </div>

                        <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400 space-y-1">
                          {o.orderDate && (
                            <p>
                              Ngày đặt: <span className="font-semibold text-slate-700 dark:text-zinc-300">{new Date(o.orderDate).toLocaleDateString("vi-VN")}</span>
                            </p>
                          )}
                          <p>
                            Tổng tiền:{" "}
                            <span className="font-headline font-black text-sm text-indigo-600 dark:text-cyan-400">
                              {o.total ? `${Number(o.total).toLocaleString("vi-VN")} VND` : "—"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-cyan-400">
                        <span>Chi tiết đơn hàng</span>
                        <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-zinc-950/40 p-5 text-center text-xs text-slate-500">
                Không tìm thấy đơn hàng nào khớp với từ khóa &quot;{q}&quot;.
              </div>
            )}
          </section>
        )}

        {/* 3. SECTION: MATCHING CATEGORIES */}
        {(activeTab === "all" || activeTab === "categories") && matchedCategories.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-cyan-400 text-[20px]">
                category
              </span>
              <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Danh mục liên quan ({matchedCategories.length})
              </h2>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {matchedCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 px-4 py-3 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-cyan-400 transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-cyan-400">
                    category
                  </span>
                  <span>{c.name}</span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400 group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. SECTION: MATCHING PRODUCTS */}
        {(activeTab === "all" || activeTab === "products") && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-cyan-400 text-[20px]">
                  inventory_2
                </span>
                <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Sản phẩm tìm thấy {matchedProducts.length > 0 && `(${matchedProducts.length})`}
                </h2>
              </div>

              {matchedProducts.length > 0 && (
                <Link
                  href={`/products?q=${encodeURIComponent(q)}`}
                  className="text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Mở trong trang Sản Phẩm</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              )}
            </div>

            {matchedProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {matchedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    href={`/product/${p.id}`}
                    image={p.heroImage}
                    title={p.name}
                    subtitle={p.category}
                    price={p.price}
                    originalPrice={p.originalPrice}
                    badges={p.badges}
                    hasVariantPriceRange={p.hasVariantPriceRange}
                    minPrice={p.minPrice}
                    maxPrice={p.maxPrice}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 bg-white/60 dark:bg-zinc-950/40 p-8 text-center text-xs text-slate-500">
                <span className="material-symbols-outlined text-[32px] text-slate-300 dark:text-zinc-600 mb-1">
                  inventory_2
                </span>
                <p className="font-bold text-slate-700 dark:text-slate-300">Không có sản phẩm nào khớp với &quot;{q}&quot;</p>
                <p className="mt-1">Thử tìm theo danh mục hoặc từ khóa ngắn gọn hơn.</p>
              </div>
            )}
          </section>
        )}

        {/* 5. EMPTY GLOBAL STATE */}
        {q && totalResultsCount === 0 && (
          <div className="rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10 bg-white/60 dark:bg-zinc-950/40 py-20 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-zinc-900 text-slate-400 mb-4 border border-slate-200 dark:border-white/10">
              <span className="material-symbols-outlined text-[40px]">search_off</span>
            </div>
            <h3 className="font-headline text-lg sm:text-xl font-black text-slate-800 dark:text-white">
              Không tìm thấy kết quả phù hợp cho &quot;{q}&quot;
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Không tìm thấy bất kỳ sản phẩm, đơn hàng, danh mục hoặc trang chức năng nào. Hãy kiểm tra lại lỗi chính tả hoặc thử các từ khóa phổ biến.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white hover:bg-indigo-500 transition"
              >
                Xem tất cả sản phẩm
              </Link>
              <Link
                href="/my-orders"
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-5 py-2.5 text-xs font-black text-slate-700 dark:text-zinc-200 hover:border-slate-400 transition"
              >
                Tra cứu đơn hàng
              </Link>
            </div>
          </div>
        )}
      </main>
    </StorefrontLayout>
  );
}
