const fs = require('fs');

const fixComponent = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content
    .replace(/bg-white\/60(?!.*dark:bg-)/g, 'bg-white/60 dark:bg-slate-900/60')
    .replace(/bg-white\/40(?!.*dark:bg-)/g, 'bg-white/40 dark:bg-slate-900/40')
    .replace(/bg-sky-50(?!.*dark:bg-)/g, 'bg-sky-50 dark:bg-sky-950/20')
    .replace(/bg-rose-50\/40(?!.*dark:bg-)/g, 'bg-rose-50/40 dark:bg-rose-950/20')
    .replace(/bg-rose-50\/50(?!.*dark:bg-)/g, 'bg-rose-50/50 dark:bg-rose-950/30')
    .replace(/bg-rose-50(?!.*dark:bg-)/g, 'bg-rose-50 dark:bg-rose-950/20')
    .replace(/text-sky-600(?!.*dark:text-)/g, 'text-sky-600 dark:text-sky-400')
    .replace(/border-sky-200(?!.*dark:border-)/g, 'border-sky-200 dark:border-sky-800')
    .replace(/bg-slate-50\/50(?!.*dark:bg-)/g, 'bg-slate-50/50 dark:bg-slate-800/50')
    .replace(/border-slate-200\/60(?!.*dark:border-)/g, 'border-slate-200/60 dark:border-slate-700/60')
    .replace(/border-slate-200(?!.*dark:border-)/g, 'border-slate-200 dark:border-slate-700');
    
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
};

fixComponent('stitch/components/spec-form-live-check.tsx');
fixComponent('stitch/components/variant-form-live-check.tsx');
fixComponent('stitch/components/product-media-upload-section.tsx');

const detailPath = 'stitch/app/admin/products/[id]/detail/page.tsx';
let detailContent = fs.readFileSync(detailPath, 'utf8');
const originalDetail = detailContent;
detailContent = detailContent
  .replace(/text-blue-900(?!.*dark:text-)/g, 'text-blue-900 dark:text-white')
  .replace(/divide-slate-100(?!.*dark:divide-)/g, 'divide-slate-100 dark:divide-slate-700/50')
  .replace(/bg-white(?!.*dark:bg-)/g, 'bg-white dark:bg-slate-900');

if (detailContent !== originalDetail) {
  fs.writeFileSync(detailPath, detailContent, 'utf8');
  console.log('Fixed', detailPath);
}
