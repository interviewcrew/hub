import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { interviewStepTypes, clients } from '@/db/schema';
import {
  createInterviewStepType,
  getInterviewStepTypes,
  getInterviewStepType,
  updateInterviewStepType,
  deleteInterviewStepType,
} from './interviewStepTypes';
import {
  createInterviewStepTypeFixture,
  createClientFixture,
} from '@/tests/fixtures';

describe('Interview Step Type Actions - Integration Tests', () => {
  it('should create and retrieve an interview step type with real database', async ({
    db,
  }) => {
    // ARRANGE & ACT
    const clientResult = await createClientFixture({
      name: 'Test Client',
      accountManager: { email: 'test.client.am@example.com' },
    });
    const clientId = clientResult.data!.id;

    const createResult = await createInterviewStepTypeFixture({
      name: 'Technical Screen',
      clientId,
    });

    // ASSERT
    expect(createResult.success).toBe(true);
    expect(createResult.data?.name).toBe('Technical Screen');
    expect(createResult.data?.clientId).toBe(clientId);

    // Verify the record exists in the database directly
    const dbRecords = await db
      .select()
      .from(interviewStepTypes)
      .where(eq(interviewStepTypes.id, createResult.data!.id));

    expect(dbRecords).toHaveLength(1);
    expect(dbRecords[0].name).toBe('Technical Screen');
    expect(dbRecords[0].clientId).toBe(clientId);
  });

  it('should handle server action validation with real database', async ({
    db,
  }) => {
    // ARRANGE
    const invalidInput = {
      name: '', // Invalid: empty name
      clientId: 'invalid-uuid', // Invalid: not a real client
    };

    // ACT
    const createResult = await createInterviewStepType(invalidInput);

    // ASSERT
    expect(createResult.success).toBe(false);
    expect(createResult.error).toBeDefined();

    const errorIssues = JSON.parse(createResult.error!);
    expect(errorIssues[0].message).toBe('Name is required');
    expect(errorIssues[1].message).toBe('Client ID must be a valid UUID');

    // Verify no record was created in the database
    const dbRecords = await db.select().from(interviewStepTypes);
    expect(dbRecords).toHaveLength(0);
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE
    const clientResult = await createClientFixture({
      name: 'CRUD Client',
      accountManager: { email: 'crud.client.am@example.com' },
    });
    const clientId = clientResult.data!.id;

    // CREATE using fixture
    const createResult = await createInterviewStepTypeFixture({
      name: 'Initial Screening',
      clientId,
    });
    const stepTypeId = createResult.data!.id;

    // READ (get single)
    const getResult = await getInterviewStepType(stepTypeId, clientId);
    expect(getResult.data?.name).toBe('Initial Screening');

    // READ (get all for the client)
    // Create another type for the same client to test retrieval of multiple
    await createInterviewStepTypeFixture({
      name: 'HR Interview',
      clientId,
    });
    // Create a type for a different client to ensure we only get the right ones
    const otherClientResult = await createClientFixture({
      name: 'Other Client',
    });
    await createInterviewStepTypeFixture({
      name: 'Other Client Step',
      clientId: otherClientResult.data!.id,
    });

    const getAllResult = await getInterviewStepTypes(clientId);
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toHaveLength(2);
    expect(getAllResult.data?.every((t) => t.clientId === clientId)).toBe(true);

    // UPDATE
    const updateResult = await updateInterviewStepType(stepTypeId, clientId, {
      name: 'Updated Initial Screening',
    });
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.name).toBe('Updated Initial Screening');

    // Verify update in database
    const updatedRecord = await db
      .select()
      .from(interviewStepTypes)
      .where(eq(interviewStepTypes.id, stepTypeId));
    expect(updatedRecord[0].name).toBe('Updated Initial Screening');

    // DELETE
    const deleteResult = await deleteInterviewStepType(stepTypeId, clientId);
    expect(deleteResult.success).toBe(true);

    // Verify deletion in database
    const deletedRecord = await db
      .select()
      .from(interviewStepTypes)
      .where(eq(interviewStepTypes.id, stepTypeId));
    expect(deletedRecord).toHaveLength(0);

    // Verify other records still exist
    const remainingRecords = await db
      .select()
      .from(interviewStepTypes)
      .where(eq(interviewStepTypes.clientId, clientId));
    expect(remainingRecords).toHaveLength(1);
    expect(remainingRecords[0].name).toBe('HR Interview');
  });

  it('should not allow operations for a different client', async () => {
    // ARRANGE
    const client1Result = await createClientFixture({
      name: 'Client One',
      accountManager: { email: 'client.one.am@example.com' },
    });
    const client1Id = client1Result.data!.id;

    const client2Result = await createClientFixture({
      name: 'Client Two',
      accountManager: { email: 'client.two.am@example.com' },
    });
    const client2Id = client2Result.data!.id;

    const stepTypeResult = await createInterviewStepTypeFixture({
      name: 'Belongs to Client One',
      clientId: client1Id,
    });
    const stepTypeId = stepTypeResult.data!.id;

    // ACT & ASSERT
    const getResult = await getInterviewStepType(stepTypeId, client2Id);
    expect(getResult.success).toBe(false);
    expect(getResult.error).toContain('not found');

    const updateResult = await updateInterviewStepType(stepTypeId, client2Id, {
      name: 'Should Not Work',
    });
    expect(updateResult.success).toBe(false);
    expect(updateResult.error).toContain('not found');

    const deleteResult = await deleteInterviewStepType(stepTypeId, client2Id);
    expect(deleteResult.success).toBe(false);
    expect(deleteResult.error).toContain('not found');
  });

  it('should demonstrate that changes from previous test are not visible', async ({
    db,
  }) => {
    // ARRANGE & ASSERT: Database should be clean of both step types and clients
    const stepTypeRecords = await db.select().from(interviewStepTypes);
    expect(stepTypeRecords).toHaveLength(0);

    const clientRecords = await db.select().from(clients);
    expect(clientRecords).toHaveLength(0);
  });
});
