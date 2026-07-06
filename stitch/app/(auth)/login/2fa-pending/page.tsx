import Link from "next/link";
import { TwoFactorPendingAutoLogin } from "@/components/auth/two-factor-pending-auto-login";

export default async function TwoFactorPendingPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const fromAdmin = String(sp?.from ?? "").trim().toLowerCase() === "admin";

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-kinetic/5 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "2s" }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-blue-400/5 blur-[120px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "1s" }} />
      </div>

      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="mb-12 flex flex-col items-center justify-center gap-5 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl shadow-indigo-500/30">
              <span className="material-symbols-outlined font-bold text-[48px]">verified_user</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 dark:text-white tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 mt-2 block">Xác thực 2 bước (2FA)</span>
            </div>
          </div>

          <div className="relative rounded-[3rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl border border-white dark:border-slate-800 p-10 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-headline text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Bảo mật tài khoản</h1>
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium">Vui lòng nhập mã từ ứng dụng xác thực hoặc chọn gửi OTP qua Email.</p>
            </div>

            <TwoFactorPendingAutoLogin fromAdmin={fromAdmin} />

            <div className="mt-8 flex flex-col gap-4">
              <Link
                href={fromAdmin ? "/admin/login" : "/login"}
                className="rounded-[1.25rem] border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-4 text-center text-base font-extrabold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
