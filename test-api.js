const http = require('http');

const data = JSON.stringify({
  productName: "hi",
  discription: "ágdf",
  categoryId: 202,
  brandId: 1,
  price: 1,
  availability: 0
});

const options = {
  hostname: 'localhost',
  port: 8900,
  path: '/api/catalog/admin/products',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Username': 'admin',
    'X-User-Id': '1',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(`BODY: ${body}`));
});

req.on('error', (e) => console.error(`problem with request: ${e.message}`));
req.write(data);
req.end();
