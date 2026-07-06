import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { resetPasswordByToken } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

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
      <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden relative">
        <FloatingNotice message="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn." variant="error" />
        {/* Background Orbs */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-kinetic/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-blue-400/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        </div>
        <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="relative rounded-[3rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl border border-white dark:border-slate-800 p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700 text-center">
              <span className="material-symbols-outlined text-rose-500 text-[64px] mb-4">error</span>
              <h1 className="mb-3 font-headline text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Liên kết không hợp lệ</h1>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">Vui lòng quay lại để yêu cầu gửi lại đường dẫn khôi phục mật khẩu mới.</p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-blue-600 w-full py-4 text-base font-bold text-white shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 transition-all hover:scale-[1.02] hover:bg-slate-800 dark:hover:bg-blue-700"
              >
                Gửi lại yêu cầu quên mật khẩu
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden relative">
      {hasError ? (
        <FloatingNotice message="Không thể đặt lại mật khẩu. Token có thể hết hạn hoặc mật khẩu chưa hợp lệ." variant="error" />
      ) : null}
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-kinetic/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-blue-400/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="mx-auto w-full max-w-[560px]">
          
          {/* Logo Header */}
          <div className="mb-12 flex flex-col items-center justify-center gap-5 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30">
              <span className="material-symbols-outlined font-bold text-[48px]">password</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 dark:text-white tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mt-2 block">Thiết lập bảo mật</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="relative rounded-[3rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl border border-white dark:border-slate-800 p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Đặt lại mật khẩu</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Nhập mật khẩu mới cho tài khoản của bạn (tối thiểu 8 ký tự).
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <form action={resetAction} className="space-y-5">
                <input type="hidden" name="token" value={token} />
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ml-2 block">Mật khẩu mới</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-500">lock</span>
                    </div>
                    <input
                      name="newPassword"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Ít nhất 8 ký tự"
                      className="w-full rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 py-4 pl-12 pr-4 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ml-2 block">Nhập lại mật khẩu</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-500">lock_reset</span>
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      minLength={8}
                      placeholder="Xác nhận mật khẩu mới"
                      className="w-full rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 py-4 pl-12 pr-4 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 transition-all hover:scale-[1.02] hover:bg-slate-800 dark:hover:bg-blue-700 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Cập nhật mật khẩu
                </button>
              </form>
            </div>
            
            <div className="mt-8 flex flex-col gap-4 animate-in fade-in duration-700 delay-200 fill-mode-both">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full py-4 text-base font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                Hủy và quay lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
