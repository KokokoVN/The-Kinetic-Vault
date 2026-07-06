const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sale'
});

connection.execute(
  'SELECT id, name, created_at FROM sale_programs ORDER BY id DESC LIMIT 5',
  function(err, results, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log("Recent sale programs:");
      console.log(results);
    }
    connection.end();
  }
);
