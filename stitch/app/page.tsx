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
      const hasProduct = program.items.some(item => item.productId === Number(p.id));
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
      <main className="min-h-screen pb-20">
        <section className="px-6 py-8">
          <StorefrontHeroBanner banners={banners} />
        </section>

        <section className="px-6 py-8">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <h3 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">Danh mục nổi bật</h3>
              <span className="rounded-full bg-surface-container px-4 py-1 text-sm font-semibold text-on-surface-variant">
                {categories.length} danh mục
              </span>
            </div>
            <CategoryCarousel categories={categories} />
          </div>
        </section>

        {/* NEW PRODUCTS */}
        <section id="san-pham-moi" className="bg-surface px-6 py-12">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <span className="rounded-full bg-primary/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                New Arrivals
              </span>
              <h3 className="font-headline text-4xl font-extrabold tracking-tighter text-primary">Sản phẩm Mới</h3>
            </div>
            {newProductsMapped.length === 0 ? (
              <p className="text-center text-on-surface-variant">Chưa có sản phẩm mới nào.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
        <section id="san-pham-hot" className="bg-surface-container-lowest px-6 py-12">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <span className="rounded-full bg-[#FF8C00]/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF8C00]">
                Best Sellers
              </span>
              <h3 className="font-headline text-4xl font-extrabold tracking-tighter text-[#FF8C00]">Sản phẩm Bán Chạy</h3>
            </div>
            {hotProductsMapped.length === 0 ? (
              <p className="text-on-surface-variant">Chưa có sản phẩm bán chạy nào.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
        <section id="san-pham-sale" className="bg-surface px-6 py-12">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <span className="rounded-full bg-[#FF4D4D]/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#FF4D4D]">
                Hot Deal
              </span>
              <h3 className="font-headline text-4xl font-extrabold tracking-tighter text-[#FF4D4D]">Siêu Khuyến Mãi</h3>
            </div>
            
            {saleProducts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg font-medium text-on-surface-variant">
                  Hiện chưa có chương trình Siêu Khuyến Mãi nào diễn ra.
                </p>
                <p className="mt-2 text-sm text-on-surface-variant/70">
                  Bạn vui lòng quay lại sau để săn deal hời nhé!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

        <section id="san-pham-noi-bat" className="bg-surface px-6 py-14">
          <div className="mx-auto max-w-screen-2xl">
            <div className="mb-10 rounded-3xl border border-outline-variant/10 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container p-6 shadow-lg shadow-primary/5 md:p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">deployed_code</span>
                  Featured Collection
                </p>
                <h3 className="mt-3 text-4xl font-extrabold tracking-tighter text-primary">Sản phẩm nổi bật</h3>
                <p className="mt-1 font-medium text-on-surface-variant">
                  {keyword
                    ? `Kết quả tìm kiếm cho "${keyword}"`
                    : Number.isFinite(categoryId) && categoryId > 0
                      ? "Sản phẩm theo danh mục đã chọn"
                      : "Tất cả sản phẩm nổi bật"}
                </p>
              </div>
            </div>
            <div className="mb-8 overflow-x-auto no-scrollbar pb-4 pt-2 px-2">
              <div className="mx-auto flex w-max min-w-full justify-start md:justify-center gap-3 whitespace-nowrap">
                <Link
                  href={keyword ? `/?q=${encodeURIComponent(keyword)}#san-pham-noi-bat` : "/#san-pham-noi-bat"}
                  className={`inline-flex min-h-[42px] items-center justify-center rounded-full px-6 py-2 text-center text-sm font-bold transition-all shadow-sm ${!Number.isFinite(categoryId) || categoryId <= 0 ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/30 scale-105" : "bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"}`}
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
                      className={`inline-flex min-h-[42px] items-center justify-center rounded-full px-6 py-2 text-center text-sm font-bold transition-all shadow-sm ${active ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/30 scale-105" : "bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"}`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="mt-8 flex items-center justify-center gap-2">
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
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${p === currentPage ? "bg-primary text-white" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </StorefrontLayout>
  );
}
