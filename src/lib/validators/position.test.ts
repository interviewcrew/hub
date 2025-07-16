import { describe, it, expect } from 'vitest';
import { createPositionSchema, updatePositionSchema } from './position';

describe('Position Validators', () => {
  describe('createPositionSchema', () => {
    it('should validate valid input with all fields', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        details: 'We are looking for a senior engineer...',
        jobAd: 'Join our team as a Senior Software Engineer...',
        techStacks: ['React', 'TypeScript', 'Node.js'],
        minSalary: 120000,
        maxSalary: 150000,
        culturalFitCriteria: 'Team player, fast learner',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
      };

      const result = createPositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate valid input with only required fields', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
      };

      const result = createPositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject empty title', () => {
      const invalidInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: '',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
      };

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject invalid client ID', () => {
      const invalidInput = {
        clientId: 'invalid-uuid',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
      };

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid client ID');
      }
    });

    it('should reject invalid account manager ID', () => {
      const invalidInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: 'invalid-uuid',
      };

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Invalid account manager ID',
        );
      }
    });

    it('should validate techStacks as array of strings', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
        techStacks: ['React', 'TypeScript', 'Node.js'],
      };

      const result = createPositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.techStacks).toEqual([
          'React',
          'TypeScript',
          'Node.js',
        ]);
      }
    });

    it('should reject techStacks with non-string elements', () => {
      const invalidInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
        techStacks: ['React', 123, 'Node.js'], // number in array
      };

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should validate salary as numbers', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
        minSalary: 120000,
        maxSalary: 150000,
      };

      const result = createPositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minSalary).toBe(120000);
        expect(result.data.maxSalary).toBe(150000);
      }
    });

    it('should reject negative salary values', () => {
      const invalidInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
        minSalary: -1000,
      };

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Minimum salary must be non-negative',
        );
      }
    });

    it('should reject max salary less than min salary', () => {
      const invalidInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
        minSalary: 150000,
        maxSalary: 120000, // Less than min
      };

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Maximum salary must be greater than or equal to minimum salary',
        );
      }
    });

    it('should accept equal min and max salary', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
        minSalary: 120000,
        maxSalary: 120000, // Equal to min
      };

      const result = createPositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidInput = {};

      const result = createPositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should validate jobAd field', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        jobAd:
          'We are seeking a talented Senior Software Engineer to join our growing team...',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
      };

      const result = createPositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.jobAd).toBe(
          'We are seeking a talented Senior Software Engineer to join our growing team...',
        );
      }
    });
  });

  describe('updatePositionSchema', () => {
    it('should validate valid input with all fields', () => {
      const validInput = {
        clientId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Senior Software Engineer',
        details: 'Updated job posting details...',
        jobAd: 'Updated job advertisement content...',
        techStacks: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        minSalary: 130000,
        maxSalary: 160000,
        culturalFitCriteria: 'Updated cultural criteria',
        accountManagerId: '456e7890-e89b-12d3-a456-426614174001',
      };

      const result = updatePositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only title', () => {
      const validInput = {
        title: 'Senior Software Engineer',
      };

      const result = updatePositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only techStacks', () => {
      const validInput = {
        techStacks: ['React', 'TypeScript'],
      };

      const result = updatePositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only salary', () => {
      const validInput = {
        minSalary: 100000,
        maxSalary: 140000,
      };

      const result = updatePositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate empty object', () => {
      const validInput = {};

      const result = updatePositionSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject empty title when provided', () => {
      const invalidInput = {
        title: '',
      };

      const result = updatePositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required');
      }
    });

    it('should reject invalid client ID when provided', () => {
      const invalidInput = {
        clientId: 'invalid-uuid',
      };

      const result = updatePositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid client ID');
      }
    });

    it('should reject invalid account manager ID when provided', () => {
      const invalidInput = {
        accountManagerId: 'invalid-uuid',
      };

      const result = updatePositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Invalid account manager ID',
        );
      }
    });

    it('should reject max salary less than min salary in update', () => {
      const invalidInput = {
        minSalary: 160000,
        maxSalary: 130000, // Less than min
      };

      const result = updatePositionSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Maximum salary must be greater than or equal to minimum salary',
        );
      }
    });
  });
});
