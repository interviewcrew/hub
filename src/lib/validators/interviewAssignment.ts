import { z } from "zod";

export const createInterviewAssignmentSchema = z.object({
  interviewId: z.string().uuid(),
  resourceUrl: z.string().url().optional(),
  resourceIdentifier: z.string().optional(),
  resourceDeletedAt: z.date().optional(),
});

export const updateInterviewAssignmentSchema =
  createInterviewAssignmentSchema.partial(); 

export type CreateInterviewAssignmentInput = z.infer<typeof createInterviewAssignmentSchema>;
export type UpdateInterviewAssignmentInput = z.infer<typeof updateInterviewAssignmentSchema>; 