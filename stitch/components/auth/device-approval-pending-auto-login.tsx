"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resendLoginOtp } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

type PendingLoginPayload = {
  username?: string;
  password?: string;
  context?: "user" | "admin";
  at?: number;
};

function OtpBoxes({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="flex w-full flex-nowrap items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-1" aria-label="OTP 8 số">
      {Array.from({ length: 8 }).map((_, idx) => {
        const hasVal = Boolean(value[idx]);
        return (
          <input
            key={idx}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[idx] ?? ""}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
              if (!text) return;
              e.preventDefault();
              const next = Array.from({ length: 8 }, (_, i) => text[i] ?? "");
              onChange(next);
            }}
            onChange={(e) => {
              const ch = e.target.value.replace(/\D/g, "").slice(-1);
              const next = [...value];
              next[idx] = ch;
              onChange(next);
              if (ch) {
                const nextEl = e.currentTarget.parentElement?.children.item(idx + 1) as HTMLInputElement | null;
                nextEl?.focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !value[idx] && idx > 0) {
                const prevEl = e.currentTarget.parentElement?.children.item(idx - 1) as HTMLInputElement | null;
                prevEl?.focus();
              }
            }}
            className={`h-12 w-9 sm:h-14 sm:w-11 flex-none rounded-xl border text-center font-mono text-xl sm:text-2xl font-black outline-none transition-all shadow-inner ${
              hasVal
                ? "border-cyan-400/80 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "border-zinc-700/80 bg-zinc-900/90 text-zinc-100 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20"
            }`}
          />
        );
      })}
    </div>
  );
}

export function DeviceApprovalPendingAutoLogin({ fromAdmin }: { fromAdmin: boolean }) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array.from({ length: 8 }, () => ""));
  const [cooldown, setCooldown] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const fallbackPath = useMemo(() => (fromAdmin ? "/admin/login" : "/login"), [fromAdmin]);
  const otpValue = useMemo(() => otp.join(""), [otp]);
  const canSubmit = otpValue.length === 8 && otp.every((x) => x.length === 1) && deviceFingerprint.trim().length > 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pendingDeviceApprovalLogin");
      if (!raw) return;
      const payload = JSON.parse(raw) as PendingLoginPayload;
      const identity = String(payload.username ?? "").trim();
      const storedFp = sessionStorage.getItem("pendingDeviceFingerprint") ?? "";
      if (storedFp) {
        setDeviceFingerprint(storedFp);
        return;
      }
      if (identity) {
        const generated = typeof window !== "undefined" ? window.btoa(identity).replace(/=+$/g, "").slice(0, 32) : identity.slice(0, 32);
        sessionStorage.setItem("pendingDeviceFingerprint", generated);
        setDeviceFingerprint(generated);
      }
    } catch {
      // no-op
    }
  }, []);

  const loadIdentity = () => {
    try {
      const raw = sessionStorage.getItem("pendingDeviceApprovalLogin");
      const payload = raw ? (JSON.parse(raw) as PendingLoginPayload) : null;
      return payload?.username?.trim() ?? "";
    } catch {
      return "";
    }
  };

  const handleVerify = async () => {
    if (!canSubmit) return;
    const identity = loadIdentity();
    if (!identity) {
      setFailed(true);
      setStatusText("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, otp: otpValue, deviceFingerprint }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Xác thực OTP thất bại");
      }
      try {
        sessionStorage.removeItem("pendingDeviceApprovalLogin");
        sessionStorage.removeItem("pendingDeviceFingerprint");
      } catch {
        // no-op
      }
      setFailed(false);
      setStatusText("Xác thực thành công. Đang chuyển hướng...");
      const target = fromAdmin ? "/admin" : "/";
      router.replace(target);
      router.refresh();
    } catch (e) {
      setFailed(true);
      setStatusText(e instanceof Error ? e.message : "Xác thực OTP thất bại");
      setOtp(Array.from({ length: 8 }, () => ""));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const identity = loadIdentity();
    if (!identity || cooldown > 0 || !deviceFingerprint) return;
    try {
      setLoading(true);
      const ok = await resendLoginOtp({ identity, deviceFingerprint });
      if (!ok) {
        throw new Error("Gửi lại OTP thất bại");
      }
      setOtp(Array.from({ length: 8 }, () => ""));
      setStatusText("Đã gửi lại mã OTP mới.");
      setCooldown(60);
      setFailed(false);
    } catch (e) {
      setFailed(true);
      setStatusText(e instanceof Error ? e.message : "Gửi lại OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top-Right Floating Toast Notification */}
      {statusText ? (
        <FloatingNotice
          key={statusText + failed}
          message={statusText}
          variant={failed ? "error" : "success"}
        />
      ) : null}

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 block flex items-center space-x-1.5">
          <span className="material-symbols-outlined text-cyan-400 text-sm">dialpad</span>
          <span>Mã OTP 8 chữ số</span>
        </label>
        <OtpBoxes value={otp} onChange={setOtp} />
      </div>

      <div className="flex flex-col gap-2.5 pt-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={!canSubmit || loading}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm sm:text-base font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
        >
          <span>{loading ? "Đang xác thực..." : "Xác nhận & Tiếp tục"}</span>
          <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
            check_circle
          </span>
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="rounded-xl px-4 py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all hover:underline disabled:opacity-50 text-center"
        >
          {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : "Gửi lại mã OTP"}
        </button>
      </div>

      {failed && (
        <div className="text-center pt-1">
          <a href={fallbackPath} className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors">
            Không nhận được mã? Quản lý phiên & Đăng nhập lại
          </a>
        </div>
      )}
    </div>
  );
}

