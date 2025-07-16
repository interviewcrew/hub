import { describe, it, expect } from 'vitest';
import {
  createInterviewerSchema,
  updateInterviewerSchema,
} from './interviewer';

describe('Interviewer Zod Schemas', () => {
  describe('createInterviewerSchema', () => {
    it('should validate a correct payload', () => {
      const input = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      };
      const result = createInterviewerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if name is missing', () => {
      const input = { email: 'jane.doe@example.com' };
      const result = createInterviewerSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('name');
      }
    });

    it('should validate if techStacks is a valid array of strings', () => {
      const input = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        techStacks: ['React', 'Node.js'],
      };
      const result = createInterviewerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if techStacks is not an array of strings', () => {
      const input = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        techStacks: ['React', 123],
      };
      const result = createInterviewerSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['techStacks', 1]);
      }
    });
  });

  describe('updateInterviewerSchema', () => {
    it('should validate a partial payload with isActive flag', () => {
      const input = { isActive: false };
      const result = updateInterviewerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate a valid optional email', () => {
      const input = { email: 'good.email@example.com' };
      const result = updateInterviewerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should validate techStacks in an update', () => {
      const input = { techStacks: ['Go', 'Python'] };
      const result = updateInterviewerSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should fail if an optional email is invalid', () => {
      const input = { email: 'not-a-valid-email' };
      const result = updateInterviewerSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path[0]).toBe('email');
      }
    });
  });
});
