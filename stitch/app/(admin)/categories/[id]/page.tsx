import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminCategory, getCategoryDeletePreview, listAdminCategoryProducts, type AdminCategoryProductRow } from "@/lib/api";
import { StatusToast } from "@/components/status-toast";

export const dynamic = "force-dynamic";

function formatVndPrice(raw: AdminCategoryProductRow["price"]): string {
  if (raw == null) {
    return "—";
  }
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n)) {
    return String(raw);
  }
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function stockLabel(av: number | null | undefined): { text: string; className: string } {
  const v = av ?? 0;
  if (v <= 0) {
    return { text: "Hết hàng", className: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" };
  }
  if (v < 20) {
    return { text: "Sắp hết", className: "bg-rose-50 dark:bg-rose-500/10 text-rose-705 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30" };
  }
  return { text: "Còn hàng", className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-750 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" };
}

function getCategoryDesign(name: string): { icon: string; gradient: string; glow: string; banner: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("điện thoại") || n.includes("phone") || n.includes("mobile") || n.includes("tai nghe") || n.includes("phụ kiện")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20", banner: "from-blue-600/10 via-cyan-500/5 to-transparent" };
  }
  if (n.includes("áo") || n.includes("quần") || n.includes("thời trang") || n.includes("giày") || n.includes("apparel") || n.includes("fashion")) {
    return { icon: "apparel", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20", banner: "from-purple-650/10 via-pink-500/5 to-transparent" };
  }
  if (n.includes("bếp") || n.includes("nồi") || n.includes("gia dụng") || n.includes("chén") || n.includes("kitchen") || n.includes("dining")) {
    return { icon: "kitchen", gradient: "from-amber-500 to-orange-550", glow: "shadow-amber-500/20", banner: "from-amber-600/10 via-orange-500/5 to-transparent" };
  }
  if (n.includes("mỹ phẩm") || n.includes("son") || n.includes("phấn") || n.includes("skincare") || n.includes("beauty")) {
    return { icon: "face", gradient: "from-rose-400 to-pink-500", glow: "shadow-rose-500/20", banner: "from-rose-600/10 via-pink-500/5 to-transparent" };
  }
  if (n.includes("sách") || n.includes("vở") || n.includes("bút") || n.includes("book") || n.includes("stationery")) {
    return { icon: "menu_book", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20", banner: "from-emerald-600/10 via-teal-500/5 to-transparent" };
  }
  if (n.includes("thể thao") || n.includes("dã ngoại") || n.includes("xe đạp") || n.includes("sports") || n.includes("outdoor")) {
    return { icon: "sports_soccer", gradient: "from-teal-500 to-cyan-500", glow: "shadow-teal-500/20", banner: "from-teal-650/10 via-cyan-500/5 to-transparent" };
  }
  
  return { icon: "category", gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20", banner: "from-indigo-650/10 via-violet-500/5 to-transparent" };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const success = sp?.success;
  const numId = Number(id);
  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog;
  
  if (!Number.isFinite(numId)) {
    return (
      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-450">ID danh mục không hợp lệ.</div>
    );
  }

  const category = await getAdminCategory(numId, { accessToken: session.token });
  const preview = await getCategoryDeletePreview(numId, { accessToken: session.token });
  const products = category
    ? await listAdminCategoryProducts(numId, { accessToken: session.token })
    : [];

  if (!category) {
    return (
      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400 border border-amber-200/40">
        Không tìm thấy danh mục <code className="rounded bg-amber-100 dark:bg-amber-500/20 px-1">{id}</code>.
      </div>
    );
  }

  // Calculate Metrics
  const isDeleted = category.deletedAt != null;
  const totalStock = products.reduce((acc, p) => acc + (p.availability ?? 0), 0);
  
  const sumPrices = products.reduce((acc, p) => {
    const val = typeof p.price === "number" ? p.price : Number(String(p.price || 0).replace(/,/g, ""));
    return acc + (Number.isFinite(val) ? val : 0);
  }, 0);
  const averagePrice = products.length > 0 ? sumPrices / products.length : 0;

  const design = getCategoryDesign(category.name);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20">
      {success === "update" && (
        <StatusToast tone="success" title="Cập nhật thành công" message="Cập nhật danh mục thành công." />
      )}
      
      {/* ==================== HERO HEADER PANEL ==================== */}
      <section className={`relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl`}>
        {/* Dynamic Colorful Banner Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${design.banner} pointer-events-none`} />
        
        <div className="relative p-6 sm:p-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4.5">
            {/* Category Custom Icon */}
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${design.gradient} text-white shadow-lg ${design.glow}`}>
              <span className="material-symbols-outlined text-3xl">{design.icon}</span>
            </div>
            
            <div className="space-y-1.5">
              <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <Link className="transition-colors hover:text-blue-600 dark:hover:text-blue-400" href="/admin/categories">
                  Danh mục
                </Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="font-black text-blue-600 dark:text-blue-400">{category.name}</span>
              </nav>
              <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-xs text-slate-450 dark:text-slate-400">
                Đường dẫn tĩnh: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{category.slug ?? "—"}</span> · ID #{category.id}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-2.5 shrink-0 relative z-10">
            <Link
              className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
              href="/admin/categories"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Danh sách
            </Link>
            {canWrite ? (
              <>
                <Link
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30"
                  href={`/admin/categories/${id}/edit`}
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Chỉnh sửa
                </Link>
                <Link
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                  href={`/admin/products/new?categoryId=${encodeURIComponent(String(category.id))}`}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Thêm sản phẩm
                </Link>
                <Link
                  className="flex items-center gap-2 rounded-xl border border-rose-250 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-rose-705 dark:text-rose-400 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/35"
                  href={`/admin/categories/${id}/delete`}
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Xóa
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORY METRICS GRID ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Số lượng sản phẩm</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">inventory_2</span>
          </div>
          <p className="mt-4 font-headline text-3xl font-black text-slate-850 dark:text-white">
            {products.length}
          </p>
          <p className="mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-medium">Sản phẩm gán danh mục</p>
        </div>

        {/* Total Inventory Stock */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tổng lượng tồn kho</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">warehouse</span>
          </div>
          <p className="mt-4 font-headline text-3xl font-black text-slate-855 dark:text-white">
            {totalStock}
          </p>
          <p className="mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-medium">Tổng tồn kho toàn phân loại</p>
        </div>

        {/* Average Pricing */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá bán trung bình</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">payments</span>
          </div>
          <p className="mt-4 font-headline text-xl sm:text-2xl font-black text-slate-850 dark:text-white truncate">
            {formatVndPrice(averagePrice)}
          </p>
          <p className="mt-1.5 text-[10px] text-slate-450 dark:text-slate-500 font-medium">Giá bình quân danh mục</p>
        </div>

        {/* Category Status */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Trạng thái công khai</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">visibility</span>
          </div>
          <div className="mt-4.5 flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isDeleted ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
            <span className="font-headline text-lg font-black text-slate-800 dark:text-white">
              {isDeleted ? "Đã ẩn" : "Hoạt động"}
            </span>
          </div>
          <p className="mt-2 text-[10px] text-slate-450 dark:text-slate-550 font-medium">
            {isDeleted ? "Ẩn khỏi thanh điều hướng" : "Hiển thị công khai trang chủ"}
          </p>
        </div>
      </section>

      {/* ==================== PRODUCTS LIST TABLE ==================== */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-slate-800 dark:text-white">Sản phẩm thuộc danh mục</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-450">
              Gồm {products.length} sản phẩm đang được liên kết trực tiếp.
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl block opacity-40 mb-2">inventory</span>
              <p className="text-sm font-bold">Không có sản phẩm nào thuộc danh mục này.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/60 dark:border-slate-800/60">
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Sản phẩm
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    SKU
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Giá bán
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Tồn kho
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => {
                  const st = stockLabel(p.availability);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-slate-55/50 dark:hover:bg-slate-900/40">
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                        <Link href={`/admin/products/${p.id}/detail`} className="font-headline text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                          {p.productName}
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-tight text-slate-400 dark:text-slate-500">
                        {p.sku ?? "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right font-headline text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatVndPrice(p.price)}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center font-mono text-xs text-slate-700 dark:text-slate-350">
                        {p.availability ?? 0}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${st.className}`}
                          >
                            {st.text}
                          </span>
                          <Link
                            href={`/admin/products/${p.id}/detail`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-500 dark:text-slate-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-450 shadow-sm"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
