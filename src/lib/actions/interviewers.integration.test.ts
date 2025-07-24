import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { interviewers, techStacks, interviewerTechStacks } from '@/db/schema';
import {
  createInterviewer,
  getInterviewers,
  getInterviewer,
  updateInterviewer,
  deleteInterviewer,
} from './interviewers';
import { createInterviewerFixture } from '@/tests/fixtures';

describe('Interviewer Actions - Integration Tests', () => {
  it('should create and retrieve an interviewer with real database', async ({
    db,
  }) => {
    // ARRANGE & ACT
    const createResult = await createInterviewerFixture({
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      schedulingToolIdentifier: 'calendly-alice-johnson',
      techStacks: ['javascript', 'react', 'python'],
    });

    // ASSERT
    expect(createResult.success).toBe(true);
    expect(createResult.data).toBeDefined();
    expect(createResult.data!.name).toBe('Alice Johnson');
    expect(createResult.data!.email).toBe('alice.johnson@example.com');
    expect(createResult.data!.schedulingToolIdentifier).toBe(
      'calendly-alice-johnson',
    );

    // VERIFY: Data persisted in database
    const [dbInterviewer] = await db
      .select()
      .from(interviewers)
      .where(eq(interviewers.id, createResult.data!.id));

    expect(dbInterviewer).toBeDefined();
    expect(dbInterviewer.name).toBe('Alice Johnson');
    expect(dbInterviewer.email).toBe('alice.johnson@example.com');

    // VERIFY: Tech stacks were created and linked
    const techStackResults = await db
      .select()
      .from(techStacks)
      .where(eq(techStacks.name, 'javascript'));
    expect(techStackResults.length).toBeGreaterThan(0);

    const interviewerTechStackResults = await db
      .select()
      .from(interviewerTechStacks)
      .where(eq(interviewerTechStacks.interviewerId, createResult.data!.id));
    expect(interviewerTechStackResults).toHaveLength(3);
  });

  it('should handle server action validation with real database', async () => {
    // ARRANGE: Invalid data (missing required fields)
    const invalidInterviewer = {
      name: '', // Empty name should fail validation
      email: 'invalid-email', // Invalid email format
      schedulingToolIdentifier: 'valid-identifier',
      techStacks: [],
    };

    // ACT
    const result = await createInterviewer(invalidInterviewer);

    // ASSERT
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    const errorIssues = JSON.parse(result.error!);
    expect(errorIssues).toBeInstanceOf(Array);
    expect(errorIssues.length).toBeGreaterThan(0);

    const errorPaths = errorIssues.map(
      (issue: unknown) => (issue as { path: string[] }).path[0],
    );
    expect(errorPaths).toContain('name');
    expect(errorPaths).toContain('email');
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE
    const interviewerData = {
      name: 'CRUD Test Interviewer',
      email: 'crud.test@example.com',
      schedulingToolIdentifier: 'calendly-crud-test',
      techStacks: ['typescript', 'node.js'],
    };

    // ACT & ASSERT: CREATE
    const createResult = await createInterviewer(interviewerData);
    expect(createResult.success).toBe(true);
    const interviewerId = createResult.data!.id;

    // ACT & ASSERT: READ (get single)
    const getResult = await getInterviewer(interviewerId);
    expect(getResult.success).toBe(true);
    expect(getResult.data!.name).toBe(interviewerData.name);
    expect(getResult.data!.techStacks).toHaveLength(2);
    expect(
      getResult.data!.techStacks!.map((its) => its.techStack.name),
    ).toEqual(['typescript', 'node.js']);

    // ACT & ASSERT: READ (get all)
    const getAllResult = await getInterviewers();
    expect(getAllResult.success).toBe(true);
    expect(getAllResult.data).toHaveLength(1);
    expect(getAllResult.data![0].name).toBe(interviewerData.name);

    // ACT & ASSERT: UPDATE
    const updateData = {
      name: 'Updated Interviewer Name',
      schedulingToolIdentifier: 'calendly-updated-interviewer',
      techStacks: ['python', 'django', 'postgresql'],
    };
    const updateResult = await updateInterviewer(interviewerId, updateData);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data!.name).toBe(updateData.name);
    expect(updateResult.data!.schedulingToolIdentifier).toBe(
      updateData.schedulingToolIdentifier,
    );

    // VERIFY: Update persisted in database
    const [updatedInterviewer] = await db
      .select()
      .from(interviewers)
      .where(eq(interviewers.id, interviewerId));
    expect(updatedInterviewer.name).toBe(updateData.name);
    expect(updatedInterviewer.schedulingToolIdentifier).toBe(
      updateData.schedulingToolIdentifier,
    );

    // VERIFY: Tech stacks were updated
    const updatedTechStacks = await db
      .select()
      .from(interviewerTechStacks)
      .where(eq(interviewerTechStacks.interviewerId, interviewerId));
    expect(updatedTechStacks).toHaveLength(3);

    // ACT & ASSERT: DELETE
    const deleteResult = await deleteInterviewer(interviewerId);
    expect(deleteResult.success).toBe(true);

    // VERIFY: Interviewer no longer exists in database
    const [deletedInterviewer] = await db
      .select()
      .from(interviewers)
      .where(eq(interviewers.id, interviewerId));
    expect(deletedInterviewer).toBeUndefined();

    // VERIFY: Associated tech stack relationships were deleted
    const deletedTechStackRels = await db
      .select()
      .from(interviewerTechStacks)
      .where(eq(interviewerTechStacks.interviewerId, interviewerId));
    expect(deletedTechStackRels).toHaveLength(0);
  });

  it('should handle tech stack reuse and creation', async ({ db }) => {
    // ARRANGE
    const interviewer1 = {
      name: 'Frontend Specialist',
      email: 'frontend@example.com',
      schedulingToolIdentifier: 'calendly-frontend-specialist',
      techStacks: ['react', 'vue', 'css'],
    };

    const interviewer2 = {
      name: 'Fullstack Expert',
      email: 'fullstack@example.com',
      schedulingToolIdentifier: 'calendly-fullstack-expert',
      techStacks: ['React', 'express', 'mongodb'], // Reusing react with different case
    };

    // ACT
    const result1 = await createInterviewer(interviewer1);
    const result2 = await createInterviewer(interviewer2);

    // ASSERT
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    // VERIFY: Tech stacks were reused appropriately
    const allTechStacks = await db.select().from(techStacks);
    const uniqueTechStackNames = new Set(allTechStacks.map((ts) => ts.name));

    // Should have 5 unique tech stacks: react, vue, css, express, mongodb
    expect(uniqueTechStackNames.size).toBe(5);
    expect(uniqueTechStackNames).toContain('react');
    expect(uniqueTechStackNames).toContain('vue');
    expect(uniqueTechStackNames).toContain('css');
    expect(uniqueTechStackNames).toContain('express');
    expect(uniqueTechStackNames).toContain('mongodb');

    // VERIFY: Interviewer-tech stack relationships are correct
    const allInterviewerTechStacks = await db
      .select()
      .from(interviewerTechStacks);
    expect(allInterviewerTechStacks).toHaveLength(6); // 3 + 3 tech stacks total
  });

  it('should handle email uniqueness constraints', async () => {
    // ARRANGE: Create first interviewer
    const interviewer1 = {
      name: 'First Interviewer',
      email: 'unique@example.com',
      schedulingToolIdentifier: 'calendly-first-interviewer',
      techStacks: ['javascript'],
    };

    // ACT: Create first interviewer
    const result1 = await createInterviewer(interviewer1);

    // ASSERT: First creation should succeed
    expect(result1.success).toBe(true);

    // ARRANGE: Try to create second interviewer with same email
    const interviewer2 = {
      name: 'Second Interviewer',
      email: 'unique@example.com', // Same email as first
      schedulingToolIdentifier: 'calendly-second-interviewer',
      techStacks: ['python'],
    };

    // ACT: Attempt to create second interviewer
    const result2 = await createInterviewer(interviewer2);

    // ASSERT: Second creation should fail due to email uniqueness
    expect(result2.success).toBe(false);
    expect(result2.error).toBeDefined();
    expect(result2.error).toContain('email');
  });

  it('should demonstrate transaction isolation between tests', async ({
    db,
  }) => {
    // ARRANGE: Check that no data from previous test exists
    const allInterviewers = await db.select().from(interviewers);
    const allTechStacks = await db.select().from(techStacks);
    const allInterviewerTechStacks = await db
      .select()
      .from(interviewerTechStacks);

    // ASSERT: Database should be clean due to transaction rollback
    expect(allInterviewers).toHaveLength(0);
    expect(allTechStacks).toHaveLength(0);
    expect(allInterviewerTechStacks).toHaveLength(0);
  });
});
