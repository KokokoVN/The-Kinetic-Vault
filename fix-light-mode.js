const fs = require('fs');
const path = require('path');

const filesToFix = [
  "e:/e-commerce-microservices-master/e-commerce-microservices-master/stitch/app/admin/sales/page.tsx"
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) {
    console.log("File not found: " + file);
    continue;
  }
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(/text-slate-800 dark:text-white/g, "text-white");
  content = content.replace(/text-slate-800 dark:text-slate-200/g, "text-slate-200");
  content = content.replace(/text-purple-900 dark:text-purple-400/g, "text-white");
  content = content.replace(/text-purple-900 dark:text-white/g, "text-white");
  content = content.replace(/text-blue-900 dark:text-white/g, "text-white");
  content = content.replace(/text-blue-900 dark:text-blue-400/g, "text-blue-300");
  content = content.replace(/text-emerald-600 dark:text-emerald-400/g, "text-emerald-400");
  content = content.replace(/text-slate-400 dark:text-slate-300/g, "text-slate-300");
  
  // Naked text-slate-800 inside the VIP PRO containers
  content = content.replace(/text-slate-800/g, "text-white");
  content = content.replace(/border-white\/80/g, "border-white/20");

  fs.writeFileSync(file, content, 'utf8');
  console.log("Fixed " + file);
}
