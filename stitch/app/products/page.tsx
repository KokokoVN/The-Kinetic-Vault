import Link from "next/link";
import { cookies } from "next/headers";
import { getProductsByCategoryForUi, listPublicCategories, searchProductsForUi, type UiProduct } from "@/lib/api";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { StorefrontLayout } from "@/components/storefront-layout";
import { SoftNavigateForm } from "@/components/soft-navigate-form";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { listActivePrograms } from "@/lib/sale-api";

export const dynamic = "force-dynamic";

type StatusFilter = "all" | "in_stock" | "low_stock" | "out_stock";

function normalizeStatus(raw: string): StatusFilter {
  const v = raw.trim();
  if (v === "in_stock" || v === "low_stock" || v === "out_stock") return v;
  return "all";
}

function clampInt(raw: string, fallback: number, min: number, max: number): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function applyStatusFilter(list: UiProduct[], status: StatusFilter): UiProduct[] {
  if (status === "all") return list;
  if (status === "in_stock") return list.filter((p) => p.stock >= 20);
  if (status === "low_stock") return list.filter((p) => p.stock > 0 && p.stock < 20);
  return list.filter((p) => p.stock <= 0);
}

function filterStorefrontVisibleInStock(list: UiProduct[]): UiProduct[] {
  return list.filter((p) => !p.isHidden && !p.isDeleted && Number(p.stock) > 0);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; category?: string; page?: string; size?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  const sp = searchParams ? await searchParams : undefined;
  const q = String(sp?.q ?? "").trim();
  const status = normalizeStatus(String(sp?.status ?? ""));
  const categoryId = Number(String(sp?.category ?? "").trim());
  const size = clampInt(String(sp?.size ?? "12"), 12, 8, 50);
  const page = clampInt(String(sp?.page ?? "1"), 1, 1, 999);

  const [categories, activeSalePrograms] = await Promise.all([
    listPublicCategories(),
    listActivePrograms().catch(() => []),
  ]);

  // Data source strategy:
  // - If category is set: fetch category list, filter by q + status, paginate locally.
  // - Else: use backend search paging for performance.
  let items: UiProduct[] = [];
  let totalItems = 0;
  let totalPages = 1;
  let safePage = page;

  if (Number.isFinite(categoryId) && categoryId > 0) {
    const all = filterStorefrontVisibleInStock(await getProductsByCategoryForUi(categoryId));
    const keyword = q.toLowerCase();
    const filtered = applyStatusFilter(
      all.filter((p) => {
        if (!keyword) return true;
        const hay = `${p.name} ${p.sku} ${p.category}`.toLowerCase();
        return hay.includes(keyword);
      }),
      status,
    );
    totalItems = filtered.length;
    totalPages = Math.max(1, Math.ceil(totalItems / size));
    safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * size;
    items = filtered.slice(start, start + size);
  } else {
    const out = await searchProductsForUi({
      q,
      status,
      page: page,
      size,
    });
    // Enforce storefront rule: only visible products with stock > 0.
    const visible = filterStorefrontVisibleInStock(out.items);
    items = visible;
    totalItems = visible.length;
    totalPages = Math.max(1, Math.ceil(totalItems / size));
    safePage = out.page;
  }

  const formatVnd = (val: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);

  items = items.map((p: any) => {
    let bestDiscountValue = 0;
    let salePrice = p.minPrice ?? p.rawPrice ?? 0;
    let originalPriceValue = salePrice;
    let saleBadge: string | null = null;
    let finalMinPrice = p.minPrice;
    let finalMaxPrice = p.maxPrice;

    activeSalePrograms.forEach(program => {
      const hasProduct = program.items?.some((item: any) => item.productId === Number(p.id));
      if (hasProduct) {
        let currentDiscountValue = 0;
        let currentSalePrice = originalPriceValue;
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

    const finalBadges = p.stock <= 0 ? ["Hết hàng"] : p.stock < 20 ? ["Sắp hết"] : [];
    if (saleBadge) finalBadges.push(saleBadge);

    return {
      ...p,
      price: bestDiscountValue > 0 ? (
          p.hasVariantPriceRange && finalMinPrice != null && finalMaxPrice != null
              ? (finalMinPrice === finalMaxPrice ? formatVnd(finalMinPrice) : `${formatVnd(finalMinPrice)} - ${formatVnd(finalMaxPrice)}`)
              : formatVnd(salePrice)
      ) : p.price,
      originalPrice: bestDiscountValue > 0 ? formatVnd(originalPriceValue) : null,
      badges: finalBadges.length > 0 ? finalBadges : undefined
    };
  });

  const buildUrl = (next: { q?: string; status?: StatusFilter; category?: string; page?: number; size?: number }) => {
    const qp = new URLSearchParams();
    const q2 = (next.q ?? q).trim();
    const st2 = next.status ?? status;
    const cat2 = String(next.category ?? (Number.isFinite(categoryId) && categoryId > 0 ? String(categoryId) : "")).trim();
    const size2 = next.size ?? size;
    const page2 = next.page ?? safePage;
    if (q2) qp.set("q", q2);
    if (st2 !== "all") qp.set("status", st2);
    if (cat2) qp.set("category", cat2);
    if (size2 !== 12) qp.set("size", String(size2));
    if (page2 > 1) qp.set("page", String(page2));
    return `/products${qp.toString() ? `?${qp.toString()}` : ""}`;
  };

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="products">
      <main className="bg-slate-50/50">
        {/* PREMIUM HERO BANNER */}
        <section className="relative overflow-hidden bg-slate-950 px-6 py-20 lg:py-32">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[1000px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 h-[600px] w-[800px] rounded-full bg-purple-600/20 blur-[120px]" />
          
          <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-center text-center">
            <span className="mb-6 rounded-full bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-white backdrop-blur-md border border-white/20 shadow-xl shadow-white/5">
              Bộ sưu tập Mới
            </span>
            <h1 className="font-headline text-5xl font-black tracking-tighter text-white sm:text-7xl lg:text-8xl drop-shadow-2xl">
              Khám Phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Danh Mục</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-medium text-slate-300 sm:text-xl">
              Tuyển chọn các sản phẩm chất lượng cao với thiết kế hiện đại, mang đến trải nghiệm tuyệt vời cho phong cách của bạn.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-screen-2xl px-6 py-12">
          {/* HORIZONTAL CATEGORY PILLS */}
          <div className="mb-8 w-full overflow-x-auto pb-4 no-scrollbar">
            <div className="flex w-max items-center gap-3">
              <Link
                href={buildUrl({ category: "", page: 1 })}
                className={`flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold transition-all duration-300 ${
                  !categoryId ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105" : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5"
                }`}
              >
                Tất cả sản phẩm
              </Link>
              {categories
                .slice()
                .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "vi"))
                .map((c) => {
                  const isActive = categoryId === c.id;
                  return (
                    <Link
                      key={c.id}
                      href={buildUrl({ category: String(c.id), page: 1 })}
                      className={`flex h-12 items-center justify-center rounded-full px-7 text-sm font-bold transition-all duration-300 ${
                        isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105" : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-0.5"
                      }`}
                    >
                      {c.name}
                    </Link>
                  );
              })}
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-white p-4 shadow-sm border border-slate-200/60">
            <SoftNavigateForm actionPath="/products" className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <input type="hidden" name="category" value={categoryId > 0 ? categoryId : ""} />
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[22px]">search</span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-14 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              {/* Status Dropdown */}
              <div className="flex shrink-0 items-center gap-3">
                <AutoSubmitSelect
                  name="status"
                  defaultValue={status}
                  className="h-[52px] rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 outline-none transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="all">Mọi trạng thái</option>
                  <option value="in_stock">Còn hàng</option>
                  <option value="low_stock">Sắp hết</option>
                  <option value="out_stock">Hết hàng</option>
                </AutoSubmitSelect>
                
                <button type="submit" className="hidden">Submit</button>
              </div>
            </SoftNavigateForm>
            
            <div className="hidden h-8 w-px bg-slate-200 md:block" />

            <div className="flex items-center gap-2 pr-2">
              <span className="text-sm font-bold text-slate-900">{totalItems}</span>
              <span className="text-sm font-semibold text-slate-500">kết quả</span>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/50 py-32 text-center shadow-sm">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-8 shadow-inner">
                <span className="material-symbols-outlined text-[48px]">search_off</span>
              </div>
              <h3 className="font-headline text-2xl font-black text-slate-900">Không tìm thấy sản phẩm</h3>
              <p className="mt-3 max-w-md text-base font-medium text-slate-500 leading-relaxed">
                Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn. Vui lòng thử lại với từ khóa khác.
              </p>
              <Link href="/products" className="mt-8 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40">
                Xóa bộ lọc ngay
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
              {items.map((p, idx) => (
                <div key={p.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-in fade-in zoom-in-95 duration-500 ease-out fill-mode-both">
                  <ProductCard
                    href={`/product/${p.id}`}
                    image={p.heroImage}
                    title={p.name}
                    category={p.category}
                    subtitle={p.subtitle}
                    price={p.price}
                    originalPrice={p.originalPrice}
                    hasVariantPriceRange={Boolean(p.hasVariantPriceRange)}
                    badges={p.badges}
                    footer={
                      <div className="space-y-3">
                        <div className="flex items-end justify-between gap-3">
                          <p className="text-xs font-semibold text-slate-500">Kho: {p.stock.toLocaleString("vi-VN")}</p>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
                            p.stock <= 0 ? "bg-rose-100 text-rose-700" : p.stock < 20 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {p.stock <= 0 ? "HẾT" : p.stock < 20 ? "Ít" : "SẴN"}
                          </span>
                        </div>
                        <AddToCartButton productId={p.id} hasVariants={Boolean(p.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-3">
              <Link
                href={buildUrl({ page: Math.max(1, safePage - 1) })}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                  safePage <= 1 ? "pointer-events-none bg-slate-100 text-slate-300" : "bg-white text-slate-600 shadow-sm border border-slate-200 hover:-translate-y-1 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">chevron_left</span>
              </Link>
              
              <div className="flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const isActive = p === safePage;
                  
                  if (totalPages > 7 && (p < safePage - 2 || p > safePage + 2) && p !== 1 && p !== totalPages) {
                    if (p === safePage - 3 || p === safePage + 3) return <span key={p} className="px-3 text-slate-400 font-bold">...</span>;
                    return null;
                  }
                  
                  return (
                    <Link
                      key={p}
                      href={buildUrl({ page: p })}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${
                        isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={buildUrl({ page: Math.min(totalPages, safePage + 1) })}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 ${
                  safePage >= totalPages ? "pointer-events-none bg-slate-100 text-slate-300" : "bg-white text-slate-600 shadow-sm border border-slate-200 hover:-translate-y-1 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10"
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">chevron_right</span>
              </Link>
            </div>
          )}
        </section>
      </main>
    </StorefrontLayout>
  );
}

