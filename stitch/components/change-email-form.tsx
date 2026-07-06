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
          setMessage(ok ? "OTP đã được gửi về Gmail hiện tại" : "Không gửi được OTP ban đầu");
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
      setMessage("Vui lòng nhập đủ OTP Gmail hiện tại");
      return;
    }

    setLoading(true);
    try {
      const ok = await verifyEmailOtp(userId, currentEmail, oldOtpCode, accessToken);
      if (!ok) {
        setMessage("OTP hiện tại không đúng hoặc đã bị huỷ. Vui lòng gửi lại.");
        setOldOtp(Array(8).fill("")); // Clear OTP after 1 failed attempt
        return;
      }
      setStep("newEmail");
      setMessage("Xác thực thành công. Vui lòng nhập Gmail mới.");
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
        setEmailError("Gmail không hợp lệ.");
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
    // Rely on auto-check useEffect instead, but keep this to trigger immediately on blur
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
      setMessage("Vui lòng nhập Gmail mới");
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
        setMessage("Không gửi được OTP");
        return;
      }
      setConfirmedNewEmail(email.trim().toLowerCase());
      setStep("newOtp");
      setCooldown(60);
      setMessage(`OTP đã được gửi tới ${email.trim().toLowerCase()}`);
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
      setMessage("Vui lòng nhập đủ 8 số OTP");
      return;
    }

    setLoading(true);
    try {
      const ok = await confirmEmailChange(userId, confirmedNewEmail || email, newOtpCode, accessToken);
      if (!ok) {
        setMessage("OTP mới không đúng hoặc đã bị huỷ. Vui lòng gửi lại.");
        setNewOtp(Array(8).fill("")); // Clear OTP after 1 failed attempt
        return;
      }

      setMessage("Đổi Gmail thành công");
      onSuccess?.((confirmedNewEmail || email).trim());
    } catch {
      setMessage("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Security
          </p>

          <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white sm:text-[28px]">
            Thay đổi Gmail
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Nhập 8 số OTP, bạn có thể dán cả mã vào ô đầu tiên.
          </p>
        </div>
      </div>

      {step === "oldOtp" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nhập OTP gửi tới Gmail hiện tại
          </p>

          <div className="flex flex-wrap gap-1 sm:gap-2 justify-between" aria-label="OTP Gmail hiện tại">
            {oldOtp.map((item, index) => (
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
                className="h-12 w-9 sm:h-14 sm:w-12 flex-1 max-w-[3rem] rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-center text-xl font-black text-blue-600 dark:text-blue-400 shadow-sm outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={loading} onClick={handleVerifyOldOtp} className="rounded-2xl bg-blue-600 dark:bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20">
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </button>
            <button type="button" disabled={loading} onClick={handleResendOldOtp} className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-transparent px-5 py-3 font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
              Gửi lại OTP
            </button>
          </div>
        </div>
      )}

      {step === "newEmail" && (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-blue-900 dark:text-blue-400">
              Gmail mới
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              placeholder="example@gmail.com"
              className={`w-full rounded-2xl border-2 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white outline-none transition-colors ${
                emailError ? "border-red-500 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500"
              }`}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={loading} onClick={handleSendOtp} className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20">
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </div>
        </div>
      )}

      {step === "newOtp" && (
        <div className="space-y-5">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Nhập OTP gửi tới:
            <strong className="text-slate-900 dark:text-white"> {confirmedNewEmail || email}</strong>
          </p>

          <div className="flex flex-wrap gap-1 sm:gap-2 justify-between" aria-label="OTP Gmail mới">
            {newOtp.map((item, index) => (
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
                className="h-12 w-9 sm:h-14 sm:w-12 flex-1 max-w-[3rem] rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-center text-xl font-black text-blue-600 dark:text-blue-400 shadow-sm outline-none transition-all focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={loading} onClick={handleVerify} className="rounded-2xl bg-blue-600 dark:bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-500/20">
              {loading ? "Đang xác nhận..." : "Xác nhận đổi Gmail"}
            </button>
            <button type="button" disabled={loading || cooldown > 0} onClick={handleResendNewOtp} className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-transparent px-5 py-3 font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
              {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại OTP"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {message}
        </p>
      )}
    </div>
  );
}