import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type UserAddress = {
  id?: number | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
  streetLine?: string | null;
  fullAddress?: string | null;
  phoneNumber?: string | null;
};

async function authContext() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  if (!accessToken) {
    return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  }
  const userId = getUserIdFromAccessToken(accessToken);
  if (!userId) {
    return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  }
  const base = getResolvedApiRoot();
  return { accessToken, userId, base } as const;
}

async function getDefaultAddressId(base: string, accessToken: string, userId: number | string) {
  const res = await fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}/address`, {
    method: "GET",
    cache: "no-store",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const row = (await res.json().catch(() => null)) as UserAddress | null;
  if (row?.id == null) return null;
  return Number(row.id);
}

async function proxyWithAuth(method: "POST" | "PUT" | "PATCH" | "DELETE", req?: Request, suffix = "") {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { accessToken, userId, base } = ctx;
  let url = `${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses${suffix}`;
  let bodyText: string | undefined;
  if (req) {
    bodyText = await req.text().catch(() => "");
  }
  try {
    if (method === "PUT" || method === "PATCH" || method === "DELETE") {
      const id = await getDefaultAddressId(base, accessToken, userId);
      if (!id) {
        return NextResponse.json({ error: "ADDRESS_NOT_FOUND" }, { status: 404 });
      }
      url = `${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses/${encodeURIComponent(String(id))}${suffix}`;
    }
    const res = await fetch(url, {
      method,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(bodyText ? { "Content-Type": "application/json" } : {}),
      },
      ...(bodyText ? { body: bodyText } : {}),
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

export async function GET() {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { accessToken, userId, base } = ctx;
  const url = `${base}/accounts/users/${encodeURIComponent(String(userId))}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return new NextResponse(txt || "{}", {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json; charset=utf-8" },
      });
    }
    const data = (await res.json().catch(() => null)) as any;
    const addr = (data?.userDetails?.address ?? null) as UserAddress | null;
    const phoneNumber = String(data?.phoneNumber ?? "").trim();
    const merged = addr ? { ...addr, phoneNumber: phoneNumber || null } : null;
    return NextResponse.json({ address: merged }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  return proxyWithAuth("POST", req);
}

export async function PUT(req: Request) {
  return proxyWithAuth("PUT", req);
}

export async function DELETE() {
  return proxyWithAuth("DELETE");
}

export async function PATCH() {
  return proxyWithAuth("PATCH", undefined, "/default");
}

