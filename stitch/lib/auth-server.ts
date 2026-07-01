import { cookies } from "next/headers";
import {
  canMutateCatalog,
  getRoleFromAccessToken,
  getUsernameFromAccessToken,
  isAccessTokenExpired,
} from "@/lib/auth";

export async function getAdminSession() {
  const jar = await cookies();
  const rawToken = jar.get("accessToken")?.value;
  // Token hết hạn thì coi như chưa đăng nhập để chặn gọi API admin bằng JWT cũ.
  const token = !rawToken || isAccessTokenExpired(rawToken) ? null : rawToken;
  const role = getRoleFromAccessToken(token);
  const username = getUsernameFromAccessToken(token);
  return {
    token,
    role,
    username,
    canMutateCatalog: canMutateCatalog(role),
  };
}
