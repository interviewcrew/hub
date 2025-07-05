import { z } from "zod";

export const createInterviewAssignmentSchema = z.object({
  candidateApplicationId: z.string().uuid(),
  interviewStepId: z.string().uuid(),
  interviewerId: z.string().uuid().optional(),
  resourceUrl: z.string().url().optional(),
  resourceIdentifier: z.string().optional(),
  resourceDeletedAt: z.date().optional(),
});

export const updateInterviewAssignmentSchema =
  createInterviewAssignmentSchema.partial(); 