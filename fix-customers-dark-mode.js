const fs = require('fs');

const files = [
  'stitch/app/(admin)/customers/page.tsx',
  'stitch/app/(admin)/customers/[id]/page.tsx',
  'stitch/components/customer-detail-client.tsx'
];

function safelyApplyVIPDarkMode(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace backgrounds
  // We want to add dark:bg-slate-900/60 dark:border-slate-800/50 to bg-white or bg-slate-50
  content = content.replace(/bg-white\b(?!(\/| dark:))/g, 'bg-white dark:bg-slate-900');
  content = content.replace(/bg-white\/50\b(?! dark:)/g, 'bg-white/50 dark:bg-slate-900/50');
  content = content.replace(/bg-slate-50\b(?! dark:)/g, 'bg-slate-50 dark:bg-slate-800/50');
  content = content.replace(/bg-slate-100\b(?! dark:)/g, 'bg-slate-100 dark:bg-slate-800');
  content = content.replace(/bg-slate-200\b(?! dark:)/g, 'bg-slate-200 dark:bg-slate-700');

  // Replace text colors
  content = content.replace(/text-slate-900\b(?! dark:)/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-800\b(?! dark:)/g, 'text-slate-800 dark:text-slate-100');
  content = content.replace(/text-slate-700\b(?! dark:)/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/text-slate-600\b(?! dark:)/g, 'text-slate-600 dark:text-slate-400');
  content = content.replace(/text-slate-500\b(?! dark:)/g, 'text-slate-500 dark:text-slate-400');

  // Replace border colors
  content = content.replace(/border-slate-200\b(?! dark:)/g, 'border-slate-200 dark:border-slate-800');
  content = content.replace(/border-slate-300\b(?! dark:)/g, 'border-slate-300 dark:border-slate-700');
  content = content.replace(/divide-slate-200\b(?! dark:)/g, 'divide-slate-200 dark:divide-slate-800');

  // Replace hover states
  content = content.replace(/hover:bg-slate-50\b(?! dark:)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-100\b(?! dark:)/g, 'hover:bg-slate-100 dark:hover:bg-slate-800');

  // Ensure headers have the gradient but only in dark mode or we keep the white-friendly header.
  // Actually, for headers in `page.tsx` and `[id]/page.tsx`, we can just let it use the dark gradient only on dark mode.
  // Wait, in `customers/[id]/page.tsx` the original header is white/blue. We can add dark gradient to it.

  fs.writeFileSync(filePath, content, 'utf8');
}

files.forEach(f => {
  safelyApplyVIPDarkMode(f);
  console.log('Fixed dark mode safely for:', f);
});
