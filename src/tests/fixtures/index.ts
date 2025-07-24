import { createAccountManager } from '@/lib/actions/accountManagers';
import { CreateAccountManagerInput } from '@/lib/validators/accountManager';
import { createClient } from '@/lib/actions/clients';
import { CreateClientInput } from '@/lib/validators/client';
import { createPosition } from '@/lib/actions/positions';
import { CreatePositionInput } from '@/lib/validators/position';
import { createInterviewer } from '@/lib/actions/interviewers';
import { CreateInterviewerInput } from '@/lib/validators/interviewer';
import { createOriginalAssignment } from '@/lib/actions/originalAssignments';
import { CreateOriginalAssignmentInput } from '@/lib/validators/originalAssignment';
import { createCandidateApplication } from '@/lib/actions/candidateApplications';
import { CreateCandidateApplicationInput } from '@/lib/validators/candidate';
import { createInterviewStepType } from '@/lib/actions/interviewStepTypes';
import { CreateInterviewStepTypeInput } from '@/lib/validators/interviewStepType';
import { createInterviewStep } from '@/lib/actions/interviewSteps';

/**
 * Comprehensive fixture system for integration tests.
 * Provides easy creation of test data with proper relationships.
 * All fixtures return the full server action response for easy access to IDs.
 */

// ==================== ACCOUNT MANAGER FIXTURES ====================

export type AccountManagerFixtureOptions = Partial<CreateAccountManagerInput>;

export async function createAccountManagerFixture(
  options: AccountManagerFixtureOptions = {},
) {
  const defaultData: CreateAccountManagerInput = {
    name: options.name || 'John Manager',
    email: options.email || 'john.manager@example.com',
  };

  const data = { ...defaultData, ...options };
  const result = await createAccountManager(data);

  if (!result.success) {
    throw new Error(
      `Failed to create account manager fixture: ${result.error}`,
    );
  }

  return result;
}

// ==================== CLIENT FIXTURES ====================

export interface ClientFixtureOptions extends Partial<CreateClientInput> {
  accountManager?: AccountManagerFixtureOptions;
}

export async function createClientFixture(options: ClientFixtureOptions = {}) {
  let accountManagerId = options.accountManagerId;
  if (!accountManagerId) {
    const accountManagerResult = await createAccountManagerFixture(
      options.accountManager,
    );
    accountManagerId = accountManagerResult.data!.id;
  }

  const defaultData: CreateClientInput = {
    name: options.name || 'Acme Corporation',
    contactInfo: options.contactInfo || 'contact@acme.com',
    accountManagerId,
  };

  const { accountManager: _accountManager, ...clientData } = options;
  const data = { ...defaultData, ...clientData };
  const result = await createClient(data);

  if (!result.success) {
    throw new Error(`Failed to create client fixture: ${result.error}`);
  }

  return result;
}

// ==================== POSITION FIXTURES ====================

export interface PositionFixtureOptions extends Partial<CreatePositionInput> {
  accountManager?: AccountManagerFixtureOptions;
  client?: ClientFixtureOptions;
}

export async function createPositionFixture(
  options: PositionFixtureOptions = {},
) {
  let accountManagerId = options.accountManagerId;
  let clientId = options.clientId;

  if (!accountManagerId || !clientId) {
    const clientResult = await createClientFixture({
      accountManager: options.accountManager,
      ...options.client,
    });
    clientId = clientResult.data!.id;
    accountManagerId = clientResult.data!.accountManagerId;
  }

  const defaultData: CreatePositionInput = {
    title: options.title || 'Senior Software Engineer',
    details:
      options.details || 'A challenging role for an experienced developer',
    jobAd: options.jobAd || 'We are looking for a senior software engineer...',
    minSalary: options.minSalary || 120000,
    maxSalary: options.maxSalary || 150000,
    culturalFitCriteria:
      options.culturalFitCriteria || 'Team player, innovative thinker',
    clientId: clientId!,
    accountManagerId: accountManagerId!,
    techStacks: options.techStacks || ['typescript', 'react', 'node.js'],
  };

  const {
    accountManager: _accountManager,
    client: _client,
    ...positionData
  } = options;
  const data = { ...defaultData, ...positionData };
  const result = await createPosition(data);

  if (!result.success) {
    throw new Error(`Failed to create position fixture: ${result.error}`);
  }

  return result;
}

// ==================== INTERVIEWER FIXTURES ====================

export type InterviewerFixtureOptions = Partial<CreateInterviewerInput>;

export async function createInterviewerFixture(
  options: InterviewerFixtureOptions = {},
) {
  const defaultData: CreateInterviewerInput = {
    name: options.name || 'Alice Johnson',
    email: options.email || 'alice.johnson@example.com',
    schedulingToolIdentifier:
      options.schedulingToolIdentifier || 'calendly-alice-johnson',
    techStacks: options.techStacks || ['javascript', 'react', 'python'],
  };

  const data = { ...defaultData, ...options };
  const result = await createInterviewer(data);

  if (!result.success) {
    throw new Error(`Failed to create interviewer fixture: ${result.error}`);
  }

  return result;
}

// ==================== INTERVIEW STEP TYPE FIXTURES ====================

export type InterviewStepTypeFixtureOptions =
  Partial<CreateInterviewStepTypeInput> & {
    client?: ClientFixtureOptions;
  };

