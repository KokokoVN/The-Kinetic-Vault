const fs = require('fs');
const path = require('path');

const salesDir = 'stitch/app/admin/sales';
const componentsDir = 'stitch/components';

function getFiles(dir, filter = () => true) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, filter));
    } else if (filter(file)) {
      results.push(file);
    }
  });
  return results;
}

const salesFiles = getFiles(salesDir, f => f.endsWith('.tsx'));
const componentFiles = [
  path.join(componentsDir, 'banner-form.tsx'),
  path.join(componentsDir, 'voucher-form.tsx'),
  path.join(componentsDir, 'sale-program-form.tsx'),
];

const allFiles = [...salesFiles, ...componentFiles];

function applyDarkVipProStyle(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Headers / Gradient backgrounds
  content = content.replace(
    /bg-white\/60 dark:bg-slate-900\/60|bg-white\/50 dark:bg-slate-900\/50/g,
    'bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 text-white'
  );

  content = content.replace(
    /border-slate-200\/50 dark:border-slate-800\/50/g,
    'border-white/10'
  );

  content = content.replace(
    /shadow-purple-900\/5 dark:shadow-none/g,
    'shadow-purple-900/40 shadow-2xl'
  );

  // General cards & panels
  content = content.replace(
    /bg-white dark:bg-slate-900|bg-white/g,
    'bg-white/5 backdrop-blur-xl text-slate-200'
  );
  
  content = content.replace(
    /border-slate-200 dark:border-slate-800|border-slate-200/g,
    'border-white/10'
  );

  // Forms & Inputs
  content = content.replace(
    /bg-slate-50 dark:bg-slate-800\/50|bg-slate-50/g,
    'bg-white/10 border-white/10 text-white'
  );

  content = content.replace(
    /text-slate-900 dark:text-white|text-slate-900/g,
    'text-white'
  );

  content = content.replace(
    /text-slate-500 dark:text-slate-400|text-slate-500|text-slate-600 dark:text-slate-400|text-slate-600/g,
    'text-slate-400'
  );

  content = content.replace(
    /text-slate-700 dark:text-slate-300|text-slate-700/g,
    'text-slate-300'
  );

  // Tables
  content = content.replace(
    /divide-slate-200 dark:divide-slate-800|divide-slate-200/g,
    'divide-white/10'
  );

  content = content.replace(
    /bg-slate-100 dark:bg-slate-800|bg-slate-100/g,
    'bg-white/10'
  );

  content = content.replace(
    /hover:bg-slate-50 dark:hover:bg-slate-800\/50|hover:bg-slate-50/g,
    'hover:bg-white/10'
  );

  content = content.replace(
    /ring-slate-200 dark:ring-slate-800|ring-slate-200/g,
    'ring-white/10'
  );
  
  // Specific buttons or primary elements
  content = content.replace(
    /bg-blue-600/g,
    'bg-purple-600'
  ).replace(
    /hover:bg-blue-700/g,
    'hover:bg-purple-700'
  ).replace(
    /text-blue-600 dark:text-blue-400|text-blue-600/g,
    'text-purple-400'
  ).replace(
    /shadow-blue-600\/30/g,
    'shadow-purple-600/30'
  ).replace(
    /focus:border-blue-500/g,
    'focus:border-purple-500'
  ).replace(
    /focus:ring-blue-500/g,
    'focus:ring-purple-500'
  );

  // Specific transparent background fixes
  content = content.replace(/bg-transparent backdrop-blur-xl/g, 'bg-transparent');

  fs.writeFileSync(filePath, content, 'utf8');
}

allFiles.forEach(f => {
  applyDarkVipProStyle(f);
  console.log('Updated:', f);
});

console.log('Finished updating sales UI');
