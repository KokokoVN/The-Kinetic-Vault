import { getAdminSession } from "@/lib/auth-server";
import {
  searchAdminOrdersPage,
  getAdminRevenueTrends,
  getAdminLowStockAlerts,
  getAdminNewCustomersCount,
  getBackendProductById,
  getAdminProductsPageForUi,
} from "@/lib/api";
import { DashboardUI } from "@/components/dashboard-ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAdminSession();

  // Fetch real data for dashboard from multiple microservices concurrently
  const [
    recentOrdersResult,
    processingResult,
    confirmedResult,
    shippingResult,
    deliveredResult,
    productsResult,
    revenueTrendsRaw,
    lowStockRaw,
    newCustomersCount,
  ] = await Promise.all([
    searchAdminOrdersPage({ accessToken: session.token, size: 6 }),
    searchAdminOrdersPage({ accessToken: session.token, status: "CREATED", size: 1 }),
    searchAdminOrdersPage({ accessToken: session.token, status: "CONFIRMED", size: 1 }),
    searchAdminOrdersPage({ accessToken: session.token, status: "SHIPPED", size: 1 }),
    searchAdminOrdersPage({ accessToken: session.token, status: "DELIVERED", size: 1 }),
    getAdminProductsPageForUi({ accessToken: session.token, size: 1 }),
    getAdminRevenueTrends({ accessToken: session.token }),
    getAdminLowStockAlerts({ accessToken: session.token, threshold: 10 }),
    getAdminNewCustomersCount({ accessToken: session.token }),
  ]);

  const recentOrders = recentOrdersResult.items;
  const totalOrders = recentOrdersResult.totalItems;
  const processingCount = processingResult.totalItems;
  const confirmedCount = confirmedResult.totalItems;
  const shippingCount = shippingResult.totalItems;
  const deliveredCount = deliveredResult.totalItems;
  const totalProducts = productsResult.totalElements || 0;

  // Build a continuous 7-day timeline from 6 days ago through today
  const today = new Date();
  const last7DaysMap: Array<{ date: string; revenue: number; orderCount: number; label: string }> = [];

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  function matchesDate(createdAt: unknown, dateStr: string): boolean {
    if (!createdAt) return false;
    if (typeof createdAt === "string") return createdAt.startsWith(dateStr);
    if (Array.isArray(createdAt) && createdAt.length >= 3) {
      const y = String(createdAt[0]).padStart(4, "0");
      const m = String(createdAt[1]).padStart(2, "0");
      const d = String(createdAt[2]).padStart(2, "0");
      return `${y}-${m}-${d}` === dateStr;
    }
    return false;
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = dayNames[d.getDay()];

    const foundTrend = revenueTrendsRaw.find(
      (item) => item.date === dateStr || item.date?.startsWith(dateStr)
    );
    const rev = foundTrend ? Number(foundTrend.revenue) || 0 : 0;

    const orderMatches = (recentOrdersResult.items || []).filter((o) =>
      matchesDate(o.createdAt, dateStr)
    ).length;

    last7DaysMap.push({
      date: dateStr,
      revenue: rev,
      orderCount: orderMatches,
      label: `${dayLabel} ${d.getDate()}/${d.getMonth() + 1}`,
    });
  }

  const estimatedRevenue = last7DaysMap.reduce((sum, item) => sum + item.revenue, 0);

  // Calculate Revenue Growth vs previous month
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  let currentMonthRev = 0;
  let lastMonthRev = 0;

  revenueTrendsRaw.forEach((item) => {
    const d = new Date(item.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      currentMonthRev += Number(item.revenue) || 0;
    } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
      lastMonthRev += Number(item.revenue) || 0;
    }
  });

  let revenueGrowth = 0;
  if (lastMonthRev > 0) {
    revenueGrowth = ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100;
  } else if (currentMonthRev > 0) {
    revenueGrowth = 100;
  }

  // Fetch product names for low stock items
  const inventoryAlerts = await Promise.all(
    (lowStockRaw || []).map(async (item) => {
      const product = await getBackendProductById(String(item.productId));
      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: product?.productName || `Sản phẩm #${item.productId}`,
        sku: product?.sku || "N/A",
        stock: item.quantityOnHand || 0,
        max: 100, // Visual max for progress bar
      };
    })
  );

  return (
    <DashboardUI
      username={session.username}
      userRole={session.role}
      recentOrders={recentOrders}
      totalOrders={totalOrders}
      processingCount={processingCount}
      confirmedCount={confirmedCount}
      shippingCount={shippingCount}
      deliveredCount={deliveredCount}
      totalProducts={totalProducts}
      newCustomersCount={newCustomersCount}
      revenueTrends={last7DaysMap}
      estimatedRevenue={estimatedRevenue}
      revenueGrowth={revenueGrowth}
      inventoryAlerts={inventoryAlerts}
    />
  );
}
