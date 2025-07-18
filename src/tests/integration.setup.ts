// Integration test setup file with transaction rollback strategy
import { afterAll, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as schema from '@/db/schema';

// Mock next/cache at the module level to prevent revalidatePath errors
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(() => {
    // No-op - prevent errors in test environment
  }),
}));

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Extend Vitest test context to include database transaction
declare module 'vitest' {
  export interface TestContext {
    db: NodePgDatabase<typeof schema>;
  }
}

// Main database connection pool for integration tests
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});

// Single Drizzle instance for the entire test run
const db = drizzle(pool, { schema });

// 1. Runs ONCE before all tests
beforeAll(async () => {
  console.log('🔧 Setting up integration tests...');

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set in .env.test',
    );
  }

  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    throw error;
  }

  // Clear any mocks from unit tests that might interfere
  vi.clearAllMocks();
  vi.resetAllMocks();

  // Override the database mock with the real database for integration tests
  vi.doMock('@/lib/db', () => ({
    db: db,
  }));
});

// 2. Runs BEFORE EACH test
beforeEach(async (context) => {
  // Provide the real database connection for now
  // TODO: Implement transaction rollback by making server actions use transactional db
  context.db = db;
});

// 3. Runs AFTER EACH test
afterEach(async () => {
  // Clean up all data using TRUNCATE CASCADE to automatically handle dependencies
  // This approach scales automatically as new tables are added
  try {
    // Get all table names from the current schema
    const result = await db.execute(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'drizzle_%'
        AND tablename != '__drizzle_migrations'
    `);

    const tableNames = result.rows.map(
      (row) => (row as { tablename: string }).tablename,
    );

    if (tableNames.length > 0) {
      // Use TRUNCATE CASCADE to clear all tables and reset sequences
      // CASCADE automatically handles foreign key dependencies
      const truncateQuery = `TRUNCATE TABLE ${tableNames
        .map((name: string) => `"${name}"`)
        .join(', ')} RESTART IDENTITY CASCADE`;
      await db.execute(truncateQuery);
    }
  } catch (error) {
    console.warn('Warning: Error during test cleanup:', error);
    // Fallback: if TRUNCATE fails, try individual table cleanup
    console.warn('Attempting fallback cleanup...');
    try {
      // Disable foreign key checks temporarily
      await db.execute('SET session_replication_role = replica');

      // Get all tables and truncate them individually
      const result = await db.execute(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename NOT LIKE 'drizzle_%'
          AND tablename != '__drizzle_migrations'
      `);

      for (const row of result.rows) {
        const tablename = (row as { tablename: string }).tablename;
        await db.execute(
          `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE`,
        );
      }

      // Re-enable foreign key checks
      await db.execute('SET session_replication_role = DEFAULT');
    } catch (fallbackError) {
      console.error('Fallback cleanup also failed:', fallbackError);
    }
  }
});

// 4. Runs ONCE after all tests
afterAll(async () => {
  console.log('🧹 Cleaning up integration tests...');

  try {
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
});
