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
import { parseVariantTiers } from "@/lib/variant-tier-utils";

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
    return { label: "Tạm ngưng", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
  }
  if (!Number.isNaN(start.getTime()) && start > now) {
    return { label: "Sắp diễn ra", className: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" };
  }
  if (!Number.isNaN(end.getTime()) && end < now) {
    return { label: "Đã kết thúc", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
  }
  return { label: "Đang diễn ra", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" };
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
    const parsedVariant = variant ? parseVariantTiers(variant) : null;
    const basePrice = basePriceForItem(item, bundle.product, bundle.variants);
    const finalPrice = salePrice(basePrice, program.discountType, Number(program.discountValue ?? 0));
    const stock = stockForItem(item, bundle.product, bundle.variants, bundle.balances);
    const promoLimit = item.promoQtyLimit != null ? Math.max(0, Number(item.promoQtyLimit)) : null;
    const promoRemaining = promoLimit == null ? stock : Math.min(stock, promoLimit);
    return { item, ...bundle, variant, parsedVariant, basePrice, finalPrice, stock, promoLimit, promoRemaining };
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
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/95 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Chương trình #{program.id}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}>
                {status.label}
              </span>
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {program.name}
            </h1>
            <p className="max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
              {program.description || "Chưa có mô tả cho chương trình khuyến mãi này."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canWrite && (
              <Link
                href={`/admin/sales/programs/${program.id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Chỉnh sửa
              </Link>
            )}
            <Link
              href="/admin/sales/programs"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </section>

      {/* 5 KPI Stat Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Trạng thái", value: status.label, color: status.className, isBadge: true, icon: "schedule" },
          { label: "Mức giảm", value: discountLabel, color: "text-indigo-600 dark:text-indigo-400", icon: "sell" },
          { label: "Sản phẩm áp dụng", value: enrichedItems.length.toString(), color: "text-slate-900 dark:text-white", icon: "category" },
          { label: "Tổng tồn kho", value: totalStock.toLocaleString("vi-VN"), color: "text-slate-900 dark:text-white", icon: "inventory_2" },
          { label: "Còn được KM", value: totalPromoRemaining.toLocaleString("vi-VN"), color: "text-emerald-600 dark:text-emerald-400", icon: "task_alt" },
        ].map((stat, idx) => (
          <div 
            key={idx} 
            className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-xl transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">{stat.label}</p>
              <span className="material-symbols-outlined text-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                {stat.icon}
              </span>
            </div>
            {stat.isBadge ? (
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${stat.color}`}>
                {stat.value}
              </span>
            ) : (
              <p className={`mt-2 font-headline text-2xl font-black ${stat.color}`}>
                {stat.value}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Configuration Details Card */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 md:p-8 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <h2 className="mb-6 font-headline text-lg font-black text-slate-900 dark:text-white">Chi tiết cấu hình thời gian</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Bắt đầu từ</p>
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{formatDateTime(program.startAt)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Kết thúc lúc</p>
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">{formatDateTime(program.endAt)}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Kiểu giảm giá</p>
            <p className="mt-1 font-bold text-slate-800 dark:text-slate-100">
              {program.discountType === "PERCENT" ? "Theo phần trăm (%)" : "Đồng giá (VNĐ)"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Mức chiết khấu</p>
            <p className="mt-1 font-bold text-indigo-600 dark:text-indigo-400">
              {program.discountType === "PERCENT" ? `${program.discountValue}%` : moneyVnd(Number(program.discountValue ?? 0))}
            </p>
          </div>
        </div>
      </section>

      {/* Applied Products Table */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 dark:border-slate-800">
          <div>
            <h2 className="font-headline text-xl font-black text-slate-900 dark:text-white">Sản phẩm áp dụng khuyến mãi</h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Chi tiết giá niêm yết, giá khuyến mãi, cấu hình biến thể nhiều tầng và giới hạn số lượng.
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/50">
              <tr>
                <th className="px-8 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Sản phẩm</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Biến thể áp dụng</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">Giá gốc</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">Giá Sale</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">Tồn kho</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">Giới hạn</th>
                <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">Còn KM</th>
                <th className="px-8 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {enrichedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-8 py-16 text-center text-sm font-semibold text-slate-400">
                    Chương trình chưa có sản phẩm áp dụng nào.
                  </td>
                </tr>
              ) : (
                enrichedItems.map((row) => {
                  const product = row.product;
                  const productName = product?.productName ?? `Sản phẩm #${row.item.productId}`;
                  const imageUrl = resolveCatalogImageUrl(product?.primaryImageUrl);
                  const discount = Math.max(0, row.basePrice - row.finalPrice);
                  const parsedV = row.parsedVariant;

                  return (
                    <tr 
                      key={`${row.item.productId}-${row.item.variantId ?? "all"}-${row.item.id ?? ""}`} 
                      className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                    >
                      {/* Product Name & Image */}
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{productName}</p>
                            <p className="mt-0.5 text-xs text-slate-400">ID #{row.item.productId} {product?.sku && `• SKU: ${product.sku}`}</p>
                          </div>
                        </div>
                      </td>

                      {/* Multi-tier Variant cell */}
                      <td className="px-6 py-4">
                        {!row.item.variantId ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            <span className="material-symbols-outlined text-[14px]">all_inclusive</span>
                            Toàn bộ sản phẩm
                          </span>
                        ) : parsedV && parsedV.tiers.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {parsedV.tiers.map((t, tidx) => (
                              <span key={tidx} className="inline-flex items-center gap-0.5 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                <span className="text-slate-400 font-semibold">{t.name}:</span>
                                <span>{t.value}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {parsedV ? parsedV.fullLabel : `Biến thể #${row.item.variantId}`}
                          </span>
                        )}
                      </td>

                      {/* Base Price */}
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {moneyVnd(row.basePrice)}
                      </td>

                      {/* Sale Price */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{moneyVnd(row.finalPrice)}</p>
                        {discount > 0 && (
                          <p className="mt-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            - {moneyVnd(discount)}
                          </p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {row.stock.toLocaleString("vi-VN")}
                      </td>

                      {/* Promo Limit */}
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {row.promoLimit == null ? "Không giới hạn" : row.promoLimit.toLocaleString("vi-VN")}
                      </td>

                      {/* Promo Remaining */}
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex min-w-[3rem] justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                          {row.promoRemaining.toLocaleString("vi-VN")}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-8 py-4 text-right">
                        <Link
                          href={`/admin/products/${row.item.productId}/detail`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-300 transition-colors"
                          title="Xem chi tiết sản phẩm"
                        >
                          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
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
