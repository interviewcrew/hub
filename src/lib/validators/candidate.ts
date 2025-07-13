import { z } from 'zod';
import { candidateStatusEnum } from '@/db/schema';

// Schema for the person/candidate entity
export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  resume_link: z.string().url('Must be a valid URL').optional().nullable(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

// Schema for the application entity
export const createCandidateApplicationSchema = z.object({
  positionId: z.string().uuid(),
  candidate: createCandidateSchema,
});

export const updateCandidateApplicationSchema = z.object({
  status: z.enum(candidateStatusEnum.enumValues).optional(),
  clientNotifiedAt: z.date().optional().nullable(),
  currentInterviewStepId: z.string().uuid().optional().nullable(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
export type CreateCandidateApplicationInput = z.infer<
  typeof createCandidateApplicationSchema
>;
export type UpdateCandidateApplicationInput = z.infer<
  typeof updateCandidateApplicationSchema
>;