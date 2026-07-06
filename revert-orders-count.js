const fs = require('fs');

const file = 'stitch/app/(admin)/customers/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Revert the calculation to compute directly from the orders array
content = content.replace(
  'const computedCompletedOrders = user.completedOrdersCount ?? orders.filter(o => o.status === \'DELIVERED\').length;',
  'const computedCompletedOrders = orders.filter(o => o.status === \'DELIVERED\').length;'
);

content = content.replace(
  'const computedTotalSpent = Number(user.totalSpent ?? orders.filter(o => o.status === \'DELIVERED\').reduce((sum, o) => sum + Number(o.total ?? 0), 0));',
  'const computedTotalSpent = orders.filter(o => o.status === \'DELIVERED\').reduce((sum, o) => sum + Number(o.total ?? 0), 0);'
);

content = content.replace(
  '<p className="text-xl font-black text-white">\n                {Math.max(orders.length, computedCompletedOrders)}\n              </p>',
  '<p className="text-xl font-black text-white">\n                {orders.length}\n              </p>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Reverted to dynamic order calculation');
