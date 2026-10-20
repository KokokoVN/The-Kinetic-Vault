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
    totalItems = out.totalItems;
    totalPages = out.totalPages;
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
      const hasProduct = program.items?.some((item: any) => item.productId === Number(p.id) && (item.promoQtyLimit == null || item.promoQtyLimit > 0));
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
      <div className="relative min-h-screen pb-20 overflow-hidden">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-gradient-to-b from-indigo-600/15 via-cyan-500/10 to-transparent blur-[140px]" />

        {/* FLAGSHIP HERO BANNER */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-10 pb-12 text-center">
          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 backdrop-blur-xl shadow-sm">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              Bộ sưu tập chính hãng
            </span>
            <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              Khám Phá <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400">Sản Phẩm</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Tuyển chọn các thiết bị công nghệ và phụ kiện cao cấp đạt chuẩn bảo hành chính hãng, sẵn sàng giao siêu tốc trong 2h.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          {/* HORIZONTAL CATEGORY PILLS */}
          <div className="mb-8 w-full overflow-x-auto pb-3 no-scrollbar">
            <div className="flex w-max items-center gap-2.5">
              <Link
                href={buildUrl({ category: "", page: 1 })}
                className={`flex h-11 items-center justify-center rounded-2xl px-5 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm ${
                  !categoryId 
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 scale-105" 
                    : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.06]"
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
                      className={`flex h-11 items-center justify-center rounded-2xl px-5 text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm ${
                        isActive 
                          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 scale-105" 
                          : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.06]"
                      }`}
                    >
                      {c.name}
                    </Link>
                  );
              })}
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#0c1017]/80 p-3.5 sm:p-4 backdrop-blur-2xl shadow-sm dark:shadow-xl">
            <SoftNavigateForm actionPath="/products" className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
              <input type="hidden" name="category" value={categoryId > 0 ? categoryId : ""} />
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 py-3 pl-12 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-white/10"
                />
              </div>

              {/* Status Dropdown */}
              <div className="flex shrink-0 items-center gap-2">
                <AutoSubmitSelect
                  name="status"
                  defaultValue={status}
                  className="h-11 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#121824] px-4 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none transition-all hover:border-slate-300 dark:hover:border-white/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="all">Mọi trạng thái</option>
                  <option value="in_stock">Còn hàng</option>
                  <option value="low_stock">Sắp hết</option>
                  <option value="out_stock">Hết hàng</option>
                </AutoSubmitSelect>
                
                <button type="submit" className="hidden">Submit</button>
              </div>
            </SoftNavigateForm>
            
            <div className="hidden h-8 w-px bg-slate-200 dark:bg-white/10 md:block" />

            <div className="flex items-center gap-2 pr-2 text-xs">
              <span className="font-headline font-black text-indigo-600 dark:text-cyan-400 text-sm">{totalItems}</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">sản phẩm tìm thấy</span>
            </div>
          </div>

          {/* PRODUCT GRID */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] py-20 px-4 text-center backdrop-blur-xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-white/5 text-slate-400 mb-6 shadow-inner border border-slate-200 dark:border-white/10">
                <span className="material-symbols-outlined text-[40px]">search_off</span>
              </div>
              <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white">Không tìm thấy sản phẩm</h3>
              <p className="mt-2 max-w-md text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {q
                  ? `Không có sản phẩm nào tên "${q}". Nếu bạn muốn tìm đơn hàng, giỏ hàng hoặc thông tin toàn trang, hãy sử dụng tính năng Tìm Kiếm Toàn Trang.`
                  : "Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc này."}
              </p>
              
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {q && (
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                    Tìm kiếm toàn trang cho &quot;{q}&quot;
                  </Link>
                )}
                
                {q && (q.toLowerCase().includes("don") || q.toLowerCase().includes("order")) && (
                  <Link
                    href="/my-orders"
                    className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200/80 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-5 py-2.5 text-xs font-black text-indigo-700 dark:text-indigo-300 transition-all hover:scale-105"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    Đi tới Đơn hàng của tôi
                  </Link>
                )}

                <Link 
                  href="/products" 
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-200 dark:hover:bg-zinc-700"
                >
                  Xóa bộ lọc
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-both">
              {items.map((p, idx) => (
                <div key={p.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-in fade-in zoom-in-95 duration-500 ease-out fill-mode-both">
                  <ProductCard
                    href={`/product/${p.id}`}
                    image={p.heroImage}
                    title={p.name}
                    subtitle={p.category}
                    price={p.price}
                    originalPrice={p.originalPrice}
                    badges={p.badges}
                    hasVariantPriceRange={p.hasVariantPriceRange}
                    minPrice={p.minPrice}
                    maxPrice={p.maxPrice}
                    footer={<AddToCartButton productId={String(p.id)} hasVariants={Boolean(p.hasVariants ?? p.hasVariantPriceRange)} isLoggedIn={isLoggedIn} />}
                  />
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2">
              <Link
                href={buildUrl({ page: Math.max(1, safePage - 1) })}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm ${
                  safePage <= 1 ? "pointer-events-none bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 opacity-50" : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </Link>
              
              <div className="flex items-center gap-1 rounded-2xl bg-white/90 dark:bg-[#0c1017]/80 p-1 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  const isActive = p === safePage;
                  
                  if (totalPages > 7 && (p < safePage - 2 || p > safePage + 2) && p !== 1 && p !== totalPages) {
                    if (p === safePage - 3 || p === safePage + 3) return <span key={p} className="px-2 text-slate-400 font-bold text-xs">...</span>;
                    return null;
                  }
                  
                  return (
                    <Link
                      key={p}
                      href={buildUrl({ page: p })}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all ${
                        isActive 
                          ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/30 scale-105" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={buildUrl({ page: Math.min(totalPages, safePage + 1) })}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 shadow-sm ${
                  safePage >= totalPages ? "pointer-events-none bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 opacity-50" : "bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.08]"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </Link>
            </div>
          )}
        </section>
      </div>
    </StorefrontLayout>
  );
}


