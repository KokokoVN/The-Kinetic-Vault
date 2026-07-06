import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { ProductMediaUploadSection } from "@/components/product-media-upload-section";
import { ProductEditForm } from "@/components/product-edit-form";
import { SpecEditFormLiveCheck } from "@/components/spec-edit-form-live-check";
import { SpecFormLiveCheck } from "@/components/spec-form-live-check";
import { SpecGroupCard } from "@/components/spec-group-card";
import { VariantEditFormLiveCheck } from "@/components/variant-edit-form-live-check";
import { VariantFormLiveCheck } from "@/components/variant-form-live-check";
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

  let product = await getAdminBackendProductById(String(id), { accessToken: session.token });
  if (!product) product = await getBackendProductById(String(id));
  if (!product) notFound();

  const [categories, allProducts, brands] = await Promise.all([
    listAdminCategories({ deletionFilter: "active", accessToken: session.token }),
    getAdminProductsForUi({ accessToken: session.token, username: session.username }),
    listAdminBrands({ accessToken: session.token }),
  ]);
  const activeCategoryOptions = activeCategories(categories);
  const categoryOptions = (() => {
    const cid = product.categoryId != null ? Number(product.categoryId) : null;
    if (!cid || Number.isNaN(cid) || cid < 1) return activeCategoryOptions;
    if (activeCategoryOptions.some((c) => c.id === cid)) return activeCategoryOptions;
    return [...activeCategoryOptions, { id: cid, name: `Danh mục #${cid} (không còn trong danh sách)`, deletedAt: null }];
  })();

  const pid = String(product.id);
  const numId = Number(pid);
  const [specs, variants, galleryImages] = await Promise.all([
    listAdminProductSpecs(numId, { accessToken: session.token }),
    listAdminProductVariants(numId, { accessToken: session.token }),
    listAdminProductImages(numId, { accessToken: session.token }),
  ]);

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
        { size, color, variantImageUrl, price, availability, performedBy: session2.username ?? undefined },
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
      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            prefetch
            href="/admin/products"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all hover:scale-105 hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-indigo-100 dark:hover:shadow-indigo-900/50"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[22px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="font-headline text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-indigo-700 to-violet-700 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 sm:text-3xl">
              Chỉnh sửa sản phẩm
            </h1>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono font-bold text-slate-600 dark:text-slate-300">#{pid}</span>
              <span className="text-slate-300 dark:text-slate-600 dark:text-slate-300">•</span>
              Tồn kho:
              <Link
                prefetch
                href={`/admin/products/${encodeURIComponent(pid)}/detail#section-stock`}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                nhập kho
              </Link>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            prefetch
            href={`/admin/products/${encodeURIComponent(pid)}/detail#section-stock`}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:scale-[1.02] hover:shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">inventory</span>
            Nhập kho
          </Link>
          <Link
            prefetch
            href={`/admin/products/${encodeURIComponent(pid)}/detail`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-700 hover:scale-[1.02] hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Xem chi tiết
          </Link>
        </div>
      </div>

      {/* ── Product info hero card ── */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-none">
        {/* Gradient top strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-400 via-indigo-500 to-violet-500" />
        {/* Blur blobs */}
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-20 h-32 w-32 rounded-full bg-blue-500/5 blur-xl" />

        <div className="relative flex flex-wrap items-center gap-5 p-5 sm:p-6">
          {/* Thumbnail */}
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt=""
              className="h-20 w-20 rounded-[16px] border border-slate-100 dark:border-slate-700 object-cover shadow-md ring-2 ring-white"
            />
            <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 ring-2 ring-white shadow-sm">
              <span className="material-symbols-outlined text-[14px] text-white">inventory_2</span>
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-headline text-xl font-black text-slate-900 dark:text-white">
              {product.productName}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 ring-1 ring-slate-200/60">
                <span className="material-symbols-outlined text-[13px]">barcode</span>
                {product.sku ?? "Không có SKU"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200/60">
                <span className="material-symbols-outlined text-[13px]">inventory_2</span>
                Tồn kho: {Number(product.availability ?? 0)}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold ring-1 ${
                  isHidden
                    ? "bg-amber-50 text-amber-700 ring-amber-200/60"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">
                  {isHidden ? "visibility_off" : "public"}
                </span>
                {isHidden ? "Đang ẩn" : "Hiển thị"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-700 ring-1 ring-violet-200/60">
                <span className="material-symbols-outlined text-[13px]">payments</span>
                {moneyVnd(priceDisplay)}
              </span>
            </div>
          </div>
        </div>
      </div>


      <ProductEditForm
        product={product}
        categoryOptions={categoryOptions}
        brands={brands}
        allProducts={allProducts}
        action={updateAction}
      />

      {/* ─── Media Upload ─── */}
      <section className="rounded-[2rem] border border-outline-variant/10 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-blue-900/5 dark:shadow-none sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 mb-8">
          <h2 className="font-headline text-2xl font-black text-blue-900 dark:text-white flex items-center gap-3">
            <span className="material-symbols-outlined text-indigo-500 text-3xl">perm_media</span>
            Ảnh / Video sản phẩm
          </h2>
          <p className="mt-2 text-[13px] text-slate-500 font-medium">
            Hiện có <span className="font-bold text-indigo-600">{imageRows.length}</span> phương tiện. Ảnh và video được tải riêng, mỗi lần upload có hiệu ứng tiến trình.
          </p>
        </div>

        {/* Current gallery */}
        {imageRows.length > 0 ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative z-10 mb-8">
            {imageRows.map((img) => {
              const isVideo = isVideoUrl(img.displayUrl);
              return (
                <article key={img.id} className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200/60 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500 flex flex-col justify-between">
                  <div className="flex items-center justify-center bg-slate-900 p-0 relative aspect-square overflow-hidden">
                    {isVideo ? (
                      <video src={img.displayUrl} className="h-full w-full object-contain bg-black/90 transition-transform duration-700 group-hover:scale-105" muted playsInline controls />
                    ) : (
                      <img src={img.displayUrl} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                      {img.primaryImage && (
                        <div className="backdrop-blur-md bg-white/90 dark:bg-slate-900/90 shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1 text-indigo-600 ring-1 ring-indigo-500/20">
                          <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                          <span className="text-[9px] font-black uppercase tracking-wider">Ảnh chính</span>
                        </div>
                      )}
                      <div className="backdrop-blur-md bg-black/40 text-white shadow-sm px-2.5 py-1 rounded-full flex items-center gap-1 ring-1 ring-white/10">
                        <span className="material-symbols-outlined text-[12px]">{isVideo ? 'movie' : 'image'}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{isVideo ? 'Video' : 'Ảnh'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 p-4 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/80">
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">#{img.id}</span>
                    </div>
                    <p className="truncate text-xs text-slate-400 font-medium" title={img.storagePath ?? ""}>{img.storagePath}</p>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {!img.primaryImage && !isVideo ? (
                        <form action={setPrimaryImageAction} className="flex-1">
                          <input type="hidden" name="imageId" value={String(img.id)} />
                          <button type="submit" className="w-full rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors">Đặt làm chính</button>
                        </form>
                      ) : null}
                      <form action={deleteImageAction} className="flex-1">
                        <input type="hidden" name="imageId" value={String(img.id)} />
                        <button type="submit" className="w-full rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors">Xóa</button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}

        {/* Upload panels – client-side XHR with progress */}
        <div className="relative z-10">
          <ProductMediaUploadSection
            productId={numId}
            onUploadComplete={async () => {
              "use server";
              revalidatePath(`/admin/products/${encodeURIComponent(pid)}/edit`);
              revalidatePath(`/admin/products/${encodeURIComponent(pid)}/detail`);
              revalidatePath("/admin/products");
            }}
          />
        </div>
      </section>

      <div className="flex w-full max-w-none flex-col gap-10">
        {(() => {
          const existingGroups = Array.from(new Set(specs.map(s => s.specGroup?.trim()).filter(Boolean))) as string[];
          return (
            <section className="w-full rounded-2xl border border-outline-variant/10 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="font-headline text-lg font-black text-blue-900 dark:text-white">Thông số kỹ thuật</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                Mỗi thông số một hàng toàn ngang; form chỉnh sửa xếp theo lưới ngang (khóa | giá trị | đơn vị/thứ tự). Khóa không trùng.
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
        })()}

        <section className="w-full rounded-[2rem] border border-outline-variant/10 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-blue-900/5 dark:shadow-none sm:p-10 relative overflow-hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h2 className="font-headline text-2xl font-black text-blue-900 dark:text-white flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-500 text-3xl">style</span>
                Biến thể (size / màu)
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-medium text-slate-500">
                Quản lý các lựa chọn của khách hàng. Mỗi biến thể có thể có ảnh riêng, giá riêng và tồn kho độc lập.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm ring-1 ring-indigo-500/20 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">view_list</span>
              {variants.length} biến thể
            </div>
          </div>
          {variants.length > 0 ? (
            <div className="mt-6 max-h-[min(70vh,52rem)] overflow-y-auto pr-2 custom-scrollbar">
              <ul className="flex w-full flex-col gap-5">
                {variants.map((v) => {
                  const variantPriceNum = Number(v.price);
                  const safePrice = Number.isFinite(variantPriceNum) && variantPriceNum >= 1 ? Math.round(variantPriceNum) : 1;
                  const variantThumb = v.variantImageUrl?.trim()
                    ? resolveCatalogImageUrl(v.variantImageUrl)
                    : null;
                  return (
                    <li key={v.id} className="min-w-0 w-full group/card">
                      <article className="flex w-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500 hover:-translate-y-1">
                        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-6 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
                          <div className="relative mx-auto shrink-0 sm:mx-0">
                            {variantThumb ? (
                              <a
                                href={variantThumb}
                                target="_blank"
                                rel="noreferrer"
                                className="block relative overflow-hidden rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={variantThumb}
                                  alt={`${v.size} ${v.color}`}
                                  className="h-28 w-28 object-cover transition-transform duration-500 hover:scale-110 sm:h-32 sm:w-32"
                                />
                              </a>
                            ) : (
                              <div className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 sm:h-32 sm:w-32">
                                <span className="material-symbols-outlined text-3xl opacity-50">image_not_supported</span>
                                <span className="text-[10px] font-bold">Chưa có ảnh</span>
                              </div>
                            )}
                            <span className="absolute -bottom-2 -right-2 rounded-xl bg-indigo-600 px-2.5 py-1 font-mono text-[11px] font-black tracking-widest text-white shadow-lg ring-2 ring-white">
                              #{v.id}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 text-center sm:text-left">
                            <p className="font-headline text-2xl font-black leading-tight text-slate-800 dark:text-slate-100 transition-colors group-hover/card:text-indigo-700">
                              <span className="text-indigo-900">{v.size}</span>
                              <span className="mx-3 font-light text-slate-300">|</span>
                              <span className="">{v.color}</span>
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm ring-1 ring-slate-200/80">
                                <span className="material-symbols-outlined text-[18px] text-emerald-500">payments</span>
                                {v.price != null ? moneyVnd(Number(v.price)) : "—"}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-800 shadow-sm ring-1 ring-indigo-500/20">
                                <span className="material-symbols-outlined text-[18px] text-indigo-500">inventory_2</span>
                                Tồn kho: {v.availability ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 sm:flex-row sm:items-center sm:p-5">
                          <div className="flex-1 min-w-0">
                            <VariantEditFormLiveCheck
                              action={updateVariantAction}
                              variantId={v.id}
                              defaultSize={String(v.size ?? "")}
                              defaultColor={String(v.color ?? "")}
                              defaultPrice={safePrice}
                              defaultVariantImageUrl={String(v.variantImageUrl ?? "")}
                              availabilityPreserve={Number(v.availability ?? 0)}
                              otherVariants={variants.filter((x) => x.id !== v.id).map((x) => ({ size: String(x.size ?? ""), color: String(x.color ?? "") }))}
                              inputClassName={variantEditInputClass}
                            />
                          </div>
                          <form action={deleteVariantAction} className="shrink-0 w-full sm:w-auto">
                            <input type="hidden" name="variantId" value={String(v.id)} />
                            <button
                              type="submit"
                              className="h-[52px] w-full sm:w-auto px-6 rounded-2xl border border-rose-200 bg-white dark:bg-slate-900 text-rose-600 shadow-sm transition-all hover:bg-rose-50 hover:border-rose-300 hover:shadow-md flex items-center justify-center gap-2 font-bold text-sm"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                              Xóa biến thể
                            </button>
                          </form>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[1.5rem] bg-slate-50/50 dark:bg-slate-800/50">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">format_size</span>
              <p className="text-sm font-bold text-slate-400">Chưa có biến thể nào được tạo.</p>
            </div>
          )}
 
          <div className="mt-8 rounded-[2rem] border border-blue-100/80 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 shadow-inner sm:p-8">
            <h3 className="font-headline text-lg font-black uppercase tracking-wider text-indigo-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-indigo-600">add_box</span>
              Thêm biến thể mới
            </h3>
            <p className="mt-1 mb-6 text-sm font-medium text-slate-500">Điền kích thước, màu sắc và giá. Có thể tải ảnh riêng cho biến thể (hỗ trợ xem trước).</p>
            <VariantFormLiveCheck
              action={addVariantAction}
              fieldClass={fieldClass}
              existingVariants={variants.map((v) => ({ size: String(v.size ?? ""), color: String(v.color ?? "") }))}
              defaultPrice={priceDisplay}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
