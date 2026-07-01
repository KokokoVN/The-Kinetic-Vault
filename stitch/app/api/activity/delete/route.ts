import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getResolvedApiRoot } from "@/app/api/cart/_shared";

type DeleteBody = {
  ids?: unknown;
};

function normalizeIds(raw: unknown): number[] {
  const list = Array.isArray(raw) ? raw : [];
  const normalized = list
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => Math.floor(n));
  return Array.from(new Set(normalized));
}

export async function POST(req: Request) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: DeleteBody | null = null;
  try {
    body = (await req.json()) as DeleteBody;
  } catch {
    body = null;
  }
  const ids = normalizeIds(body?.ids);
  if (!ids.length) {
    return NextResponse.json({ deleted: 0 }, { status: 200 });
  }

  const apiRoot = getResolvedApiRoot();
  try {
    const upstream = await fetch(`${apiRoot}/activity/batch`, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ids }),
    });
    const text = await upstream.text();
    return new NextResponse(text || "{\"deleted\":0}", {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "NETWORK_ERROR" }, { status: 502 });
  }
}
