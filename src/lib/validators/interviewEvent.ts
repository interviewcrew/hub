import { z } from 'zod';

// Schema for creating a new interview event
export const createInterviewEventSchema = z.object({
  candidateApplicationId: z.string().uuid(),
  eventName: z.string().min(1, 'Event name is required'),
  details: z.record(z.unknown()).optional(),
}); 

export type CreateInterviewEventInput = z.infer<typeof createInterviewEventSchema>;