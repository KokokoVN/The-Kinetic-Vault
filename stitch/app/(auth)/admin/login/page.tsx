import Link from "next/link";
import { login, verifyLoginOtp } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { LoginLiveForm } from "@/components/auth/login-live-form";
import { FloatingNotice } from "@/components/floating-notice";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; detail?: string; role?: string; approved?: string }>;
}) {
  async function loginAction(prevState: any, formData: FormData) {
    "use server";
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const otp = String(formData.get("otp") ?? "").trim();
    const deviceFingerprint = String(formData.get("deviceFingerprint") ?? "").trim();
    if (!username || (!password && !otp)) {
      return { error: "Vui lòng nhập đầy đủ thông tin đăng nhập." };
    }
    try {
      let res;
      if (otp) {
        res = await verifyLoginOtp({ identity: username, otp, deviceFingerprint });
        if (!res) {
          throw new Error("LOGIN_401");
        }
      } else {
        res = await login(username, password, deviceFingerprint || undefined);
      }
      const jar = await cookies();
      jar.set("accessToken", res.accessToken, { httpOnly: true, path: "/" });
      jar.set("refreshToken", res.refreshToken, { httpOnly: true, path: "/" });
      if (res.role === "ROLE_ADMIN") {
        redirect("/admin/dashboard");
      }
      redirect(`/admin/login?error=forbidden&role=${encodeURIComponent(res.role ?? "ROLE_USER")}`);
    } catch (e: any) {
      if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) {
        throw e;
      }
      unstable_rethrow(e);
      const message = e instanceof Error ? e.message : "LOGIN_UNKNOWN";
      if (message.startsWith("LOGIN_401")) return { error: "Sai tài khoản hoặc mật khẩu quản trị viên." };
      if (message.startsWith("LOGIN_403")) return { error: `Đăng nhập bị từ chối: ${message.slice(10, 100)}` };
      if (message.startsWith("LOGIN_423")) {
        const parts = message.split(":");
        const detailMsg = parts.length > 2 ? parts.slice(2).join(":") : (parts[1] || "Tài khoản bị khóa.");
        return { error: detailMsg };
      }
      if (message.startsWith("LOGIN_400")) return { error: "Yêu cầu đăng nhập không hợp lệ." };
      if (message.startsWith("LOGIN_428")) {
        redirect("/login/device-approval/pending?from=admin");
      }
      if (message.startsWith("LOGIN_NETWORK")) {
        return { error: "Không kết nối được backend (Lỗi mạng)." };
      }
      return { error: "Đã xảy ra lỗi hệ thống khi đăng nhập quản trị." };
    }
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = String(resolvedSearchParams?.error ?? "").trim();
  const detail = String(resolvedSearchParams?.detail ?? "").trim();
  const role = String(resolvedSearchParams?.role ?? "").trim();
  const approved = String(resolvedSearchParams?.approved ?? "").trim() === "1";

  let noticeMessage = "";
  let noticeVariant: "success" | "error" | "info" = "info";
  if (error === "401") {
    noticeMessage = "Sai tài khoản hoặc mật khẩu quản trị viên.";
    noticeVariant = "error";
  } else if (error === "400") {
    noticeMessage = "Request login không hợp lệ.";
    noticeVariant = "error";
  } else if (error === "403") {
    noticeMessage = detail ? `Đăng nhập bị từ chối. Chi tiết: ${detail}` : "Đăng nhập bị từ chối.";
    noticeVariant = "error";
  } else if (error === "locked") {
    noticeMessage = detail ? detail : "Tài khoản bị khóa.";
    noticeVariant = "error";
  } else if (error === "inactive") {
    noticeMessage = "Tài khoản chưa được kích hoạt.";
    noticeVariant = "info";
  } else if (error === "forbidden") {
    noticeMessage = role ? `Tài khoản không có quyền quản trị (role hiện tại: ${role}).` : "Tài khoản không có quyền quản trị.";
    noticeVariant = "error";
  } else if (error === "expired") {
    noticeMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    noticeVariant = "info";
  } else if (error === "network") {
    noticeMessage = "Không kết nối được backend.";
    noticeVariant = "error";
  } else if (error === "500") {
    noticeMessage = detail ? `Lỗi server khi đăng nhập. Chi tiết: ${detail}` : "Lỗi server khi đăng nhập.";
    noticeVariant = "error";
  } else if (approved) {
    noticeMessage = "Thiết bị đã được phê duyệt thành công. Bạn có thể đăng nhập quản trị ngay.";
    noticeVariant = "success";
  }

  return (
    <div className="flex min-h-screen w-full bg-[#07090e] overflow-hidden text-zinc-100 relative">
      {/* Background ambient glowing gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-rose-600/20 via-red-600/10 to-transparent blur-[150px]" />
        <div className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full bg-gradient-to-bl from-red-600/15 via-indigo-600/10 to-rose-500/15 blur-[160px]" />
        <div className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-rose-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-repeat" style={{ backgroundSize: '40px' }} />
      </div>

      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}
      
      {/* Cột trái: Form Đăng Nhập Quản Trị */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 xl:px-20 relative z-10">
        <div className="mx-auto w-full max-w-md">
          
          {/* Logo Brand */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-indigo-700 text-white shadow-xl shadow-rose-500/30">
              <span className="material-symbols-outlined font-bold text-[28px]">admin_panel_settings</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-2xl font-black text-white tracking-tight">The Kinetic Vault</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-rose-400">Admin Command Center</span>
            </div>
          </div>

          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              Khu Vực Bảo Mật Cao
            </div>
            <h1 className="mb-2 font-headline text-4xl font-black tracking-tight text-white drop-shadow-md">
              Đăng Nhập Quản Trị
            </h1>
            <p className="text-sm text-zinc-400 font-medium">Chỉ dành cho quản trị viên và nhân sự được cấp quyền.</p>
          </div>

          {/* Form Container Card - Cyber Obsidian Dark Glass */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both border border-white/10 bg-zinc-950/85 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl shadow-rose-950/40 text-zinc-100">
            <LoginLiveForm action={loginAction} submitLabel="Đăng Nhập Quản Trị" rememberContext="admin" />
          </div>

          <div className="mt-8 text-center animate-in fade-in duration-700 delay-200 fill-mode-both">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900/80 border border-white/10 w-full py-4 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white hover:border-white/20 shadow-lg backdrop-blur-md">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Quay về Trang Đăng nhập Khách hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Cột phải: Visual Branding Cyber Security */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0a0d14] lg:flex p-16 border-l border-white/10">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2564&auto=format&fit=crop"
            alt="Cyber Security"
            className="h-full w-full object-cover opacity-25 mix-blend-luminosity transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/80 to-transparent" />
        </div>
        
        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs font-bold text-zinc-300 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Normal · Telemetry Active
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">v2.4.0 Obsidian</span>
        </div>

        {/* Bottom Hero Text */}
        <div className="relative z-10 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6 backdrop-blur-md">
            <span className="material-symbols-outlined text-[32px]">shield_lock</span>
          </div>
          <h2 className="mb-4 text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
            Absolute <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-indigo-400">Control</span> & Precision.
          </h2>
          <p className="text-zinc-400 text-base font-medium leading-relaxed mb-8">
            Hệ thống quản trị đa dịch vụ microservices. Giám sát thời gian thực, quản lý kho hàng và đơn hàng toàn diện với tính bảo mật tối đa.
          </p>

          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="text-2xl font-black text-white">99.9%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Uptime Service</p>
            </div>
            <div>
              <p className="text-2xl font-black text-rose-400">2FA / OTP</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Security Enabled</p>
            </div>
            <div>
              <p className="text-2xl font-black text-cyan-400">100ms</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Latency API</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
