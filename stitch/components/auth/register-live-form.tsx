"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

type Props = {
  action: (state: any, formData: FormData) => Promise<any>;
};

type CheckRes = {
  usernameExists: boolean;
  emailExists: boolean;
  phoneExists?: boolean;
};

function normalizeUsername(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "");
}

function isValidUsername(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value.trim()) && value.trim().length >= 3;
}

function normalizeContact(value: string): string {
  return value.trim();
}

function isGmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(value.trim());
}

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

export function RegisterLiveForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [check, setCheck] = useState<CheckRes>({ usernameExists: false, emailExists: false, phoneExists: false });
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const usernameNormalized = normalizeUsername(username);
  const emailValue = normalizeContact(email);
  const emailIsGmail = isGmail(emailValue);

  useEffect(() => {
    const u = usernameNormalized.trim();
    const c = emailValue.trim();
    if (!u && !c) {
      setCheck({ usernameExists: false, emailExists: false, phoneExists: false });
      setHasChecked(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setChecking(true);
        const qp = new URLSearchParams();
        if (u) qp.set("username", u);
        if (c) qp.set("email", c);
        qp.set("identity", c);
        const res = await fetch(`/api/auth/check-identity?${qp.toString()}`, { cache: "no-store" });
        const data = (await res.json()) as CheckRes;
        setCheck({
          usernameExists: Boolean(data.usernameExists),
          emailExists: Boolean(data.emailExists),
          phoneExists: Boolean(data.phoneExists),
        });
        setHasChecked(true);
      } catch {
        setCheck({ usernameExists: false, emailExists: false, phoneExists: false });
        setHasChecked(false);
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [usernameNormalized, emailValue]);

  const pwd = useMemo(() => scorePassword(password), [password]);
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const usernameIsValid = isValidUsername(username);
  const canSubmit =
    usernameIsValid &&
    emailValue.length > 0 &&
    emailIsGmail &&
    password.length >= 8 &&
    !check.usernameExists &&
    !check.emailExists &&
    !confirmMismatch;

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-bold text-red-600">{state.error}</p>
        </div>
      )}
      <div className="relative">
        <input
          id="reg_username"
          name="username"
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-8 pl-5 pr-14 text-lg font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/10"
        />
        <label
          htmlFor="reg_username"
          className="pointer-events-none absolute left-5 top-6 origin-[0] -translate-y-4 scale-75 transform text-base font-bold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-medium peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
        >
          Tên đăng nhập
        </label>
        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[24px] text-slate-400 dark:text-slate-500 transition-colors peer-focus:text-blue-600 dark:peer-focus:text-blue-400">
          account_circle
        </span>
        {username.trim() ? (
          !usernameIsValid ? (
            <p className="mt-1 text-xs text-rose-700">Tên đăng nhập chỉ được chứa chữ và số, tối thiểu 3 ký tự.</p>
          ) : checking ? (
            <p className="mt-1 text-xs text-on-surface-variant">Đang kiểm tra tên đăng nhập...</p>
          ) : hasChecked ? (
            check.usernameExists ? (
              <p className="mt-1 text-xs text-rose-700">Tên đăng nhập đã tồn tại.</p>
            ) : (
              <p className="mt-1 text-xs text-emerald-700">Tên đăng nhập có thể sử dụng.</p>
            )
          ) : (
            <p className="mt-1 text-xs text-amber-800">Không kiểm tra được tên đăng nhập lúc này.</p>
          )
        ) : null}
      </div>
      
      <div className="relative">
        <input
          id="reg_email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-8 pl-5 pr-14 text-lg font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/10"
        />
        <label
          htmlFor="reg_email"
          className="pointer-events-none absolute left-5 top-6 origin-[0] -translate-y-4 scale-75 transform text-base font-bold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-medium peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
        >
          Email (chỉ Gmail)
        </label>
        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[24px] text-slate-400 dark:text-slate-500 transition-colors peer-focus:text-blue-600 dark:peer-focus:text-blue-400">
          mail
        </span>
        {email.trim() ? (
          checking ? (
            <p className="mt-1 text-xs text-on-surface-variant">Đang kiểm tra email...</p>
          ) : hasChecked ? (
            !emailIsGmail ? (
              <p className="mt-1 text-xs text-rose-700">Chỉ hỗ trợ địa chỉ Gmail.</p>
            ) : check.emailExists ? (
              <p className="mt-1 text-xs text-rose-700">Email đã tồn tại.</p>
            ) : (
              <p className="mt-1 text-xs text-emerald-700">Email có thể sử dụng.</p>
            )
          ) : (
            <p className="mt-1 text-xs text-amber-800">Không kiểm tra được email lúc này.</p>
          )
        ) : null}
      </div>
      
      <div className="relative">
        <input
          id="reg_password"
          name="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-8 pl-5 pr-14 text-lg font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/10"
        />
        <label
          htmlFor="reg_password"
          className="pointer-events-none absolute left-5 top-6 origin-[0] -translate-y-4 scale-75 transform text-base font-bold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-medium peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
        >
          Mật khẩu (Tối thiểu 8 ký tự)
        </label>
        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[24px] text-slate-400 dark:text-slate-500 transition-colors peer-focus:text-blue-600 dark:peer-focus:text-blue-400">
          lock
        </span>
        <p className="absolute right-2 -bottom-6 text-xs font-bold text-blue-600 dark:text-blue-400">Bảo mật: {pwd.label}</p>
      </div>
      <div className="relative mt-4">
        <input
          id="reg_confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder=" "
          className="peer w-full rounded-[1.25rem] border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 pb-4 pt-8 pl-5 pr-14 text-lg font-medium text-slate-900 dark:text-white outline-none transition-all focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-600/10"
        />
        <label
          htmlFor="reg_confirmPassword"
          className="pointer-events-none absolute left-5 top-6 origin-[0] -translate-y-4 scale-75 transform text-base font-bold text-slate-500 dark:text-slate-400 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:font-medium peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:font-bold peer-focus:text-blue-600 dark:peer-focus:text-blue-400"
        >
          Nhập lại mật khẩu
        </label>
        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[24px] text-slate-400 dark:text-slate-500 transition-colors peer-focus:text-blue-600 dark:peer-focus:text-blue-400">
          lock_reset
        </span>
        {confirmMismatch && <p className="mt-1 text-xs text-rose-700">Mật khẩu xác nhận không khớp.</p>}
      </div>
      <button
        type="submit"
        disabled={!canSubmit || isPending}
        className="group relative flex w-full items-center justify-center gap-3 mt-10 overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-700 py-5 text-lg font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-blue-600/50 hover:shadow-2xl disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
      >
        <span className="relative z-10 uppercase tracking-wider">{isPending ? "Đang xử lý..." : "Tạo tài khoản & Nhận OTP"}</span>
        <span className="material-symbols-outlined relative z-10 text-[24px] font-bold transition-transform group-hover:translate-x-2">
          arrow_forward
        </span>
        <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </form>
  );
}
