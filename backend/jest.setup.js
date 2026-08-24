const path = require('path');

// Load test env BEFORE anything else - overrides .env
require('dotenv').config({
  path: path.join(__dirname, '.env.test'),
  override: true
});

// Fallback if .env.test not found
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('mentorbridge_test')) {
  process.env.DATABASE_URL = 'postgresql://postgres:sakif3232@localhost:5432/mentorbridge_test';
}
process.env.JWT_SECRET = process.env.JWT_SECRET || 'mentorbridge_secret_key_2024';
process.env.NODE_ENV = 'test';