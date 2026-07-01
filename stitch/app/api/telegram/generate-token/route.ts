import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { apiUrl, adminCatalogHeaders } from "@/lib/api";

export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session.token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(apiUrl("/telegram/generate-token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminCatalogHeaders({ accessToken: session.token }),
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Failed to generate token", details: errText, status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
