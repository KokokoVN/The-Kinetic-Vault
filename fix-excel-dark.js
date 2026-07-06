const fs = require('fs');

const fixExcelImport = () => {
  const file = 'stitch/components/inventory-excel-import.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix invalid dark:bg-red-900/30/30
  content = content
    .replace(/dark:bg-red-900\/30\/30/g, 'dark:bg-red-900/30')
    .replace(/dark:bg-red-900\/30\/80/g, 'dark:bg-red-900/40')
    // Fix missing dark emerald bg
    .replace(/bg-emerald-50\/20 transition-colors hover:bg-emerald-50\/60/g, 'bg-emerald-50/20 dark:bg-emerald-900/10 transition-colors hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20')
    // Fix missing hover dark red bg
    .replace(/hover:bg-red-50(?!.*dark:hover:bg-)/g, 'hover:bg-red-50 dark:hover:bg-red-900/40')
    
    // Fix missing dark classes for disabled inputs
    .replace(/border-slate-100 bg-slate-50 text-slate-500 focus:border-slate-200/g, 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 focus:border-slate-200')
    
    // Fix text-blue-700 and text-emerald-700 inside inputs (which looked black on black)
    .replace(/text-blue-700(?!.*dark:text-)/g, 'text-blue-700 dark:text-blue-400')
    .replace(/text-emerald-700(?!.*dark:text-)/g, 'text-emerald-700 dark:text-emerald-400')
    
    // Fix bg-red-50 in row error states and summary box
    .replace(/bg-red-50(?!\/| dark:bg-)/g, 'bg-red-50 dark:bg-red-900/20')
    
    // Fix border-red-200/50
    .replace(/border-red-200\/50(?!.*dark:border-)/g, 'border-red-200/50 dark:border-red-800/50')
    .replace(/border-red-200(?!.*dark:border-)/g, 'border-red-200 dark:border-red-800/50')
    .replace(/border-red-100(?!.*dark:border-)/g, 'border-red-100 dark:border-red-800/50')
    
    // Fix text-red-600
    .replace(/text-red-600(?!.*dark:text-)/g, 'text-red-600 dark:text-red-400')
    .replace(/text-red-700(?!.*dark:text-)/g, 'text-red-700 dark:text-red-400');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

fixExcelImport();
