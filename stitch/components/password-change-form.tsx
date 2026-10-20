"use client";

import { useMemo, useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
};

function isStrongPassword(value: string) {
  // Yêu cầu mạnh hơn: 8+ ký tự, có chữ hoa, thường, số và ký tự đặc biệt.
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/.test(value);
}

export function PasswordChangeForm({ action, verifyPassword }: Props) {
  const [step, setStep] = useState<"current" | "new">("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const strong = useMemo(() => isStrongPassword(newPassword), [newPassword]);
  const canSubmit = currentPassword.trim().length > 0 && newPassword.trim().length > 0 && confirmPassword.trim().length > 0;

  async function handleVerifyCurrentPassword() {
    if (!currentPassword.trim()) {
      setIsError(true);
      setMessage("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const isCorrect = await verifyPassword(currentPassword);
      if (!isCorrect) {
        setIsError(true);
        setMessage("Mật khẩu hiện tại không đúng. Vui lòng thử lại.");
        return;
      }
      setStep("new");
      setIsError(false);
      setMessage("Mật khẩu hiện tại hợp lệ! Nhập mật khẩu mới bên dưới.");
    } catch {
      setIsError(true);
      setMessage("Có lỗi xảy ra khi kiểm tra mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setIsError(true);
      setMessage("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!strong) {
      setIsError(true);
      setMessage("Mật khẩu mới phải từ 8 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt (VD: Aa@12345)");
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const formData = new FormData();
      formData.set("currentPassword", currentPassword);
      formData.set("newPassword", newPassword);
      await action(formData);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("current");
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Thay đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/80 p-2 text-xs">
        <div className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-bold transition-all ${step === "current" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400"}`}>
          <span className="material-symbols-outlined text-base">lock</span>
          <span>1. Xác nhận MK hiện tại</span>
        </div>
        <div className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-bold transition-all ${step === "new" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-zinc-400 opacity-60"}`}>
          <span className="material-symbols-outlined text-base">password</span>
          <span>2. Tạo MK mới</span>
        </div>
      </div>

      {step === "current" ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại của bạn"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">{showCurrent ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={loading || !currentPassword.trim()}
            onClick={handleVerifyCurrentPassword}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
          >
            <span>{loading ? "Đang xác nhận..." : "Xác nhận mật khẩu"}</span>
            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ví dụ: Aa@123"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">{showNew ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">{showConfirm ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          {/* Strength Badge */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/40 p-3.5 text-xs text-cyan-300 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">verified_user</span>
            <div>
              <p className="font-bold">Quy tắc mật khẩu an toàn:</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">Mật khẩu cần ít nhất 8 ký tự gồm chữ hoa, chữ thường, số và ký tự đặc biệt (VD: <strong className="text-cyan-200">Aa@12345</strong>).</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep("current"); setMessage(""); }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-white/10"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit || !strong}
              className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-cyan-500/20 transition-all hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
            >
              <span>{loading ? "Đang cập nhật..." : "Đổi mật khẩu"}</span>
              <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                check_circle
              </span>
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-bold ${isError ? "bg-red-950/40 border border-red-500/40 text-red-300" : "bg-emerald-950/40 border border-emerald-500/40 text-emerald-300"}`}>
          <span className="material-symbols-outlined text-base">{isError ? "error" : "check_circle"}</span>
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}

