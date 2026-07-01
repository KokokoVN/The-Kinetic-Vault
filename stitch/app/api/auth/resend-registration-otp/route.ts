import { NextResponse } from "next/server";

function getApiRoot(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${prefix}`.replace(/\/+$/, "");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { identity?: string };
    const identity = String(body?.identity ?? "").trim();
    if (!identity) {
      return NextResponse.json({ ok: false, error: "MISSING" }, { status: 400 });
    }

    const res = await fetch(`${getApiRoot()}/registration/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity }),
      cache: "no-store",
    });

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: "NETWORK" }, { status: 502 });
  }
}
