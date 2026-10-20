import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getUsernameFromAccessToken,
  getUserIdFromAccessToken,
  isAccessTokenExpired
} from "@/lib/auth";

import {
  getAdminUserProfile
} from "@/lib/api";

import {
  StorefrontLayout
} from "@/components/storefront-layout";

import { ProfileClientContainer } from "@/components/profile-client-container";

export const dynamic =
  "force-dynamic";

export default async function ProfilePage() {
  const cookie =
    await cookies();

  const token =
    cookie.get("accessToken")
      ?.value;

  if (
    !token ||
    isAccessTokenExpired(token)
  ) {
    redirect(
      "/login?next=/profile"
    )
  }

  const userId =
    Number(
      getUserIdFromAccessToken(token)
    );

  if (!userId) {
    redirect("/login")
  }

  const username =
    getUsernameFromAccessToken(token);

  const user =
    await getAdminUserProfile(
      userId,
      {
        accessToken: token
      }
    );

  const logs =
    user?.userDetails
      ?.changeLogs
    ??
    [];

  return (
    <StorefrontLayout
      isLoggedIn={true}
      username={username}
      activeMenu="profile"
    >
      <div className="relative min-h-screen w-full text-slate-900 dark:text-zinc-100 overflow-x-hidden">
        {/* Background ambient glowing gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-blue-500/10 blur-[150px]" />
          <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-indigo-500/10 via-purple-600/10 to-cyan-500/10 blur-[160px]" />
          <div className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-blue-600/10 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ProfileClientContainer
            user={user}
            logs={logs}
            accessToken={token}
            userId={userId}
          />
        </div>
      </div>
    </StorefrontLayout>
  );
}