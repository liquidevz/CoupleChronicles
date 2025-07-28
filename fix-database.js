import 'dotenv/config';

console.log('🔧 Database Connection Fix');
console.log('==========================\n');

const currentUrl = process.env.DATABASE_URL;
console.log('Current DATABASE_URL:', currentUrl ? currentUrl.replace(/:[^:@]*@/, ':****@') : 'Not set');

if (currentUrl && currentUrl.includes('pooler.supabase.com')) {
  console.log('\n❌ Issue: You\'re using the Supabase connection pooler URL');
  console.log('The pooler URL (port 6543) doesn\'t work well with Drizzle migrations.\n');
  
  console.log('🔧 Solution:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Go to Settings → Database');
  console.log('3. Copy the "Connection string" from the "Direct connection" section (not the pooler)');
  console.log('4. It should look like: postgresql://postgres:[YOUR-PASSWORD]@aws-0-ap-south-1.supabase.com:5432/postgres');
  console.log('5. Update your .env file with this new DATABASE_URL\n');
  
  console.log('💡 Alternative: Use the pooler for the app but direct for migrations');
  console.log('You can keep your current DATABASE_URL for the app, but create a separate');
  console.log('DATABASE_URL_MIGRATIONS variable for migrations.\n');
  
  console.log('📝 Example .env file:');
  console.log('DATABASE_URL=postgresql://postgres.byksezbdpilcnuxwwvwx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres');
  console.log('DATABASE_URL_MIGRATIONS=postgresql://postgres.byksezbdpilcnuxwwvwx:password@aws-0-ap-south-1.supabase.com:5432/postgres');
} else {
  console.log('✅ Your DATABASE_URL looks correct');
  console.log('The issue might be with the database credentials or network access.');
} 