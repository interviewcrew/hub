import { z } from 'zod';

export const createInterviewSchema = z.object({
  candidateApplicationId: z.string().uuid(),
  interviewStepId: z.string().uuid(),
  interviewerId: z.string().uuid().optional(),
  recordingUrl: z.string().url().optional(),
});

export const updateInterviewSchema = createInterviewSchema.partial();

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
