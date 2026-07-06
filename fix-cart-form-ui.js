const fs = require('fs');

const file = 'stitch/components/cart-list-auto-filter-form.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace colors in cart-list-auto-filter-form.tsx
content = content.replace(
  /text-on-surface-variant/g,
  'text-slate-400'
);

content = content.replace(
  /border-outline-variant\/20/g,
  'border-white/20'
);

content = content.replace(
  /bg-white/g,
  'bg-white/10 text-white backdrop-blur-md'
); // for the input and select

content = content.replace(
  /ring-primary/g,
  'ring-purple-500'
);


fs.writeFileSync(file, content, 'utf8');
console.log('Admin cart filter form UI updated');
