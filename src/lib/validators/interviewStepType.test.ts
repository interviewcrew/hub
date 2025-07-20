import { generateMockUuid } from '@/tests/utils/mockUuid';
import {
  createInterviewStepTypeSchema,
  updateInterviewStepTypeSchema,
} from './interviewStepType';
import { describe, it, expect } from 'vitest';

describe('createInterviewStepTypeSchema', () => {
  it('should validate a correct input', () => {
    const input = {
      name: 'Technical Screen',
      clientId: generateMockUuid(),
    };
    const result = createInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should fail if name is missing', () => {
    const input = {
      clientId: generateMockUuid(),
    };
    const result = createInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Required');
  });

  it('should fail if name is empty', () => {
    const input = {
      name: '',
      clientId: generateMockUuid(),
    };
    const result = createInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Name is required');
  });

  it('should fail if clientId is not a valid UUID', () => {
    const input = {
      name: 'Technical Screen',
      clientId: 'invalid-uuid',
    };
    const result = createInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Client ID must be a valid UUID',
    );
  });
});

describe('updateInterviewStepTypeSchema', () => {
  it('should validate a correct input with all fields', () => {
    const input = {
      name: 'Final Interview',
      clientId: generateMockUuid(),
    };
    const result = updateInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should validate a correct input with only name', () => {
    const input = {
      name: 'Updated Name',
    };
    const result = updateInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should validate a correct input with only clientId', () => {
    const input = {
      clientId: generateMockUuid(),
    };
    const result = updateInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should fail if name is an empty string', () => {
    const input = {
      name: '',
    };
    const result = updateInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Name is required');
  });

  it('should fail if clientId is an invalid UUID', () => {
    const input = {
      clientId: 'invalid-uuid',
    };
    const result = updateInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      'Client ID must be a valid UUID',
    );
  });

  it('should accept an empty object', () => {
    const input = {};
    const result = updateInterviewStepTypeSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
