import { z } from 'zod';

export const createOriginalAssignmentSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(1, 'Name is required'),
  googleDocFileId: z
    .string({ required_error: 'Google Doc File ID is required' })
    .min(1, 'Google Doc File ID is required'),
  driveFolderPath: z.string().optional(),
});

export const updateOriginalAssignmentSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  googleDocFileId: z
    .string()
    .min(1, 'Google Doc File ID is required')
    .optional(),
  driveFolderPath: z.string().optional(),
});

export type CreateOriginalAssignmentInput = z.infer<
  typeof createOriginalAssignmentSchema
>;
export type UpdateOriginalAssignmentInput = z.infer<
  typeof updateOriginalAssignmentSchema
>;
