"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  requestEmailOtp,
  resendEmailOtp,
  verifyEmailOtp,
  confirmEmailChange,
  checkEmailExists,
} from "@/lib/profile-api";

type Props = {
  userId: number;
  accessToken: string;
  currentEmail: string;
  onSuccess?: (newEmail: string) => void;
};

export function ChangeEmailForm({
  userId,
  accessToken,
  currentEmail,
  onSuccess,
}: Props) {
  const [email, setEmail] = useState("");
  const [confirmedNewEmail, setConfirmedNewEmail] = useState("");

  const [oldOtp, setOldOtp] = useState<string[]>(Array(8).fill(""));
  const [newOtp, setNewOtp] = useState<string[]>(Array(8).fill(""));

  const [step, setStep] = useState<"oldOtp" | "newEmail" | "newOtp">("oldOtp");

  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const sentInitialOtpRef = useRef(false);

  const oldOtpCode = useMemo(() => oldOtp.join(""), [oldOtp]);
  const newOtpCode = useMemo(() => newOtp.join(""), [newOtp]);
  const oldOtpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const newOtpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (sentInitialOtpRef.current) return;
    sentInitialOtpRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const ok = await requestEmailOtp(userId, currentEmail, accessToken, currentEmail);
        if (!cancelled) {
          setMessage(ok ? "Mã OTP đã được gửi về Gmail hiện tại của bạn." : "Không gửi được OTP ban đầu");
        }
      } catch {
        if (!cancelled) {
          setMessage("Không gửi được OTP ban đầu");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken, currentEmail, userId]);

  function handleOtpInput(
    rawValue: string,
    index: number,
    refs: React.MutableRefObject<Array<HTMLInputElement | null>>,
    value: string[],
    setValue: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    const digits = rawValue.replace(/\D/g, "");
    if (!digits) {
      const next = [...value];
      next[index] = "";
      setValue(next);
      return;
    }

    const next = [...value];
    if (digits.length > 1) {
      const chars = digits.slice(0, 8 - index).split("");
      chars.forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      setValue(next);
      requestAnimationFrame(() => refs.current[Math.min(index + chars.length, 7)]?.focus());
      return;
    }

    next[index] = digits.slice(-1);
    setValue(next);
    if (index < 7) {
      requestAnimationFrame(() => refs.current[index + 1]?.focus());
    }
  }

  function handleOldOtpChange(value: string, index: number) {
    handleOtpInput(value, index, oldOtpRefs, oldOtp, setOldOtp);
  }

  function handleNewOtpChange(value: string, index: number) {
    handleOtpInput(value, index, newOtpRefs, newOtp, setNewOtp);
  }

  useEffect(() => {
    const isOldOtpComplete = oldOtp.every((digit) => digit !== "");
    if (isOldOtpComplete && oldOtp.join("").length === 8 && step === "oldOtp") {
      handleVerifyOldOtp();
    }
  }, [oldOtp, step]);

  useEffect(() => {
    const isNewOtpComplete = newOtp.every((digit) => digit !== "");
    if (isNewOtpComplete && newOtp.join("").length === 8 && step === "newOtp") {
      handleVerify();
    }
  }, [newOtp, step]);

  function handleOtpKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    refs: React.MutableRefObject<Array<HTMLInputElement | null>>,
    value: string[],
    setValue: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        const next = [...value];
        next[index] = "";
        setValue(next);
        return;
      }
      if (index > 0) {
        refs.current[index - 1]?.focus();
        const next = [...value];
        next[index - 1] = "";
        setValue(next);
      }
    }
    if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 7) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePasteOtp(
    event: React.ClipboardEvent<HTMLInputElement>,
    refs: React.MutableRefObject<Array<HTMLInputElement | null>>,
    value: string[],
    setValue: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;
    const next = [...value];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setValue(next);
    requestAnimationFrame(() => refs.current[Math.min(pasted.length, 7)]?.focus());
  }

  async function handleVerifyOldOtp() {
    if (oldOtpCode.length !== 8) {
      setMessage("Vui lòng nhập đủ 8 chữ số OTP Gmail hiện tại");
      return;
    }

    setLoading(true);
    try {
      const ok = await verifyEmailOtp(userId, currentEmail, oldOtpCode, accessToken);
      if (!ok) {
        setMessage("Mã OTP không hợp lệ hoặc đã hết hạn.");
        setOldOtp(Array(8).fill(""));
        return;
      }
      setStep("newEmail");
      setMessage("Xác thực Gmail cũ thành công. Vui lòng nhập Gmail mới.");
    } catch {
      setMessage("Không thể xác thực OTP hiện tại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (step !== "newEmail") return;
    const timer = setTimeout(async () => {
      if (!email.trim()) {
        setEmailError("");
        return;
      }
      if (!email.includes("@")) {
        setEmailError("Địa chỉ Gmail không hợp lệ.");
        return;
      }
      if (email.trim() === currentEmail) {
        setEmailError("Gmail mới không được trùng với Gmail hiện tại.");
        return;
      }
      try {
        const emailExists = await checkEmailExists(email.trim(), accessToken);
        if (emailExists) {
          setEmailError("Gmail này đã được sử dụng bởi một tài khoản khác.");
        } else {
          setEmailError("");
        }
      } catch {
        setEmailError("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [email, currentEmail, accessToken, step]);

  async function handleEmailBlur() {
    if (!email.trim() || !email.includes("@") || email.trim() === currentEmail) return;
    try {
      const emailExists = await checkEmailExists(email.trim(), accessToken);
      if (emailExists) setEmailError("Gmail này đã được sử dụng bởi một tài khoản khác.");
      else setEmailError("");
    } catch {
      setEmailError("");
    }
  }

  async function handleSendOtp() {
    if (loading) return;
    if (!email.trim()) {
      setMessage("Vui lòng nhập địa chỉ Gmail mới");
      return;
    }

    setLoading(true);
    try {
      if (emailError) {
        setMessage(emailError);
        setLoading(false);
        return;
      }
      if (email.trim() === currentEmail) {
        setMessage("Gmail mới không được trùng với Gmail hiện tại.");
        return;
      }
      
      const emailExists = await checkEmailExists(email.trim(), accessToken);
      if (emailExists) {
        setMessage("Gmail này đã được sử dụng bởi một tài khoản khác.");
        return;
      }

      const ok = await requestEmailOtp(userId, email.trim(), accessToken, currentEmail);
      if (!ok) {
        setMessage("Không gửi được OTP tới Gmail mới");
        return;
      }
      setConfirmedNewEmail(email.trim().toLowerCase());
      setStep("newOtp");
      setCooldown(60);
      setMessage(`Đã gửi OTP 8 chữ số tới ${email.trim().toLowerCase()}`);
    } catch {
      setMessage("Không gửi được OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOldOtp() {
    if (loading) return;
    setLoading(true);
    try {
      const ok = await resendEmailOtp(userId, accessToken, currentEmail);
      if (ok) {
        setMessage("Đã gửi lại OTP về Gmail hiện tại");
      } else {
        setMessage("Không gửi lại được OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendNewOtp() {
    if (loading || cooldown > 0 || !confirmedNewEmail) return;
    setLoading(true);
    try {
      const ok = await requestEmailOtp(userId, confirmedNewEmail, accessToken, currentEmail);
      if (ok) {
        setCooldown(60);
        setMessage("Đã gửi lại OTP về Gmail mới");
      } else {
        setMessage("Không gửi lại được OTP");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (newOtpCode.length !== 8) {
      setMessage("Vui lòng nhập đủ 8 chữ số OTP");
      return;
    }

    setLoading(true);
    try {
      const ok = await confirmEmailChange(userId, confirmedNewEmail || email, newOtpCode, accessToken);
      if (!ok) {
        setMessage("Mã OTP mới không đúng hoặc đã hết hạn.");
        setNewOtp(Array(8).fill(""));
        return;
      }

      setMessage("Đổi Gmail thành công!");
      onSuccess?.((confirmedNewEmail || email).trim());
    } catch {
      setMessage("Có lỗi xảy ra khi xác thực Gmail mới");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Steps Indicator */}
      <div className="grid grid-cols-3 gap-2 rounded-xl border border-white/10 bg-zinc-900/80 p-2 text-xs font-bold text-center">
        <div className={`py-2 rounded-lg transition-all ${step === "oldOtp" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400 opacity-60"}`}>
          1. OTP Gmail cũ
        </div>
        <div className={`py-2 rounded-lg transition-all ${step === "newEmail" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400 opacity-60"}`}>
          2. Gmail mới
        </div>
        <div className={`py-2 rounded-lg transition-all ${step === "newOtp" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400 opacity-60"}`}>
          3. OTP Gmail mới
        </div>
      </div>

      {step === "oldOtp" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 block flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-cyan-400 text-sm">mark_email_unread</span>
              <span>Nhập mã OTP 8 chữ số (Đã gửi tới Gmail hiện tại)</span>
            </label>

            <div className="flex w-full flex-nowrap items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-1" aria-label="OTP Gmail hiện tại">
              {oldOtp.map((item, index) => {
                const hasVal = Boolean(item);
                return (
                  <input
                    key={index}
                    ref={(el) => { oldOtpRefs.current[index] = el; }}
                    id={`old-otp-${index}`}
                    value={item}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    onChange={(e) => handleOldOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index, oldOtpRefs, oldOtp, setOldOtp)}
                    onPaste={(e) => handlePasteOtp(e, oldOtpRefs, oldOtp, setOldOtp)}
                    className={`h-12 w-9 sm:h-14 sm:w-11 flex-none rounded-xl border text-center font-mono text-xl sm:text-2xl font-black outline-none transition-all shadow-inner ${
                      hasVal
                        ? "border-cyan-400/80 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "border-zinc-700/80 bg-zinc-900/90 text-zinc-100 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              disabled={loading || oldOtpCode.length !== 8}
              onClick={handleVerifyOldOtp}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
            >
              <span>{loading ? "Đang xác thực..." : "Xác nhận mã OTP"}</span>
              <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
            
            <button
              type="button"
              disabled={loading}
              onClick={handleResendOldOtp}
              className="rounded-xl px-4 py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all hover:underline disabled:opacity-50 text-center"
            >
              Gửi lại OTP tới Gmail hiện tại
            </button>
          </div>
        </div>
      )}

      {step === "newEmail" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Địa chỉ Gmail mới
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              placeholder="nhap-gmail-moi@gmail.com"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-100 outline-none transition-all shadow-inner ${
                emailError
                  ? "border-red-500/80 bg-red-950/20 text-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                  : "border-zinc-700/80 bg-zinc-900/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              }`}
            />
            {emailError && (
              <p className="mt-1.5 text-xs font-semibold text-red-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">error</span>
                {emailError}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={loading || !email.trim() || Boolean(emailError)}
            onClick={handleSendOtp}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
          >
            <span>{loading ? "Đang gửi OTP..." : "Gửi OTP xác thực Gmail mới"}</span>
            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
              send
            </span>
          </button>
        </div>
      )}

      {step === "newOtp" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 block flex items-center space-x-1.5">
              <span className="material-symbols-outlined text-cyan-400 text-sm">mark_email_read</span>
              <span>Mã OTP 8 số gửi tới <strong className="text-cyan-300 font-mono">{confirmedNewEmail || email}</strong></span>
            </label>

            <div className="flex w-full flex-nowrap items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-1" aria-label="OTP Gmail mới">
              {newOtp.map((item, index) => {
                const hasVal = Boolean(item);
                return (
                  <input
                    key={index}
                    ref={(el) => { newOtpRefs.current[index] = el; }}
                    id={`new-otp-${index}`}
                    value={item}
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    onChange={(e) => handleNewOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index, newOtpRefs, newOtp, setNewOtp)}
                    onPaste={(e) => handlePasteOtp(e, newOtpRefs, newOtp, setNewOtp)}
                    className={`h-12 w-9 sm:h-14 sm:w-11 flex-none rounded-xl border text-center font-mono text-xl sm:text-2xl font-black outline-none transition-all shadow-inner ${
                      hasVal
                        ? "border-cyan-400/80 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                        : "border-zinc-700/80 bg-zinc-900/90 text-zinc-100 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              disabled={loading || newOtpCode.length !== 8}
              onClick={handleVerify}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
            >
              <span>{loading ? "Đang xác nhận..." : "Hoàn tất xác thực đổi Gmail"}</span>
              <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                check_circle
              </span>
            </button>

            <button
              type="button"
              disabled={loading || cooldown > 0}
              onClick={handleResendNewOtp}
              className="rounded-xl px-4 py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-all hover:underline disabled:opacity-50 text-center"
            >
              {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : "Gửi lại OTP tới Gmail mới"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-3 text-xs font-bold text-cyan-300">
          <span className="material-symbols-outlined text-base">info</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