export async function createInterviewStepTypeFixture(
  options: InterviewStepTypeFixtureOptions = {},
) {
  let clientId = options.clientId;
  if (!clientId) {
    const clientResult = await createClientFixture(options.client);
    clientId = clientResult.data!.id;
  }

  const result = await createInterviewStepType({
    name: options.name || 'Technical Screen',
    clientId: clientId!,
  });

  if (!result.success) {
    throw new Error(
      `Failed to create interview step type fixture: ${result.error}`,
    );
  }

  return result;
}

// ==================== INTERVIEW STEP FIXTURES ====================

export interface InterviewStepFixtureOptions {
  name?: string;
  sequenceNumber?: number;
  typeId?: string;
  positionId?: string;
  schedulingLink?: string;
  emailTemplate?: string;
  position?: PositionFixtureOptions;
  interviewStepType?: InterviewStepTypeFixtureOptions;
}

export async function createInterviewStepFixture(
  options: InterviewStepFixtureOptions = {},
) {
  let positionId = options.positionId;
  if (!positionId) {
    const positionResult = await createPositionFixture(options.position);
    positionId = positionResult.data!.id;
  }

  let interviewStepTypeId = options.typeId;
  if (!interviewStepTypeId) {
    const interviewStepType = await createInterviewStepTypeFixture(
      options.interviewStepType,
    );
    interviewStepTypeId = interviewStepType.data!.id;
  }

  const defaultData = {
    name: 'Technical Screen',
    sequenceNumber: 1,
    typeId: interviewStepTypeId!,
    positionId: positionId!,
    schedulingLink: 'https://calendly.com/technical-screen',
    emailTemplate: 'Please join us for a technical screen.',
  };

  const {
    position: _position,
    interviewStepType: _interviewStepType,
    ...interviewStepData
  } = options;
  const data = { ...defaultData, ...interviewStepData };

  const result = await createInterviewStep(data);

  if (!result.success) {
    throw new Error(`Failed to create interview step fixture: ${result.error}`);
  }

  return result;
}

// ==================== ORIGINAL ASSIGNMENT FIXTURES ====================

export type OriginalAssignmentFixtureOptions =
  Partial<CreateOriginalAssignmentInput>;

export async function createOriginalAssignmentFixture(
  options: OriginalAssignmentFixtureOptions = {},
) {
  const defaultData: CreateOriginalAssignmentInput = {
    name: 'Build E-commerce Platform',
    googleDocFileId: '1ABC123_test_doc_id_456XYZ',
    driveFolderPath: '/assignments/ecommerce-platform',
  };

  const data = { ...defaultData, ...options };
  const result = await createOriginalAssignment(data);

  if (!result.success) {
    throw new Error(
      `Failed to create original assignment fixture: ${result.error}`,
    );
  }

  return result;
}

// ==================== CANDIDATE APPLICATION FIXTURES ====================

export interface CandidateApplicationFixtureOptions
  extends Partial<CreateCandidateApplicationInput> {
  position?: PositionFixtureOptions;
}

export async function createCandidateApplicationFixture(
  options: CandidateApplicationFixtureOptions = {},
) {
  let positionId = options.positionId;
  if (!positionId) {
    const positionResult = await createPositionFixture(options.position);
    positionId = positionResult.data!.id;
  }

  const defaultData: CreateCandidateApplicationInput = {
    positionId: positionId!,
    candidate: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      resume_link: 'https://example.com/resume.pdf',
    },
  };

  const { position: _position, ...candidateApplicationData } = options;
  const data = { ...defaultData, ...candidateApplicationData };
  const result = await createCandidateApplication(data);

  if (!result.success) {
    throw new Error(
      `Failed to create candidate application fixture: ${result.error}`,
    );
  }

  return result;
}

// ==================== CONVENIENCE FIXTURES ====================

/**
 * Creates a complete setup with account manager -> client -> position
 * Returns all IDs for easy access
 */
export async function createCompleteHierarchyFixture(
  options: {
    accountManager?: AccountManagerFixtureOptions;
    client?: ClientFixtureOptions;
    position?: PositionFixtureOptions[] | PositionFixtureOptions;
  } = {},
) {
  const positions = Array.isArray(options.position)
    ? options.position
    : [options.position];

  const positionResults = [];
  let clientId: string | undefined;
  let accountManagerId: string | undefined;

  for (const position of positions) {
    const createPositionOptions = {
      accountManager: options.accountManager,
      client: options.client,
      ...position,
    };

    if (clientId && accountManagerId) {
      createPositionOptions.clientId = clientId;
      createPositionOptions.accountManagerId = accountManagerId;
    }

    const result = await createPositionFixture(createPositionOptions);

    positionResults.push(result);
    accountManagerId = result.data!.accountManagerId;
    clientId = result.data!.clientId;
  }

  return {
    positions: positionResults.map((result) => result.data!),
    clientId: positionResults[0].data!.clientId,
    accountManagerId: positionResults[0].data!.accountManagerId,
  };
}

/**
 * Creates multiple entities for testing scenarios that need multiple records
 */
export async function createMultipleFixtures<T>(
  createFixture: (options?: unknown) => Promise<T>,
  count: number,
  optionsArray?: unknown[],
): Promise<T[]> {
  const fixtures: T[] = [];

  for (let i = 0; i < count; i++) {
    const options = optionsArray?.[i] || {};
    const fixture = await createFixture(options);
    fixtures.push(fixture);
  }

  return fixtures;
}
