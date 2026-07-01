import { getChatbotServicePostUrl } from "@/app/api/cart/_shared";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const upstream = getChatbotServicePostUrl();
  try {
    const res = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      try {
        return NextResponse.json(JSON.parse(text), { status: res.status });
      } catch {
        return NextResponse.json(
          {
            error: "Upstream returned invalid JSON",
            detail: text.slice(0, 500),
            upstream,
          },
          { status: 502 }
        );
      }
    }
    return NextResponse.json(
      {
        error: "Unexpected upstream response",
        status: res.status,
        detail: text.slice(0, 500),
        upstream,
      },
      { status: res.ok ? 200 : 502 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Proxy error";
    const hint =
      "Kiểm tra: (1) API Gateway :8900 đang chạy, hoặc đặt CHATBOT_SERVICE_URL=http://127.0.0.1:8816/chat trong stitch/.env.local; (2) ai-chatbot-service :8816 đang chạy.";
    return NextResponse.json(
      {
        error: "Không kết nối được chatbot",
        detail: msg,
        upstream,
        hint,
      },
      { status: 502 }
    );
  }
}
