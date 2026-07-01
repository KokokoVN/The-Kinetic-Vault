"use server";

import { getAdminSession } from "@/lib/auth-server";
import { clearAllAdminCarts } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function clearAllAdminCartsAction() {
  const session = await getAdminSession();
  if (!session.token) {
    return false;
  }
  
  const success = await clearAllAdminCarts({ accessToken: session.token });
  if (success) {
    revalidatePath("/admin/carts");
  }
  
  return success;
}
