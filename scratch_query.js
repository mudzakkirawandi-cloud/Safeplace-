const { Client } = require('pg');

const client = new Client('postgres://postgres:postgres@127.0.0.1:54322/postgres');

client.connect()
  .then(() => client.query(`
    SELECT schemaname, tablename, policyname, cmd, qual 
    FROM pg_policies 
    WHERE tablename IN ('messages', 'reports');
  `))
  .then(res => {
    console.table(res.rows);
  })
  .catch(console.error)
  .finally(() => client.end());
