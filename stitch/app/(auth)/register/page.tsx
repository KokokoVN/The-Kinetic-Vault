import Link from "next/link";
import { registerUserAccount } from "@/lib/api";
import { RegisterLiveForm } from "@/components/auth/register-live-form";
import { FloatingNotice } from "@/components/floating-notice";
import { redirect, unstable_rethrow } from "next/navigation";

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
        return { error: "Tài khoản, email hoặc số điện thoại đã tồn tại." };
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
    <div className="flex min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-surface to-surface-container-low dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden relative">
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
              <span className="material-symbols-outlined font-bold text-[48px]">person_add</span>
            </div>
            <div className="text-center">
              <span className="font-headline text-5xl font-black text-slate-900 dark:text-white tracking-tight block drop-shadow-sm">The Kinetic Vault</span>
              <span className="text-base font-extrabold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400 mt-2 block">Tạo tài khoản</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="relative rounded-[3rem] bg-white/70 dark:bg-slate-900/50 backdrop-blur-3xl border border-white dark:border-slate-800 p-10 sm:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-700">
            <div className="mb-10 text-center">
              <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Mở khoá kỷ nguyên mới</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Tài khoản mới sẽ có quyền <code className="rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5">ROLE_USER</code>. Vui lòng dùng tên đăng nhập không dấu và email hợp lệ (Gmail) để kích hoạt.
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
              <RegisterLiveForm action={registerAction} />
            </div>

            <div className="mt-10 flex items-center justify-center gap-4 animate-in fade-in duration-700 delay-200 fill-mode-both">
               <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700"></div>
               <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Hoặc</span>
               <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700"></div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4 animate-in fade-in duration-700 delay-300 fill-mode-both">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full py-4 text-base font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[24px]">login</span>
                Tôi đã có tài khoản (Đăng nhập)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
