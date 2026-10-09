require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await User.create({
    name: 'Root Admin',
    email: 'admin@amifresh.com',
    password: hashedPassword,
    role: 'ROOT_ADMIN',
    phone: '9999999999',
    referralCode: 'ADMIN000',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  console.log('Root admin created successfully:', admin._id);
  
  process.exit(0);
}

run().catch(console.error);
