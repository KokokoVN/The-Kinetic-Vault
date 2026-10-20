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

  const [rawCategories, brands, allProducts] = await Promise.all([
    listAdminCategories({ deletionFilter: "active", accessToken: session.token }),
    listAdminBrands({ accessToken: session.token }),
    getAdminProductsForUi({ accessToken: session.token, username: session.username }),
  ]);
  const categories = activeCategories(rawCategories);

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
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 text-slate-800 dark:text-zinc-100">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500">
        <Link href="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Tổng quan
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link href="/admin/products" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Sản phẩm
        </Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-slate-700 dark:text-slate-300 font-black">Thêm mới</span>
      </nav>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/products"
              title="Quay lại danh sách"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-white/10 shadow-sm transition-all hover:scale-105 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 dark:text-zinc-300"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Thêm sản phẩm mới
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Studio Tạo Mới
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
                Khởi tạo đầy đủ thông tin sản phẩm, đăng ảnh & video, đồng thời thiết lập ma trận phân loại hàng đa tầng tự động.
              </p>
            </div>
          </div>

          {/* Quy trình các bước */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-2 border border-slate-200/60 dark:border-white/10 shadow-xs backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-black">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]">1</span>
              <span>Thông tin</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-[16px]">chevron_right</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">2</span>
              <span>Media</span>
            </div>
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-[16px]">chevron_right</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">3</span>
              <span>Đa tầng</span>
            </div>
          </div>
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

