import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createInterviewStep,
  getInterviewStep,
  getInterviewStepsForPosition,
  updateInterviewStep,
  deleteInterviewStep,
} from './interviewSteps';
import {
  mockDb,
  resetDbMocks,
  mockInsertChain,
  mockUpdateChain,
  mockDeleteChain,
  mockInsertError,
  mockUpdateError,
  mockDeleteError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import { revalidatePath } from 'next/cache';

vi.mock('next/cache');

describe('Interview Step Actions', () => {
  const positionId = generateMockUuid(1);
  const clientId = generateMockUuid(2);
  const typeId = generateMockUuid(3);
  const stepId = generateMockUuid(4);

  const mockPosition = { id: positionId, clientId };
  const mockStepType = { id: typeId, clientId, name: 'Technical Screen' };
  const anotherTypeId = generateMockUuid(5);
  const anotherMockStepType = {
    id: anotherTypeId,
    clientId,
    name: 'HR Screen',
  };

  const mockStepInput = {
    positionId,
    typeId,
    name: 'New Technical Screen',
    sequenceNumber: 1,
  };

  const mockStep = {
    id: stepId,
    ...mockStepInput,
    originalAssignmentId: null,
    schedulingLink: null,
    emailTemplate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    resetDbMocks();
    vi.clearAllMocks();
  });

  describe('createInterviewStep', () => {
    it('should create an interview step successfully', async () => {
      mockDb.query.positions.findFirst.mockResolvedValue(mockPosition);
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(mockStepType);
      mockInsertChain([mockStep]);

      const result = await createInterviewStep(mockStepInput);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStep);
      expect(revalidatePath).toHaveBeenCalledWith(`/positions/${positionId}`);
    });

    it('should fail if input validation fails', async () => {
      const result = await createInterviewStep({
        ...mockStepInput,
        positionId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
      const error = JSON.parse(result.error as string);
      expect(error[0].path).toEqual(['positionId']);
      expect(error[0].message).toBe('Invalid uuid');
    });

    it('should fail if position does not exist', async () => {
        mockDb.query.positions.findFirst.mockResolvedValue(undefined);
        const result = await createInterviewStep(mockStepInput);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Position not found');
    });

    it('should fail if interview step type does not belong to the same client', async () => {
      mockDb.query.positions.findFirst.mockResolvedValue(mockPosition);
      mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(undefined);

      const result = await createInterviewStep(mockStepInput);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Interview step type not found for this client',
      );
    });

    it('should return an error if the database call fails', async () => {
        mockDb.query.positions.findFirst.mockResolvedValue(mockPosition);
        mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(mockStepType);
        mockInsertError(new Error('DB error'));
        const result = await createInterviewStep(mockStepInput);
        expect(result.success).toBe(false);
        expect(result.error).toBe('DB error');
    });
  });

  describe('getInterviewStep', () => {
    it('should return a single step successfully', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
      const result = await getInterviewStep(stepId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStep);
    });

    it('should fail if step is not found', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(undefined);
      const result = await getInterviewStep(stepId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Interview step not found');
    });
  });

  describe('getInterviewStepsForPosition', () => {
    it('should return all steps for a given position ordered by sequence', async () => {
      const mockSteps = [
        mockStep,
        { ...mockStep, id: generateMockUuid(6), sequenceNumber: 2 },
      ];
      mockDb.query.interviewSteps.findMany.mockResolvedValue(mockSteps);

      const result = await getInterviewStepsForPosition(positionId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(mockSteps);
      expect(mockDb.query.interviewSteps.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        orderBy: expect.any(Function),
      });
    });

    it('should return an empty array if no steps are found', async () => {
      mockDb.query.interviewSteps.findMany.mockResolvedValue([]);
      const result = await getInterviewStepsForPosition(positionId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('updateInterviewStep', () => {
    const updateData = { name: 'Updated Technical Screen' };
    const updatedStep = { ...mockStep, ...updateData };

    it('should update an interview step successfully', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
      mockUpdateChain([updatedStep]);

      const result = await updateInterviewStep(stepId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedStep);
      expect(revalidatePath).toHaveBeenCalledWith(`/positions/${positionId}`);
    });

    it('should fail if input validation fails', async () => {
      const result = await updateInterviewStep(stepId, { name: '' });
      expect(result.success).toBe(false);
      const error = JSON.parse(result.error as string);
      expect(error[0].message).toBe('Name is required');
    });

    it('should fail if step is not found', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(undefined);
      const result = await updateInterviewStep(stepId, updateData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Interview step not found');
    });

    it('should successfully update the typeId if it is valid for the client', async () => {
        const typeUpdateData = { typeId: anotherTypeId };
        const updatedStepWithNewType = { ...mockStep, ...typeUpdateData };
        mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
        mockDb.query.positions.findFirst.mockResolvedValue(mockPosition);
        mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(anotherMockStepType);
        mockUpdateChain([updatedStepWithNewType]);
        
        const result = await updateInterviewStep(stepId, typeUpdateData);
        
        expect(result.success).toBe(true);
        expect(result.data?.typeId).toBe(anotherTypeId);
    });

    it('should fail to update the typeId if it is invalid for the client', async () => {
        const typeUpdateData = { typeId: anotherTypeId };
        mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
        mockDb.query.positions.findFirst.mockResolvedValue(mockPosition);
        mockDb.query.interviewStepTypes.findFirst.mockResolvedValue(undefined); // Type not found for client
        
        const result = await updateInterviewStep(stepId, typeUpdateData);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Interview step type not found for this client');
    });

    it('should return an error if the database call fails', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
      mockUpdateError(new Error('DB error'));
      const result = await updateInterviewStep(stepId, updateData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('deleteInterviewStep', () => {
    it('should delete an interview step successfully', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
      mockDeleteChain([mockStep]);
      const result = await deleteInterviewStep(stepId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStep);
      expect(revalidatePath).toHaveBeenCalledWith(`/positions/${positionId}`);
    });

    it('should fail if step is not found', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(undefined);
      const result = await deleteInterviewStep(stepId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Interview step not found');
    });

    it('should return an error if the database call fails', async () => {
      mockDb.query.interviewSteps.findFirst.mockResolvedValue(mockStep);
      mockDeleteError(new Error('DB error'));
      const result = await deleteInterviewStep(stepId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });
}); 