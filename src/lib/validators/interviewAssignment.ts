import { z } from "zod";

export const createInterviewAssignmentSchema = z.object({
  interviewId: z.string().uuid(),
  resourceUrl: z.string().url().optional(),
  resourceIdentifier: z.string().optional(),
  resourceDeletedAt: z.date().optional(),
});

export const updateInterviewAssignmentSchema =
  createInterviewAssignmentSchema.partial(); 