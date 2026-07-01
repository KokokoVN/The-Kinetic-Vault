import Link from "next/link";
import { DeviceApprovalPendingAutoLogin } from "@/components/auth/device-approval-pending-auto-login";

export default async function DeviceApprovalPendingPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const fromAdmin = String(sp?.from ?? "").trim().toLowerCase() === "admin";

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-kinetic/5 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "2s" }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-blue-400/5 blur-[120px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "1s" }} />
      </div>

      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="mx-auto w-full max-w-[560px]">
          
          <div className="mb-12 flex flex-col items-center justify-center gap-5 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30">
              <span className="material-symbols-outlined font-bold text-[48px]">security</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-blue-600 mt-2 block">Xác thực đăng nhập</span>
            </div>
          </div>

          <div className="relative rounded-[3rem] bg-white/70 backdrop-blur-3xl border border-white p-10 sm:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-headline text-3xl font-extrabold tracking-tight text-slate-900">Thiết bị mới</h1>
              <p className="text-base text-slate-600 font-medium">Bạn đang đăng nhập từ một thiết bị hoặc trình duyệt chưa được phê duyệt.</p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4 rounded-3xl border-2 border-blue-100 bg-blue-50/50 p-6 mb-8 text-center">
               <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mx-auto">
                 <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
               </div>
               <p className="text-base font-medium text-slate-700">
                 Hệ thống đã gửi một <strong>mã xác thực OTP (8 số)</strong>. Vui lòng kiểm tra email của bạn.
               </p>
            </div>

            <DeviceApprovalPendingAutoLogin fromAdmin={fromAdmin} />

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-[1.25rem] bg-blue-600 py-4 text-center text-base font-extrabold text-white shadow-xl shadow-blue-600/30 transition-all hover:-translate-y-1 hover:shadow-blue-600/50 hover:bg-blue-700"
              >
                Mở Gmail
              </a>
              <Link
                href={fromAdmin ? "/admin/login" : "/login"}
                className="flex-1 rounded-[1.25rem] border-2 border-slate-200 bg-white py-4 text-center text-base font-extrabold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
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
