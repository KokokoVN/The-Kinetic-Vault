import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminSaleProgram, type SaleProgramItem } from "@/lib/sale-api";
import {
  getAdminBackendProductById,
  getBackendProductById,
  listAdminProductVariants,
  listAdminStockBalances,
  resolveCatalogImageUrl,
  type AdminProductVariant,
  type AdminStockBalance,
  type BackendProduct,
} from "@/lib/api";

export const dynamic = "force-dynamic";

type ProductBundle = {
  product: BackendProduct | null;
  variants: AdminProductVariant[];
  balances: AdminStockBalance[];
};

function moneyVnd(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function salePrice(basePrice: number, discountType: "PERCENT" | "AMOUNT", discountValue: number): number {
  if (!Number.isFinite(basePrice) || basePrice <= 0) return 0;
  if (discountType === "PERCENT") {
    return Math.max(0, Math.round(basePrice * (1 - discountValue / 100)));
  }
  return Math.max(0, discountValue);
}

function variantLabel(variant: AdminProductVariant | undefined, variantId?: number | null): string {
  if (!variantId) return "Toàn bộ sản phẩm";
  if (!variant) return `Biến thể #${variantId}`;
  const size = String(variant.size ?? "").trim();
  const color = String(variant.color ?? "").trim();
  return [size, color].filter(Boolean).join(" · ") || `Biến thể #${variantId}`;
}

function stockForItem(
  item: SaleProgramItem,
  product: BackendProduct | null,
  variants: AdminProductVariant[],
  balances: AdminStockBalance[],
): number {
  const variantId = item.variantId != null ? Number(item.variantId) : null;
  if (variantId) {
    const balance = balances.find((row) => Number(row.variantId ?? 0) === variantId);
    if (balance) return Math.max(0, Number(balance.quantityOnHand ?? 0));
    const variant = variants.find((row) => Number(row.id) === variantId);
    return Math.max(0, Number(variant?.availability ?? 0));
  }
  if (balances.length > 0) {
    return balances.reduce((sum, row) => sum + Math.max(0, Number(row.quantityOnHand ?? 0)), 0);
  }
  return Math.max(0, Number(product?.availability ?? 0));
}

function basePriceForItem(item: SaleProgramItem, product: BackendProduct | null, variants: AdminProductVariant[]): number {
  const variantId = item.variantId != null ? Number(item.variantId) : null;
  if (variantId) {
    const variant = variants.find((row) => Number(row.id) === variantId);
    const variantPrice = Number(variant?.price ?? NaN);
    if (Number.isFinite(variantPrice) && variantPrice > 0) return variantPrice;
  }
  return Math.max(0, Number(product?.price ?? 0));
}

function programStatus(active: boolean, startAt: string, endAt: string): { label: string; className: string } {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (!active) {
    return { label: "Tạm ngưng", className: "bg-white/10 text-slate-300" };
  }
  if (!Number.isNaN(start.getTime()) && start > now) {
    return { label: "Sắp diễn ra", className: "bg-amber-100 text-amber-800" };
  }
  if (!Number.isNaN(end.getTime()) && end < now) {
    return { label: "Đã kết thúc", className: "bg-white/10 text-slate-300" };
  }
  return { label: "Đang chạy", className: "bg-emerald-100 text-emerald-800" };
}

export default async function AdminSaleProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const programId = Number(id);
  if (!Number.isFinite(programId) || programId <= 0) notFound();

  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog !== false;
  const program = await getAdminSaleProgram(programId, { accessToken: session.token });
  if (!program) notFound();

  const productIds = Array.from(new Set((program.items ?? []).map((item) => Number(item.productId)).filter((pid) => Number.isFinite(pid) && pid > 0)));
  const productEntries = await Promise.all(
    productIds.map(async (productId) => {
      const [adminProduct, variants, balances] = await Promise.all([
        getAdminBackendProductById(String(productId), { accessToken: session.token }),
        listAdminProductVariants(productId, { accessToken: session.token }),
        listAdminStockBalances(productId, { accessToken: session.token }),
      ]);
      const product = adminProduct ?? (await getBackendProductById(String(productId)));
      return [productId, { product, variants, balances } satisfies ProductBundle] as const;
    }),
  );
  const productMap = new Map<number, ProductBundle>(productEntries);

  const enrichedItems = (program.items ?? []).map((item) => {
    const bundle = productMap.get(Number(item.productId)) ?? { product: null, variants: [], balances: [] };
    const variantId = item.variantId != null ? Number(item.variantId) : null;
    const variant = variantId ? bundle.variants.find((row) => Number(row.id) === variantId) : undefined;
    const basePrice = basePriceForItem(item, bundle.product, bundle.variants);
    const finalPrice = salePrice(basePrice, program.discountType, Number(program.discountValue ?? 0));
    const stock = stockForItem(item, bundle.product, bundle.variants, bundle.balances);
    const promoLimit = item.promoQtyLimit != null ? Math.max(0, Number(item.promoQtyLimit)) : null;
    const promoRemaining = promoLimit == null ? stock : Math.min(stock, promoLimit);
    return { item, ...bundle, variant, basePrice, finalPrice, stock, promoLimit, promoRemaining };
  });

  const status = programStatus(program.active, program.startAt, program.endAt);
  const totalStock = enrichedItems.reduce((sum, row) => sum + row.stock, 0);
  const totalPromoRemaining = enrichedItems.reduce((sum, row) => sum + row.promoRemaining, 0);
  const discountLabel = program.discountType === "PERCENT"
    ? `Giảm ${Number(program.discountValue ?? 0).toLocaleString("vi-VN")}%`
    : `Đồng giá ${moneyVnd(Number(program.discountValue ?? 0))}`;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500 mb-2">Chương trình #{program.id}</p>
          <h1 className="font-headline text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
            {program.name}
          </h1>
          <p className="mt-2 text-base text-slate-400">
            {program.description || "Chưa có mô tả."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canWrite ? (
            <Link
              href={`/admin/sales/programs/${program.id}/edit`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105 hover:shadow-purple-900/30"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              Chỉnh sửa
            </Link>
          ) : null}
          <Link
            href="/admin/sales/programs"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white px-6 py-3.5 text-sm font-bold text-slate-300 shadow-sm border border-white/10 backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/5 backdrop-blur-xl text-slate-200 dark:hover:bg-slate-800"
          >
            Quay lại
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Trạng thái", value: status.label, color: status.className, icon: "monitoring" },
          { label: "Khuyến mãi", value: discountLabel, color: "text-blue-300", icon: "sell" },
          { label: "Sản phẩm áp dụng", value: enrichedItems.length.toString(), color: "text-blue-300", icon: "category" },
          { label: "Tồn kho hiện tại", value: totalStock.toLocaleString("vi-VN"), color: "text-blue-300", icon: "inventory_2" },
          { label: "Còn được KM", value: totalPromoRemaining.toLocaleString("vi-VN"), color: "text-emerald-700 dark:text-emerald-400", icon: "inventory" },
        ].map((stat, idx) => (
          <div key={idx} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white p-6 shadow-xl shadow-purple-900/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/10">
            <div className="relative z-10">
              <span className="material-symbols-outlined mb-3 text-3xl text-indigo-500/50 transition-transform group-hover:scale-110 group-hover:text-indigo-600">{stat.icon}</span>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              {stat.label === "Trạng thái" ? (
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${stat.color}`}>{stat.value}</span>
              ) : (
                <p className={`mt-2 font-headline text-2xl font-black ${stat.color}`}>{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white p-8 shadow-xl shadow-purple-900/5 backdrop-blur-xl">
        <h2 className="mb-6 font-headline text-xl font-black text-white">Chi tiết cấu hình</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bắt đầu</p>
            <p className="font-semibold text-white dark:text-slate-200">{formatDateTime(program.startAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kết thúc</p>
            <p className="font-semibold text-white dark:text-slate-200">{formatDateTime(program.endAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kiểu giảm</p>
            <p className="font-semibold text-white dark:text-slate-200">{program.discountType === "PERCENT" ? "Theo phần trăm" : "Đồng giá"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Giá trị</p>
            <p className="font-semibold text-white dark:text-slate-200">
              {program.discountType === "PERCENT" ? `${program.discountValue}%` : moneyVnd(Number(program.discountValue ?? 0))}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white shadow-xl shadow-purple-900/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-xl font-black text-white">Sản phẩm đang được khuyến mãi</h2>
            <p className="mt-1 text-sm text-slate-400">Hiển thị giá gốc, giá khuyến mãi, tồn kho và số lượng còn được áp dụng khuyến mãi.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="bg-white/10 border-white/10 text-white/50 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Biến thể</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Giá gốc</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Giá KM</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Tồn kho</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Giới hạn KM</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Còn KM</th>
                <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {enrichedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-12 text-center text-sm text-slate-400">
                    Chương trình chưa có sản phẩm áp dụng.
                  </td>
                </tr>
              ) : (
                enrichedItems.map((row) => {
                  const product = row.product;
                  const productName = product?.productName ?? `Sản phẩm #${row.item.productId}`;
                  const imageUrl = resolveCatalogImageUrl(product?.primaryImageUrl);
                  const discount = Math.max(0, row.basePrice - row.finalPrice);
                  return (
                    <tr key={`${row.item.productId}-${row.item.variantId ?? "all"}-${row.item.id ?? ""}`} className="transition-colors hover:bg-white/10 border-white/10 text-white/70 dark:hover:bg-slate-800/30">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/10/50 dark:border-slate-700/50 bg-white/5 backdrop-blur-xl text-slate-200 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white dark:text-slate-100">{productName}</p>
                            <p className="mt-1 text-xs text-slate-400">ID {row.item.productId} · SKU {product?.sku ?? "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-300">{variantLabel(row.variant, row.item.variantId)}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{moneyVnd(row.basePrice)}</td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-emerald-400">{moneyVnd(row.finalPrice)}</p>
                        {discount > 0 ? <p className="mt-1 text-[11px] text-slate-400">Giảm {moneyVnd(discount)}</p> : null}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-300">{row.stock.toLocaleString("vi-VN")}</td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                        {row.promoLimit == null ? "Theo tồn kho" : row.promoLimit.toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex min-w-[3rem] justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400">
                          {row.promoRemaining.toLocaleString("vi-VN")}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <Link
                          href={`/admin/products/${row.item.productId}/detail`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border-white/10 text-white dark:bg-slate-800 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                          title="Xem chi tiết sản phẩm"
                        >
                          <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
