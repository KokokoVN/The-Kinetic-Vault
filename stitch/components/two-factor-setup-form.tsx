"use client";

import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { generate2fa, enable2fa, disable2fa } from "@/lib/profile-api";

export function TwoFactorSetupForm({
  userId,
  accessToken,
  is2faEnabled,
  onClose,
}: {
  userId: number;
  accessToken: string;
  is2faEnabled: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const fetchCalled = useRef(false);

  useEffect(() => {
    if (!is2faEnabled && !fetchCalled.current) {
      fetchCalled.current = true;
      setLoading(true);
      generate2fa(userId, accessToken).then((res) => {
        if (res) {
          setQrCodeUri(res.qrCodeUri);
          setSecret(res.secret);
        } else {
          setError("Không thể tạo mã 2FA. Vui lòng thử lại sau.");
        }
        setLoading(false);
      });
    }
  }, [is2faEnabled, userId, accessToken]);

  const handleEnable = async () => {
    if (code.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await enable2fa(userId, code, accessToken);
    setLoading(false);
    if (ok) {
      setSuccess("Bật 2FA thành công!");
      window.dispatchEvent(new Event("profile-updated"));
      setTimeout(onClose, 2000);
    } else {
      setError("Mã xác thực không hợp lệ. Vui lòng thử lại.");
    }
  };

  const handleDisable = async () => {
    if (!password) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await disable2fa(userId, password, accessToken);
    setLoading(false);
    if (ok) {
      setSuccess("Tắt 2FA thành công!");
      window.dispatchEvent(new Event("profile-updated"));
      setTimeout(onClose, 2000);
    } else {
      setError("Mật khẩu không đúng. Vui lòng thử lại.");
    }
  };

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/40">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h3 className="text-xl font-black text-white">{success}</h3>
        <p className="text-xs text-zinc-400 mt-2">Cửa sổ sẽ tự động đóng sau giây lát...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-950/40 border border-red-500/40 p-3.5 flex items-center gap-2.5 text-xs font-bold text-red-300">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {!is2faEnabled ? (
        <div className="space-y-6">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> trên điện thoại để quét mã QR bên dưới:
          </p>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-4xl text-cyan-400 mb-3">sync</span>
              <p className="text-xs font-bold text-zinc-400">Đang khởi tạo mã QR 2FA...</p>
            </div>
          ) : qrCodeUri ? (
            <div className="flex flex-col items-center space-y-5">
              {/* White card wrapper for high-contrast QR code scanning */}
              <div className="p-4 rounded-2xl bg-white shadow-xl shadow-cyan-950/30 border-2 border-cyan-500/40">
                <QRCodeSVG value={qrCodeUri} size={180} />
              </div>

              {secret && (
                <div className="w-full flex items-center justify-between gap-3 rounded-xl border border-zinc-700/80 bg-zinc-900/90 p-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Mã bí mật (Secret Key)</span>
                    <p className="font-mono text-xs font-bold text-cyan-300 truncate">{secret}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">{copied ? "done" : "content_copy"}</span>
                    <span>{copied ? "Đã chép" : "Sao chép"}</span>
                  </button>
                </div>
              )}

              <div className="w-full space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  Nhập mã 6 chữ số từ ứng dụng
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000 000"
                  className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 py-3.5 px-4 text-center font-mono text-2xl font-black tracking-[0.3em] text-cyan-300 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>

              <button
                type="button"
                onClick={handleEnable}
                disabled={loading || code.length < 6}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:via-teal-500 hover:to-indigo-600 disabled:opacity-50 disabled:shadow-none"
              >
                <span>{loading ? "Đang bật..." : "Xác nhận & Bật 2FA"}</span>
                <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
                  shield
                </span>
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-zinc-300 leading-relaxed">
            Để tắt Bảo mật 2 lớp (2FA), vui lòng xác nhận bằng cách nhập <strong>mật khẩu hiện tại</strong> của tài khoản:
          </p>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-300">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu hiện tại..."
              className="w-full rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3.5 text-sm text-zinc-100 outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleDisable}
            disabled={loading || !password}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-rose-600 to-red-700 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-xl shadow-rose-600/20 transition-all hover:from-rose-500 hover:to-red-600 disabled:opacity-50 disabled:shadow-none"
          >
            <span>{loading ? "Đang tắt..." : "Xác nhận Tắt 2FA"}</span>
            <span className="material-symbols-outlined text-xl transition-transform group-hover:translate-x-1">
              no_encryption
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

