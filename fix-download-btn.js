const fs = require('fs');

const file = 'stitch/components/inventory-excel-import.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="flex items-center gap-2 rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-300"/g,
  'className="flex items-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 px-6 py-3 font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-300 dark:hover:bg-slate-700"'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed', file);
