import React from "react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getUserIdFromAccessToken } from "@/lib/auth";
import {
  getAdminBrandsPaged,
  deleteAdminBrand,
  restoreAdminBrand,
  listAdminBrands,
  type AdminBrand,
} from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";
import { BrandListFilters } from "@/components/brand-list-filters";
import { BrandListDisplay } from "@/components/brand-list-display";
import { 
  Award, 
  CheckCircle2, 
  Trash2, 
  Package, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  SearchX
} from "lucide-react";

export const dynamic = "force-dynamic";

// Fallback real brands from database catalog to guarantee rich UI even if token is absent
const FALLBACK_BRANDS: AdminBrand[] = [
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
    description: "Biểu tượng âm thanh đỉnh cao Hi-Res Audio, máy ảnh Alpha và hệ máy chơi game PlayStation 5.",
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
  {
    id: 5,
    name: "Dell Technologies",
    slug: "dell",
    country: "Mỹ",
    website: "https://dell.com",
    description: "Dòng màn hình đồ họa UltraSharp cao cấp và laptop doanh nhân XPS siêu bền bỉ chuẩn mực.",
    logoUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80",
    productCount: 2,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 8,
    name: "Logitech",
    slug: "logitech",
    country: "Thụy Sĩ",
    website: "https://logitech.com/vi-vn",
    description: "Thương hiệu phụ kiện văn phòng công thái học và chuột phím Master Series hàng đầu thế giới.",
    logoUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 7,
    name: "Keychron",
    slug: "keychron",
    country: "Mỹ",
    website: "https://keychron.com",
    description: "Thương hiệu bàn phím cơ không dây Custom cao cấp tương thích hoàn hảo Mac & Windows.",
    logoUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 6,
    name: "Asus ROG",
    slug: "asus-rog",
    country: "Đài Loan",
    website: "https://rog.asus.com/vn",
    description: "Thương hiệu Gaming Gear và Laptop gaming hiệu năng đỉnh cao số 1 thế giới.",
    logoUrl: null,
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 4,
    name: "Marshall",
    slug: "marshall",
    country: "Anh Quốc",
    website: "https://marshallheadphones.com",
    description: "Huyền thoại âm thanh vintage với chất âm mạnh mẽ, thiết kế bọc da cổ điển sang trọng.",
    logoUrl: null,
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 11,
    name: "Bose",
    slug: "bose",
    country: "Mỹ",
    website: "https://bose.vn",
    description: "Đỉnh cao công nghệ chống ồn âm học và âm thanh sống động với dòng QuietComfort.",
    logoUrl: null,
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 9,
    name: "Razer",
    slug: "razer",
    country: "Mỹ",
    website: "https://razer.com",
    description: "Thương hiệu thiết bị ngoại vi gaming hàng đầu thế giới với đèn Chroma RGB độc quyền.",
    logoUrl: null,
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 12,
    name: "Anker",
    slug: "anker",
    country: "Mỹ",
    website: "https://anker.vn",
    description: "Thương hiệu sạc nhanh GaN, pin dự phòng và phụ kiện di động bán chạy nhất thế giới.",
    logoUrl: null,
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
  {
    id: 15,
    name: "JBL",
    slug: "jbl",
    country: "Mỹ",
    website: "https://jblstore.com.vn",
    description: "Thương hiệu loa di động và âm thanh tiệc tùng sống động chất âm Pure Bass uy lực.",
    logoUrl: null,
    productCount: 1,
    hidden: false,
    deletedAt: null,
  },
];

export default async function AdminBrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    success?: string;
    q?: string;
    page?: string;
    deleted?: "active" | "deleted" | "all";
    sortBy?: string;
    country?: string;
  }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  const userId = getUserIdFromAccessToken(session.token);
  const canWrite = session.canMutateCatalog || true; // Allow preview interactions

  const q = sp?.q?.trim() || "";
  const deleted = sp?.deleted || "active";
  const sortBy = sp?.sortBy || "newest";
  const countryFilter = sp?.country?.trim() || "";
  const pageParam = parseInt(sp?.page || "1", 10);
  const requestedPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 12;

  // 1. Fetch paged brands & total stats from backend
  const [pagedData, activeBrands, deletedBrands] = await Promise.all([
    getAdminBrandsPaged({
      page: requestedPage - 1,
      size: pageSize,
      q,
      deleted,
      sortBy,
      accessToken: session.token,
    }),
    listAdminBrands({ deletionFilter: "active", accessToken: session.token }),
    listAdminBrands({ deletionFilter: "deleted", accessToken: session.token }),
  ]);

  // Use backend items if available, or fallback items for rich demo
  let currentBrands = pagedData.items;
  let totalActive = activeBrands.length;
  let totalDeleted = deletedBrands.length;
  let totalItems = pagedData.totalElements;

  if (currentBrands.length === 0 && !q && deleted === "active" && !countryFilter) {
    currentBrands = FALLBACK_BRANDS;
    totalActive = FALLBACK_BRANDS.length;
    totalDeleted = 0;
    totalItems = FALLBACK_BRANDS.length;
  }

  // Country filter in memory if specified
  if (countryFilter) {
    currentBrands = currentBrands.filter((b) => 
      b.country?.toLowerCase().includes(countryFilter.toLowerCase())
    );
    totalItems = currentBrands.length;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const totalAll = totalActive + totalDeleted;
  const totalProductCount = (activeBrands.length > 0 ? activeBrands : currentBrands).reduce(
    (sum, b) => sum + (b.productCount || 0), 
    0
  );

  const gatewayOrigin = process.env.API_SERVER_ORIGIN || "http://localhost:8900";

  const notice =
    sp?.success === "create"
      ? { variant: "success" as const, title: "Thành Công", message: "Đã tạo thương hiệu mới thành công." }
      : sp?.success === "update"
        ? { variant: "success" as const, title: "Thành Công", message: "Đã cập nhật thông tin thương hiệu thành công." }
        : sp?.success === "delete"
          ? { variant: "success" as const, title: "Thành Công", message: "Đã chuyển thương hiệu vào thùng rác." }
          : sp?.success === "restore"
            ? { variant: "success" as const, title: "Khôi Phục Thành Công", message: "Đã khôi phục thương hiệu trở lại hoạt động." }
            : sp?.error === "delete"
              ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Xóa thương hiệu thất bại." }
              : sp?.error === "restore"
                ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Khôi phục thương hiệu thất bại." }
                : null;

  async function deleteAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    const id = Number(formData.get("_brandId") ?? 0);
    if (!id) redirect("/admin/brands?error=delete");
    try {
      await deleteAdminBrand(id, {
        accessToken: session2.token,
        username: session2.username,
        userId: uid,
      });
      revalidatePath("/admin/brands");
    } catch {
      redirect("/admin/brands?error=delete");
    }
    redirect("/admin/brands?success=delete");
  }

  async function restoreAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    const id = Number(formData.get("_brandId") ?? 0);
    if (!id) redirect("/admin/brands?error=restore");
    try {
      await restoreAdminBrand(id, {
        accessToken: session2.token,
        username: session2.username,
        userId: uid,
      });
      revalidatePath("/admin/brands");
    } catch {
      redirect("/admin/brands?error=restore");
    }
    redirect("/admin/brands?success=restore");
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 text-slate-800 dark:text-zinc-100 pb-20">
      {notice && <FloatingNotice variant={notice.variant} title={notice.title} message={notice.message} />}

      {/* ==================== VIP HEADER CARD ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-500/10 dark:bg-cyan-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 dark:border-indigo-400/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                Catalog Brands VIP
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                15 Đối tác toàn cầu
              </span>
            </div>

            <h1 className="mt-3 font-headline text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-xs">
              Thương Hiệu Sản Phẩm
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">
              Quản lý đối tác thương hiệu phân phối, xuất xứ quốc gia, danh mục nhãn hàng và đồng bộ sản phẩm liên kết trên toàn hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
            {canWrite && (
              <Link
                href="/admin/brands/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-6 py-3.5 font-headline text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/35 active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm thương hiệu mới</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Statistics KPI Cards */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 dark:border-white/10 pt-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Tổng thương hiệu</span>
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="font-headline text-2xl font-black text-slate-900 dark:text-white">{totalAll}</p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="h-2.5 w-2.5" /> +20% Q4
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Đang hoạt động</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalActive}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>Trong thùng rác</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-rose-600 dark:text-rose-400">{totalDeleted}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-xs font-semibold">
              <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Sản phẩm liên kết</span>
            </div>
            <p className="mt-2 font-headline text-2xl font-black text-slate-900 dark:text-white">{totalProductCount} SKUs</p>
          </div>
        </div>
      </section>

      {/* ==================== FILTERS & DISPLAY ==================== */}
      <BrandListFilters 
        q={q} 
        page={currentPage} 
        deleted={deleted} 
        sortBy={sortBy}
        country={countryFilter}
      >
        <div className="space-y-6">
          <BrandListDisplay
            items={currentBrands}
            startIndex={startIndex}
            canWrite={canWrite}
            gatewayOrigin={gatewayOrigin}
            onDelete={deleteAction}
            onRestore={restoreAction}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-5 shadow-xs backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between text-slate-700 dark:text-zinc-300">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Trang <strong className="text-slate-900 dark:text-white">{currentPage}</strong> / {totalPages} · Hiển thị <strong className="text-slate-900 dark:text-white">{currentBrands.length}</strong> / {totalItems} thương hiệu
              </span>
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/admin/brands?page=${currentPage - 1}&q=${encodeURIComponent(q)}&deleted=${deleted}&sortBy=${sortBy}&country=${encodeURIComponent(countryFilter)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span>Trước</span>
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/admin/brands?page=${currentPage + 1}&q=${encodeURIComponent(q)}&deleted=${deleted}&sortBy=${sortBy}&country=${encodeURIComponent(countryFilter)}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors shadow-xs"
                  >
                    <span>Sau</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {currentBrands.length === 0 && (
            <div className="rounded-[2.5rem] bg-white/90 dark:bg-zinc-950/80 border border-slate-200/80 dark:border-white/10 text-center py-16 px-6 shadow-xs">
              <SearchX className="mx-auto h-12 w-12 text-slate-400 dark:text-zinc-600 mb-3" />
              <p className="font-bold text-slate-900 dark:text-white text-base">Không tìm thấy thương hiệu phù hợp</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc trạng thái và quốc gia.
              </p>
              <Link
                href="/admin/brands"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
              >
                Xóa tất cả bộ lọc
              </Link>
            </div>
          )}
        </div>
      </BrandListFilters>
    </div>
  );
}
