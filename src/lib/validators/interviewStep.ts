import { z } from 'zod';

export const createInterviewStepSchema = z.object({
  positionId: z.string().uuid(),
  sequenceNumber: z.number().int().positive(),
  name: z.string().min(1, 'Name is required'),
  typeId: z.string().uuid(),
  originalAssignmentId: z.string().uuid().optional(),
  schedulingLink: z.string().url().optional(),
  emailTemplate: z.string().optional(),
});

export const updateInterviewStepSchema = z.object({
  sequenceNumber: z.number().int().positive().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  typeId: z.string().uuid().optional(),
  originalAssignmentId: z.string().uuid().optional().nullable(),
  schedulingLink: z.string().url().optional().nullable(),
  emailTemplate: z.string().optional().nullable(),
});

export type CreateInterviewStepInput = z.infer<typeof createInterviewStepSchema>;
export type UpdateInterviewStepInput = z.infer<typeof updateInterviewStepSchema>; 