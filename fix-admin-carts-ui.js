const fs = require('fs');

const file = 'stitch/app/(admin)/carts/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Top section (Header)
content = content.replace(
  'overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 shadow-xl shadow-blue-900/5 backdrop-blur-xl',
  'relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-8 shadow-2xl shadow-purple-900/40 text-white'
);

content = content.replace(
  '<h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-blue-900">Giỏ hàng người dùng</h1>',
  '<h1 className="mt-3 font-headline text-4xl font-black tracking-tight text-white drop-shadow-md">Giỏ hàng người dùng</h1>'
);

content = content.replace(
  '<p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">',
  '<p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-200">'
);

content = content.replace(
  '<p className="mt-2 max-w-2xl text-slate-500">',
  '<p className="mt-2 max-w-2xl text-purple-200/80">'
);

// Stat cards inside Header
content = content.replace(
  'bg-sky-50/80 px-4 py-3 backdrop-blur-sm shadow-sm',
  'bg-white/10 px-4 py-3 backdrop-blur-md shadow-sm'
).replace(
  'border-sky-200', 'border-white/20'
).replace(
  'text-sky-700', 'text-sky-300'
).replace(
  'text-sky-800', 'text-sky-200'
).replace(
  'text-sky-900', 'text-white'
);

content = content.replace(
  'bg-violet-50/80 px-4 py-3 backdrop-blur-sm shadow-sm',
  'bg-white/10 px-4 py-3 backdrop-blur-md shadow-sm'
).replace(
  'border-violet-200', 'border-white/20'
).replace(
  'text-violet-700', 'text-fuchsia-300'
).replace(
  'text-violet-800', 'text-fuchsia-200'
).replace(
  'text-violet-900', 'text-white'
);

content = content.replace(
  'bg-emerald-50/80 px-4 py-3 backdrop-blur-sm shadow-sm',
  'bg-white/10 px-4 py-3 backdrop-blur-md shadow-sm'
).replace(
  'border-emerald-200', 'border-white/20'
).replace(
  'text-emerald-700', 'text-emerald-400'
).replace(
  'text-emerald-800', 'text-emerald-300'
).replace(
  'text-emerald-900', 'text-white'
);

content = content.replace(
  'border-slate-200 bg-white/60 px-5 py-3 backdrop-blur-sm shadow-sm',
  'border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md shadow-sm'
).replace(
  'text-blue-700', 'text-indigo-300'
).replace(
  'text-slate-500', 'text-indigo-200'
).replace(
  'text-blue-900', 'text-white'
);


// Replace Filter Section
content = content.replace(
  '<section className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-5 shadow-sm">',
  '<section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl">'
);

content = content.replace(
  'text-on-surface-variant',
  'text-slate-400'
);
content = content.replace(/text-on-surface-variant/g, 'text-slate-400');
content = content.replace(/text-on-surface/g, 'text-slate-200');

// List item (details)
content = content.replace(
  /bg-surface-container-lowest/g,
  'bg-white/5 backdrop-blur-xl'
);
content = content.replace(
  /border-outline-variant\/10/g,
  'border-white/10'
);
content = content.replace(
  /bg-gradient-to-r from-slate-50 to-blue-50/g,
  'bg-white/5 hover:bg-white/10 transition-colors'
);
content = content.replace(
  /text-blue-900/g,
  'text-indigo-400'
);
content = content.replace(
  /text-blue-800/g,
  'text-white'
);
content = content.replace(
  /text-primary/g,
  'text-fuchsia-400'
);

content = content.replace(
  /bg-white/g,
  'bg-transparent'
); // Fix for inner drop down content bg-white -> bg-transparent

content = content.replace(
  /border-slate-100/g,
  'border-white/10'
);

content = content.replace(
  /bg-surface/g,
  'bg-white/5'
);

content = content.replace(
  /bg-slate-100/g,
  'bg-slate-800/50'
);

content = content.replace(
  /text-slate-800/g,
  'text-slate-200'
);

content = content.replace(
  /text-slate-700/g,
  'text-slate-300'
);

content = content.replace(
  /text-slate-500/g,
  'text-slate-400'
);

content = content.replace(
  /bg-emerald-100/g,
  'bg-emerald-500/20'
);

content = content.replace(
  /text-emerald-800/g,
  'text-emerald-400'
);

// Pagination
content = content.replace(
  /bg-surface-container-high/g,
  'bg-indigo-600/20'
);
content = content.replace(
  /hover:bg-surface-bright/g,
  'hover:bg-indigo-500/30'
);


fs.writeFileSync(file, content, 'utf8');
console.log('Admin cart page updated');
