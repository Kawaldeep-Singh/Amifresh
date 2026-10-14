require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'u789152685_amifresh_sakhi';
  const password = process.env.DB_PASSWORD || 'Amifresh@1234';
  const database = process.env.DB_NAME || 'u789152685_sakhi_amifresh';

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  console.log('Connected to MySQL successfully');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await connection.query(`
    INSERT INTO users (
      id, name, email, phone, password, loginId,
      mustChangePassword, role, referralCode, status,
      commissionRate, totalSales, totalCommission, createdAt, updatedAt
    ) VALUES (
      'admin-root-0001', 'Master Admin', 'admin@amifresh.com', '9999999999',
      ?, 'ADMIN001', 0, 'ROOT_ADMIN', 'AMIFRESH', 'ACTIVE',
      35.00, 0.00, 0.00, NOW(), NOW()
    ) ON DUPLICATE KEY UPDATE password = VALUES(password), status = 'ACTIVE'
  `, [hashedPassword]);

  console.log('Root admin created/updated successfully: admin@amifresh.com / admin123');
  await connection.end();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed admin error:', err.message);
  process.exit(1);
});
