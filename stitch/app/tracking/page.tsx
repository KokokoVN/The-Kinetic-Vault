import { cookies } from "next/headers";
import { isAccessTokenExpired, getUsernameFromAccessToken } from "@/lib/auth";
import { StorefrontLayout } from "@/components/storefront-layout";
import { ShipmentTracker } from "@/components/shipment-tracker";

export const metadata = {
  title: "Tra cứu vận đơn – The Kinetic Vault",
  description: "Tra cứu trạng thái đơn hàng và lịch sử vận chuyển bằng mã vận đơn và 4 số cuối số điện thoại.",
};

export default async function TrackingPage({
  searchParams,
}: {
  searchParams?: Promise<{ mvd?: string; phone?: string }>;
}) {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
  const username = isLoggedIn ? getUsernameFromAccessToken(accessToken) : null;

  const sp = (await searchParams) ?? {};
  const mvd = String(sp.mvd ?? "").trim();
  const phone = String(sp.phone ?? "").trim();

  return (
    <StorefrontLayout isLoggedIn={isLoggedIn} username={username}>
      <div className="relative min-h-screen overflow-hidden bg-slate-50/50 dark:bg-[#060813] text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 dark:purple-500/5 blur-[150px]" />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-6 py-12">
          {/* Hero Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-500/30">
              <span className="material-symbols-outlined text-[32px]">local_shipping</span>
            </div>
            <h1 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Tra Cứu Vận Đơn
            </h1>
            <p className="mt-2 text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400">
              Nhập mã vận đơn (MVD) và 4 số cuối số điện thoại để theo dõi đơn hàng
            </p>
          </div>

          {/* Tracker Component */}
          <ShipmentTracker
            initialMvd={mvd}
            initialPhone={phone}
            autoFetch={Boolean(mvd && phone)}
          />
        </div>
      </div>
    </StorefrontLayout>
  );
}
