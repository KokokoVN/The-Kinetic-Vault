import Link from "next/link";
import { cookies } from "next/headers";
import {
  listLatestProducts,
  listHotProducts,
  listProductsByIds,
  listPublicCategories,
  searchProductsForUi,
  getProductsForUi,
  getProductsByCategoryForUi
} from "@/lib/api";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { FloatingNotice } from "@/components/floating-notice";
import { ProductCard } from "@/components/product-card";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { StorefrontLayout } from "@/components/storefront-layout";
import { StorefrontHeroBanner } from "@/components/storefront-hero-banner";
import { CategoryCarousel } from "@/components/category-carousel";
import { listActiveBanners, listActivePrograms } from "@/lib/sale-api";
import { CountdownTimer } from "@/components/countdown-timer";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; category?: string; page?: string; size?: string; notice?: string }>;
}) {
  function clampInt(raw: string, fallback: number, min: number, max: number): number {
    const n = Math.floor(Number(raw));
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;
  const resolved = searchParams ? await searchParams : undefined;
  const keyword = String(resolved?.q ?? "").trim();
  const categoryId = Number(String(resolved?.category ?? ""));
  const size = clampInt(String(resolved?.size ?? "12"), 12, 8, 50);
  const page = Math.max(1, Number(String(resolved?.page ?? "1")) || 1);
  const notice = String(resolved?.notice ?? "").trim();
  const noticeMessage =
    notice === "login_success"
      ? "Đăng nhập thành công. Chào mừng bạn quay lại!"
      : notice === "register_success"
        ? "Đăng ký tài khoản thành công. Vui lòng kiểm tra email để kích hoạt."
        : "";
  const pageSize = size;
  const [
    categories,
    banners,
    newestProducts,
    hotProducts,
    activeSalePrograms,
  ] = await Promise.all([
    listPublicCategories().catch(() => []),
    listActiveBanners().catch(() => []),
    listLatestProducts().catch(() => []),
    listHotProducts(8).catch(() => []),
    listActivePrograms().catch(() => []),
  ]);
  
  banners.sort((a, b) => (a.position || 0) - (b.position || 0));

  const saleProductIds = new Set<number>();
  activeSalePrograms.forEach(program => {
    program.items?.forEach(item => {
      saleProductIds.add(item.productId);
    });
  });
  
  const formatVnd = (val: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  function applySaleInfo(p: any, defaultBadges: string[]) {
    let bestDiscountValue = 0;
    let salePrice = p.minPrice ?? p.rawPrice ?? 0;
    let originalPrice = salePrice;
    let saleBadge: string | null = null;
    let finalMinPrice = p.minPrice;
    let finalMaxPrice = p.maxPrice;

    activeSalePrograms.forEach(program => {
      const hasProduct = program.items.some(item => item.productId === Number(p.id) && (item.promoQtyLimit == null || item.promoQtyLimit > 0));
      if (hasProduct) {
        let currentDiscountValue = 0;
        let currentSalePrice = originalPrice;
        let currentMinPrice = p.minPrice;
        let currentMaxPrice = p.maxPrice;
        let currentBadge = "";

        if (program.discountType === "PERCENT") {
          currentDiscountValue = (p.rawPrice * program.discountValue) / 100;
          currentSalePrice = p.rawPrice - currentDiscountValue;
          if (currentMinPrice != null) currentMinPrice = currentMinPrice - (currentMinPrice * program.discountValue) / 100;
          if (currentMaxPrice != null) currentMaxPrice = currentMaxPrice - (currentMaxPrice * program.discountValue) / 100;
          currentBadge = `GIẢM ${program.discountValue}%`;
        } else if (program.discountType === "AMOUNT") {
          currentSalePrice = program.discountValue;
          currentDiscountValue = Math.max(0, p.rawPrice - program.discountValue);
          if (currentMinPrice != null) currentMinPrice = program.discountValue;
          if (currentMaxPrice != null) currentMaxPrice = program.discountValue;
          
          if (program.discountValue >= 1000) {
            currentBadge = `ĐỒNG GIÁ ${program.discountValue / 1000}K`;
          } else {
            currentBadge = "SALE";
          }
        }
        
        if (currentDiscountValue > bestDiscountValue) {
          bestDiscountValue = currentDiscountValue;
          salePrice = currentSalePrice;
          finalMinPrice = currentMinPrice;
          finalMaxPrice = currentMaxPrice;
          saleBadge = currentBadge;
        }
      }
    });

    const finalBadges = [...defaultBadges];
    if (saleBadge) finalBadges.push(saleBadge);

    return {
      ...p,
      price: bestDiscountValue > 0 ? formatVnd(salePrice) : p.price,
      minPrice: bestDiscountValue > 0 ? finalMinPrice : p.minPrice,
      maxPrice: bestDiscountValue > 0 ? finalMaxPrice : p.maxPrice,
      originalPrice: bestDiscountValue > 0 ? originalPrice : null,
      badges: finalBadges.length > 0 ? finalBadges : ["SALE"]
    };
  }

  const rawSaleProductsPromise = listProductsByIds(Array.from(saleProductIds)).catch(() => []);
  const productsPromise = keyword
    ? searchProductsForUi({ q: keyword, size: 50, status: "all" }).then(res => res.items).catch(() => [])
    : Number.isFinite(categoryId) && categoryId > 0
      ? getProductsByCategoryForUi(categoryId).catch(() => [])
      : getProductsForUi().catch(() => []);

  const [rawSaleProducts, products] = await Promise.all([rawSaleProductsPromise, productsPromise]);

  const saleProducts = rawSaleProducts.map(p => applySaleInfo(p, []));
  const earliestEndAt = activeSalePrograms.reduce((min, p) => !min || new Date(p.endAt) < new Date(min) ? p.endAt : min, null as string | null);
  const newProductsMapped = newestProducts.map(p => applySaleInfo(p, ["MỚI"]));
  const hotProductsMapped = hotProducts.map(p => applySaleInfo(p, ["HOT"]));

  const featuredSource = products;
  const totalPages = Math.max(1, Math.ceil(featuredSource.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const featured = featuredSource.slice(pageStart, pageStart + pageSize).map((p) => applySaleInfo({
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    rawPrice: p.rawPrice,
    minPrice: "minPrice" in p ? p.minPrice : null,
    maxPrice: "maxPrice" in p ? p.maxPrice : null,
    hasVariantPriceRange: "hasVariantPriceRange" in p ? p.hasVariantPriceRange : false,
    heroImage: p.heroImage,
  }, []));

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant="success" /> : null}
      <main className="min-h-screen pb-20 bg-white dark:bg-slate-950 transition-colors duration-300">
        <section className="px-6 py-8">
          <StorefrontHeroBanner banners={banners} />
        </section>

        <section className="px-6 py-12 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/50">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10 flex flex-col items-center justify-center gap-3 text-center">
              <span className="rounded-full bg-blue-100/80 dark:bg-blue-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-500/20">
                Explore Collection
              </span>
              <h3 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Danh mục nổi bật
              </h3>
            </div>
            <CategoryCarousel categories={categories} />
          </div>
        </section>

        {/* NEW PRODUCTS */}
        <section id="san-pham-moi" className="px-6 py-16">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-12 flex flex-col items-center justify-center gap-3 text-center">
              <span className="rounded-full bg-indigo-100 dark:bg-indigo-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20">
                New Arrivals
              </span>
              <h3 className="font-headline text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
                Sản phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">Mới</span>
              </h3>
            </div>
            {newProductsMapped.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium">Chưa có sản phẩm mới nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                {newProductsMapped.map((item) => (
                  <ProductCard
                    key={item.id}
                    href={`/product/${item.id}`}
                    image={item.heroImage}
                    title={item.name}
                    subtitle={item.subtitle}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    badges={item.badges}
                    hasVariantPriceRange={item.hasVariantPriceRange}
                    minPrice={item.minPrice}
                    maxPrice={item.maxPrice}
                    footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HOT PRODUCTS */}
        <section id="san-pham-hot" className="px-6 py-16 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-12 flex flex-col items-center justify-center gap-3 text-center">
              <span className="rounded-full bg-amber-100 dark:bg-amber-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-500 border border-amber-200/50 dark:border-amber-500/20">
                Best Sellers
              </span>
              <h3 className="font-headline text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
                Sản phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Bán Chạy</span>
              </h3>
            </div>
            {hotProductsMapped.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium">Chưa có sản phẩm bán chạy nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                {hotProductsMapped.map((item) => (
                  <ProductCard
                    key={item.id}
                    href={`/product/${item.id}`}
                    image={item.heroImage}
                    title={item.name}
                    subtitle={item.subtitle}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    badges={item.badges}
                    hasVariantPriceRange={item.hasVariantPriceRange}
                    minPrice={item.minPrice}
                    maxPrice={item.maxPrice}
                    footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SALE PRODUCTS */}
        <section id="san-pham-sale" className="px-6 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-rose-50/50 dark:bg-rose-950/20" />
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-rose-400/10 blur-[100px]" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-pink-400/10 blur-[100px]" />

          <div className="mx-auto max-w-screen-2xl relative z-10">
            <div className="mb-12 flex flex-col items-center justify-center gap-3 text-center">
              <span className="rounded-full bg-rose-100 dark:bg-rose-500/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/30 shadow-sm">
                Hot Deal
              </span>
              <h3 className="font-headline text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-5xl">
                Siêu <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Khuyến Mãi</span>
              </h3>
              {earliestEndAt && saleProducts.length > 0 && <CountdownTimer endAt={earliestEndAt} />}
            </div>
            
            {saleProducts.length === 0 ? (
              <div className="py-12 text-center rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-white dark:border-slate-800 backdrop-blur-xl shadow-lg">
                <p className="text-lg font-bold text-slate-800 dark:text-white">
                  Hiện chưa có chương trình Siêu Khuyến Mãi nào diễn ra.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Bạn vui lòng quay lại sau để săn deal hời nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                {saleProducts.map((item) => (
                  <ProductCard
                    key={item.id}
                    href={`/product/${item.id}`}
                    image={item.heroImage}
                    title={item.name}
                    subtitle={item.subtitle}
                    price={item.price}
                    originalPrice={item.originalPrice}
                    badges={item.badges}
                    hasVariantPriceRange={item.hasVariantPriceRange}
                    minPrice={item.minPrice}
                    maxPrice={item.maxPrice}
                    footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="san-pham-noi-bat" className="px-6 py-20 relative">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-12 rounded-[2.5rem] border border-white/60 dark:border-slate-800/60 bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-cyan-950/30 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none backdrop-blur-xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-[60px]" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[60px]" />
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400 shadow-sm backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm">deployed_code</span>
                  Featured Collection
                </p>
                <h3 className="mt-5 text-4xl font-black tracking-tighter text-slate-900 dark:text-white md:text-6xl">
                  Sản phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Nổi Bật</span>
                </h3>
                <p className="mt-4 font-medium text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
                  {keyword
                    ? `Kết quả tìm kiếm cho "${keyword}"`
                    : Number.isFinite(categoryId) && categoryId > 0
                      ? "Khám phá các sản phẩm nổi bật nhất trong danh mục bạn chọn."
                      : "Khám phá tất cả các sản phẩm nổi bật nhất của chúng tôi."}
                </p>
              </div>
            </div>

            <div className="mb-10 overflow-x-auto no-scrollbar pb-4 pt-2 px-2">
              <div className="mx-auto flex w-max min-w-full justify-start md:justify-center gap-3 whitespace-nowrap">
                <Link
                  href={keyword ? `/?q=${encodeURIComponent(keyword)}#san-pham-noi-bat` : "/#san-pham-noi-bat"}
                  className={`inline-flex min-h-[46px] items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-black uppercase tracking-wider transition-all shadow-sm ${!Number.isFinite(categoryId) || categoryId <= 0 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                >
                  Tất cả danh mục
                </Link>
                {categories.map((cat) => {
                  const href = keyword
                    ? `/?q=${encodeURIComponent(keyword)}&category=${cat.id}#san-pham-noi-bat`
                    : `/?category=${cat.id}#san-pham-noi-bat`;
                  const active = Number.isFinite(categoryId) && categoryId === cat.id;
                  return (
                    <Link
                      key={cat.id}
                      href={href}
                      className={`inline-flex min-h-[46px] items-center justify-center rounded-2xl px-6 py-2.5 text-sm font-black uppercase tracking-wider transition-all shadow-sm ${active ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 border border-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"}`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {featured.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xl font-bold text-slate-800 dark:text-white">Không tìm thấy sản phẩm nào.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                  {featured.map((item) => (
                    <ProductCard
                      key={item.id}
                      href={`/product/${item.id}`}
                      image={item.heroImage}
                      title={item.name}
                      subtitle={item.subtitle}
                      price={item.price}
                      originalPrice={item.originalPrice}
                      badges={item.badges}
                      hasVariantPriceRange={item.hasVariantPriceRange}
                      minPrice={item.minPrice}
                      maxPrice={item.maxPrice}
                      footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                    />
                  ))}
                </div>
                <div className="mt-12 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => {
                    const href = `/?${new URLSearchParams({
                      ...(keyword ? { q: keyword } : {}),
                      ...(Number.isFinite(categoryId) && categoryId > 0 ? { category: String(categoryId) } : {}),
                      page: String(p),
                    }).toString()}#san-pham-noi-bat`;
                    return (
                      <Link
                        key={p}
                        href={href}
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black transition-all ${p === currentPage ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"}`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </StorefrontLayout>
  );
}
