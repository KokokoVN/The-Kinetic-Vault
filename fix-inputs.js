const fs = require('fs');

const fixInputs = () => {
  const file = 'stitch/components/inventory-excel-import.tsx';
  let content = fs.readFileSync(file, 'utf8');

  content = content
    // Mã SP, Mã BT
    .replace(/min-w-\[100px\] rounded-xl border px-3 py-2/g, 'min-w-[120px] rounded-xl border px-4 py-2.5')
    // Số lượng
    .replace(/w-full w-24 rounded-xl border/g, 'w-full min-w-[100px] rounded-xl border')
    .replace(/px-3 py-2 text-sm font-bold text-blue-700 dark:text-blue-400 shadow-sm transition-all focus:border-blue-500/g, 'px-4 py-2.5 text-sm font-bold text-blue-700 dark:text-blue-400 shadow-sm transition-all focus:border-blue-500')
    // Giá nhập
    .replace(/pl-7 pr-3 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm transition-all focus:border-blue-500/g, 'min-w-[150px] pl-8 pr-4 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm transition-all focus:border-blue-500')
    // Ghi chú
    .replace(/w-full rounded-xl border border-slate-200 dark:border-slate-700\/80 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 shadow-sm transition-all focus:border-blue-500/g, 'w-full min-w-[200px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 shadow-sm transition-all focus:border-blue-500')
    // Loại GD
    .replace(/min-w-\[110px\] rounded-xl border border-slate-200 dark:border-slate-700\/80 bg-white dark:bg-slate-900 px-3 py-2/g, 'min-w-[130px] rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 px-4 py-2.5');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

fixInputs();
