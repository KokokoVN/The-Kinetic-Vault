import Link from "next/link";
import type { Metadata } from "next";
import { TwoFactorPendingAutoLogin } from "@/components/auth/two-factor-pending-auto-login";

export const metadata: Metadata = {
  title: "Xác Thực 2FA (2-Factor Authentication)",
};

export default async function TwoFactorPendingPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const fromAdmin = String(sp?.from ?? "").trim().toLowerCase() === "admin";

  return (
    <div className="relative min-h-screen w-full bg-[#07090e] text-zinc-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden">
      {/* Background ambient glowing gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/10 to-amber-500/15 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[650px] w-[650px] rounded-full bg-gradient-to-bl from-indigo-500/20 via-purple-600/10 to-emerald-500/15 blur-[150px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Unified Luxury Container */}
      <div className="relative z-10 w-full max-w-[1100px] rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Panel: Cyber Security Brand Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <div className="space-y-6">
              {/* Brand Logo & Tag */}
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/25">
                  <span className="material-symbols-outlined text-2xl text-white font-bold">verified_user</span>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white font-headline">The Kinetic Vault</h1>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 rounded-full px-2.5 py-0.5 mt-0.5">
                    HỆ THỐNG BẢO MẬT 2FA
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-headline">
                  Xác thực danh tính 2 lớp
                </h2>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-normal">
                  Vui lòng nhập mã xác thực OTP từ ứng dụng bảo mật Authenticator hoặc mã gửi tới Email cá nhân của bạn để tiếp tục truy cập.
                </p>
              </div>

              {/* Security Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <span className="material-symbols-outlined text-xl">shield_lock</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Mã hóa chuẩn End-to-End</h4>
                    <p className="text-[11px] text-zinc-400">Đảm bảo an toàn tuyệt đối cho tài khoản</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <span className="material-symbols-outlined text-xl">timer</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Mã dùng 1 lần (TOTP)</h4>
                    <p className="text-[11px] text-zinc-400">Tự động làm mới và hết hạn sau vài phút</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <span className="material-symbols-outlined text-xl">devices</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Xác thực thiết bị tin cậy</h4>
                    <p className="text-[11px] text-zinc-400">Bảo vệ phiên đăng nhập khỏi rủi ro giả mạo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-4 text-[12px] text-zinc-400">
              Cần sự trợ giúp? <a href="#" className="text-cyan-400 underline hover:text-cyan-300 font-semibold">Liên hệ bộ phận hỗ trợ</a>
            </div>
          </div>

          {/* Right Panel: Interactive 2FA Verification Form */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="mb-2">
              <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-bold text-cyan-300 mb-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>BƯỚC BẢO MẬT CUỐI CÙNG</span>
              </div>
              <h3 className="text-2xl font-black text-white font-headline tracking-tight">
                Nhập mã xác thực
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Chọn phương thức xác thực và điền các chữ số OTP bên dưới:
              </p>
            </div>

            <TwoFactorPendingAutoLogin fromAdmin={fromAdmin} />

            <div className="pt-4 border-t border-white/10">
              <Link
                href={fromAdmin ? "/admin/login" : "/login"}
                className="group flex w-full items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20 shadow-md"
              >
                <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                <span>Quay lại trang đăng nhập</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

