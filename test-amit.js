require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');
  
  const userSchema = new mongoose.Schema({}, { strict: false });
  const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
  
  const amit = await User.findOne({ name: /amit/i });
  console.log('Amit:', amit ? { id: amit._id, role: amit.role, name: amit.name, code: amit.referralCode } : 'Not found');
  
  if (amit) {
    const downline = await User.find({ referredBy: amit._id });
    console.log('Direct Referrals to Amit (_id):', downline.length, downline.map(u => ({ name: u.name, id: u._id })));
    
    // Check by string maybe?
    const downlineStr = await User.find({ referredBy: amit._id.toString() });
    console.log('Direct Referrals to Amit (string):', downlineStr.length);
    
    // network downline using graph lookup
    const network = await User.aggregate([
      { $match: { _id: amit._id } },
      {
        $graphLookup: {
          from: 'users',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'referredBy',
          as: 'network'
        }
      },
      { $project: { networkCount: { $size: '$network' }, ids: '$network._id' } }
    ]);
    console.log('Amit Network:', network[0]?.networkCount, network[0]?.ids);
  }
  
  const allUsers = await User.find().limit(10);
  for (const u of allUsers) {
    console.log(`User ${u.name} (Role: ${u.role}) referred by: ${u.referredBy} (Type: ${typeof u.referredBy})`);
  }
  
  process.exit(0);
}

run().catch(console.error);
