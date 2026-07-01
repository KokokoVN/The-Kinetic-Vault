import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { StorefrontLayout } from "@/components/storefront-layout";
import { formatWebActivityTime, getAdminUserBrief } from "@/lib/api";
import { getUserIdFromAccessToken, getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { getNotificationById, markNotificationRead } from "@/lib/notification-api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NotificationDetailPage({ params }: Props) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  if (!isLoggedIn) redirect("/login?next=/notifications");

  const username = getUsernameFromAccessToken(accessToken);
  const userIdRaw = getUserIdFromAccessToken(accessToken);
  const userId = Number(userIdRaw);
  if (!Number.isFinite(userId) || userId <= 0) redirect("/login?error=expired");

  const { id } = await params;
  const notificationId = Number(id);
  if (!Number.isFinite(notificationId) || notificationId <= 0) notFound();

  const user = await getAdminUserBrief(userId, { accessToken });
  const email = (user?.email?.trim() || (username ? `${username}@gmail.com` : "")).toLowerCase();
  if (!email) notFound();

  const row = await getNotificationById(notificationId);
  if (!row) notFound();

  const recipient = String(row.recipient ?? "").trim().toLowerCase();
  if (recipient !== email) notFound();

  let display = row;
  const isRead = String(row.status ?? "").toUpperCase() === "READ";
  if (!isRead) {
    const updated = await markNotificationRead(notificationId);
    if (updated) {
      display = updated;
    }
  }

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="home">
      <main className="bg-slate-50/50 min-h-screen py-12 pb-24">
        <article className="mx-auto w-full max-w-4xl px-6">
          {/* Back Button */}
          <div className="mb-8 flex">
            <Link 
              href="/notifications" 
              className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm border border-slate-200/60 transition-all hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-md"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
              Quay lại hộp thư
            </Link>
          </div>

          {/* Reader Card */}
          <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
            {/* Header Area */}
            <div className="relative border-b border-slate-100 bg-slate-50/80 px-8 py-10 sm:px-12 sm:py-14">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">
                    <span className="material-symbols-outlined text-[14px]">done_all</span>
                    ĐÃ ĐỌC
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/70 px-3 py-1.5 text-xs font-bold text-slate-600">
                    <span className="material-symbols-outlined text-[14px]">campaign</span>
                    {display.channel ?? "Hệ thống"}
                  </span>
                </div>
                
                <h1 className="font-headline text-3xl font-black text-slate-900 sm:text-5xl leading-tight">
                  {display.subject ?? "(Không có tiêu đề)"}
                </h1>
                
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  {formatWebActivityTime(display.createdAt)}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="px-8 py-10 sm:px-12 sm:py-12">
              <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-p:leading-relaxed prose-a:text-cyan-600">
                {display.body ? (
                  <div dangerouslySetInnerHTML={{ __html: display.body.replace(/\\n/g, "<br/>") }} />
                ) : (
                  <p className="text-slate-400 italic">Không có nội dung chi tiết.</p>
                )}
              </div>
            </div>
            
            {/* Footer Area */}
            <div className="bg-slate-50 px-8 py-6 sm:px-12 flex justify-between items-center border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400">
                Gửi tới: <span className="font-bold text-slate-500">{email}</span>
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100/50 text-cyan-600">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
            </div>
          </div>
        </article>
      </main>
    </StorefrontLayout>
  );
}
