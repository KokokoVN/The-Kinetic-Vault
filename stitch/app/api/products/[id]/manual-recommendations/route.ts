import { NextResponse } from "next/server";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

/**
 * GET /api/products/[id]/manual-recommendations
 * Proxy tới product-recommendation-service để lấy danh sách sản phẩm gợi ý thủ công.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pid = String(id ?? "").trim();
  if (!pid || isNaN(Number(pid))) {
    return NextResponse.json([], { status: 200 });
  }

  const base = getResolvedApiRoot();
  try {
    const upstream = await fetch(
      `${base}/review/products/${encodeURIComponent(pid)}/manual-recommendations`,
      { cache: "no-store" },
    );
    const txt = await upstream.text().catch(() => "");
    return new NextResponse(txt || "[]", {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

/**
 * POST /api/products/[id]/manual-recommendations
 * Thêm gợi ý sản phẩm thủ công cho sản phẩm nguồn.
 * Body JSON: { targetProductId, sortOrder?, reason?, performedBy? }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pid = String(id ?? "").trim();
  if (!pid || isNaN(Number(pid))) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const base = getResolvedApiRoot();
  try {
    const upstream = await fetch(
      `${base}/review/products/${encodeURIComponent(pid)}/manual-recommendations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const txt = await upstream.text().catch(() => "");
    return new NextResponse(txt || "{}", {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

/**
 * DELETE /api/products/[id]/manual-recommendations?rowId=X&performedBy=admin
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pid = String(id ?? "").trim();
  if (!pid || isNaN(Number(pid))) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const url = new URL(req.url);
  const rowId = url.searchParams.get("rowId") ?? "";
  const performedBy = url.searchParams.get("performedBy") ?? "";
  if (!rowId || isNaN(Number(rowId))) {
    return NextResponse.json({ error: "Missing rowId" }, { status: 400 });
  }

  const qs = performedBy ? `?performedBy=${encodeURIComponent(performedBy)}` : "";
  const base = getResolvedApiRoot();
  try {
    const upstream = await fetch(
      `${base}/review/products/${encodeURIComponent(pid)}/manual-recommendations/${encodeURIComponent(rowId)}${qs}`,
      { method: "DELETE", cache: "no-store" },
    );
    return new NextResponse(null, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}
