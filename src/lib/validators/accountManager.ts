import { z } from 'zod';

export const createAccountManagerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
});

export const updateAccountManagerSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
});

export type CreateAccountManagerInput = z.infer<
  typeof createAccountManagerSchema
>;
export type UpdateAccountManagerInput = z.infer<
  typeof updateAccountManagerSchema
>;
