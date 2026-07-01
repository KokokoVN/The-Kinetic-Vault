import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type NotificationRow = {
  id?: number;
  channel?: string | null;
  subject?: string | null;
  body?: string | null;
  status?: string | null;
  source?: string | null;
  createdAt?: string | null;
};

function getNotificationServiceBase(): string {
  return (process.env.NOTIFICATION_SERVICE_URL ?? "http://localhost:8815").trim().replace(/\/+$/, "");
}

export async function GET() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  if (!accessToken) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const userId = getUserIdFromAccessToken(accessToken);
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const apiRoot = getResolvedApiRoot();
  try {
    const userRes = await fetch(`${apiRoot}/accounts/users/${encodeURIComponent(String(userId))}`, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      const txt = await userRes.text().catch(() => "");
      return new NextResponse(txt || "{}", {
        status: userRes.status,
        headers: { "Content-Type": userRes.headers.get("Content-Type") ?? "application/json; charset=utf-8" },
      });
    }

    const user = (await userRes.json().catch(() => null)) as { email?: string | null } | null;
    const email = String(user?.email ?? "").trim();
    if (!email) return NextResponse.json({ notifications: [] }, { status: 200 });

    const base = getNotificationServiceBase();
    const lookupRes = await fetch(`${base}/lookup?email=${encodeURIComponent(email)}`, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!lookupRes.ok) {
      if (lookupRes.status === 404) return NextResponse.json({ notifications: [] }, { status: 200 });
      const txt = await lookupRes.text().catch(() => "");
      return new NextResponse(txt || "{}", {
        status: lookupRes.status,
        headers: { "Content-Type": lookupRes.headers.get("Content-Type") ?? "application/json; charset=utf-8" },
      });
    }
    const rows = (await lookupRes.json().catch(() => [])) as NotificationRow[];
    const webOnly = (Array.isArray(rows) ? rows : []).filter((r) => {
      const channel = String(r.channel ?? "").toUpperCase();
      const source = String((r as { source?: string | null }).source ?? "").toUpperCase();
      return channel === "WEB" || channel === "BOTH" || source === "WEB";
    });
    return NextResponse.json({ notifications: webOnly }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}
