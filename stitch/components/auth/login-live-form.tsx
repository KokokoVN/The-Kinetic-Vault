"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { requestOtpAction } from "@/app/actions/auth";

type Props = {
  action: (state: any, formData: FormData) => Promise<any>;
  submitLabel?: string;
  rememberContext?: "user" | "admin";
  extraFields?: React.ReactNode;
};

function scorePassword(pwd: string): { score: number; label: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (score <= 1) return { score, label: "Yếu" };
  if (score <= 3) return { score, label: "Trung bình" };
  return { score, label: "Mạnh" };
}

export function LoginLiveForm({ action, submitLabel = "Đăng nhập vào hệ thống", rememberContext = "user", extraFields }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [identityExists, setIdentityExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Thêm state cho luồng OTP
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const deviceFingerprint = useMemo(() => {
    if (typeof window === "undefined" || !identity.trim()) return "";
    try {
      const generated = window.btoa(identity.trim()).replace(/=+$/g, "").slice(0, 32);
      return generated;
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
      className="space-y-6"
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
      {state?.error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-bold text-red-600">{state.error}</p>
        </div>
      )}
      <input type="hidden" name="deviceFingerprint" value={deviceFingerprint} />
      <div className="relative">
        <input
          id="identity"
          name="username"
          className="peer w-full rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-8 pl-5 pr-14 text-lg font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/10"
          placeholder=" "
          type="text"
          required
          value={identity}
          onChange={(e) => setIdentity(e.target.value.replace(/\s+/g, ""))}
          autoComplete="username"
          inputMode="text"
          spellCheck={false}
        />
        <label
          htmlFor="identity"
          className="pointer-events-none absolute left-5 top-6 origin-[0] -translate-y-4 scale-75 transform text-base font-bold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-medium peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
        >
          {loginMode === "otp" ? "Địa chỉ Email của bạn" : "Username / Email / Số điện thoại"}
        </label>
        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[24px] text-slate-400 dark:text-slate-500 transition-colors peer-focus:text-blue-600 dark:peer-focus:text-blue-400">
          person
        </span>
        {identity.trim() ? (
          <div className="absolute -bottom-6 left-1 flex gap-3">
            {checking ? (
              <p className="text-xs text-on-surface-variant animate-pulse">Đang kiểm tra tài khoản...</p>
            ) : hasChecked ? (
              identityExists ? (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Hợp lệ
                </p>
              ) : (
                <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span> Chưa tồn tại
                </p>
              )
            ) : null}
            {loginMode === "otp" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.trim()) && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span> Vui lòng nhập đúng định dạng Email
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto flex w-full rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 shadow-inner mt-6">
        <button
          type="button"
          onClick={() => setLoginMode("password")}
          className={`relative z-10 flex-1 rounded-xl py-3.5 text-base font-extrabold transition-all duration-300 ${
            loginMode === "password" ? "text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Mật khẩu
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMode("otp");
            setOtpSent(false);
          }}
          className={`relative z-10 flex-1 rounded-xl py-3.5 text-base font-extrabold transition-all duration-300 ${
            loginMode === "otp" ? "text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Mã OTP
        </button>
        <div
          className={`absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md transition-all duration-500 ease-out ${
            loginMode === "password" ? "left-1.5" : "left-[calc(50%+4px)]"
          }`}
        />
      </div>

      {loginMode === "password" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative mt-2">
            <input
              id="password"
              name="password"
              type="password"
              className="peer w-full rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-8 pl-5 pr-14 text-lg font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/10"
              placeholder=" "
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label
              htmlFor="password"
              className="pointer-events-none absolute left-5 top-6 origin-[0] -translate-y-4 scale-75 transform text-base font-bold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-medium peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
            >
              Mật khẩu
            </label>
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[24px] text-slate-400 dark:text-slate-500 transition-colors peer-focus:text-blue-600 dark:peer-focus:text-blue-400">
              key
            </span>
          </div>
          <div className="flex items-center justify-between px-2 pt-1">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Bảo mật: <span className="font-extrabold text-blue-600 dark:text-blue-400">{pwd.label}</span></p>
            <Link className="text-sm font-extrabold text-blue-600 dark:text-blue-400 transition-all hover:text-indigo-800 dark:hover:text-indigo-400 hover:underline" href="/forgot-password">
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      )}

      {loginMode === "otp" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4 rounded-3xl border-2 border-blue-100 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-6 mt-2">
          {!otpSent ? (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <p className="mb-6 text-base font-medium text-slate-700 dark:text-slate-300">
                Hệ thống sẽ gửi một mã OTP 8 số qua Email được liên kết với tài khoản của bạn.
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
                    setOtpError(res.error || "Không thể gửi OTP.");
                  }
                }}
                className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-extrabold text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-blue-600/50 hover:bg-blue-700 disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
              >
                {sendingOtp ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang gửi OTP...
                  </span>
                ) : (
                  "Nhận mã OTP"
                )}
              </button>
              {otpError && <p className="mt-3 text-sm font-bold text-red-500 animate-in fade-in">{otpError}</p>}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <p className="mb-5 text-center text-base font-bold text-emerald-600">Đã gửi mã xác nhận đến Email của bạn!</p>
              <div className="relative">
                <input
                  id="otpCode"
                  name="otp"
                  type="text"
                  required
                  maxLength={8}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="peer w-full rounded-2xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 pb-3 pt-8 pl-4 text-center text-3xl font-black tracking-[0.5em] text-blue-700 dark:text-blue-400 outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/20"
                  placeholder=" "
                />
                <label
                  htmlFor="otpCode"
                  className="pointer-events-none absolute left-1/2 top-5 origin-[0] -translate-x-1/2 -translate-y-3 scale-75 transform text-base font-extrabold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:-translate-y-1 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-bold peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:font-extrabold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
                >
                  Nhập mã 8 số
                </label>
              </div>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-sm font-extrabold text-blue-600 dark:text-blue-400 transition-all hover:text-indigo-800 dark:hover:text-indigo-400 hover:underline"
                >
                  Gửi lại mã OTP
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <label className="flex w-fit cursor-pointer items-center gap-3 mt-4">
        <input className="h-6 w-6 rounded-lg border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-500 focus:ring-blue-600 dark:focus:ring-blue-500" type="checkbox" />
        <span className="text-base font-semibold text-slate-700 dark:text-slate-300">Giữ đăng nhập trong 30 ngày</span>
      </label>

      <button 
        type="submit" 
        disabled={(loginMode === "otp" && !otpSent) || isPending}
        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-700 py-5 font-black text-lg text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-blue-600/50 hover:shadow-2xl disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none mt-8"
      >
        <span className="relative z-10 uppercase tracking-wider">{isPending ? "Đang xử lý..." : (loginMode === "otp" ? "Xác nhận & Đăng nhập" : submitLabel)}</span>
        <span className="material-symbols-outlined relative z-10 text-[24px] font-bold transition-transform group-hover:translate-x-2">
          arrow_forward
        </span>
        <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </form>
  );
}
