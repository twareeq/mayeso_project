const { Client } = require('pg');

const connectionString = "postgresql://postgres.tqrpyifnsvajatvvkhcb:Twar%401578331@aws-1-us-east-2.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => {
    console.log('Successfully connected to Supabase via pg driver!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.stack);
    process.exit(1);
  });
