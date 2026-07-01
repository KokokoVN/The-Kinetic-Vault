import { getAdminUserBrief } from "@/lib/api";
import { sendNotification } from "@/lib/notification-api";

/**
 * Gửi thông báo kênh WEB cho admin/staff đang thao tác (best-effort, không chặn luồng chính).
 * Cùng pattern với danh mục: recipient lấy từ hồ sơ user hoặc fallback username@gmail.com.
 */
export async function notifyAdminWebBestEffort(params: {
  accessToken: string | null | undefined;
  userId: string | null;
  username: string;
  scopeLabel: string;
  title: string;
  message: string;
}): Promise<void> {
  const { accessToken, userId, username, scopeLabel, title, message } = params;
  try {
    // Auto CRUD notifications are disabled by default.
    // Set ENABLE_ADMIN_AUTO_NOTIFY=true to re-enable.
    if (String(process.env.ENABLE_ADMIN_AUTO_NOTIFY ?? "").trim().toLowerCase() !== "true") return;
    if (!accessToken) return;
    const uid = Number(userId);
    const actor = Number.isFinite(uid) && uid > 0 ? await getAdminUserBrief(uid, { accessToken }) : null;
    const recipient = String(actor?.email ?? `${username}@gmail.com`).trim();
    if (!recipient) return;
    await sendNotification({
      channel: "WEB",
      recipient,
      subject: `[${scopeLabel}] ${title}`,
      body: message,
      html: false,
    });
  } catch {
    // Thông báo là phụ, không làm fail thao tác catalog.
  }
}
