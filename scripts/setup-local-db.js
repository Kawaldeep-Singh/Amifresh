const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('1. Connecting to local MySQL server at 127.0.0.1:3306 (user: root)...');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    multipleStatements: true,
  });

  const dbName = 'u789152685_sakhi_amifresh';
  console.log(`2. Creating database \`${dbName}\` if not exists...`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await conn.query(`USE \`${dbName}\`;`);

  console.log('3. Reading schema.sql and creating tables...');
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await conn.query(schemaSql);
  console.log('   Tables created successfully!');

  console.log('4. Seeding Root Admin & Sample Sakhi User for local testing...');
  const adminHash = await bcrypt.hash('admin123', 10);
  await conn.query(`
    INSERT INTO users (
      id, name, email, phone, password, loginId, 
      mustChangePassword, role, referralCode, status, 
      commissionRate, totalSales, totalCommission
    ) VALUES (
      'admin-root-0001', 'Master Admin', 'admin@amifresh.com', '9999999999',
      ?, 'ADMIN001', 0, 'ROOT_ADMIN', 'AMIFRESH', 'ACTIVE', 35.00, 0.00, 0.00
    ) ON DUPLICATE KEY UPDATE password = VALUES(password);
  `, [adminHash]);

  // Seed sample Sakhi user with demo PAN card image for testing the view button!
  const samplePanImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%231e3a8a" rx="15"/><text x="20" y="40" fill="white" font-family="sans-serif" font-size="16" font-weight="bold">INCOME TAX DEPARTMENT - GOVT OF INDIA</text><rect x="20" y="60" width="80" height="90" fill="%23475569" rx="5"/><text x="120" y="90" fill="%2393c5fd" font-family="sans-serif" font-size="14">Permanent Account Number</text><text x="120" y="125" fill="%23facc15" font-family="monospace" font-size="22" font-weight="bold">ABCDE1234F</text><text x="120" y="160" fill="white" font-family="sans-serif" font-size="14">Name: Sunita Sharma</text><text x="120" y="185" fill="white" font-family="sans-serif" font-size="12">Father: Ramesh Sharma</text><text x="120" y="210" fill="white" font-family="sans-serif" font-size="12">DOB: 15/08/1992</text></svg>';
  const sampleAadhaarFront = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="3" rx="15"/><rect x="0" y="0" width="400" height="40" fill="%23ea580c" rx="15"/><text x="120" y="26" fill="white" font-family="sans-serif" font-size="16" font-weight="bold">GOVERNMENT OF INDIA</text><rect x="25" y="60" width="80" height="95" fill="%2394a3b8" rx="6"/><text x="125" y="85" fill="%230f172a" font-family="sans-serif" font-size="15" font-weight="bold">Sunita Sharma</text><text x="125" y="110" fill="%23475569" font-family="sans-serif" font-size="13">DOB: 15/08/1992</text><text x="125" y="130" fill="%23475569" font-family="sans-serif" font-size="13">Female</text><text x="80" y="210" fill="%23b91c1c" font-family="monospace" font-size="24" font-weight="bold">XXXX XXXX 8942</text></svg>';
  const samplePhoto = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" fill="%2316a34a"/><circle cx="100" cy="80" r="35" fill="white"/><ellipse cx="100" cy="160" rx="60" ry="40" fill="white"/></svg>';

  const sakhiHash = await bcrypt.hash('sakhi123', 10);
  await conn.query(`
    INSERT INTO users (
      id, name, email, phone, password, loginId, 
      mustChangePassword, role, referralCode, referredBy, status, 
      commissionRate, totalSales, totalCommission,
      dob, fatherSpouseName, address, city, state, pinCode,
      photo, panCard, aadhaarCard, aadhaarCardFront, aadhaarCardBack
    ) VALUES (
      'sakhi-demo-0001', 'Sunita Sharma', 'sunita@example.com', '9876543210',
      ?, 'SAKHI1001', 0, 'SAKHI', 'SAKHI1001', 'admin-root-0001', 'ACTIVE',
      35.00, 15000.00, 5250.00,
      '1992-08-15', 'Ramesh Sharma', 'House No 42, Civil Lines', 'Ludhiana', 'Punjab', '141001',
      ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE 
      name = VALUES(name),
      panCard = VALUES(panCard),
      aadhaarCardFront = VALUES(aadhaarCardFront),
      photo = VALUES(photo);
  `, [sakhiHash, samplePhoto, samplePanImage, sampleAadhaarFront, sampleAadhaarFront, sampleAadhaarFront]);

  console.log('   Sample Sakhi (sunita@example.com / SAKHI1001) seeded with PAN & Aadhaar images!');

  await conn.end();
  console.log('\n[SUCCESS] Local database is completely ready for development!');
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
