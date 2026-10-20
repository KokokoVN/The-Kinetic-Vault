import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminBrandById, getAdminProductsPageForUi, listAdminCategories } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";
import { BrandCategoriesView } from "@/components/brand-categories-view";
import { 
  ArrowLeft, 
  Edit3, 
  Globe, 
  Package, 
  Layers, 
  Boxes, 
  DollarSign, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatVndPrice(raw: number | string | null | undefined): string {
  if (raw == null) return "0 ₫";
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n)) return String(raw);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function getCountryFlag(country?: string | null): string {
  if (!country) return "🌐";
  const c = country.toLowerCase().trim();
  if (c.includes("mỹ") || c.includes("usa")) return "🇺🇸";
  if (c.includes("nhật") || c.includes("japan")) return "🇯🇵";
  if (c.includes("hàn") || c.includes("korea")) return "🇰🇷";
  if (c.includes("việt") || c.includes("vietnam")) return "🇻🇳";
  if (c.includes("đức") || c.includes("germany")) return "🇩🇪";
  if (c.includes("thụy sĩ") || c.includes("switzerland")) return "🇨🇭";
  if (c.includes("pháp") || c.includes("france")) return "🇫🇷";
  if (c.includes("ý") || c.includes("italy")) return "🇮🇹";
  if (c.includes("anh") || c.includes("uk")) return "🇬🇧";
  if (c.includes("trung") || c.includes("china")) return "🇨🇳";
  if (c.includes("đài") || c.includes("taiwan")) return "🇹🇼";
  return "🌐";
}

export default async function ShowBrandPage({
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
      ? { variant: "success" as const, title: "Thành Công", message: "Đã cập nhật thông tin thương hiệu thành công." }
      : null;

  const session = await getAdminSession();
  let brand = await getAdminBrandById(id, { accessToken: session.token });
  if (!brand) {
    const fallback = [
      {
        id: 1,
        name: "Apple Inc.",
        slug: "apple",
        country: "Mỹ",
        website: "https://apple.com/vn",
        description: "Tập đoàn công nghệ hàng đầu thế giới với hệ sinh thái iPhone, MacBook, iPad, Apple Watch.",
        logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80",
        productCount: 5,
        hidden: false,
        deletedAt: null,
      },
      {
        id: 3,
        name: "Sony Corporation",
        slug: "sony",
        country: "Nhật Bản",
        website: "https://sony.com.vn",
        description: "Biểu tượng âm thanh đỉnh cao Hi-Res Audio, máy ảnh Alpha và PlayStation 5.",
        logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
        productCount: 2,
        hidden: false,
        deletedAt: null,
      },
      {
        id: 2,
        name: "Samsung Electronics",
        slug: "samsung",
        country: "Hàn Quốc",
        website: "https://samsung.com/vn",
        description: "Tập đoàn điện tử tiên phong thế giới với dòng Galaxy S, Z Fold và công nghệ AI đột phá.",
        logoUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80",
        productCount: 2,
        hidden: false,
        deletedAt: null,
      },
    ].find((b) => b.id === id);
    if (fallback) {
      brand = fallback as any;
    } else {
      notFound();
    }
  }

  const gatewayOrigin = process.env.API_SERVER_ORIGIN || "http://localhost:8900";
  const resolvedLogoUrl = brand.logoUrl
    ? brand.logoUrl.startsWith("http")
      ? brand.logoUrl
      : `${gatewayOrigin}${brand.logoUrl}`
    : null;

  // Fetch Products linked to this Brand & All categories
  const [pageData, categories] = await Promise.all([
    getAdminProductsPageForUi({
      brandId: String(id),
      size: 300,
      accessToken: session.token,
    }),
    listAdminCategories({ deletionFilter: "active", accessToken: session.token }),
  ]);
  const products = pageData.items;

  // Metrics
  const totalStock = products.reduce((acc, item) => acc + (item.stock ?? 0), 0);
  const sumPrices = products.reduce((acc, item) => acc + (item.rawPrice ?? 0), 0);
  const averagePrice = products.length > 0 ? sumPrices / products.length : 0;
  const flag = getCountryFlag(brand.country);

  // Distinct category count
  const distinctCategoryIds = new Set<number>();
  products.forEach((prod) => {
    if (prod.categoryId != null) distinctCategoryIds.add(prod.categoryId);
  });
  const distinctCategoryCount = distinctCategoryIds.size;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {notice && <FloatingNotice variant={notice.variant} title={notice.title} message={notice.message} />}

      {/* ==================== HERO HEADER BANNER ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 dark:bg-cyan-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            {/* Logo */}
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-800/80 p-2.5 shadow-md">
              {resolvedLogoUrl ? (
                <Image
                  src={resolvedLogoUrl}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-black text-2xl">
                  {brand.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                <Link className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href="/admin/brands">
                  Thương hiệu
                </Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{brand.name}</span>
              </nav>

              <div className="flex items-center gap-3">
                <h1 className="font-headline text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {brand.name}
                </h1>
                {brand.country && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span>{flag}</span>
                    <span>{brand.country}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Đối tác chính thức
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                <span>Mã: #{brand.id}</span>
                {brand.slug && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-slate-400">/brands/{brand.slug}</span>
                  </>
                )}
                {brand.website && (
                  <>
                    <span>·</span>
                    <a
                      href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      <Globe className="h-3 w-3" />
                      <span>Website chính thức</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10">
            <Link
              href="/admin/brands"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-200 dark:hover:bg-white/10 shadow-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại danh sách</span>
            </Link>

            <Link
              href={`/admin/brands/${brand.id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/35 active:scale-[0.98]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Chỉnh sửa thương hiệu</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 4 METRICS CARDS ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Sản phẩm liên kết</span>
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-3 font-headline text-3xl font-black text-slate-900 dark:text-white">
            {products.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Sản phẩm đang phân phối trên hệ thống</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Danh mục phân phối</span>
            <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-3 font-headline text-3xl font-black text-slate-900 dark:text-white">
            {distinctCategoryCount}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Nhóm danh mục có sản phẩm của hãng</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Tổng tồn kho</span>
            <Boxes className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="mt-3 font-headline text-3xl font-black text-slate-900 dark:text-white">
            {totalStock}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Tổng số lượng sản phẩm có sẵn trong kho</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 backdrop-blur-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold">
            <span className="uppercase tracking-wider">Giá bán trung bình</span>
            <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-3 font-headline text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
            {formatVndPrice(averagePrice)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 font-medium">Bình quân trên các dòng sản phẩm</p>
        </div>
      </section>

      {/* ==================== CATEGORIES & GROUPED PRODUCTS VIEW ==================== */}
      <BrandCategoriesView
        brand={brand}
        categories={categories}
        products={products}
        canWrite={session.canMutateCatalog}
      />
    </div>
  );
}
