import Link from "next/link";
import type { Metadata } from "next";
import { login, verifyLoginOtp } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { LoginLiveForm } from "@/components/auth/login-live-form";
import { FloatingNotice } from "@/components/floating-notice";

export const metadata: Metadata = {
  title: "Đăng Nhập Tài Khoản",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; detail?: string; role?: string; approved?: string; reset?: string; next?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextRaw = String(resolvedSearchParams?.next ?? "").trim();
  const safeNext =
    nextRaw.startsWith("/") && !nextRaw.startsWith("//") && !nextRaw.toLowerCase().startsWith("/admin")
      ? nextRaw
      : "";

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
      const next = String(formData.get("next") ?? "").trim();
      const safe = next.startsWith("/") && !next.startsWith("//") && !next.toLowerCase().startsWith("/admin") ? next : "";
      redirect(safe || "/?notice=login_success");
    } catch (e: any) {
      if (e && typeof e === 'object' && 'digest' in e && typeof e.digest === 'string' && e.digest.startsWith('NEXT_REDIRECT')) {
        throw e;
      }
      unstable_rethrow(e);
      const message = e instanceof Error ? e.message : "LOGIN_UNKNOWN";
      if (message.startsWith("LOGIN_401")) return { error: "Sai tài khoản hoặc mật khẩu." };
      if (message.startsWith("LOGIN_403")) return { error: `Đăng nhập bị từ chối: ${message.slice(10, 100)}` };
      if (message.startsWith("LOGIN_423")) {
        const parts = message.split(":");
        const detailMsg = parts.length > 2 ? parts.slice(2).join(":") : (parts[1] || "Tài khoản bị khóa.");
        return { error: detailMsg };
      }
      if (message.startsWith("LOGIN_400")) return { error: "Yêu cầu đăng nhập không hợp lệ." };
      if (message.startsWith("LOGIN_428:LOGIN_2FA_REQUIRED")) redirect("/login/2fa-pending");
      if (message.startsWith("LOGIN_428")) redirect("/login/device-approval/pending");
      if (message.startsWith("LOGIN_NETWORK")) return { error: "Không kết nối được tới server (Lỗi mạng)." };
      return { error: "Đã xảy ra lỗi hệ thống khi đăng nhập. Vui lòng thử lại sau." };
    }
  }

  const error = String(resolvedSearchParams?.error ?? "").trim();
  const detail = String(resolvedSearchParams?.detail ?? "").trim();
  const role = String(resolvedSearchParams?.role ?? "").trim();
  const approved = String(resolvedSearchParams?.approved ?? "").trim() === "1";
  const reset = String(resolvedSearchParams?.reset ?? "").trim() === "1";

  let noticeMessage = "";
  let noticeVariant: "success" | "error" | "info" = "info";
  if (error === "401") noticeMessage = "Sai tài khoản hoặc mật khẩu.";
  else if (error === "400") noticeMessage = "Request login không hợp lệ.";
  else if (error === "403") noticeMessage = detail ? `Đăng nhập bị từ chối. Chi tiết: ${detail}` : "Đăng nhập bị từ chối.";
  else if (error === "locked") noticeMessage = detail ? detail : "Tài khoản bị khóa.";
  else if (error === "inactive") noticeMessage = "Tài khoản chưa được kích hoạt.";
  else if (error === "forbidden") noticeMessage = role ? `Tài khoản của bạn không có quyền vào trang quản trị (role hiện tại: ${role}).` : "Tài khoản của bạn không có quyền vào trang quản trị.";
  else if (error === "expired") noticeMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  else if (error === "network") noticeMessage = "Không kết nối được tới backend (gateway).";
  else if (error === "500") noticeMessage = detail ? `Đăng nhập lỗi phía server. Chi tiết: ${detail}` : "Đăng nhập lỗi phía server.";
  else if (approved) noticeMessage = "Thiết bị đã được phê duyệt thành công. Bạn có thể đăng nhập ngay.";
  else if (reset) noticeMessage = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.";

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden font-sans">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}

      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-blue-600/30 to-indigo-600/20 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[10%] -right-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-cyan-600/25 to-blue-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '11s', animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Main Container Card - 100% Unified with Register Page */}
      <div className="relative z-10 w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 rounded-[2.5rem] bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Left Side: Brand & Benefits Showcase */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-indigo-950/80 border-r border-slate-800/60 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />
          
          {/* Brand Header */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[28px] font-black">bolt</span>
              </div>
              <div>
                <span className="font-headline text-2xl font-black tracking-tight text-white block">Kinetic Vault</span>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cyan-300 block">Hệ Thống Đăng Nhập</span>
              </div>
            </Link>
          </div>

          {/* Benefits Content */}
          <div className="relative z-10 my-auto py-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3.5 py-1.5 text-xs font-bold text-cyan-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              Bảo Mật Chuẩn Doanh Nghiệp
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-[1.2]">
              Chào Mừng Trở Lại <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300">Kinetic Vault</span>
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed font-normal">
              Đăng nhập để tiếp tục quản lý đơn hàng, truy cập kho ưu đãi dành riêng cho bạn và tận hưởng các đặc quyền thành viên.
            </p>

            {/* Feature Cards */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-cyan-300">
                  <span className="material-symbols-outlined text-[20px]">shield_lock</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Xác Thực 2 Lớp (2FA)</h4>
                  <p className="text-[11px] text-slate-400">Mã hóa JWT & Fingerprint bảo vệ dữ liệu</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                  <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Theo Dõi Đơn Hàng Realtime</h4>
                  <p className="text-[11px] text-slate-400">Cập nhật tức thì lộ trình vận chuyển</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 The Kinetic Vault</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Gateway Online
            </span>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-slate-900/80 backdrop-blur-xl">
          {/* Mobile Header Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                <span className="material-symbols-outlined text-[22px]">bolt</span>
              </div>
              <span className="font-headline text-xl font-black text-white">Kinetic Vault</span>
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/50">Đăng Nhập</span>
          </div>

          {/* Title Header */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Đăng Nhập Tài Khoản</h1>
            <p className="text-slate-400 text-sm font-medium">Nhập thông tin xác thực để truy cập hệ thống</p>
          </div>

          {/* Live Form Component */}
          <LoginLiveForm 
            action={loginAction} 
            rememberContext="user" 
            extraFields={safeNext ? <input type="hidden" name="next" value={safeNext} /> : null} 
          />

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <div className="text-slate-400">
              Chưa có tài khoản từ trước?{" "}
              <Link className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline transition-colors ml-1" href="/register">
                Tạo tài khoản mới
              </Link>
            </div>
            
            <Link 
              href="/admin/login" 
              className="inline-flex items-center gap-2 font-bold text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-900 px-4 py-2 rounded-xl border border-slate-800/80 transition-all text-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-blue-400">admin_panel_settings</span>
              Dành cho Quản Trị Viên
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
