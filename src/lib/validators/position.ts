import { z } from 'zod';

export const createPositionSchema = z
  .object({
    clientId: z.string().uuid('Invalid client ID'),
    title: z.string().min(1, 'Title is required'),
    details: z.string().optional(),
    jobAd: z.string().optional(),
    techStacks: z.array(z.string()).optional(),
    minSalary: z
      .number()
      .int()
      .min(0, 'Minimum salary must be non-negative')
      .optional(),
    maxSalary: z
      .number()
      .int()
      .min(0, 'Maximum salary must be non-negative')
      .optional(),
    culturalFitCriteria: z.string().optional(),
    accountManagerId: z.string().uuid('Invalid account manager ID'),
  })
  .refine(
    (data) => {
      if (data.minSalary !== undefined && data.maxSalary !== undefined) {
        return data.maxSalary >= data.minSalary;
      }
      return true;
    },
    {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['maxSalary'],
    },
  );

export const updatePositionSchema = z
  .object({
    clientId: z.string().uuid('Invalid client ID').optional(),
    title: z.string().min(1, 'Title is required').optional(),
    details: z.string().optional(),
    jobAd: z.string().optional(),
    techStacks: z.array(z.string()).optional(),
    minSalary: z
      .number()
      .int()
      .min(0, 'Minimum salary must be non-negative')
      .optional(),
    maxSalary: z
      .number()
      .int()
      .min(0, 'Maximum salary must be non-negative')
      .optional(),
    culturalFitCriteria: z.string().optional(),
    accountManagerId: z.string().uuid('Invalid account manager ID').optional(),
  })
  .refine(
    (data) => {
      if (data.minSalary !== undefined && data.maxSalary !== undefined) {
        return data.maxSalary >= data.minSalary;
      }
      return true;
    },
    {
      message: 'Maximum salary must be greater than or equal to minimum salary',
      path: ['maxSalary'],
    },
  );

export type CreatePositionInput = z.infer<typeof createPositionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
