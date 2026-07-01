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
  EmailOtpPayload,
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
    <div className="mx-auto w-full space-y-8">
      {toast && (
        <StatusToast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
        />
      )}

      {/* PROFILE HEADER - Premium Glassmorphism */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-8 sm:p-12 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute -top-[50%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[80px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] h-[400px] w-[400px] rounded-full bg-indigo-400/20 blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-[2rem] border-[4px] border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition-all duration-500 hover:scale-105 hover:border-white/40 hover:shadow-blue-500/50"
            title={profile?.userDetails?.avatarUrl ? "Đổi avatar" : "Thêm avatar"}
          >
            <img
              src={resolveAvatarUrl(profile?.userDetails?.avatarUrl) || "/default-avatar.png"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt="Avatar"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
              <span className="text-sm font-bold tracking-wider text-white">
                {avatarBusy ? "Đang lưu..." : profile?.userDetails?.avatarUrl ? "Đổi Avatar" : "Thêm Avatar"}
              </span>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => changeAvatar(e.target.files?.[0] ?? null)}
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="font-headline text-4xl sm:text-5xl font-black tracking-tight drop-shadow-md">
                {profile?.userDetails?.firstName} {profile?.userDetails?.lastName}
              </h1>
              <span className={`rounded-xl px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] shadow-sm ${membershipStyle}`}>
                {membershipLabel(membershipLevel)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300 font-medium bg-white/10 inline-flex px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {maskEmail(profile?.email)}
            </div>
            <p className="text-sm font-semibold tracking-wide text-indigo-200/80 uppercase">
              Thành viên The Kinetic Vault
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-4 z-40 mb-8 mt-8">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="relative min-h-[400px]">
        {activeTab === "info" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="font-headline text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2.5 rounded-2xl shadow-sm">person</span>
                Thông tin cá nhân
              </h2>
              <button
                onClick={() => setOpen("info")}
                className="rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5"
              >
                Chỉnh sửa thông tin
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Info title="Họ tên" value={`${profile?.userDetails?.firstName ?? ""} ${profile?.userDetails?.lastName ?? ""}`} />
              <Info title="Số điện thoại" value={maskPhone(profile?.phoneNumber) || "Chưa cập nhật"} />
              <Info title="Giới tính" value={profile?.userDetails?.gender || "Chưa cập nhật"} />
              <Info title="Ngày sinh" value={profile?.userDetails?.birthDate || "Chưa cập nhật"} />
              <Info title="Địa chỉ Email" value={maskEmail(profile?.email)} className="md:col-span-2" />
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-indigo-600 bg-indigo-100 p-2.5 rounded-2xl shadow-sm">shield_lock</span>
              <h2 className="font-headline text-2xl font-black text-slate-900">Bảo mật tài khoản</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Đổi Gmail */}
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50/50 p-8 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-slate-900">Email liên kết</h3>
                  <span className="material-symbols-outlined text-indigo-400 text-3xl">mail</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Hiện tại</p>
                <p className="font-bold text-lg text-slate-900 truncate">{maskEmail(profile?.email)}</p>
                <p className="mt-4 text-sm text-slate-500 bg-slate-200/50 p-3 rounded-xl">Cần xác minh OTP để đổi Email mới.</p>
                <button
                  onClick={() => setOpen("change-email")}
                  className="mt-6 w-full rounded-2xl bg-white border-2 border-indigo-100 text-indigo-700 px-5 py-3.5 font-extrabold transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5"
                >
                  Đổi Email
                </button>
              </div>

              {/* Đổi mật khẩu */}
              <div className="rounded-[2rem] border border-slate-200 bg-slate-50/50 p-8 transition-all hover:border-blue-300 hover:bg-white hover:shadow-xl hover:shadow-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-xl text-slate-900">Mật khẩu</h3>
                  <span className="material-symbols-outlined text-blue-400 text-3xl">password</span>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Đã mã hóa</p>
                <p className="font-bold text-2xl text-slate-900 tracking-widest">••••••••</p>
                <p className="mt-4 text-sm text-slate-500 bg-slate-200/50 p-3 rounded-xl">Lần đổi gần nhất: <strong className="text-slate-700">{profile?.passwordChangedAt ? formatWebActivityTime(profile.passwordChangedAt) : "Chưa có"}</strong></p>
                <button
                  onClick={() => setOpen("change-password")}
                  className="mt-6 w-full rounded-2xl bg-blue-600 border-2 border-blue-600 text-white px-5 py-3.5 font-extrabold transition-all hover:bg-blue-700 hover:border-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
                >
                  Đổi mật khẩu
                </button>
              </div>
              <div className="mt-6">
                {/* 2FA */}
                <div className="rounded-[2rem] border border-slate-200 bg-slate-50/50 p-8 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl text-slate-900">Xác thực 2 bước (2FA)</h3>
                    <span className="material-symbols-outlined text-indigo-400 text-3xl">verified_user</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 tracking-wide mb-1">
                    Bảo vệ tài khoản của bạn bằng ứng dụng xác thực (Google Authenticator, Authy, v.v.)
                  </p>
                  <p className={`mt-4 text-sm font-bold p-3 rounded-xl flex items-center gap-2 w-fit ${profile?.is2faEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/50 text-slate-500'}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {profile?.is2faEnabled ? 'check_circle' : 'cancel'}
                    </span>
                    {profile?.is2faEnabled ? "Đang bật" : "Đang tắt"}
                  </p>
                  <button
                    onClick={() => setOpen("setup-2fa")}
                    className={`mt-6 w-full rounded-2xl border-2 px-5 py-3.5 font-extrabold transition-all hover:-translate-y-0.5 hover:shadow-lg ${profile?.is2faEnabled 
                        ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50' 
                        : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 hover:shadow-indigo-600/30'}`}
                  >
                    {profile?.is2faEnabled ? "Tắt 2FA" : "Thiết lập 2FA"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="font-headline text-2xl font-black text-slate-900 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 bg-emerald-100 p-2.5 rounded-2xl shadow-sm">location_on</span>
                Quản lý sổ địa chỉ
              </h2>
              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({
                    recipientName: "", phoneNumber: "", provinceCode: "", provinceName: "", wardCode: "", wardName: "", streetLine: "", fullAddress: "", isDefault: false,
                  });
                  setOpen("address");
                }}
                className="rounded-2xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Thêm địa chỉ mới
              </button>
            </div>
            <div className="space-y-4">
              {loadingLists ? (
                <div className="p-8 text-center"><span className="material-symbols-outlined animate-spin text-4xl text-slate-300">sync</span></div>
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
                <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">map</span>
                  <p className="text-lg font-bold text-slate-500">Chưa có địa chỉ nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-teal-600 bg-teal-100 p-2.5 rounded-2xl shadow-sm">devices</span>
              <h2 className="font-headline text-2xl font-black text-slate-900">Thiết bị đang truy cập</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {loadingLists ? (
                <div className="p-8 text-center col-span-2"><span className="material-symbols-outlined animate-spin text-4xl text-slate-300">sync</span></div>
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
                <p className="text-slate-500 col-span-2">Chưa có thiết bị ghi nhận</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-amber-600 bg-amber-100 p-2.5 rounded-2xl shadow-sm">star_rate</span>
              <h2 className="font-headline text-2xl font-black text-slate-900">Đánh giá của tôi</h2>
            </div>
            <UserReviewsPanel accessToken={accessToken} userId={String(userId)} />
          </div>
        )}

        {activeTab === "logs" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] border border-white/60 bg-white/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-orange-600 bg-orange-100 p-2.5 rounded-2xl shadow-sm">history</span>
              <h2 className="font-headline text-2xl font-black text-slate-900">Nhật ký hoạt động</h2>
            </div>
            <ProfileActivityPanel logs={logs} />
          </div>
        )}
      </div>

      {open === "info" && (
        <Modal close={() => setOpen(null)}>
          <ProfileUpdateForm action={updateProfile} initial={initial} />
        </Modal>
      )}
        {open === "setup-2fa" && (
          <Modal close={() => setOpen(null)}>
            <TwoFactorSetupForm
              userId={userId}
              accessToken={accessToken}
              is2faEnabled={profile?.is2faEnabled ?? false}
              onClose={() => setOpen(null)}
            />
          </Modal>
        )}
      {open === "change-email" && (
        <Modal close={() => setOpen(null)}>
          <ChangeEmailForm
            userId={userId}
            accessToken={accessToken}
            currentEmail={profile?.email ?? ""}
            onSuccess={(newEmail) => {
              setProfile((prev: any) => ({
                ...prev,
                email: newEmail,
              }));

              showToast(
                "success",
                "Thành công",
                "Đã đổi Gmail"
              );
              setOpen(null);
            }}
          />
        </Modal>
      )}
        {open === "change-password" && (
          <Modal close={() => setOpen(null)}>
            <div className="space-y-6">
              <PasswordChangeForm action={changePassword} verifyPassword={(password) => verifyUserPassword(userId, password, accessToken)} />
            </div>
          </Modal>
        )}
      {open === "address" && (
        <Modal close={() => setOpen(null)}>
          <AddressForm
            initial={addressForm}
            loading={savingAddress}
            onCancel={() => setOpen(null)}
            onSubmit={async (payload) => {
              setSavingAddress(true);
              try {
                const body = {
                  recipientName: payload.recipientName,
                  phoneNumber: payload.phoneNumber,
                  provinceCode: payload.provinceCode,
                  provinceName: payload.provinceName,
                  wardCode: payload.wardCode,
                  wardName: payload.wardName,
                  streetLine: payload.streetLine,
                  fullAddress: payload.fullAddress,
                  isDefault: payload.isDefault,
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

function TabBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: any) => void;
}) {
  const tabs = [
    ["info", "Thông tin cá nhân"],
    ["security", "Bảo mật"],
    ["address", "Sổ địa chỉ"],
    ["devices", "Thiết bị"],
    ["reviews", "Đánh giá của tôi"],
    ["logs", "Nhật ký"],
  ] as const;
  return (
    <div className="flex flex-wrap gap-3 rounded-[2rem] bg-white/50 backdrop-blur-md p-2 shadow-sm border border-white/50 w-max mx-auto md:mx-0">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`rounded-full px-6 py-3 text-sm font-extrabold transition-all duration-300 ${active === id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" : "bg-transparent text-slate-600 hover:bg-white/80 hover:text-blue-600"}`}
        >
          {label}
        </button>
      ))}
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
      return "HẠNG ĐẾ VƯƠNG LỤC";
  }
}

function membershipBadgeClass(level: string) {
  switch (level) {
    case "PLATINUM":
      return "bg-violet-200 text-violet-900";
    case "GOLD":
      return "bg-amber-200 text-amber-900";
    case "SILVER":
      return "bg-slate-200 text-slate-800";
    default:
      return "bg-orange-200 text-orange-900";
  }
}

function Info({ title, value, className = "" }: any) {
  return (
    <div className={`rounded-3xl border border-slate-100 bg-slate-50/50 p-6 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{title}</p>
      <p className="text-lg font-black text-slate-900 truncate">{value}</p>
    </div>
  );
}

function Modal({ children, close }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={close} />
      <div className="relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-300 rounded-[2.5rem] bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
        <button
          onClick={close}
          className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
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
    <div className={`group rounded-[2rem] border-2 p-6 transition-all duration-300 hover:shadow-xl ${item.isDefault ? "border-emerald-500/30 bg-emerald-50/30 hover:border-emerald-500/50 hover:shadow-emerald-100" : "border-slate-100 bg-white hover:border-blue-200 hover:shadow-blue-50"}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-slate-400">home_pin</span>
            <div>
              <p className="text-lg font-black text-slate-900">{item.recipientName || "Người nhận"}</p>
              <p className="text-sm font-bold text-slate-500">{maskPhone(item.phoneNumber)}</p>
            </div>
          </div>
          <p className="text-slate-700 font-medium pl-10 leading-relaxed">
            {item.fullAddress || [item.streetLine, item.wardName, item.provinceName].filter(Boolean).join(", ") || "Chưa có địa chỉ chi tiết"}
          </p>
        </div>
        {item.isDefault && (
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-extrabold tracking-wide text-emerald-700 uppercase">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Mặc định
          </span>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 pl-10">
        <button onClick={onEdit} className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
          <span className="material-symbols-outlined text-[16px]">edit</span> Sửa
        </button>
        {!item.isDefault && (
          <button onClick={onDefault} className="flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 px-4 py-2 text-sm font-bold transition hover:bg-blue-100">
            <span className="material-symbols-outlined text-[16px]">check_circle</span> Đặt mặc định
          </button>
        )}
        {!item.isDefault && (
          <button onClick={onDelete} className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 ml-auto">
            <span className="material-symbols-outlined text-[16px]">delete</span> Xóa
          </button>
        )}
      </div>
    </div>
  );
}

function DeviceItem({ item, onRemove }: { item: UserLoginDevice; onRemove: () => void; }) {
  return (
    <div className="group rounded-[2rem] border-2 border-slate-100 bg-white p-6 transition-all duration-300 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
            <span className="material-symbols-outlined text-[24px]">devices</span>
          </div>
          <div>
            <p className="text-lg font-black text-slate-900 mb-1">{item.deviceLabel || "Thiết bị không rõ"}</p>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">cell_wifi</span> IP: {item.lastLoginIp || "—"}
              </p>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span> {item.lastLoginLocation || "—"}
              </p>
              <p className="text-xs font-semibold tracking-wide text-slate-400 mt-2 uppercase">
                Gần nhất: {item.lastSeenAt ? formatWebActivityTime(item.lastSeenAt) : "-"}
              </p>
            </div>
          </div>
        </div>
        <button onClick={onRemove} className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100 hover:text-rose-700" title="Đăng xuất thiết bị này">
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
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
