const fs = require('fs');

function fixCustomerDetailClient() {
  const file = 'stitch/components/customer-detail-client.tsx';
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /bg-blue-600/g, 'bg-purple-600'
  ).replace(
    /hover:bg-blue-700/g, 'hover:bg-purple-700'
  ).replace(
    /shadow-blue-600/g, 'shadow-purple-600'
  );

  content = content.replace(
    /bg-slate-900 text-white shadow-md shadow-slate-900\/20/g,
    'bg-purple-600 text-white shadow-md shadow-purple-600/30 border-purple-500'
  ).replace(
    /bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900/g,
    'bg-white/5 text-slate-400 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-slate-200 backdrop-blur-md'
  );

  fs.writeFileSync(file, content, 'utf8');
}

function fixCustomerDetailPage() {
  const file = 'stitch/app/(admin)/customers/[id]/page.tsx';
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Title and Back button
  content = content.replace(
    /text-slate-900/g, 'text-white'
  ).replace(
    /text-slate-500/g, 'text-slate-400'
  ).replace(
    /text-slate-700/g, 'text-slate-300'
  ).replace(
    /text-slate-600/g, 'text-slate-400'
  );

  content = content.replace(
    /bg-white/g, 'bg-white/5 backdrop-blur-xl border-white/10'
  ).replace(
    /ring-slate-300/g, 'ring-white/10'
  ).replace(
    /hover:bg-slate-50/g, 'hover:bg-white/10'
  );

  // Overview Cards
  content = content.replace(
    /bg-white\/50/g, 'bg-white/5'
  ).replace(
    /border-slate-200/g, 'border-white/10'
  ).replace(
    /border-slate-100/g, 'border-white/10'
  ).replace(
    /bg-slate-50/g, 'bg-white/5'
  ).replace(
    /bg-slate-100/g, 'bg-white/10'
  );

  content = content.replace(
    /text-slate-400/g, 'text-slate-400' // noop just to be sure
  );

  // Labels
  content = content.replace(
    /bg-emerald-100 text-emerald-800/g, 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
  ).replace(
    /bg-red-100 text-red-800/g, 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  ).replace(
    /bg-blue-100/g, 'bg-purple-500/20 border border-purple-500/30'
  ).replace(
    /text-blue-800/g, 'text-purple-300'
  );

  // Actions
  content = content.replace(
    /focus:border-blue-500 focus:ring-blue-500/g, 'focus:border-purple-500 focus:ring-purple-500'
  );

  // Tables
  content = content.replace(
    /divide-slate-200/g, 'divide-white/10'
  ).replace(
    /divide-slate-100/g, 'divide-white/10'
  ).replace(
    /border-slate-300/g, 'border-white/20 bg-white/5'
  );

  content = content.replace(
    /text-blue-600/g, 'text-purple-400'
  ).replace(
    /hover:text-blue-600/g, 'hover:text-purple-400'
  ).replace(
    /bg-blue-50\/30/g, 'bg-purple-500/10'
  ).replace(
    /border-blue-500/g, 'border-purple-500'
  ).replace(
    /text-blue-500/g, 'text-purple-400'
  );
  
  content = content.replace(
    /bg-emerald-600/g, 'bg-emerald-500'
  ).replace(
    /hover:bg-emerald-700/g, 'hover:bg-emerald-600'
  ).replace(
    /shadow-emerald-600\/30/g, 'shadow-emerald-500/20'
  ).replace(
    /shadow-emerald-600\/40/g, 'shadow-emerald-500/30'
  );

  // Fix image container background
  content = content.replace(
    /ring-slate-100/g, 'ring-white/10'
  );

  fs.writeFileSync(file, content, 'utf8');
}

fixCustomerDetailClient();
fixCustomerDetailPage();

console.log('Customer detail UI updated');
