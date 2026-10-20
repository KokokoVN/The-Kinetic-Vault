import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-server";
import { canAccessAdminArea } from "@/lib/auth";
import {
  getAdminProductsPageForUi,
  searchAdminOrdersPage,
  listAdminCategories,
  listAdminUsers,
} from "@/lib/api";

const ADMIN_NAVIGATION = [
  { label: "Tổng quan", icon: "dashboard", href: "/admin/dashboard", keywords: ["dashboard", "tong quan", "thong ke", "doanh thu"] },
  { label: "Sản phẩm", icon: "inventory_2", href: "/admin/products", keywords: ["san pham", "hang hoa", "product", "item"] },
  { label: "Thêm sản phẩm mới", icon: "add_box", href: "/admin/products/new", keywords: ["them san pham", "tao san pham", "new product"] },
  { label: "Danh mục", icon: "category", href: "/admin/categories", keywords: ["danh muc", "category", "loai hang"] },
  { label: "Thương hiệu", icon: "stars", href: "/admin/brands", keywords: ["thuong hieu", "brand", "hang"] },
  { label: "Kho hàng", icon: "warehouse", href: "/admin/inventory", keywords: ["kho", "kho hang", "inventory", "ton kho"] },
  { label: "Đơn hàng", icon: "shopping_cart", href: "/admin/orders", keywords: ["don hang", "order", "hoa don", "don"] },
  { label: "Giỏ hàng", icon: "shopping_bag", href: "/admin/carts", keywords: ["gio hang", "cart"] },
  { label: "Khách hàng", icon: "group", href: "/admin/customers", keywords: ["khach hang", "customer", "user", "nguoi dung"] },
  { label: "Khuyến mãi", icon: "local_offer", href: "/admin/sales", keywords: ["khuyen mai", "sale", "giam gia", "voucher"] },
  { label: "Nhật ký hệ thống", icon: "history", href: "/admin/activity-log", keywords: ["nhat ky", "log", "activity", "lich su"] },
  { label: "Hộp thư thông báo", icon: "mail", href: "/admin/notifications", keywords: ["hop thu", "thong bao", "notification", "mail"] },
  { label: "Báo cáo doanh thu", icon: "monitoring", href: "/admin/reports", keywords: ["bao cao", "report", "analytics", "doanh so"] },
];

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.token || !canAccessAdminArea(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get("q") ?? "").trim();

  if (!q) {
    return NextResponse.json({
      query: "",
      navLinks: [],
      products: [],
      orders: [],
      categories: [],
      customers: [],
    });
  }

  const qNorm = removeVietnameseTones(q);

  try {
    // 1. Filter Navigation Quick Jumps
    const matchingNav = ADMIN_NAVIGATION.filter((item) => {
      const labelNorm = removeVietnameseTones(item.label);
      if (labelNorm.includes(qNorm)) return true;
      return item.keywords.some((kw) => kw.includes(qNorm) || qNorm.includes(kw));
    }).slice(0, 4);

    // 2. Concurrently fetch products, orders, categories, users
    const [productsResult, ordersResult, categoriesResult, usersResult] = await Promise.allSettled([
      getAdminProductsPageForUi({
        q,
        size: 5,
        accessToken: session.token,
      }),
      searchAdminOrdersPage({
        q,
        size: 5,
        accessToken: session.token,
      }),
      listAdminCategories({
        accessToken: session.token,
      }),
      listAdminUsers({
        accessToken: session.token,
      }),
    ]);

    // Parse products
    const products =
      productsResult.status === "fulfilled"
        ? (productsResult.value.items || []).slice(0, 5).map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || "",
            price: p.price,
            heroImage: p.heroImage || "",
            stock: p.stock,
            status: p.status,
            href: `/admin/products/${p.id}`,
          }))
        : [];

    // Parse orders
    const orders =
      ordersResult.status === "fulfilled"
        ? (ordersResult.value.items || []).slice(0, 5).map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber || (o.id ? `#${o.id}` : "—"),
            userName: o.userName || "Khách hàng",
            total: o.total ? `${Number(o.total).toLocaleString("vi-VN")} VND` : "0 VND",
            status: o.status || "PENDING",
            paymentStatus: o.paymentStatus || "UNPAID",
            href: `/admin/orders/${o.id}`,
          }))
        : [];

    // Parse categories
    const allCategories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    const categories = allCategories
      .filter((c) => {
        const nameNorm = removeVietnameseTones(String(c.name ?? ""));
        const slugNorm = removeVietnameseTones(String(c.slug ?? ""));
        return nameNorm.includes(qNorm) || slugNorm.includes(qNorm) || String(c.id) === q.trim();
      })
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug || "",
        href: `/admin/categories?q=${encodeURIComponent(c.name)}`,
      }));

    // Parse users / customers
    const allUsers = usersResult.status === "fulfilled" ? usersResult.value : [];
    const customers = allUsers
      .filter((u) => {
        const userNorm = removeVietnameseTones(String(u.userName ?? ""));
        const emailNorm = String(u.email ?? "").toLowerCase();
        const phone = String(u.phoneNumber ?? "");
        return userNorm.includes(qNorm) || emailNorm.includes(q.toLowerCase()) || phone.includes(q);
      })
      .slice(0, 4)
      .map((u) => ({
        id: u.id,
        userName: u.userName || "—",
        email: u.email || "",
        phoneNumber: u.phoneNumber || "",
        role: u.role?.roleName || "USER",
        href: `/admin/customers?q=${encodeURIComponent(u.userName || "")}`,
      }));

    return NextResponse.json({
      query: q,
      navLinks: matchingNav,
      products,
      orders,
      categories,
      customers,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm tổng quan admin:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi tìm kiếm" },
      { status: 500 }
    );
  }
}
