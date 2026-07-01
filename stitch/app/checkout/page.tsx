import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUsernameFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { CheckoutPageClient } from "@/components/checkout-page-client";
import { StorefrontLayout } from "@/components/storefront-layout";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  if (!isLoggedIn) {
    redirect("/login?next=/checkout");
  }
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;
  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username} activeMenu="cart">
      <CheckoutPageClient />
    </StorefrontLayout>
  );
}

