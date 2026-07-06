"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type UiProduct } from "@/lib/api";
import { ProductExcelImport } from "@/components/product-excel-import";
import { hideAction, restoreAction, unhideAction } from "@/app/admin/products/actions";
import { toast } from "sonner";

export function ProductsDashboard({
  accessToken,
  username,
  userId,
  brands,
  categories,
  initialProducts,
  totalElements,
  totalPages,
  currentPage,
  pageSize,
  qParam,
  categoryParam,
  brandParam,
  filterDeletedParam,
  sortByParam,
  canWrite,
}: {
  accessToken: string;
  username: string;
  userId: string;
  brands: any[];
  categories: any[];
  initialProducts: UiProduct[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  qParam: string;
  categoryParam: string;
  brandParam: string;
  filterDeletedParam: string;
  sortByParam: string;
  canWrite: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"list" | "import">("list");
  
  const [q, setQ] = useState(qParam);
  const [filterDeleted, setFilterDeleted] = useState<string>(filterDeletedParam);
  const [filterCategory, setFilterCategory] = useState<string>(categoryParam);
  const [filterBrand, setFilterBrand] = useState<string>(brandParam);
  const [sortBy, setSortBy] = useState<string>(sortByParam);
  const [limit, setLimit] = useState(pageSize);
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<UiProduct[]>(initialProducts);

  // Sync state from props when they change (e.g. user clicks back/forward)
  useEffect(() => {
    setQ(qParam);
    setFilterDeleted(filterDeletedParam);
    setFilterCategory(categoryParam);
    setFilterBrand(brandParam);
    setSortBy(sortByParam);
    setLimit(pageSize);
    setProducts(initialProducts);
    setLoading(false);
  }, [qParam, filterDeletedParam, categoryParam, brandParam, sortByParam, pageSize, initialProducts]);

  // Listen to searchParams to show floating toast messages
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");
    if (errorParam === "readonly") {
      toast.error("Bạn không có quyền thực hiện hành động này (Chỉ đọc)!");
      const params = new URLSearchParams(window.location.search);
      params.delete("error");
      router.replace(`?${params.toString()}`);
    } else if (errorParam) {
      toast.error(`Lỗi: ${errorParam}`);
      const params = new URLSearchParams(window.location.search);
      params.delete("error");
      router.replace(`?${params.toString()}`);
    }
    if (successParam === "create") {
      toast.success("Tạo sản phẩm thành công!");
      const params = new URLSearchParams(window.location.search);
      params.delete("success");
      router.replace(`?${params.toString()}`);
    } else if (successParam) {
      toast.success(`Thành công: ${successParam}`);
      const params = new URLSearchParams(window.location.search);
      params.delete("success");
      router.replace(`?${params.toString()}`);
    }
  }, [searchParams, router]);

  // Debounced navigation
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push if there are actual changes to prevent infinite loops
      const params = new URLSearchParams(searchParams.toString());
      
      let changed = false;
      const updateParam = (key: string, value: string, defaultVal: string) => {
        if (value !== defaultVal) {
          if (params.get(key) !== value) { params.set(key, value); changed = true; }
        } else {
          if (params.has(key)) { params.delete(key); changed = true; }
        }
      };

      updateParam('q', q, '');
      updateParam('filterDeleted', filterDeleted, 'active');
      updateParam('categoryId', filterCategory, 'all');
      updateParam('brandId', filterBrand, 'all');
      updateParam('sortBy', sortBy, 'newest');
      
      if (limit !== 20) {
        if (params.get('size') !== String(limit)) { params.set('size', String(limit)); changed = true; }
      } else {
        if (params.has('size')) { params.delete('size'); changed = true; }
      }

      // If filters changed, reset to page 1
      if (changed) {
        params.delete('page');
        setLoading(true);
        router.push(`?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [q, filterDeleted, filterCategory, filterBrand, sortBy, limit, searchParams, router]);

  const setPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage > 1) {
      params.set('page', String(newPage));
    } else {
      params.delete('page');
    }
    setLoading(true);
    router.push(`?${params.toString()}`);
  };

  const activeCount = totalElements; // We only have the filtered count now
  const pagedProducts = products;

  const handleAction = async (action: "hide" | "unhide" | "restore", id: string) => {
    setLoading(true);
    let res;
    if (action === "hide") {
      res = await hideAction(id);
    } else if (action === "unhide") {
      res = await unhideAction(id);
    } else if (action === "restore") {
      res = await restoreAction(id);
    }
    
    if (res?.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Thành công");
      // Note: server action revalidatePath will trigger a server refresh,
      // which will pass new initialProducts down.
      // So setLoading will be reset when new props arrive, or we just reset it here.
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200/60 dark:border-slate-700 pb-2">
        <button
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "list"
              ? "border-blue-600 text-blue-700 dark:border-blue-500 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          onClick={() => setActiveTab("list")}
        >
          Danh sách Sản phẩm
        </button>
        {canWrite && (
          <button
            className={`pb-3 text-sm font-bold transition-all border-b-2 ${
              activeTab === "import"
                ? "border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
            onClick={() => setActiveTab("import")}
          >
            Import Bằng Excel
          </button>
        )}
      </div>

      {activeTab === "import" && (
        <ProductExcelImport 
          accessToken={accessToken} 
          username={username} 
          userId={userId} 
          brands={brands} 
          categories={categories} 
        />
      )}

      {activeTab === "list" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Tìm mã, tên, danh mục..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-white backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              
              {/* Status filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={filterDeleted}
                  onChange={(e) => setFilterDeleted(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 px-4 pr-8 text-sm text-slate-800 dark:text-white backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                >
                  <option value="active">Đang bán</option>
                  <option value="deleted">Đã xóa mềm</option>
                  <option value="all">Tất cả</option>
                </select>
              </div>

              {/* Category filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 px-4 pr-8 text-sm text-slate-800 dark:text-white backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                >
                  <option value="all">Tất cả Danh mục</option>
                  {categories?.map((c: any) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand filter */}
              <div className="w-full sm:w-auto">
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 px-4 pr-8 text-sm text-slate-800 dark:text-white backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                >
                  <option value="all">Tất cả Thương hiệu</option>
                  {brands?.map((b: any) => (
                    <option key={b.id} value={String(b.id)}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div className="w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 px-4 pr-8 text-sm text-slate-800 dark:text-white backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              {/* Page size */}
              <div className="w-full sm:w-auto">
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 py-2.5 px-4 pr-8 text-sm text-slate-800 dark:text-white backdrop-blur-md outline-none transition-all focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 appearance-none"
                >
                  <option value={10}>10 dòng/trang</option>
                  <option value={20}>20 dòng/trang</option>
                  <option value={50}>50 dòng/trang</option>
                  <option value={100}>100 dòng/trang</option>
                </select>
              </div>
            </div>
            
            {canWrite && (
              <Link
                href="/admin/products/new"
                className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-blue-600/30"
              >
                <span className="material-symbols-outlined text-sm">add</span> Thêm Sản phẩm
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/40 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
            {loading ? (
              <div className="p-10 text-center text-slate-500">
                <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
                <p className="mt-2 text-sm font-bold">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80">
                    <tr>
                      <th className="border-b border-slate-200/60 dark:border-slate-700 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Mã / Hình ảnh</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Thông tin Sản phẩm</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Danh mục</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700 px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trạng thái</th>
                      <th className="border-b border-slate-200/60 dark:border-slate-700 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {pagedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-slate-500">
                          <span className="material-symbols-outlined mx-auto text-4xl mb-3 block opacity-50">search_off</span>
                          Không tìm thấy sản phẩm nào
                        </td>
                      </tr>
                    ) : (
                      pagedProducts.map((p) => (
                        <tr key={p.id} className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 ${p.isDeleted ? 'opacity-70 bg-slate-50/30 dark:bg-slate-800/30' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                                {p.heroImage ? (
                                  <img src={p.heroImage} alt={p.name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-slate-300 dark:text-slate-600">image</span>
                                )}
                              </div>
                              <div>
                                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">#{p.id}</span>
                                {p.sku && <p className="mt-1 text-xs font-medium text-slate-400">SKU: {p.sku}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/admin/products/${p.id}/detail`} className="font-bold text-blue-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                              {p.name}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.brandName || "—"}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                            {p.category || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              {p.isDeleted ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200">
                                  <span className="material-symbols-outlined text-[14px]">delete</span> Đã xóa mềm
                               </span>
                              ) : p.isHidden ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                                  <span className="material-symbols-outlined text-[14px]">visibility_off</span> Ẩn trên web
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                                  <span className="material-symbols-outlined text-[14px]">public</span> Hiển thị
                                </span>
                              )}
                              <span className="text-[11px] font-medium text-slate-400">
                                {p.hasVariantPriceRange ? "Nhiều mức giá" : "1 mức giá"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/products/${p.id}/detail`}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                  title="Xem chi tiết"
                                >
                                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </Link>
                              {canWrite && !p.isDeleted && (
                                  <Link
                                    href={`/admin/products/${p.id}/edit`}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    title="Chỉnh sửa"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                  </Link>
                              )}
                              
                              {canWrite && p.isDeleted && (
                                  <button
                                    onClick={() => handleAction("restore", String(p.id))}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                                    title="Khôi phục"
                                  >
                                  <span className="material-symbols-outlined text-[18px]">restore</span>
                                </button>
                              )}

                              {canWrite && !p.isDeleted && !p.isHidden && (
                                  <button
                                    onClick={() => handleAction("hide", String(p.id))}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400"
                                    title="Ẩn khỏi web"
                                  >
                                  <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                                </button>
                              )}

                              {canWrite && !p.isDeleted && p.isHidden && (
                                <button
                                  onClick={() => handleAction("unhide", String(p.id))}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                                  title="Hiển thị lại trên web"
                                >
                                  <span className="material-symbols-outlined text-[18px]">public</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination footer */}
            {!loading && totalPages > 0 && (
              <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${
                    currentPage <= 1 
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Trước
                </button>
                
                <span className="text-sm font-medium text-slate-500 min-w-[100px] text-center">
                  Trang {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors shadow-sm ${
                    currentPage >= totalPages 
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
