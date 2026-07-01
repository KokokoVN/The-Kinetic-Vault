import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromAccessToken } from "@/lib/auth";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type ManualOrderLineItem = {
  productId: number;
  quantity: number;
  variantId?: number | null;
  variantLabel?: string | null;
};

type ManualOrderCreateRequest = {
  userId?: number | null;
  shippingAddress?: string | null;
  phoneNumber?: string | null;
  paymentMethod?: string | null;
  voucherCode?: string | null;
  items?: ManualOrderLineItem[] | null;
};

function normalizePaymentMethod(raw: unknown): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  return v.toUpperCase();
}

function normalizeItems(raw: unknown): ManualOrderLineItem[] {
  const list = Array.isArray(raw) ? (raw as unknown[]) : [];
  const out: ManualOrderLineItem[] = [];
  for (const it of list) {
    if (!it || typeof it !== "object") continue;
    const obj = it as Record<string, unknown>;
    const productId = Number(obj.productId ?? 0);
    const quantity = Math.max(1, Math.floor(Number(obj.quantity ?? 0)));
    if (!Number.isFinite(productId) || productId <= 0) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    const variantIdRaw = obj.variantId;
    const variantId = variantIdRaw == null ? null : Number(variantIdRaw);
    out.push({
      productId,
      quantity,
      variantId: Number.isFinite(variantId as number) && Number(variantId) > 0 ? Number(variantId) : null,
      variantLabel: typeof obj.variantLabel === "string" ? obj.variantLabel : null,
    });
  }
  return out;
}

export async function POST(req: Request) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  const derivedUserId = accessToken ? getUserIdFromAccessToken(accessToken) : null;

  let body: ManualOrderCreateRequest | null = null;
  try {
    body = (await req.json()) as ManualOrderCreateRequest;
  } catch {
    body = null;
  }

  const items = normalizeItems(body?.items);
  if (!items.length) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Thiếu danh sách sản phẩm." }, { status: 400 });
  }

  const userIdRaw = Number(body?.userId ?? derivedUserId ?? 0);
  const userId = Number.isFinite(userIdRaw) && userIdRaw > 0 ? Math.floor(userIdRaw) : null;
  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Bạn cần đăng nhập để tạo đơn." }, { status: 401 });
  }

  const upstreamBody: ManualOrderCreateRequest = {
    userId,
    shippingAddress: typeof body?.shippingAddress === "string" ? body.shippingAddress : null,
    phoneNumber: typeof body?.phoneNumber === "string" ? body.phoneNumber.trim() || null : null,
    paymentMethod: normalizePaymentMethod(body?.paymentMethod),
    voucherCode: typeof body?.voucherCode === "string" ? body.voucherCode : null,
    items,
  };

  const base = getResolvedApiRoot();
  const url = `${base}/shop/orders/manual`;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const upstream = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(upstreamBody),
    });
    const text = await upstream.text();
    return new NextResponse(text || "{}", {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}

