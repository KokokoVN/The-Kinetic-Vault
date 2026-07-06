const fs = require('fs');

const file = 'stitch/lib/api.ts';
let content = fs.readFileSync(file, 'utf8');

const exportApi = `
export async function exportAdminOrders(
  options?: {
    accessToken?: string | null;
    status?: string | null;
    paymentStatus?: string | null;
    q?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }
): Promise<Blob> {
  const params = new URLSearchParams();
  if (options?.status) params.append("status", options.status);
  if (options?.paymentStatus) params.append("paymentStatus", options.paymentStatus);
  if (options?.q) params.append("q", options.q);
  if (options?.startDate) params.append("startDate", options.startDate);
  if (options?.endDate) params.append("endDate", options.endDate);

  const qs = params.toString();
  const url = apiUrl(\`/order/orders/export\${qs ? '?' + qs : ''}\`);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: adminOrderHeaders({ accessToken: options?.accessToken }),
    });
  } catch (e) {
    throw new Error("Không kết nối được tới backend.");
  }

  if (!res.ok) {
    throw new Error("Xuất file thất bại");
  }

  return res.blob();
}
`;

content += exportApi;
fs.writeFileSync(file, content, 'utf8');
console.log('Appended exportAdminOrders to api.ts');
