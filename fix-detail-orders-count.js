const fs = require('fs');

const file = 'stitch/app/(admin)/customers/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const computedCompletedOrders = orders.filter(o => o.status === \'DELIVERED\').length;',
  'const computedCompletedOrders = user.completedOrdersCount ?? orders.filter(o => o.status === \'DELIVERED\').length;'
);

content = content.replace(
  'const computedTotalSpent = orders.filter(o => o.status === \'DELIVERED\').reduce((sum, o) => sum + Number(o.total ?? 0), 0);',
  'const computedTotalSpent = Number(user.totalSpent ?? orders.filter(o => o.status === \'DELIVERED\').reduce((sum, o) => sum + Number(o.total ?? 0), 0));'
);

// We should also replace the total orders count from orders.length if there's a better one? No, `user` doesn't have total orders count, just completedOrdersCount.
// So let's just replace `orders.length` in the "Đơn Hàng" block with Math.max(orders.length, computedCompletedOrders) so it doesn't look silly if completed > total.
content = content.replace(
  '<p className="text-xl font-black text-white">\n                {orders.length}\n              </p>',
  '<p className="text-xl font-black text-white">\n                {Math.max(orders.length, computedCompletedOrders)}\n              </p>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed order counts in detail page');
