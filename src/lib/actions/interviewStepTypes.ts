'use server';

import { db } from '@/lib/db';
import { interviewStepTypes } from '@/db/schema';
import {
  createInterviewStepTypeSchema,
  updateInterviewStepTypeSchema,
  CreateInterviewStepTypeInput,
  UpdateInterviewStepTypeInput,
} from '@/lib/validators/interviewStepType';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createInterviewStepType(
  input: CreateInterviewStepTypeInput,
) {
  try {
    const validatedData = createInterviewStepTypeSchema.parse(input);

    const [newInterviewStepType] = await db
      .insert(interviewStepTypes)
      .values(validatedData)
      .returning();

    revalidatePath(`/clients/${validatedData.clientId}/interview-step-types`);

    return { success: true, data: newInterviewStepType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to create interview step type' };
  }
}

export async function getInterviewStepTypes(clientId: string) {
  try {
    const stepTypes = await db.query.interviewStepTypes.findMany({
      where: eq(interviewStepTypes.clientId, clientId),
    });
    return { success: true, data: stepTypes };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to fetch interview step types' };
  }
}

export async function getInterviewStepType(id: string, clientId: string) {
  try {
    const stepType = await db.query.interviewStepTypes.findFirst({
      where: and(
        eq(interviewStepTypes.id, id),
        eq(interviewStepTypes.clientId, clientId),
      ),
    });

    if (!stepType) {
      return { success: false, error: 'Interview step type not found' };
    }

    return { success: true, data: stepType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to fetch interview step type' };
  }
}

export async function updateInterviewStepType(
  id: string,
  clientId: string,
  input: UpdateInterviewStepTypeInput,
) {
  try {
    const validatedData = updateInterviewStepTypeSchema.parse(input);

    const stepTypeExists = await db.query.interviewStepTypes.findFirst({
      where: and(
        eq(interviewStepTypes.id, id),
        eq(interviewStepTypes.clientId, clientId),
      ),
    });

    if (!stepTypeExists) {
      return { success: false, error: 'Interview step type not found' };
    }

    if (Object.keys(validatedData).length === 0) {
      return { success: true, data: stepTypeExists };
    }

    const [updatedStepType] = await db
      .update(interviewStepTypes)
      .set(validatedData)
      .where(eq(interviewStepTypes.id, id))
      .returning();

    revalidatePath(`/clients/${clientId}/interview-step-types`);

    return { success: true, data: updatedStepType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to update interview step type' };
  }
}

export async function deleteInterviewStepType(id: string, clientId: string) {
  try {
    const stepTypeExists = await db.query.interviewStepTypes.findFirst({
      where: and(
        eq(interviewStepTypes.id, id),
        eq(interviewStepTypes.clientId, clientId),
      ),
    });

    if (!stepTypeExists) {
      return { success: false, error: 'Interview step type not found' };
    }

    await db.delete(interviewStepTypes).where(eq(interviewStepTypes.id, id));

    revalidatePath(`/clients/${clientId}/interview-step-types`);

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to delete interview step type' };
  }
}
