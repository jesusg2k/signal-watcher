#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Signal Watcher...\n');

// Install root dependencies
console.log('📦 Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
process.chdir('backend');
execSync('npm install', { stdio: 'inherit' });

// Generate Prisma client
console.log('\n🗄️  Generating Prisma client...');
execSync('npx prisma generate', { stdio: 'inherit' });

// Go back to root and install frontend dependencies
process.chdir('..');
console.log('\n📦 Installing frontend dependencies...');
process.chdir('frontend');
execSync('npm install', { stdio: 'inherit' });

// Go back to root
process.chdir('..');

console.log('\n✅ Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Copy .env.example to .env and configure your environment variables');
console.log('2. Start PostgreSQL and Redis (or use Docker: docker-compose up postgres redis -d)');
console.log('3. Run database migrations: cd backend && npm run db:push');
console.log('4. Start the development servers: npm run dev');
console.log('\n🎉 Happy coding!');