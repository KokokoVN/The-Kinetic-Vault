"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting until mounted
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button 
        type="button" 
        aria-label="Chuyển chế độ sáng/tối" 
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] text-slate-600 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all"
      >
        <span className="material-symbols-outlined text-[19px]">light_mode</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-slate-700 dark:text-zinc-300 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/50 hover:bg-indigo-50/80 dark:hover:bg-cyan-500/10 hover:text-indigo-600 dark:hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(99,102,241,0.25)] hover:scale-105 active:scale-95"
      title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
      aria-label="Chuyển chế độ sáng/tối"
    >
      <span className="material-symbols-outlined text-[19px] transition-transform duration-300 group-hover:rotate-45">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
