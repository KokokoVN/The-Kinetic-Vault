import { redirect } from "next/navigation";

/** Trang quản lý kho đã gỡ; chuyển về danh sách sản phẩm. */
export default function WarehousesRemovedPage() {
  redirect("/admin/products");
}
