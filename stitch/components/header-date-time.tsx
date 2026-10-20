"use client";

import { useEffect, useState } from "react";

function formatNow(d: Date): string {
  const date = d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${date} · ${time}`;
}

export function HeaderDateTime() {
  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      );
      setTimeStr(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="hidden xl:inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_16px_rgba(16,185,129,0.2)] select-none group"
      suppressHydrationWarning
      title="Hệ thống thời gian thực chuẩn TKV"
    >
      <div className="relative flex h-2 w-2 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
      </div>

      {mounted ? (
        <div className="flex items-center gap-1.5">
          <span className="text-[11.5px] font-medium text-slate-500 dark:text-zinc-400 capitalize">
            {dateStr}
          </span>
          <span className="text-slate-300 dark:text-zinc-600 font-light">·</span>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tracking-wider tabular-nums">
            {timeStr}
          </span>
        </div>
      ) : (
        <span className="text-[11px] text-slate-400 tracking-tight">Đang đồng bộ...</span>
      )}
    </div>
  );
}

