import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  getProductForUi,
  listAdminProductImages,
  listAdminProductSpecs,
  listPublicProductVariants,
  type AdminProductSpec,
} from "@/lib/api";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { ProductDetailShowcase } from "@/components/product-detail-showcase";
import { StorefrontLayout } from "@/components/storefront-layout";
import { ProductReviewsSection } from "@/components/product-reviews-section";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { SimilarProductsSection } from "@/components/similar-products-section";
import { getProductReviews } from "@/lib/review-api";
import Link from "next/link";

function specValue(spec: AdminProductSpec): string {
  const unit = spec.unit?.trim();
  return unit ? `${spec.specValue} ${unit}` : spec.specValue;
}

function resolveProductImage(raw: string | null | undefined): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  if (v.startsWith("/")) return `${origin}${v}`;
  return `${origin}/api/catalog/admin/products/images/file/${v}`;
}

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
        .map((img) => resolveProductImage(img.imageUrl || img.storagePath))
        .filter((img) => img.length > 0),
    ]),
  );

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="products">
      <ProductViewTracker productId={id} />
      <main className="bg-gradient-to-b from-[#f5f7ff] to-white dark:from-slate-950 dark:to-slate-900/40 min-h-screen">
        <div className="mx-auto max-w-screen-2xl px-6 py-10">

          {/* ── Breadcrumb ── */}
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">home</span>
              Trang chủ
            </Link>
            <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-700">chevron_right</span>
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              {product.category}
            </Link>
            <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-700">chevron_right</span>
            <span className="max-w-[200px] truncate text-indigo-650 dark:text-indigo-400 font-bold">{product.name}</span>
          </nav>

          {/* ── Main Showcase ── */}
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

          {/* ── Specs Section ── */}
          {specs.length > 0 && (
            <section className="mt-16">
              <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md shadow-lg shadow-indigo-500/5">
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 md:px-7 md:py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-650 shadow-md shadow-indigo-500/20">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: "18px" }}>tune</span>
                  </div>
                  <h2 className="text-base md:text-lg font-black text-slate-800 dark:text-white">Thông số kỹ thuật</h2>
                </div>

                {/* Specs by Group */}
                <div className="flex flex-col">
                  {Object.entries(
                    specs.reduce((acc, spec) => {
                      const group = spec.specGroup?.trim() || "Thông tin chung";
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(spec);
                      return acc;
                    }, {} as Record<string, typeof specs>)
                  ).map(([groupName, groupSpecs], gIdx, arr) => (
                    <div key={groupName} className={gIdx < arr.length - 1 ? "border-b border-slate-200 dark:border-slate-800" : ""}>
                      <div className="bg-slate-100/50 dark:bg-slate-800/50 px-5 py-2.5 md:px-7 md:py-3 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-xs md:text-sm font-black tracking-widest text-slate-600 dark:text-slate-300 uppercase">{groupName}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-slate-100 dark:bg-slate-800">
                        {groupSpecs.map((spec) => (
                          <div
                            key={spec.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4 px-5 py-3 md:px-7 md:py-4 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-colors"
                          >
                            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{spec.specKey}</dt>
                            <dd className="text-sm font-semibold text-slate-900 dark:text-slate-200 sm:text-right break-words max-w-full">
                              {specValue(spec)}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Product Reviews ── */}
          <ProductReviewsSection productId={numericId} />

          {/* ── Similar Products (client-side lazy load) ── */}
          <SimilarProductsSection productId={numericId} limit={8} activePrograms={activeSalePrograms} />
        </div>
      </main>
    </StorefrontLayout>
  );
}
