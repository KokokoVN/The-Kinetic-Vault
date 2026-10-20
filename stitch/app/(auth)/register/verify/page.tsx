import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyRegistrationToken } from "@/lib/api";
import { RegisterVerifyClient } from "@/components/auth/register-verify-client";

export const metadata: Metadata = {
  title: "Xác Thực Email OTP",
};

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
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
      {/* Background Animated Lights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-[20%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-blue-600/25 to-cyan-500/20 blur-[130px] animate-pulse" style={{ animationDuration: '7s' }} />
        <div className="absolute -bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-600/25 to-purple-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[620px] rounded-[2.5rem] bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 p-8 sm:p-12 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Header Icon */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-xl shadow-blue-500/20 mb-4">
            <span className="material-symbols-outlined text-[40px] font-black">mark_email_read</span>
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-400 block mb-1">Xác Thực Tài Khoản</span>
          <h1 className="text-3xl font-black text-white tracking-tight">Kích Hoạt Qua OTP Email</h1>
          
          {identity ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-cyan-800/60 bg-cyan-950/40 px-4 py-2 text-xs font-semibold text-cyan-300">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Gửi đến: <strong className="text-white font-bold">{identity}</strong></span>
            </div>
          ) : null}
        </div>

        {/* OTP Input Component */}
        <RegisterVerifyClient identity={identity} verified={ok} />

        {/* Footer Redirect Links */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-bold text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 font-bold text-cyan-400 hover:underline transition-colors"
          >
            Đăng ký tài khoản khác
            <span className="material-symbols-outlined text-[16px]">person_add</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
