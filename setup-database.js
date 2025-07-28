import 'dotenv/config';

console.log('🗄️  Database Setup Guide');
console.log('========================\n');

console.log('The "fetch failed" error means your DATABASE_URL is pointing to a database that doesn\'t exist or isn\'t accessible.');
console.log('\n📋 You have several options:\n');

console.log('Option 1: Use Supabase (Recommended - Free)');
console.log('1. Go to https://supabase.com/dashboard/projects');
console.log('2. Create a new project');
console.log('3. Go to Settings → Database');
console.log('4. Copy the "Connection string" from the "Transaction pooler" section');
console.log('5. Replace [YOUR-PASSWORD] with your database password');
console.log('6. Update your .env file with the new DATABASE_URL\n');

console.log('Option 2: Use Neon (Alternative - Free)');
console.log('1. Go to https://neon.tech');
console.log('2. Create a new project');
console.log('3. Copy the connection string');
console.log('4. Update your .env file\n');

console.log('Option 3: Use Local PostgreSQL');
console.log('1. Install PostgreSQL locally');
console.log('2. Create a database');
console.log('3. Use connection string: postgresql://username:password@localhost:5432/database_name\n');

console.log('🔧 After setting up the database, run:');
console.log('npm run db:push');
console.log('\nThis will create all the necessary tables in your database.\n');

console.log('💡 Current DATABASE_URL status:');
if (process.env.DATABASE_URL) {
  console.log('✅ DATABASE_URL is set');
  console.log('URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));
} else {
  console.log('❌ DATABASE_URL is not set');
}

console.log('\n🚀 Quick Test:');
console.log('After updating your DATABASE_URL, restart the server and visit:');
console.log('http://localhost:5000/api/setup/status'); 