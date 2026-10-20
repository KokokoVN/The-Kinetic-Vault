import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { StorefrontLayout } from "@/components/storefront-layout";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";

export const metadata: Metadata = {
  title: "404 — Không tìm thấy trang",
  description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
      <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute left-1/2 top-1/4 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-tr from-rose-600/15 via-indigo-600/15 to-cyan-500/10 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        {/* Decorative grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_30%,transparent_80%)]" />

        <div className="relative z-10 w-full">
          {/* Animated 404 number with glow */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-500/20 to-cyan-400/20 blur-3xl" />
            </div>
            <h1 className="relative select-none font-headline text-[10rem] sm:text-[14rem] md:text-[18rem] font-black leading-none tracking-tighter">
              <span className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                404
              </span>
            </h1>
            {/* Floating icons around the 404 */}
            <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-6 animate-bounce">
              <span className="material-symbols-outlined text-4xl text-indigo-500/70 dark:text-cyan-400/70">search_off</span>
            </div>
            <div className="pointer-events-none absolute right-[18%] top-[20%] hidden animate-pulse sm:block">
              <span className="material-symbols-outlined text-3xl text-rose-500/60 dark:text-rose-400/60">report_problem</span>
            </div>
            <div className="pointer-events-none absolute left-[15%] bottom-[20%] hidden animate-pulse delay-150 sm:block">
              <span className="material-symbols-outlined text-3xl text-amber-500/60 dark:text-amber-400/60">explore_off</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-2 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-rose-600 dark:text-rose-400 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined text-[13px]">priority_high</span>
              Lỗi 404 — Không tìm thấy
            </span>
          </div>

          {/* Title & description */}
          <div className="mt-6 text-center">
            <h2 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
              Trang bạn tìm kiếm{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">
                không tồn tại
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Có thể đường dẫn đã bị thay đổi, đã xóa, hoặc tạm thời không khả dụng.
              Đừng lo lắng — bạn có thể quay về trang chủ hoặc khám phá các danh mục sản phẩm nổi bật của chúng tôi.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-indigo-500/50"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              <span>Về trang chủ</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-white backdrop-blur-md shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">storefront</span>
              <span>Khám phá sản phẩm</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-transparent px-7 py-3.5 text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 transition-all hover:scale-105 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 backdrop-blur-md"
              aria-label="Về trang chủ"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Trang chủ</span>
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-16">
            <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.02] p-6 backdrop-blur-2xl shadow-sm dark:shadow-2xl">
              <h3 className="mb-4 text-center text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Hoặc thử các liên kết phổ biến
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Link
                  href="/cart"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10"
                >
                  <span className="material-symbols-outlined text-2xl text-slate-600 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-cyan-400">
                    shopping_cart
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Giỏ hàng
                  </span>
                </Link>
                <Link
                  href="/my-orders"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10"
                >
                  <span className="material-symbols-outlined text-2xl text-slate-600 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-cyan-400">
                    receipt_long
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Đơn hàng
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10"
                >
                  <span className="material-symbols-outlined text-2xl text-slate-600 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-cyan-400">
                    person
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Tài khoản
                  </span>
                </Link>
                <Link
                  href="/notifications"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 transition-all hover:scale-105 hover:border-indigo-500/40 hover:bg-indigo-500/10"
                >
                  <span className="material-symbols-outlined text-2xl text-slate-600 transition-colors group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-cyan-400">
                    notifications
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Thông báo
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Error code footer */}
          <p className="mt-10 text-center font-mono text-[10px] tracking-wider text-slate-400 dark:text-slate-600">
            ERROR_CODE: 404_NOT_FOUND · TRANG_KHONG_TONKHEO
          </p>
        </div>
      </div>
    </StorefrontLayout>
  );
}