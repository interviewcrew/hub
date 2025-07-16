import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockDb,
  resetDbMocks,
  mockUpdateChain,
  mockDeleteChain,
  mockInsertChain,
  mockInsertError,
  mockUpdateError,
  mockDeleteError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import {
  createInterviewer,
  getInterviewer,
  getInterviewers,
  updateInterviewer,
  deleteInterviewer,
} from './interviewers';
import { revalidatePath } from 'next/cache';
import * as schema from '@/db/schema';
import { CreateInterviewerInput } from '@/lib/validators/interviewer';

vi.mock('next/cache');

describe('Interviewer Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  const interviewerId = generateMockUuid(1);
  const techStackId1 = generateMockUuid(2);
  const techStackId2 = generateMockUuid(3);

  const baseInterviewerMock = {
    id: interviewerId,
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    isActive: true,
    schedulingToolIdentifier: null,
  };

  const techStackMock1 = {
    id: techStackId1,
    name: 'typescript',
  };

  const techStackMock2 = {
    id: techStackId2,
    name: 'react',
  };

  const interviewerWithTechStacksMock = {
    ...baseInterviewerMock,
    techStacks: [
      {
        interviewerId,
        techStackId: techStackId1,
        techStack: techStackMock1,
      },
    ],
  };

  describe('createInterviewer', () => {
    it('should create an interviewer and NEW tech stacks', async () => {
      // 1. Mock interviewer creation
      mockInsertChain([baseInterviewerMock]);
      // 2. Mock finding existing tech stacks (returns empty)
      mockDb.query.techStacks.findMany.mockResolvedValue([]);
      // 3. Mock creating NEW tech stacks (returns the new stacks)
      mockInsertChain([techStackMock1, techStackMock2]);
      // 4. Mock linking table insertion
      mockInsertChain([]);
      // 5. Mock the final getInterviewer call
      mockDb.query.interviewers.findFirst.mockResolvedValue(
        interviewerWithTechStacksMock,
      );

      const result = await createInterviewer({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        techStacks: ['TypeScript', 'React'],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(interviewerWithTechStacksMock);

      expect(mockDb.insert).toHaveBeenCalledWith(schema.interviewers);
      expect(mockDb.query.techStacks.findMany).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalledWith(schema.techStacks);
      expect(mockDb.insert).toHaveBeenCalledWith(schema.interviewerTechStacks);
      expect(revalidatePath).toHaveBeenCalledWith('/interviewers');
    });

    it('should create an interviewer and use EXISTING tech stacks', async () => {
      mockInsertChain([baseInterviewerMock]);
      mockDb.query.techStacks.findMany.mockResolvedValue([techStackMock1]);
      mockInsertChain([]); // For the linking table
      mockDb.query.interviewers.findFirst.mockResolvedValue(
        interviewerWithTechStacksMock,
      );

      const result = await createInterviewer({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        techStacks: ['TypeScript'],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(interviewerWithTechStacksMock);

      const insertCalls = mockDb.insert.mock.calls;
      const techStackInsertCall = insertCalls.find(
        (call) => call[0] === schema.techStacks,
      );
      expect(techStackInsertCall).toBeUndefined();
    });

    it('should return an error if input validation fails', async () => {
      const result = await createInterviewer({
        name: '',
        email: 'invalid-email',
      } as CreateInterviewerInput);
      expect(result.success).toBe(false);
      const error = JSON.parse(result.error as string);
      expect(error.length).toBe(2);
      expect(error[0].path).toEqual(['name']);
      expect(error[1].path).toEqual(['email']);
    });

    it('should return an error if the database call fails', async () => {
      mockInsertError(new Error('DB error'));

      const result = await createInterviewer({
        name: 'John Doe',
        email: 'john.doe@example.com',
        techStacks: ['TypeScript'],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('getInterviewers', () => {
    it('should fetch all interviewers with their tech stacks', async () => {
      mockDb.query.interviewers.findMany.mockResolvedValue([
        interviewerWithTechStacksMock,
      ]);

      const result = await getInterviewers();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([interviewerWithTechStacksMock]);
      expect(mockDb.query.interviewers.findMany).toHaveBeenCalled();
    });
  });

  describe('getInterviewer', () => {
    it('should fetch a single interviewer with their tech stacks', async () => {
      mockDb.query.interviewers.findFirst.mockResolvedValue(
        interviewerWithTechStacksMock,
      );

      const result = await getInterviewer(interviewerId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(interviewerWithTechStacksMock);
    });

    it('should return an error if the interviewer is not found', async () => {
      mockDb.query.interviewers.findFirst.mockResolvedValue(undefined);

      const result = await getInterviewer('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Interviewer not found');
    });
  });

  describe('updateInterviewer', () => {
    it('should update an interviewer and their tech stacks', async () => {
      const updateData = { name: 'Jane Doe' };
      const updatedMock = {
        ...interviewerWithTechStacksMock,
        ...updateData,
      };

      // 1. Mock transaction steps for update
      mockUpdateChain([]); // Updating the interviewer
      mockDeleteChain([]); // Deleting old tech stack links
      mockDb.query.techStacks.findMany.mockResolvedValue([]); // Finding existing stacks (none)
      mockInsertChain([techStackMock1]); // Creating new stacks
      mockInsertChain([]); // Inserting into linking table

      // 2. Mock the final getInterviewer call
      mockDb.query.interviewers.findFirst.mockResolvedValue(updatedMock);

      const result = await updateInterviewer(interviewerId, {
        ...updateData,
        techStacks: ['TypeScript'],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedMock);
      expect(mockDb.update).toHaveBeenCalledWith(schema.interviewers);
      expect(mockDb.delete).toHaveBeenCalledWith(schema.interviewerTechStacks);
      expect(mockDb.insert).toHaveBeenCalledWith(schema.techStacks);
      expect(mockDb.insert).toHaveBeenCalledWith(schema.interviewerTechStacks);
      expect(revalidatePath).toHaveBeenCalledWith('/interviewers');
      expect(revalidatePath).toHaveBeenCalledWith(
        `/interviewers/${interviewerId}`,
      );
    });

    it('should return an error if the database call fails', async () => {
      mockUpdateError(new Error('DB error'));

      const result = await updateInterviewer(interviewerId, {
        name: 'New Name',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('deleteInterviewer', () => {
    it('should delete an interviewer successfully', async () => {
      mockDeleteChain([]); // Deleting from interviewerTechStacks
      mockDeleteChain([baseInterviewerMock]); // Deleting from interviewers

      const result = await deleteInterviewer(interviewerId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(baseInterviewerMock);
      expect(revalidatePath).toHaveBeenCalledWith('/interviewers');
    });

    it('should return an error if the interviewer to delete is not found', async () => {
      mockDeleteChain([]); // for interviewerTechStacks
      mockDeleteChain([]); // for interviewers (returns empty, not found)

      const result = await deleteInterviewer(interviewerId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Interviewer not found');
    });

    it('should return an error if the database call fails', async () => {
      mockDeleteError(new Error('DB error'));

      const result = await deleteInterviewer(interviewerId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });
});
