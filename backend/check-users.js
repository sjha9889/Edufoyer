import mongoose from 'mongoose';
import User from './models/User.js';
import { config } from './config.js';

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI || 'mongodb://localhost:27017/finalnls');

async function checkUsers() {
  try {
    console.log('🔍 Checking existing users...\n');
    
    const users = await User.find({}).select('name email role createdAt');
    
    if (users.length === 0) {
      console.log('❌ No users found in the database.');
      console.log('You need to register a user first through the app.');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('   ---');
      });
      
      console.log('\n💡 To make any user admin, use:');
      console.log('   node make-admin.js <email>');
      console.log('\nOr visit: http://localhost:5000/api/auth/admin/promote');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();


