'use server';

import { db } from '@/lib/db';
import { interviewSteps, interviewStepTypes, positions } from '@/db/schema';
import {
  createInterviewStepSchema,
  updateInterviewStepSchema,
  CreateInterviewStepInput,
  UpdateInterviewStepInput,
} from '@/lib/validators/interviewStep';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createInterviewStep(input: CreateInterviewStepInput) {
  try {
    const interviewStepData = createInterviewStepSchema.parse(input);

    const { positionId, typeId } = interviewStepData;

    const positionExists = await db.query.positions.findFirst({
      where: eq(positions.id, positionId),
    });

    if (!positionExists) {
      throw new Error('Position not found');
    }

    if (typeId) {
      const typeExists = await db.query.interviewStepTypes.findFirst({
        where: and(
          eq(interviewStepTypes.id, typeId),
          eq(interviewStepTypes.clientId, positionExists.clientId),
        ),
      });

      if (!typeExists) {
        throw new Error('Interview step type not found for this client');
      }
    }

    const [newStep] = await db
      .insert(interviewSteps)
      .values(interviewStepData)
      .returning();

    revalidatePath(`/positions/${positionId}`);

    return { success: true, data: newStep };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create interview step' };
  }
}

export async function getInterviewStep(id: string) {
  try {
    const step = await db.query.interviewSteps.findFirst({
      where: eq(interviewSteps.id, id),
    });

    if (!step) {
      return { success: false, error: 'Interview step not found' };
    }

    return { success: true, data: step };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch interview step' };
  }
}

export async function getInterviewStepsForPosition(positionId: string) {
  try {
    const steps = await db.query.interviewSteps.findMany({
      where: eq(interviewSteps.positionId, positionId),
      orderBy: (steps, { asc }) => [asc(steps.sequenceNumber)],
    });

    return { success: true, data: steps };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch interview steps' };
  }
}

export async function updateInterviewStep(
  id: string,
  input: UpdateInterviewStepInput,
) {
  try {
    const data = updateInterviewStepSchema.parse(input);

    const currentStep = await db.query.interviewSteps.findFirst({
      where: eq(interviewSteps.id, id),
    });

    if (!currentStep) {
      throw new Error('Interview step not found');
    }

    if (data.typeId) {
      const positionExists = await db.query.positions.findFirst({
        where: eq(positions.id, currentStep.positionId),
      });

      if (!positionExists) {
        throw new Error('Position not found');
      }

      const typeExists = await db.query.interviewStepTypes.findFirst({
        where: and(
          eq(interviewStepTypes.id, data.typeId),
          eq(interviewStepTypes.clientId, positionExists.clientId),
        ),
      });

      if (!typeExists) {
        throw new Error('Interview step type not found for this client');
      }
    }

    const [updatedStep] = await db
      .update(interviewSteps)
      .set(data)
      .where(eq(interviewSteps.id, id))
      .returning();

    revalidatePath(`/positions/${currentStep.positionId}`);

    return { success: true, data: updatedStep };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update interview step' };
  }
}

export async function deleteInterviewStep(id: string) {
  try {
    const currentStep = await db.query.interviewSteps.findFirst({
      where: eq(interviewSteps.id, id),
    });

    if (!currentStep) {
      throw new Error('Interview step not found');
    }

    const [deletedStep] = await db
      .delete(interviewSteps)
      .where(eq(interviewSteps.id, id))
      .returning();

    revalidatePath(`/positions/${currentStep.positionId}`);

    return { success: true, data: deletedStep };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete interview step' };
  }
}
