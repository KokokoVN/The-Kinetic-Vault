import { cookies } from "next/headers";
import { isAccessTokenExpired, getUsernameFromAccessToken } from "@/lib/auth";
import { StorefrontLayout } from "@/components/storefront-layout";
import { ShipmentTracker } from "@/components/shipment-tracker";

export const metadata = {
  title: "Tra cứu vận đơn – The Kinetic Vault",
  description: "Tra cứu trạng thái đơn hàng và lịch sử vận chuyển bằng mã vận đơn và 4 số cuối số điện thoại.",
};

export default async function TrackingPage() {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username}>
      <main style={{ background: "linear-gradient(180deg,#f5f7ff 0%,#ffffff 600px)" }}>
        <div className="mx-auto max-w-screen-2xl px-6 py-12">

          {/* Hero Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 12px 32px rgba(99,102,241,.35)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: "32px" }}>local_shipping</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "#0f0f23", letterSpacing: "-0.03em" }}>
              Tra cứu vận đơn
            </h1>
            <p className="mt-2 text-base font-medium" style={{ color: "rgba(0,0,0,.45)" }}>
              Nhập mã vận đơn (MVD) và 4 số cuối số điện thoại để theo dõi đơn hàng
            </p>
          </div>

          {/* Tracker Component */}
          <ShipmentTracker />

        </div>
      </main>
    </StorefrontLayout>
  );
}
