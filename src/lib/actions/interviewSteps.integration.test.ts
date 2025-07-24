import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  interviewSteps,
  positions,
  clients,
  accountManagers,
} from '@/db/schema';
import {
  createInterviewStep,
  getInterviewStep,
  getInterviewStepsForPosition,
  updateInterviewStep,
  deleteInterviewStep,
} from './interviewSteps';
import { createPosition } from './positions';
import { createClient } from './clients';
import { createAccountManager } from './accountManagers';
import { createInterviewStepType } from './interviewStepTypes';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import { createCompleteHierarchyFixture } from '@/tests/fixtures';

describe('Interview Step Actions - Integration Tests', () => {
  it('should create and retrieve an interview step with real database', async ({
    db,
  }) => {
    // ARRANGE
    const accountManagerData = {
      name: 'Test Manager',
      email: 'manager@example.com',
    };
    const accountManagerResult = await createAccountManager(accountManagerData);
    const accountManagerId = accountManagerResult.data!.id;

    const clientData = {
      name: 'Test Client',
      contactInfo: 'contact@testclient.com',
      accountManagerId,
    };
    const clientResult = await createClient(clientData);
    const clientId = clientResult.data!.id;

    const positionData = {
      title: 'Software Engineer',
      details: 'A software engineering position',
      jobAd: 'We are looking for a software engineer',
      minSalary: 90000,
      maxSalary: 110000,
      clientId,
      accountManagerId,
    };
    const positionResult = await createPosition(positionData);
    const positionId = positionResult.data!.id;

    const interviewStepTypeData = {
      name: 'Technical Screen',
      clientId,
    };

    const interviewStepType = await createInterviewStepType(
      interviewStepTypeData,
    );
    const interviewStepTypeId = interviewStepType.data!.id;

    const newInterviewStep = {
      name: interviewStepTypeData.name,
      sequenceNumber: 1,
      typeId: interviewStepTypeId,
      positionId,
      schedulingLink: 'https://calendly.com/technical-screen',
      emailTemplate: 'Please join us for a technical screen.',
    };

    // ACT
    const createResult = await createInterviewStep(newInterviewStep);

    // ASSERT
    expect(createResult.success).toBe(true);
    expect(createResult.data).toBeDefined();
    expect(createResult.data!.name).toBe(newInterviewStep.name);
    expect(createResult.data!.sequenceNumber).toBe(
      newInterviewStep.sequenceNumber,
    );
    expect(createResult.data!.typeId).toBe(newInterviewStep.typeId);
    expect(createResult.data!.positionId).toBe(positionId);
    expect(createResult.data!.schedulingLink).toBe(
      newInterviewStep.schedulingLink,
    );
    expect(createResult.data!.emailTemplate).toBe(
      newInterviewStep.emailTemplate,
    );

    // VERIFY: Data persisted in database
    const [dbInterviewStep] = await db
      .select()
      .from(interviewSteps)
      .where(eq(interviewSteps.id, createResult.data!.id));

    expect(dbInterviewStep).toBeDefined();
    expect(dbInterviewStep.name).toBe(newInterviewStep.name);
    expect(dbInterviewStep.positionId).toBe(positionId);
  });

  it('should handle server action validation with real database', async () => {
    // ARRANGE
    const invalidInterviewStep = {
      name: '', // Empty name should fail validation
      sequenceNumber: 0, // Zero sequenceNumber should fail validation (must be positive)
      typeId: generateMockUuid(), // Valid UUID but doesn't exist
      positionId: generateMockUuid(), // Valid UUID but doesn't exist
    };

    // ACT
    const result = await createInterviewStep(invalidInterviewStep);

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
    expect(errorPaths).toContain('sequenceNumber');
  });

  it('should test complete CRUD operations with database persistence', async ({
    db,
  }) => {
    // ARRANGE
    const accountManagerResult = await createAccountManager({
      name: 'CRUD Manager',
      email: 'crud.manager@example.com',
    });
    const accountManagerId = accountManagerResult.data!.id;

    const clientResult = await createClient({
      name: 'CRUD Client',
      contactInfo: 'crud@client.com',
      accountManagerId,
    });
    const clientId = clientResult.data!.id;

    const positionResult = await createPosition({
      title: 'CRUD Position',
      details: 'Position for CRUD testing',
      jobAd: 'We need someone with CRUD skills',
      minSalary: 90000,
      maxSalary: 100000,
      clientId,
      accountManagerId,
    });
    const positionId = positionResult.data!.id;

    const interviewStepTypeData = {
      name: 'Behavioral Interview',
      clientId,
    };
    const interviewStepType = await createInterviewStepType(
      interviewStepTypeData,
    );
    const interviewStepTypeId = interviewStepType.data!.id;

    const interviewStepData = {
      name: interviewStepTypeData.name,
      sequenceNumber: 2,
      typeId: interviewStepTypeId,
      positionId,
      schedulingLink: 'https://calendly.com/crud-interview',
      emailTemplate: 'Please join us for a CRUD interview step.',
    };

    // ACT & ASSERT: CREATE
    const createResult = await createInterviewStep(interviewStepData);
    expect(createResult.success).toBe(true);
    const interviewStepId = createResult.data!.id;

    // ACT & ASSERT: READ (get single)
    const getResult = await getInterviewStep(interviewStepId);
    expect(getResult.success).toBe(true);
    expect(getResult.data!.name).toBe(interviewStepData.name);
    expect(getResult.data!.sequenceNumber).toBe(
      interviewStepData.sequenceNumber,
    );

    // ACT & ASSERT: READ (get by position)
    const getByPositionResult = await getInterviewStepsForPosition(positionId);
    expect(getByPositionResult.success).toBe(true);
    expect(getByPositionResult.data).toHaveLength(1);
    expect(getByPositionResult.data![0].name).toBe(interviewStepData.name);

    // ACT & ASSERT: UPDATE
    const updateData = {
      name: 'Updated Interview Step',
      sequenceNumber: 3,
      schedulingLink: 'https://calendly.com/updated-interview',
      emailTemplate: 'Updated email template.',
    };
    const updateResult = await updateInterviewStep(interviewStepId, updateData);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data!.name).toBe(updateData.name);
    expect(updateResult.data!.sequenceNumber).toBe(updateData.sequenceNumber);
    expect(updateResult.data!.schedulingLink).toBe(updateData.schedulingLink);
    expect(updateResult.data!.emailTemplate).toBe(updateData.emailTemplate);

    // VERIFY: Update persisted in database
    const [updatedStep] = await db
      .select()
      .from(interviewSteps)
      .where(eq(interviewSteps.id, interviewStepId));
    expect(updatedStep.name).toBe(updateData.name);
    expect(updatedStep.sequenceNumber).toBe(updateData.sequenceNumber);

    // ACT & ASSERT: DELETE
    const deleteResult = await deleteInterviewStep(interviewStepId);
    expect(deleteResult.success).toBe(true);

    // VERIFY: Interview step no longer exists in database
    const [deletedStep] = await db
      .select()
      .from(interviewSteps)
      .where(eq(interviewSteps.id, interviewStepId));
    expect(deletedStep).toBeUndefined();
  });

  it('should handle foreign key constraints for positions', async () => {
    // ARRANGE
    const stepWithInvalidPosition = {
      name: 'Invalid Step',
      sequenceNumber: 1,
      typeId: generateMockUuid(), // Valid UUID but doesn't exist
      positionId: generateMockUuid(), // Valid UUID but doesn't exist
    };

    // ACT: Attempt to create interview step
    const result = await createInterviewStep(stepWithInvalidPosition);

    // ASSERT: Should fail due to foreign key constraint
    expect(result.success).toBe(false);
    expect(result.error).toBe('Position not found');
  });

  it('should handle foreign key constraints for interview step types', async () => {
    const positionResult = await createCompleteHierarchyFixture({
      position: {
        title: 'Position',
        details: 'Position for testing',
        jobAd: 'We need someone with testing skills',
        minSalary: 100000,
        maxSalary: 120000,
      },
    });
    const positionId = positionResult.positions[0].id;

    // ARRANGE
    const stepWithInvalidType = {
      name: 'Invalid Step',
      sequenceNumber: 1,
      typeId: generateMockUuid(), // Valid UUID but doesn't exist
      positionId: positionId,
    };

    // ACT: Attempt to create interview step
    const result = await createInterviewStep(stepWithInvalidType);

    // ASSERT: Should fail due to foreign key constraint
    expect(result.success).toBe(false);
    expect(result.error).toBe('Interview step type not found for this client');
  });

  it('should handle multiple interview steps for the same position', async () => {
    // ARRANGE
    const positionResult = await createCompleteHierarchyFixture({
      position: {
        title: 'Multi-Step Position',
        details: 'Position with multiple interview steps',
        jobAd: 'We need someone with various skills',
        minSalary: 100000,
        maxSalary: 120000,
      },
    });
    const clientId = positionResult.clientId;
    const positionId = positionResult.positions[0].id;

    const stepNames = ['Phone Screen', 'Technical Interview', 'Cultural Fit'];
    const stepTypes = await Promise.all(
      stepNames.map((step) =>
        createInterviewStepType({
          name: step,
          clientId,
        }),
      ),
    );

    // ACT
    const steps = await Promise.all(
      stepTypes.map((stepType, index) =>
        createInterviewStep({
          name: stepType.data!.name,
          sequenceNumber: index + 1,
          typeId: stepType.data!.id,
          positionId,
        }),
      ),
    );

    // ASSERT
    expect(steps.every((step) => step.success)).toBe(true);
    expect(steps.every((step) => step.data!.positionId === positionId)).toBe(
      true,
    );
    expect(steps.every((step) => step.data!.typeId)).toBe(true);
    expect(steps.every((step) => step.data!.name)).toBe(true);
    expect(steps.every((step) => step.data!.sequenceNumber)).toBe(true);

    // VERIFY: All steps exist for the position
    const stepsForPosition = await getInterviewStepsForPosition(positionId);
    expect(stepsForPosition.success).toBe(true);
    expect(stepsForPosition.data).toHaveLength(3);

    // VERIFY: Steps are in correct order
    const orderedSteps = stepsForPosition.data!.sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber,
    );
    expect(
      orderedSteps.every((step, index) => step.name === stepNames[index]),
    ).toBe(true);
  });

  it('should demonstrate transaction isolation between tests', async ({
    db,
  }) => {
    // ARRANGE: Check that no data from previous test exists
    const allInterviewSteps = await db.select().from(interviewSteps);
    const allPositions = await db.select().from(positions);
    const allClients = await db.select().from(clients);
    const allAccountManagers = await db.select().from(accountManagers);

    // ASSERT: Database should be clean due to transaction rollback
    expect(allInterviewSteps).toHaveLength(0);
    expect(allPositions).toHaveLength(0);
    expect(allClients).toHaveLength(0);
    expect(allAccountManagers).toHaveLength(0);
  });
});
