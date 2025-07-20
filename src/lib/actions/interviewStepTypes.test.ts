import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockDb,
  resetDbMocks,
  mockUpdateChain,
  mockDeleteChain,
  mockInsertChain,
  mockInsertError,
  mockDeleteError,
  mockUpdateError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import {
  createInterviewStepType,
  getInterviewStepTypes,
  getInterviewStepType,
  updateInterviewStepType,
  deleteInterviewStepType,
} from './interviewStepTypes';
import { revalidatePath } from 'next/cache';
import { interviewStepTypes } from '@/db/schema';
import { CreateInterviewStepTypeInput } from '@/lib/validators/interviewStepType';

vi.mock('next/cache');

describe('Interview Step Type Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  const clientId = generateMockUuid(1);
  const stepTypeId = generateMockUuid(2);

  const mockInterviewStepType = {
    id: stepTypeId,
    name: 'Technical Screen',
    clientId: clientId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('createInterviewStepType', () => {
    it('should create a new interview step type successfully', async () => {
      mockInsertChain([mockInterviewStepType]);
      const input = {
        name: 'Technical Screen',
        clientId: clientId,
      };

      const result = await createInterviewStepType(input);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInterviewStepType);
      expect(mockDb.insert).toHaveBeenCalledWith(interviewStepTypes);
      expect(revalidatePath).toHaveBeenCalledWith(
        `/clients/${clientId}/interview-step-types`,
      );
    });

    it('should return an error if validation fails', async () => {
      const input = { name: '', clientId: 'invalid-uuid' };
      const result = await createInterviewStepType(
        input as CreateInterviewStepTypeInput,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return a database error if insertion fails', async () => {
      mockInsertError(new Error('DB Error'));
      const input = {
        name: 'Technical Screen',
        clientId: clientId,
      };
      const result = await createInterviewStepType(input);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('getInterviewStepTypes', () => {
    it('should return all interview step types for a client', async () => {
      mockDb.query.interviewStepTypes.findMany.mockResolvedValue([
        mockInterviewStepType,
      ]);

      const result = await getInterviewStepTypes(clientId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockInterviewStepType]);
      expect(mockDb.query.interviewStepTypes.findMany).toHaveBeenCalledWith({
        where: expect.anything(),
      });
    });

    it('should return an error if db fails', async () => {
      mockDb.query.interviewStepTypes.findMany.mockRejectedValue(
        new Error('DB Error'),
      );
      const result = await getInterviewStepTypes(clientId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('getInterviewStepType', () => {
    it('should return a single interview step type if found', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(
        mockInterviewStepType,
      );

      const result = await getInterviewStepType(stepTypeId, clientId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInterviewStepType);
    });

    it('should return an error if not found', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(undefined);

      const result = await getInterviewStepType('not-found-id', clientId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Interview step type not found');
    });

    it('should return an error if db fails', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockRejectedValue(
        new Error('DB Error'),
      );
      const result = await getInterviewStepType(stepTypeId, clientId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('updateInterviewStepType', () => {
    it('should update an interview step type successfully', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedStepType = { ...mockInterviewStepType, ...updateData };
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(
        mockInterviewStepType,
      );
      mockUpdateChain([updatedStepType]);

      const result = await updateInterviewStepType(
        stepTypeId,
        clientId,
        updateData,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedStepType);
      expect(revalidatePath).toHaveBeenCalledWith(
        `/clients/${clientId}/interview-step-types`,
      );
    });

    it('should return an error if not found', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(undefined);

      const result = await updateInterviewStepType('not-found-id', clientId, {
        name: 'test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Interview step type not found');
    });

    it('should return an error if db fails', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(
        mockInterviewStepType,
      );
      mockUpdateError(new Error('DB Error'));
      const result = await updateInterviewStepType(stepTypeId, clientId, {
        name: 'new name',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('deleteInterviewStepType', () => {
    it('should delete an interview step type successfully', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(
        mockInterviewStepType,
      );
      mockDeleteChain([mockInterviewStepType]);

      const result = await deleteInterviewStepType(stepTypeId, clientId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(revalidatePath).toHaveBeenCalledWith(
        `/clients/${clientId}/interview-step-types`,
      );
    });

    it('should return an error if not found', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(undefined);

      const result = await deleteInterviewStepType('not-found-id', clientId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Interview step type not found');
    });

    it('should return an error if db fails', async () => {
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(
        mockInterviewStepType,
      );

      mockDeleteError(new Error('DB Error'));
      const result = await deleteInterviewStepType(stepTypeId, clientId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });
});
