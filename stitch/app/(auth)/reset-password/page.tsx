import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { resetPasswordByToken } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

export const metadata: Metadata = {
  title: "Cập Nhật Mật Khẩu Mới",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; error?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const token = String(sp?.token ?? "").trim();
  const hasError = String(sp?.error ?? "").trim() === "1";

  async function resetAction(formData: FormData) {
    "use server";
    const formToken = String(formData.get("token") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();
    if (!formToken || newPassword.length < 8 || newPassword !== confirmPassword) {
      redirect(`/reset-password?token=${encodeURIComponent(formToken)}&error=1`);
    }
    try {
      await resetPasswordByToken(formToken, newPassword);
      redirect("/login?reset=1");
    } catch (e) {
      unstable_rethrow(e);
      redirect(`/reset-password?token=${encodeURIComponent(formToken)}&error=1`);
    }
  }

  if (!token) {
    return (
      <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
        <FloatingNotice message="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." variant="error" />
        
        <div className="relative z-10 w-full max-w-[520px] rounded-[2.5rem] bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-12 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/20 text-red-400 border border-red-500/30">
            <span className="material-symbols-outlined text-[40px]">link_off</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Liên Kết Không Hợp Lệ</h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              Đường dẫn khôi phục mật khẩu này đã hết thời gian hiệu lực hoặc không chính xác.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.01]"
          >
            Gửi lại yêu cầu quên mật khẩu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
      {hasError ? (
        <FloatingNotice message="Không thể đặt lại mật khẩu. Token có thể hết hạn hoặc mật khẩu chưa hợp lệ." variant="error" />
      ) : null}
      
      {/* Background Animated Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-[20%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-600/25 to-cyan-500/20 blur-[130px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute -bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-600/25 to-purple-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[540px] rounded-[2.5rem] bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-12 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header Icon */}
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 text-white shadow-xl shadow-indigo-500/20 mb-4">
            <span className="material-symbols-outlined text-[40px] font-black">password</span>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-400 block mb-1">Thiết Lập Mật Khẩu Mới</span>
          <h1 className="text-3xl font-black text-white tracking-tight">Cập Nhật Mật Khẩu</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            Vui lòng nhập mật khẩu mới bảo mật cho tài khoản của bạn (tối thiểu 8 ký tự).
          </p>
        </div>

        {/* Form */}
        <form action={resetAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-xs font-bold text-slate-300 uppercase tracking-wider block ml-1">
              Mật Khẩu Mới
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                placeholder="Ít nhất 8 ký tự"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 py-3.5 pl-14 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-300 uppercase tracking-wider block ml-1">
              Nhập Lại Mật Khẩu Mới
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
                <span className="material-symbols-outlined text-[20px]">lock_reset</span>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full rounded-2xl bg-slate-950/80 border border-slate-700/80 py-3.5 pl-14 pr-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-4 font-black text-sm text-white shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.01] hover:shadow-indigo-500/40 active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
          >
            <span className="uppercase tracking-wider">Lưu Mật Khẩu Mới</span>
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
              save
            </span>
          </button>
        </form>

        {/* Footer Redirect Link */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Hủy và quay lại trang Đăng Nhập
          </Link>
        </div>

      </div>
    </div>
  );
}
