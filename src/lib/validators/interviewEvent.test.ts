import { describe, it, expect } from 'vitest';
import { createInterviewEventSchema } from './interviewEvent';
import { generateMockUuid } from '@/tests/utils/mockUuid';

describe('Interview Event Zod Schemas', () => {
  const validCandidateApplicationId = generateMockUuid(1);

  describe('createInterviewEventSchema', () => {
    it('should validate a correct payload', () => {
      const input = {
        candidateApplicationId: validCandidateApplicationId,
        eventName: 'Application Submitted',
        details: { source: 'Manual Import' },
      };
      const result = createInterviewEventSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if eventName is empty', () => {
      const input = {
        candidateApplicationId: validCandidateApplicationId,
        eventName: '',
      };
      const result = createInterviewEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should fail if candidateApplicationId is missing', () => {
      const input = {
        eventName: 'Test Event',
      };
      const result = createInterviewEventSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
}); 