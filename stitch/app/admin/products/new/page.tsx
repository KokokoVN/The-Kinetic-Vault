import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth-server";
import { ProductCreateForm } from "@/components/product-create-form";
import { createProduct, listAdminCategories, listAdminBrands, uploadAdminProductImages, getAdminProductsForUi, type BackendCategory } from "@/lib/api";
import { notifyAdminWebBestEffort } from "@/lib/admin-web-notify";

export const dynamic = "force-dynamic";

type PageSearchParams = {
  categoryId?: string;
  error?: string;
  /** Giữ query để hiển thị banner khi redirect ngược (hiếm). */
  success?: string;
};

function activeCategories(list: BackendCategory[]): BackendCategory[] {
  return list.filter((c) => c.deletedAt == null || String(c.deletedAt).trim() === "");
}

export default async function AdminNewProductPage({ searchParams }: { searchParams?: Promise<PageSearchParams> }) {
  const sp = searchParams ? await searchParams : undefined;
  const preCategory = Number(String(sp?.categoryId ?? "").trim());
  const defaultCategoryId = Number.isFinite(preCategory) && preCategory > 0 ? preCategory : "";

  const session = await getAdminSession();
  const canWrite = session.canMutateCatalog;

  if (!canWrite) {
    redirect("/admin/products?error=readonly");
  }

  const categories = activeCategories(
    await listAdminCategories({ deletionFilter: "active", accessToken: session.token }),
  );
  
  const [brands, allProducts] = await Promise.all([
    listAdminBrands({ accessToken: session.token }),
    getAdminProductsForUi({ accessToken: session.token, username: session.username })
  ]);

  async function createAction(formData: FormData) {
    "use server";
    const session2 = await getAdminSession();
    const uid = getUserIdFromAccessToken(session2.token);
    if (!session2.canMutateCatalog) {
      return { error: "readonly" };
    }
    const productName = String(formData.get("productName") ?? "").trim();
    const discription = String(formData.get("discription") ?? "").trim();
    const categoryId = Number(String(formData.get("categoryId") ?? "").trim());
    const brandIdRaw = String(formData.get("brandId") ?? "").trim();
    const brandId = brandIdRaw !== "" ? Number(brandIdRaw) : undefined;
    const price = Number(String(formData.get("price") ?? "").trim());
    const skuRaw = String(formData.get("sku") ?? "").trim();
    const filesRaw = formData.getAll("productImages");
    const imageFiles = filesRaw.filter((x): x is File => x instanceof File && x.size > 0);
    const videosRaw = formData.getAll("productVideos");
    const videoFiles = videosRaw.filter((x): x is File => x instanceof File && x.size > 0);
    const mergedFiles = [...imageFiles, ...videoFiles];

    const primaryRaw = Math.floor(Number(String(formData.get("primaryImageIndex") ?? "0").trim()));
    const primaryIndex =
      imageFiles.length > 0 ? Math.min(Math.max(0, Number.isFinite(primaryRaw) ? primaryRaw : 0), imageFiles.length - 1) : null;
    if (!productName || !Number.isFinite(categoryId) || categoryId < 1 || !Number.isFinite(price) || price < 1) {
      return { error: "validation" };
    }
    let createdId: number;
    try {
      const created = await createProduct(
        {
          productName,
          discription: discription || " ",
          categoryId,
          brandId,
          price,
          sku: skuRaw || undefined,
          availability: 0,
        },
        { accessToken: session2.token, username: session2.username, userId: uid },
      );
      createdId = Number(created.id);
      if (!Number.isFinite(createdId) || createdId < 1) {
        return { error: "create" };
      }
      revalidatePath("/admin/products");
      await notifyAdminWebBestEffort({
        accessToken: session2.token,
        userId: uid,
        username: session2.username ?? "admin",
        scopeLabel: "Sản phẩm",
        title: "Tạo sản phẩm",
        message: `Admin vừa tạo sản phẩm: ${productName} (#${createdId})${skuRaw ? `, SKU: ${skuRaw}` : ""}, giá ${price.toLocaleString("vi-VN")} VND, danh mục #${categoryId}.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (
        msg.toLowerCase().includes("tồn tại") ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("already exists")
      ) {
        if (msg.toLowerCase().includes("sku")) {
          return { error: "duplicate_sku" };
        }
        return { error: "duplicate" };
      }
      if (msg.startsWith("VALIDATION:")) {
        return { error: msg.slice(11) };
      }
      return { error: "create" };
    }
    if (mergedFiles.length > 0) {
      try {
        await uploadAdminProductImages(createdId, mergedFiles, primaryIndex, {
          accessToken: session2.token,
          username: session2.username,
          userId: uid,
        });
        revalidatePath(`/admin/products/${encodeURIComponent(String(createdId))}/edit`);
        revalidatePath(`/admin/products/${encodeURIComponent(String(createdId))}/detail`);
      } catch {
        redirect(`/admin/products/${encodeURIComponent(String(createdId))}/edit?error=upload_images`);
      }
      redirect(`/admin/products/${encodeURIComponent(String(createdId))}/detail?success=create`);
    }
    return { success: true, id: createdId };
  }

  return (
    <div className="w-full space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          prefetch
          href="/admin/products"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-transform hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            Thêm sản phẩm mới
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Khởi tạo thông tin cơ bản cho sản phẩm. Biến thể (size/màu) sẽ được thêm sau khi lưu.
          </p>
        </div>
      </div>

      <ProductCreateForm
        categories={categories}
        brands={brands}
        allProducts={allProducts}
        defaultCategoryId={defaultCategoryId}
        action={createAction}
      />
    </div>
  );
}
