import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { requestForgotPassword } from "@/lib/api";
import { FloatingNotice } from "@/components/floating-notice";

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
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden relative">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}
      
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
              <span className="material-symbols-outlined font-bold text-[48px]">lock_reset</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 dark:text-white tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mt-2 block">Khôi phục mật khẩu</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="relative rounded-[3rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl border border-white dark:border-slate-800 p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Quên mật khẩu</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Nhập username/email/số điện thoại. Nếu tài khoản tồn tại, hệ thống sẽ gửi link đặt lại mật khẩu qua Gmail.
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <form action={forgotAction} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 ml-2 block">Tài khoản cần khôi phục</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-500">account_circle</span>
                    </div>
                    <input
                      name="identity"
                      required
                      placeholder="username / email / số điện thoại"
                      className="w-full rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50 py-4 pl-12 pr-4 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 transition-all hover:scale-[1.02] hover:bg-slate-800 dark:hover:bg-blue-700 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Gửi email đặt lại mật khẩu
                </button>
              </form>
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 animate-in fade-in duration-700 delay-200 fill-mode-both">
               <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700"></div>
               <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Hoặc</span>
               <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700"></div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4 animate-in fade-in duration-700 delay-300 fill-mode-both">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full py-4 text-base font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
