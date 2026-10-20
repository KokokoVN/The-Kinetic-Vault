"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { FloatingNotice } from "@/components/floating-notice";

type Props = {
  identity: string;
  verified?: boolean;
};

const OTP_EXPIRATION_SECONDS = 300; // 5 phút hiệu lực

function OtpBoxes({
  value,
  onChange,
  disabled,
  isError,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  isError?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const focusAt = (index: number) => {
    requestAnimationFrame(() => refs.current[index]?.focus());
  };

  const updateOtp = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const next = [...value];

    if (digits.length > 1) {
      const chars = digits.slice(0, 8 - index).split("");
      chars.forEach((ch, offset) => {
        next[index + offset] = ch;
      });
      onChange(next);
      focusAt(Math.min(index + chars.length, 7));
      return;
    }

    next[index] = digits.slice(-1);
    onChange(next);
    if (digits && index < 7) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (!value[index] && index > 0) {
        const next = [...value];
        next[index - 1] = "";
        onChange(next);
        focusAt(index - 1);
      } else {
        const next = [...value];
        next[index] = "";
        onChange(next);
      }
    } else if (event.key === "Delete") {
      const next = [...value];
      next[index] = "";
      onChange(next);
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    } else if (event.key === "ArrowRight" && index < 7) {
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const rawPasted = event.clipboardData.getData("text");
    // Lọc tất cả số từ văn bản dán (hỗ trợ cả các format như "OTP: 1234 5678" hay "123-456-78")
    const pasted = rawPasted.replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;

    const next = [...value];
    for (let i = 0; i < 8; i++) {
      if (pasted[i]) next[i] = pasted[i];
    }
    onChange(next);
    focusAt(Math.min(pasted.length, 7));
  };

  return (
    <div
      className={`flex justify-center gap-1.5 sm:gap-2 md:gap-2.5 w-full transition-transform ${
        isError ? "animate-[shake_0.4s_ease-in-out]" : ""
      }`}
      aria-label="OTP 8 số"
    >
      {Array.from({ length: 8 }).map((_, idx) => {
        const isFilled = Boolean(value[idx]);
        return (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            name={`otp${idx + 1}`}
            type="text"
            inputMode="numeric"
            autoComplete={idx === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            value={value[idx] ?? ""}
            onChange={(e) => updateOtp(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            aria-label={`Số OTP thứ ${idx + 1}`}
            className={`h-12 w-9 sm:h-14 sm:w-11 md:h-16 md:w-12 rounded-xl sm:rounded-2xl border-2 text-center text-xl sm:text-2xl font-black outline-none transition-all px-0 ${
              isError
                ? "border-rose-500/80 bg-rose-950/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : isFilled
                ? "border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.25)] scale-[1.02]"
                : "border-slate-800 bg-slate-950/90 text-cyan-300 focus:border-cyan-400 focus:bg-slate-950 focus:ring-4 focus:ring-cyan-500/20 focus:scale-105 shadow-lg shadow-cyan-950/40"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          />
        );
      })}
    </div>
  );
}

export function RegisterVerifyClient({ identity, verified }: Props) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array.from({ length: 8 }, () => ""));
  const [cooldown, setCooldown] = useState(0);
  const [expireSeconds, setExpireSeconds] = useState(OTP_EXPIRATION_SECONDS);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendMessage, setResendMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const isOtpComplete = otpValue.length === 8 && otp.every((x) => x.length === 1);
  const canSubmit = isOtpComplete && identity.trim().length > 0 && expireSeconds > 0;

  // Đếm ngược cooldown gửi lại mã OTP (1 giây 1 nhịp)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  // Đếm ngược thời hạn hiệu lực của mã OTP (5 phút)
  useEffect(() => {
    if (expireSeconds <= 0) return;
    const timer = window.setTimeout(() => setExpireSeconds((val) => Math.max(0, val - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [expireSeconds]);

  const handleResend = async () => {
    if (cooldown > 0 || !identity.trim()) return;
    try {
      setResendState("sending");
      setSubmitState("idle");
      setErrorMessage("");
      const res = await fetch("/api/registration/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity }),
        cache: "no-store",
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        retryAfterSeconds?: number;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 429 && data.retryAfterSeconds) {
          setCooldown(data.retryAfterSeconds);
          setResendMessage(`Vui lòng chờ ${data.retryAfterSeconds} giây trước khi gửi lại.`);
          setResendState("error");
          return;
        }
        throw new Error(data.message || "RESEND_FAILED");
      }

      setResendState("sent");
      setResendMessage("Đã gửi mã OTP mới! Vui lòng kiểm tra hộp thư Gmail.");
      setCooldown(60);
      setExpireSeconds(OTP_EXPIRATION_SECONDS); // Làm mới thời hạn 5 phút
      setOtp(Array.from({ length: 8 }, () => "")); // Xóa các ô để nhập mã mới
    } catch {
      setResendState("error");
      setResendMessage("Không thể gửi lại mã OTP. Vui lòng thử lại sau.");
    }
  };

  const executeVerify = useCallback(async (codeToVerify: string) => {
    if (codeToVerify.length !== 8 || !identity.trim()) return;

    try {
      setSubmitState("submitting");
      setErrorMessage("");

      const res = await fetch(
        `/api/accounts/registration/verify?identity=${encodeURIComponent(identity)}&otp=${encodeURIComponent(codeToVerify)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };

      if (!res.ok || data.ok === false) {
        if (data.message === "INVALID_OR_EXPIRED_TOKEN") {
          throw new Error("Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại Gmail.");
        }
        throw new Error(data.message || "Xác thực không thành công.");
      }

      router.push("/register/success");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(err instanceof Error ? err.message : "Mã OTP không đúng hoặc đã hết hạn.");
    }
  }, [identity, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitState === "submitting") return;
    await executeVerify(otpValue);
  };

  // Tự động submit sau 150ms ngay khi người dùng nhập đủ 8 số (Auto-Submit)
  const submittedOtpRef = useRef<string>("");
  useEffect(() => {
    if (isOtpComplete && canSubmit && submitState !== "submitting" && submittedOtpRef.current !== otpValue) {
      submittedOtpRef.current = otpValue;
      const timeout = setTimeout(() => {
        void executeVerify(otpValue);
      }, 150);
      return () => clearTimeout(timeout);
    }
    if (!isOtpComplete) {
      submittedOtpRef.current = "";
    }
  }, [isOtpComplete, canSubmit, submitState, otpValue, executeVerify]);

  if (verified) return null;

  // Tính toán thời gian hiển thị đếm ngược định dạng MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isExpired = expireSeconds === 0;

  return (
    <>
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>

      {/* Floating corner notice toasts */}
      {submitState === "error" && (
        <FloatingNotice
          key="verify-err"
          message={errorMessage || "Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra lại Gmail."}
          variant="error"
        />
      )}
      {resendState === "sent" && (
        <FloatingNotice
          key="resend-ok"
          message={resendMessage || "Đã gửi mã OTP mới! Vui lòng kiểm tra hộp thư Gmail."}
          variant="success"
        />
      )}
      {resendState === "error" && (
        <FloatingNotice
          key="resend-err"
          message={resendMessage || "Không thể gửi lại mã OTP. Vui lòng thử lại sau."}
          variant="error"
        />
      )}

      {/* Thanh trạng thái thời hạn OTP trực quan */}
      <div className="mb-6 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`material-symbols-outlined text-[18px] ${
                isExpired
                  ? "text-rose-400"
                  : expireSeconds < 60
                  ? "animate-pulse text-amber-400"
                  : "text-cyan-400"
              }`}
            >
              timer
            </span>
            <span className={isExpired ? "text-rose-400" : expireSeconds < 60 ? "text-amber-400" : "text-slate-300"}>
              {isExpired ? "Mã OTP đã hết hiệu lực" : "Hiệu lực mã xác nhận:"}
            </span>
          </div>

          <div
            className={`font-mono text-sm font-black px-2.5 py-0.5 rounded-lg border ${
              isExpired
                ? "border-rose-500/40 bg-rose-950/40 text-rose-300"
                : expireSeconds < 60
                ? "border-amber-500/40 bg-amber-950/40 text-amber-300 animate-pulse"
                : "border-cyan-500/30 bg-cyan-950/40 text-cyan-300"
            }`}
          >
            {formatTimer(expireSeconds)}
          </div>
        </div>

        {/* Thanh Progress bar thời gian */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className={`h-full transition-all duration-1000 ${
              isExpired
                ? "bg-rose-500 w-0"
                : expireSeconds < 60
                ? "bg-gradient-to-r from-amber-500 to-rose-500"
                : "bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"
            }`}
            style={{ width: `${(expireSeconds / OTP_EXPIRATION_SECONDS) * 100}%` }}
          />
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <input type="hidden" name="identity" value={identity} />
        <input type="hidden" name="otp" value={otpValue} />

        <div>
          <label className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 text-center">
            Mã OTP Kích Hoạt (8 Số)
          </label>
          <div className="flex justify-center">
            <OtpBoxes
              value={otp}
              onChange={(next) => {
                setOtp(next);
                if (submitState === "error") setSubmitState("idle");
              }}
              disabled={isExpired || submitState === "submitting"}
              isError={submitState === "error"}
            />
          </div>
          <div className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <span className="material-symbols-outlined text-[16px] text-cyan-400">content_paste</span>
            <span>Mẹo: Bạn có thể sao chép và dán nhanh chuỗi 8 số trực tiếp vào ô bất kỳ.</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || submitState === "submitting"}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.01] hover:shadow-blue-500/40 active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
        >
          {submitState === "submitting" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang kiểm tra mã OTP...</span>
            </>
          ) : isExpired ? (
            <span>Mã OTP đã hết hạn - Hãy gửi lại mã</span>
          ) : (
            <>
              <span className="uppercase tracking-wider">Xác Thực & Kích Hoạt Tài Khoản</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                verified
              </span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 pt-4 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendState === "sending"}
          className="rounded-xl border border-slate-700/80 bg-slate-950/60 px-5 py-2.5 text-xs font-bold text-slate-300 transition-all hover:bg-slate-900 hover:text-cyan-400 hover:border-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">
            {resendState === "sending" ? "sync" : "forward_to_inbox"}
          </span>
          {cooldown > 0
            ? `Gửi lại mã sau ${cooldown}s`
            : resendState === "sending"
            ? "Đang gửi OTP mới..."
            : "Chưa nhận được mã? Gửi lại OTP"}
        </button>
      </div>
    </>
  );
}
