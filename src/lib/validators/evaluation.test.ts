import { describe, it, expect } from 'vitest';
import { createEvaluationSchema, updateEvaluationSchema } from './evaluation';
import { generateMockUuid } from '@/tests/utils/mockUuid';
import { EVALUATION_FORMATS, EVALUATION_OUTCOMES } from '@/db/schema';

const baseMock = {
  interviewId: generateMockUuid(1),
  evaluatorId: generateMockUuid(2),
  outcome: EVALUATION_OUTCOMES.STRONG_HIRE,
  format: EVALUATION_FORMATS.STRUCTURED_JSON,
  structuredData: { notes: 'Great candidate' },
};

describe('createEvaluationSchema', () => {
  it('should validate when format is structured_json and structuredData is provided', () => {
    const mock = { ...baseMock };
    const result = createEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should validate when format is drive_doc and driveDocUrl is provided', () => {
    const mock = {
      ...baseMock,
      format: EVALUATION_FORMATS.DRIVE_DOC,
      driveDocUrl: 'https://example.com/doc',
      structuredData: undefined,
    };
    const result = createEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should fail if format is structured_json but structuredData is missing', () => {
    const mock = {
      ...baseMock,
      structuredData: undefined,
    };
    const result = createEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['structuredData']);
    }
  });

  it('should fail if format is drive_doc but driveDocUrl is missing', () => {
    const mock = {
      ...baseMock,
      format: EVALUATION_FORMATS.DRIVE_DOC,
      structuredData: undefined,
    };
    const result = createEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['driveDocUrl']);
    }
  });

  it('should fail if outcome is not a valid enum value', () => {
    const mock = { ...baseMock, outcome: 'not-a-valid-outcome' };
    const result = createEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['outcome']);
    }
  });

  it('should fail if driveDocUrl is not a valid URL', () => {
    const mock = {
      ...baseMock,
      format: EVALUATION_FORMATS.DRIVE_DOC,
      driveDocUrl: 'not-a-url',
      structuredData: undefined,
    };
    const result = createEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['driveDocUrl']);
    }
  });
});

describe('updateEvaluationSchema', () => {
  it('should allow partial updates', () => {
    const mock = { outcome: EVALUATION_OUTCOMES.HIRE };
    const result = updateEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it('should still enforce refine logic on partial updates', () => {
    const mock = {
      format: EVALUATION_FORMATS.DRIVE_DOC,
      driveDocUrl: undefined,
    };
    const result = updateEvaluationSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['driveDocUrl']);
    }
  });
});
