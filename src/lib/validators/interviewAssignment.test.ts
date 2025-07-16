import { describe, it, expect } from 'vitest';
import {
  createInterviewAssignmentSchema,
  updateInterviewAssignmentSchema,
} from './interviewAssignment';
import { generateMockUuid } from '@/tests/utils/mockUuid';

const baseMock = {
  interviewId: generateMockUuid(1),
};

describe('createInterviewAssignmentSchema', () => {
  it('should validate a correct payload', () => {
    const mock = {
      ...baseMock,
      resourceUrl: 'https://example.com/resource',
      resourceIdentifier: 'file-12345',
    };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should accept payloads where optional fields are missing', () => {
    const result = createInterviewAssignmentSchema.safeParse(baseMock);
    expect(result.success).toBe(true);
  });

  it('should fail if interviewId is missing', () => {
    const mock = {
      resourceUrl: 'https://example.com/resource',
      resourceIdentifier: 'file-12345',
    };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['interviewId']);
    }
  });

  it('should fail if interviewId is not a UUID', () => {
    const mock = { ...baseMock, interviewId: 'not-a-uuid' };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['interviewId']);
    }
  });
});

describe('updateInterviewAssignmentSchema', () => {
  it('should allow partial updates', () => {
    const mock = { resourceUrl: 'https://example.com/new-url' };
    const result = updateInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should accept an empty object for partial updates', () => {
    const result = updateInterviewAssignmentSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
