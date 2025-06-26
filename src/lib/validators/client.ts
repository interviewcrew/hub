import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactInfo: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  accountManagerId: z.string().uuid('Invalid account manager ID'),
});

export const updateClientSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  contactInfo: z.string().optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  accountManagerId: z.string().uuid('Invalid account manager ID').optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>; 