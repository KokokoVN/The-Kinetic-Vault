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
import { StorefrontVoucherStrip } from "@/components/storefront-voucher-strip";
import { StorefrontEcosystemBento } from "@/components/storefront-ecosystem-bento";
import { StorefrontBrandMarquee } from "@/components/storefront-brand-marquee";
import { CategoryCarousel } from "@/components/category-carousel";
import { listActiveBanners, listActivePrograms, listActiveVouchers } from "@/lib/sale-api";
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

  const productsPromise = keyword
    ? searchProductsForUi({ q: keyword, size: 50, status: "all" }).then(res => res.items).catch(() => [])
    : Number.isFinite(categoryId) && categoryId > 0
      ? getProductsByCategoryForUi(categoryId).catch(() => [])
      : getProductsForUi().catch(() => []);

  const [
    categories,
    banners,
    newestProducts,
    hotProducts,
    activeSalePrograms,
    activeVouchers,
    products,
  ] = await Promise.all([
    listPublicCategories().catch(() => []),
    listActiveBanners().catch(() => []),
    listLatestProducts().catch(() => []),
    listHotProducts(8).catch(() => []),
    listActivePrograms().catch(() => []),
    listActiveVouchers().catch(() => []),
    productsPromise,
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
      const hasProduct = program.items?.some(item => item.productId === Number(p.id) && (item.promoQtyLimit == null || item.promoQtyLimit > 0));
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

  // Optimize sale products lookup: match from loaded products first
  const productLookupMap = new Map<number, any>();
  products.forEach(p => productLookupMap.set(Number(p.id), p));
  newestProducts.forEach(p => { if (!productLookupMap.has(Number(p.id))) productLookupMap.set(Number(p.id), p); });
  hotProducts.forEach(p => { if (!productLookupMap.has(Number(p.id))) productLookupMap.set(Number(p.id), p); });

  const missingSaleIds = Array.from(saleProductIds).filter(id => !productLookupMap.has(id));
  const missingSaleProducts = missingSaleIds.length > 0
    ? await listProductsByIds(missingSaleIds).catch(() => [])
    : [];
  missingSaleProducts.forEach(p => productLookupMap.set(Number(p.id), p));

  const rawSaleProducts = Array.from(saleProductIds)
    .map(id => productLookupMap.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

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
      
      <div className="relative min-h-screen pb-20 overflow-hidden">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-[600px] w-[1100px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-cyan-500/10 to-transparent blur-[140px]" />
        
        {/* ================= 1. HERO BANNER ================= */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <StorefrontHeroBanner banners={banners} />
        </section>

        {/* ================= 2. VIP VOUCHER STRIP ================= */}
        {activeVouchers && activeVouchers.length > 0 && (
          <StorefrontVoucherStrip vouchers={activeVouchers} />
        )}

        {/* ================= 3. CATEGORY SHOWCASE ================= */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 my-2">
          <div className="mx-auto max-w-screen-2xl rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/70 p-6 sm:p-10 backdrop-blur-2xl shadow-sm dark:shadow-2xl transition-colors">
            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400 border border-cyan-500/25 shadow-sm">
                <span className="material-symbols-outlined text-xs">grid_view</span>
                Khám phá bộ sưu tập
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Danh mục <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Nổi Bật</span>
              </h3>
              <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Chọn danh mục để tìm kiếm nhanh thiết bị công nghệ bạn quan tâm nhất.
              </p>
            </div>
            <CategoryCarousel categories={categories} />
          </div>
        </section>

        {/* ================= 4. FLASH SALE / SIÊU KHUYẾN MÃI ================= */}
        {saleProducts.length > 0 && (
          <section id="san-pham-sale" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 my-8 overflow-hidden rounded-[3rem] border border-rose-500/25 bg-gradient-to-b from-rose-500/10 via-rose-50/40 to-transparent dark:from-rose-950/30 dark:via-[#0c0814] dark:to-transparent shadow-2xl">
            <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-rose-500/15 blur-[120px]" />
            <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-pink-500/15 blur-[120px]" />

            <div className="mx-auto max-w-screen-2xl relative z-10">
              <div className="mb-10 flex flex-col items-center justify-center gap-3 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-4 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400 border border-rose-500/35 shadow-sm animate-pulse">
                  <span className="material-symbols-outlined text-xs">local_fire_department</span>
                  Flash Sale Hạn Giờ
                </span>
                <h3 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Siêu <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-500 dark:from-rose-400 dark:to-pink-500">Khuyến Mãi</span>
                </h3>
                {earliestEndAt && <CountdownTimer endAt={earliestEndAt} />}
              </div>
              
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                {saleProducts.slice(0, 8).map((item) => (
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
                    footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariants ?? item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= 5. NEW ARRIVALS (SẢN PHẨM MỚI NHẤT) ================= */}
        <section id="san-pham-moi" className="relative z-10 px-4 sm:px-6 lg:px-8 py-14">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10 flex flex-col items-center justify-center gap-2 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                New Arrivals 2026
              </span>
              <h3 className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Sản phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Mới Nhất</span>
              </h3>
              <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Cập nhật liên tục các siêu phẩm công nghệ vừa ra mắt trên thị trường thế giới.
              </p>
            </div>

            {newProductsMapped.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium">Chưa có sản phẩm mới nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                {newProductsMapped.slice(0, 8).map((item) => (
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
                    footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariants ?? item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= 6. TECH ECOSYSTEM BENTO ================= */}
        <StorefrontEcosystemBento />

        {/* ================= 7. BEST SELLERS (SẢN PHẨM BÁN CHẠY) ================= */}
        <section id="san-pham-hot" className="relative z-10 px-4 sm:px-6 lg:px-8 py-14">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10 flex flex-col items-center justify-center gap-2 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400 border border-amber-500/25">
                <span className="material-symbols-outlined text-xs">local_fire_department</span>
                Best Sellers Top Pick
              </span>
              <h3 className="font-headline text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Sản phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400">Bán Chạy</span>
              </h3>
              <p className="max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Những sản phẩm được hàng ngàn khách hàng tin dùng và đánh giá cao nhất.
              </p>
            </div>

            {hotProductsMapped.length === 0 ? (
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium">Chưa có sản phẩm bán chạy nào.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 xl:gap-8">
                {hotProductsMapped.slice(0, 8).map((item) => (
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
                    footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariants ?? item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= 8. GLOBAL BRAND MARQUEE ================= */}
        <StorefrontBrandMarquee />

        {/* ================= 9. FEATURED COLLECTION & FILTER ================= */}
        <section id="san-pham-noi-bat" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-12 rounded-[2.5rem] border border-slate-200/80 dark:border-white/[0.08] bg-gradient-to-br from-indigo-950/40 via-[#0e1422] to-cyan-950/30 p-8 md:p-12 shadow-2xl backdrop-blur-2xl relative overflow-hidden text-center">
              <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/15 blur-[80px]" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-cyan-500/15 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-400 shadow-sm backdrop-blur-md">
                  <span className="material-symbols-outlined text-xs">deployed_code</span>
                  Featured Collection
                </p>
                <h3 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                  Tất Cả Sản Phẩm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Cao Cấp</span>
                </h3>
                <p className="mt-3 font-medium text-slate-300 max-w-xl text-sm md:text-base">
                  {keyword
                    ? `Kết quả tìm kiếm cho "${keyword}"`
                    : Number.isFinite(categoryId) && categoryId > 0
                      ? "Khám phá các sản phẩm nổi bật nhất trong danh mục bạn chọn."
                      : "Khám phá toàn bộ danh mục sản phẩm chính hãng với bảo hành 1 đổi 1 và ưu đãi trả góp 0%."}
                </p>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-10 overflow-x-auto no-scrollbar pb-4 pt-2 px-2">
              <div className="mx-auto flex w-max min-w-full justify-start md:justify-center gap-2.5 whitespace-nowrap">
                <Link
                  href={keyword ? `/?q=${encodeURIComponent(keyword)}#san-pham-noi-bat` : "/#san-pham-noi-bat"}
                  className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                    !Number.isFinite(categoryId) || categoryId <= 0 
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 scale-105" 
                      : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.06]"
                  }`}
                >
                  Tất cả ({products.length})
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
                      className={`inline-flex min-h-[44px] items-center justify-center rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                        active 
                          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 scale-105" 
                          : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.06]"
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {featured.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-white/50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10">
                <p className="text-lg font-bold text-slate-900 dark:text-white">Không tìm thấy sản phẩm nào phù hợp.</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bạn vui lòng chọn danh mục khác hoặc tìm kiếm từ khóa khác.</p>
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
                      footer={<AddToCartButton productId={String(item.id)} hasVariants={Boolean(item.hasVariants ?? item.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
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
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-black transition-all shadow-sm ${
                            p === currentPage 
                              ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 scale-105" 
                              : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08]"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

      </div>
    </StorefrontLayout>
  );
}
