"use client";

import { useEffect, useState } from "react";

function formatNow(d: Date): string {
  const date = d.toLocaleDateString("vi-VN", {
    weekday: "long",
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
  const [label, setLabel] = useState("");

  useEffect(() => {
    setMounted(true);
    const update = () => setLabel(formatNow(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="whitespace-nowrap rounded-full border border-blue-200/60 bg-blue-50/80 dark:border-blue-500/20 dark:bg-blue-950/40 px-4 py-2 text-xs font-bold text-blue-700 dark:text-blue-400 shadow-sm backdrop-blur-md" suppressHydrationWarning>
      {mounted ? label : "Đang tải..."}
    </span>
  );
}

