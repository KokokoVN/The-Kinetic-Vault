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
    <div className="flex min-h-screen w-full bg-[#0a0a0a] overflow-hidden text-white">
      {noticeMessage ? <FloatingNotice message={noticeMessage} variant={noticeVariant} /> : null}
      
      {/* Cột trái: Form Đăng Nhập (Đảo bên so với User để tạo sự khác biệt) */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 xl:px-24 relative z-10">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05]">
          <div className="absolute top-20 -left-40 h-[500px] w-[500px] rounded-full bg-red-600 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-md relative z-10">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-900 text-white shadow-xl shadow-red-900/50">
              <span className="material-symbols-outlined font-bold text-[28px]">admin_panel_settings</span>
            </div>
            <span className="font-headline text-2xl font-black text-white tracking-tight">Vault Admin</span>
          </div>

          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-white">Quản trị Hệ thống.</h1>
            <p className="text-base text-gray-400 font-medium">Chỉ dành cho nhân sự có thẩm quyền truy cập.</p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both bg-white text-black p-8 rounded-[2.5rem] shadow-2xl">
            <LoginLiveForm action={loginAction} submitLabel="Đăng nhập Quản trị" rememberContext="admin" />
          </div>

          <div className="mt-8 text-center animate-in fade-in duration-700 delay-200 fill-mode-both">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 w-full py-4 text-sm font-bold text-gray-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20">
              <span className="material-symbols-outlined text-[20px]">person</span>
              Quay về khu vực Khách hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Cột phải: Hình ảnh Branding */}
      <div className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-black lg:flex p-16 border-l border-white/5">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2564&auto=format&fit=crop"
            alt="Cyber Security"
            className="h-full w-full object-cover opacity-40 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h2 className="mb-4 text-5xl font-light text-white leading-tight">
            Absolute <span className="font-bold text-red-500">Control</span>
          </h2>
          <p className="text-gray-400 text-lg font-medium leading-relaxed">
            Hệ thống giám sát và quản lý dữ liệu toàn diện. Đảm bảo an toàn, bảo mật và hiệu suất tối đa.
          </p>
        </div>
      </div>
    </div>
  );
}
