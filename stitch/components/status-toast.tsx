"use client";

import { useEffect, useState, useRef } from "react";

type Tone = "success" | "error" | "warning" | "info";

type StatusToastProps = {
  tone: Tone;
  title: string;
  message: string;
  duration?: number; // ms, default 4000
};

const TONE_CONFIG: Record<
  Tone,
  {
    icon: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
    border: string;
    progressColor: string;
    glow: string;
    label: string;
  }
> = {
  success: {
    icon: "check_circle",
    gradient: "from-emerald-950/95 via-emerald-900/95 to-teal-900/95",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/30",
    progressColor: "from-emerald-400 to-teal-400",
    glow: "shadow-emerald-900/50",
    label: "Thành công",
  },
  error: {
    icon: "cancel",
    gradient: "from-rose-950/95 via-rose-900/95 to-red-900/95",
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
    border: "border-rose-500/30",
    progressColor: "from-rose-400 to-red-400",
    glow: "shadow-rose-900/50",
    label: "Lỗi",
  },
  warning: {
    icon: "warning",
    gradient: "from-amber-950/95 via-amber-900/95 to-orange-900/95",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-400",
    border: "border-amber-500/30",
    progressColor: "from-amber-400 to-orange-400",
    glow: "shadow-amber-900/50",
    label: "Cảnh báo",
  },
  info: {
    icon: "info",
    gradient: "from-blue-950/95 via-blue-900/95 to-indigo-900/95",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    border: "border-blue-500/30",
    progressColor: "from-blue-400 to-indigo-400",
    glow: "shadow-blue-900/50",
    label: "Thông tin",
  },
};

export function StatusToast({
  tone,
  title,
  message,
  duration = 4000,
}: StatusToastProps) {
  const [phase, setPhase] = useState<"enter" | "idle" | "exit">("enter");
  const [progress, setProgress] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const cfg = TONE_CONFIG[tone];

  // Enter animation
  useEffect(() => {
    const t = setTimeout(() => setPhase("idle"), 20);
    return () => clearTimeout(t);
  }, []);

  // Progress + auto-exit
  useEffect(() => {
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("exit");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  if (phase === "exit") return null;

  const translateClass =
    phase === "enter"
      ? "translate-x-full opacity-0"
      : "translate-x-0 opacity-100";

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed right-4 top-4 z-[9999] w-[calc(100vw-2rem)] max-w-sm transition-all duration-500 ease-out ${translateClass}`}
    >
      {/* Card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl border ${cfg.border}
          bg-gradient-to-br ${cfg.gradient}
          shadow-2xl ${cfg.glow}
          backdrop-blur-xl
        `}
      >
        {/* Subtle inner glow top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Noise texture overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

        {/* Content */}
        <div className="relative p-4">
          <div className="flex items-start gap-3.5">
            {/* Icon */}
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} ring-1 ring-white/10`}>
              <span className={`material-symbols-outlined text-[22px] ${cfg.iconColor}`}>
                {cfg.icon}
              </span>
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${cfg.iconColor}`}>
                  {cfg.label}
                </p>
                <button
                  type="button"
                  onClick={() => setPhase("exit")}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Đóng thông báo"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
              <p className="mt-1 font-bold leading-snug text-white/95 text-sm">
                {title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/65">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-0.5 bg-white/5">
          <div
            className={`h-full bg-gradient-to-r ${cfg.progressColor} transition-none`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
