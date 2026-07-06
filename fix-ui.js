const fs = require('fs');

const files = [
  'stitch/components/inventory-excel-import.tsx',
  'stitch/components/dashboard-ui.tsx',
  'stitch/components/edit-category-form.tsx',
  'stitch/components/new-brand-form.tsx',
  'stitch/components/category-list-display.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace bg-white with dark mode equivalent if missing
  content = content.replace(/bg-gradient-to-br from-slate-50\/90 via-white\/80 to-slate-100\/90/g, 'bg-gradient-to-br from-slate-50/90 via-white/80 to-slate-100/90 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90');
  content = content.replace(/bg-white(\/\d+)?(?!.*dark:bg-)/g, (match, p1) => `${match} dark:bg-slate-900${p1 || ''}`);
  content = content.replace(/bg-slate-50(\/\d+)?(?!.*dark:bg-)/g, (match, p1) => `${match} dark:bg-slate-800${p1 || ''}`);
  content = content.replace(/bg-slate-100(\/\d+)?(?!.*dark:bg-)/g, (match, p1) => `${match} dark:bg-slate-800${p1 || ''}`);
  
  // Replace text colors if missing dark mode
  content = content.replace(/text-slate-800(?!.*dark:text-)/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-700(?!.*dark:text-)/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-600(?!.*dark:text-)/g, 'text-slate-600 dark:text-slate-300');
  
  // Replace borders if missing dark mode
  content = content.replace(/border-slate-200(?!.*dark:border-)/g, 'border-slate-200 dark:border-slate-700');
  content = content.replace(/border-slate-100(?!.*dark:border-)/g, 'border-slate-100 dark:border-slate-700');
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed UI components');
