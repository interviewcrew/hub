import { z } from 'zod';

export const createInterviewerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  schedulingToolIdentifier: z.string().optional(),
});

export const updateInterviewerSchema = createInterviewerSchema.partial().extend({
  isActive: z.boolean().optional(),
}); 