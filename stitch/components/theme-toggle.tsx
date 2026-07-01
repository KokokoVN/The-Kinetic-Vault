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
      <button className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all">
        <span className="material-symbols-outlined text-[22px]">light_mode</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-cyan-400"
      title="Chuyển chế độ sáng/tối"
    >
      <span className="material-symbols-outlined text-[22px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
