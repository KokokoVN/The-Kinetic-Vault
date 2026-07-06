const fs = require('fs');

const file = 'stitch/components/inventory-excel-import.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content
  // Enhance text contrast for error details
  .replace(/text-red-700 dark:text-red-400/g, 'text-red-700 dark:text-red-300')
  .replace(/text-red-600 dark:text-red-400/g, 'text-red-600 dark:text-red-200')
  // Make the error box background slightly less dense in dark mode
  .replace(/dark:bg-red-900\/30/g, 'dark:bg-red-900/20');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed', file);
