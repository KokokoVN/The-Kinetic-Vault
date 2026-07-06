const fs = require('fs');

const fixMediaUpload = () => {
  const file = 'stitch/components/product-media-upload-section.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace('bg-indigo-50 dark:bg-indigo-950/20', 'bg-indigo-50/50 dark:bg-indigo-950/30')
    .replace('bg-violet-50 dark:bg-violet-950/20', 'bg-violet-50/50 dark:bg-violet-950/30')
    .replace('border-indigo-100 dark:border-indigo-905/30', 'border-indigo-100 dark:border-indigo-900/30')
    .replace('border-violet-100 dark:border-violet-905/30', 'border-violet-100 dark:border-violet-900/30')
    .replace('className={`rounded-2xl border ${c.border} ${c.bg}/30 p-6 space-y-4`}', 'className={`rounded-2xl border ${c.border} ${c.bg} p-6 space-y-4`}');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

const fixVariantForm = () => {
  const file = 'stitch/components/variant-form-live-check.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace(/bg-white\/60 dark:bg-slate-900\/60/g, 'bg-slate-50 dark:bg-slate-900')
    .replace(/bg-slate-50\/50 dark:bg-slate-800\/20/g, 'bg-slate-50 dark:bg-slate-800')
    .replace(/border-slate-200\/60 dark:border-slate-800/g, 'border-slate-200 dark:border-slate-700');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

fixMediaUpload();
fixVariantForm();
