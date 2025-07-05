import { z } from 'zod';
import { candidateStatusEnum } from '@/db/schema';

// Schema for the person/candidate entity
export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  resume_link: z.string().url('Must be a valid URL').optional(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

// Schema for the application entity
export const createCandidateApplicationSchema = z.object({
  candidateId: z.string().uuid(),
  positionId: z.string().uuid(),
});

export const updateCandidateApplicationSchema = z.object({
  status: z.enum(candidateStatusEnum.enumValues).optional(),
  client_notified_at: z.date().optional().nullable(),
  currentInterviewStepId: z.string().uuid().optional().nullable(),
}); 