import { describe, it, expect } from 'vitest';
import {
  createAccountManagerSchema,
  updateAccountManagerSchema,
} from './accountManager';

describe('AccountManager Validators', () => {
  describe('createAccountManagerSchema', () => {
    it('should validate valid input', () => {
      const validInput = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const result = createAccountManagerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject empty name', () => {
      const invalidInput = {
        name: '',
        email: 'john.doe@example.com',
      };

      const result = createAccountManagerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });

    it('should reject invalid email', () => {
      const invalidInput = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      const result = createAccountManagerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject missing required fields', () => {
      const invalidInput = {};

      const result = createAccountManagerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('updateAccountManagerSchema', () => {
    it('should validate valid input with all fields', () => {
      const validInput = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      };

      const result = updateAccountManagerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only name', () => {
      const validInput = {
        name: 'Jane Doe',
      };

      const result = updateAccountManagerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only email', () => {
      const validInput = {
        email: 'jane.doe@example.com',
      };

      const result = updateAccountManagerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate empty object', () => {
      const validInput = {};

      const result = updateAccountManagerSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject invalid email when provided', () => {
      const invalidInput = {
        email: 'invalid-email',
      };

      const result = updateAccountManagerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address');
      }
    });

    it('should reject empty name when provided', () => {
      const invalidInput = {
        name: '',
      };

      const result = updateAccountManagerSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });
  });
});
