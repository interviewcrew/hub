import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  candidateApplications,
  candidates,
  positions,
  clients,
  accountManagers,
  CANDIDATE_STATUSES,
} from '@/db/schema';
import {
  createCandidateApplication,
  getCandidateApplication,
  getCandidateApplicationsForPosition,
  updateCandidateApplication,
  deleteCandidateApplication,
} from './candidateApplications';
import { createCompleteHierarchyFixture } from '@/tests/fixtures';
import { generateMockUuid } from '@/tests/utils/mockUuid';

describe('Candidate Application Actions - Integration Tests', () => {
  it('should create and retrieve a candidate application with real database', async ({
    db,
  }) => {
    // ARRANGE: Create test data using fixtures
    const { positions } = await createCompleteHierarchyFixture();
    const positionId = positions[0].id;

    const newCandidateApplication = {
      positionId,
      candidate: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        resume_link: 'https://example.com/resume.pdf',
      },
    };

    // ACT: Create the candidate application using the server action
    const createResult = await createCandidateApplication(
      newCandidateApplication,
    );

    // ASSERT: Creation should succeed
    expect(createResult.success).toBe(true);
    expect(createResult.data).toBeDefined();
    expect(createResult.data!.positionId).toBe(positionId);
    expect(createResult.data!.status).toBe(CANDIDATE_STATUSES.INITIAL_STATE);

    // VERIFY: Data persisted in database
    const [dbApplication] = await db
      .select()
      .from(candidateApplications)
      .where(eq(candidateApplications.id, createResult.data!.id));

    expect(dbApplication).toBeDefined();
    expect(dbApplication.positionId).toBe(positionId);
    expect(dbApplication.status).toBe(CANDIDATE_STATUSES.INITIAL_STATE);

    // VERIFY: Candidate was created
    const [dbCandidate] = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, createResult.data!.candidateId));

    expect(dbCandidate).toBeDefined();
    expect(dbCandidate.name).toBe(newCandidateApplication.candidate.name);
    expect(dbCandidate.email).toBe(newCandidateApplication.candidate.email);
  });

  it('should handle server action validation with real database', async () => {
    // ARRANGE: Invalid data (missing required fields)
    const invalidApplication = {
      positionId: generateMockUuid(), // Valid UUID but doesn't exist
      candidate: {
        name: '', // Empty name should fail validation
        email: 'invalid-email', // Invalid email format
        resume_link: 'not-a-url', // Invalid URL format
      },
    };

    // ACT: Attempt to create application with invalid data
    const result = await createCandidateApplication(invalidApplication);

    // ASSERT: Should fail validation
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();

    // Zod validation error
    const errorIssues = JSON.parse(result.error!);
    expect(errorIssues).toBeInstanceOf(Array);
    expect(errorIssues.length).toBeGreaterThan(0);

    const errorPaths = errorIssues.map((issue: unknown) =>
      (issue as { path: string[] }).path.join('.'),
    );
    expect(errorPaths.some((path: string) => path.includes('name'))).toBe(true);
    expect(errorPaths.some((path: string) => path.includes('email'))).toBe(
      true,
    );
    expect(
      errorPaths.some((path: string) => path.includes('resume_link')),
    ).toBe(true);
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE: Create dependencies
    const { positions } = await createCompleteHierarchyFixture({
      accountManager: {
        name: 'CRUD Manager',
        email: 'crud.manager@example.com',
      },
      client: {
        name: 'CRUD Client',
        contactInfo: 'crud@client.com',
      },
      position: {
        title: 'CRUD Position',
        details: 'Position for CRUD testing',
        jobAd: 'We need someone with CRUD skills',
        minSalary: 90000,
        maxSalary: 100000,
      },
    });

    const positionId = positions[0].id;

    const applicationData = {
      positionId,
      candidate: {
        name: 'CRUD Test Candidate',
        email: 'crud.test@example.com',
        resume_link: 'https://example.com/crud-resume.pdf',
      },
    };

    // ACT & ASSERT: CREATE
    const createResult = await createCandidateApplication(applicationData);
    expect(createResult.success).toBe(true);
    const applicationId = createResult.data!.id;

    // ACT & ASSERT: READ (get single)
    const getResult = await getCandidateApplication(applicationId);
    expect(getResult.success).toBe(true);
    expect(getResult.data!.positionId).toBe(positionId);
    expect(getResult.data!.candidate.name).toBe(applicationData.candidate.name);
    expect(getResult.data!.candidate.email).toBe(
      applicationData.candidate.email,
    );

    // ACT & ASSERT: READ (get by position)
    const getByPositionResult =
      await getCandidateApplicationsForPosition(positionId);
    expect(getByPositionResult.success).toBe(true);
    expect(getByPositionResult.data).toHaveLength(1);
    expect(getByPositionResult.data![0].candidate.name).toBe(
      applicationData.candidate.name,
    );

    // ACT & ASSERT: UPDATE
    const updateData = {
      status: CANDIDATE_STATUSES.INTERVIEW_SCHEDULED,
      clientNotifiedAt: new Date(),
    };
    const updateResult = await updateCandidateApplication(
      applicationId,
      updateData,
    );
    expect(updateResult.success).toBe(true);
    expect(updateResult.data!.status).toBe(updateData.status);
    expect(updateResult.data!.client_notified_at).toBeDefined();

    // VERIFY: Update persisted in database
    const [updatedApplication] = await db
      .select()
      .from(candidateApplications)
      .where(eq(candidateApplications.id, applicationId));
    expect(updatedApplication.status).toBe(updateData.status);
    expect(updatedApplication.client_notified_at).toBeDefined();

    // ACT & ASSERT: DELETE
    const deleteResult = await deleteCandidateApplication(applicationId);
    expect(deleteResult.success).toBe(true);

    // VERIFY: Application no longer exists in database
    const [deletedApplication] = await db
      .select()
      .from(candidateApplications)
      .where(eq(candidateApplications.id, applicationId));
    expect(deletedApplication).toBeUndefined();
  });

  it('should handle candidate reuse when same email applies to different positions', async ({
    db,
  }) => {
    // ARRANGE: Create dependencies
    const { positions } = await createCompleteHierarchyFixture({
      accountManager: {
        name: 'Reuse Manager',
        email: 'reuse.manager@example.com',
      },
      client: {
        name: 'Reuse Client',
        contactInfo: 'reuse@client.com',
      },
      position: [
        {
          title: 'Reuse Position',
          details: 'Position for reuse testing',
          jobAd: 'We need someone with reuse skills',
          minSalary: 90000,
          maxSalary: 100000,
        },
        {
          title: 'Reuse Position 2',
          details: 'Position for reuse testing',
          jobAd: 'We need someone with reuse skills',
          minSalary: 90000,
          maxSalary: 100000,
        },
      ],
    });

    const [position1Id, position2Id] = positions.map((p) => p.id);

    const candidateData = {
      name: 'Versatile Developer',
      email: 'versatile@example.com',
      resume_link: 'https://example.com/versatile-resume.pdf',
    };

    // ACT: Apply to first position
    const application1Result = await createCandidateApplication({
      positionId: position1Id,
      candidate: candidateData,
    });

    // ACT: Apply to second position with same candidate
    const application2Result = await createCandidateApplication({
      positionId: position2Id,
      candidate: candidateData,
    });

    // ASSERT
    expect(application1Result.success).toBe(true);
    expect(application2Result.success).toBe(true);

    // VERIFY: Same candidate used for both applications
    expect(application1Result.data!.candidateId).toBe(
      application2Result.data!.candidateId,
    );

    // VERIFY: Only one candidate record exists
    const allCandidates = await db.select().from(candidates);
    expect(allCandidates).toHaveLength(1);
    expect(allCandidates[0].email).toBe(candidateData.email);

    // VERIFY: Two separate applications exist
    const allApplications = await db.select().from(candidateApplications);
    expect(allApplications).toHaveLength(2);
  });

  it('should handle different candidate statuses', async ({}) => {
    // ARRANGE
    const { positions } = await createCompleteHierarchyFixture({
      accountManager: {
        name: 'Status Manager',
        email: 'status.manager@example.com',
      },
      client: {
        name: 'Status Client',
        contactInfo: 'status@client.com',
      },
      position: {
        title: 'Status Test Position',
        details: 'Position for testing statuses',
        jobAd: 'We need someone with various skills',
        minSalary: 95000,
        maxSalary: 105000,
      },
    });

    const positionId = positions[0].id;

    // Create applications with different candidates
    const applications = [
      {
        positionId,
        candidate: {
          name: 'Applied Candidate',
          email: 'applied@example.com',
          resume_link: 'https://example.com/applied.pdf',
        },
      },
      {
        positionId,
        candidate: {
          name: 'Screened Candidate',
          email: 'screened@example.com',
          resume_link: 'https://example.com/screened.pdf',
        },
      },
      {
        positionId,
        candidate: {
          name: 'Interviewed Candidate',
          email: 'interviewed@example.com',
          resume_link: 'https://example.com/interviewed.pdf',
        },
      },
    ];

    // ACT
    const results = await Promise.all(
      applications.map((app) => createCandidateApplication(app)),
    );

    // ASSERT
    results.forEach((result) => {
      expect(result.success).toBe(true);
    });

    // ACT: Update statuses
    await updateCandidateApplication(results[1].data!.id, {
      status: CANDIDATE_STATUSES.WAITING_FOR_EVALUATION,
    });

    await updateCandidateApplication(results[2].data!.id, {
      status: CANDIDATE_STATUSES.INTERVIEW_SCHEDULED,
    });

    // VERIFY: Different statuses exist
    const applicationsForPosition =
      await getCandidateApplicationsForPosition(positionId);
    expect(applicationsForPosition.success).toBe(true);
    expect(applicationsForPosition.data).toHaveLength(3);

    const statuses = applicationsForPosition.data!.map((app) => app.status);
    expect(statuses).toContain(CANDIDATE_STATUSES.INITIAL_STATE);
    expect(statuses).toContain(CANDIDATE_STATUSES.WAITING_FOR_EVALUATION);
    expect(statuses).toContain(CANDIDATE_STATUSES.INTERVIEW_SCHEDULED);
  });

  it('should prevent duplicate applications for same candidate and position', async () => {
    // ARRANGE
    const { positions } = await createCompleteHierarchyFixture({
      accountManager: {
        name: 'Duplicate Manager',
        email: 'duplicate.manager@example.com',
      },
      client: {
        name: 'Duplicate Client',
        contactInfo: 'duplicate@client.com',
      },
      position: {
        title: 'Duplicate Test Position',
        details: 'Position for testing duplicates',
        jobAd: 'We need someone with skills',
        minSalary: 80000,
        maxSalary: 90000,
      },
    });

    const positionId = positions[0].id;

    const candidateData = {
      name: 'Duplicate Candidate',
      email: 'duplicate@example.com',
      resume_link: 'https://example.com/duplicate.pdf',
    };

    // ACT: Create first application
    const firstResult = await createCandidateApplication({
      positionId,
      candidate: candidateData,
    });

    // ASSERT: First application should succeed
    expect(firstResult.success).toBe(true);

    // ACT: Try to create duplicate application
    const duplicateResult = await createCandidateApplication({
      positionId,
      candidate: candidateData,
    });

    // ASSERT: Duplicate should fail
    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.error).toContain('already applied');
  });

  it('should handle foreign key constraints for positions', async () => {
    // ARRANGE: Try to create application with non-existent position
    const applicationWithInvalidPosition = {
      positionId: generateMockUuid(100), // Valid UUID but doesn't exist
      candidate: {
        name: 'Invalid Position Candidate',
        email: 'invalid.position@example.com',
        resume_link: 'https://example.com/invalid.pdf',
      },
    };

    // ACT
    const result = await createCandidateApplication(
      applicationWithInvalidPosition,
    );

    // ASSERT: Should fail due to foreign key constraint or validation
    expect(result.success).toBe(false);
    expect(result.error).toContain('foreign key constraint');
  });

  it('should demonstrate that changes from previous test are not visible', async ({
    db,
  }) => {
    // ARRANGE: Query database state
    const allApplications = await db.select().from(candidateApplications);
    const allCandidates = await db.select().from(candidates);
    const allPositions = await db.select().from(positions);
    const allClients = await db.select().from(clients);
    const allAccountManagers = await db.select().from(accountManagers);

    // ASSERT: Should be clean slate - no data from previous test
    expect(allApplications).toHaveLength(0);
    expect(allCandidates).toHaveLength(0);
    expect(allPositions).toHaveLength(0);
    expect(allClients).toHaveLength(0);
    expect(allAccountManagers).toHaveLength(0);
  });
});
