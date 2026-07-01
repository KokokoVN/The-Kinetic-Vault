"use server";

import { requestPasswordlessOtp } from "@/lib/api";

export async function requestOtpAction(identity: string, deviceFingerprint: string) {
  try {
    const res = await requestPasswordlessOtp(identity, deviceFingerprint);
    return { success: true, message: res.message };
  } catch (e: any) {
    return { success: false, error: e.message || "Lỗi không xác định" };
  }
}
