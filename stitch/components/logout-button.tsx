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
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-800 sm:px-4 sm:text-sm",
          className,
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[20px] sm:text-[22px]">logout</span>
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
          "inline-flex shrink-0 items-center gap-1 rounded-lg border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-xs font-bold text-rose-900 shadow-sm transition-colors hover:bg-rose-100",
          className,
        ].join(" ")}
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        Đăng xuất
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void logout()}
      className={[
        "w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-blue-900",
        className,
      ].join(" ")}
    >
      <span className="material-symbols-outlined mr-2 align-middle text-base">logout</span>
      Đăng xuất
    </button>
  );
}
