"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  changeUserPassword,
  createUserAddress,
  deleteUserAddress,
  listUserAddresses,
  listUserDevices,
  removeUserDevice,
  setDefaultUserAddress,
  updateUserAddress,
  updateUserProfile,
  verifyUserPassword,
  uploadUserAvatarWithActor,
  type UserAddress,
  type UserLoginDevice,
} from "@/lib/profile-api";

import { getApiBaseUrl } from "@/lib/profile-base";
import { formatWebActivityTime } from "@/lib/api";

import { StatusToast } from "@/components/status-toast";
import { ProfileActivityPanel } from "@/components/profile-activity-panel";
import { ProfileUpdateForm } from "@/components/profile-update-form";
import { PasswordChangeForm } from "@/components/password-change-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import { AddressForm } from "@/components/address-form";
import { TwoFactorSetupForm } from "@/components/two-factor-setup-form";
import { UserReviewsPanel } from "@/components/user-reviews-panel";

type Props = {
  user: any;
  logs: any[];
  accessToken: string;
  userId: number;
};

export function ProfileDashboard({ user, logs, accessToken, userId }: Props) {
  const [open, setOpen] = useState<
    | null
    | "info"
    | "change-email"
    | "change-password"
    | "setup-2fa"
    | "address"
    | "devices"
    | "logs"
  >(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "info" | "security" | "address" | "devices" | "reviews" | "logs"
  >("info");
  const [toast, setToast] = useState<any>(null);
  const [profile, setProfile] = useState(user);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [devices, setDevices] = useState<UserLoginDevice[]>([]);
  const [addressForm, setAddressForm] = useState<UserAddress>({
    recipientName: "",
    phoneNumber: "",
    provinceCode: "",
    provinceName: "",
    wardCode: "",
    wardName: "",
    streetLine: "",
    fullAddress: "",
    isDefault: false,
  });
  const [loadingLists, setLoadingLists] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingLists(true);
      const [addr, dev] = await Promise.all([
        listUserAddresses(userId, accessToken),
        listUserDevices(userId, accessToken),
      ]);
      if (!mounted) return;
      setAddresses(addr);
      setDevices(dev);
      setLoadingLists(false);
    })();
    return () => {
      mounted = false;
    };
  }, [userId, accessToken]);

  useEffect(() => {
    function handleProfileUpdated() {
      router.refresh();
    }
    window.addEventListener("profile-updated", handleProfileUpdated);
    return () => window.removeEventListener("profile-updated", handleProfileUpdated);
  }, [router]);

  const actorName = String(profile?.userName ?? "web-user");

  const initial = useMemo(
    () => ({
      firstName: profile?.userDetails?.firstName ?? "",
      lastName: profile?.userDetails?.lastName ?? "",
      phoneNumber: profile?.phoneNumber ?? "",
      gender: profile?.userDetails?.gender ?? "",
      birthDate: profile?.userDetails?.birthDate ?? "",
    }),
    [profile],
  );

  const membershipLevel = String(
    profile?.membershipLevel ?? "BRONZE",
  ).toUpperCase();
  const membershipStyle = membershipBadgeClass(membershipLevel);

  function showToast(tone: string, title: string, message: string) {
    setToast({
      tone,
      title,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  async function updateProfile(formData: FormData) {
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      phoneNumber: String(formData.get("phoneNumber") ?? ""),
      gender: String(formData.get("gender") ?? ""),
      birthDate: String(formData.get("birthDate") ?? ""),
      performedBy: actorName,
    };

    const result = await updateUserProfile(userId, payload, accessToken);

    if (!result) {
      showToast("error", "Cập nhật thất bại", "Không thể lưu thông tin");
      return;
    }

    const updatedProfile = {
      ...profile,
      phoneNumber: payload.phoneNumber,
      userDetails: {
        ...(profile?.userDetails ?? {}),
        firstName: payload.firstName,
        lastName: payload.lastName,
        gender: payload.gender,
        birthDate: payload.birthDate,
      },
    };

    setProfile(updatedProfile);
    setOpen(null);
    showToast("success", "Thành công", "Đã cập nhật thông tin");
    window.dispatchEvent(new Event("profile-updated"));
  }

  async function changeAvatar(file?: File | null) {
    if (!file) return;
    setAvatarBusy(true);
    const avatarUrl = await uploadUserAvatarWithActor(
      userId,
      file,
      actorName,
      accessToken,
    );
    setAvatarBusy(false);
    if (!avatarUrl) {
      showToast("error", "Thất bại", "Không thể cập nhật avatar");
      return;
    }
    const updatedProfile = {
      ...profile,
      userDetails: {
        ...(profile?.userDetails ?? {}),
        avatarUrl,
      },
    };
    setProfile(updatedProfile);
    showToast("success", "Thành công", "Đã cập nhật avatar");
  }

  async function changePassword(formData: FormData) {
    const currentPassword = String(formData.get("currentPassword") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "").trim();
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/.test(newPassword);

    if (!currentPassword) {
      showToast("error", "Thất bại", "Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (!strongPassword) {
      showToast("error", "Thất bại", "Mật khẩu mới phải có dạng như Aa@123");
      return;
    }
    if (newPassword.length < 6) {
      showToast("error", "Thất bại", "Mật khẩu mới quá ngắn");
      return;
    }

    const ok = await changeUserPassword(
      userId,
      {
        currentPassword,
        newPassword,
        performedBy: actorName,
      },
      accessToken,
    );

    if (!ok) {
      showToast("error", "Thất bại", "Không đổi được mật khẩu");
      return;
    }

    setOpen(null);
    showToast("success", "Thành công", "Mật khẩu đã đổi và đã gửi thông báo về Gmail");
    window.dispatchEvent(new Event("profile-updated"));
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-12">
      {toast && (
        <StatusToast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
        />
      )}

      {/* VIP PRO HERO SECTION - Ultra Modern Profile Header */}
      <section className="relative overflow-hidden rounded-[3rem] bg-[#0a0a0a] p-8 sm:p-14 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/5">
        {/* Dynamic Abstract Background Elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-[20%] -top-[50%] h-[800px] w-[800px] rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/0 blur-[120px] animate-spin-slow origin-center mix-blend-screen" />
          <div className="absolute -right-[20%] -bottom-[50%] h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-fuchsia-500/20 to-blue-500/0 blur-[100px] animate-spin-slow-reverse origin-center mix-blend-screen" style={{ animationDelay: '-5s' }} />
          <div className="absolute top-[10%] right-[20%] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse mix-blend-screen" />
          
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-repeat" style={{ backgroundSize: '40px' }} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-end gap-10">
          <div className="relative group">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-[6px] border-[#111] bg-slate-900 shadow-[0_0_50px_rgba(99,102,241,0.3)] transition-all duration-500 hover:scale-105 hover:border-indigo-500/50 hover:shadow-[0_0_80px_rgba(99,102,241,0.5)] z-10"
              title={profile?.userDetails?.avatarUrl ? "Đổi avatar" : "Thêm avatar"}
            >
              <img
                src={resolveAvatarUrl(profile?.userDetails?.avatarUrl) || "/default-avatar.png"}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Avatar"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                <span className="material-symbols-outlined text-3xl text-white drop-shadow-md">
                  {avatarBusy ? "sync" : "photo_camera"}
                </span>
              </div>
            </button>
            {/* Avatar Glow Ring */}
            <div className="absolute -inset-2 rounded-full border border-indigo-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-700" />
            <div className="absolute -inset-4 rounded-full border border-fuchsia-500/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-1000" style={{ animationDelay: '200ms' }} />
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => changeAvatar(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
              <span className={`h-2.5 w-2.5 rounded-full ${profile?.isActive ? 'bg-emerald-400' : 'bg-rose-400'} shadow-[0_0_10px_currentColor] animate-pulse`} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">
                {profile?.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
              </span>
            </div>
            
            <h1 className="font-headline text-5xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-sm">
              {profile?.userDetails?.firstName} {profile?.userDetails?.lastName}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <div className="flex items-center gap-2 text-slate-400 font-medium bg-white/5 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[18px] text-indigo-400">mail</span>
                {maskEmail(profile?.email)}
              </div>
              <span className={`rounded-2xl px-5 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md ${membershipStyle} border border-white/10`}>
                {membershipLabel(membershipLevel)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ULTRA MODERN STICKY TAB BAR */}
      <div className="sticky top-6 z-40">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="relative min-h-[500px]">
        
        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === "info" && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  Hồ Sơ Của Bạn
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Quản lý thông tin cá nhân cơ bản để chúng tôi phục vụ bạn tốt hơn.</p>
              </div>
              <button
                onClick={() => setOpen("info")}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-white px-8 py-4 font-bold text-white dark:text-slate-900 shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">edit_square</span>
                  Cập nhật thông tin
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent group-hover:animate-shimmer" />
              </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InfoCard icon="badge" title="Họ và Tên" value={`${profile?.userDetails?.firstName ?? ""} ${profile?.userDetails?.lastName ?? ""}`} color="blue" />
              <InfoCard icon="smartphone" title="Số điện thoại" value={maskPhone(profile?.phoneNumber) || "Chưa cập nhật"} color="emerald" />
              <InfoCard icon="wc" title="Giới tính" value={profile?.userDetails?.gender || "Chưa cập nhật"} color="fuchsia" />
              <InfoCard icon="cake" title="Ngày sinh" value={profile?.userDetails?.birthDate || "Chưa cập nhật"} color="orange" />
              <InfoCard icon="mark_email_read" title="Email liên hệ" value={maskEmail(profile?.email)} className="md:col-span-2 lg:col-span-2" color="indigo" />
            </div>
          </div>
        )}

        {/* TAB 2: BẢO MẬT TÀI KHOẢN */}
        {activeTab === "security" && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30">
                <span className="material-symbols-outlined text-[28px]">shield_person</span>
              </div>
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 dark:text-white">Bảo Mật Tài Khoản</h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">Bảo vệ tài khoản của bạn bằng các lớp bảo mật đa tầng.</p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Đổi Email Card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <span className="material-symbols-outlined">mark_email_unread</span>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</span>
                </div>
                <div className="space-y-1 mb-8 relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Đang liên kết</p>
                  <p className="font-headline text-xl font-black text-slate-900 dark:text-white truncate">{maskEmail(profile?.email)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 mb-8 flex items-start gap-3 relative z-10">
                  <span className="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">info</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Cần mã xác thực OTP gửi về email hiện tại để có thể thực hiện thay đổi email mới.</p>
                </div>
                <button
                  onClick={() => setOpen("change-email")}
                  className="w-full rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-5 py-4 font-bold transition-all hover:bg-indigo-100 dark:hover:bg-indigo-500/20 active:scale-[0.98] relative z-10"
                >
                  Thay Đổi Email
                </button>
              </div>

              {/* Đổi Password Card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-all hover:border-fuchsia-500/30 hover:shadow-2xl hover:shadow-fuchsia-500/10">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-fuchsia-500/5 blur-3xl group-hover:bg-fuchsia-500/10 transition-colors" />
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
                    <span className="material-symbols-outlined">password</span>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Password</span>
                </div>
                <div className="space-y-1 mb-8 relative z-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Mã hóa bảo mật</p>
                  <p className="font-headline text-2xl font-black text-slate-900 dark:text-white tracking-[0.2em] mt-1">••••••••</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 mb-8 flex items-start gap-3 relative z-10">
                  <span className="material-symbols-outlined text-slate-400 text-[18px] mt-0.5">update</span>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Đổi mật khẩu lần cuối: <strong className="text-slate-700 dark:text-slate-300">{profile?.passwordChangedAt ? formatWebActivityTime(profile.passwordChangedAt) : "Chưa từng đổi"}</strong></p>
                </div>
                <button
                  onClick={() => setOpen("change-password")}
                  className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-5 py-4 font-bold shadow-lg shadow-fuchsia-500/25 transition-all hover:shadow-fuchsia-500/40 hover:-translate-y-0.5 active:scale-[0.98] relative z-10"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>

              {/* 2FA Card */}
              <div className="group relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-all hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 lg:col-span-2">
                <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined">fingerprint</span>
                      </div>
                      <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white">Xác Thực 2 Bước (2FA)</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mb-6">
                      Thêm một lớp bảo vệ bổ sung. Mỗi khi đăng nhập, bạn sẽ cần nhập mã xác minh từ ứng dụng (Google Authenticator, Authy, v.v.).
                    </p>
                    <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-5 py-3">
                      <div className={`relative flex h-4 w-4 items-center justify-center rounded-full ${profile?.is2faEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        {profile?.is2faEnabled && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />}
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{profile?.is2faEnabled ? "Đang được bảo vệ bởi 2FA" : "2FA đang tắt"}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setOpen("setup-2fa")}
                    className={`shrink-0 rounded-2xl px-8 py-4 font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-lg ${
                      profile?.is2faEnabled 
                        ? 'border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-none'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
                    }`}
                  >
                    {profile?.is2faEnabled ? "Quản lý & Tắt 2FA" : "Bật Bảo Mật 2FA"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SỔ ĐỊA CHỈ */}
        {activeTab === "address" && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                    <span className="material-symbols-outlined">map</span>
                  </div>
                  Sổ Địa Chỉ Của Bạn
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Quản lý địa chỉ giao hàng để thanh toán nhanh chóng hơn.</p>
              </div>
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({
                    recipientName: "", phoneNumber: "", provinceCode: "", provinceName: "", wardCode: "", wardName: "", streetLine: "", fullAddress: "", isDefault: false,
                  });
                  setOpen("address");
                }}
                className="group relative overflow-hidden rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:bg-emerald-600 active:scale-[0.98] flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[20px]">add_location</span>
                Thêm Địa Chỉ Mới
              </button>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              {loadingLists ? (
                <div className="p-12 text-center col-span-full">
                  <span className="material-symbols-outlined animate-spin text-5xl text-emerald-500/50">sync</span>
                  <p className="mt-4 font-semibold text-slate-500">Đang tải sổ địa chỉ...</p>
                </div>
              ) : addresses.length ? (
                addresses.map((a) => (
                  <AddressItem
                    key={a.id ?? `${a.fullAddress}-${a.phoneNumber}`}
                    item={a}
                    onEdit={() => {
                      setEditingAddressId(a.id ?? null);
                      setAddressForm({
                        recipientName: a.recipientName ?? "", phoneNumber: a.phoneNumber ?? "", provinceCode: a.provinceCode ?? "", provinceName: a.provinceName ?? "", wardCode: a.wardCode ?? "", wardName: a.wardName ?? "", streetLine: a.streetLine ?? "", fullAddress: a.fullAddress ?? "", isDefault: Boolean(a.isDefault),
                      });
                      setOpen("address");
                    }}
                    onDelete={async () => {
                      if (a.id) {
                        const ok = await deleteUserAddress(userId, a.id, accessToken);
                        if (ok) {
                          setAddresses((prev) => prev.filter((x) => x.id !== a.id));
                          showToast("success", "Thành công", "Đã xóa địa chỉ");
                        }
                      }
                    }}
                    onDefault={async () => {
                      if (a.id) {
                        const next = await setDefaultUserAddress(userId, a.id, accessToken);
                        if (next) {
                          const refreshed = await listUserAddresses(userId, accessToken);
                          setAddresses(refreshed);
                          showToast("success", "Thành công", "Đã đặt làm mặc định");
                        }
                      }
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-20 text-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mb-6">
                    <span className="material-symbols-outlined text-5xl">wrong_location</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Bạn chưa có địa chỉ nào</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400">Thêm một địa chỉ mới để bắt đầu mua sắm ngay.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: THIẾT BỊ */}
        {activeTab === "devices" && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                <span className="material-symbols-outlined text-[28px]">devices_other</span>
              </div>
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 dark:text-white">Thiết Bị Đăng Nhập</h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">Quản lý các thiết bị đang có quyền truy cập vào tài khoản của bạn.</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {loadingLists ? (
                <div className="p-12 text-center col-span-full">
                  <span className="material-symbols-outlined animate-spin text-5xl text-cyan-500/50">sync</span>
                  <p className="mt-4 font-semibold text-slate-500">Đang tải danh sách thiết bị...</p>
                </div>
              ) : devices.length ? (
                devices.map((d) => (
                  <DeviceItem
                    key={d.id ?? d.deviceFingerprint}
                    item={d}
                    onRemove={async () => {
                      if (d.id) {
                        const ok = await removeUserDevice(userId, d.id, accessToken);
                        if (ok) {
                          setDevices((prev) => prev.filter((x) => x.id !== d.id));
                          showToast("success", "Thành công", "Đã xóa thiết bị");
                        }
                      }
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-20 text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">devices_off</span>
                  <p className="text-lg font-bold text-slate-500 dark:text-slate-400">Không có thiết bị nào được ghi nhận</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ĐÁNH GIÁ */}
        {activeTab === "reviews" && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                <span className="material-symbols-outlined text-[28px]">stars</span>
              </div>
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 dark:text-white">Đánh Giá Sản Phẩm</h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">Tất cả các lượt đánh giá và phản hồi của bạn về sản phẩm.</p>
              </div>
            </div>
            <UserReviewsPanel accessToken={accessToken} userId={String(userId)} />
          </div>
        )}

        {/* TAB 6: LỊCH SỬ HOẠT ĐỘNG */}
        {activeTab === "logs" && (
          <div className="animate-in fade-in zoom-in-[0.98] duration-500 rounded-[3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-900 text-white shadow-lg shadow-slate-900/30">
                <span className="material-symbols-outlined text-[28px]">history_edu</span>
              </div>
              <div>
                <h2 className="font-headline text-3xl font-black text-slate-900 dark:text-white">Nhật Ký Hoạt Động</h2>
                <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">Theo dõi các thay đổi và cập nhật trên tài khoản của bạn.</p>
              </div>
            </div>
            <ProfileActivityPanel logs={logs} />
          </div>
        )}
      </div>

      {/* MODALS */}
      {open === "info" && (
        <Modal close={() => setOpen(null)} title="Cập nhật hồ sơ" icon="manage_accounts" color="indigo">
          <ProfileUpdateForm action={updateProfile} initial={initial} />
        </Modal>
      )}
      {open === "setup-2fa" && (
        <Modal close={() => setOpen(null)} title={profile?.is2faEnabled ? "Quản lý 2FA" : "Thiết lập 2FA"} icon="fingerprint" color="emerald">
          <TwoFactorSetupForm
            userId={userId}
            accessToken={accessToken}
            is2faEnabled={profile?.is2faEnabled ?? false}
            onClose={() => setOpen(null)}
          />
        </Modal>
      )}
      {open === "change-email" && (
        <Modal close={() => setOpen(null)} title="Thay đổi Email liên kết" icon="mark_email_unread" color="indigo">
          <ChangeEmailForm
            userId={userId}
            accessToken={accessToken}
            currentEmail={profile?.email ?? ""}
            onSuccess={(newEmail) => {
              setProfile((prev: any) => ({
                ...prev,
                email: newEmail,
              }));
              showToast("success", "Thành công", "Đã đổi Email");
              setOpen(null);
            }}
          />
        </Modal>
      )}
      {open === "change-password" && (
        <Modal close={() => setOpen(null)} title="Cập nhật mật khẩu" icon="password" color="fuchsia">
          <PasswordChangeForm action={changePassword} verifyPassword={(password) => verifyUserPassword(userId, password, accessToken)} />
        </Modal>
      )}
      {open === "address" && (
        <Modal close={() => setOpen(null)} title={editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"} icon="map" color="emerald">
          <AddressForm
            initial={addressForm}
            loading={savingAddress}
            onCancel={() => setOpen(null)}
            onSubmit={async (payload) => {
              setSavingAddress(true);
              try {
                const body = {
                  ...payload
                };
                const saved = editingAddressId
                  ? await updateUserAddress(userId, editingAddressId, body, accessToken)
                  : await createUserAddress(userId, body, accessToken);
                if (!saved) {
                  showToast("error", "Thất bại", "Không lưu được địa chỉ");
                  return;
                }
                const refreshed = await listUserAddresses(userId, accessToken);
                setAddresses(refreshed);
                setOpen(null);
                showToast("success", "Thành công", editingAddressId ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ");
              } finally {
                setSavingAddress(false);
              }
            }}
          />
        </Modal>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------------------
// HELPER COMPONENTS
// --------------------------------------------------------------------------------------

function TabBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: any) => void;
}) {
  const tabs = [
    { id: "info", label: "Thông tin cá nhân", icon: "person" },
    { id: "security", label: "Bảo mật", icon: "shield_lock" },
    { id: "address", label: "Sổ địa chỉ", icon: "location_on" },
    { id: "devices", label: "Thiết bị", icon: "devices" },
    { id: "reviews", label: "Đánh giá", icon: "star_rate" },
    { id: "logs", label: "Nhật ký", icon: "history" },
  ] as const;

  return (
    <div className="flex w-full overflow-x-auto no-scrollbar justify-start md:justify-center">
      <div className="flex gap-2 rounded-full border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 p-2 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/50 mx-4 md:mx-0">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                isActive 
                  ? "text-white shadow-md shadow-indigo-500/25" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-in fade-in zoom-in-95" style={{ zIndex: -1 }} />
              )}
              <span className={`material-symbols-outlined text-[18px] transition-transform ${isActive ? 'scale-110' : ''}`}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function membershipLabel(level: string) {
  switch (level) {
    case "PLATINUM":
      return "HẠNG PLATINUM";
    case "GOLD":
      return "HẠNG GOLD";
    case "SILVER":
      return "HẠNG SILVER";
    default:
      return "HẠNG THÀNH VIÊN";
  }
}

function membershipBadgeClass(level: string) {
  switch (level) {
    case "PLATINUM":
      return "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-violet-500/30";
    case "GOLD":
      return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-orange-500/30";
    case "SILVER":
      return "bg-gradient-to-r from-slate-300 to-slate-500 text-white shadow-slate-500/30";
    default:
      return "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-emerald-500/30";
  }
}

function InfoCard({ icon, title, value, color, className = "" }: any) {
  const colorStyles: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    fuchsia: "bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
    orange: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400",
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  };
  
  return (
    <div className={`group relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 ${colorStyles[color]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{title}</p>
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  );
}

function Modal({ children, close, title, icon, color = "indigo" }: any) {
  const colorStyles: Record<string, string> = {
    indigo: "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    fuchsia: "bg-fuchsia-50 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={close} />
      <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300 rounded-[2.5rem] bg-white dark:bg-slate-900 p-6 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-y-auto max-h-[90vh] no-scrollbar border border-slate-200 dark:border-slate-800">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            {icon && (
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorStyles[color]}`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
            )}
            <h3 className="font-headline text-2xl font-black text-slate-900 dark:text-white">{title}</h3>
          </div>
          <button
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        {children}
      </div>
    </div>
  );
}

function maskPhone(raw: string | null | undefined) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7) return "***";
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}

function maskEmail(raw: string | null | undefined) {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  const at = v.indexOf("@");
  if (at <= 1) return "***" + v.slice(at);
  const name = v.slice(0, at);
  const domain = v.slice(at);
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(3, name.length - 2))}${domain}`;
}

function AddressItem({ item, onEdit, onDelete, onDefault }: { item: UserAddress; onEdit: () => void; onDelete: () => void; onDefault: () => void; }) {
  return (
    <div className={`group relative overflow-hidden rounded-[2.5rem] border-2 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${item.isDefault ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-500/5 hover:border-emerald-500/60 shadow-emerald-500/10" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/30 shadow-slate-200/50 dark:shadow-none"}`}>
      
      {item.isDefault && (
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
      )}

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.isDefault ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
              <span className="material-symbols-outlined">{item.isDefault ? 'home' : 'business'}</span>
            </div>
            {item.isDefault && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                Mặc định
              </span>
            )}
          </div>
          
          <div className="space-y-1 mb-4">
            <h3 className="font-headline text-xl font-black text-slate-900 dark:text-white">{item.recipientName || "Người nhận"}</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">call</span>
              {maskPhone(item.phoneNumber)}
            </p>
          </div>
          
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
            {item.fullAddress || [item.streetLine, item.wardName, item.provinceName].filter(Boolean).join(", ") || "Chưa có địa chỉ chi tiết"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700">
            <span className="material-symbols-outlined text-[18px]">edit_square</span> Sửa
          </button>
          {!item.isDefault ? (
            <button onClick={onDefault} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-3 text-sm font-bold transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
              <span className="material-symbols-outlined text-[18px]">bookmark_add</span> Làm mặc định
            </button>
          ) : (
            <div className="flex-1" /> /* Spacer */
          )}
          {!item.isDefault && (
            <button onClick={onDelete} className="shrink-0 flex items-center justify-center h-[44px] w-[44px] rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition hover:bg-rose-100 dark:hover:bg-rose-500/20" title="Xóa địa chỉ">
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DeviceItem({ item, onRemove }: { item: UserLoginDevice; onRemove: () => void; }) {
  return (
    <div className="group overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[28px]">
              {item.deviceLabel?.toLowerCase().includes('phone') || item.deviceLabel?.toLowerCase().includes('mobile') ? 'smartphone' : 'laptop_mac'}
            </span>
          </div>
          <button onClick={onRemove} className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/20" title="Đăng xuất thiết bị">
            <span className="material-symbols-outlined text-[20px]">power_settings_new</span>
          </button>
        </div>
        
        <h3 className="font-headline text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2" title={item.deviceLabel || "Thiết bị không rõ"}>
          {item.deviceLabel || "Thiết bị không rõ"}
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <span className="material-symbols-outlined text-[16px] text-slate-400">language</span>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 font-mono text-xs">{item.lastLoginIp || "Không xác định"}</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <span className="material-symbols-outlined text-[16px] text-slate-400">explore</span>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.lastLoginLocation || "Không xác định"}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
        <span>Gần nhất</span>
        <span className="text-slate-500 dark:text-slate-300">{item.lastSeenAt ? formatWebActivityTime(item.lastSeenAt) : "-"}</span>
      </div>
    </div>
  );
}

function resolveAvatarUrl(raw: string) {
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  try {
    const origin = new URL(getApiBaseUrl()).origin;
    return origin + (raw.startsWith("/") ? raw : `/${raw}`);
  } catch {
    return raw;
  }
}
