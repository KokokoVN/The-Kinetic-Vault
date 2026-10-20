"use client";

import dynamic from "next/dynamic";

export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 animate-pulse">
      {/* Skeleton Hero Header */}
      <div className="h-64 w-full rounded-[3rem] border border-white/5 bg-zinc-900/60 p-8 flex items-center gap-8 backdrop-blur-xl">
        <div className="h-36 w-36 rounded-full bg-zinc-800/80 shrink-0" />
        <div className="space-y-4 flex-1">
          <div className="h-4 w-32 rounded-full bg-zinc-800/80" />
          <div className="h-10 w-72 rounded-2xl bg-zinc-800/80" />
          <div className="h-4 w-48 rounded-full bg-zinc-800/80" />
        </div>
      </div>
      {/* Skeleton Tab Bar */}
      <div className="flex justify-center">
        <div className="h-14 w-[500px] rounded-full border border-white/5 bg-zinc-900/60" />
      </div>
      {/* Skeleton Content Card */}
      <div className="h-96 w-full rounded-[2.5rem] border border-white/5 bg-zinc-900/60 p-8" />
    </div>
  );
}

const ProfileDashboardDynamic = dynamic(
  () => import("@/components/profile-dashboard").then((m) => m.ProfileDashboard),
  {
    ssr: false,
    loading: () => <ProfileSkeleton />,
  }
);

export function ProfileClientContainer(props: {
  user: any;
  logs: any[];
  accessToken: string;
  userId: number;
}) {
  return <ProfileDashboardDynamic {...props} />;
}
