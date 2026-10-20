import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminSession } from "@/lib/auth-server";
import {
  getAdminCategory,
  getAdminProductsPageForUi,
  listAdminBrands,
} from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";
import { CategoryBrandsView } from "@/components/category-brands-view";

export const dynamic = "force-dynamic";

function formatVndPrice(raw: number | string | null | undefined): string {
  if (raw == null) return "—";
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n)) return String(raw);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string; error?: string }>;
}) {
  const p = await params;
  const sp = searchParams ? await searchParams : undefined;
  const id = Number(p.id);
  if (!id) notFound();

  const notice =
    sp?.success === "update"
      ? { variant: "success" as const, title: "Thành Công", message: "Đã cập nhật thông tin danh mục thành công." }
      : null;

  const session = await getAdminSession();
  const category = await getAdminCategory(id, { accessToken: session.token });
  if (!category) notFound();

  const gatewayOrigin = process.env.API_SERVER_ORIGIN || "http://localhost:8900";
  const resolvedImageUrl = category.imageUrl
    ? category.imageUrl.startsWith("http")
      ? category.imageUrl
      : `${gatewayOrigin}${category.imageUrl}`
    : null;

  // Fetch Products linked to this Category & All active brands
  const [pageData, brands] = await Promise.all([
    getAdminProductsPageForUi({
      categoryId: String(id),
      size: 300,
      accessToken: session.token,
    }),
    listAdminBrands({ deletionFilter: "active", accessToken: session.token }),
  ]);
  const products = pageData.items;

  // Metrics
  const totalStock = products.reduce((acc, item) => acc + (item.stock ?? 0), 0);
  const sumPrices = products.reduce((acc, item) => acc + (item.rawPrice ?? 0), 0);
  const averagePrice = products.length > 0 ? sumPrices / products.length : 0;

  // Distinct brands distributing products in this category
  const distinctBrandIds = new Set<number>();
  products.forEach((prod) => {
    if (prod.brandId != null && prod.brandId > 0) {
      distinctBrandIds.add(prod.brandId);
    }
  });
  const distinctBrandCount = distinctBrandIds.size;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {notice && <FloatingNotice variant={notice.variant} title={notice.title} message={notice.message} />}

      {/* ==================== HERO HEADER BANNER ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-blue-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            {/* Category Image / Logo */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-800/80 p-2.5 shadow-md">
              {resolvedImageUrl ? (
                <Image
                  src={resolvedImageUrl}
                  alt={category.name}
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl">
                  {category.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                <Link className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors" href="/admin/categories">
                  Danh mục
                </Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="font-bold text-blue-600 dark:text-cyan-400">{category.name}</span>
              </nav>

              <div className="flex items-center gap-3">
                <h1 className="font-headline text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {category.name}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                <span>ID: #{category.id}</span>
                {category.slug && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-slate-400">/categories/{category.slug}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10">
            <Link
              href="/admin/categories"
              className="flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-200 dark:hover:bg-white/10 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Quay lại danh sách
            </Link>

            {session.canMutateCatalog && (
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/35 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Chỉnh sửa danh mục
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ==================== METRICS GRID ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Sản phẩm liên kết</span>
            <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-cyan-400">inventory_2</span>
          </div>
          <p className="mt-3 font-headline text-3xl font-black text-slate-900 dark:text-white">
            {products.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Sản phẩm đang bán thuộc danh mục</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Thương hiệu phân phối</span>
            <span className="material-symbols-outlined text-[20px] text-purple-600 dark:text-purple-400">stars</span>
          </div>
          <p className="mt-3 font-headline text-3xl font-black text-slate-900 dark:text-white">
            {distinctBrandCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Đối tác thương hiệu trong ngành hàng</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Tổng tồn kho</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">warehouse</span>
          </div>
          <p className="mt-3 font-headline text-3xl font-black text-slate-900 dark:text-white">
            {totalStock}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Tổng số lượng sản phẩm có sẵn</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Giá bán trung bình</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400">payments</span>
          </div>
          <p className="mt-3 font-headline text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
            {formatVndPrice(averagePrice)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Bình quân trên danh mục sản phẩm</p>
        </div>
      </section>

      {/* ==================== BRANDS & GROUPED PRODUCTS VIEW ==================== */}
      <CategoryBrandsView
        category={category}
        brands={brands}
        products={products}
        gatewayOrigin={gatewayOrigin}
        canWrite={session.canMutateCatalog}
      />
    </div>
  );
}
