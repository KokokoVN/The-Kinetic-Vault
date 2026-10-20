import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { searchProductsForUi, listPublicCategories, listMyOrders, resolveCatalogImageUrl } from "@/lib/api";
import { getUserIdFromAccessToken, isAccessTokenExpired } from "@/lib/auth";
import { listActivePrograms } from "@/lib/sale-api";

export const dynamic = "force-dynamic";

const STOREFRONT_NAVIGATION = [
  {
    label: "Đơn hàng của tôi",
    icon: "receipt_long",
    description: "Theo dõi tiến độ, tra cứu lịch sử mua hàng và hóa đơn",
    href: "/my-orders",
    keywords: ["don hang", "don", "order", "my orders", "tra cuu don", "hoa don", "lich su mua", "mua hang", "shipment"],
  },
  {
    label: "Giỏ hàng",
    icon: "shopping_cart",
    description: "Xem và thanh toán các sản phẩm đã chọn trong giỏ",
    href: "/cart",
    keywords: ["gio hang", "cart", "thanh toan", "gio", "checkout", "mua ngay"],
  },
  {
    label: "Tất cả sản phẩm",
    icon: "storefront",
    description: "Khám phá danh mục thiết bị công nghệ & phụ kiện cao cấp",
    href: "/products",
    keywords: ["san pham", "cua hang", "shop", "products", "danh muc", "tat ca", "hang hoa", "thiet bi"],
  },
  {
    label: "Hộp thư thông báo",
    icon: "notifications",
    description: "Cập nhật trạng thái đơn hàng, ưu đãi và tin hệ thống",
    href: "/notifications",
    keywords: ["thong bao", "notification", "hop thu", "tin nhan", "tin tuc", "alerts"],
  },
  {
    label: "Trang chủ",
    icon: "home",
    description: "The Kinetic Vault - Siêu thị công nghệ Cyber Flagship",
    href: "/",
    keywords: ["trang chu", "home", "the kinetic vault", "cyber flagship", "store"],
  },
  {
    label: "Đăng nhập",
    icon: "login",
    description: "Đăng nhập tài khoản Kinetic Vault để mua hàng và tích điểm",
    href: "/login",
    keywords: ["dang nhap", "login", "tai khoan", "signin"],
  },
  {
    label: "Đăng ký thành viên",
    icon: "person_add",
    description: "Tạo tài khoản mới nhận ngay ưu đãi chào mừng",
    href: "/register",
    keywords: ["dang ky", "register", "tao tai khoan", "signup", "thanh vien"],
  },
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
  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") ?? "").trim();

    if (!q) {
      return NextResponse.json({
        query: "",
        navLinks: [],
        orders: [],
        products: [],
        categories: [],
        promotions: [],
      });
    }

    const qNorm = removeVietnameseTones(q);

    // 1. Navigation Quick Links
    const matchingNav = STOREFRONT_NAVIGATION.filter((item) => {
      const labelNorm = removeVietnameseTones(item.label);
      if (labelNorm.includes(qNorm)) return true;
      return item.keywords.some((kw) => kw.includes(qNorm) || qNorm.includes(kw));
    }).slice(0, 4);

    // 2. Check user session for order search
    const jar = await cookies();
    const accessToken = jar.get("accessToken")?.value?.trim() ?? "";
    const isLoggedIn = Boolean(accessToken) && !isAccessTokenExpired(accessToken);
    const userId = isLoggedIn ? Number(getUserIdFromAccessToken(accessToken)) : null;

    // Parallel data fetches
    const ordersPromise =
      isLoggedIn && userId && userId > 0
        ? listMyOrders({ accessToken, userId }).catch(() => [])
        : Promise.resolve([]);

    const productsPromise = searchProductsForUi({ q, status: "all", page: 1, size: 8 }).catch(() => ({
      items: [],
      page: 1,
      size: 8,
      totalItems: 0,
      totalPages: 1,
    }));

    const categoriesPromise = listPublicCategories().catch(() => []);
    const saleProgramsPromise = listActivePrograms().catch(() => []);

    const [myOrders, searchRes, allCategories, activePrograms] = await Promise.all([
      ordersPromise,
      productsPromise,
      categoriesPromise,
      saleProgramsPromise,
    ]);

    // 3. Filter My Orders (if logged in)
    const matchingOrders = (myOrders || [])
      .filter((o: any) => {
        const orderIdStr = String(o.id ?? "");
        const orderNumberStr = String(o.orderNumber ?? "");
        const statusStr = String(o.orderStatus ?? o.status ?? "");
        const trackingStr = String(o.trackingNumber ?? "");

        // Match order code, status, or items
        if (
          orderIdStr.includes(q) ||
          orderNumberStr.toLowerCase().includes(q.toLowerCase()) ||
          removeVietnameseTones(statusStr).includes(qNorm) ||
          trackingStr.toLowerCase().includes(q.toLowerCase())
        ) {
          return true;
        }

        // Also match keywords like "đơn hàng", "don hang", "order"
        if (qNorm.includes("don hang") || qNorm.includes("order") || qNorm.includes("don")) {
          return true;
        }

        // Match item product name inside order
        if (Array.isArray(o.items)) {
          return o.items.some((it: any) => {
            const pName = removeVietnameseTones(String(it.productName ?? ""));
            return pName.includes(qNorm);
          });
        }
        return false;
      })
      .slice(0, 4)
      .map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber || `#${o.id}`,
        total: o.total ? `${Number(o.total).toLocaleString("vi-VN")} VND` : "—",
        status: o.orderStatus || o.status || "Chờ xử lý",
        orderDate: o.orderDate,
        href: `/my-orders?id=${o.id}`,
      }));

    // 4. Filter Categories
    const matchingCategories = allCategories
      .filter((c) => {
        const nameNorm = removeVietnameseTones(c.name || "");
        return nameNorm.includes(qNorm);
      })
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        name: c.name,
        href: `/products?category=${c.id}`,
      }));

    // 5. Filter Products
    const products = searchRes.items
      .filter((p) => !p.isHidden && !p.isDeleted)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        rawPrice: p.rawPrice,
        category: p.category,
        heroImage: resolveCatalogImageUrl(p.heroImage),
        stock: p.stock,
        href: `/product/${p.id}`,
      }));

    // 6. Filter Active Sale Promotions
    const matchingPromotions = (activePrograms || [])
      .filter((prog: any) => {
        const titleNorm = removeVietnameseTones(String(prog.programName ?? prog.name ?? ""));
        return titleNorm.includes(qNorm) || qNorm.includes("khuyen mai") || qNorm.includes("sale") || qNorm.includes("voucher");
      })
      .slice(0, 3)
      .map((prog: any) => ({
        id: prog.id,
        name: prog.programName || prog.name || "Chương trình ưu đãi",
        discountType: prog.discountType,
        discountValue: prog.discountValue,
        href: "/products",
      }));

    return NextResponse.json({
      query: q,
      navLinks: matchingNav,
      orders: matchingOrders,
      products,
      categories: matchingCategories,
      promotions: matchingPromotions,
    });
  } catch (err: any) {
    console.error("Lỗi Storefront Global Search API:", err);
    return NextResponse.json(
      {
        query: "",
        navLinks: [],
        orders: [],
        products: [],
        categories: [],
        promotions: [],
        error: err.message,
      },
      { status: 500 }
    );
  }
}
