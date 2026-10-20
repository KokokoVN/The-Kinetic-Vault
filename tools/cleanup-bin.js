const fs = require('fs');
const path = require('path');

const binDir = 'E:/' + String.fromCharCode(36) + 'RECYCLE.BIN';
console.log('Targeting:', binDir);

if (fs.existsSync(binDir)) {
  const items = fs.readdirSync(binDir);
  console.log('Found in bin:', items);
  for (const item of items) {
    const full = path.join(binDir, item);
    try {
      fs.rmSync(full, { recursive: true, force: true });
      console.log('Deleted:', item);
    } catch (e) {
      console.log('Error deleting', item, e.message);
    }
  }
}

// Also clean webpack cache
const wpCache = 'E:/e-commerce-microservices-master/e-commerce-microservices-master/stitch/.next/dev/cache/webpack';
if (fs.existsSync(wpCache)) {
  try {
    fs.rmSync(wpCache, { recursive: true, force: true });
    console.log('Deleted webpack cache successfully');
  } catch (e) {
    console.log('Error deleting webpack cache:', e.message);
  }
}
