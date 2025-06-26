import { describe, it, expect } from 'vitest';
import { createClientSchema, updateClientSchema } from './client';

describe('Client Validators', () => {
  describe('createClientSchema', () => {
    it('should validate valid input with all fields', () => {
      const validInput = {
        name: 'Acme Corp',
        contactInfo: 'contact@acme.com',
        logo: 'https://acme.com/logo.png',
        accountManagerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate valid input without optional fields', () => {
      const validInput = {
        name: 'Acme Corp',
        accountManagerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject empty name', () => {
      const invalidInput = {
        name: '',
        accountManagerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });

    it('should reject invalid accountManagerId', () => {
      const invalidInput = {
        name: 'Acme Corp',
        accountManagerId: 'invalid-uuid',
      };

      const result = createClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid account manager ID');
      }
    });

    it('should reject invalid logo URL', () => {
      const invalidInput = {
        name: 'Acme Corp',
        logo: 'not-a-valid-url',
        accountManagerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = createClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid logo URL');
      }
    });

    it('should reject missing required fields', () => {
      const invalidInput = {};

      const result = createClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('updateClientSchema', () => {
    it('should validate valid input with all fields', () => {
      const validInput = {
        name: 'Acme Corporation',
        contactInfo: 'new-contact@acme.com',
        logo: 'https://acme.com/new-logo.png',
        accountManagerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = updateClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only name', () => {
      const validInput = {
        name: 'Acme Corporation',
      };

      const result = updateClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only contactInfo', () => {
      const validInput = {
        contactInfo: 'new-contact@acme.com',
      };

      const result = updateClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only logo', () => {
      const validInput = {
        logo: 'https://acme.com/new-logo.png',
      };

      const result = updateClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate partial input with only accountManagerId', () => {
      const validInput = {
        accountManagerId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = updateClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should validate empty object', () => {
      const validInput = {};

      const result = updateClientSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it('should reject empty name when provided', () => {
      const invalidInput = {
        name: '',
      };

      const result = updateClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Name is required');
      }
    });

    it('should reject invalid accountManagerId when provided', () => {
      const invalidInput = {
        accountManagerId: 'invalid-uuid',
      };

      const result = updateClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid account manager ID');
      }
    });

    it('should reject invalid logo URL when provided', () => {
      const invalidInput = {
        logo: 'not-a-valid-url',
      };

      const result = updateClientSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid logo URL');
      }
    });
  });
}); 