import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { notifyAdminWebBestEffort } from "@/lib/admin-web-notify";
import { FloatingNotice } from "@/components/floating-notice";
import { ProductInboundModal } from "@/components/product-inbound-modal";
import { ProductReviewsSection } from "@/components/product-reviews-section";
import { SimilarProductsPanel } from "@/components/similar-products-panel";
import {
  getAdminBackendProductById,
  getBackendProductById,
  hideProduct,
  listAdminProductImages,
  listAdminProductSpecs,
  listAdminProductVariants,
  listAdminStockBalances,
  listAdminStockMovements,
  listSimilarProductsForUi,
  resolveCatalogImageUrl,
  stockInbound,
  unhideProduct,
  getProductChangeLogs,
  type AdminProductImage,
  type AdminProductVariant,
  type AdminStockMovement,
} from "@/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = {
  error?: string;
  success?: string;
};

function moneyVnd(n: number | string | null | undefined): string {
  const x = typeof n === "string" ? Number(n) : n;
  if (x == null || !Number.isFinite(x)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(x);
}

function imageSrc(img: AdminProductImage): string {
  const u = String(img.imageUrl ?? "").trim();
  if (u) return resolveCatalogImageUrl(u);
  return resolveCatalogImageUrl(img.storagePath);
}

function formatStockDateTime(v: string | number[] | null | undefined): string {
  if (v == null) return "—";
  if (typeof v === "string") {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleString("vi-VN");
  }
  if (Array.isArray(v) && v.length >= 3) {
    const [y, m, d, h = 0, min = 0, sec = 0] = v;
    return new Date(y, (m as number) - 1, d as number, h as number, min as number, sec as number).toLocaleString("vi-VN");
  }
  return "—";
}

function movementTypeVi(type: string | null | undefined): string {
  const t = String(type ?? "").toUpperCase();
  if (t.includes("INBOUND")) return "Nhập kho";
  if (t.includes("OUTBOUND")) return "Xuất kho";
  return type ?? "—";
}

function variantStockScope(variants: AdminProductVariant[], variantId: number | null | undefined): string {
  if (variantId == null || !Number.isFinite(Number(variantId))) return "Tổng SP";
  const v = variants.find((x) => x.id === variantId);
  return v ? `${v.size} · ${v.color}` : `#${variantId}`;
}

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog;

  let productCandidate = await getAdminBackendProductById(String(id), { accessToken: session.token });
  if (!productCandidate) {
    productCandidate = await getBackendProductById(String(id));
  }
  if (!productCandidate) {
    notFound();
  }
  const product = productCandidate;

  const pid = String(product.id);
  const numId = Number(pid);
  const token = session.token;

  const [images, specs, variants, balances, movements, similarProducts, changeLogs] = await Promise.all([
    listAdminProductImages(numId, { accessToken: token }),
    listAdminProductSpecs(numId, { accessToken: token }),
    listAdminProductVariants(numId, { accessToken: token }),
    listAdminStockBalances(numId, { accessToken: token }),
    listAdminStockMovements(numId, { accessToken: token }),
    listSimilarProductsForUi(numId, { limit: 6 }),
    getProductChangeLogs(numId, { accessToken: token }),
  ]);

  const isDeleted = product.deletedAt != null && String(product.deletedAt).trim() !== "";
  const isHidden = Boolean(product.hidden);
  const priceNum = Number(product.price ?? 0);
  const effectiveRaw = product.effectivePrice != null ? Number(product.effectivePrice) : priceNum;
  const effectiveNum = Number.isFinite(effectiveRaw) ? effectiveRaw : priceNum;
  const stock = balances.reduce((sum, row) => sum + Number(row.quantityOnHand ?? 0), 0);

  const minV = product.minVariantPrice != null ? Number(product.minVariantPrice) : null;
  const maxV = product.maxVariantPrice != null ? Number(product.maxVariantPrice) : null;
  const variantRange =
    minV != null && maxV != null && Number.isFinite(minV) && Number.isFinite(maxV) && minV > 0 && maxV > 0
      ? minV < maxV
        ? `${moneyVnd(minV)} – ${moneyVnd(maxV)}`
        : moneyVnd(minV)
      : null;

  async function hideCatalogAction() {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    if (!session2.canMutateCatalog) {
      redirect(`/admin/products/${encodeURIComponent(pid)}/detail?error=readonly`);
    }
    try {
      await hideProduct(pid, { accessToken: session2.token, username: session2.username, userId: uid });
    } catch {
      redirect(`/admin/products/${encodeURIComponent(pid)}/detail?error=hide`);
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: uid,
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Ẩn storefront",
      message: `Đã ẩn sản phẩm #${pid}: ${product.productName}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    redirect(`/admin/products/${encodeURIComponent(pid)}/detail?success=hide`);
  }

  async function unhideCatalogAction() {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    if (!session2.canMutateCatalog) {
      redirect(`/admin/products/${encodeURIComponent(pid)}/detail?error=readonly`);
    }
    try {
      await unhideProduct(pid, { accessToken: session2.token, username: session2.username, userId: uid });
    } catch {
      redirect(`/admin/products/${encodeURIComponent(pid)}/detail?error=unhide`);
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: uid,
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Hiện storefront",
      message: `Đã hiển thị lại sản phẩm #${pid}: ${product.productName}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    redirect(`/admin/products/${encodeURIComponent(pid)}/detail?success=unhide`);
  }

  async function stockInboundAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    if (!session2.canMutateCatalog) return;
    const quantity = Number(String(formData.get("quantity") ?? "").trim());
    const variantRaw = String(formData.get("variantId") ?? "").trim();
    const variantId = variantRaw === "" ? undefined : Number(variantRaw);
    const note = String(formData.get("note") ?? "").trim();
    const unitCostRaw = String(formData.get("unitCost") ?? "").trim();
    const unitCost = unitCostRaw === "" ? undefined : Number(unitCostRaw);
    if (!Number.isFinite(quantity) || quantity < 1) return;
    if (variantId !== undefined && (!Number.isFinite(variantId) || variantId < 1)) return;
    try {
      await stockInbound(
        {
          productId: numId,
          variantId,
          quantity,
          note: note || undefined,
          unitCost: Number.isFinite(unitCost as number) && (unitCost as number) >= 0 ? unitCost : undefined,
        },
        { accessToken: session2.token, username: session2.username, userId: uid },
      );
    } catch {
      return;
    }
    const scopeLabel = variantStockScope(variants, variantId);
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: uid,
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Nhập kho",
      message: `Đã nhập kho sản phẩm #${pid} (${product.productName}): +${quantity} (${scopeLabel})${note ? ` — ${note}` : ""}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    redirect(`/admin/products/${encodeURIComponent(pid)}/detail?success=inbound`);
  }

  const inboundVariantOptions = variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    availability: Number(v.availability ?? 0),
    variantName: v.variantName,
    sku: v.sku,
    attributesJson: v.attributesJson,
  }));

  const heroSrc = resolveCatalogImageUrl(product.primaryImageUrl);

  const categoryName =
    product.category?.trim() ||
    (product.categoryId != null ? `Danh mục #${product.categoryId}` : "Chưa phân loại");

  const notice =
    sp?.success === "create"
      ? { variant: "success" as const, title: "Thành Công", message: "Đã tạo sản phẩm mới thành công." }
      : sp?.success === "update"
        ? { variant: "success" as const, title: "Thành Công", message: "Đã cập nhật sản phẩm thành công." }
        : sp?.success === "hide"
          ? { variant: "success" as const, title: "Thành Công", message: "Đã tạm ẩn sản phẩm khỏi storefront." }
          : sp?.success === "unhide"
            ? { variant: "success" as const, title: "Thành Công", message: "Đã hiển thị sản phẩm trên storefront." }
            : sp?.success === "inbound"
              ? { variant: "success" as const, title: "Nhập Kho Thành Công", message: "Đã cập nhật số lượng tồn kho thành công." }
              : sp?.error === "readonly"
                ? { variant: "error" as const, title: "Không đủ quyền", message: "Bạn chỉ có quyền xem, không thể thay đổi dữ liệu." }
                : sp?.error === "hide"
                  ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Không ẩn được sản phẩm. Vui lòng thử lại." }
                  : sp?.error === "unhide"
                    ? { variant: "error" as const, title: "Lỗi Thao Tác", message: "Không hiện lại được sản phẩm. Vui lòng thử lại." }
                    : null;

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {notice && <FloatingNotice variant={notice.variant} title={notice.title} message={notice.message} />}

      {/* ==================== HERO HEADER BANNER ==================== */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl transition-colors">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-5">
            {/* Product Hero Image */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 p-2 shadow-md">
              {heroSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={heroSrc}
                  alt={product.productName}
                  className="h-full w-full object-cover rounded-2xl transition-transform duration-300 hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-2xl">
                  {product.productName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-zinc-500">
                <Link className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors" href="/admin/products">
                  Sản phẩm
                </Link>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span className="font-bold text-blue-600 dark:text-cyan-400 truncate max-w-[200px] sm:max-w-xs">
                  #{pid} {product.productName}
                </span>
              </nav>

              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {product.productName}
                </h1>
                {isHidden && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span className="material-symbols-outlined text-[14px]">visibility_off</span>
                    Tạm ẩn storefront
                  </span>
                )}
                {isDeleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Đã xóa mềm
                  </span>
                )}
                {!isHidden && !isDeleted && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Đang kinh doanh
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                <span className="rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-2 py-0.5 font-mono font-bold text-slate-700 dark:text-cyan-300">
                  ID: #{pid}
                </span>
                {product.sku && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-slate-500 dark:text-zinc-400">SKU: {product.sku}</span>
                  </>
                )}
                <span>·</span>
                <span>
                  Danh mục: <strong className="text-slate-700 dark:text-zinc-200">{categoryName}</strong>
                </span>
                {product.brandName && (
                  <>
                    <span>·</span>
                    <span>
                      Thương hiệu: <strong className="text-blue-600 dark:text-cyan-400">{product.brandName}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            <Link
              prefetch
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/5 px-4 py-3 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-200 dark:hover:bg-white/10 shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Danh sách</span>
            </Link>

            {canWrite && !isDeleted && (
              <>
                {isHidden ? (
                  <form action={unhideCatalogAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-xs active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">public</span>
                      <span>Hiện storefront</span>
                    </button>
                  </form>
                ) : (
                  <form action={hideCatalogAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 px-4 py-3 text-xs font-bold text-amber-600 dark:text-amber-400 transition-all hover:bg-amber-100 dark:hover:bg-amber-900/30 shadow-xs active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                      <span>Ẩn storefront</span>
                    </button>
                  </form>
                )}

                <ProductInboundModal
                  triggerClassName="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/40 shadow-xs active:scale-95"
                  productName={product.productName}
                  variants={inboundVariantOptions}
                  inboundAction={stockInboundAction}
                />

                <Link
                  prefetch
                  href={`/admin/products/${encodeURIComponent(pid)}/edit`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 px-5 py-3 font-headline text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/35 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  <span>Chỉnh sửa</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 6 Statistics Cards in Header */}
        <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 border-t border-slate-100 dark:border-white/10 pt-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-cyan-400">payments</span>
              <span>Giá niêm yết</span>
            </div>
            <p className="mt-1.5 font-headline text-lg font-black text-slate-900 dark:text-white truncate">
              {moneyVnd(priceNum)}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {effectiveNum !== priceNum ? `Ưu đãi: ${moneyVnd(effectiveNum)}` : "Giá cơ sở"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">warehouse</span>
              <span>Tổng tồn kho</span>
            </div>
            <p className="mt-1.5 font-headline text-lg font-black text-emerald-600 dark:text-emerald-400">
              {stock} <span className="text-xs font-normal text-slate-400">sp</span>
            </p>
            <p className="text-[10px] text-slate-400">Khả dụng toàn sàn</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400">layers</span>
              <span>Biến thể đa tầng</span>
            </div>
            <p className="mt-1.5 font-headline text-lg font-black text-purple-600 dark:text-purple-400">
              {variants.length} <span className="text-xs font-normal text-slate-400">SKU</span>
            </p>
            <p className="text-[10px] text-slate-400">Phân loại độc lập</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">visibility</span>
              <span>Lượt xem</span>
            </div>
            <p className="mt-1.5 font-headline text-lg font-black text-slate-900 dark:text-white">
              {product.viewCount ?? 0}
            </p>
            <p className="text-[10px] text-slate-400">Lượt truy cập</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400">shopping_bag</span>
              <span>Đã bán</span>
            </div>
            <p className="mt-1.5 font-headline text-lg font-black text-slate-900 dark:text-white">
              {product.salesCount ?? 0} <span className="text-xs font-normal text-slate-400">đơn</span>
            </p>
            <p className="text-[10px] text-slate-400">Doanh số sàn</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-3.5 backdrop-blur-md shadow-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[16px] text-rose-600 dark:text-rose-400">photo_library</span>
              <span>Tư liệu</span>
            </div>
            <p className="mt-1.5 font-headline text-lg font-black text-slate-900 dark:text-white">
              {images.length} <span className="text-xs font-normal text-slate-400">ảnh</span> · {specs.length} <span className="text-xs font-normal text-slate-400">số</span>
            </p>
            <p className="text-[10px] text-slate-400">Media &amp; thông số</p>
          </div>
        </div>
      </section>

      {/* ==================== QUICK SECTION NAVIGATION ==================== */}
      <nav
        aria-label="Mục trên trang"
        className="sticky top-4 z-20 flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 p-1.5 backdrop-blur-xl shadow-sm"
      >
        <a
          href="#section-overview"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>Tổng quan</span>
        </a>
        <a
          href="#section-variants"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">layers</span>
          <span>Biến thể ({variants.length})</span>
        </a>
        <a
          href="#section-images"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">perm_media</span>
          <span>Phương tiện ({images.length})</span>
        </a>
        <a
          href="#section-specs"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">list_alt</span>
          <span>Thông số ({specs.length})</span>
        </a>
        <a
          href="#section-stock"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">warehouse</span>
          <span>Kho &amp; Lịch sử ({movements.length})</span>
        </a>
        <a
          href="#section-reviews"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">grade</span>
          <span>Đánh giá</span>
        </a>
        <a
          href="#section-changelogs"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-cyan-400 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">manage_history</span>
          <span>Lịch sử ({changeLogs.length})</span>
        </a>
      </nav>

      {/* ==================== SECTION 1: OVERVIEW CARD ==================== */}
      <section
        id="section-overview"
        className="scroll-mt-24 relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-sm dark:shadow-2xl backdrop-blur-2xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-cyan-600/20 blur-[100px] rounded-full" />
        </div>

        <div className="relative z-10 grid gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Showcase Image & Badges */}
          <div className="flex flex-col items-center lg:items-start lg:col-span-4 xl:col-span-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">
              Hình ảnh đại diện
            </p>
            <div className="w-full max-w-[280px]">
              <div className="aspect-square w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-zinc-900 p-2 shadow-sm">
                {heroSrc ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={heroSrc} alt={product.productName} className="h-full w-full object-contain rounded-2xl" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-zinc-700">
                    <span className="material-symbols-outlined text-5xl">inventory_2</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 w-full space-y-2 max-w-[280px]">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-900/60 p-2.5 border border-slate-200/60 dark:border-white/5 text-xs">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">Trạng thái:</span>
                {isHidden ? (
                  <span className="font-bold text-amber-600 dark:text-amber-400">Tạm ẩn</span>
                ) : isDeleted ? (
                  <span className="font-bold text-rose-600 dark:text-rose-400">Đã xóa mềm</span>
                ) : (
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Hiển thị</span>
                )}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-zinc-900/60 p-2.5 border border-slate-200/60 dark:border-white/5 text-xs">
                <span className="font-semibold text-slate-500 dark:text-zinc-400">Mã SKU:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">{product.sku || "—"}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Details */}
          <div className="min-w-0 space-y-6 lg:col-span-8 xl:col-span-9">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 dark:border-cyan-500/30 bg-blue-50/80 dark:bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400">
                <span className="material-symbols-outlined text-[13px]">category</span>
                {categoryName}
              </p>
              <h2 className="mt-3 font-headline text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {product.productName}
              </h2>
              {product.brandName && (
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400 font-medium">
                  Thương hiệu: <strong className="text-blue-600 dark:text-cyan-400">{product.brandName}</strong>
                </p>
              )}
            </div>

            {/* Spec grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá niêm yết</p>
                <p className="mt-1 text-xl font-black text-slate-900 dark:text-white">{moneyVnd(priceNum)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Giá hiệu lực (Storefront)</p>
                <p className="mt-1 text-xl font-black text-blue-600 dark:text-cyan-400">{moneyVnd(effectiveNum)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tồn kho khả dụng</p>
                <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {stock} <span className="text-xs font-normal text-slate-400">sản phẩm</span>
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Thương hiệu</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {product.brandName || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Khoảng giá biến thể</p>
                <p className="mt-1 text-base font-bold text-purple-600 dark:text-purple-400">
                  {variantRange || "1 mức giá"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-zinc-900/60 p-4 shadow-xs">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Số lượng biến thể</p>
                <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                  {variants.length} SKU độc lập
                </p>
              </div>
            </div>

            {/* Description Box */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900/40 p-5 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">notes</span>
                Mô tả sản phẩm
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {product.discription?.trim() ? product.discription : "Chưa có mô tả cho sản phẩm này."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 2: MULTI-TIER VARIANTS MATRIX ==================== */}
      <section
        id="section-variants"
        className="scroll-mt-24 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-3xl">layers</span>
                Biến thể đa tầng ({variants.length})
              </h3>
              <span className="rounded-full bg-blue-50 dark:bg-cyan-950/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-cyan-800/60">
                Multi-Tier
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
              Ma trận phân loại 2 tầng (Màu sắc × Kích cỡ/Dung lượng) với hình ảnh, giá bán, giá gốc và tồn kho độc lập.
            </p>
          </div>

          {canWrite && !isDeleted && (
            <Link
              prefetch
              href={`/admin/products/${encodeURIComponent(pid)}/edit#section-variants`}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 dark:bg-cyan-950/40 px-4 py-2.5 text-xs font-bold text-blue-600 dark:text-cyan-400 border border-blue-200/60 dark:border-cyan-800/60 hover:bg-blue-100 dark:hover:bg-cyan-900/50 transition-all active:scale-95 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              Quản lý ma trận biến thể
            </Link>
          )}
        </div>

        {variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600 mb-2">layers_clear</span>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Chưa có biến thể nào được thiết lập</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Sản phẩm hiện đang bán theo 1 mức giá cố định duy nhất.</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 shadow-sm backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-4 pl-6 pr-3">#</th>
                    <th className="py-4 px-3">Ảnh &amp; Phân loại đa tầng</th>
                    <th className="py-4 px-3">Tên SKU</th>
                    <th className="py-4 px-3">Giá bán</th>
                    <th className="py-4 px-3">Tồn kho</th>
                    <th className="py-4 pr-6 pl-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-300">
                  {variants.map((v, idx) => {
                    const variantStock = v.availability ?? 0;
                    const hasOriginal = v.originalPrice != null && Number(v.originalPrice) > Number(v.price ?? 0);

                    // Parse dynamic attributesJson if present
                    let dynamicAttrs: Array<{ name: string; value: string }> = [];
                    if (v.attributesJson) {
                      try {
                        const parsed = JSON.parse(v.attributesJson);
                        if (Array.isArray(parsed)) {
                          dynamicAttrs = parsed
                            .map((item: any) => ({
                              name: String(item.tierName || item.name || "").trim(),
                              value: String(item.value || "").trim(),
                            }))
                            .filter((x) => x.value);
                        }
                      } catch {}
                    }

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-6 pr-3 font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            {v.variantImageUrl ? (
                              <a
                                href={resolveCatalogImageUrl(v.variantImageUrl)}
                                className="inline-block shrink-0"
                                target="_blank"
                                rel="noreferrer"
                                title="Xem ảnh đầy đủ"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={resolveCatalogImageUrl(v.variantImageUrl)}
                                  alt=""
                                  className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200/90 dark:ring-white/10 shadow-xs transition-transform duration-300 hover:scale-105"
                                />
                              </a>
                            ) : (
                              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 border border-dashed border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-400">
                                Trống
                              </span>
                            )}

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono text-slate-400 block">ID #{v.id}</span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {dynamicAttrs.length > 0 ? (
                                  dynamicAttrs.map((attr, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                                        aIdx === 0
                                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-blue-800/60"
                                          : aIdx === 1
                                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                                      }`}
                                    >
                                      {attr.name && <span className="opacity-60 text-[10px] uppercase font-normal">{attr.name}:</span>}
                                      <span>{attr.value}</span>
                                    </span>
                                  ))
                                ) : (
                                  <>
                                    <span className="rounded-lg bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-cyan-400 border border-blue-200/60 dark:border-blue-800/60">
                                      {v.color || "—"}
                                    </span>
                                    {v.size && v.size !== "—" && (
                                      <span className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                                        {v.size}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                            {v.variantName || `${v.color} - ${v.size}`}
                          </p>
                          {v.sku && (
                            <span className="mt-1 inline-block rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400">
                              SKU: {v.sku}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-3 whitespace-nowrap">
                          <p className="text-sm font-black text-blue-600 dark:text-cyan-400">
                            {v.price != null ? moneyVnd(Number(v.price)) : "—"}
                          </p>
                          {hasOriginal && (
                            <p className="text-[11px] text-slate-400 line-through">
                              {moneyVnd(Number(v.originalPrice))}
                            </p>
                          )}
                        </td>

                        <td className="py-4 px-3">
                          <span className="font-mono text-xs font-black text-slate-800 dark:text-zinc-200">
                            {variantStock} sp
                          </span>
                        </td>

                        <td className="py-4 pr-6 pl-3">
                          {variantStock > 5 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Sẵn hàng
                            </span>
                          ) : variantStock > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Hết hàng
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ==================== SECTION 3: MEDIA GALLERY ==================== */}
      <section
        id="section-images"
        className="scroll-mt-24 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-3xl">perm_media</span>
              Phương tiện ({images.length})
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
              Quản lý kho ảnh đại diện, ảnh chụp chi tiết và video giới thiệu sản phẩm.
            </p>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600 mb-2">hide_image</span>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Chưa có phương tiện đính kèm nào</p>
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((img: any) => {
              const isVideo = img.mediaType === "VIDEO";
              return (
                <li
                  key={img.id}
                  className="group relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400/40 dark:hover:border-cyan-500/40"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                    {isVideo ? (
                      <video
                        src={imageSrc(img)}
                        controls
                        className="h-full w-full object-contain bg-black/90"
                      />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imageSrc(img)}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                      {img.primaryImage && (
                        <div className="backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 shadow-md px-2.5 py-1 rounded-full flex items-center gap-1 text-blue-600 dark:text-cyan-400 ring-1 ring-blue-500/20">
                          <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                          <span className="text-[10px] font-black uppercase tracking-wider">Ảnh chính</span>
                        </div>
                      )}
                      <div className="backdrop-blur-md bg-black/50 text-white shadow-md px-2.5 py-1 rounded-full flex items-center gap-1 ring-1 ring-white/10">
                        <span className="material-symbols-outlined text-[14px]">{isVideo ? "movie" : "image"}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{isVideo ? "Video" : "Ảnh"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <p className="font-bold text-slate-800 dark:text-zinc-100 text-xs">
                      {img.primaryImage ? "Ảnh đại diện chính" : isVideo ? "Video đính kèm" : "Ảnh chụp góc cạnh"}
                    </p>
                    {img.sortOrder != null && (
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        #{img.sortOrder}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ==================== SECTION 4: SPECIFICATIONS ==================== */}
      <section
        id="section-specs"
        className="scroll-mt-24 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <span className="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-3xl">list_alt</span>
          Thông số kỹ thuật ({specs.length})
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
          Chi tiết tên thông số, giá trị và đơn vị tính của sản phẩm.
        </p>

        {specs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-white/10 mt-6 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600 mb-2">format_list_bulleted</span>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Chưa có thông số kỹ thuật</p>
          </div>
        ) : (
          <div className="mt-6 w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  <th className="py-4 pl-6 pr-4">Thứ tự</th>
                  <th className="py-4 pr-4">Thông số</th>
                  <th className="py-4 pr-4">Giá trị</th>
                  <th className="py-4 pr-6">Đơn vị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-300">
                {specs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-6 pr-4 font-mono font-bold text-slate-400">{s.sortOrder ?? "—"}</td>
                    <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">{s.specKey}</td>
                    <td className="py-3.5 pr-4 font-medium text-slate-600 dark:text-zinc-300">{s.specValue}</td>
                    <td className="py-3.5 pr-6 font-mono text-slate-400">{s.unit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ==================== SECTION 5: INVENTORY & STOCK MOVEMENTS ==================== */}
      <section
        id="section-stock"
        className="scroll-mt-24 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">warehouse</span>
              Kho hàng &amp; Lịch sử nhập/xuất ({movements.length})
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
              Nhật ký biến động tồn kho chi tiết theo từng phiên bản SKU và thời điểm.
            </p>
          </div>

          {canWrite && !isDeleted && (
            <ProductInboundModal
              triggerClassName="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/80 dark:bg-emerald-950/40 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-xs transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95"
              productName={product.productName}
              variants={inboundVariantOptions.map((v, index) => ({ ...v, selected: index === 0 }))}
              inboundAction={stockInboundAction}
            />
          )}
        </div>

        {movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600 mb-2">history</span>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Chưa có phiếu kho nào được ghi nhận</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-4 pl-6 pr-4">Loại phiếu</th>
                    <th className="py-4 pr-4">Số lượng</th>
                    <th className="py-4 pr-4">Phạm vi biến thể</th>
                    <th className="py-4 pr-4">Tồn sau</th>
                    <th className="py-4 pr-4">Đơn giá</th>
                    <th className="py-4 pr-4">Thời điểm</th>
                    <th className="py-4 pr-4">Người tạo</th>
                    <th className="py-4 pr-6">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-300">
                  {movements.map((m: AdminStockMovement) => {
                    const isInbound = String(m.movementType ?? "").toUpperCase().includes("INBOUND");
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pl-6 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isInbound
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {isInbound ? "add_circle" : "remove_circle"}
                            </span>
                            <span>{movementTypeVi(m.movementType)}</span>
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-mono font-bold text-slate-900 dark:text-white">
                          {isInbound ? `+${m.quantity}` : `-${m.quantity}`}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-600 dark:text-zinc-300 font-medium">
                          {variantStockScope(variants, m.variantId)}
                        </td>
                        <td className="py-3.5 pr-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {m.balanceAfter ?? "—"}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-600 dark:text-zinc-300">
                          {moneyVnd(m.unitCost)}
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap text-slate-500 dark:text-zinc-400">
                          {formatStockDateTime(m.movementAt ?? undefined)}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500 dark:text-zinc-400 font-medium">
                          {m.createdBy ?? "—"}
                        </td>
                        <td className="py-3.5 pr-6 max-w-[200px] truncate text-slate-500 dark:text-zinc-400" title={m.note ?? ""}>
                          {m.note?.trim() ? m.note : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ==================== SECTION 6: REVIEWS ==================== */}
      <ProductReviewsSection productId={numId} />

      {/* ==================== SECTION 7: CHANGELOGS ==================== */}
      <section
        id="section-changelogs"
        className="scroll-mt-24 rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden"
      >
        <div className="flex flex-wrap items-center justify-between gap-6 mb-6">
          <div>
            <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">manage_history</span>
              Lịch sử thay đổi ({changeLogs.length})
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
              Ghi nhận chi tiết các lần cập nhật thông tin sản phẩm trên hệ thống.
            </p>
          </div>
        </div>

        {changeLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600 mb-2">history_toggle_off</span>
            <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Chưa có lịch sử thay đổi</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-zinc-900/90 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    <th className="py-4 pl-6 pr-4">Trường thay đổi</th>
                    <th className="py-4 pr-4">Giá trị cũ</th>
                    <th className="py-4 pr-4">Giá trị mới</th>
                    <th className="py-4 pr-4">Thời điểm</th>
                    <th className="py-4 pr-6">Người thực hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-slate-700 dark:text-zinc-300">
                  {changeLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-6 pr-4 font-bold text-slate-900 dark:text-white">
                        {log.changedField}
                      </td>
                      <td className="py-3.5 pr-4 max-w-[200px] truncate text-slate-400 line-through" title={log.oldValue ?? ""}>
                        {log.oldValue ?? "—"}
                      </td>
                      <td className="py-3.5 pr-4 max-w-[200px] truncate font-bold text-emerald-600 dark:text-emerald-400" title={log.newValue ?? ""}>
                        {log.newValue ?? "—"}
                      </td>
                      <td className="py-3.5 pr-4 whitespace-nowrap text-slate-500 dark:text-zinc-400">
                        {formatStockDateTime(log.changedAt)}
                      </td>
                      <td className="py-3.5 pr-6">
                        <span className="inline-block rounded-lg bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                          {log.changedBy ?? "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ==================== SECTION 8: SIMILAR PRODUCTS ==================== */}
      <SimilarProductsPanel items={similarProducts} />
    </div>
  );
}

