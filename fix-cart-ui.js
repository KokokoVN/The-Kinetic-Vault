const fs = require('fs');

const file = 'stitch/components/cart-page-client.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace indigo with purple
content = content.replace(/indigo/g, 'purple');
// Replace blue with fuchsia
content = content.replace(/blue-500/g, 'fuchsia-500');
content = content.replace(/blue-600/g, 'fuchsia-600');

// Fix the header background to match the VIP PRO aesthetic
content = content.replace(
  'bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl',
  'bg-gradient-to-br from-purple-950 via-purple-900 to-fuchsia-900 shadow-2xl shadow-purple-900/20'
);

content = content.replace(
  'bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm',
  'bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Cart page UI updated.');
