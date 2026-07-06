const fs = require('fs');

const file = 'stitch/components/inventory-excel-import.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add handleContinueFixing before handleCancel
const newFunction = `  const handleContinueFixing = () => {
    if (result && result.errors && result.errors.length > 0) {
      const failedRowIds = result.errors.map((e: string) => {
        const match = e.match(/Dòng (\\d+)/i);
        return match ? parseInt(match[1]) : -1;
      }).filter((id: number) => id > 0);

      if (failedRowIds.length > 0) {
        setRows(rows.filter((r: any) => failedRowIds.includes(r.rowId)));
      }
    }
    setResult(null);
  };

  const handleCancel = () => {`;

content = content.replace('  const handleCancel = () => {', newFunction);

// Update buttons in the result block
const oldButtons = `<button
                onClick={handleCancel}
                className="rounded-xl bg-slate-800 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-slate-700"
              >
                Đóng
              </button>`;

const newButtons = `<div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={handleCancel}
                  className="rounded-xl bg-slate-200 dark:bg-slate-800 px-8 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-300 dark:hover:bg-slate-700"
                >
                  Đóng (Hủy bỏ)
                </button>
                {result.errors.length > 0 && (
                  <button
                    onClick={handleContinueFixing}
                    className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 hover:-translate-y-0.5"
                  >
                    Tiếp tục sửa lỗi
                  </button>
                )}
              </div>`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed', file);
