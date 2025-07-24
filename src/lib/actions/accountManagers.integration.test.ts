import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { accountManagers } from '@/db/schema';
import {
  createAccountManager,
  getAccountManagers,
  getAccountManager,
  updateAccountManager,
  deleteAccountManager,
} from './accountManagers';
import { createAccountManagerFixture } from '@/tests/fixtures';

describe('Account Manager Actions - Integration Tests', () => {
  it('should create and retrieve an account manager with real database', async ({
    db,
  }) => {
    // ARRANGE & ACT: Create account manager using fixture
    const createResult = await createAccountManagerFixture({
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    // ASSERT: Creation should succeed
    expect(createResult.success).toBe(true);
    expect(createResult.data).toBeDefined();
    expect(createResult.data?.name).toBe('John Doe');
    expect(createResult.data?.email).toBe('john.doe@example.com');

    // Verify the record exists in the database directly
    const dbRecords = await db
      .select()
      .from(accountManagers)
      .where(eq(accountManagers.email, 'john.doe@example.com'));

    expect(dbRecords).toHaveLength(1);
    expect(dbRecords[0].name).toBe('John Doe');
    expect(dbRecords[0].email).toBe('john.doe@example.com');
  });

  it('should demonstrate transaction isolation between tests', async ({
    db,
  }) => {
    // ARRANGE: Check that no account managers exist at start of this test
    const initialRecords = await db.select().from(accountManagers);
    expect(initialRecords).toHaveLength(0);

    // ACT: Create a new account manager
    const newAccountManager = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
    };

    const createResult = await createAccountManager(newAccountManager);

    // ASSERT: Creation should succeed
    expect(createResult.success).toBe(true);

    // Verify it exists in this transaction
    const recordsAfterCreate = await db.select().from(accountManagers);
    expect(recordsAfterCreate).toHaveLength(1);
    expect(recordsAfterCreate[0].email).toBe(newAccountManager.email);
  });

  it('should handle server action validation with real database', async ({
    db,
  }) => {
    // ARRANGE: Invalid data (missing required fields)
    const invalidAccountManager = {
      name: '', // Invalid: empty name
      email: 'invalid-email', // Invalid: not a proper email
    };

    // ACT: Try to create with invalid data
    const createResult = await createAccountManager(invalidAccountManager);

    // ASSERT: Should fail with validation error
    expect(createResult.success).toBe(false);
    expect(createResult.error).toBeDefined();

    // Parse the validation error
    const errorIssues = JSON.parse(createResult.error!);
    expect(errorIssues).toBeInstanceOf(Array);
    expect(errorIssues.length).toBeGreaterThan(0);

    // Verify no record was created in the database
    const dbRecords = await db.select().from(accountManagers);
    expect(dbRecords).toHaveLength(0);
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // CREATE using fixture
    const createResult = await createAccountManagerFixture({
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
    });
    expect(createResult.success).toBe(true);
    const accountManagerId = createResult.data!.id;

    // READ (get single)
    const getResult = await getAccountManager(accountManagerId);
    expect(getResult.success).toBe(true);
    expect(getResult.data?.name).toBe('Alice Johnson');

    // READ (get all)
    const getAllResult = await getAccountManagers();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toHaveLength(1);

    // UPDATE
    const updateResult = await updateAccountManager(accountManagerId, {
      name: 'Alice Johnson Updated',
      email: 'alice.updated@example.com',
    });
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.name).toBe('Alice Johnson Updated');

    // Verify update in database
    const updatedRecord = await db
      .select()
      .from(accountManagers)
      .where(eq(accountManagers.id, accountManagerId));
    expect(updatedRecord[0].name).toBe('Alice Johnson Updated');
    expect(updatedRecord[0].email).toBe('alice.updated@example.com');

    // DELETE
    const deleteResult = await deleteAccountManager(accountManagerId);
    expect(deleteResult.success).toBe(true);

    // Verify deletion in database
    const deletedRecord = await db
      .select()
      .from(accountManagers)
      .where(eq(accountManagers.id, accountManagerId));
    expect(deletedRecord).toHaveLength(0);
  });

  it('should demonstrate that changes from previous test are not visible', async ({
    db,
  }) => {
    // ARRANGE & ASSERT: Database should be clean
    const allRecords = await db.select().from(accountManagers);
    expect(allRecords).toHaveLength(0);

    // This confirms that the transaction rollback strategy is working correctly
  });
});
