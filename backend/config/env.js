const dotenv = require('dotenv');
const path = require("path");

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'ORIGIN_URL', 'PORT', 'NODE_ENV'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is not defined!`);
    process.exit(1);
  }
}

module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  ORIGIN_URL: process.env.ORIGIN_URL,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};