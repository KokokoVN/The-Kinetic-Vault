"use client";

import Link from "next/link";
import { useMemo } from "react";
import { getApiBaseUrl } from "@/lib/profile-base";

type UserProfile = {
  id?: number | null;
  userName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  activated?: boolean | null;
  userDetails?: {
    firstName?: string | null;
    lastName?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    birthDate?: string | number[] | null;
    avatarUrl?: string | null;
    address?: {
      fullAddress?: string | null;
      provinceName?: string | null;
      districtName?: string | null;
      wardName?: string | null;
      streetLine?: string | null;
      isDefault?: boolean | null;
    } | null;
  } | null;
};

export function PersonalInfoCard({ user }: { user: UserProfile | null }) {
  const maskedEmail = useMemo(() => maskEmail(user?.email ?? ""), [user?.email]);
  const maskedPhone = useMemo(() => maskPhone(user?.phoneNumber ?? ""), [user?.phoneNumber]);
  const avatarUrl = useMemo(() => resolveAvatarUrl(String((user as any)?.userDetails?.avatarUrl ?? "").trim()), [user]);
  const fullName = useMemo(() => {
    const first = user?.userDetails?.firstName?.trim() ?? "";
    const last = user?.userDetails?.lastName?.trim() ?? "";
    const joined = [first, last].filter(Boolean).join(" ");
    return joined || user?.userName || "Người dùng";
  }, [user]);
  const birthDate = useMemo(() => formatDate(user?.userDetails?.birthDate ?? user?.userDetails?.dateOfBirth ?? null), [user]);
  const gender = useMemo(() => formatGender(user?.userDetails?.gender ?? ""), [user]);
  const address = useMemo(() => formatAddress(user?.userDetails?.address ?? null), [user]);
  const roleName = useMemo(() => String((user as any)?.role?.roleName ?? "").replace(/^ROLE_/, "") || "USER", [user]);

  return (
    <section className="overflow-hidden rounded-3xl border border-outline-variant/10 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-6 text-white sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/75">Personal Profile</p>
            <h1 className="mt-2 font-headline text-3xl font-black">Thông tin cá nhân</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85">Xem và quản lý thông tin tài khoản, liên hệ và trạng thái kích hoạt.</p>
          </div>
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/35 bg-white/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-black text-white">
                {(fullName?.trim()?.[0] ?? "U").toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-outline-variant/10 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Họ tên</p>
                <p className="mt-1 text-lg font-black text-blue-950">{fullName}</p>
              </div>
              <span className="material-symbols-outlined text-4xl text-blue-600">badge</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoBox label="Tên đăng nhập" value={user?.userName ?? "—"} icon="person" />
            <InfoBox label="Email" value={maskedEmail || "—"} icon="mail" />
            <InfoBox label="Số điện thoại" value={maskedPhone || "—"} icon="call" />
            <InfoBox label="Giới tính" value={gender || "—"} icon="wc" />
            <InfoBox label="Ngày sinh" value={birthDate || "—"} icon="cake" />
            <InfoBox label="Vai trò" value={roleName} icon="admin_panel_settings" />
            <InfoBox label="Địa chỉ mặc định" value={address || "—"} icon="home_pin" />
            <InfoBox label="Trạng thái" value={user?.activated ? "Đã kích hoạt" : "Chưa kích hoạt"} icon={user?.activated ? "verified" : "error"} tone={user?.activated ? "green" : "amber"} />
          </div>

          <div className="rounded-2xl border border-outline-variant/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-blue-950">Thông tin hồ sơ</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Các thông tin cá nhân được lấy trực tiếp từ hồ sơ tài khoản của bạn. Bạn có thể dùng khu vực quản lý bên cạnh để cập nhật họ tên, số điện thoại, ngày sinh, Gmail, avatar và mật khẩu.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-outline-variant/10 bg-slate-50 p-5">
          <p className="text-sm font-black text-blue-950">Lối tắt</p>
          <Link href="/notifications" className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <p className="font-bold text-slate-900">Hộp thư thông báo</p>
              <p className="text-xs text-slate-500">Xem thông báo web gần đây</p>
            </div>
            <span className="material-symbols-outlined text-blue-600">arrow_forward</span>
          </Link>
          <Link href="/my-orders" className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <p className="font-bold text-slate-900">Đơn hàng của tôi</p>
              <p className="text-xs text-slate-500">Theo dõi đơn và trạng thái</p>
            </div>
            <span className="material-symbols-outlined text-blue-600">arrow_forward</span>
          </Link>
          <Link href="/cart" className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <p className="font-bold text-slate-900">Giỏ hàng</p>
              <p className="text-xs text-slate-500">Xem sản phẩm đang chọn</p>
            </div>
            <span className="material-symbols-outlined text-blue-600">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatGender(raw: string): string {
  const value = String(raw ?? "").trim().toLowerCase();
  if (!value) return "";
  if (["male", "nam", "m"].includes(value)) return "Nam";
  if (["female", "nu", "nữ", "f"].includes(value)) return "Nữ";
  return raw;
}

function formatDate(raw: string | number[] | null | undefined): string {
  if (!raw) return "";
  if (Array.isArray(raw)) {
    const [y, m, d] = raw;
    if (!y || !m || !d) return "";
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }
  const value = String(raw).trim();
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("vi-VN");
  }
  return value;
}

function formatAddress(address: UserProfile["userDetails"] extends infer D ? D extends { address?: infer A } ? A : never : never): string {
  if (!address) return "";
  const full = String((address as any).fullAddress ?? "").trim();
  if (full) return full;
  return [
    String((address as any).streetLine ?? "").trim(),
    String((address as any).wardName ?? "").trim(),
    String((address as any).districtName ?? "").trim(),
    String((address as any).provinceName ?? "").trim(),
  ].filter(Boolean).join(", ");
}

function maskEmail(raw: string): string {
  const email = String(raw ?? "").trim();
  if (!email) return "";
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!domain) return email;
  if (local.length <= 2) {
    return `${local[0] ?? "*"}******@${domain}`;
  }
  const head = local.slice(0, 2);
  const tail = local.slice(-1);
  return `${head}******${tail}@${domain}`;
}

function maskPhone(raw: string): string {
  const phone = String(raw ?? "").replace(/\s+/g, "");
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  const head = digits.slice(0, 3);
  const tail = digits.slice(-2);
  return `${head}******${tail}`;
}

function resolveAvatarUrl(raw: string): string {
  const path = String(raw ?? "").trim();
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  let normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/accounts/")) {
    normalized = `/api${normalized}`;
  }
  try {
    const apiBase = getApiBaseUrl();
    const origin = new URL(apiBase).origin;
    return `${origin}${normalized}`;
  } catch {
    return normalized;
  }
}

function InfoBox({ label, value, icon, tone = "default" }: { label: string; value: string; icon: string; tone?: "default" | "green" | "amber" }) {
  const toneClass =
    tone === "green"
      ? "text-emerald-700 bg-emerald-100"
      : tone === "amber"
        ? "text-amber-700 bg-amber-100"
        : "text-blue-700 bg-blue-100";
  return (
    <div className="rounded-2xl border border-outline-variant/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className="mt-1 break-words text-sm font-bold text-slate-900">{value}</p>
        </div>
        <span className={`material-symbols-outlined rounded-xl p-2 ${toneClass}`}>{icon}</span>
      </div>
    </div>
  );
}
