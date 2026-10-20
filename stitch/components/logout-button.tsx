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
        title="Đăng xuất khỏi hệ thống"
        className={[
          "group inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] active:scale-95",
          className,
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[17px] transition-transform duration-200 group-hover:translate-x-0.5">logout</span>
        <span className="whitespace-nowrap">Đăng xuất</span>
      </button>
    );
  }

  if (variant === "mobileBar") {
    return (
      <button
        type="button"
        onClick={() => void logout()}
        className={[
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/20 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-400 shadow-sm transition-all hover:bg-rose-100 dark:hover:bg-rose-900/30 active:scale-95",
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
        "w-full flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/70 dark:bg-white/[0.03] px-4 py-3 text-xs font-bold text-slate-600 dark:text-zinc-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 shadow-xs active:scale-[0.99]",
        className,
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      <span>Đăng xuất</span>
    </button>
  );
}
