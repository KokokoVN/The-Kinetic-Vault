import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminBrandById, getAdminProductsPageForUi } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatVndPrice(raw: number | string | null | undefined): string {
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
  return { text: "Còn hàng", className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-755 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" };
}

function getBrandDesign(name: string): { icon: string; gradient: string; glow: string; banner: string } {
  const n = String(name ?? "").toLowerCase();
  
  if (n.includes("apple") || n.includes("samsung") || n.includes("xiaomi") || n.includes("oppo") || n.includes("sony") || n.includes("lg")) {
    return { icon: "devices", gradient: "from-blue-500 to-cyan-400", glow: "shadow-blue-500/20", banner: "from-blue-600/10 via-cyan-500/5 to-transparent" };
  }
  if (n.includes("nike") || n.includes("adidas") || n.includes("puma") || n.includes("reebok") || n.includes("fila") || n.includes("lining")) {
    return { icon: "sports_handball", gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20", banner: "from-purple-650/10 via-pink-500/5 to-transparent" };
  }
  if (n.includes("logitech") || n.includes("razer") || n.includes("corsair") || n.includes("dareu")) {
    return { icon: "mouse", gradient: "from-amber-500 to-orange-550", glow: "shadow-amber-500/20", banner: "from-amber-600/10 via-orange-500/5 to-transparent" };
  }
  if (n.includes("dell") || n.includes("hp") || n.includes("asus") || n.includes("lenovo") || n.includes("acer") || n.includes("msi")) {
    return { icon: "laptop", gradient: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20", banner: "from-indigo-650/10 via-violet-500/5 to-transparent" };
  }
  if (n.includes("nestle") || n.includes("pepsi") || n.includes("coca") || n.includes("heineken")) {
    return { icon: "local_cafe", gradient: "from-rose-455 to-pink-500", glow: "shadow-rose-500/20", banner: "from-rose-600/10 via-pink-500/5 to-transparent" };
  }
  
  return { icon: "sell", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20", banner: "from-emerald-600/10 via-teal-500/5 to-transparent" };
}

export default async function ShowBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = await params;
  const id = Number(p.id);
  if (!id) notFound();

  const session = await getAdminSession();
  const brand = await getAdminBrandById(id, { accessToken: session.token });
  if (!brand) notFound();

  const gatewayOrigin = process.env.API_SERVER_ORIGIN || "http://localhost:8900";
  const resolvedLogoUrl = brand.logoUrl
    ? (brand.logoUrl.startsWith("http") ? brand.logoUrl : `${gatewayOrigin}${brand.logoUrl}`)
    : null;

  // Fetch Products in this Brand
  const pageData = await getAdminProductsPageForUi({
    brandId: String(id),
    size: 100,
    accessToken: session.token,
  });
  const products = pageData.items;

  // Calculate Metrics
  const totalStock = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const sumPrices = products.reduce((acc, p) => acc + (p.rawPrice ?? 0), 0);
  const averagePrice = products.length > 0 ? sumPrices / products.length : 0;

  const design = getBrandDesign(brand.name);

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* ==================== HERO HEADER BANNER ==================== */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-purple-900/5 dark:shadow-none backdrop-blur-xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${design.banner} pointer-events-none`} />
        
        <div className="relative p-6 sm:p-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4.5">
            {/* Logo / Mapped Icon */}
            {resolvedLogoUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white p-2.5 shadow-lg border border-slate-200 dark:border-slate-800">
                <img src={resolvedLogoUrl} alt={brand.name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${design.gradient} text-white shadow-lg ${design.glow}`}>
                <span className="material-symbols-outlined text-3xl">{design.icon}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <Link className="transition-colors hover:text-purple-600 dark:hover:text-purple-400" href="/admin/brands">
                  Thương hiệu
                </Link>
                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                <span className="font-black text-purple-600 dark:text-purple-400">{brand.name}</span>
              </nav>
              <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {brand.name}
              </h1>
              <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
                ID Thương hiệu: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-205 dark:border-slate-700">#{brand.id}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 relative z-10">
            <Link
              href="/admin/brands"
              className="flex items-center gap-2 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-205 dark:border-slate-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-650 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-705 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Quay lại
            </Link>
            {session.canMutateCatalog && (
              <Link
                href={`/admin/brands/${brand.id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Chỉnh sửa thương hiệu
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ==================== METRICS GRID ==================== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sản phẩm liên kết</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">inventory_2</span>
          </div>
          <p className="mt-4 font-headline text-3xl font-black text-slate-850 dark:text-white">
            {products.length}
          </p>
          <p className="mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-medium">Sản phẩm thuộc thương hiệu</p>
        </div>

        {/* Total Stock */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tổng lượng tồn kho</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">warehouse</span>
          </div>
          <p className="mt-4 font-headline text-3xl font-black text-slate-855 dark:text-white">
            {totalStock}
          </p>
          <p className="mt-1 text-[10px] text-slate-450 dark:text-slate-500 font-medium">Tổng số sản phẩm có sẵn</p>
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
          <p className="mt-1.5 text-[10px] text-slate-450 dark:text-slate-505 font-medium">Giá bình quân sản phẩm</p>
        </div>

        {/* Brand Information Description Card */}
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Đặc tính đối tác</span>
            <span className="material-symbols-outlined text-slate-400 text-lg">handshake</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-350 line-clamp-2">
            {brand.description || "Chưa có thông tin mô tả chi tiết."}
          </p>
          <p className="mt-1 text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Đồng bộ tự động</p>
        </div>
      </section>

      {/* ==================== PRODUCTS LIST TABLE ==================== */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="flex flex-col gap-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-slate-800 dark:text-white">Sản phẩm thuộc thương hiệu</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-450">
              Gồm {products.length} sản phẩm trực thuộc đối tác thương hiệu này.
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl block opacity-40 mb-2">inventory</span>
              <p className="text-sm font-bold">Không có sản phẩm nào thuộc thương hiệu này.</p>
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
                  const st = stockLabel(p.stock);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-slate-55/50 dark:hover:bg-slate-900/40">
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                        <Link href={`/admin/products/${p.id}/detail`} className="font-headline text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors line-clamp-2">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-tight text-slate-400 dark:text-slate-550">
                        {p.sku ?? "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right font-headline text-sm font-bold text-purple-600 dark:text-purple-405">
                        {p.price}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-center font-mono text-xs text-slate-700 dark:text-slate-350">
                        {p.stock ?? 0}
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
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-550 dark:text-slate-400 transition-all hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-450 shadow-sm"
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
