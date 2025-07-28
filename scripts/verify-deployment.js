#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks that all required environment variables and configurations are ready
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 LoveSync Deployment Verification\n');

const requiredEnvVars = [
  'DATABASE_URL',
  'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET',
  'SESSION_SECRET',
  'PARTNER1_EMAIL',
  'PARTNER2_EMAIL'
];

const requiredFiles = [
  'vercel.json',
  'api/index.ts',
  '.env.example',
  'README.md',
  'DEPLOYMENT.md',
  'package.json',
  'client/index.html',
  'server/index.ts',
  'shared/schema.ts'
];

let allGood = true;

// Check required files exist
console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allGood = false;
  }
});

console.log('\n🔐 Checking environment variables...');

// Check if .env.example has all required vars
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  requiredEnvVars.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`  ✅ ${envVar} documented in .env.example`);
    } else {
      console.log(`  ❌ ${envVar} missing from .env.example`);
      allGood = false;
    }
  });
} else {
  console.log('  ❌ .env.example file missing');
  allGood = false;
}

// Check package.json for build scripts
console.log('\n📦 Checking build configuration...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'dev', 'start'];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ npm run ${script} script available`);
    } else {
      console.log(`  ❌ npm run ${script} script missing`);
      allGood = false;
    }
  });
} else {
  console.log('  ❌ package.json missing');
  allGood = false;
}

// Check vercel.json configuration
console.log('\n⚡ Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    if (vercelConfig.builds && vercelConfig.builds.length > 0) {
      console.log('  ✅ Vercel builds configured');
    } else {
      console.log('  ❌ Vercel builds not configured');
      allGood = false;
    }
    
    if (vercelConfig.routes && vercelConfig.routes.length > 0) {
      console.log('  ✅ Vercel routes configured');
    } else {
      console.log('  ❌ Vercel routes not configured'); 
      allGood = false;
    }
  } catch (e) {
    console.log('  ❌ vercel.json invalid JSON');
    allGood = false;
  }
} else {
  console.log('  ❌ vercel.json missing');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 All checks passed! Ready for deployment to Vercel.');
  console.log('\nNext steps:');
  console.log('1. Push code to GitHub');
  console.log('2. Connect repository to Vercel');
  console.log('3. Set environment variables in Vercel dashboard');
  console.log('4. Deploy!');
  console.log('\nSee DEPLOYMENT.md for detailed instructions.');
} else {
  console.log('❌ Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

console.log('');