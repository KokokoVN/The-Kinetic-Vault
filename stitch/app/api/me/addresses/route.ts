import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

async function authContext() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  if (!accessToken) return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  const userId = getUserIdFromAccessToken(accessToken);
  if (!userId) return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  return { accessToken, userId, base: getResolvedApiRoot() } as const;
}

export async function GET() {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { accessToken, userId, base } = ctx;
  try {
    const [listRes, userRes] = await Promise.all([
      fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses`, {
        method: "GET",
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}`, {
        method: "GET",
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);
    if (!listRes.ok) {
      const txt = await listRes.text().catch(() => "");
      return new NextResponse(txt || "[]", { status: listRes.status, headers: { "Content-Type": listRes.headers.get("Content-Type") ?? "application/json; charset=utf-8" } });
    }
    const list = (await listRes.json().catch(() => [])) as any[];
    const user = userRes.ok ? ((await userRes.json().catch(() => null)) as any) : null;
    const phoneNumber = String(user?.phoneNumber ?? "").trim();
    const merged = Array.isArray(list)
      ? list.map((a) => {
          const fromRow = String(a?.phoneNumber ?? "").trim();
          const fallbackProfile = phoneNumber || null;
          return { ...a, phoneNumber: fromRow || fallbackProfile };
        })
      : [];
    return NextResponse.json({ addresses: merged }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { accessToken, userId, base } = ctx;
  const body = await req.text().catch(() => "");
  try {
    const res = await fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses`, {
      method: "POST",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body,
    });
    const txt = await res.text().catch(() => "");
    return new NextResponse(txt || "{}", {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

