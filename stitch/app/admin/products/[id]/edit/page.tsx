import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { ProductEditMediaManager } from "@/components/product-edit-media-manager";
import { ProductEditTabContainer } from "@/components/product-edit-tab-container";
import { ProductEditForm } from "@/components/product-edit-form";
import { SpecEditFormLiveCheck } from "@/components/spec-edit-form-live-check";
import { SpecFormLiveCheck } from "@/components/spec-form-live-check";
import { SpecGroupCard } from "@/components/spec-group-card";
import { VariantEditFormLiveCheck } from "@/components/variant-edit-form-live-check";
import { VariantFormLiveCheck } from "@/components/variant-form-live-check";
import { ProductEditVariantMatrixAdder } from "@/components/product-edit-variant-matrix-adder";
import { ProductEditVariantList } from "@/components/product-edit-variant-list";
import { StatusToast } from "@/components/status-toast";
import { notifyAdminWebBestEffort } from "@/lib/admin-web-notify";
import {
  addAdminProductSpec,
  addAdminProductVariant,
  deleteAdminProductImage,
  deleteAdminProductSpec,
  deleteAdminProductVariant,
  getAdminBackendProductById,
  getBackendProductById,
  listAdminBrands,
  listAdminCategories,
  getAdminProductsForUi,
  listAdminProductImages,
  listAdminProductSpecs,
  listAdminProductVariants,
  resolveCatalogImageUrl,
  setPrimaryAdminProductImage,
  updateAdminProductSpec,
  updateAdminProductVariant,
  updateProduct,
  uploadAdminProductImageAndGetVariantUrl,
  type BackendCategory,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function activeCategories(list: BackendCategory[]): BackendCategory[] {
  return list.filter((c) => c.deletedAt == null || String(c.deletedAt).trim() === "");
}

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".mkv") ||
    clean.endsWith(".flv") ||
    clean.endsWith(".3gp")
  );
}

type PageSearchParams = { error?: string; success?: string };

const fieldClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

const compactFieldClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/25 placeholder:text-slate-400";

