const fs = require('fs');

const editFile = 'stitch/app/admin/products/[id]/edit/page.tsx';
const detailFile = 'stitch/app/admin/products/[id]/detail/page.tsx';

let editContent = fs.readFileSync(editFile, 'utf8');
editContent = editContent
  .replace(/bg-gradient-to-br from-indigo-50\/50 via-white to-blue-50\/30(?!.*dark:from-)/g, 'bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900')
  .replace(/bg-gradient-to-br from-indigo-50\/50 via-white to-blue-50\/50(?!.*dark:from-)/g, 'bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900');
fs.writeFileSync(editFile, editContent, 'utf8');

let detailContent = fs.readFileSync(detailFile, 'utf8');
detailContent = detailContent
  .replace(/bg-gradient-to-b from-white to-slate-50(?!.*dark:from-)/g, 'bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800')
  .replace(/bg-gradient-to-br from-white via-slate-50\/80 to-indigo-50\/30(?!.*dark:from-)/g, 'bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900');
fs.writeFileSync(detailFile, detailContent, 'utf8');

console.log('Fixed from-white gradients');
