"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FloatingNotice } from "@/components/floating-notice";

type Props = {
  action: (state: any, formData: FormData) => Promise<any>;
};

function scorePassword(pwd: string): { score: number; label: string; color: string; width: string } {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;

  if (score <= 1) return { score, label: "Yếu (ít nhất 8 ký tự)", color: "bg-amber-500", width: "w-1/4" };
  if (score <= 3) return { score, label: "Trung bình", color: "bg-blue-500", width: "w-2/4" };
  if (score <= 4) return { score, label: "Mạnh", color: "bg-indigo-500", width: "w-3/4" };
  return { score, label: "Rất mạnh", color: "bg-emerald-400", width: "w-full" };
}

export function RegisterLiveForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // Username check states
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [hasCheckedUsername, setHasCheckedUsername] = useState(false);

  // Email check states
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [hasCheckedEmail, setHasCheckedEmail] = useState(false);

  // Username validation regex
  const isValidUsernameFormat = useMemo(() => {
    if (!username) return null;
    return /^[a-zA-Z0-9_.-]{3,30}$/.test(username);
  }, [username]);

  // Email validation regex
  const isValidEmailFormat = useMemo(() => {
    if (!email) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const pwdScore = useMemo(() => scorePassword(password), [password]);
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Debounced check for Username
  useEffect(() => {
    const u = username.trim();
    if (!u || !/^[a-zA-Z0-9_.-]{3,30}$/.test(u)) {
      setUsernameExists(null);
      setHasCheckedUsername(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setCheckingUsername(true);
        const qp = new URLSearchParams({ username: u });
        const res = await fetch(`/api/auth/check-identity?${qp.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as { usernameExists?: boolean };
        setUsernameExists(Boolean(data.usernameExists));
        setHasCheckedUsername(true);
      } catch {
        setUsernameExists(null);
        setHasCheckedUsername(false);
      } finally {
        setCheckingUsername(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [username]);

  // Debounced check for Email
  useEffect(() => {
    const e = email.trim();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setEmailExists(null);
      setHasCheckedEmail(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setCheckingEmail(true);
        const qp = new URLSearchParams({ email: e });
        const res = await fetch(`/api/auth/check-identity?${qp.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as { emailExists?: boolean };
        setEmailExists(Boolean(data.emailExists));
        setHasCheckedEmail(true);
      } catch {
        setEmailExists(null);
        setHasCheckedEmail(false);
      } finally {
        setCheckingEmail(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [email]);

  return (
    <form action={formAction} className="space-y-4">
      {/* Floating error notice at top-right corner */}
      {state?.error && <FloatingNotice key={state.error} message={state.error} variant="error" />}

      {/* Username Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="username" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Tên Đăng Nhập (Username)
          </label>
          {isValidUsernameFormat === false && (
            <span className="text-[11px] font-bold text-amber-400">
              ✕ Từ 3-30 ký tự (không chứa ký tự đặc biệt)
            </span>
          )}
          {isValidUsernameFormat === true && (
            checkingUsername ? (
              <span className="text-[11px] font-semibold text-cyan-400 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" /> Kiểm tra...
              </span>
            ) : hasCheckedUsername ? (
              usernameExists ? (
                <span className="text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cancel</span> Đã được sử dụng
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Username hợp lệ
                </span>
              )
            ) : null
          )}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </div>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 py-3.5 pl-14 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            placeholder="nguyenvana123 (viết liền không dấu)"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Địa Chỉ Email (Gmail)
          </label>
          {isValidEmailFormat === false && (
            <span className="text-[11px] font-bold text-amber-400">
              ✕ Email chưa đúng định dạng
            </span>
          )}
          {isValidEmailFormat === true && (
            checkingEmail ? (
              <span className="text-[11px] font-semibold text-cyan-400 animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" /> Kiểm tra...
              </span>
            ) : hasCheckedEmail ? (
              emailExists ? (
                <span className="text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">cancel</span> Đã được đăng ký
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Email hợp lệ
                </span>
              )
            ) : null
          )}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
            <span className="material-symbols-outlined text-[20px]">mail</span>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 py-3.5 pl-14 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            placeholder="nguyenvana@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider block ml-1">
          Mật Khẩu (Ít nhất 8 ký tự)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
            <span className="material-symbols-outlined text-[20px]">lock</span>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 py-3.5 pl-14 pr-12 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            placeholder="••••••••"
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

        {/* Password Strength Progress Bar */}
        {password && (
          <div className="pt-1 px-1 space-y-1">
            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
              <div className={`h-full ${pwdScore.color} ${pwdScore.width} transition-all duration-300 rounded-full`} />
            </div>
            <p className="text-[11px] text-slate-400">
              Độ bảo mật: <strong className="text-white">{pwdScore.label}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Xác Nhận Mật Khẩu
          </label>
          {passwordsMatch !== null && (
            <span className={`text-[11px] font-bold ${passwordsMatch ? "text-emerald-400" : "text-red-400"}`}>
              {passwordsMatch ? "✓ Mật khẩu trùng khớp" : "✕ Chưa khớp mật khẩu"}
            </span>
          )}
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
            <span className="material-symbols-outlined text-[20px]">lock_reset</span>
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 py-3.5 pl-14 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      {/* Terms & Conditions Toggle */}
      <label className="flex items-start gap-3 cursor-pointer pt-2">
        <input 
          type="checkbox" 
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-4 w-4 mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900" 
        />
        <span className="text-xs text-slate-300 leading-relaxed">
          Tôi đồng ý với các <Link href="#" className="text-indigo-400 hover:underline font-semibold">Điều khoản sử dụng</Link> và <Link href="#" className="text-indigo-400 hover:underline font-semibold">Chính sách bảo mật</Link> của Kinetic Vault.
        </span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          isPending ||
          !username ||
          !email ||
          !password ||
          !agreed ||
          usernameExists === true ||
          emailExists === true ||
          isValidUsernameFormat === false ||
          isValidEmailFormat === false ||
          passwordsMatch === false
        }
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-4 font-black text-sm text-white shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:shadow-none mt-4 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Đang tạo tài khoản...</span>
          </>
        ) : (
          <>
            <span className="uppercase tracking-wider">Đăng Ký Tài Khoản</span>
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </>
        )}
      </button>
    </form>
  );
}
