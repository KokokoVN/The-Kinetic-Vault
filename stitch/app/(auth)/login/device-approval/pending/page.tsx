import Link from "next/link";
import type { Metadata } from "next";
import { DeviceApprovalPendingAutoLogin } from "@/components/auth/device-approval-pending-auto-login";

export const metadata: Metadata = {
  title: "Xác Thực Thiết Bị Mới (Device Approval)",
};

export default async function DeviceApprovalPendingPage({
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
        <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-600/10 to-blue-500/15 blur-[150px]" />
        <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-indigo-500/20 via-purple-600/10 to-cyan-500/15 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Unified Luxury Container */}
      <div className="relative z-10 w-full max-w-[1100px] rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Panel: Security Brand Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-r border-white/10 pb-8 lg:pb-0 lg:pr-8">
            <div className="space-y-6">
              {/* Brand Logo Header */}
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-blue-600 shadow-lg shadow-cyan-500/25">
                  <span className="material-symbols-outlined text-2xl text-white font-bold">security</span>
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white font-headline">The Kinetic Vault</h1>
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 rounded-full px-2.5 py-0.5 mt-0.5">
                    XÁC THỰC THIẾT BỊ MỚI
                  </span>
                </div>
              </div>

              {/* Main Heading */}
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-white font-headline">
                  Phê duyệt thiết bị lạ
                </h2>
                <p className="mt-3 text-sm text-zinc-400 leading-relaxed font-normal">
                  Phát hiện đăng nhập từ thiết bị hoặc trình duyệt chưa được phê duyệt. Vui lòng nhập mã xác thực OTP 8 chữ số được gửi tới Gmail của bạn.
                </p>
              </div>

              {/* Security Badges */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <span className="material-symbols-outlined text-xl">fingerprint</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Nhận diện vân tay trình duyệt</h4>
                    <p className="text-[11px] text-zinc-400">Tự động phát hiện vị trí & thiết bị truy cập</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <span className="material-symbols-outlined text-xl">mark_email_unread</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Mã OTP 8 chữ số</h4>
                    <p className="text-[11px] text-zinc-400">Gửi trực tiếp đến hòm thư Gmail chính chủ</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3.5 transition-all hover:bg-white/[0.04]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Bảo vệ phiên làm việc</h4>
                    <p className="text-[11px] text-zinc-400">Ngăn chặn các truy cập giả mạo trái phép</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="pt-2 text-[12px] text-zinc-400">
              © 2026 The Kinetic Vault. Hệ thống Microservices an toàn.
            </div>
          </div>

          {/* Right Panel: OTP Form & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="mb-2">
              <div className="inline-flex items-center space-x-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>PHÊ DUYỆT TRUY CẬP</span>
              </div>
              <h3 className="text-2xl font-black text-white font-headline tracking-tight">
                Nhập mã OTP xác thực
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Hệ thống đã gửi mã OTP (8 số) về Gmail của bạn. Điền 8 chữ số bên dưới để tiếp tục:
              </p>
            </div>

            {/* OTP Form Component */}
            <DeviceApprovalPendingAutoLogin fromAdmin={fromAdmin} />

            {/* Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-500 hover:to-indigo-500"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                <span>Mở Gmail</span>
              </a>
              <Link
                href={fromAdmin ? "/admin/login" : "/login"}
                className="flex-1 flex items-center justify-center space-x-2 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

