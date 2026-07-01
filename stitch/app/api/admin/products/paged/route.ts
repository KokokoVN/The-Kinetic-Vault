import { NextRequest, NextResponse } from "next/server";
import { apiUrl, adminCatalogHeaders, parseJsonSafe } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const backendUrl = apiUrl(`/catalog/admin/products/paged?${searchParams.toString()}`);

    const res = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
      headers: adminCatalogHeaders({
        accessToken: req.headers.get("Authorization")?.replace("Bearer ", "") || "",
        username: req.headers.get("X-Username") || "",
        userId: req.headers.get("X-User-Id") || "",
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from backend" }, { status: res.status });
    }

    const data = await parseJsonSafe(res);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
