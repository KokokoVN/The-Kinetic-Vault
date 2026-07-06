const fs = require('fs');

const fixSpecGroupCard = () => {
  const file = 'stitch/components/spec-group-card.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace(/bg-white/g, 'bg-white dark:bg-slate-900')
    .replace(/bg-slate-50\/50/g, 'bg-slate-50/50 dark:bg-slate-800/50')
    .replace(/bg-slate-50\/30/g, 'bg-slate-50/30 dark:bg-slate-800/30')
    .replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800')
    .replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-100')
    .replace(/text-blue-950/g, 'text-blue-950 dark:text-slate-100')
    .replace(/text-indigo-900/g, 'text-indigo-900 dark:text-indigo-200')
    .replace(/border-indigo-100\/80/g, 'border-indigo-100/80 dark:border-indigo-900/30')
    .replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-800')
    .replace(/border-slate-200\/80/g, 'border-slate-200/80 dark:border-slate-700/80')
    .replace(/bg-white dark:bg-slate-900\/60/g, 'bg-white/60 dark:bg-slate-900/60'); // Fix over-replace
  // deduplicate
  content = content.replace(/dark:bg-slate-900 dark:bg-slate-900/g, 'dark:bg-slate-900');
  content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

const fixSpecEditForm = () => {
  const file = 'stitch/components/spec-edit-form-live-check.tsx';
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace(/bg-white/g, 'bg-white dark:bg-slate-900')
    .replace(/bg-slate-50\/50/g, 'bg-slate-50/50 dark:bg-slate-800/50')
    .replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

const fixVariantEditForm = () => {
  const file = 'stitch/components/variant-edit-form-live-check.tsx';
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  content = content
    .replace(/bg-white/g, 'bg-white dark:bg-slate-900')
    .replace(/bg-slate-50\/50/g, 'bg-slate-50/50 dark:bg-slate-800/50')
    .replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed', file);
}

fixSpecGroupCard();
fixSpecEditForm();
fixVariantEditForm();
