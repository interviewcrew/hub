'use server';

import { db } from '@/lib/db';
import {
  CreateOriginalAssignmentInput,
  createOriginalAssignmentSchema,
  UpdateOriginalAssignmentInput,
  updateOriginalAssignmentSchema,
} from '@/lib/validators/originalAssignment';
import { originalAssignments } from '@/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createOriginalAssignment(
  input: CreateOriginalAssignmentInput,
) {
  try {
    const data = createOriginalAssignmentSchema.parse(input);

    const [newAssignment] = await db
      .insert(originalAssignments)
      .values(data)
      .returning();

    revalidatePath('/assignments');
    return { success: true, data: newAssignment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Failed to create original assignment',
    };
  }
}

export async function getOriginalAssignment(id: string) {
  try {
    const [assignment] = await db
      .select()
      .from(originalAssignments)
      .where(eq(originalAssignments.id, id));

    if (!assignment) {
      return { success: false, error: 'Assignment not found' };
    }
    return { success: true, data: assignment };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch assignment' };
  }
}

export async function getOriginalAssignments() {
  try {
    const allAssignments = await db.select().from(originalAssignments);
    return { success: true, data: allAssignments };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch assignments' };
  }
}

export async function updateOriginalAssignment(
  id: string,
  input: UpdateOriginalAssignmentInput,
) {
  try {
    const data = updateOriginalAssignmentSchema.parse(input);

    const [updatedAssignment] = await db
      .update(originalAssignments)
      .set(data)
      .where(eq(originalAssignments.id, id))
      .returning();

    if (!updatedAssignment) {
      return { success: false, error: 'Assignment not found' };
    }

    revalidatePath('/assignments');
    revalidatePath(`/assignments/${id}`);

    return { success: true, data: updatedAssignment };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update assignment' };
  }
}

export async function deleteOriginalAssignment(id: string) {
  try {
    const [deletedAssignment] = await db
      .delete(originalAssignments)
      .where(eq(originalAssignments.id, id))
      .returning();

    if (!deletedAssignment) {
      return { success: false, error: 'Assignment not found' };
    }

    revalidatePath('/assignments');
    return { success: true, data: deletedAssignment };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete assignment' };
  }
}
