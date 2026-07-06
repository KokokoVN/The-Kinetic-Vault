"use client";

import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  /** sidebar: full width dưới menu; header: nút gọn cạnh chuông; mobileBar: hàng tab (chỉ mobile). */
  variant?: "sidebar" | "header" | "mobileBar";
  className?: string;
  redirectTo?: string;
};

export function LogoutButton({ variant = "sidebar", className = "", redirectTo = "/admin/login" }: LogoutButtonProps) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(redirectTo);
    router.refresh();
  }

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={() => void logout()}
        title="Đăng xuất"
        className={[
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 shadow-sm transition-all hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-800 dark:hover:text-rose-400 sm:px-4 sm:text-sm",
          className,
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">logout</span>
        <span>Đăng xuất</span>
      </button>
    );
  }

  if (variant === "mobileBar") {
    return (
      <button
        type="button"
        onClick={() => void logout()}
        className={[
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/20 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-400 shadow-sm transition-all hover:bg-rose-100 dark:hover:bg-rose-900/30",
          className,
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        <span>Đăng xuất</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className={[
        "w-full flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 px-4 py-3.5 text-left text-sm font-bold text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-rose-600 dark:hover:text-rose-400 hover:shadow-sm",
        className,
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      <span>Đăng xuất</span>
    </button>
  );
}
