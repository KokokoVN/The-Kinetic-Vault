import Link from "next/link";
import { getAdminSession } from "@/lib/auth-server";
import { searchAdminOrdersPage, getAdminRevenueTrends, getAdminLowStockAlerts, getAdminNewCustomersCount, getBackendProductById } from "@/lib/api";
import { DashboardUI } from "@/components/dashboard-ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAdminSession();
  
  // Fetch real data for dashboard
  const [
    recentOrdersResult, 
    processingResult, 
    revenueTrendsRaw, 
    lowStockRaw, 
    newCustomersCount
  ] = await Promise.all([
    searchAdminOrdersPage({ accessToken: session.token, size: 5 }),
    searchAdminOrdersPage({ accessToken: session.token, status: "CREATED", size: 1 }),
    getAdminRevenueTrends({ accessToken: session.token }),
    getAdminLowStockAlerts({ accessToken: session.token, threshold: 10 }),
    getAdminNewCustomersCount({ accessToken: session.token })
  ]);

  const recentOrders = recentOrdersResult.items;
  const totalOrders = recentOrdersResult.totalItems;
  const processingCount = processingResult.totalItems;
  
  // Map Revenue Trends for Chart (use last 7 days from API, or fallback if empty)
  const revenueTrends = revenueTrendsRaw.length > 0 ? revenueTrendsRaw.slice(-7) : [];
  const estimatedRevenue = revenueTrends.reduce((sum, item) => sum + Number(item.revenue), 0);

  // Calculate Revenue Growth vs previous month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  let currentMonthRev = 0;
  let lastMonthRev = 0;

  revenueTrendsRaw.forEach(item => {
    const d = new Date(item.date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      currentMonthRev += Number(item.revenue);
    } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
      lastMonthRev += Number(item.revenue);
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
        max: 100 // Visual max for progress bar
      };
    })
  );

  return (
    <DashboardUI 
      recentOrders={recentOrders}
      totalOrders={totalOrders}
      processingCount={processingCount}
      newCustomersCount={newCustomersCount}
      revenueTrends={revenueTrends}
      estimatedRevenue={estimatedRevenue}
      revenueGrowth={revenueGrowth}
      inventoryAlerts={inventoryAlerts}
    />
  );
}
