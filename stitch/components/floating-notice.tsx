"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  message: string;
  variant?: "success" | "error" | "info" | "warning";
  title?: string;
  duration?: number;
};

export function FloatingNotice({ message, variant = "info", title, duration = 4500 }: Props) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setVisible(false);
    setMounted(true);
    const showTimer = setTimeout(() => setVisible(true), 30);
    const hideTimer = setTimeout(() => setVisible(false), duration);
    const unmountTimer = setTimeout(() => setMounted(false), duration + 400);

    // Clean up temporary query parameters from URL history
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        let changed = false;
        for (const p of ["success", "error", "notice"]) {
          if (url.searchParams.has(p)) {
            url.searchParams.delete(p);
            changed = true;
          }
        }
        if (changed) {
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
      } catch {
        // ignore
      }
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [message, duration]);

  if (!mounted || !message.trim() || !isClient) return null;

  const styleConfig =
    variant === "success"
      ? {
          border: "border-emerald-500/60 ring-2 ring-emerald-500/30 text-emerald-300 shadow-emerald-950/50",
          icon: "check_circle",
          iconColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
          progressBg: "bg-emerald-400",
          badge: "Thành Công",
          labelColor: "text-emerald-400",
        }
      : variant === "error"
        ? {
            border: "border-rose-500/60 ring-2 ring-rose-500/30 text-rose-300 shadow-rose-950/50",
            icon: "error",
            iconColor: "text-rose-400 bg-rose-500/20 border-rose-500/40",
            progressBg: "bg-rose-400",
            badge: "Lỗi Thao Tác",
            labelColor: "text-rose-400",
          }
        : variant === "warning"
          ? {
              border: "border-amber-500/60 ring-2 ring-amber-500/30 text-amber-300 shadow-amber-950/50",
              icon: "warning",
              iconColor: "text-amber-400 bg-amber-500/20 border-amber-500/40",
              progressBg: "bg-amber-400",
              badge: "Cảnh Báo",
              labelColor: "text-amber-400",
            }
          : {
              border: "border-cyan-500/60 ring-2 ring-cyan-500/30 text-cyan-300 shadow-cyan-950/50",
              icon: "info",
              iconColor: "text-cyan-400 bg-cyan-500/20 border-cyan-500/40",
              progressBg: "bg-cyan-400",
              badge: "Thông Báo",
              labelColor: "text-cyan-400",
            };

  const portalContent = (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed right-4 sm:right-8 top-6 z-[999999] w-[min(92vw,440px)] transform-gpu transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
      }`}
    >
      <div className={`relative overflow-hidden rounded-2xl border p-4 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] ${styleConfig.border}`}>
        <div className="flex items-start gap-3.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-inner ${styleConfig.iconColor}`}>
            <span className="material-symbols-outlined text-[22px]">{styleConfig.icon}</span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className={`text-[10px] font-black uppercase tracking-widest block ${styleConfig.labelColor}`}>
                {styleConfig.badge}
              </span>
              <button
                type="button"
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => setMounted(false), 300);
                }}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Đóng thông báo"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {title && (
              <p className="font-headline font-bold text-white text-sm leading-snug">
                {title}
              </p>
            )}
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-zinc-300 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Animated Countdown Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-900/80 overflow-hidden">
          <div
            className={`h-full ${styleConfig.progressBg} transition-all ease-linear`}
            style={{
              width: visible ? "0%" : "100%",
              transitionDuration: `${duration}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
}
