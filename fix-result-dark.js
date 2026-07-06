const fs = require('fs');

const file = 'stitch/components/inventory-excel-import.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content
  .replace(/dark:bg-blue-900\/30\/50/g, 'dark:bg-blue-900/30')
  .replace(/border-blue-100(?!\/| dark:border-)/g, 'border-blue-100 dark:border-blue-900/50');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed', file);
