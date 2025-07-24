import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { clients, accountManagers } from '@/db/schema';
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
} from './clients';
import {
  createAccountManagerFixture,
  createClientFixture,
} from '@/tests/fixtures';
import { generateMockUuid } from '@/tests/utils/mockUuid';

describe('Client Actions - Integration Tests', () => {
  it('should create and retrieve a client with real database', async ({
    db,
  }) => {
    // ARRANGE & ACT
    const createResult = await createClientFixture({
      name: 'Acme Corporation',
      contactInfo: 'contact@acme.com',
      accountManager: {
        name: 'Test Manager',
        email: 'manager@example.com',
      },
    });

    // ASSERT
    expect(createResult.success).toBe(true);
    expect(createResult.data).toBeDefined();
    expect(createResult.data!.name).toBe('Acme Corporation');
    expect(createResult.data!.contactInfo).toBe('contact@acme.com');
    expect(createResult.data!.accountManagerId).toBeTruthy();

    // VERIFY: Data persisted in database
    const [dbClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, createResult.data!.id));

    expect(dbClient).toBeDefined();
    expect(dbClient.name).toBe('Acme Corporation');
    expect(dbClient.contactInfo).toBe('contact@acme.com');
  });

  it('should handle server action validation with real database', async () => {
    // ARRANGE: Invalid data (missing required fields)
    const invalidClient = {
      name: '', // Empty name should fail validation
      contactInfo: 'Valid contact info',
      accountManagerId: 'invalid-uuid', // Invalid UUID format
    };

    // ACT
    const result = await createClient(invalidClient);

    // ASSERT
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const errorIssues = JSON.parse(result.error!);
    expect(errorIssues).toBeInstanceOf(Array);
    expect(errorIssues.length).toBeGreaterThan(0);

    const errorPaths = errorIssues.map(
      (issue: { path: string[] }) => issue.path[0],
    );
    expect(errorPaths).toContain('name');
    expect(errorPaths).toContain('accountManagerId');
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE
    const accountManagerResult = await createAccountManagerFixture({
      name: 'CRUD Test Manager',
      email: 'crud@example.com',
    });
    const accountManagerId = accountManagerResult.data!.id;

    const clientData = {
      name: 'CRUD Test Corp',
      contactInfo: 'finance@crudcorp.com',
      accountManagerId,
    };

    // ACT & ASSERT: CREATE
    const createResult = await createClient(clientData);
    expect(createResult.success).toBe(true);
    const clientId = createResult.data!.id;

    // ACT & ASSERT: READ (get single)
    const getResult = await getClient(clientId);
    expect(getResult.success).toBe(true);
    expect(getResult.data!.name).toBe(clientData.name);

    // ACT & ASSERT: READ (get all)
    const getAllResult = await getClients();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toHaveLength(1);
    expect(getAllResult.data![0].name).toBe(clientData.name);

    // ACT & ASSERT: READ (get by account manager)
    const getByManagerResult = await getClients(accountManagerId);
    expect(getByManagerResult.success).toBe(true);
    expect(getByManagerResult.data).toHaveLength(1);

    // ACT & ASSERT: UPDATE
    const updateData = {
      name: 'Updated Corp Name',
      contactInfo: 'updated@corp.com',
    };
    const updateResult = await updateClient(clientId, updateData);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data!.name).toBe(updateData.name);
    expect(updateResult.data!.contactInfo).toBe(updateData.contactInfo);

    // VERIFY: Update persisted in database
    const [updatedClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId));
    expect(updatedClient.name).toBe(updateData.name);
    expect(updatedClient.contactInfo).toBe(updateData.contactInfo);

    // ACT & ASSERT: DELETE
    const deleteResult = await deleteClient(clientId);
    expect(deleteResult.success).toBe(true);

    // VERIFY: Client no longer exists in database
    const [deletedClient] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId));
    expect(deletedClient).toBeUndefined();
  });

  it('should handle foreign key constraints', async () => {
    // ARRANGE: Try to create client with non-existent account manager
    const clientWithInvalidManager = {
      name: 'Test Client',
      industry: 'Technology',
      accountManagerId: generateMockUuid(), // Valid UUID but doesn't exist
    };

    // ACT: Attempt to create client
    const result = await createClient(clientWithInvalidManager);

    // ASSERT: Should fail due to foreign key constraint
    expect(result.success).toBe(false);
    expect(result.error).toBe('Account manager not found');
  });

  it('should demonstrate transaction isolation between tests', async ({
    db,
  }) => {
    // ARRANGE: Check that no data from previous test exists
    const allClients = await db.select().from(clients);
    const allAccountManagers = await db.select().from(accountManagers);

    // ASSERT: Database should be clean due to transaction rollback
    expect(allClients).toHaveLength(0);
    expect(allAccountManagers).toHaveLength(0);
  });
});
