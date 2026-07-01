"use client";

import { useMemo, useState } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
};

function isStrongPassword(value: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/.test(value);
}

export function PasswordChangeForm({ action, verifyPassword }: Props) {
  const [step, setStep] = useState<"current" | "new">("current");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const strong = useMemo(() => isStrongPassword(newPassword), [newPassword]);
  const canSubmit = currentPassword.trim().length > 0 && newPassword.trim().length > 0 && confirmPassword.trim().length > 0;

  async function handleVerifyCurrentPassword() {
    if (!currentPassword.trim()) {
      setMessage("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const isCorrect = await verifyPassword(currentPassword);
      if (!isCorrect) {
        setMessage("Mật khẩu hiện tại không đúng");
        return;
      }
      setStep("new");
      setMessage("Mật khẩu hiện tại đã được xác nhận. Vui lòng nhập mật khẩu mới.");
    } catch {
      setMessage("Có lỗi xảy ra khi kiểm tra mật khẩu");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setMessage("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!strong) {
      setMessage("Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt, ví dụ: Aa@123");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.set("currentPassword", currentPassword);
      formData.set("newPassword", newPassword);
      await action(formData);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("current");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Security</p>
        <h2 className="mt-2 text-xl font-black text-blue-950">Thay đổi mật khẩu</h2>
      </div>

      {step === "current" ? (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-blue-900">Mật khẩu hiện tại</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleVerifyCurrentPassword}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang kiểm tra..." : "Xác nhận mật khẩu hiện tại"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-blue-900">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ví dụ: Aa@123"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-blue-900">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <p className="text-xs text-slate-500">Mật khẩu nên có chữ hoa, chữ thường, số và ký tự đặc biệt. Gợi ý: <strong>Aa@123</strong></p>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
          </button>
        </div>
      )}

      {message && <p className="text-sm font-bold text-slate-700">{message}</p>}
    </form>
  );
}
