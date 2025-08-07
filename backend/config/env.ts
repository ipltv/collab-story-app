import dotenv from 'dotenv';
import e from 'express';

// Load environment variables from the appropriate .env file.
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
});

// A list of all required environment variables.
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ORIGIN_URL', 'PORT', 'NODE_ENV'] as const;

// Check if each required variable is defined.
for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is not defined!`);
    // Exit the process if a required variable is missing.
    process.exit(1);
  }
}

// Export the environment variables for use in other files.
// We use type assertions to tell TypeScript that these values exist.
export const DATABASE_URL = process.env.DATABASE_URL as string; // Database connection string
export const JWT_SECRET = process.env.JWT_SECRET as string; // JWT secret for signing tokens
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string; // JWT secret for signing refresh tokens
export const ORIGIN_URL = process.env.ORIGIN_URL as string; //Origin URL for CORS
export const PORT = process.env.PORT as string; // Port on which the backend server will run
export const NODE_ENV = process.env.NODE_ENV as string; // Environment mode (development, production)
