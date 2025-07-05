import { describe, it, expect } from 'vitest';
import {
  createCandidateSchema,
  updateCandidateSchema,
  createCandidateApplicationSchema,
  updateCandidateApplicationSchema,
} from './candidate';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import { candidateStatusEnum } from '@/db/schema';

describe('Candidate and Candidate Application Zod Schemas', () => {
  const validCandidateId = generateMockUuid(1);
  const validPositionId = generateMockUuid(2);

  describe('createCandidateSchema', () => {
    it('should validate a correct payload', () => {
      const input = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        resume_link: 'https://example.com/resume.pdf',
      };
      const result = createCandidateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const input = { name: 'John Doe', email: 'not-an-email' };
      const result = createCandidateSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('email');
      }
    });
  });

  describe('updateCandidateSchema', () => {
    it('should validate a partial payload', () => {
      const input = { name: 'Jane Doe' };
      const result = updateCandidateSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('createCandidateApplicationSchema', () => {
    it('should validate a correct payload', () => {
      const input = {
        candidateId: validCandidateId,
        positionId: validPositionId,
      };
      const result = createCandidateApplicationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('updateCandidateApplicationSchema', () => {
    it('should validate a valid status update', () => {
      const input = { status: candidateStatusEnum.enumValues[2] }; // 'Interview Scheduled'
      const result = updateCandidateApplicationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate a client_notified_at update', () => {
      const input = { client_notified_at: new Date() };
      const result = updateCandidateApplicationSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail on an invalid status', () => {
      const input = { status: 'NonExistentStatus' };
      const result = updateCandidateApplicationSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('status');
      }
    });
  });
}); 