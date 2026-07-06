const fs = require('fs');

const fixFile = (file) => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Add dark variants where they are missing
  content = content
    // Backgrounds
    .replace(/bg-white(?!\/| dark:bg-)/g, 'bg-white dark:bg-slate-900')
    .replace(/bg-white\/60(?!.*dark:bg-)/g, 'bg-white/60 dark:bg-slate-900/60')
    .replace(/bg-white\/70(?!.*dark:bg-)/g, 'bg-white/70 dark:bg-slate-800/70')
    .replace(/bg-slate-50\/50(?!.*dark:bg-)/g, 'bg-slate-50/50 dark:bg-slate-800/50')
    .replace(/bg-slate-50(?!.*dark:bg-)/g, 'bg-slate-50 dark:bg-slate-800')
    .replace(/bg-slate-100(?!.*dark:bg-)/g, 'bg-slate-100 dark:bg-slate-800')
    .replace(/bg-blue-50(?!.*dark:bg-)/g, 'bg-blue-50 dark:bg-blue-900/30')
    .replace(/bg-red-50(?!.*dark:bg-)/g, 'bg-red-50 dark:bg-red-900/30')
    .replace(/bg-emerald-50(?!.*dark:bg-)/g, 'bg-emerald-50 dark:bg-emerald-900/30')
    .replace(/bg-rose-50(?!.*dark:bg-)/g, 'bg-rose-50 dark:bg-rose-900/30')
    .replace(/bg-amber-50(?!.*dark:bg-)/g, 'bg-amber-50 dark:bg-amber-900/30')
    
    // Borders
    .replace(/border-slate-200\/60(?!.*dark:border-)/g, 'border-slate-200/60 dark:border-slate-700/60')
    .replace(/border-slate-200(?!.*dark:border-)/g, 'border-slate-200 dark:border-slate-700')
    .replace(/border-slate-100(?!.*dark:border-)/g, 'border-slate-100 dark:border-slate-800')
    .replace(/border-white\/40(?!.*dark:border-)/g, 'border-white/40 dark:border-slate-700/40')
    
    // Texts
    .replace(/text-blue-900(?!.*dark:text-)/g, 'text-blue-900 dark:text-white')
    .replace(/text-slate-800(?!.*dark:text-)/g, 'text-slate-800 dark:text-slate-200')
    .replace(/text-slate-700(?!.*dark:text-)/g, 'text-slate-700 dark:text-slate-300')
    .replace(/text-slate-600(?!.*dark:text-)/g, 'text-slate-600 dark:text-slate-400')
    .replace(/text-slate-500(?!.*dark:text-)/g, 'text-slate-500 dark:text-slate-400')
    
    // Fix over-replacements
    .replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900')
    .replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
};

fixFile('stitch/app/admin/inventory/page.tsx');
fixFile('stitch/components/inventory-dashboard.tsx');
fixFile('stitch/components/inventory-excel-import.tsx');
