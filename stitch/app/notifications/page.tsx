import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StorefrontLayout } from "@/components/storefront-layout";
import { getUserIdFromAccessToken, getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { getAdminUserBrief } from "@/lib/api";
import { listNotificationsByEmail } from "@/lib/notification-api";
import { UserNotificationsPanel } from "@/components/user-notifications-panel";

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
  // Fetch full recipient inbox; source=SYSTEM previously hid WEB notifications.
  const items = email ? await listNotificationsByEmail(email) : [];

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
      <main className="bg-slate-50/50 min-h-screen pb-20">
        {/* PREMIUM HERO BANNER */}
        <section className="relative overflow-hidden bg-slate-950 px-6 py-16 lg:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-cyan-600/20 blur-[100px]" />
          <div className="pointer-events-none absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 h-[500px] w-[600px] rounded-full bg-blue-600/20 blur-[100px]" />
          
          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
            <span className="mb-5 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-white backdrop-blur-md border border-white/20 shadow-xl">
              Hộp Thư Cá Nhân
            </span>
            <h1 className="font-headline text-4xl font-black tracking-tighter text-white sm:text-6xl drop-shadow-2xl">
              Trung Tâm <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Thông Báo</span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium text-slate-300 sm:text-lg">
              Cập nhật những thông tin mới nhất về đơn hàng, khuyến mãi và các sự kiện đặc biệt dành riêng cho bạn.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-4xl px-6 -mt-8 relative z-10">
          <UserNotificationsPanel items={items} />
        </section>
      </main>
    </StorefrontLayout>
  );
}
