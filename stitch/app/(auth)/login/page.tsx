import Link from "next/link";
import { login, verifyLoginOtp } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { LoginLiveForm } from "@/components/auth/login-live-form";
import { FloatingNotice } from "@/components/floating-notice";

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
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low overflow-hidden relative">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[800px] w-[800px] rounded-full bg-kinetic/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] h-[700px] w-[700px] rounded-full bg-blue-400/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
      </div>

      {/* Form Container */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="mx-auto w-full max-w-[560px]">
          
          {/* Logo Header */}
          <div className="mb-12 flex flex-col items-center justify-center gap-5 animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30">
              <span className="material-symbols-outlined font-bold text-[48px]">bolt</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-blue-600 mt-2 block">Hệ thống quản trị</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="relative rounded-[3rem] bg-white/70 backdrop-blur-3xl border border-white p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-slate-900">Chào mừng trở lại</h1>
              <p className="text-lg text-slate-600 font-medium">Vui lòng đăng nhập để tiếp tục</p>
            </div>

            <LoginLiveForm action={loginAction} rememberContext="user" extraFields={safeNext ? <input type="hidden" name="next" value={safeNext} /> : null} />

            <div className="mt-8 text-center text-sm text-on-surface-variant">
              Chưa có tài khoản?{" "}
              <Link className="font-bold text-secondary transition-all hover:text-blue-800 hover:underline" href="/register">
                Đăng ký ngay
              </Link>
            </div>
            
            <div className="mt-10 flex items-center justify-center gap-4">
               <div className="h-px flex-1 bg-slate-300"></div>
               <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Khu vực riêng</span>
               <div className="h-px flex-1 bg-slate-300"></div>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-outline-variant/20 w-full py-4 text-sm font-bold text-on-surface transition-all hover:bg-slate-50 hover:text-kinetic hover:border-kinetic/30 hover:shadow-sm">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                Đăng nhập với tư cách Quản trị viên
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
