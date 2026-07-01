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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const { accessToken, userId, base } = ctx;
  const body = await req.text().catch(() => "");
  try {
    const res = await fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses/${encodeURIComponent(id)}`, {
      method: "PUT",
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

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const { accessToken, userId, base } = ctx;
  try {
    const res = await fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses/${encodeURIComponent(id)}`, {
      method: "DELETE",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const txt = await res.text().catch(() => "");
    return new NextResponse(txt || "", {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await authContext();
  if ("error" in ctx) return ctx.error;
  const { id } = await params;
  const { accessToken, userId, base } = ctx;
  try {
    const res = await fetch(`${base}/accounts/users/${encodeURIComponent(String(userId))}/addresses/${encodeURIComponent(id)}/default`, {
      method: "PATCH",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
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

