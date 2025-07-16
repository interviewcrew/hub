import { z } from 'zod';
import { evaluationOutcomeEnum, evaluationFormatEnum } from '@/db/schema';

const evaluationObjectSchema = z.object({
  interviewId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  outcome: z.enum(evaluationOutcomeEnum.enumValues),
  format: z.enum(evaluationFormatEnum.enumValues),
  structuredData: z.record(z.unknown()).optional(),
  driveDocUrl: z.string().url().optional(),
  submittedAt: z.date().optional(),
});

const evaluationRefinement = (
  data: Partial<z.infer<typeof evaluationObjectSchema>>,
  refinementContext: z.RefinementCtx,
) => {
  if (data.format === 'structured_json' && !data.structuredData) {
    refinementContext.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'structuredData must be provided when format is structured_json',
      path: ['structuredData'],
    });
  }
  if (data.format === 'drive_doc' && !data.driveDocUrl) {
    refinementContext.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'driveDocUrl must be provided when format is drive_doc',
      path: ['driveDocUrl'],
    });
  }
};

export const createEvaluationSchema =
  evaluationObjectSchema.superRefine(evaluationRefinement);

export const updateEvaluationSchema = evaluationObjectSchema
  .partial()
  .superRefine(evaluationRefinement);
