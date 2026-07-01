import { NextResponse } from "next/server";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pid = String(id ?? "").trim();
  if (!pid) return NextResponse.json([], { status: 200 });
  const base = getResolvedApiRoot();
  try {
    const res = await fetch(`${base}/catalog/products/${encodeURIComponent(pid)}/variants`, { cache: "no-store" });
    const txt = await res.text().catch(() => "");
    return new NextResponse(txt || "[]", {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

