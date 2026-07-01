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
    const hasProductWide = program.items.some(item => item.productId === numericId && item.variantId == null);
    const hasAnyVariant = program.items.some(item => item.productId === numericId);
    
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
      <main style={{ background: "linear-gradient(180deg,#f5f7ff 0%,#ffffff 400px)" }}>
        <div className="mx-auto max-w-screen-2xl px-6 py-10">

          {/* ── Breadcrumb ── */}
          <nav className="mb-8 flex items-center gap-1.5">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm font-semibold transition hover:text-primary"
              style={{ color: "rgba(0,0,0,0.45)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>home</span>
              Trang chủ
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "rgba(0,0,0,0.25)" }}>chevron_right</span>
            <Link href="/" className="text-sm font-semibold transition hover:text-primary" style={{ color: "rgba(0,0,0,0.45)" }}>
              {product.category}
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "rgba(0,0,0,0.25)" }}>chevron_right</span>
            <span className="max-w-[200px] truncate text-sm font-bold text-primary">{product.name}</span>
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
              <div
                className="overflow-hidden"
                style={{ borderRadius: "1.5rem", border: "1.5px solid rgba(0,0,0,0.07)", background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
              >
                {/* Header */}
                <div
                  className="flex items-center gap-3 px-7 py-5"
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "linear-gradient(90deg,#f8f9ff,#fff)" }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: "18px" }}>tune</span>
                  </div>
                  <h2 className="text-lg font-black" style={{ color: "#0f0f23" }}>Thông số kỹ thuật</h2>
                </div>

                {/* Specs Grid */}
                <div className="grid gap-0 md:grid-cols-2">
                  {specs.map((spec, i) => (
                    <div
                      key={spec.id}
                      className="flex items-center justify-between px-7 py-4"
                      style={{
                        borderBottom: i < specs.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                        background: i % 2 === 0 ? "#fff" : "rgba(99,102,241,0.02)",
                      }}
                    >
                      <dt className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.5)" }}>{spec.specKey}</dt>
                      <dd
                        className="rounded-full px-3 py-1 text-sm font-black"
                        style={{ background: "rgba(99,102,241,0.08)", color: "#4f46e5" }}
                      >
                        {specValue(spec)}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Product Reviews ── */}
          <ProductReviewsSection productId={numericId} />

          {/* ── Similar Products (client-side lazy load) ── */}
          <SimilarProductsSection productId={numericId} limit={8} />
        </div>
      </main>
    </StorefrontLayout>
  );
}
