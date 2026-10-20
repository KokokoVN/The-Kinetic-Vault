import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getProductForUi,
  listAdminProductImages,
  listAdminProductSpecs,
  listPublicProductVariants,
  resolveCatalogImageUrl,
  type AdminProductSpec,
} from "@/lib/api";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { ProductDetailShowcase } from "@/components/product-detail-showcase";
import { StorefrontLayout } from "@/components/storefront-layout";
import { ProductReviewsSection } from "@/components/product-reviews-section";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { SimilarProductsSection } from "@/components/similar-products-section";
import { ProductSpecsSection } from "@/components/product-specs-section";
import { getProductReviews } from "@/lib/review-api";
import Link from "next/link";
import { listActivePrograms } from "@/lib/sale-api";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  const { id } = await params;
  const product = await getProductForUi(id);
  if (!product) notFound();

  const numericId = Number(id);
  const hasNumericId = Number.isFinite(numericId) && numericId > 0;
  
  // Calculate Sale Price
  const activeSalePrograms = await listActivePrograms();
  const productSalePrograms = activeSalePrograms.filter(p => p.items.some(it => it.productId === numericId));
  
  let lowestSalePrice = Infinity;
  let foundAnyProgram = false;
  let salePrice = product.rawPrice;
  let saleType: "PERCENT" | "AMOUNT" | null = null;
  let saleValue: number | null = null;
  
  productSalePrograms.forEach(program => {
    const hasProductWide = program.items.some(item => item.productId === numericId && item.variantId == null && (item.promoQtyLimit == null || item.promoQtyLimit > 0));
    const hasAnyVariant = program.items.some(item => item.productId === numericId && (item.promoQtyLimit == null || item.promoQtyLimit > 0));
    
    // For the base product display, we consider product-wide sales or the best variant sale
    if (hasAnyVariant) {
      foundAnyProgram = true;
      let currentSalePrice = product.rawPrice;
      if (program.discountType === "PERCENT") {
        currentSalePrice = product.rawPrice - (product.rawPrice * program.discountValue) / 100;
      } else if (program.discountType === "AMOUNT") {
        currentSalePrice = program.discountValue;
      }
      
      if (currentSalePrice < lowestSalePrice) {
        lowestSalePrice = currentSalePrice;
        salePrice = currentSalePrice;
        saleType = program.discountType;
        saleValue = program.discountValue;
      }
    }
  });

  if (foundAnyProgram) {
    product.effectivePrice = salePrice;
  } else {
    product.effectivePrice = null;
  }

  const [specs, variants, productImages, reviews] = hasNumericId
    ? await Promise.all([
        listAdminProductSpecs(numericId),
        listPublicProductVariants(numericId),
        listAdminProductImages(numericId),
        getProductReviews(numericId).catch(() => []),
      ])
    : [[], [], [], []];

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount 
    : 5;

  const allProductThumbnails = Array.from(
    new Set([
      ...(product.thumbnails ?? []),
      ...productImages
        .slice()
        .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
        .map((img) => resolveCatalogImageUrl(img.imageUrl || img.storagePath))
        .filter((img) => img.length > 0),
    ]),
  );

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="products">
      <ProductViewTracker productId={id} />
      <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[140px]" />
        
        <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

          {/* ── Breadcrumb Pill Navigation & Quick Anchors ── */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Link
                href="/"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 hover:border-indigo-300"
              >
                <span className="material-symbols-outlined text-[15px]">home</span>
                <span>Trang chủ</span>
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <Link
                href={product.categoryId ? `/products?category=${product.categoryId}` : "/products"}
                className="rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:text-indigo-600 dark:hover:text-cyan-400 hover:border-indigo-300"
              >
                {product.category}
              </Link>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="max-w-[280px] truncate rounded-full border border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-1.5 font-bold text-indigo-600 dark:text-cyan-400">
                {product.name}
              </span>
            </nav>

            {/* Quick section anchor pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <a
                href="#section-overview"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-xl transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-cyan-400"
              >
                <span className="material-symbols-outlined text-[15px]">visibility</span>
                <span>Tổng quan</span>
              </a>
              {specs.length > 0 && (
                <a
                  href="#section-specs"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-xl transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-cyan-400"
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                  <span>Thông số</span>
                </a>
              )}
              <a
                href="#section-reviews"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-xl transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-cyan-400"
              >
                <span className="material-symbols-outlined text-[15px]">reviews</span>
                <span>Đánh giá ({reviewCount})</span>
              </a>
              <a
                href="#section-similar"
                className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-xl transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-cyan-400"
              >
                <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
                <span>Gợi ý</span>
              </a>
            </div>
          </div>

          {/* ── Main Showcase (Gallery + N-Tier Selector) ── */}
          <div id="section-overview" className="scroll-mt-24">
            <ProductDetailShowcase
              productId={product.id}
              productName={product.name}
              category={product.category}
              description={product.description}
              heroImage={product.heroImage}
              thumbnails={allProductThumbnails}
              basePrice={product.rawPrice}
              effectivePrice={product.effectivePrice}
              saleType={saleType}
              saleValue={saleValue}
              activeSalePrograms={productSalePrograms}
              baseStock={product.stock}
              variants={variants}
              isLoggedIn={isLoggedIn}
              salesCount={product.salesCount}
              reviewCount={reviewCount}
              averageRating={averageRating}
            />
          </div>

          {/* ── Optimized Tech Specs Section ── */}
          <div id="section-specs" className="scroll-mt-24">
            <ProductSpecsSection
              productId={numericId}
              productTitle={product.name}
              productImage={product.heroImage}
              productPrice={product.effectivePrice ?? product.rawPrice}
              specs={specs}
            />
          </div>

          {/* ── Product Reviews Section ── */}
          <div id="section-reviews" className="mt-16 sm:mt-20 scroll-mt-24">
            <ProductReviewsSection productId={numericId} />
          </div>

          {/* ── Similar Products Carousel / Grid ── */}
          <div id="section-similar" className="mt-16 sm:mt-20 mb-12 scroll-mt-24">
            <SimilarProductsSection productId={numericId} limit={8} activePrograms={activeSalePrograms} />
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
