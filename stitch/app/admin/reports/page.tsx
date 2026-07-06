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
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-white/70 dark:bg-slate-900/70 p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-2xl md:p-10 transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-cyan-50/50 dark:from-indigo-900/20 dark:via-blue-900/10 dark:to-cyan-900/20" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-400/20 dark:bg-indigo-500/10 blur-[80px]" />
        <div className="absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-cyan-400/20 dark:bg-cyan-500/10 blur-[80px]" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 px-4 py-1.5 shadow-sm backdrop-blur-md">
            <span className="material-symbols-outlined text-sm text-indigo-600 dark:text-indigo-400">analytics</span>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">Xuất Báo Cáo</span>
          </div>
          <h1 className="mt-5 font-headline text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">Report Generator</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Chọn các loại dữ liệu và định dạng file bạn muốn xuất. Báo cáo sẽ được tổng hợp tự động dựa trên thời gian được chọn.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* LEFT COLUMN: Data Types */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined">data_object</span>
            </span>
            <h2 className="font-headline text-2xl font-black text-slate-800 dark:text-white">1. Dữ liệu báo cáo</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {reportTypes.map((item) => {
              const isSelected = selectedTypes.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleType(item.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    isSelected
                      ? "border-blue-300 dark:border-blue-500/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 shadow-md shadow-blue-500/10 dark:shadow-blue-500/5"
                      : "border-white dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none backdrop-blur-xl hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                      } transition-all duration-300`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className={`font-headline text-lg font-black ${isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400"} transition-colors`}>
                        {item.title}
                      </h3>
                      <p className={`mt-1 text-xs font-medium leading-relaxed ${isSelected ? "text-blue-600/70 dark:text-blue-300/70" : "text-slate-500 dark:text-slate-400"}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className={`absolute right-4 top-4 transition-all duration-300 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                    <span className="material-symbols-outlined text-[24px] text-blue-500 dark:text-blue-400 font-bold">check_circle</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT COLUMN: Format & Options */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm backdrop-blur-md">
              <span className="material-symbols-outlined">settings</span>
            </span>
            <h2 className="font-headline text-2xl font-black text-slate-800 dark:text-white">2. Cấu hình xuất</h2>
          </div>

          <div className="rounded-[2.5rem] border border-white dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none backdrop-blur-xl p-6 sm:p-8 transition-colors duration-300">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Định dạng file</h3>
            <div className="flex flex-col gap-3">
              {formats.map((item) => {
                const isSelected = selectedFormat === item.id;
                return (
                  <label
                    key={item.id}
                    className={`group flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                      isSelected
                        ? "border-indigo-300 dark:border-indigo-500/50 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 shadow-md shadow-indigo-500/10 dark:shadow-indigo-500/5"
                        : "border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isSelected ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"}`}>
                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      </div>
                      <span className={`font-headline text-base font-black ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"}`}>
                        {item.title}
                      </span>
                    </div>
                    <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"}`}>
                      <input
                        type="radio"
                        name="format"
                        value={item.id}
                        checked={isSelected}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="peer absolute h-full w-full opacity-0 cursor-pointer"
                      />
                      {isSelected && <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>}
                    </div>
                  </label>
                );
              })}
            </div>

            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 mt-8">Khoảng thời gian</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="group/field relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 transition-all focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm">
                <label className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400">
                  Từ ngày
                </label>
                <div className="flex items-center px-2">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mr-2 group-focus-within/field:text-blue-500 dark:group-focus-within/field:text-blue-400">calendar_today</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="group/field relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 transition-all focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm">
                <label className="absolute -top-3 left-4 bg-white dark:bg-slate-900 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors group-focus-within/field:text-blue-600 dark:group-focus-within/field:text-blue-400">
                  Đến ngày
                </label>
                <div className="flex items-center px-2">
                  <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 mr-2 group-focus-within/field:text-blue-500 dark:group-focus-within/field:text-blue-400">event</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent py-2 text-sm font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-headline text-base font-black text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 dark:hover:shadow-indigo-900/50 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Đang tổng hợp dữ liệu...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">download</span>
                    Bắt đầu xuất báo cáo
                  </>
                )}
              </button>
              <p className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined inline align-middle text-[14px] mr-1">info</span>
                Quá trình này có thể mất vài giây tuỳ thuộc vào lượng dữ liệu thực tế.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
