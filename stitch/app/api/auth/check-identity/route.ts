import { NextResponse } from "next/server";

function getApiRoot(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  return `${origin}${prefix}`.replace(/\/+$/, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = String(searchParams.get("username") ?? "").trim();
  const email = String(searchParams.get("email") ?? "").trim();
  const identity = String(searchParams.get("identity") ?? "").trim();

  const qp = new URLSearchParams();
  if (username) qp.set("username", username);
  if (email) {
    qp.set("email", email);
    qp.set("contact", email);
  }
  if (identity) qp.set("identity", identity);

  try {
    const res = await fetch(`${getApiRoot()}/registration/check?${qp.toString()}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ usernameExists: false, emailExists: false, identityExists: false }, { status: 200 });
    }
    const data = (await res.json()) as {
      usernameExists?: boolean;
      emailExists?: boolean;
      contactExists?: boolean;
      identityExists?: boolean;
    };
    return NextResponse.json({
      usernameExists: Boolean(data?.usernameExists),
      emailExists: Boolean(data?.emailExists || data?.contactExists || data?.identityExists),
      identityExists: Boolean(data?.identityExists || data?.contactExists),
    });
  } catch {
    return NextResponse.json({ usernameExists: false, emailExists: false, identityExists: false }, { status: 200 });
  }
}
