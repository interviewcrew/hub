import { describe, it, expect } from 'vitest';
import {
  createOriginalAssignmentSchema,
  updateOriginalAssignmentSchema,
} from './originalAssignment';

describe('OriginalAssignment Zod Schemas', () => {
  describe('createOriginalAssignmentSchema', () => {
    it('should validate a correct payload', () => {
      const input = {
        name: 'Test Assignment',
        googleDocFileId: '12345abcdef',
        driveFolderPath: '/assignments/test',
      };
      const result = createOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if name is missing', () => {
      const input = {
        googleDocFileId: '12345abcdef',
      };
      const result = createOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Name is required');
    });

    it('should fail if googleDocFileId is missing', () => {
      const input = {
        name: 'Test Assignment',
      };
      const result = createOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        'Google Doc File ID is required',
      );
    });

    it('should pass if driveFolderPath is missing', () => {
      const input = {
        name: 'Test Assignment',
        googleDocFileId: '12345abcdef',
      };
      const result = createOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('updateOriginalAssignmentSchema', () => {
    it('should validate a payload with all fields', () => {
      const input = {
        name: 'Updated Assignment',
        googleDocFileId: '67890ghijkl',
        driveFolderPath: '/assignments/updated',
      };
      const result = updateOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate a partial payload', () => {
      const input = {
        name: 'Just the name',
      };
      const result = updateOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should pass for an empty payload', () => {
      const input = {};
      const result = updateOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if a field is provided but invalid', () => {
      const input = {
        name: '',
      };
      const result = updateOriginalAssignmentSchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe('Name is required');
    });
  });
});
