import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { positions, techStacks, positionTechStacks } from '@/db/schema';
import {
  createPosition,
  getPositions,
  getPosition,
  updatePosition,
  deletePosition,
} from './positions';
import { createClientFixture } from '@/tests/fixtures';

describe('Position Actions - Integration Tests', () => {
  it('should create and retrieve a position with real database', async ({
    db,
  }) => {
    // ARRANGE
    const clientResult = await createClientFixture({
      name: 'Test Client',
      accountManager: { email: 'test.client.am@example.com' },
    });
    const clientId = clientResult.data!.id;
    const accountManagerId = clientResult.data!.accountManagerId;

    const positionData = {
      title: 'Senior Software Engineer',
      details: 'A challenging role for an experienced developer',
      jobAd: 'We are looking for a senior software engineer...',
      minSalary: 130000,
      maxSalary: 170000,
      culturalFitCriteria: 'Team player, innovative thinker',
      techStacks: ['typescript', 'react', 'node.js'],
      clientId,
      accountManagerId,
    };

    // ACT
    const createResult = await createPosition(positionData);

    // ASSERT
    expect(createResult.success).toBe(true);
    expect(createResult.data!.title).toBe('Senior Software Engineer');
    expect(createResult.data!.details).toBe(
      'A challenging role for an experienced developer',
    );
    expect(createResult.data!.jobAd).toBe(
      'We are looking for a senior software engineer...',
    );
    expect(createResult.data!.minSalary).toBe(130000);
    expect(createResult.data!.maxSalary).toBe(170000);
    expect(createResult.data!.clientId).toBeTruthy();
    expect(createResult.data!.accountManagerId).toBeTruthy();

    // VERIFY: Data persisted in database
    const [dbPosition] = await db
      .select()
      .from(positions)
      .where(eq(positions.id, createResult.data!.id));

    expect(dbPosition).toBeDefined();
    expect(dbPosition.title).toBe('Senior Software Engineer');
    expect(dbPosition.minSalary).toBe(130000);
    expect(dbPosition.maxSalary).toBe(170000);
    expect(dbPosition.clientId).toBe(createResult.data!.clientId);

    // VERIFY: Tech stacks were created and linked
    const techStackResults = await db
      .select()
      .from(techStacks)
      .where(eq(techStacks.name, 'typescript'));
    expect(techStackResults.length).toBeGreaterThan(0);

    const positionTechStackResults = await db
      .select()
      .from(positionTechStacks)
      .where(eq(positionTechStacks.positionId, createResult.data!.id));
    expect(positionTechStackResults).toHaveLength(3);
  });

  it('should handle server action validation with real database', async () => {
    // ARRANGE
    const invalidPosition = {
      title: '', // Empty title should fail validation
      details: 'Valid details',
      clientId: 'invalid-uuid', // Invalid UUID format
      accountManagerId: 'another-invalid-uuid', // Invalid UUID format
      minSalary: -1000, // Negative salary should fail validation
      techStacks: [], // This is totally valid
    };

    // ACT
    const result = await createPosition(invalidPosition);

    // ASSERT
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    // Parse and check specific validation errors
    const errorIssues = JSON.parse(result.error!);
    expect(errorIssues[0].message).toBe('Invalid client ID');
    expect(errorIssues[1].message).toBe('Title is required');
    expect(errorIssues[2].message).toBe('Minimum salary must be non-negative');
    expect(errorIssues[3].message).toBe('Invalid account manager ID');
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE
    const clientResult = await createClientFixture({
      name: 'CRUD Client',
      contactInfo: 'crud@client.com',
      accountManager: {
        name: 'CRUD Manager',
        email: 'crud.manager@example.com',
      },
    });
    const clientId = clientResult.data!.id;
    const accountManagerId = clientResult.data!.accountManagerId;

    // Position data
    const positionData = {
      title: 'CRUD Test Engineer',
      details: 'Testing CRUD operations',
      jobAd: 'We need a CRUD test engineer',
      minSalary: 110000,
      maxSalary: 130000,
      clientId,
      accountManagerId,
      techStacks: ['javascript', 'python'],
    };

    // ACT & ASSERT: CREATE
    const createResult = await createPosition(positionData);
    expect(createResult.success).toBe(true);
    const positionId = createResult.data!.id;

    // ACT & ASSERT: READ (get single)
    const getResult = await getPosition(positionId);
    expect(getResult.success).toBe(true);
    expect(getResult.data!.title).toBe(positionData.title);
    expect(getResult.data!.details).toBe(positionData.details);
    expect(getResult.data!.minSalary).toBe(positionData.minSalary);
    expect(getResult.data!.maxSalary).toBe(positionData.maxSalary);
    expect(getResult.data!.positionTechStacks).toHaveLength(2);
    expect(
      getResult.data!.positionTechStacks!.map((pts) => pts.techStack.name),
    ).toEqual(['javascript', 'python']);

    // ACT & ASSERT: READ (get all)
    const getAllResult = await getPositions();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toHaveLength(1);
    expect(getAllResult.data![0].title).toBe(positionData.title);

    // ACT & ASSERT: UPDATE
    const updateData = {
      title: 'Updated Engineer Position',
      details: 'Updated description',
      minSalary: 125000,
      maxSalary: 145000,
      techStacks: ['typescript', 'react', 'graphql'],
    };
    const updateResult = await updatePosition(positionId, updateData);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data!.title).toBe(updateData.title);
    expect(updateResult.data!.details).toBe(updateData.details);
    expect(updateResult.data!.minSalary).toBe(updateData.minSalary);
    expect(updateResult.data!.maxSalary).toBe(updateData.maxSalary);

    // VERIFY: Update persisted in database
    const [updatedPosition] = await db
      .select()
      .from(positions)
      .where(eq(positions.id, positionId));
    expect(updatedPosition.title).toBe(updateData.title);
    expect(updatedPosition.details).toBe(updateData.details);
    expect(updatedPosition.minSalary).toBe(updateData.minSalary);
    expect(updatedPosition.maxSalary).toBe(updateData.maxSalary);

    // VERIFY: Tech stacks were updated
    const updatedTechStacks = await db
      .select()
      .from(positionTechStacks)
      .where(eq(positionTechStacks.positionId, positionId));
    expect(updatedTechStacks).toHaveLength(3);

    // ACT & ASSERT: DELETE
    const deleteResult = await deletePosition(positionId);
    expect(deleteResult.success).toBe(true);

    // VERIFY: Position no longer exists in database
    const [deletedPosition] = await db
      .select()
      .from(positions)
      .where(eq(positions.id, positionId));
    expect(deletedPosition).toBeUndefined();

    // VERIFY: Associated tech stack relationships were deleted
    const deletedTechStackRels = await db
      .select()
      .from(positionTechStacks)
      .where(eq(positionTechStacks.positionId, positionId));
    expect(deletedTechStackRels).toHaveLength(0);
  });

  it('should handle tech stack reuse and creation', async ({ db }) => {
    // ARRANGE
    const clientResult = await createClientFixture({
      name: 'Tech Stack Client',
      contactInfo: 'contact@techstack.com',
      accountManager: {
        name: 'Tech Stack Manager',
        email: 'techstack@example.com',
      },
    });
    const clientId = clientResult.data!.id;
    const accountManagerId = clientResult.data!.accountManagerId;

    // Create first position with some tech stacks
    const position1 = {
      title: 'Frontend Engineer',
      details: 'Frontend focused role',
      jobAd: 'We need a frontend engineer',
      minSalary: 100000,
      maxSalary: 120000,
      clientId,
      accountManagerId,
      techStacks: ['react', 'typescript', 'css'],
    };

    const position2 = {
      title: 'Fullstack Engineer',
      details: 'Fullstack role',
      jobAd: 'We need a fullstack engineer',
      minSalary: 115000,
      maxSalary: 135000,
      clientId,
      accountManagerId,
      techStacks: ['React', 'node.js', 'typescript'], // Reusing react and typescript
    };

    // ACT
    const result1 = await createPosition(position1);
    const result2 = await createPosition(position2);

    // ASSERT
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // VERIFY: Tech stacks were reused appropriately
    const allTechStacks = await db.select().from(techStacks);
    const uniqueTechStackNames = new Set(allTechStacks.map((ts) => ts.name));

    // Should have 4 unique tech stacks: react, typescript, css, node.js
    expect(uniqueTechStackNames.size).toBe(4);
    expect(uniqueTechStackNames).toContain('react');
    expect(uniqueTechStackNames).toContain('typescript');
    expect(uniqueTechStackNames).toContain('css');
    expect(uniqueTechStackNames).toContain('node.js');

    // VERIFY: Position-tech stack relationships are correct
    const allPositionTechStacks = await db.select().from(positionTechStacks);
    expect(allPositionTechStacks).toHaveLength(6); // 3 + 3 tech stacks total
  });

  it('should demonstrate transaction isolation between tests', async ({
    db,
  }) => {
    // ARRANGE
    const allPositions = await db.select().from(positions);
    const allTechStacks = await db.select().from(techStacks);
    const allPositionTechStacks = await db.select().from(positionTechStacks);

    // ASSERT
    expect(allPositions).toHaveLength(0);
    expect(allTechStacks).toHaveLength(0);
    expect(allPositionTechStacks).toHaveLength(0);
  });
});
