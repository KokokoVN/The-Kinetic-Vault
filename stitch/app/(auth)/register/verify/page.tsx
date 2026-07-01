import Link from "next/link";
import { redirect } from "next/navigation";
import { verifyRegistrationToken } from "@/lib/api";
import { RegisterVerifyClient } from "@/components/auth/register-verify-client";

export default async function RegisterVerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; identity?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const token = String(sp?.token ?? "").trim();
  const identity = String(sp?.identity ?? "").trim();
  const ok = token ? await verifyRegistrationToken(token) : false;

  if (ok) {
    redirect("/register/success");
  }

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-kinetic/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-blue-400/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="mx-auto w-full max-w-[600px]">
          
          {/* Logo Header */}
          <div className="mb-12 flex flex-col items-center justify-center gap-5 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30">
              <span className="material-symbols-outlined font-bold text-[48px]">mark_email_read</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-blue-600 mt-2 block">Xác thực Email</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="relative rounded-[3rem] bg-white/70 backdrop-blur-3xl border border-white p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-slate-900">Nhập mã xác thực</h1>
              <p className="inline-block rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-base font-semibold text-amber-800 shadow-sm">
                Vui lòng kiểm tra Gmail đã đăng ký và nhập 8 số OTP vào các ô bên dưới.
              </p>
              {identity ? (
                <p className="mt-5 text-lg text-slate-600 font-medium">
                  Tài khoản chờ kích hoạt:<br />
                  <strong className="text-blue-700 text-xl inline-block mt-1">{identity}</strong>
                </p>
              ) : null}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <RegisterVerifyClient identity={identity} verified={ok} />
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 animate-in fade-in duration-700 delay-200 fill-mode-both">
               <div className="h-px flex-1 bg-slate-300"></div>
               <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Hoặc</span>
               <div className="h-px flex-1 bg-slate-300"></div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 animate-in fade-in duration-700 delay-300 fill-mode-both">
              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 py-4 text-base font-bold text-white transition-all hover:bg-slate-900 hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[24px]">login</span>
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">person_add</span>
                Đăng ký lại
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
