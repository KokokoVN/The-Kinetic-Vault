import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CartPageClient } from "@/components/cart-page-client";
import { StorefrontLayout } from "@/components/storefront-layout";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  if (!isLoggedIn) {
    redirect("/login?next=/cart");
  }
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;
  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="cart">
      <CartPageClient />
    </StorefrontLayout>
  );
}

