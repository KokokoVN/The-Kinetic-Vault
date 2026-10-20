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
    <div className="relative min-h-screen w-full bg-[#07090e] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden">
      {/* Background ambient glowing gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-600/10 to-cyan-500/15 blur-[150px]" />
        <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-indigo-500/20 via-purple-600/10 to-emerald-500/15 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-emerald-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Unified Luxury Container */}
      <div className="relative z-10 w-full max-w-[1100px] rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-2xl shadow-emerald-950/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Panel: Brand & Benefits Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <div className="space-y-6">
              {/* Brand Logo Header */}
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 shadow-lg shadow-emerald-500/25">
                  <span className="material-symbols-outlined text-2xl text-white font-bold">verified</span>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white font-headline">The Kinetic Vault</h1>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-full px-2.5 py-0.5 mt-0.5">
                    TÀI KHOẢN ĐÃ KÍCH HOẠT
                  </span>
                </div>
              </div>

              {/* Heading */}
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-headline">
                  Chào mừng hội viên mới!
                </h2>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-normal">
                  Chúc mừng bạn đã kích hoạt thành công tài khoản chính thức tại <strong className="text-white">The Kinetic Vault</strong>. Dưới đây là các đặc quyền mua sắm dành riêng cho bạn:
                </p>
              </div>

              {/* Member Benefits Cards */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <span className="material-symbols-outlined text-xl">card_giftcard</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Voucher Đón Chào Hội Viên</h4>
                    <p className="text-[11px] text-zinc-400">Tặng mã giảm giá trực tiếp vào ví ưu đãi của bạn</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <span className="material-symbols-outlined text-xl">local_shipping</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Miễn Phí Giao Hàng Đơn Đầu</h4>
                    <p className="text-[11px] text-zinc-400">Áp dụng cho mọi đơn hàng mua sắm đầu tiên</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <span className="material-symbols-outlined text-xl">shield_person</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Bảo Mật 2 Lớp Nâng Cao</h4>
                    <p className="text-[11px] text-zinc-400">Dễ dàng kích hoạt 2FA (Authenticator / OTP Email)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="pt-2 text-[12px] text-zinc-400">
              © 2026 The Kinetic Vault. Hệ thống Microservices mua sắm hiện đại.
            </div>
          </div>

          {/* Right Panel: Success Celebration & Actions */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center text-center space-y-6">
            {/* Animated Big Icon */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white shadow-2xl shadow-emerald-500/40">
              <span className="material-symbols-outlined text-[64px] font-black animate-bounce" style={{ animationDuration: "2s" }}>
                verified
              </span>
              <span className="absolute -inset-2 rounded-[2rem] border border-emerald-400/40 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: "3s" }} />
            </div>

            {/* Main Celebration Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1 text-xs font-extrabold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>KÍCH HOẠT TÀI KHOẢN THÀNH CÔNG</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white font-headline tracking-tight">
                Đăng Ký Thành Công!
              </h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Tài khoản cá nhân của bạn đã được kích hoạt hoàn tất và sẵn sàng trải nghiệm dịch vụ.
              </p>
            </div>

            {/* Countdown Box */}
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-inner">
              <p className="text-xs text-zinc-400 font-medium">
                Tự động chuyển về trang chủ sau{" "}
                <strong className="text-lg font-black text-emerald-400 mx-1">{secondsLeft}</strong> giây...
              </p>
              {/* Progress Bar */}
              <div className="mt-3 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(secondsLeft / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md pt-2">
              <Link
                href="/"
                className="group flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-cyan-400"
              >
                <span className="material-symbols-outlined text-xl">home</span>
                <span>Về Trang Chủ Ngay</span>
              </Link>
              <Link
                href="/login"
                className="group flex-1 flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined text-xl">login</span>
                <span>Đăng Nhập Ngay</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

