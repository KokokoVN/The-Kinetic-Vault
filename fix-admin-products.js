const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('stitch/app/admin/products');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/bg-gradient-to-br from-slate-50\/90 via-white\/80 to-slate-100\/90/g, 'bg-gradient-to-br from-slate-50/90 via-white/80 to-slate-100/90 dark:from-slate-900/90 dark:via-slate-800/80 dark:to-slate-900/90');
  content = content.replace(/bg-white(\/\d+)?(?!.*dark:bg-)/g, (match, p1) => `${match} dark:bg-slate-900${p1 || ''}`);
  content = content.replace(/bg-slate-50(\/\d+)?(?!.*dark:bg-)/g, (match, p1) => `${match} dark:bg-slate-800${p1 || ''}`);
  content = content.replace(/bg-slate-100(\/\d+)?(?!.*dark:bg-)/g, (match, p1) => `${match} dark:bg-slate-800${p1 || ''}`);
  
  content = content.replace(/text-slate-800(?!.*dark:text-)/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-700(?!.*dark:text-)/g, 'text-slate-700 dark:text-slate-200');
  content = content.replace(/text-slate-600(?!.*dark:text-)/g, 'text-slate-600 dark:text-slate-300');
  
  content = content.replace(/border-slate-200(?!.*dark:border-)/g, 'border-slate-200 dark:border-slate-700');
  content = content.replace(/border-slate-100(?!.*dark:border-)/g, 'border-slate-100 dark:border-slate-700');

  // Fix the previously broken hover/focus classes just in case
  content = content.replace(/focus:bg-white dark:bg-slate-900/g, 'focus:bg-white dark:focus:bg-slate-900');
  content = content.replace(/focus:border-slate-200 dark:border-slate-700/g, 'focus:border-slate-200 dark:focus:border-slate-700');
  content = content.replace(/hover:bg-slate-50 dark:bg-slate-800/g, 'hover:bg-slate-50 dark:hover:bg-slate-800');
  content = content.replace(/hover:bg-slate-100 dark:bg-slate-800/g, 'hover:bg-slate-100 dark:hover:bg-slate-800');
  content = content.replace(/hover:text-slate-800 dark:text-slate-100/g, 'hover:text-slate-800 dark:hover:text-slate-100');

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed admin products pages');
