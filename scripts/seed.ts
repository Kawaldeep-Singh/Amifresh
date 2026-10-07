import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import User, { UserRole, UserStatus } from '../models/User';
import Setting from '../models/Setting';

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean existing users for a fresh seed (Optional - use with caution!)
    await User.deleteMany({});
    await Setting.deleteMany({});
    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Root Admin
    const rootAdmin = await User.create({
      name: 'Master Admin',
      email: 'admin@amifresh.com',
      phone: '9999999999',
      password: hashedPassword,
      role: UserRole.ROOT_ADMIN,
      referralCode: 'AMIFRESH',
      status: UserStatus.ACTIVE,
    });
    console.log('Root Admin created:', rootAdmin.email);

    // Create Settings
    await Setting.create({
      key: 'DEFAULT_COMMISSION_RATE',
      value: 35,
      description: 'Default commission rate for products in percentage',
      updatedBy: rootAdmin._id,
    });

    // Create Managers
    const manager1 = await User.create({
      name: 'Amit Manager',
      email: 'amit@example.com',
      phone: '8888888881',
      password: hashedPassword,
      role: UserRole.MANAGER,
      referralCode: 'AMIT8395',
      referredBy: rootAdmin._id,
      status: UserStatus.ACTIVE,
    });

    const manager2 = await User.create({
      name: 'Raj Manager',
      email: 'raj@example.com',
      phone: '8888888882',
      password: hashedPassword,
      role: UserRole.MANAGER,
      referralCode: 'RAJM1234',
      referredBy: rootAdmin._id,
      status: UserStatus.ACTIVE,
    });
    console.log('Managers created');

    // Create Members
    const member1 = await User.create({
      name: 'Kawal Member',
      email: 'kawal@example.com',
      phone: '7777777771',
      password: hashedPassword,
      role: UserRole.MEMBER,
      referralCode: 'KAWA8395',
      referredBy: manager1._id,
      status: UserStatus.ACTIVE,
    });

    const member2 = await User.create({
      name: 'Laljeet Member',
      email: 'laljeet@example.com',
      phone: '7777777772',
      password: hashedPassword,
      role: UserRole.MEMBER,
      referralCode: 'LALJ7824',
      referredBy: member1._id,
      status: UserStatus.ACTIVE,
    });
    
    console.log('Members created');
    console.log('Seed completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
