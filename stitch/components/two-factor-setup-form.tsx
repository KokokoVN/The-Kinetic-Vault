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
      setError("Vui lòng nhập đủ 6 số.");
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

  if (success) {
    return (
      <div className="flex flex-col items-center p-6 text-center">
        <span className="material-symbols-outlined text-6xl text-emerald-500 mb-4">check_circle</span>
        <h3 className="text-xl font-bold text-slate-900">{success}</h3>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">
        {is2faEnabled ? "Tắt Xác thực 2 bước (2FA)" : "Bật Xác thực 2 bước (2FA)"}
      </h3>
      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

      {!is2faEnabled ? (
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Sử dụng ứng dụng Google Authenticator hoặc Authy để quét mã QR bên dưới.
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : qrCodeUri ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <QRCodeSVG value={qrCodeUri} size={200} />
              </div>
              <p className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg">
                Mã bí mật: {secret}
              </p>
              <div className="w-full mt-4">
                <input
                  type="text"
                  placeholder="Nhập 6 số từ ứng dụng..."
                  className="w-full rounded-xl border-2 border-slate-200 p-3 text-center text-xl tracking-widest outline-none focus:border-blue-500 font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>
              <button
                onClick={handleEnable}
                disabled={loading || code.length < 6}
                className="w-full rounded-xl bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                Xác nhận Bật 2FA
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Để tắt Xác thực 2 bước, vui lòng nhập mật khẩu hiện tại của bạn.
          </p>
          <input
            type="password"
            placeholder="Mật khẩu hiện tại..."
            className="w-full rounded-xl border-2 border-slate-200 p-3 outline-none focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleDisable}
            disabled={loading || !password}
            className="w-full rounded-xl bg-red-600 py-3 text-white font-bold hover:bg-red-700 disabled:opacity-50"
          >
            Xác nhận Tắt 2FA
          </button>
        </div>
      )}
    </div>
  );
}
