import Link from "next/link";
import type { Metadata } from "next";
import { registerUserAccount } from "@/lib/api";
import { RegisterLiveForm } from "@/components/auth/register-live-form";
import { FloatingNotice } from "@/components/floating-notice";
import { redirect, unstable_rethrow } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng Ký Tài Khoản Mới",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ ok?: string; error?: string; detail?: string }>;
}) {
  async function registerAction(prevState: any, formData: FormData) {
    "use server";
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!username || !email || !password) {
      return { error: "Vui lòng nhập đầy đủ thông tin." };
    }
    if (password.length < 8) {
      return { error: "Mật khẩu phải có ít nhất 8 ký tự." };
    }
    if (password !== confirmPassword) {
      return { error: "Mật khẩu xác nhận không khớp." };
    }
    try {
      await registerUserAccount({ username, contact: email, password });
      redirect(`/register/verify?identity=${encodeURIComponent(email)}`);
    } catch (e: any) {
      if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) {
        throw e;
      }
      unstable_rethrow(e);
      const message = e instanceof Error ? e.message : "REGISTER_UNKNOWN";
      if (message.startsWith("REGISTER_409")) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8900/api";
          const res = await fetch(`${apiBase}/registration/check?username=${encodeURIComponent(username)}&contact=${encodeURIComponent(email)}`, { cache: "no-store" });
          const data = (await res.json()) as { usernameExists?: boolean; contactExists?: boolean; identityExists?: boolean };
          if (data?.usernameExists) {
            return { error: `Tên đăng nhập "${username}" đã có người sử dụng. Vui lòng chọn username khác.` };
          }
          if (data?.contactExists || data?.identityExists) {
            return { error: `Địa chỉ Gmail "${email}" đã được đăng ký. Vui lòng chọn Gmail khác hoặc Đăng Nhập.` };
          }
        } catch {}
        return { error: "Tên đăng nhập hoặc Email đã tồn tại trong hệ thống." };
      }
      if (message.startsWith("REGISTER_NETWORK")) {
        return { error: "Không kết nối được gateway/backend. Vui lòng thử lại." };
      }
      const detail = message.slice(0, 180);
      return { error: `Đăng ký thất bại. Chi tiết: ${detail}` };
    }
  }

  const sp = searchParams ? await searchParams : undefined;
  const ok = String(sp?.ok ?? "").trim() === "1";
  const error = String(sp?.error ?? "").trim();
  const detail = String(sp?.detail ?? "").trim();

  let noticeMessage = "";
  let noticeVariant: "success" | "error" | "info" = "info";
  if (ok) {
    noticeMessage = "Đăng ký thành công. Vui lòng kiểm tra OTP để kích hoạt tài khoản.";
    noticeVariant = "success";
  } else if (error === "missing") {
    noticeMessage = "Vui lòng nhập đầy đủ thông tin.";
    noticeVariant = "error";
  } else if (error === "pwd") {
    noticeMessage = "Mật khẩu phải có ít nhất 8 ký tự.";
    noticeVariant = "error";
  } else if (error === "confirm") {
    noticeMessage = "Mật khẩu xác nhận không khớp.";
    noticeVariant = "error";
  } else if (error === "exists") {
    noticeMessage = "Tài khoản, email hoặc số điện thoại đã tồn tại.";
    noticeVariant = "error";
  } else if (error === "network") {
    noticeMessage = "Không kết nối được gateway/backend. Vui lòng thử lại.";
    noticeVariant = "error";
  } else if (error === "failed") {
    noticeMessage = detail ? `Đăng ký thất bại. Chi tiết: ${detail}` : "Đăng ký thất bại. Vui lòng thử lại sau.";
    noticeVariant = "error";
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}

      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-indigo-600/30 to-purple-500/20 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] -left-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-blue-600/25 to-cyan-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '11s', animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Left Side: Brand & Benefits Showcase */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-blue-950/80 border-r border-slate-800/60 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
          
          {/* Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px] font-black">person_add</span>
              </div>
              <div>
                <span className="font-headline text-2xl font-black tracking-tight text-white block">Kinetic Vault</span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-indigo-300 block">Thành Viên Mới</span>
              </div>
            </Link>
          </div>

          {/* Benefits Content */}
          <div className="relative z-10 my-auto py-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              Đặc Quyền Hội Viên Kinetic
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-[1.2]">
              Gia Nhập Cộng Đồng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-400 to-blue-400">Mua Sắm Thông Minh</span>
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              Tạo tài khoản chính thức để tích điểm đổi quà, nhận coupon giảm giá ưu đãi và nhận thông báo khuyến mãi độc quyền từ các thương hiệu hàng đầu.
            </p>

            {/* Benefit Items */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                  <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Voucher Đón Chào Đơn Đầu</h4>
                  <p className="text-[11px] text-slate-400">Tặng mã giảm giá trực tiếp vào ví quà tặng</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
                  <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cập Nhật Trạng Thái Tức Thì</h4>
                  <p className="text-[11px] text-slate-400">Hộp thư thông báo riêng biệt về đơn hàng & khuyến mãi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 The Kinetic Vault</span>
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-cyan-400" /> Kích hoạt qua OTP Gmail
            </span>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-slate-900/80 backdrop-blur-xl">
          {/* Mobile Header Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-md">
                <span className="material-symbols-outlined text-[22px]">person_add</span>
              </div>
              <span className="font-headline text-xl font-black text-white">Kinetic Vault</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/50">Đăng Ký</span>
          </div>

          {/* Title Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Tạo Tài Khoản Mới</h1>
            <p className="text-slate-400 text-sm font-medium">Vui lòng sử dụng Username viết liền không dấu và Email Gmail chính chủ</p>
          </div>

          {/* Form Component */}
          <RegisterLiveForm action={registerAction} />

          {/* Footer Redirect */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-sm">
            <span className="text-slate-400">Đã có tài khoản từ trước?</span>
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 px-4 py-2 rounded-xl border border-indigo-800/50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Đăng nhập ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
