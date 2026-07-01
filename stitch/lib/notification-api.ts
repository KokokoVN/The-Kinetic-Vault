export type NotificationMessage = {
  id: number;
  channel?: string | null;
  recipient?: string | null;
  subject?: string | null;
  body?: string | null;
  status?: string | null;
  source?: string | null;
  createdAt?: string | number[] | null;
};

export type NotificationSourceFilter = "ADMIN" | "SYSTEM" | "ALL";

type SendNotificationInput = {
  channel: string;
  recipient: string;
  subject?: string;
  body?: string;
  html?: boolean;
};

function getNotificationBase(): string {
  return (process.env.NOTIFICATION_SERVICE_URL ?? "http://localhost:8815").replace(/\/+$/, "");
}

export async function sendNotification(input: SendNotificationInput): Promise<NotificationMessage | null> {
  try {
    const res = await fetch(`${getNotificationBase()}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as NotificationMessage;
  } catch {
    return null;
  }
}

export async function listNotificationsByEmail(email: string): Promise<NotificationMessage[]> {
  const q = email.trim();
  if (!q) return [];
  try {
    const res = await fetch(`${getNotificationBase()}/lookup?email=${encodeURIComponent(q)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as NotificationMessage[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function listNotificationsByEmailAndSource(
  email: string,
  source: NotificationSourceFilter = "ADMIN",
): Promise<NotificationMessage[]> {
  const list = await listNotificationsByEmail(email);
  if (source === "ALL") return list;
  return list.filter((item) => String(item.source ?? "SYSTEM").toUpperCase() === source);
}

export async function markNotificationRead(id: number): Promise<NotificationMessage | null> {
  try {
    const res = await fetch(`${getNotificationBase()}/${encodeURIComponent(String(id))}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as NotificationMessage;
  } catch {
    return null;
  }
}

export async function getNotificationById(id: number): Promise<NotificationMessage | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  try {
    const res = await fetch(`${getNotificationBase()}/${encodeURIComponent(String(Math.floor(id)))}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as NotificationMessage;
  } catch {
    return null;
  }
}
