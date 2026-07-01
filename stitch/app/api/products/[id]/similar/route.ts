import { NextResponse } from "next/server";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

/**
 * GET /api/products/[id]/similar
 * Proxy tới product-recommendation-service để lấy sản phẩm liên quan.
 * Query params:
 *   - limit (optional, default 8, max 24)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pid = String(id ?? "").trim();
  if (!pid || isNaN(Number(pid))) {
    return NextResponse.json([], { status: 200 });
  }

  const url = new URL(req.url);
  const limit = Math.min(24, Math.max(1, Number(url.searchParams.get("limit") ?? "8")));

  const base = getResolvedApiRoot();
  try {
    const upstream = await fetch(
      `${base}/review/products/${encodeURIComponent(pid)}/similar-recommendations?limit=${limit}`,
      { cache: "no-store" },
    );
    const txt = await upstream.text().catch(() => "");
    return new NextResponse(txt || "[]", {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}
