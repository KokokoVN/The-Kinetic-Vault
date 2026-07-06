const fs = require('fs');
const path = require('path');

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

const files = [
  ...walk('stitch/app/admin/products'),
  ...walk('stitch/components')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // For plain backgrounds
  const newContent = content
    .replace(/bg-surface-container-lowest(?![-\w\/]*\s+dark:bg-)/g, 'bg-surface-container-lowest dark:bg-slate-900')
    .replace(/bg-surface-container-low(?![-\w\/]*\s+dark:bg-)/g, 'bg-surface-container-low dark:bg-slate-800')
    .replace(/bg-surface-container(?![-\w\/]*\s+dark:bg-)/g, 'bg-surface-container dark:bg-slate-800')
    .replace(/bg-gradient-to-br from-surface-container-lowest to-blue-50\/30/g, 'bg-gradient-to-br from-surface-container-lowest to-blue-50/30 dark:from-slate-900 dark:to-slate-900/30');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
  }
}
console.log('Fixed surface containers');
