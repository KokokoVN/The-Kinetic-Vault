import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { requestForgotPassword } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

export const metadata: Metadata = {
  title: "Khôi Phục Mật Khẩu",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ sent?: string; error?: string }>;
}) {
  async function forgotAction(formData: FormData) {
    "use server";
    const identity = String(formData.get("identity") ?? "").trim();
    if (!identity) {
      redirect("/forgot-password?error=1");
    }
    try {
      await requestForgotPassword(identity);
      redirect("/forgot-password?sent=1");
    } catch (e) {
      unstable_rethrow(e);
      const message = e instanceof Error ? e.message : "FORGOT_UNKNOWN";
      if (message.startsWith("FORGOT_400")) {
        redirect("/forgot-password?error=1");
      }
      redirect("/forgot-password?error=1");
    }
  }

  const sp = searchParams ? await searchParams : undefined;
  const sent = String(sp?.sent ?? "").trim() === "1";
  const hasError = String(sp?.error ?? "").trim() === "1";
  const noticeMessage = sent
    ? "Yêu cầu đã được ghi nhận. Vui lòng kiểm tra Gmail (cả mục Spam)."
    : hasError
      ? "Không gửi được yêu cầu lúc này. Vui lòng thử lại."
      : "";
  const noticeVariant: "success" | "error" = sent ? "success" : "error";

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}

      {/* Background Animated Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-600/25 to-blue-600/20 blur-[130px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute -bottom-[20%] right-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-indigo-600/25 to-purple-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[540px] rounded-[2.5rem] bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-12 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header Icon */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/20 mb-5">
            <span className="material-symbols-outlined text-[40px] font-black">lock_reset</span>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-400 block mb-1">Khôi Phục Mật Khẩu</span>
          <h1 className="text-3xl font-black text-white tracking-tight">Quên Mật Khẩu?</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm leading-relaxed font-medium">
            Nhập Username hoặc Email của bạn. Hệ thống sẽ kiểm tra và gửi đường dẫn khôi phục qua Gmail.
          </p>
        </div>

        {/* Sent Success State */}
        {sent ? (
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/40 p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h3 className="text-base font-bold text-white">Đã Gửi Yêu Cầu Khôi Phục</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vui lòng kiểm tra hộp thư Gmail (bao gồm cả mục Spam/Thư rác). Nhấp vào liên kết trong email để tiến hành đặt mật khẩu mới.
            </p>
            <div className="pt-2">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-bold text-white transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Quay lại trang Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          /* Form Request State */
          <form action={forgotAction} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="identity" className="text-xs font-bold text-slate-300 uppercase tracking-wider block ml-1">
                Tài Khoản Cần Khôi Phục
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <span className="material-symbols-outlined text-[20px]">account_circle</span>
                </div>
                <input
                  id="identity"
                  name="identity"
                  required
                  placeholder="Nhập Username, Email hoặc Số điện thoại"
                  className="w-full rounded-2xl bg-slate-950/70 border border-slate-700/80 py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-4 font-black text-sm text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] hover:shadow-cyan-500/40 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span className="uppercase tracking-wider">Gửi Email Khôi Phục</span>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                send
              </span>
            </button>
          </form>
        )}

        {/* Footer Redirect Link */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Quay lại trang Đăng Nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
