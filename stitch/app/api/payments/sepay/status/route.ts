import { NextResponse } from "next/server";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentIdRaw = Number(url.searchParams.get("paymentId") ?? 0);
  const paymentId = Number.isFinite(paymentIdRaw) && paymentIdRaw > 0 ? Math.floor(paymentIdRaw) : null;
  if (!paymentId) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const paymentBase = (process.env.PAYMENT_SERVICE_URL ?? "http://localhost:8814").trim().replace(/\/+$/, "");
  const apiRoot = getResolvedApiRoot();

  try {
    const direct = await fetch(`${paymentBase}/${paymentId}`, { method: "GET", cache: "no-store" });
    if (direct.ok) {
      const json = await direct.json().catch(() => null);
      return NextResponse.json(json ?? {}, { status: 200 });
    }
    const gw = await fetch(`${apiRoot}/payments/${paymentId}`, { method: "GET", cache: "no-store" });
    const text = await gw.text().catch(() => "{}");
    return new NextResponse(text || "{}", { status: gw.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
  } catch {
    return NextResponse.json({ error: "UPSTREAM_ERROR" }, { status: 502 });
  }
}

