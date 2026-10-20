"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { requestOtpAction } from "@/app/actions/auth";
import { FloatingNotice } from "@/components/floating-notice";

type Props = {
  action: (state: any, formData: FormData) => Promise<any>;
  submitLabel?: string;
  rememberContext?: "user" | "admin";
  extraFields?: React.ReactNode;
};

function scorePassword(pwd: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (score <= 1) return { score, label: "Yếu", color: "text-amber-400" };
  if (score <= 3) return { score, label: "Trung bình", color: "text-cyan-400" };
  return { score, label: "Rất mạnh", color: "text-emerald-400" };
}

export function LoginLiveForm({ action, submitLabel = "Đăng Nhập Vào Hệ Thống", rememberContext = "user", extraFields }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [identityExists, setIdentityExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // OTP flow state
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const deviceFingerprint = useMemo(() => {
    if (typeof window === "undefined" || !identity.trim()) return "";
    try {
      return window.btoa(identity.trim()).replace(/=+$/g, "").slice(0, 32);
    } catch {
      return "";
    }
  }, [identity]);

  useEffect(() => {
    const id = identity.trim();
    if (!id) {
      setIdentityExists(null);
      setHasChecked(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setChecking(true);
        const qp = new URLSearchParams({ identity: id });
        const res = await fetch(`/api/auth/check-identity?${qp.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as { identityExists?: boolean };
        setIdentityExists(Boolean(data.identityExists));
        setHasChecked(true);
      } catch {
        setIdentityExists(null);
        setHasChecked(false);
      } finally {
        setChecking(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [identity]);

  const pwd = useMemo(() => scorePassword(password), [password]);

  return (
    <form
      action={formAction}
      className="space-y-4"
      onSubmit={() => {
        try {
          if (deviceFingerprint) {
            sessionStorage.setItem("pendingDeviceFingerprint", deviceFingerprint);
          }
          sessionStorage.setItem(
            "pendingDeviceApprovalLogin",
            JSON.stringify({
              username: identity.trim(),
              password,
              context: rememberContext,
              at: Date.now(),
            }),
          );
        } catch {
          // no-op
        }
      }}
    >
      {extraFields}

      {/* Floating error notice at top-right corner */}
      {state?.error && <FloatingNotice key={state.error} message={state.error} variant="error" />}
      {otpError && <FloatingNotice key={otpError} message={otpError} variant="error" />}

      {/* Prominent Inline Error Banner */}
      {(state?.error || otpError) && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4 text-xs font-medium text-rose-200 shadow-xl shadow-rose-950/30 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 flex items-start gap-3 my-2">
          <span className="material-symbols-outlined text-rose-400 text-[22px] shrink-0 mt-0.5">error</span>
          <div className="flex-1 leading-relaxed">
            <strong className="block text-rose-100 font-bold text-sm mb-0.5">Đăng nhập không thành công</strong>
            {state?.error || otpError}
          </div>
        </div>
      )}

      <input type="hidden" name="deviceFingerprint" value={deviceFingerprint} />

      {/* Mode Switcher Tabs */}
      <div className="relative flex rounded-2xl bg-slate-950/80 p-1.5 border border-slate-800/80 mb-6">
        <button
          type="button"
          onClick={() => setLoginMode("password")}
          className={`relative z-10 flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            loginMode === "password" ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">lock</span>
          Mật Khẩu
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMode("otp");
            setOtpSent(false);
          }}
          className={`relative z-10 flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            loginMode === "otp" ? "text-white shadow-lg" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
          Mã OTP
        </button>
        <div
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 transition-all duration-400 ease-out shadow-md ${
            loginMode === "password" ? "left-1.5" : "left-[calc(50%+3px)]"
          }`}
        />
      </div>

      {/* Identity Input Field */}
      <div className="space-y-1.5">
        <label htmlFor="identity" className="text-xs font-bold text-slate-300 uppercase tracking-wider block ml-1">
          {loginMode === "otp" ? "Địa chỉ Email" : "Tài Khoản / Email / Số Điện Thoại"}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <input
            id="identity"
            name="username"
            className="w-full rounded-2xl bg-slate-950/70 border border-slate-700/80 py-3.5 pl-14 pr-28 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
            placeholder={loginMode === "otp" ? "nhap.email@gmail.com" : "Nhập username hoặc email"}
            type="text"
            required
            value={identity}
            onChange={(e) => setIdentity(e.target.value.replace(/\s+/g, ""))}
            autoComplete="username"
            spellCheck={false}
          />

          {/* Identity validation status indicator */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10">
            {checking ? (
              <span className="text-[11px] font-semibold text-cyan-400 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" /> Kiểm tra...
              </span>
            ) : hasChecked && identity.trim() ? (
              identityExists ? (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Tồn tại
                </span>
              ) : (
                <span className="text-[11px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full border border-red-800/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cancel</span> Chưa có
                </span>
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* Password Mode Fields */}
      {loginMode === "password" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mật Khẩu
              </label>
              <Link href="/forgot-password" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full rounded-2xl bg-slate-950/70 border border-slate-700/80 py-3.5 pl-14 pr-12 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                placeholder="Nhập mật khẩu của bạn"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-white transition-colors z-10"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {password ? (
            <div className="flex items-center justify-between text-xs px-1 pt-0.5">
              <span className="text-slate-400">Độ bảo mật: <strong className={pwd.color}>{pwd.label}</strong></span>
            </div>
          ) : null}
        </div>
      )}

      {/* OTP Mode Block */}
      {loginMode === "otp" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 rounded-2xl border border-blue-900/60 bg-blue-950/20 p-5">
          {!otpSent ? (
            <div className="text-center space-y-4">
              <p className="text-xs text-slate-300">
                Mã OTP 8 chữ số sẽ được gửi trực tiếp đến hộp thư Email đã đăng ký.
              </p>
              <button
                type="button"
                disabled={sendingOtp || !identity.trim() || identityExists === false || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)}
                onClick={async () => {
                  setSendingOtp(true);
                  setOtpError("");
                  const res = await requestOtpAction(identity, deviceFingerprint);
                  setSendingOtp(false);
                  if (res.success) {
                    setOtpSent(true);
                  } else {
                    setOtpError(res.error || "Không thể gửi mã OTP.");
                  }
                }}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang gửi OTP...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Gửi Mã OTP Đến Email
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95">
              <p className="text-xs font-bold text-emerald-400 text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Đã gửi mã OTP thành công! Vui lòng kiểm tra Email.
              </p>
              <div className="relative">
                <input
                  id="otpCode"
                  name="otp"
                  type="text"
                  required
                  maxLength={8}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-2xl bg-slate-950 border-2 border-blue-500 py-3 text-center text-2xl font-black tracking-[0.4em] text-cyan-300 outline-none focus:ring-4 focus:ring-blue-500/20"
                  placeholder="00000000"
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs font-bold text-cyan-400 hover:underline"
                >
                  Gửi lại mã mới
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remember Me Checkbox */}
      <label className="flex items-center gap-3 cursor-pointer pt-2">
        <input 
          type="checkbox" 
          defaultChecked 
          className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900" 
        />
        <span className="text-xs font-semibold text-slate-300">Ghi nhớ đăng nhập trên thiết bị này (30 ngày)</span>
      </label>

      {/* Main Submit Button */}
      <button
        type="submit"
        disabled={(loginMode === "otp" && !otpSent) || isPending}
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-4 font-black text-sm text-white shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.01] hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:shadow-none mt-4"
      >
        {isPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Đang xử lý đăng nhập...</span>
          </>
        ) : (
          <>
            <span className="uppercase tracking-wider">{loginMode === "otp" ? "Xác Nhận & Đăng Nhập" : submitLabel}</span>
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </>
        )}
      </button>
    </form>
  );
}
