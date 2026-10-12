const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function cleanup() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to amifresh MongoDB');

  const usersCol = mongoose.connection.db.collection('users');
  const regCol = mongoose.connection.db.collection('registrationrequests');
  const refCol = mongoose.connection.db.collection('referralhistories');
  const auditCol = mongoose.connection.db.collection('auditlogs');
  const ordersCol = mongoose.connection.db.collection('orders');
  const commCol = mongoose.connection.db.collection('commissions');

  // 1. Delete all non-admin users
  const deleteUsersResult = await usersCol.deleteMany({ role: { $ne: 'ROOT_ADMIN' } });
  console.log(`Deleted ${deleteUsersResult.deletedCount} non-admin user(s).`);

  // 2. Reset admin totals and ensure active status
  await usersCol.updateOne(
    { role: 'ROOT_ADMIN' },
    { 
      $set: { 
        totalSales: 0, 
        totalCommission: 0,
        status: 'ACTIVE'
      },
      $unset: { referredBy: '' }
    }
  );
  console.log('Reset admin user metrics.');

  // 3. Clear registration requests
  const deleteRegResult = await regCol.deleteMany({});
  console.log(`Deleted ${deleteRegResult.deletedCount} registration request(s).`);

  // 4. Clear referral histories
  const deleteRefResult = await refCol.deleteMany({});
  console.log(`Deleted ${deleteRefResult.deletedCount} referral history record(s).`);

  // 5. Clear audit logs
  const deleteAuditResult = await auditCol.deleteMany({});
  console.log(`Deleted ${deleteAuditResult.deletedCount} audit log(s).`);

  // 6. Clear orders & commissions if any
  try {
    const deleteOrdersResult = await ordersCol.deleteMany({});
    console.log(`Deleted ${deleteOrdersResult.deletedCount} order(s).`);
  } catch (e) {
    console.log('Orders collection skipped or already empty.');
  }

  try {
    const deleteCommResult = await commCol.deleteMany({});
    console.log(`Deleted ${deleteCommResult.deletedCount} commission(s).`);
  } catch (e) {
    console.log('Commissions collection skipped or already empty.');
  }

  // 7. Verify remaining state
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n--- Current Collections State ---');
  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count} document(s)`);
  }

  const remainingUsers = await usersCol.find({}).toArray();
  console.log('\n--- Active Admin Account ---');
  for (const u of remainingUsers) {
    console.log({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      referralCode: u.referralCode,
      status: u.status
    });
  }

  await mongoose.disconnect();
  console.log('\nCleanup finished successfully.');
  process.exit(0);
}

cleanup().catch(err => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
