const mysql = require('mysql2/promise');

async function sync() {
  const orderDb = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'orders'
  });

  const userDb = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
  });

  try {
    const [rows] = await orderDb.query(`
      SELECT user_id, SUM(total) as total, COUNT(*) as count 
      FROM orders 
      WHERE status = 'DELIVERED' 
      GROUP BY user_id
    `);

    let updated = 0;
    for (const row of rows) {
      if (!row.user_id) continue;
      await userDb.query(
        `UPDATE users SET total_spent = ?, completed_orders_count = ? WHERE id = ?`,
        [row.total, row.count, row.user_id]
      );
      updated++;
      console.log(`Updated user ${row.user_id}: ${row.total} VND, ${row.count} orders.`);
    }

    console.log(`Successfully synced ${updated} users.`);
  } catch (err) {
    console.error(err);
  } finally {
    await orderDb.end();
    await userDb.end();
  }
}

sync();
