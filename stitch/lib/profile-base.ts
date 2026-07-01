export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8900/api").trim();
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");
  const prefix = raw.startsWith("/") ? raw : `/${raw}`;
  const origin = (process.env.API_SERVER_ORIGIN ?? "http://localhost:8900").replace(/\/+$/, "");
  return `${origin}${prefix}`.replace(/\/+$/, "");
}
