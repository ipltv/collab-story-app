import dotenv from 'dotenv';

dotenv.config();
const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'ORIGIN_URL', 'PORT' ] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    console.error(`Environment variable ${key} is not defined!`);
    process.exit(1);
  }
}

export const DATABASE_URL = process.env.DATABASE_URL!;
export const SESSION_SECRET = process.env.SESSION_SECRET!;
export const ORIGIN_URL = process.env.ORIGIN_URL!;
export const PORT = process.env.PORT!;