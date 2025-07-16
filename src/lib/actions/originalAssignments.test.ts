import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resetDbMocks,
  mockSelectChain,
  mockSelectWithWhereChain,
  mockUpdateChain,
  mockDeleteChain,
  mockInsertChain,
  mockInsertError,
  mockSelectError,
  mockSelectWithWhereError,
  mockUpdateError,
  mockDeleteError,
} from '@/tests/utils/drizzleMocks';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import {
  createOriginalAssignment,
  getOriginalAssignment,
  getOriginalAssignments,
  updateOriginalAssignment,
  deleteOriginalAssignment,
} from './originalAssignments';
import { revalidatePath } from 'next/cache';

vi.mock('next/cache');

describe('OriginalAssignment Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  const assignmentId = generateMockUuid(1);

  const baseAssignmentMock = {
    id: assignmentId,
    name: 'Test Assignment',
    googleDocFileId: 'gdoc-123',
    driveFolderPath: '/assignments',
  };

  describe('createOriginalAssignment', () => {
    it('should create an assignment successfully', async () => {
      mockInsertChain([baseAssignmentMock]);

      const result = await createOriginalAssignment({
        name: 'Test Assignment',
        googleDocFileId: 'gdoc-123',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(baseAssignmentMock);
      expect(revalidatePath).toHaveBeenCalledWith('/assignments');
    });

    it('should return a Zod validation error', async () => {
      const result = await createOriginalAssignment({
        name: '',
        googleDocFileId: 'gdoc-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Name is required');
    });

    it('should return a database error', async () => {
      mockInsertError(new Error('DB Error'));

      const result = await createOriginalAssignment({
        name: 'Test Assignment',
        googleDocFileId: 'gdoc-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('getOriginalAssignments', () => {
    it('should fetch all assignments', async () => {
      mockSelectChain([baseAssignmentMock]);
      const result = await getOriginalAssignments();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([baseAssignmentMock]);
    });

    it('should handle a database error', async () => {
      mockSelectError(new Error('DB Error'));
      const result = await getOriginalAssignments();
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('getOriginalAssignment', () => {
    it('should fetch a single assignment', async () => {
      mockSelectWithWhereChain([baseAssignmentMock]);
      const result = await getOriginalAssignment(assignmentId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(baseAssignmentMock);
    });

    it('should return an error if not found', async () => {
      mockSelectWithWhereChain([]);
      const result = await getOriginalAssignment(assignmentId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Assignment not found');
    });

    it('should handle a database error', async () => {
      mockSelectWithWhereError(new Error('DB Error'));
      const result = await getOriginalAssignment(assignmentId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('updateOriginalAssignment', () => {
    it('should update an assignment successfully', async () => {
      mockUpdateChain([baseAssignmentMock]);
      const result = await updateOriginalAssignment(assignmentId, {
        name: 'Updated Name',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(baseAssignmentMock);
      expect(revalidatePath).toHaveBeenCalledWith('/assignments');
      expect(revalidatePath).toHaveBeenCalledWith(
        `/assignments/${assignmentId}`,
      );
    });

    it('should return an error if not found', async () => {
      mockUpdateChain([]);
      const result = await updateOriginalAssignment(assignmentId, {
        name: 'Updated Name',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Assignment not found');
    });

    it('should handle a database error', async () => {
      mockUpdateError(new Error('DB Error'));
      const result = await updateOriginalAssignment(assignmentId, {
        name: 'Updated Name',
      });
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });

  describe('deleteOriginalAssignment', () => {
    it('should delete an assignment successfully', async () => {
      mockDeleteChain([baseAssignmentMock]);
      const result = await deleteOriginalAssignment(assignmentId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(baseAssignmentMock);
      expect(revalidatePath).toHaveBeenCalledWith('/assignments');
    });

    it('should return an error if not found', async () => {
      mockDeleteChain([]);
      const result = await deleteOriginalAssignment(assignmentId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Assignment not found');
    });

    it('should handle a database error', async () => {
      mockDeleteError(new Error('DB Error'));
      const result = await deleteOriginalAssignment(assignmentId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('DB Error');
    });
  });
});
