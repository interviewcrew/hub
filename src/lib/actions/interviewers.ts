'use server';

import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import * as schema from '@/db/schema';
import {
  createInterviewerSchema,
  updateInterviewerSchema,
  CreateInterviewerInput,
  UpdateInterviewerInput,
} from '@/lib/validators/interviewer';

export async function getInterviewer(id: string) {
  try {
    const interviewer = await db.query.interviewers.findFirst({
      where: eq(schema.interviewers.id, id),
      with: {
        techStacks: {
          with: {
            techStack: true,
          },
        },
      },
    });

    if (!interviewer) {
      return { success: false, error: 'Interviewer not found' };
    }
    return { success: true, data: interviewer };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch interviewer' };
  }
}

export async function createInterviewer(input: CreateInterviewerInput) {
  try {
    const { techStacks: techStacksNames, ...interviewerData } =
      createInterviewerSchema.parse(input);

    const newInterviewer = await db.transaction(async (transactions) => {
      const [created] = await transactions
        .insert(schema.interviewers)
        .values(interviewerData)
        .returning();

      if (techStacksNames && techStacksNames.length > 0) {
        const lowerCaseTechStacks = techStacksNames.map((name) =>
          name.toLowerCase(),
        );
        const existingStacks = await transactions.query.techStacks.findMany({
          where: inArray(schema.techStacks.name, lowerCaseTechStacks),
        });
        const existingStackNames = new Set(existingStacks.map((s) => s.name));
        const newStackNames = lowerCaseTechStacks.filter(
          (name) => !existingStackNames.has(name),
        );

        let newStacks: schema.TechStack[] = [];
        if (newStackNames.length > 0) {
          newStacks = await transactions
            .insert(schema.techStacks)
            .values(newStackNames.map((name) => ({ name })))
            .returning();
        }

        const allStackIds = [
          ...existingStacks.map((s) => s.id),
          ...newStacks.map((s) => s.id),
        ];

        await transactions.insert(schema.interviewerTechStacks).values(
          allStackIds.map((stackId) => ({
            interviewerId: created.id,
            techStackId: stackId,
          })),
        );
      }
      return created;
    });

    revalidatePath('/interviewers');
    return getInterviewer(newInterviewer.id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create interviewer' };
  }
}

export async function getInterviewers() {
  try {
    const allInterviewers = await db.query.interviewers.findMany({
      with: {
        techStacks: {
          with: {
            techStack: true,
          },
        },
      },
    });

    return { success: true, data: allInterviewers };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch interviewers' };
  }
}

export async function updateInterviewer(
  id: string,
  input: UpdateInterviewerInput,
) {
  try {
    const { techStacks: techStackNames, ...interviewerData } =
      updateInterviewerSchema.parse(input);

    await db.transaction(async (transaction) => {
      if (Object.keys(interviewerData).length > 0) {
        await transaction
          .update(schema.interviewers)
          .set(interviewerData)
          .where(eq(schema.interviewers.id, id));
      }

      if (techStackNames) {
        await transaction
          .delete(schema.interviewerTechStacks)
          .where(eq(schema.interviewerTechStacks.interviewerId, id));

        if (techStackNames.length > 0) {
          const lowerCaseTechStacks = techStackNames.map((name) =>
            name.toLowerCase(),
          );
          const existingStacks = await transaction.query.techStacks.findMany({
            where: inArray(schema.techStacks.name, lowerCaseTechStacks),
          });
          const existingStackNames = new Set(
            existingStacks.map((s) => s.name),
          );
          const newStackNames = lowerCaseTechStacks.filter(
            (name) => !existingStackNames.has(name),
          );

          let newStacks: schema.TechStack[] = [];
          if (newStackNames.length > 0) {
            newStacks = await transaction
              .insert(schema.techStacks)
              .values(newStackNames.map((name) => ({ name })))
              .returning();
          }

          const allStackIds = [
            ...existingStacks.map((s) => s.id),
            ...newStacks.map((s) => s.id),
          ];

          await transaction.insert(schema.interviewerTechStacks).values(
            allStackIds.map((stackId) => ({
              interviewerId: id,
              techStackId: stackId,
            })),
          );
        }
      }
    });

    revalidatePath('/interviewers');
    revalidatePath(`/interviewers/${id}`);

    return getInterviewer(id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update interviewer' };
  }
}

export async function deleteInterviewer(id: string) {
  try {
    const deleted = await db.transaction(async (tx) => {
      await tx
        .delete(schema.interviewerTechStacks)
        .where(eq(schema.interviewerTechStacks.interviewerId, id));

      const [deletedInterviewer] = await tx
        .delete(schema.interviewers)
        .where(eq(schema.interviewers.id, id))
        .returning();

      if (!deletedInterviewer) {
        throw new Error('Interviewer not found');
      }
      return deletedInterviewer;
    });

    revalidatePath('/interviewers');
    return { success: true, data: deleted };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete interviewer' };
  }
} 