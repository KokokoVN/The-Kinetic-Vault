"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RegisterSuccessRedirect() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.replace("/");
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [router, secondsLeft]);

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-teal-400/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="mx-auto w-full max-w-[600px]">
          
          {/* Logo Header */}
          <div className="mb-12 flex flex-col items-center justify-center gap-5 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-emerald-600 mt-2 block">Chào mừng bạn mới</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="relative rounded-[3rem] bg-white/70 backdrop-blur-3xl border border-white p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center animate-in zoom-in-95 duration-700">
            
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/40 animate-bounce" style={{ animationDuration: '2s' }}>
              <span className="material-symbols-outlined font-bold text-[64px] text-white">verified</span>
            </div>
            
            <h1 className="mb-6 font-headline text-4xl font-extrabold tracking-tight text-slate-900">Đăng ký thành công!</h1>
            
            <p className="inline-block rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-lg font-semibold text-emerald-800 shadow-sm animate-in fade-in duration-700 delay-100 fill-mode-both">
              Tài khoản của bạn đã được kích hoạt thành công.
            </p>
            
            <p className="mt-8 text-base font-medium text-slate-500 animate-in fade-in duration-700 delay-200 fill-mode-both">
              Hệ thống sẽ tự động chuyển về trang chủ sau <strong className="text-xl text-emerald-600 mx-1">{secondsLeft}</strong> giây.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-in fade-in duration-700 delay-300 fill-mode-both">
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-base font-bold text-white transition-all hover:brightness-110 hover:shadow-xl hover:shadow-emerald-500/30"
              >
                <span className="material-symbols-outlined text-[24px]">home</span>
                Về trang chủ
              </Link>
              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 py-4 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">login</span>
                Đăng nhập
              </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
