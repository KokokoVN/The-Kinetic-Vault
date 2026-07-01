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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "").trim();
  const excludeIdRaw = (searchParams.get("excludeId") ?? "").trim();
  const excludeId = Number(excludeIdRaw);
  if (!name) {
    return NextResponse.json({ exists: false });
  }

  try {
    const base = getResolvedApiRoot();
    const res = await fetch(`${base}/catalog/products?name=${encodeURIComponent(name)}`, {
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json({ exists: false });
    }
    if (!res.ok) {
      return NextResponse.json({ exists: false, error: "UPSTREAM_ERROR" }, { status: 502 });
    }

    const data = (await res.json().catch(() => [])) as Array<{ id?: number; productName?: string }>;
    const exists = Array.isArray(data)
      ? data.some((p) => {
          const pid = Number(p?.id ?? 0);
          if (Number.isFinite(excludeId) && excludeId > 0 && pid === excludeId) {
            return false;
          }
          return String(p?.productName ?? "").trim().toLowerCase() === name.toLowerCase();
        })
      : false;
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false, error: "NETWORK_ERROR" }, { status: 502 });
  }
}
