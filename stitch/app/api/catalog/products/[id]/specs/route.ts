import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pid = String(id ?? "").trim();
  if (!pid) return NextResponse.json([], { status: 200 });

  const catalogOrigin = (process.env.CATALOG_SERVICE_ORIGIN ?? "http://127.0.0.1:8810").trim();
  try {
    const res = await fetch(`${catalogOrigin}/admin/products/${encodeURIComponent(pid)}/specs`, {
      cache: "no-store",
    });
    const txt = await res.text().catch(() => "");
    return new NextResponse(txt || "[]", {
      status: res.status,
      headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
