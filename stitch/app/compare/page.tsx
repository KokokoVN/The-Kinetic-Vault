import { cookies } from "next/headers";
import Link from "next/link";
import {
  getProductForUi,
  listAdminProductSpecs,
  listPublicProductVariants,
} from "@/lib/api";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { StorefrontLayout } from "@/components/storefront-layout";
import { CompareView, type ComparedProductData } from "@/components/compare-view";

export const metadata = {
  title: "So Sánh Sản Phẩm",
  description: "Đối chiếu chi tiết giá bán, phân loại biến thể và thông số kỹ thuật đa chiều giữa các sản phẩm.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  const { ids: idsParam } = await searchParams;

  let productIds: number[] = [];
  if (idsParam) {
    productIds = idsParam
      .split(",")
      .map((id) => Number(id.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 4);
  }

  // Fetch product data in parallel
  const fetchedProducts = await Promise.all(
    productIds.map(async (pid): Promise<ComparedProductData | null> => {
      try {
        const [prod, variants, specs] = await Promise.all([
          getProductForUi(String(pid)),
          listPublicProductVariants(pid),
          listAdminProductSpecs(pid),
        ]);

        if (!prod) return null;

        return {
          id: pid,
          name: prod.name,
          category: prod.category,
          image: prod.heroImage,
          rawPrice: prod.rawPrice,
          effectivePrice: prod.effectivePrice,
          stock: prod.stock,
          variants: Array.isArray(variants) ? variants : [],
          specs: Array.isArray(specs) ? specs : [],
          salesCount: prod.salesCount,
        };
      } catch {
        return null;
      }
    })
  );

  const validProducts: ComparedProductData[] = fetchedProducts.filter(
    (p): p is ComparedProductData => p !== null
  );

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="products">
      <div className="relative min-h-screen overflow-hidden bg-slate-50/50 dark:bg-[#060813] text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 dark:purple-500/5 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Breadcrumbs */}
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300"
            >
              <span className="material-symbols-outlined text-[15px]">home</span>
              <span>Trang chủ</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <Link
              href="/products"
              className="rounded-full border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-3.5 py-1.5 backdrop-blur-md transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300"
            >
              Sản phẩm
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="rounded-full border border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-1.5 font-bold text-indigo-600 dark:text-indigo-400">
              So sánh sản phẩm
            </span>
          </nav>

          {/* Compare Interactive View */}
          <CompareView initialProducts={validProducts} />
        </div>
      </div>
    </StorefrontLayout>
  );
}
