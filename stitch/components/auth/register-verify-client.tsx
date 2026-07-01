"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type Props = {
  identity: string;
  verified?: boolean;
};

function OtpBoxes({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
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
    if (event.key === "Backspace" && !value[index] && index > 0) {
      const next = [...value];
      next[index - 1] = "";
      onChange(next);
      focusAt(index - 1);
    }
    if (event.key === "ArrowLeft" && index > 0) {
      focusAt(index - 1);
    }
    if (event.key === "ArrowRight" && index < 7) {
      focusAt(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;

    const next = [...value];
    for (let i = 0; i < 8; i++) {
      if (pasted[i]) next[i] = pasted[i];
    }
    onChange(next);
    focusAt(Math.min(pasted.length, 7));
  };

  return (
    <div className="flex justify-center gap-1 sm:gap-2 md:gap-3 w-full" aria-label="OTP 8 số">
      {Array.from({ length: 8 }).map((_, idx) => (
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
          value={value[idx] ?? ""}
          onChange={(e) => updateOtp(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          aria-label={`Số OTP thứ ${idx + 1}`}
          className="h-12 w-10 sm:h-14 sm:w-12 md:h-16 md:w-14 rounded-xl sm:rounded-2xl border-2 border-slate-300 bg-slate-50/50 text-center text-xl sm:text-2xl font-black text-blue-700 outline-none transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 shadow-sm px-0"
        />
      ))}
    </div>
  );
}

export function RegisterVerifyClient({ identity, verified }: Props) {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array.from({ length: 8 }, () => ""));
  const [cooldown, setCooldown] = useState(0);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "error">("idle");

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const canSubmit = otpValue.length === 8 && otp.every((x) => x.length === 1) && identity.trim().length > 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !identity.trim()) return;
    try {
      setResendState("sending");
      const res = await fetch("/api/registration/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity }),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("RESEND_FAILED");
      setResendState("sent");
      setCooldown(60);
    } catch {
      setResendState("error");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || submitState === "submitting") return;

    try {
      setSubmitState("submitting");
      const res = await fetch(
        `/api/accounts/registration/verify?identity=${encodeURIComponent(identity)}&otp=${encodeURIComponent(otpValue)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error("VERIFY_FAILED");
      }

      router.push("/register/success");
    } catch {
      setSubmitState("error");
    }
  };

  if (verified) return null;

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input type="hidden" name="identity" value={identity} />
        <input type="hidden" name="otp" value={otpValue} />
        <div>
          <label className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Mã OTP (8 Số)</label>
          <div className="flex justify-center">
            <OtpBoxes value={otp} onChange={setOtp} />
          </div>
          <p className="mt-4 text-center text-sm font-medium text-slate-500">
            Mẹo: Bạn có thể sao chép và dán nhanh 8 số OTP vào đây.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={!canSubmit || submitState === "submitting"}
          className="group relative flex w-full items-center justify-center gap-3 mt-8 overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-blue-600 to-indigo-700 py-5 text-lg font-black text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-blue-600/50 hover:shadow-2xl disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
        >
          <span className="relative z-10 uppercase tracking-wider">{submitState === "submitting" ? "Đang xác thực..." : "Xác thực & Kích hoạt"}</span>
          <span className="material-symbols-outlined relative z-10 text-[24px] font-bold transition-transform group-hover:translate-x-2">
            {submitState === "submitting" ? "sync" : "verified"}
          </span>
          <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
        {submitState === "error" ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Xác thực chưa thành công. Bạn hãy kiểm tra lại mã OTP hoặc thử gửi lại mã nhé.
          </p>
        ) : null}
      </form>

      <div className="mt-6 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || resendState === "sending"}
          className="rounded-[1rem] border-2 border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-200 disabled:hover:text-slate-700"
        >
          {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : resendState === "sending" ? "Đang gửi..." : "Tôi chưa nhận được mã (Gửi lại)"}
        </button>
        <span className="text-sm font-semibold text-slate-500">
          {resendState === "sent" ? <span className="text-emerald-600">Đã gửi lại mã OTP mới. Vui lòng kiểm tra hộp thư.</span> : resendState === "error" ? <span className="text-rose-600">Gửi lại mã thất bại. Vui lòng thử lại sau.</span> : ""}
        </span>
      </div>
    </>
  );
}
