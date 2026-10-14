import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { execute, query } from '../lib/mysql';
import User, { UserRole, UserStatus } from '../models/User';
import Setting from '../models/Setting';

async function seed() {
  try {
    console.log('Connecting to MySQL & seeding data...');

    // Clear existing data (optional/fresh seed)
    await execute('DELETE FROM users');
    await execute('DELETE FROM settings');
    await execute('DELETE FROM products');
    await execute('DELETE FROM orders');
    await execute('DELETE FROM commissions');
    await execute('DELETE FROM audit_logs');
    await execute('DELETE FROM referral_histories');
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create Root Admin
    const rootAdmin = await User.create({
      id: 'admin-root-0001',
      name: 'Master Admin',
      email: 'admin@amifresh.com',
      phone: '9999999999',
      password: hashedPassword,
      loginId: 'ADMIN001',
      role: UserRole.ROOT_ADMIN,
      referralCode: 'AMIFRESH',
      status: UserStatus.ACTIVE,
    });
    console.log('Root Admin created: admin@amifresh.com (password: admin123)');

    // Create Settings
    await Setting.create({
      key: 'DEFAULT_COMMISSION_RATE',
      value: 35,
      description: 'Default commission rate for products in percentage',
      updatedBy: rootAdmin.id,
    });

    // Create Teams
    const team1 = await User.create({
      name: 'Amit Team',
      email: 'amit@example.com',
      phone: '8888888881',
      password: hashedPassword,
      loginId: 'EMP888881',
      role: UserRole.TEAM,
      referralCode: 'AMIT8395',
      referredBy: rootAdmin.id,
      status: UserStatus.ACTIVE,
    });

    const team2 = await User.create({
      name: 'Raj Team',
      email: 'raj@example.com',
      phone: '8888888882',
      password: hashedPassword,
      loginId: 'EMP888882',
      role: UserRole.TEAM,
      referralCode: 'RAJM1234',
      referredBy: rootAdmin.id,
      status: UserStatus.ACTIVE,
    });
    console.log('Teams created');

    // Create Sakhi
    const sakhi1 = await User.create({
      name: 'Kawal Sakhi',
      email: 'kawal@example.com',
      phone: '7777777771',
      password: hashedPassword,
      loginId: 'SAKHI777771',
      role: UserRole.SAKHI,
      referralCode: 'KAWA8395',
      referredBy: team1.id,
      status: UserStatus.ACTIVE,
    });

    const sakhi2 = await User.create({
      name: 'Laljeet Sakhi',
      email: 'laljeet@example.com',
      phone: '7777777772',
      password: hashedPassword,
      loginId: 'SAKHI777772',
      role: UserRole.SAKHI,
      referralCode: 'LALJ7824',
      referredBy: sakhi1.id,
      status: UserStatus.ACTIVE,
    });

    console.log('Sakhi created');
    console.log('Seed completed successfully for MySQL!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
