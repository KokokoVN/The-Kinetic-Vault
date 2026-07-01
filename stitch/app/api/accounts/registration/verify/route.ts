import { NextResponse } from "next/server";

function getApiRoot(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${prefix}`.replace(/\/+$/, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const identity = String(searchParams.get("identity") ?? "").trim();
  const otp = String(searchParams.get("otp") ?? "").trim();
  const token = String(searchParams.get("token") ?? "").trim();

  if (!identity || !otp) {
    return NextResponse.json({ ok: false, error: "MISSING" }, { status: 400 });
  }

  const qp = new URLSearchParams();
  qp.set("identity", identity);
  qp.set("otp", otp);
  if (token) qp.set("token", token);

  try {
    const res = await fetch(`${getApiRoot()}/registration/verify?${qp.toString()}`, {
      method: "GET",
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: "NETWORK" }, { status: 502 });
  }
}
