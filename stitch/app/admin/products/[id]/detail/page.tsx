import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { notifyAdminWebBestEffort } from "@/lib/admin-web-notify";
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

function moneyVnd(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
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

function moneyInline(n: number | string | null | undefined): string {
  const x = typeof n === "string" ? Number(n) : n;
  if (n == null || !Number.isFinite(x as number)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(x as number);
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
  }

  const err = sp?.error;
  const ok = sp?.success;

  const inboundVariantOptions = variants.map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    availability: Number(v.availability ?? 0),
  }));

  const statCardClass =
    "rounded-xl border border-outline-variant/10 bg-white/90 px-4 py-4 shadow-sm ring-1 ring-slate-100/80 backdrop-blur-sm sm:px-5";

  const heroSrc = resolveCatalogImageUrl(product.primaryImageUrl);

  const categoryName =
    product.category?.trim() ||
    (product.categoryId != null ? `Danh mục #${product.categoryId}` : "Chưa phân loại");

  return (
    <div className="w-full max-w-none space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Sản phẩm #{pid}</p>
          <h1 className="font-headline text-3xl font-black text-blue-900">Chi tiết &amp; xem trước dữ liệu</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            Tổng hợp thông tin sản phẩm: ảnh, thông số kỹ thuật, biến thể và kho — để kiểm tra trước khi hiển thị trên cửa hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <>
              <Link
                prefetch
                href={`/admin/products/${encodeURIComponent(pid)}/edit`}
                className="rounded-xl bg-kinetic px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95"
              >
                Chỉnh sửa
              </Link>
              <ProductInboundModal
                triggerClassName="rounded-xl border-2 border-emerald-600/35 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-100"
                productName={product.productName}
                variants={inboundVariantOptions}
                inboundAction={stockInboundAction}
              />
            </>
          ) : null}
          <Link
            prefetch
            href="/admin/products"
            className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm hover:bg-surface-container-high"
          >
            ← Danh sách
          </Link>
        </div>
      </div>

      <nav
        aria-label="Mục trên trang"
        className="grid grid-cols-2 gap-2 rounded-2xl border border-outline-variant/10 bg-surface-container-low/50 p-2 sm:grid-cols-3 lg:grid-cols-7"
      >
        <a
          href="#section-overview"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Tổng quan
        </a>
        <a
          href="#section-images"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Phương tiện ({images.length})
        </a>
        <a
          href="#section-specs"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Thông số ({specs.length})
        </a>
        <a
          href="#section-variants"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Biến thể ({variants.length})
        </a>
        <a
          href="#section-stock"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Kho ({movements.length})
        </a>
        <a
          href="#section-reviews"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Đánh giá
        </a>
        <a
          href="#section-changelogs"
          className="flex min-h-[2.75rem] items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold text-blue-900 transition hover:bg-white hover:shadow-sm sm:text-sm"
        >
          Lịch sử ({changeLogs.length})
        </a>
      </nav>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className={statCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giá niêm yết</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{moneyVnd(priceNum)}</p>
        </div>
        <div className={statCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tồn kho</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{stock}</p>
        </div>
        <div className={statCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lượt xem</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{product.viewCount ?? 0}</p>
        </div>
        <div className={statCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Đã bán</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{product.salesCount ?? 0}</p>
        </div>
        <div className={statCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Phương tiện / Thông số</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">
            {images.length} · {specs.length}
          </p>
        </div>
        <div className={statCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Biến thể</p>
          <p className="mt-1 font-headline text-lg font-black text-blue-900">{variants.length}</p>
        </div>
      </div>

      {err === "readonly" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">Không đủ quyền chỉnh sửa sản phẩm.</p>
      )}
      {err === "hide" && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">Không ẩn được sản phẩm. Kiểm tra gateway hoặc trạng thái bản ghi.</p>
      )}
      {err === "unhide" && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">Không hiện lại được sản phẩm. Kiểm tra gateway hoặc trạng thái bản ghi.</p>
      )}
      {ok === "hide" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Đã ẩn sản phẩm khỏi cửa hàng.</p>
      )}
      {ok === "unhide" && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Đã hiện sản phẩm trên cửa hàng.</p>
      )}
      {ok === "inbound" && null}
      {err === "inbound_validation" && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          Nhập số lượng nguyên dương (tối thiểu 1).
        </p>
      )}

      <section
        id="section-overview"
        className="scroll-mt-24 relative overflow-hidden rounded-[2.5rem] border border-indigo-100/50 bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/30 shadow-xl shadow-blue-900/5 ring-1 ring-slate-900/5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 grid gap-8 p-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
          <div className="flex flex-col lg:col-span-4 xl:col-span-3">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Ảnh chính</p>
            <div className="mx-auto w-full max-w-[280px] lg:mx-0">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-outline-variant/15 bg-slate-100 shadow-md ring-1 ring-slate-200/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroSrc} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-5 lg:col-span-8 xl:col-span-9">
            <div>
              <h2 className="font-headline text-2xl font-black text-blue-900 sm:text-3xl">{product.productName}</h2>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-bold text-slate-800">Danh mục</span>
                <span className="font-headline text-base font-bold text-blue-900/95">{categoryName}</span>
                {product.categoryId != null ? (
                  <span className="text-xs font-medium text-on-surface-variant">(id {product.categoryId})</span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800">SKU {product.sku ?? `—`}</span>
              {isDeleted ? (
                <span className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800">Đã xóa mềm</span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">Chưa xóa mềm</span>
              )}
              {isHidden ? (
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">Đang ẩn khỏi cửa hàng</span>
              ) : (
                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">Hiện trên cửa hàng</span>
              )}
            </div>

            {variants.length > 0 ? (
              <p className="text-xs text-on-surface-variant">
                Ảnh từng biến thể xem mục{" "}
                <a href="#section-variants" className="font-bold text-primary underline">
                  Biến thể
                </a>
                .
              </p>
            ) : null}

            {canWrite && !isDeleted ? (
              <div className="flex flex-wrap gap-2">
                {isHidden ? (
                  <form action={unhideCatalogAction}>
                    <button
                      type="submit"
                      className="rounded-xl border-2 border-emerald-500/50 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-100"
                    >
                      Hiện trên cửa hàng
                    </button>
                  </form>
                ) : (
                  <form action={hideCatalogAction}>
                    <button
                      type="submit"
                      className="rounded-xl border-2 border-amber-500/50 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
                    >
                      Ẩn khỏi cửa hàng
                    </button>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-outline-variant/10 bg-surface-container-low/50 px-6 py-4 lg:px-8">
          <h3 className="font-headline text-sm font-black uppercase tracking-widest text-indigo-900/80 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">info</span> Thông tin sản phẩm</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">Giá, danh mục, tồn và trạng thái hiển thị (không hiện mã cột nội bộ).</p>
        </div>
        <div className="relative z-10 overflow-x-auto border-t border-indigo-100/30 bg-white/40 backdrop-blur-md">
          <dl className="grid min-w-[720px] gap-6 p-8 sm:min-w-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 lg:p-10">
            <div className="group rounded-[1.5rem] border border-slate-200/60 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200">
              <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">Danh mục</dt>
              <dd className="mt-2 text-base font-bold text-slate-800 transition-colors group-hover:text-indigo-700">{categoryName}</dd>
            </div>
            <div className="group rounded-[1.5rem] border border-slate-200/60 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200">
              <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">Thương hiệu</dt>
              <dd className="mt-2 text-base font-bold text-slate-800 transition-colors group-hover:text-indigo-700">
                {product.brandName?.trim() ? product.brandName : "—"}
                {product.brandId != null ? <span className="ml-1 text-xs font-normal text-slate-500">(id {product.brandId})</span> : null}
              </dd>
            </div>
            <div className="group rounded-[1.5rem] border border-slate-200/60 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200">
              <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">Giá niêm yết</dt>
              <dd className="mt-2 text-xl font-black text-slate-900 transition-colors group-hover:text-indigo-700">{moneyVnd(priceNum)}</dd>
            </div>
            <div className="group rounded-[1.5rem] border border-slate-200/60 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-200">
              <dt className="text-[11px] font-black uppercase tracking-widest text-slate-400">Giá hiệu lực</dt>
              <dd className="mt-2 text-xl font-black text-indigo-600">{moneyVnd(effectiveNum)}</dd>
            </div>
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tồn kho</dt>
              <dd className="mt-1 text-lg font-black text-blue-900">{stock}</dd>
              <dd className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                Điều chỉnh chính qua nhập kho / inventory; PUT sản phẩm không đổi tồn.
              </dd>
            </div>
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Ẩn khỏi cửa hàng</dt>
              <dd className="mt-1 text-sm font-bold text-blue-900">{isHidden ? "Có" : "Không"}</dd>
            </div>
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 p-4">
              <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Xóa mềm</dt>
              <dd className="mt-1 break-all text-sm font-bold text-blue-900">
                {isDeleted ? String(product.deletedAt) : "— (đang hoạt động)"}
              </dd>
            </div>
            {variantRange ? (
              <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 p-4 sm:col-span-2 lg:col-span-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Khoảng giá biến thể</dt>
                <dd className="mt-1 text-sm font-bold text-blue-900">{variantRange}</dd>
              </div>
            ) : null}
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 p-4 sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mô tả</dt>
              <dd className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {product.discription?.trim() ? product.discription : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="section-images" className="scroll-mt-24 rounded-3xl border border-outline-variant/10 bg-gradient-to-br from-surface-container-lowest to-blue-50/30 p-6 shadow-xl shadow-blue-900/5 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div>
            <h3 className="font-headline text-2xl font-black text-blue-900 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-500 text-3xl">perm_media</span>
              Phương tiện ({images.length})
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant font-medium">Quản lý kho ảnh đại diện, ảnh chụp chi tiết và video minh họa.</p>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-100 rounded-3xl bg-white/50">
            <span className="material-symbols-outlined text-5xl text-indigo-200 mb-3">hide_image</span>
            <p className="text-sm font-bold text-indigo-900/50">Sản phẩm chưa có phương tiện nào</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10">
            {images.map((img: any) => {
              const isVideo = img.mediaType === "VIDEO";
              return (
                <li key={img.id} className="group relative overflow-hidden rounded-[2rem] bg-white shadow-md ring-1 ring-slate-900/5 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 hover:ring-indigo-500/30">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    {isVideo ? (
                      <video src={imageSrc(img)} controls className="h-full w-full object-contain bg-black/90 transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <img src={imageSrc(img)} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                      {img.primaryImage && (
                        <div className="backdrop-blur-md bg-white/90 shadow-lg px-3 py-1.5 rounded-full flex items-center gap-1.5 text-indigo-600 ring-1 ring-indigo-500/20 animate-in fade-in slide-in-from-top-2">
                          <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                          <span className="text-[10px] font-black uppercase tracking-wider">Ảnh chính</span>
                        </div>
                      )}
                      <div className="backdrop-blur-md bg-black/40 text-white shadow-lg px-3 py-1.5 rounded-full flex items-center gap-1.5 ring-1 ring-white/10">
                        <span className="material-symbols-outlined text-[14px]">{isVideo ? 'movie' : 'image'}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{isVideo ? 'Video' : 'Hình ảnh'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {img.primaryImage ? "Phương tiện đại diện" : (isVideo ? "Video đính kèm" : "Ảnh đính kèm")}
                      </p>
                      {img.sortOrder != null && (
                        <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-lg bg-indigo-50 text-[11px] font-black text-indigo-600 ring-1 ring-indigo-500/20">
                          #{img.sortOrder}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="section-specs" className="scroll-mt-24 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-xl shadow-blue-900/5 sm:p-10 relative overflow-hidden">
        <h3 className="font-headline text-2xl font-black text-blue-900 flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-500 text-3xl">list_alt</span>
          Thông số kỹ thuật ({specs.length})
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-500">Tên thông số, giá trị và đơn vị tính của sản phẩm.</p>
        {specs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 mt-6 rounded-3xl bg-slate-50/50">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">format_list_bulleted</span>
            <p className="text-sm font-bold text-slate-400">Chưa có thông số kỹ thuật</p>
          </div>
        ) : (
          <div className="mt-8 w-full overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
            <table className="w-full min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-5 pl-6 pr-4">Thứ tự</th>
                  <th className="py-3 pr-4">Thông số</th>
                  <th className="py-3 pr-4">Giá trị</th>
                  <th className="py-3 pr-4">Đơn vị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {specs.map((s, idx) => (
                  <tr key={s.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="py-4 pl-6 pr-4 font-mono text-xs font-bold text-slate-400">{s.sortOrder ?? "—"}</td>
                    <td className="py-4 pr-4 font-bold text-slate-800 transition-colors group-hover:text-indigo-600">{s.specKey}</td>
                    <td className="py-4 pr-4 font-medium text-slate-600">{s.specValue}</td>
                    <td className="py-4 pr-4 text-xs font-bold text-slate-400">{s.unit ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="section-variants" className="scroll-mt-24 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-xl shadow-blue-900/5 sm:p-10 relative overflow-hidden">
        <h3 className="font-headline text-2xl font-black text-blue-900 flex items-center gap-3">
          <span className="material-symbols-outlined text-indigo-500 text-3xl">style</span>
          Biến thể ({variants.length})
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Danh sách các tuỳ chọn cỡ và màu, kèm ảnh riêng, giá và tồn kho cho từng biến thể.
        </p>
        {variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 mt-6 rounded-3xl bg-slate-50/50">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">format_size</span>
            <p className="text-sm font-bold text-slate-400">Chưa có biến thể nào</p>
          </div>
        ) : (
          <div className="mt-8 w-full overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
            <table className="w-full min-w-[600px] text-left text-sm lg:min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-5 pl-6 pr-4">ID</th>
                  <th className="py-5 pr-4">Ảnh</th>
                  <th className="py-3 pr-4">Size</th>
                  <th className="py-3 pr-4">Màu</th>
                  <th className="py-3 pr-4">Giá</th>
                  <th className="py-3 pr-4">Tồn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((v, idx) => (
                  <tr key={v.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="py-4 pl-6 pr-4 font-mono text-xs font-bold text-slate-400">#{v.id}</td>
                    <td className="py-4 pr-4">
                      {v.variantImageUrl ? (
                        <a
                          href={resolveCatalogImageUrl(v.variantImageUrl)}
                          className="inline-block"
                          target="_blank"
                          rel="noreferrer"
                          title="Xem ảnh đầy đủ"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveCatalogImageUrl(v.variantImageUrl)}
                            alt=""
                            className="h-16 w-16 rounded-[1rem] object-cover ring-1 ring-slate-200/90 shadow-sm transition-transform duration-300 hover:scale-110 hover:ring-indigo-400/50 hover:shadow-lg"
                          />
                        </a>
                      ) : (
                        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1rem] bg-slate-50 border border-dashed border-slate-200 text-[10px] font-bold text-slate-300">
                          Trống
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4 font-bold text-slate-800 text-base">{v.size}</td>
                    <td className="py-4 pr-4 font-bold text-slate-800 text-base">{v.color}</td>
                    <td className="py-4 pr-4 whitespace-nowrap font-medium text-indigo-600">{v.price != null ? moneyVnd(Number(v.price)) : "—"}</td>
                    <td className="py-4 pr-4 font-mono font-bold text-slate-600">{v.availability ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="section-stock" className="scroll-mt-24 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-xl shadow-blue-900/5 sm:p-10 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="font-headline text-2xl font-black text-blue-900 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-500 text-3xl">warehouse</span>
              Kho — lịch sử nhập / xuất
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500">Lịch sử di chuyển hàng hóa; thời điểm ghi nhận do hệ thống tự động.</p>
          </div>
          {canWrite ? (
            <ProductInboundModal
              triggerClassName="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50 px-6 py-3.5 text-sm font-bold text-emerald-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md active:scale-95 flex items-center gap-2"
              productName={product.productName}
              variants={inboundVariantOptions.map((v, index) => ({ ...v, selected: index === 0 }))}
              inboundAction={stockInboundAction}
            />
          ) : null}
        </div>
        {movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
            <p className="text-sm font-bold text-slate-400">Chưa có phiếu kho nào được ghi nhận</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
            <table className="w-full min-w-[900px] text-left text-sm lg:min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-5 pl-6 pr-4">Loại</th>
                  <th className="py-3 pr-4">SL</th>
                  <th className="py-3 pr-4">Phạm vi</th>
                  <th className="py-3 pr-4">Tồn sau</th>
                  <th className="py-3 pr-4">Đơn giá</th>
                  <th className="py-3 pr-4">Thời điểm</th>
                  <th className="py-3 pr-4">Người tạo</th>
                  <th className="py-3 pr-4">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {movements.map((m: AdminStockMovement, idx: number) => (
                  <tr key={m.id} className={idx % 2 === 1 ? "bg-slate-50/50" : undefined}>
                    <td className="py-3 pl-4 pr-4 font-medium text-blue-900">{movementTypeVi(m.movementType)}</td>
                    <td className="py-3 pr-4 font-mono">{m.quantity ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-700">{variantStockScope(variants, m.variantId)}</td>
                    <td className="py-3 pr-4 font-mono">{m.balanceAfter ?? "—"}</td>
                    <td className="py-3 pr-4">{moneyInline(m.unitCost)}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-xs text-slate-600">{formatStockDateTime(m.movementAt ?? undefined)}</td>
                    <td className="py-3 pr-4 text-xs text-slate-600">{m.createdBy ?? "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-600" title={m.note ?? ""}>
                      {m.note?.trim() ? m.note : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ProductReviewsSection productId={numId} />

      <section id="section-changelogs" className="scroll-mt-24 rounded-[2rem] border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-xl shadow-blue-900/5 sm:p-10 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="font-headline text-2xl font-black text-blue-900 flex items-center gap-3">
              <span className="material-symbols-outlined text-indigo-500 text-3xl">manage_history</span>
              Lịch sử thay đổi
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500">Ghi nhận chi tiết các lần thay đổi thông tin sản phẩm trên hệ thống.</p>
          </div>
        </div>
        {changeLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history_toggle_off</span>
            <p className="text-sm font-bold text-slate-400">Chưa có lịch sử thay đổi</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
            <table className="w-full min-w-[800px] text-left text-sm lg:min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-slate-500">
                  <th className="py-5 pl-6 pr-4">Trường dữ liệu</th>
                  <th className="py-3 pr-4">Giá trị cũ</th>
                  <th className="py-3 pr-4">Giá trị mới</th>
                  <th className="py-3 pr-4">Thời điểm</th>
                  <th className="py-3 pr-4">Người thực hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {changeLogs.map((log, idx: number) => (
                  <tr key={log.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="py-4 pl-6 pr-4 font-bold text-slate-800 transition-colors group-hover:text-indigo-600">{log.changedField}</td>
                    <td className="max-w-[200px] truncate py-4 pr-4 text-xs font-medium text-slate-400 line-through" title={log.oldValue ?? ""}>{log.oldValue ?? "—"}</td>
                    <td className="max-w-[200px] truncate py-4 pr-4 text-xs font-bold text-emerald-600" title={log.newValue ?? ""}>{log.newValue ?? "—"}</td>
                    <td className="py-4 pr-4 whitespace-nowrap text-xs font-medium text-slate-500">{formatStockDateTime(log.changedAt)}</td>
                    <td className="py-4 pr-4 text-xs font-bold text-indigo-700 bg-indigo-50/50 px-2 rounded-lg inline-block mt-2 mb-2 ml-1">{log.changedBy ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <SimilarProductsPanel items={similarProducts} />
    </div>
  );
}
