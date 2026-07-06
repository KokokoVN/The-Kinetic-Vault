const fs = require('fs');

const file = 'stitch/app/(admin)/customers/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Header Section
content = content.replace(
  'bg-gradient-to-br from-indigo-900 via-blue-900 to-sky-900',
  'bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900'
);
content = content.replace(
  'shadow-blue-900/20 text-white',
  'shadow-purple-900/40 text-white'
);
content = content.replace(
  'bg-blue-500/20',
  'bg-fuchsia-500/20'
);
content = content.replace(
  'bg-indigo-500/30',
  'bg-purple-500/30'
);
content = content.replace(
  'text-blue-100/80',
  'text-purple-200/80'
);
content = content.replace(
  /text-blue-200/g,
  'text-purple-200'
);


// Filter Section
content = content.replace(
  'rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-sm',
  'rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-2xl'
);
content = content.replace(
  /bg-slate-50/g,
  'bg-white/5 text-slate-200 backdrop-blur-md border-white/10'
);
content = content.replace(
  /border-slate-200/g,
  'border-white/10'
);
content = content.replace(
  /text-slate-500/g,
  'text-slate-400'
);
content = content.replace(
  /text-slate-900/g,
  'text-white'
);
content = content.replace(
  /focus:border-blue-500/g,
  'focus:border-purple-500 focus:bg-white/10'
);
content = content.replace(
  /focus:ring-blue-500\/10/g,
  'focus:ring-purple-500/10'
);
content = content.replace(
  /bg-blue-600/g,
  'bg-purple-600'
);
content = content.replace(
  /hover:bg-blue-700/g,
  'hover:bg-purple-700'
);
content = content.replace(
  /shadow-blue-600/g,
  'shadow-purple-600'
);


// Table Section
content = content.replace(
  'rounded-3xl border border-outline-variant/20 bg-white shadow-sm',
  'rounded-[2rem] border border-white/10 bg-white/5 shadow-xl backdrop-blur-2xl'
);
content = content.replace(
  /bg-slate-50\/80/g,
  'bg-white/5'
);
content = content.replace(
  /border-slate-100/g,
  'border-white/10'
);
content = content.replace(
  /text-blue-700/g,
  'text-purple-300'
);
content = content.replace(
  /from-blue-100 to-indigo-100/g,
  'from-indigo-900/50 to-purple-900/50'
);
content = content.replace(
  /border-blue-200\/50/g,
  'border-white/10'
);
content = content.replace(
  /hover:text-blue-600/g,
  'hover:text-purple-400'
);

content = content.replace(
  /bg-slate-100/g,
  'bg-white/10'
);
content = content.replace(
  /text-slate-300/g,
  'text-slate-500'
);
content = content.replace(
  /text-slate-400/g,
  'text-slate-400'
);

content = content.replace(
  /bg-slate-900/g,
  'bg-white/10 text-white'
);

content = content.replace(
  /text-blue-600/g,
  'text-purple-400'
);

content = content.replace(
  /bg-slate-50/g,
  'bg-white/5'
);

content = content.replace(
  /border-outline-variant\/20 bg-white/g,
  'border-white/10 bg-white/5 backdrop-blur-2xl'
);
content = content.replace(
  /hover:bg-slate-200/g,
  'hover:bg-white/20'
);


fs.writeFileSync(file, content, 'utf8');
console.log('Admin customers page updated');
