import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import {
  searchAdminOrdersPage,
  getAdminRevenueTrends,
  getAdminLowStockAlerts,
  getAdminNewCustomersCount,
  getBackendProductById,
} from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session.token || (session.role !== "ROLE_ADMIN" && session.role !== "ROLE_STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typesParam = searchParams.get("types") || "";
    const types = typesParam.split(",").map((t) => t.trim().toLowerCase());
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const result: any = {};

    // Parallel fetch based on requested types
    const promises = [];

    if (types.includes("revenue")) {
      promises.push(
        getAdminRevenueTrends({ accessToken: session.token, startDate, endDate })
          .then((data) => (result.revenue = data))
          .catch(() => (result.revenue = []))
      );
    }

    if (types.includes("orders")) {
      promises.push(
        searchAdminOrdersPage({ accessToken: session.token, size: 50 })
          .then((data) => (result.orders = data.items))
          .catch(() => (result.orders = []))
      );
    }

    if (types.includes("inventory")) {
      promises.push(
        getAdminLowStockAlerts({ accessToken: session.token, threshold: 20 })
          .then(async (raw) => {
            const mapped = await Promise.all(
              (raw || []).map(async (item) => {
                const product = await getBackendProductById(String(item.productId));
                return {
                  productId: item.productId,
                  name: product?.productName || `Sản phẩm #${item.productId}`,
                  sku: product?.sku || "N/A",
                  stock: item.quantityOnHand || 0,
                };
              })
            );
            result.inventory = mapped;
          })
          .catch(() => (result.inventory = []))
      );
    }

    if (types.includes("customers")) {
      promises.push(
        getAdminNewCustomersCount({ accessToken: session.token, startDate, endDate })
          .then((count) => (result.customers = count))
          .catch(() => (result.customers = 0))
      );
    }

    await Promise.all(promises);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
