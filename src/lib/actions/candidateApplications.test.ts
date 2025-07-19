import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createCandidateApplication,
  getCandidateApplication,
  getCandidateApplicationsForPosition,
  updateCandidateApplication,
  deleteCandidateApplication,
} from './candidateApplications';
import {
  mockDb,
  resetDbMocks,
  mockInsertChain,
  mockUpdateChain,
  mockSelectChain,
  mockDeleteChain,
  mockDeleteError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import { revalidatePath } from 'next/cache';
import { CANDIDATE_STATUSES } from '@/db/schema';

vi.mock('next/cache');

describe('Candidate Application Actions', () => {
  const positionId = generateMockUuid(1);
  const candidateId = generateMockUuid(2);
  const applicationId = generateMockUuid(3);

  const mockCandidate = {
    id: candidateId,
    name: 'John Doe',
    email: 'john.doe@example.com',
    resume_link: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApplicationInput = {
    positionId,
    candidate: {
      name: mockCandidate.name,
      email: mockCandidate.email,
      resume_link: null,
    },
  };

  const mockApplication = {
    id: applicationId,
    candidateId: candidateId,
    positionId: positionId,
    status: CANDIDATE_STATUSES.INITIAL_STATE,
    status_updated_at: new Date(),
    client_notified_at: null,
    currentInterviewStepId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    resetDbMocks();
    vi.clearAllMocks();
  });

  describe('createCandidateApplication', () => {
    it('should create a NEW candidate, an application, and an event successfully', async () => {
      mockSelectChain([]); // 1. No existing candidate found
      mockInsertChain([mockCandidate]); // 2. Create candidate
      mockInsertChain([mockApplication]); // 3. Create application
      mockInsertChain([]); // 4. Create event

      const result = await createCandidateApplication(mockApplicationInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApplication);
    });

    it('should use an EXISTING candidate to create an application', async () => {
      mockSelectChain([mockCandidate]); // 1. Find existing candidate
      mockDb.query.candidateApplications.findFirst.mockResolvedValueOnce(
        undefined,
      ); // 2. Check for existing application (none found)
      mockInsertChain([mockApplication]); // 3. Create application
      mockInsertChain([]); // 4. Create event

      const result = await createCandidateApplication(mockApplicationInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApplication);
    });

    it('should fail if the candidate has already applied for the position', async () => {
      mockSelectChain([mockCandidate]); // 1. Find existing candidate
      mockDb.query.candidateApplications.findFirst.mockResolvedValueOnce(
        mockApplication,
      ); // 2. Check for existing application (found)

      const result = await createCandidateApplication(mockApplicationInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'This candidate has already applied for this position.',
      );
    });

    it('should fail if input validation fails', async () => {
      const invalidInput = {
        ...mockApplicationInput,
        candidate: {
          ...mockApplicationInput.candidate,
          email: 'not-an-email',
        },
      };
      const result = await createCandidateApplication(invalidInput);
      expect(result.success).toBe(false);
      const error = JSON.parse(result.error as string);
      expect(error[0].path).toEqual(['candidate', 'email']);
    });

    it('should return an error if the database call fails', async () => {
      mockDb.transaction.mockImplementation(async () => {
        throw new Error('DB error');
      });
      const result = await createCandidateApplication(mockApplicationInput);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('getCandidateApplication', () => {
    it('should return a single application successfully', async () => {
      mockDb.query.candidateApplications.findFirst.mockResolvedValue(
        mockApplication,
      );
      const result = await getCandidateApplication(applicationId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApplication);
    });

    it('should fail if application is not found', async () => {
      mockDb.query.candidateApplications.findFirst.mockResolvedValue(undefined);
      const result = await getCandidateApplication(applicationId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Candidate application not found');
    });
  });

  describe('getCandidateApplicationsForPosition', () => {
    it('should return all applications for a given position', async () => {
      const mockApplications = [mockApplication];
      mockDb.query.candidateApplications.findMany.mockResolvedValue(
        mockApplications,
      );
      const result = await getCandidateApplicationsForPosition(positionId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApplications);
    });

    it('should return an empty array if no applications are found', async () => {
      mockDb.query.candidateApplications.findMany.mockResolvedValue([]);
      const result = await getCandidateApplicationsForPosition(positionId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('updateCandidateApplication', () => {
    it('should update an application status and create a status change event', async () => {
      const updateData = { status: CANDIDATE_STATUSES.INVITATION_SENT };
      const updatedApplication = { ...mockApplication, ...updateData };

      mockDb.query.candidateApplications.findFirst.mockResolvedValueOnce(
        mockApplication,
      );
      mockInsertChain([]); // For the status change event
      mockUpdateChain([updatedApplication]);

      const result = await updateCandidateApplication(
        applicationId,
        updateData,
      );

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe(CANDIDATE_STATUSES.INVITATION_SENT);
    });

    it('should update client_notified_at without creating a status change event', async () => {
      const notificationDate = new Date();
      const updatedApplication = {
        ...mockApplication,
        client_notified_at: notificationDate,
      };

      mockDb.query.candidateApplications.findFirst.mockResolvedValueOnce(
        mockApplication,
      );
      mockUpdateChain([updatedApplication]);

      const result = await updateCandidateApplication(applicationId, {
        clientNotifiedAt: notificationDate,
      });

      expect(result.success).toBe(true);
      expect(result.data?.client_notified_at).toEqual(notificationDate);
    });

    it('should fail if application is not found', async () => {
      mockDb.query.candidateApplications.findFirst.mockResolvedValueOnce(
        undefined,
      );

      const result = await updateCandidateApplication(applicationId, {
        status: CANDIDATE_STATUSES.INVITATION_SENT,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Candidate application not found');
    });

    it('should return an error if the database call fails', async () => {
      mockDb.transaction.mockImplementation(async () => {
        throw new Error('DB error');
      });
      const result = await updateCandidateApplication(applicationId, {
        status: CANDIDATE_STATUSES.INVITATION_SENT,
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('deleteCandidateApplication', () => {
    it('should delete an application successfully', async () => {
      mockDeleteChain([]); // Deleting from interviewEvents
      mockDeleteChain([mockApplication]); // Deleting from candidateApplications

      const result = await deleteCandidateApplication(applicationId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockApplication);
      expect(revalidatePath).toHaveBeenCalledWith(`/positions/${positionId}`);
    });

    it('should fail if application is not found', async () => {
      mockDeleteChain([]); // for interviewEvents
      mockDeleteChain([]); // for candidateApplications (returns empty array, meaning not found)

      const result = await deleteCandidateApplication(applicationId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Candidate application not found');
    });

    it('should return an error if the database call fails', async () => {
      mockDeleteError(new Error('DB error'));

      const result = await deleteCandidateApplication(applicationId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });
});
