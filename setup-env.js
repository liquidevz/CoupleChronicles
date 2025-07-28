import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 CoupleChronicle Environment Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else {
  console.log('❌ .env file not found');
  console.log('\nTo fix the 503 errors, you need to create a .env file with the following variables:\n');
  
  const envTemplate = `# Database Configuration
# Get this from Supabase Dashboard -> Settings -> Database -> Connection string
DATABASE_URL=postgresql://username:password@hostname:port/database

# Google OAuth Configuration
# Get these from Google Cloud Console -> Credentials -> OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Session Configuration
SESSION_SECRET=your_long_random_session_secret_here

# Partner Email Addresses
# These are the Gmail addresses that are authorized to use the app
PARTNER1_EMAIL=partner1@gmail.com
PARTNER2_EMAIL=partner2@gmail.com

# Environment
NODE_ENV=development`;

  console.log(envTemplate);
  console.log('\n📝 Instructions:');
  console.log('1. Create a file named ".env" in the root directory');
  console.log('2. Copy the template above into the .env file');
  console.log('3. Replace the placeholder values with your actual credentials');
  console.log('4. Restart the development server with "npm run dev"');
  console.log('\n🔗 Quick Links:');
  console.log('- Supabase Dashboard: https://supabase.com/dashboard/projects');
  console.log('- Google Cloud Console: https://console.cloud.google.com');
  console.log('\n💡 For development, you can use these minimal values:');
  console.log('DATABASE_URL=postgresql://test:test@localhost:5432/test');
  console.log('GOOGLE_CLIENT_ID=test');
  console.log('GOOGLE_CLIENT_SECRET=test');
  console.log('SESSION_SECRET=your-super-long-random-string-here');
  console.log('PARTNER1_EMAIL=test1@gmail.com');
  console.log('PARTNER2_EMAIL=test2@gmail.com');
} 