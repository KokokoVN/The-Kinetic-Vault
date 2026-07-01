import { apiUrl, adminCatalogHeaders, parseJsonSafe } from "./api";

export type ImportResult = {
  successCount: number;
  errors: string[];
};

export async function downloadInventoryTemplate(options?: { accessToken?: string | null }) {
  const res = await fetch(apiUrl("/inventory/admin/stock/excel/template"), {
    method: "GET",
    headers: adminCatalogHeaders(options),
  });

  if (!res.ok) {
    throw new Error("Không thể tải file mẫu");
  }

  return await res.blob();
}

export interface ExcelRowDto {
  rowId: number;
  productId: number;
  productName?: string;
  variantId?: number;
  variantAttributes?: string;
  quantity: number;
  type: string;
  unitCost: number;
  note: string;
  valid: boolean;
  errorMessages: string[];
};

export async function previewInventoryExcel(
  file: File,
  options?: { accessToken?: string | null; username?: string | null }
): Promise<ExcelRowDto[]> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: any = {
    Authorization: `Bearer ${options?.accessToken || ""}`,
  };

  const res = await fetch(apiUrl("/inventory/admin/stock/excel/preview"), {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await parseJsonSafe<any>(res);
    throw new Error(err?.message || "Lỗi khi đọc file Excel");
  }

  return await parseJsonSafe<ExcelRowDto[]>(res);
}

export async function confirmInventoryExcel(
  rows: ExcelRowDto[],
  options?: { accessToken?: string | null; username?: string | null }
): Promise<ImportResult> {
  const headers: any = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${options?.accessToken || ""}`,
  };
  if (options?.username) {
    headers["X-User-Name"] = options.username;
  }

  const res = await fetch(apiUrl("/inventory/admin/stock/excel/confirm"), {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const data = await parseJsonSafe<any>(res);
    if (data && data.errors) {
      return data;
    }
    throw new Error("Lỗi khi lưu dữ liệu");
  }

  return await parseJsonSafe<ImportResult>(res);
}

export type InventoryBalanceDto = {
  id: number;
  productId: number;
  variantId?: number;
  quantityOnHand: number;
  updatedAt: string;
};

export type PaginatedBalances = {
  content: InventoryBalanceDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export async function getInventoryBalances(
  page: number = 0,
  size: number = 50,
  options?: { accessToken?: string | null; username?: string | null }
): Promise<PaginatedBalances> {
  const headers: any = {
    Authorization: `Bearer ${options?.accessToken || ""}`,
  };

  const res = await fetch(apiUrl(`/inventory/admin/stock/balances?page=${page}&size=${size}`), {
    headers,
  });

  if (!res.ok) {
    throw new Error("Lỗi khi tải danh sách tồn kho");
  }
  return await parseJsonSafe<PaginatedBalances>(res);
}

export async function getInventoryMovements(
  page = 0,
  size = 50,
  options?: { accessToken?: string | null }
) {
  const headers = adminCatalogHeaders(options);
  const res = await fetch(apiUrl(`/inventory/admin/stock/movements?page=${page}&size=${size}`), {
    headers,
  });
  return await parseJsonSafe<any>(res);
}

export async function manualStockUpdate(
  type: "INBOUND" | "OUTBOUND",
  data: { productId: number; variantId?: number; quantity: number; note: string; unitCost?: number },
  options?: { accessToken?: string | null; username?: string | null }
): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${options?.accessToken || ""}`,
  };
  if (options?.username) {
    headers["X-User-Name"] = options.username;
  }

  const endpoint = type === "INBOUND" ? "/inventory/admin/stock/inbound" : "/inventory/admin/stock/outbound";
  const res = await fetch(apiUrl(endpoint), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await parseJsonSafe<any>(res);
    throw new Error(err?.message || "Lỗi khi cập nhật kho");
  }
  return await parseJsonSafe<any>(res);
}

export async function getProductName(
  id: number,
  options?: { accessToken?: string | null }
): Promise<string> {
  try {
    const headers: any = {};
    if (options?.accessToken) headers["Authorization"] = `Bearer ${options.accessToken}`;
    const res = await fetch(apiUrl(`/catalog/products/${id}`), { headers });
    if (!res.ok) return `Sản phẩm #${id}`;
    const data = await res.json();
    return data.productName || `Sản phẩm #${id}`;
  } catch (e) {
    return `Sản phẩm #${id}`;
  }
}
