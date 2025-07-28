// Configuration Example for CoupleChronicle
// Copy this file to config.js and fill in your actual values

module.exports = {
  // Database Configuration
  // Get this from Supabase Dashboard -> Settings -> Database -> Connection string
  DATABASE_URL: 'postgresql://username:password@hostname:port/database',
  
  // Google OAuth Configuration
  // Get these from Google Cloud Console -> Credentials -> OAuth 2.0 Client IDs
  GOOGLE_CLIENT_ID: 'your_google_client_id_here',
  GOOGLE_CLIENT_SECRET: 'your_google_client_secret_here',
  
  // Session Configuration
  SESSION_SECRET: 'your_long_random_session_secret_here',
  
  // Partner Email Addresses
  // These are the Gmail addresses that are authorized to use the app
  PARTNER1_EMAIL: 'partner1@gmail.com',
  PARTNER2_EMAIL: 'partner2@gmail.com',
  
  // Environment
  NODE_ENV: 'development'
}; 