import { NextResponse } from "next/server";

type ProvinceRow = { code: number; name: string };
type WardRow = { code: number; name: string };

// API v2: dữ liệu sau sáp nhập 07/2025 (Province -> Wards)
const OPEN_API_BASE = "https://provinces.open-api.vn/api/v2";

async function fetchJson(url: string) {
  const res = await fetch(url, { method: "GET", next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`UPSTREAM_${res.status}`);
  }
  return res.json();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = String(searchParams.get("type") ?? "").trim().toLowerCase();
  const provinceCode = String(searchParams.get("provinceCode") ?? "").trim();

  try {
    if (type === "provinces") {
      const data = (await fetchJson(`${OPEN_API_BASE}/p/`)) as ProvinceRow[];
      const rows = Array.isArray(data)
        ? data.map((x) => ({ code: String(x.code), name: String(x.name ?? "").trim() })).filter((x) => x.code && x.name)
        : [];
      return NextResponse.json({ rows }, { status: 200 });
    }

    if (type === "wards") {
      if (!provinceCode) return NextResponse.json({ error: "MISSING_PROVINCE_CODE" }, { status: 400 });
      const data = (await fetchJson(`${OPEN_API_BASE}/p/${encodeURIComponent(provinceCode)}?depth=2`)) as { wards?: WardRow[] };
      const rows = Array.isArray(data?.wards)
        ? data.wards.map((x) => ({ code: String(x.code), name: String(x.name ?? "").trim() })).filter((x) => x.code && x.name)
        : [];
      return NextResponse.json({ rows }, { status: 200 });
    }

    return NextResponse.json({ error: "INVALID_TYPE" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "VN_ADDRESS_PROVIDER_UNAVAILABLE" }, { status: 502 });
  }
}

