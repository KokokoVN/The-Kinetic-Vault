"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

function removeAccents(str: string) {
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

const reportTypes = [
  { id: "revenue", title: "Doanh thu", description: "Báo cáo doanh thu 7 ngày gần nhất", icon: "payments" },
  { id: "orders", title: "Đơn hàng", description: "Danh sách các đơn hàng gần đây", icon: "receipt_long" },
  { id: "inventory", title: "Tồn kho", description: "Cảnh báo sản phẩm sắp hết hàng", icon: "warehouse" },
  { id: "customers", title: "Khách hàng", description: "Số lượng khách hàng mới", icon: "groups" },
];

const formats = [
  { id: "xlsx", title: "Excel (.xlsx)", icon: "table_chart" },
  { id: "csv", title: "CSV (.csv)", icon: "data_object" },
  { id: "pdf", title: "PDF (.pdf)", icon: "picture_as_pdf" },
];

export default function ReportsPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["revenue", "orders"]);
  const [selectedFormat, setSelectedFormat] = useState<string>("xlsx");
  const [isExporting, setIsExporting] = useState(false);

  // Default to last 7 days
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      toast.error("Vui lòng chọn ít nhất một báo cáo để xuất.");
      return;
    }

    setIsExporting(true);
    const loadingToast = toast.loading("Đang tổng hợp dữ liệu...");

    try {
      const typesQuery = selectedTypes.join(",");
      let url = `/api/admin/export-reports?types=${typesQuery}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reports data");
      
      const data = await res.json();
      
      const fileName = `BaoCao_HeThong_${new Date().toISOString().split("T")[0]}`;

      if (selectedFormat === "xlsx" || selectedFormat === "csv") {
        const wb = XLSX.utils.book_new();

        if (data.revenue) {
          const wsRev = XLSX.utils.json_to_sheet(data.revenue);
          XLSX.utils.book_append_sheet(wb, wsRev, "Doanh Thu");
        }
        if (data.orders) {
          const mappedOrders = data.orders.map((o: any) => ({
            "Mã Đơn": o.orderNumber || `#${o.id}`,
            "Khách Hàng": o.user?.userName || "Khách vãng lai",
            "Trạng Thái": o.status,
            "Tổng Tiền (VND)": o.total,
            "Ngày Đặt": new Date(o.createdAt).toLocaleString("vi-VN"),
          }));
          const wsOrd = XLSX.utils.json_to_sheet(mappedOrders);
          XLSX.utils.book_append_sheet(wb, wsOrd, "Đơn Hàng");
        }
        if (data.inventory) {
          const mappedInv = data.inventory.map((i: any) => ({
            "ID Sản phẩm": i.productId,
            "Tên Sản phẩm": i.name,
            "Mã SKU": i.sku,
            "Tồn Kho": i.stock,
          }));
          const wsInv = XLSX.utils.json_to_sheet(mappedInv);
          XLSX.utils.book_append_sheet(wb, wsInv, "Tồn Kho");
        }
        if (data.customers !== undefined) {
          const wsCus = XLSX.utils.json_to_sheet([{ "Số Khách Hàng Mới": data.customers }]);
          XLSX.utils.book_append_sheet(wb, wsCus, "Khách Hàng");
        }

        if (selectedFormat === "xlsx") {
          XLSX.writeFile(wb, `${fileName}.xlsx`);
        } else {
          // For CSV, multiple sheets export as multiple CSVs in one file isn't standard, 
          // but we can generate a single CSV by concatenating, or just take the first selected.
          // Since xlsx library's writeFile doesn't support multiple sheets to CSV well natively, 
          // we'll output each sheet as CSV content and merge into one big file.
          let csvContent = "";
          for (const sheetName of wb.SheetNames) {
            const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
            csvContent += `\n--- Bảng: ${sheetName} ---\n\n`;
            csvContent += csv;
            csvContent += `\n`;
          }
          const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // \uFEFF for Excel UTF-8 BOM
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${fileName}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else if (selectedFormat === "pdf") {
        const doc = new jsPDF();
        
        // Custom font would be required for robust Vietnamese support in jsPDF, 
        // but for now standard latin is often sufficient or we use simple characters.
        doc.setFontSize(18);
        doc.text(removeAccents("BÁO CÁO HỆ THỐNG"), 14, 22);
        doc.setFontSize(11);
        doc.text(removeAccents(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`), 14, 30);

        let finalY = 40;

        if (data.revenue && data.revenue.length > 0) {
          doc.text(removeAccents("1. Doanh thu (7 ngày qua)"), 14, finalY);
          const body = data.revenue.map((r: any) => [r.date, r.revenue.toLocaleString("vi-VN") + " VND"]);
          autoTable(doc, {
            startY: finalY + 5,
            head: [[removeAccents("Ngày"), removeAccents("Doanh thu")]],
            body: body,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
          });
          finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        if (data.orders && data.orders.length > 0) {
          doc.text(removeAccents("2. Đơn hàng gần đây"), 14, finalY);
          const body = data.orders.map((o: any) => [
            o.orderNumber || `#${o.id}`,
            removeAccents(o.user?.userName || "Khách vãng lai"),
            removeAccents(o.status),
            o.total.toLocaleString("vi-VN") + " VND",
          ]);
          autoTable(doc, {
            startY: finalY + 5,
            head: [[removeAccents("Mã đơn"), removeAccents("Khách hàng"), removeAccents("Trạng thái"), removeAccents("Tổng tiền")]],
            body: body,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
          });
          finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        if (data.inventory && data.inventory.length > 0) {
          if (finalY > 250) { doc.addPage(); finalY = 20; }
          doc.text(removeAccents("3. Cảnh báo tồn kho"), 14, finalY);
          const body = data.inventory.map((i: any) => [i.productId, i.sku, removeAccents(i.name.slice(0,30)), i.stock]);
          autoTable(doc, {
            startY: finalY + 5,
            head: [["ID", "SKU", removeAccents("Tên SP"), removeAccents("Tồn kho")]],
            body: body,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
          });
          finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        if (data.customers !== undefined) {
          if (finalY > 250) { doc.addPage(); finalY = 20; }
          doc.text(removeAccents("4. Khách hàng mới"), 14, finalY);
          autoTable(doc, {
            startY: finalY + 5,
            head: [[removeAccents("Chỉ số"), removeAccents("Giá trị")]],
            body: [[removeAccents("Số lượng khách hàng mới"), data.customers]],
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
          });
        }

        doc.save(`${fileName}.pdf`);
      }

      toast.success("Xuất file thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Xuất báo cáo thất bại.");
    } finally {
      toast.dismiss(loadingToast);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Xuất Báo Cáo
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Chọn các loại dữ liệu và định dạng file bạn muốn xuất.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white">1. Dữ liệu báo cáo</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {reportTypes.map((item) => {
              const isSelected = selectedTypes.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleType(item.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                      } transition-colors`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className={`font-bold ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute right-4 top-4 text-blue-500">
                      <span className="material-symbols-outlined text-[20px] font-black">check_circle</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white">2. Định dạng file</h2>
          <div className="flex flex-col gap-3">
            {formats.map((item) => {
              const isSelected = selectedFormat === item.id;
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`material-symbols-outlined text-[24px] ${
                        isSelected ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className={`font-bold ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"}`}>
                      {item.title}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="format"
                    value={item.id}
                    checked={isSelected}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="h-5 w-5 border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800"
                  />
                </label>
              );
            })}
          </div>

          <h2 className="font-headline text-lg font-bold text-slate-900 dark:text-white pt-4">3. Thời gian</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Từ ngày</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700 dark:text-slate-300">Đến ngày</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-headline text-base font-black text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isExporting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Đang xuất...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">download</span>
                  Xuất Báo Cáo
                </>
              )}
            </button>
            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Quá trình này có thể mất vài giây tuỳ thuộc vào lượng dữ liệu thực tế.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
