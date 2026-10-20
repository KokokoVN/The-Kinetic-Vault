import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StorefrontLayout } from "@/components/storefront-layout";
import { getUserIdFromAccessToken, getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { getAdminUserBrief } from "@/lib/api";
import { listNotificationsByEmail } from "@/lib/notification-api";
import { UserNotificationsPanel } from "@/components/user-notifications-panel";

export const metadata: Metadata = {
  title: "Trung Tâm Thông Báo",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  if (!isLoggedIn) redirect("/login?next=/notifications");

  const username = getUsernameFromAccessToken(accessToken);
  const userIdRaw = getUserIdFromAccessToken(accessToken);
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId) || userId <= 0) redirect("/login?error=expired");

  const user = await getAdminUserBrief(userId, { accessToken });
  const email = user?.email?.trim() || (username ? `${username}@gmail.com` : "");
  // Fetch full recipient inbox
  const items = email ? await listNotificationsByEmail(email) : [];

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
      <div className="min-h-screen text-slate-900 dark:text-slate-100 pb-20 font-sans transition-colors">
        {/* HERO BANNER - Adaptive Mesh */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 px-6 pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-br from-cyan-600/10 to-blue-600/10 dark:from-cyan-600/20 dark:to-blue-600/20 blur-[130px]" />
          <div className="pointer-events-none absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 h-[400px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-600/10 to-purple-600/10 dark:from-indigo-600/20 dark:to-purple-600/20 blur-[120px]" />
          
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-ping" />
              Trung Tâm Hộp Thư
            </span>
            <h1 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl drop-shadow-sm">
              Thông Báo <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-300">Cá Nhân</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              Cập nhật tức thì tình trạng đơn hàng, chương trình ưu đãi độc quyền và thông điệp hệ thống bảo mật dành riêng cho tài khoản của bạn.
            </p>
          </div>
        </section>

        {/* NOTIFICATIONS CONTAINER */}
        <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 -mt-8 relative z-10">
          <UserNotificationsPanel items={items} />
        </section>
      </div>
    </StorefrontLayout>
  );
}
