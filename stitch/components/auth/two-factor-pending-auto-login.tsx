"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resendLoginOtp } from "@/lib/api";

type PendingLoginPayload = {
  username?: string;
  password?: string;
  context?: "user" | "admin";
  at?: number;
};

function OtpBoxes({ value, onChange, length = 6 }: { value: string[]; onChange: (next: string[]) => void; length?: number }) {
  return (
    <div className="flex w-full flex-nowrap items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1" aria-label={`OTP ${length} số`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] ?? ""}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!text) return;
            e.preventDefault();
            const next = Array.from({ length }, (_, i) => text[i] ?? "");
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
          className="h-12 w-10 sm:h-14 sm:w-12 flex-none rounded-2xl border-2 border-slate-200 bg-white text-center text-xl font-black tracking-[0.1em] text-indigo-700 outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/20"
        />
      ))}
    </div>
  );
}

export function TwoFactorPendingAutoLogin({ fromAdmin }: { fromAdmin: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"app" | "email">("app");
  const [otpApp, setOtpApp] = useState<string[]>(Array.from({ length: 6 }, () => ""));
  const [otpEmail, setOtpEmail] = useState<string[]>(Array.from({ length: 8 }, () => ""));
  const [cooldown, setCooldown] = useState(0);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const fallbackPath = useMemo(() => (fromAdmin ? "/admin/login" : "/login"), [fromAdmin]);
  const otpAppValue = useMemo(() => otpApp.join(""), [otpApp]);
  const otpEmailValue = useMemo(() => otpEmail.join(""), [otpEmail]);
  
  const canSubmitApp = otpAppValue.length === 6 && otpApp.every((x) => x.length === 1) && deviceFingerprint.trim().length > 0;
  const canSubmitEmail = otpEmailValue.length === 8 && otpEmail.every((x) => x.length === 1) && deviceFingerprint.trim().length > 0;

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

  const handleVerifyApp = async () => {
    if (!canSubmitApp) return;
    const identity = loadIdentity();
    if (!identity) {
      setFailed(true);
      setStatusText("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/auth/login-2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, code: otpAppValue, deviceFingerprint }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Xác thực 2FA thất bại");
      }
      try {
        sessionStorage.removeItem("pendingDeviceApprovalLogin");
        sessionStorage.removeItem("pendingDeviceFingerprint");
      } catch {}
      setStatusText("Xác thực thành công. Đang đăng nhập...");
      router.replace(fromAdmin ? "/admin" : "/");
      router.refresh();
    } catch (e) {
      setFailed(true);
      setStatusText(e instanceof Error ? e.message : "Xác thực 2FA thất bại");
      setOtpApp(Array.from({ length: 6 }, () => ""));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!canSubmitEmail) return;
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
        body: JSON.stringify({ identity, otp: otpEmailValue, deviceFingerprint }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Xác thực OTP thất bại");
      }
      try {
        sessionStorage.removeItem("pendingDeviceApprovalLogin");
        sessionStorage.removeItem("pendingDeviceFingerprint");
      } catch {}
      setStatusText("Xác thực thành công. Đang đăng nhập...");
      router.replace(fromAdmin ? "/admin" : "/");
      router.refresh();
    } catch (e) {
      setFailed(true);
      setStatusText(e instanceof Error ? e.message : "Xác thực OTP thất bại");
      setOtpEmail(Array.from({ length: 8 }, () => ""));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const identity = loadIdentity();
    if (!identity || cooldown > 0 || !deviceFingerprint) return;
    try {
      setLoading(true);
      const ok = await resendLoginOtp({ identity, deviceFingerprint });
      if (!ok) {
        throw new Error("Gửi lại OTP thất bại");
      }
      setOtpEmail(Array.from({ length: 8 }, () => ""));
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
    <div className="mt-2 space-y-6">
      <div className="relative mx-auto flex w-full rounded-2xl bg-slate-100 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => { setMode("app"); setStatusText(""); setFailed(false); }}
          className={`relative z-10 flex-1 rounded-xl py-3 text-sm font-extrabold transition-all duration-300 ${
            mode === "app" ? "text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Ứng dụng 2FA
        </button>
        <button
          type="button"
          onClick={() => { setMode("email"); setStatusText(""); setFailed(false); }}
          className={`relative z-10 flex-1 rounded-xl py-3 text-sm font-extrabold transition-all duration-300 ${
            mode === "email" ? "text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Mã qua Email
        </button>
        <div
          className={`absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md transition-all duration-500 ease-out ${
            mode === "app" ? "left-1.5" : "left-[calc(50%+4px)]"
          }`}
        />
      </div>

      {mode === "app" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="text-center mb-6">
            <label className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-4 block">Nhập mã 6 số từ Google Authenticator / Authy</label>
            <OtpBoxes value={otpApp} onChange={setOtpApp} length={6} />
          </div>

          <button
            type="button"
            onClick={handleVerifyApp}
            disabled={!canSubmitApp || loading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-indigo-600 to-purple-700 py-4 font-black text-lg text-white shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-1 hover:shadow-indigo-600/50 hover:shadow-2xl disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
          >
            <span className="relative z-10 uppercase tracking-wider">{loading ? "Đang xác thực..." : "Xác nhận & Tiếp tục"}</span>
            <span className="material-symbols-outlined relative z-10 text-[24px] font-bold transition-transform group-hover:translate-x-2">
              verified
            </span>
            <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
      )}

      {mode === "email" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="text-center mb-6">
            <label className="text-sm font-extrabold uppercase tracking-widest text-slate-500 mb-4 block">Nhập mã OTP 8 số (Đã gửi vào Email)</label>
            <OtpBoxes value={otpEmail} onChange={setOtpEmail} length={8} />
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleVerifyEmail}
              disabled={!canSubmitEmail || loading}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-700 py-4 font-black text-lg text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-blue-600/50 hover:shadow-2xl disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10 uppercase tracking-wider">{loading ? "Đang xác thực..." : "Xác nhận & Tiếp tục"}</span>
              <span className="material-symbols-outlined relative z-10 text-[24px] font-bold transition-transform group-hover:translate-x-2">
                check_circle
              </span>
              <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            <button
              type="button"
              onClick={handleResendEmail}
              disabled={loading || cooldown > 0}
              className="rounded-[1.25rem] px-4 py-3 text-sm font-extrabold text-blue-600 transition-all hover:text-indigo-800 hover:underline disabled:opacity-50 disabled:no-underline text-center"
            >
              {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : "Gửi lại mã OTP"}
            </button>
          </div>
        </div>
      )}

      {statusText && (
        <p className={`text-center text-sm font-bold ${failed ? 'text-rose-600' : 'text-emerald-600'}`}>
          {statusText}
        </p>
      )}
    </div>
  );
}
