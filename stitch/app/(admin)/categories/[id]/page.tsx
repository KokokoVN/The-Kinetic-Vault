import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminCategory, getCategoryDeletePreview, listAdminCategoryProducts, type AdminCategoryProductRow } from "@/lib/api";

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
    return { text: "Hết hàng", className: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" };
  }
  if (v < 20) {
    return { text: "Sắp hết", className: "bg-error-container dark:bg-red-900/30 text-on-error-container dark:text-red-400" };
  }
  return { text: "Còn hàng", className: "bg-secondary-fixed dark:bg-emerald-900/30 text-on-secondary-fixed dark:text-emerald-400" };
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
      <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">ID danh mục không hợp lệ.</div>
    );
  }

  const category = await getAdminCategory(numId, { accessToken: session.token });
  const preview = await getCategoryDeletePreview(numId, { accessToken: session.token });
  const products = category
    ? await listAdminCategoryProducts(numId, { accessToken: session.token })
    : [];

  if (!category) {
    return (
      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-400">
        Không tìm thấy danh mục <code className="rounded bg-amber-100 dark:bg-amber-500/20 px-1">{id}</code>.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {success === "update" && (
        <p className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-400">
          Cập nhật danh mục thành công.
        </p>
      )}
      <header className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <nav className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Link className="transition-colors hover:text-blue-600 dark:hover:text-blue-400" href="/admin/categories">
              Danh mục
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{category.name}</span>
          </nav>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-blue-900 dark:text-white">{category.name}</h1>
          <p className="max-w-2xl text-slate-500 dark:text-slate-400">
            Slug: <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{category.slug ?? "—"}</span> · ID #{category.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm backdrop-blur-sm"
            href="/admin/categories"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Danh sách
          </Link>
          <Link
            className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm backdrop-blur-sm"
            href="/admin/activity-log"
          >
            <span className="material-symbols-outlined text-sm">history</span>
            Nhật ký
          </Link>
          {canWrite ? (
            <Link
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30"
              href={`/admin/categories/${id}/edit`}
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Sửa
            </Link>
          ) : null}
          {canWrite ? (
            <Link
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-blue-600/30"
              href={`/admin/products/new?categoryId=${encodeURIComponent(String(category.id))}`}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Thêm sản phẩm
            </Link>
          ) : null}
          {canWrite ? (
            <Link
              className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-6 py-2.5 text-sm font-bold text-rose-800 shadow-sm transition-colors hover:bg-rose-100"
              href={`/admin/categories/${id}/delete`}
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Xóa
            </Link>
          ) : null}
        </div>
      </header>



      <section className="overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 shadow-xl shadow-blue-900/5 dark:shadow-none backdrop-blur-xl">
        <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-blue-900 dark:text-white">Sản phẩm thuộc danh mục</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Gồm sản phẩm gắn <strong>category_id</strong> hoặc trùng tên phân loại (dữ liệu cũ).
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {products.length} sản phẩm ·{" "}
            <Link className="font-bold text-blue-600 dark:text-blue-400 hover:underline" href="/admin/products">
              Tất cả sản phẩm
            </Link>
          </span>
        </div>
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              Không có sản phẩm nào đang gắn với danh mục này.
            </p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80">
                  <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Sản phẩm
                  </th>
                  <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    SKU
                  </th>
                  <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Giá
                  </th>
                  <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Tồn
                  </th>
                  <th className="border-b border-slate-200/60 dark:border-slate-700/60 px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => {
                  const st = stockLabel(p.availability);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-headline text-sm font-bold text-blue-900 dark:text-white">{p.productName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs uppercase tracking-tight text-slate-500 dark:text-slate-400">
                        {p.sku ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-headline text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatVndPrice(p.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{p.availability ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${st.className}`}
                          >
                            {st.text}
                          </span>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Chi tiết
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
