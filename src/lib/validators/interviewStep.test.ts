import { describe, it, expect } from 'vitest';
import {
  createInterviewStepSchema,
  updateInterviewStepSchema,
} from './interviewStep';
import { generateMockUuid } from '@/tests/utils/mockUuid';

describe('InterviewStep Zod Schemas', () => {
  const validPositionId = generateMockUuid(1);
  const validTypeId = generateMockUuid(2);
  const validAssignmentId = generateMockUuid(3);

  describe('createInterviewStepSchema', () => {
    it('should validate a correct payload', () => {
      const input = {
        positionId: validPositionId,
        sequenceNumber: 1,
        name: 'Initial Screening',
        typeId: validTypeId,
        schedulingLink: 'https://example.com/schedule',
      };
      const result = createInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if positionId is missing', () => {
      const input = {
        sequenceNumber: 1,
        name: 'Initial Screening',
        typeId: validTypeId,
      };
      const result = createInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('positionId');
      }
    });

    it('should fail if sequenceNumber is invalid', () => {
      const input = {
        positionId: validPositionId,
        sequenceNumber: -1,
        name: 'Initial Screening',
        typeId: validTypeId,
      };
      const result = createInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('sequenceNumber');
      }
    });

    it('should fail if name is empty', () => {
      const input = {
        positionId: validPositionId,
        sequenceNumber: 1,
        name: '',
        typeId: validTypeId,
      };
      const result = createInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('name');
      }
    });

    it('should fail if typeId is missing or invalid', () => {
      const input = {
        positionId: validPositionId,
        sequenceNumber: 1,
        name: 'Initial Screening',
      };
      const result = createInterviewStepSchema.safeParse(input as unknown);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('typeId');
      }
    });
  });

  describe('updateInterviewStepSchema', () => {
    it('should validate a full payload', () => {
      const input = {
        sequenceNumber: 2,
        name: 'Technical Round',
        typeId: validTypeId,
        originalAssignmentId: validAssignmentId,
        schedulingLink: 'https://example.com/schedule-tech',
        emailTemplate: 'Hello!',
      };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate a partial payload', () => {
      const input = { name: 'Updated Name' };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should allow null for optional fields', () => {
      const input = { originalAssignmentId: null };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should pass an empty payload', () => {
      const input = {};
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if sequenceNumber is not a number', () => {
      const input = { sequenceNumber: 'not-a-number' };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('sequenceNumber');
      }
    });

    it('should fail if name is an empty string', () => {
      const input = { name: '' };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('name');
      }
    });

    it('should fail if typeId is not a valid uuid', () => {
      const input = { typeId: 'not-a-uuid' };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('typeId');
      }
    });

    it('should fail if schedulingLink is not a valid URL', () => {
      const input = { schedulingLink: 'not-a-url' };
      const result = updateInterviewStepSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('schedulingLink');
      }
    });
  });
});
