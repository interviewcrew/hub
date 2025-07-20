import { z } from 'zod';

export const createInterviewStepTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().uuid('Client ID must be a valid UUID'),
});

export const updateInterviewStepTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  clientId: z.string().uuid('Client ID must be a valid UUID').optional(),
});

export type CreateInterviewStepTypeInput = z.infer<
  typeof createInterviewStepTypeSchema
>;
export type UpdateInterviewStepTypeInput = z.infer<
  typeof updateInterviewStepTypeSchema
>;
