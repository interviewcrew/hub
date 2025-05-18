import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables from .env file (or .env.local, .env.production)
// This is especially important if you run scripts outside of Next.js context
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });
if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === 'production') {
    // In production, DATABASE_URL is critical and should be set in the environment
    throw new Error('DATABASE_URL environment variable is not set for production.');
  } else {
    // For local development, try falling back to a default if not set, or guide the user.
    // However, for this setup, we'll strictly require it as per drizzle.config.ts
    console.warn(
      'DATABASE_URL environment variable is not set. Please ensure it is defined in your .env file (e.g., .env.local).\n' +
      'Example: DATABASE_URL="postgresql://user:password@localhost:5432/interviewcrew_dev"'
    );
    // Depending on the strategy, you might throw an error here too or use a default for a local-only setup.
    // For consistency with drizzle.config.ts, we will throw.
    throw new Error('DATABASE_URL environment variable is not set.');
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // You can add SSL configuration here if needed for production environments
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

// Test the connection (optional, but good for early feedback)
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
    // Release the client if it was acquired before the error
    if (client) release();
    return; // Exit the callback early
  }
  if (client) {
    console.log('Successfully connected to the database via pg.Pool.');
    release(); // Release the client back to the pool
  } else {
    console.warn('pg.Pool.connect callback received no error, but client is undefined.');
  }
});

export const db = drizzle(pool);

// If you have schemas with relations, you might export them like this for convenience:
// import * as schema from '../db/schema';
// export const db = drizzle(pool, { schema }); 