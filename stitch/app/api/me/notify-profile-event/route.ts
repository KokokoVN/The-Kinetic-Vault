import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { sendNotification } from "@/lib/notification-api";

type Body = { type?: string };

function subjectFor(type: string): string {
  if (type === "PROFILE_UPDATED") return "Cập nhật thông tin cá nhân";
  if (type === "EMAIL_CHANGED") return "Thay đổi email";
  if (type === "PASSWORD_CHANGED") return "Thay đổi mật khẩu";
  if (type === "AVATAR_CHANGED") return "Thay đổi ảnh đại diện";
  return "Cập nhật tài khoản";
}

function bodyFor(type: string): string {
  if (type === "PROFILE_UPDATED") return "Bạn đã cập nhật thông tin cá nhân thành công.";
  if (type === "EMAIL_CHANGED") return "Email của bạn đã được thay đổi thành công.";
  if (type === "PASSWORD_CHANGED") return "Mật khẩu của bạn đã được thay đổi thành công.";
  if (type === "AVATAR_CHANGED") return "Ảnh đại diện của bạn đã được thay đổi thành công.";
  return "Tài khoản của bạn vừa có thay đổi.";
}

export async function POST(req: Request) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  if (!accessToken) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  const userId = getUserIdFromAccessToken(accessToken);
  if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });

  let payload: Body = {};
  try {
    payload = (await req.json().catch(() => ({}))) as Body;
  } catch {
    payload = {};
  }
  const type = String(payload.type ?? "").trim().toUpperCase() || "PROFILE_UPDATED";

  const apiRoot = getResolvedApiRoot();
  try {
    const userRes = await fetch(`${apiRoot}/accounts/users/${encodeURIComponent(String(userId))}`, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) return NextResponse.json({ ok: false }, { status: 200 });
    const user = (await userRes.json().catch(() => null)) as { email?: string | null; userName?: string | null } | null;
    const email = String(user?.email ?? "").trim();
    if (!email) return NextResponse.json({ ok: true }, { status: 200 });

    await sendNotification({
      channel: "WEB",
      recipient: email,
      subject: subjectFor(type),
      body: bodyFor(type),
      html: false,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}

