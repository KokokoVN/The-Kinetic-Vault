import { NextResponse } from "next/server";

function getResolvedApiRoot(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, "");
  }
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  return `${origin}${prefix}`.replace(/\/+$/, "");
}

function getBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i);
  if (bearer?.[1]?.trim()) return bearer[1].trim();

  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((s) => s.trim())
    .find((c) => c.startsWith("accessToken=") || c.startsWith("token="));
  if (token) {
    const idx = token.indexOf("=");
    const raw = token.slice(idx + 1).trim();
    if (raw) return raw;
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "").trim();
  const excludeIdRaw = (searchParams.get("excludeId") ?? "").trim();
  const excludeId = Number(excludeIdRaw);

  if (!name) {
    return NextResponse.json({ exists: false });
  }

  const accessToken = getBearerToken(req);

  try {
    const base = getResolvedApiRoot();
    const p = new URLSearchParams();
    p.set("name", name);
    if (Number.isFinite(excludeId) && excludeId > 0) {
      p.set("excludeId", String(excludeId));
    }
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${base}/catalog/admin/categories/check-name?${p.toString()}`, {
      cache: "no-store",
      headers,
    });
    if (!res.ok) {
      return NextResponse.json(
        { exists: false, error: res.status === 401 ? "UNAUTHORIZED" : "UPSTREAM_ERROR" },
        { status: res.status === 401 ? 401 : 502 },
      );
    }

    const data = (await res.json().catch(() => ({ exists: false }))) as { exists?: boolean; error?: string };
    return NextResponse.json({ exists: Boolean(data?.exists), error: data?.error });
  } catch {
    return NextResponse.json({ exists: false, error: "NETWORK_ERROR" }, { status: 502 });
  }
}