/** Form chỉnh sửa trong thẻ biến thể — chữ to hơn compactFieldClass. */
const variantEditInputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400";

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<PageSearchParams>;
}) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : undefined;
  const session = await getAdminSession();
  if (!session.canMutateCatalog) redirect("/admin/products?error=readonly");

  const pid = String(id);
  const numId = Number(pid);
  if (!Number.isFinite(numId) || numId <= 0) notFound();

  // Load all product data and related lookup entities in parallel for optimal SSR speed
  const [productRaw, categories, allProducts, brands, specs, variants, galleryImages] = await Promise.all([
    getAdminBackendProductById(pid, { accessToken: session.token }).then((p) => p || getBackendProductById(pid)),
    listAdminCategories({ deletionFilter: "active", accessToken: session.token }),
    getAdminProductsForUi({ accessToken: session.token, username: session.username }),
    listAdminBrands({ accessToken: session.token }),
    listAdminProductSpecs(numId, { accessToken: session.token }),
    listAdminProductVariants(numId, { accessToken: session.token }),
    listAdminProductImages(numId, { accessToken: session.token }),
  ]);

  if (!productRaw) notFound();
  const product = productRaw;

  const activeCategoryOptions = activeCategories(categories);
  const categoryOptions = (() => {
    const cid = product.categoryId != null ? Number(product.categoryId) : null;
    if (!cid || Number.isNaN(cid) || cid < 1) return activeCategoryOptions;
    if (activeCategoryOptions.some((c) => c.id === cid)) return activeCategoryOptions;
    return [...activeCategoryOptions, { id: cid, name: `Danh mục #${cid} (không còn trong danh sách)`, deletedAt: null }];
  })();

  async function updateAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    if (!session2.canMutateCatalog) return { error: "readonly" };
    const productName = String(formData.get("productName") ?? "").trim();
    const discription = String(formData.get("discription") ?? "").trim();
    const categoryId = Number(String(formData.get("categoryId") ?? "").trim());
    const brandIdRaw = String(formData.get("brandId") ?? "").trim();
    const brandId = brandIdRaw !== "" ? Number(brandIdRaw) : undefined;
    const price = Number(String(formData.get("price") ?? "").trim());
    const sku = String(formData.get("sku") ?? "").trim();
    if (!productName || !Number.isFinite(categoryId) || categoryId < 1 || !Number.isFinite(price) || price < 1) {
      return { error: "validation" };
    }
    try {
      await updateProduct(pid, { productName, discription: discription || " ", categoryId, brandId, price, sku: sku || undefined }, { accessToken: session2.token, username: session2.username, userId: uid });
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
      revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
      await notifyAdminWebBestEffort({
        accessToken: session2.token,
        userId: uid,
        username: session2.username ?? "admin",
        scopeLabel: "Sản phẩm",
        title: "Cập nhật sản phẩm",
        message: `Đã cập nhật sản phẩm #${pid}: ${productName} (giá ${price.toLocaleString("vi-VN")} VND).`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("DUPLICATE_SKU") || msg.includes("duplicate")) return { error: "sku" };
      return { error: "update" };
    }
  }

  async function addSpecAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) throw new Error("Không có quyền thực hiện");
    const specKey = String(formData.get("specKey") ?? "").trim();
    const specValue = String(formData.get("specValue") ?? "").trim();
    const unitRaw = String(formData.get("unit") ?? "").trim();
    const specGroupRaw = String(formData.get("specGroup") ?? "").trim();
    const sortRaw = String(formData.get("sortOrder") ?? "").trim();
    let sortOrder: number | undefined;
    if (sortRaw !== "") {
      const n = Number(sortRaw);
      if (Number.isFinite(n)) sortOrder = Math.max(0, Math.floor(n));
    }
    if (!specKey || !specValue) throw new Error("Vui lòng nhập đủ thông tin");
    try {
      await addAdminProductSpec(numId, { specKey, specValue, unit: unitRaw || undefined, specGroup: specGroupRaw || null, sortOrder, performedBy: session2.username ?? undefined }, { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) });
    } catch (e: any) {
      throw e;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Thêm thông số",
      message: `Đã thêm thông số cho sản phẩm #${pid}: ${specKey} = ${specValue}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  async function addVariantAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) throw new Error("Không có quyền thực hiện");
    const size = String(formData.get("size") ?? "").trim();
    const color = String(formData.get("color") ?? "").trim();
    const price = Number(String(formData.get("variantPrice") ?? "").trim());
    const availability = 0;
    const fileRaw = formData.get("variantImage");
    let variantImageUrl: string | undefined;
    if (fileRaw instanceof File && fileRaw.size > 0) {
      try {
        variantImageUrl = await uploadAdminProductImageAndGetVariantUrl(numId, fileRaw, { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) });
      } catch (e: any) {
        throw new Error(e.message || "Tải ảnh lên thất bại");
      }
    }
    if (!size || !color || !Number.isFinite(price) || price < 1) throw new Error("Vui lòng điền đủ size, màu và giá (lớn hơn 0)");
    try {
      await addAdminProductVariant(numId, { size, color, variantImageUrl, price, availability, performedBy: session2.username ?? undefined }, { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) });
    } catch (err: any) {
      throw err;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Thêm biến thể",
      message: `Đã thêm biến thể cho sản phẩm #${pid}: ${size} / ${color}, giá ${price.toLocaleString("vi-VN")} VND.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }


  async function deleteImageAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) redirect("/admin/products?error=readonly");
    const imageId = Number(String(formData.get("imageId") ?? "").trim());
    if (!Number.isFinite(imageId) || imageId < 1) throw new Error("Invalid image ID");
    try {
      await deleteAdminProductImage(numId, imageId, { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) });
    } catch (e: any) {
      throw e;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Xóa ảnh",
      message: `Đã xóa ảnh #${imageId} của sản phẩm #${pid}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  async function setPrimaryImageAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) redirect("/admin/products?error=readonly");
    const imageId = Number(String(formData.get("imageId") ?? "").trim());
    if (!Number.isFinite(imageId) || imageId < 1) throw new Error("Invalid image ID");
    try {
      await setPrimaryAdminProductImage(numId, imageId, { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) });
    } catch (e: any) {
      throw e;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Đặt ảnh chính",
      message: `Đã đặt ảnh #${imageId} làm ảnh chính cho sản phẩm #${pid}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  async function deleteSpecAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) throw new Error("Không có quyền thực hiện");
    const specId = Number(String(formData.get("specId") ?? "").trim());
    if (!Number.isFinite(specId) || specId < 1) throw new Error("ID không hợp lệ");
    try {
      await deleteAdminProductSpec(numId, specId, {
        accessToken: session2.token,
        username: session2.username,
        userId: getUserIdFromAccessToken(session2.token),
      });
    } catch (e: any) {
      throw e;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Xóa thông số",
      message: `Đã xóa thông số #${specId} (sản phẩm #${pid}).`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  async function updateSpecAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) throw new Error("Không có quyền thực hiện");
    const specId = Number(String(formData.get("specId") ?? "").trim());
    const specKey = String(formData.get("specKey") ?? "").trim();
    const specValue = String(formData.get("specValue") ?? "").trim();
    const unitRaw = String(formData.get("unit") ?? "").trim();
    const specGroupRaw = String(formData.get("specGroup") ?? "").trim();
    const sortRaw = String(formData.get("sortOrder") ?? "").trim();
    let sortOrder: number | undefined;
    if (sortRaw !== "") {
      const n = Number(sortRaw);
      if (Number.isFinite(n)) sortOrder = Math.max(0, Math.floor(n));
    }
    if (!Number.isFinite(specId) || specId < 1 || !specKey || !specValue) throw new Error("Vui lòng nhập đủ thông tin");
    try {
      await updateAdminProductSpec(
        numId,
        specId,
        { specKey, specValue, unit: unitRaw || undefined, specGroup: specGroupRaw || null, sortOrder, performedBy: session2.username ?? undefined },
        { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) },
      );
    } catch (e: any) {
      throw e;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Sửa thông số",
      message: `Đã cập nhật thông số #${specId} — sản phẩm #${pid}: ${specKey}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  async function deleteVariantAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) throw new Error("Không có quyền thực hiện");
    const variantId = Number(String(formData.get("variantId") ?? "").trim());
    if (!Number.isFinite(variantId) || variantId < 1) throw new Error("ID không hợp lệ");
    try {
      await deleteAdminProductVariant(numId, variantId, {
        accessToken: session2.token,
        username: session2.username,
        userId: getUserIdFromAccessToken(session2.token),
      });
    } catch (e: any) {
      throw e;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Xóa biến thể",
      message: `Đã xóa biến thể #${variantId} (sản phẩm #${pid}).`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  async function updateVariantAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    if (!session2.canMutateCatalog) throw new Error("Không có quyền thực hiện");
    const variantId = Number(String(formData.get("variantId") ?? "").trim());
    const size = String(formData.get("editSize") ?? "").trim();
    const color = String(formData.get("editColor") ?? "").trim();
    const price = Number(String(formData.get("editVariantPrice") ?? "").trim());
    const variantName = String(formData.get("editVariantName") ?? "").trim() || undefined;
    const sku = String(formData.get("editSku") ?? "").trim() || undefined;
    const originalPriceRaw = String(formData.get("editOriginalPrice") ?? "").trim();
    const originalPrice = originalPriceRaw !== "" && Number.isFinite(Number(originalPriceRaw)) ? Number(originalPriceRaw) : undefined;
    const attributesJson = String(formData.get("editAttributesJson") ?? "").trim() || undefined;
    const preserveRaw = String(formData.get("variantAvailabilityPreserve") ?? "").trim();
    const availabilityParsed = preserveRaw === "" ? 0 : Math.max(0, Math.floor(Number(preserveRaw)));
    const availability = Number.isFinite(availabilityParsed) ? availabilityParsed : 0;
    const fileRaw = formData.get("variantImageEdit");
    let variantImageUrl: string | undefined = String(formData.get("variantImageUrl") ?? "").trim() || undefined;
    if (fileRaw instanceof File && fileRaw.size > 0) {
      try {
        variantImageUrl = await uploadAdminProductImageAndGetVariantUrl(numId, fileRaw, {
          accessToken: session2.token,
          username: session2.username,
          userId: getUserIdFromAccessToken(session2.token),
        });
      } catch (e: any) {
        throw new Error(e.message || "Tải ảnh lên thất bại");
      }
    }
    if (!Number.isFinite(variantId) || variantId < 1 || !size || !color || !Number.isFinite(price) || price < 1) throw new Error("Vui lòng điền đủ size, màu và giá (lớn hơn 0)");
    try {
      await updateAdminProductVariant(
        numId,
        variantId,
        { size, color, variantImageUrl, price, availability, variantName, sku, originalPrice, attributesJson, performedBy: session2.username ?? undefined },
        { accessToken: session2.token, username: session2.username, userId: getUserIdFromAccessToken(session2.token) },
      );
    } catch (err: any) {
      throw err;
    }
    await notifyAdminWebBestEffort({
      accessToken: session2.token,
      userId: getUserIdFromAccessToken(session2.token),
      username: session2.username ?? "admin",
      scopeLabel: "Sản phẩm",
      title: "Sửa biến thể",
      message: `Đã cập nhật biến thể #${variantId} — sản phẩm #${pid}: ${size} / ${color}.`,
    });
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
    revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
  }

  const err = sp?.error;
  const ok = sp?.success;

  const priceDisplay = Number(product.price ?? 0);
  const isHidden = Boolean(product.hidden);
  const heroImg = resolveCatalogImageUrl(product.primaryImageUrl);
  const imageRows = galleryImages.map((img) => ({
    ...img,
    displayUrl: resolveCatalogImageUrl(img.imageUrl ?? (img.storagePath ? `/api/catalog/admin/products/images/file/${encodeURIComponent(img.storagePath)}` : null)),
  }));

  function moneyVnd(n: number): string {
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  }

  return (
    <div className="w-full space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {err === "upload_images" && (
        <StatusToast tone="error" title="Lỗi tải ảnh" message="Không tải lên được ảnh sản phẩm." />
      )}
      {ok === "update" && (
        <StatusToast tone="success" title="Thành công" message="Cập nhật sản phẩm thành công." />
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
        <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Tổng quan
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/admin/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Sản phẩm
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-slate-700 dark:text-slate-300 font-black truncate max-w-xs">
          {product.productName} (#{pid})
        </span>
      </nav>

      {/* ── Compact Header & Product Status Bar ── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-4 sm:p-5 shadow-sm dark:shadow-xl backdrop-blur-2xl">
        <div className="h-1 w-full absolute top-0 inset-x-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Link
              prefetch
              href="/admin/products"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 shadow-2xs transition-all hover:scale-105 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Quay lại danh sách sản phẩm"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>

            {/* Thumbnail */}
            <div className="relative shrink-0 hidden sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImg}
                alt=""
                className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-700 object-cover shadow-xs"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate max-w-md">
                  {product.productName}
                </h1>
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  #{pid}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isHidden
                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  }`}
                >
                  <span className="material-symbols-outlined text-[11px]">
                    {isHidden ? "visibility_off" : "public"}
                  </span>
                  {isHidden ? "Đang ẩn" : "Hiển thị"}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                {product.sku && (
                  <span className="font-mono font-bold text-slate-700 dark:text-zinc-300">
                    SKU: {product.sku}
                  </span>
                )}
                <span>·</span>
                <span>Giá: <strong className="text-violet-600 dark:text-violet-400">{moneyVnd(priceDisplay)}</strong></span>
                <span>·</span>
                <span>Tồn kho: <strong className="text-blue-600 dark:text-blue-400">{Number(product.availability ?? 0)}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link
              prefetch
              href={`/admin/products/${encodeURIComponent(pid)}/detail#section-stock`}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-all shadow-2xs hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[15px]">warehouse</span>
              <span>Nhập kho</span>
            </Link>
            <Link
              prefetch
              href={`/admin/products/${encodeURIComponent(pid)}/detail`}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-white/10 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all shadow-2xs hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined text-[15px]">visibility</span>
              <span>Chi tiết</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Compact Tabbed Sections ── */}
      <ProductEditTabContainer
        mediaCount={galleryImages.length}
        specsCount={specs.length}
        variantsCount={variants.length}
      >
        {{
          basic: (
            <ProductEditForm
              product={product}
              categoryOptions={categoryOptions}
              brands={brands}
              allProducts={allProducts}
              action={updateAction}
            />
          ),
          media: (
            <section className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
              <ProductEditMediaManager
                productId={numId}
                mediaList={imageRows}
                setPrimaryImageAction={setPrimaryImageAction}
                deleteImageAction={deleteImageAction}
                onUploadComplete={async () => {
                  "use server";
                  revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
                  revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
                  revalidatePath("/admin/products");
                }}
              />
            </section>
          ),
          specs: (() => {
            const existingGroups = Array.from(new Set(specs.map(s => s.specGroup?.trim()).filter(Boolean))) as string[];
            return (
              <section className="w-full rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-headline text-lg font-black text-blue-900 dark:text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-2xl">settings</span>
                      <span>Thông số kỹ thuật</span>
                    </h2>
                    <p className="mt-1 max-w-3xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Mỗi thông số một hàng ngang, phân theo nhóm linh kiện hoặc thông số chung. Khóa không trùng lặp.
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{specs.length} thông số</p>
                </div>
                {specs.length > 0 ? (
                  <div className="mt-5 max-h-[min(60vh,48rem)] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex w-full flex-col gap-8">
                      {Object.entries(
                        specs.reduce((acc, spec) => {
                          const group = spec.specGroup?.trim() || "Chung";
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(spec);
                          return acc;
                        }, {} as Record<string, typeof specs>)
                      ).map(([groupName, groupSpecs]) => (
                        <SpecGroupCard
                          key={groupName}
                          groupName={groupName}
                          groupSpecs={groupSpecs}
                          allSpecs={specs}
                          existingGroups={existingGroups}
                          deleteSpecAction={deleteSpecAction}
                          updateSpecAction={updateSpecAction}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                    Chưa có thông số kỹ thuật nào.
                  </p>
                )}

                <div className="mt-8 rounded-[2rem] border border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 shadow-inner sm:p-8">
                  <h3 className="font-headline text-lg font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600">add_circle</span>
                    Thêm thông số mới
                  </h3>
                  <p className="mt-1 mb-6 text-sm font-medium text-slate-500">Khóa phải duy nhất và chưa tồn tại trong danh sách phía trên.</p>
                  <SpecFormLiveCheck action={addSpecAction} fieldClass={fieldClass} existingSpecs={specs.map((s) => ({ specKey: String(s.specKey ?? "") }))} existingGroups={existingGroups} />
                </div>
              </section>
            );
          })(),
          variants: (
            <section className="w-full rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              <ProductEditVariantList
                variants={variants}
                pid={pid}
                numId={numId}
                updateVariantAction={updateVariantAction}
                deleteVariantAction={deleteVariantAction}
                variantEditInputClass={variantEditInputClass}
              />
            </section>
          ),
          matrix: (
            <section className="w-full rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-6 sm:p-10 shadow-sm dark:shadow-2xl backdrop-blur-2xl relative overflow-hidden">
              <div className="mb-6">
                <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-2xl">grid_on</span>
                  <span>Tạo / Mở rộng ma trận biến thể</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Thêm hoặc cấu hình thuộc tính đa tầng (Màu sắc, Kích cỡ, Cấu hình RAM/Ổ cứng...). Biến thể cũ sẽ được tự động bảo toàn ID và tồn kho.
                </p>
              </div>
              <ProductEditVariantMatrixAdder
                productId={numId}
                productSku={product.sku || "SP"}
                defaultPrice={priceDisplay}
                fieldClass={fieldClass}
                existingVariants={variants.map((v) => ({ size: String(v.size ?? ""), color: String(v.color ?? "") }))}
                rawVariants={variants}
                singleAddAction={addVariantAction}
              />
            </section>
          ),
        }}
      </ProductEditTabContainer>

      {/* ── Floating Quick Action Pill ── */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl">
        <Link
          href={`/admin/products/${encodeURIComponent(pid)}/detail`}
          className="flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">visibility</span>
          <span className="hidden sm:inline">Xem chi tiết</span>
        </Link>
        <Link
          href={`/admin/products/${encodeURIComponent(pid)}/detail#section-stock`}
          className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">warehouse</span>
          <span className="hidden sm:inline">Nhập kho</span>
        </Link>
        <a
          href="#section-matrix"
          className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/25 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">grid_on</span>
          <span>+ Ma trận</span>
        </a>
      </div>
    </div>
  );
}
