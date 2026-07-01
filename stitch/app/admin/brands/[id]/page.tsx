import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { getAdminBrandById } from "@/lib/api";

export const dynamic = "force-dynamic";

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

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/admin/brands"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Quay lại danh sách
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
              Chi tiết thương hiệu
            </h1>
            <span className="rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 shadow-sm">
              #{brand.id}
            </span>
          </div>
        </div>
        
        {session.canMutateCatalog && (
          <Link
            href={`/admin/brands/${brand.id}/edit`}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/30"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
            <span className="material-symbols-outlined relative z-10 text-[20px]">edit</span>
            <span className="relative z-10">Chỉnh sửa thương hiệu</span>
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Logo Section */}
        <div className="md:col-span-1">
          <div className="group relative overflow-hidden rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 shadow-xl shadow-purple-900/10 dark:shadow-none transition-all hover:shadow-purple-900/20 dark:hover:shadow-none">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-50" />
            
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-transform duration-500 group-hover:scale-105">
              {resolvedLogoUrl ? (
                <img
                  src={resolvedLogoUrl}
                  alt={brand.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-500">
                  <span className="material-symbols-outlined text-5xl opacity-50">image_not_supported</span>
                  <span className="text-xs font-medium uppercase tracking-widest">Chưa có Logo</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="md:col-span-2">
          <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-8 shadow-xl shadow-blue-900/5 dark:shadow-none">
            <div>
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-headline text-3xl font-black text-slate-800 dark:text-slate-100">{brand.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Thông tin cơ bản của thương hiệu</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Mô tả thương hiệu
                  </p>
                  <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300">
                    {brand.description || <span className="italic text-slate-400">Không có thông tin mô tả chi tiết cho thương hiệu này.</span>}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">fingerprint</span>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">ID Hệ thống</p>
                    </div>
                    <p className="font-mono text-lg font-medium text-slate-800 dark:text-slate-200">#{brand.id}</p>
                  </div>
                  
                  <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 p-6 border border-slate-200 dark:border-slate-700 shadow-sm backdrop-blur-md">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Đường dẫn Logo</p>
                    </div>
                    <p className="truncate text-sm font-medium text-slate-600 dark:text-slate-300" title={brand.logoUrl || ""}>
                      {brand.logoUrl || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Thương hiệu này được quản lý tập trung và sẽ đồng bộ với tất cả các sản phẩm trực thuộc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
