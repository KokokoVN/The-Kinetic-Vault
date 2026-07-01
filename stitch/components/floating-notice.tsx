"use client";

import { useEffect, useState } from "react";

type Props = {
  message: string;
  variant?: "success" | "error" | "info";
};

export function FloatingNotice({ message, variant = "info" }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 20);
    const hideTimer = setTimeout(() => setVisible(false), 3200);
    const unmountTimer = setTimeout(() => setMounted(false), 3600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!mounted || !message.trim()) return null;

  const color =
    variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : variant === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <div
      className={`fixed right-4 top-4 z-[80] w-[min(92vw,420px)] transform-gpu transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
    >
      <div className={`rounded-xl border px-4 py-3 shadow-lg ${color}`}>
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5 text-[18px]">notifications</span>
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              setTimeout(() => setMounted(false), 250);
            }}
            className="rounded p-1 text-current/70 transition-colors hover:bg-black/5 hover:text-current"
            aria-label="Đóng thông báo"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
