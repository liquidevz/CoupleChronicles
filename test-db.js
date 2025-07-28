import 'dotenv/config';
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

console.log('🧪 Testing Database Connection');
console.log('=============================\n');

try {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (process.env.DATABASE_URL) {
    console.log('Attempting to connect...');
    const connection = neon(process.env.DATABASE_URL);
    const db = drizzle(connection);
    
    // Test a simple query
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful!');
    console.log('Test query result:', result);
  } else {
    console.log('❌ DATABASE_URL not set');
  }
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.log('\n💡 Possible solutions:');
  console.log('1. Check your DATABASE_URL in .env file');
  console.log('2. Make sure your database is accessible');
  console.log('3. Try using the direct connection URL instead of pooler');
} 