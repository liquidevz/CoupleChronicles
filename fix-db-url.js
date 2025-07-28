import 'dotenv/config';

console.log('🔧 Database URL Fix');
console.log('===================\n');

const currentUrl = process.env.DATABASE_URL;

if (currentUrl) {
  console.log('Current DATABASE_URL:', currentUrl.replace(/:[^:@]*@/, ':****@'));
  
  if (currentUrl.includes('pooler.supabase.com:6543')) {
    console.log('\n❌ Issue: Using Supabase pooler URL (causes fetch failed error)');
    console.log('✅ Solution: Convert to direct connection URL\n');
    
    const fixedUrl = currentUrl.replace('pooler.supabase.com:6543', 'supabase.com:5432');
    console.log('🔧 Fixed DATABASE_URL:');
    console.log(fixedUrl.replace(/:[^:@]*@/, ':****@'));
    
    console.log('\n📝 Instructions:');
    console.log('1. Open your .env file');
    console.log('2. Replace your current DATABASE_URL with:');
    console.log(`DATABASE_URL=${fixedUrl}`);
    console.log('3. Save the file');
    console.log('4. Restart the server: npm run dev');
    
  } else if (currentUrl.includes('supabase.com:5432')) {
    console.log('✅ Your DATABASE_URL looks correct (direct connection)');
    console.log('The issue might be with credentials or network access.');
    
  } else {
    console.log('⚠️  Unknown connection format');
    console.log('Make sure you\'re using a valid Supabase connection string.');
  }
  
} else {
  console.log('❌ DATABASE_URL not set');
  console.log('Please add your database connection string to the .env file');
}

console.log('\n💡 Alternative: Use a different database provider');
console.log('- Neon: https://neon.tech');
console.log('- Railway: https://railway.app');
console.log('- PlanetScale: https://planetscale.com'); 