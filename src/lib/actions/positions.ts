'use server';

import { db } from '@/lib/db';
import {
  CreatePositionInput,
  createPositionSchema,
  UpdatePositionInput,
  updatePositionSchema,
} from '@/lib/validators/position';
import { positions, positionTechStacks, techStacks } from '@/db/schema';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createPosition(input: CreatePositionInput) {
  try {
    const { techStacks: techStackNames, ...positionData } =
      createPositionSchema.parse(input);

    const newPosition = await db.transaction(async (transaction) => {
      const [createdPosition] = await transaction
        .insert(positions)
        .values(positionData)
        .returning();

      if (techStackNames && techStackNames.length > 0) {
        const lowerCaseTechStacks = techStackNames.map((name) =>
          name.toLowerCase(),
        );
        const existingStacks = await transaction.query.techStacks.findMany({
          where: inArray(techStacks.name, lowerCaseTechStacks),
        });

        const existingStackNames = new Set(
          existingStacks.map((stack) => stack.name),
        );
        const newStackNames = lowerCaseTechStacks.filter(
          (name) => !existingStackNames.has(name),
        );

        let newStacks: { id: string }[] = [];
        if (newStackNames.length > 0) {
          newStacks = await transaction
            .insert(techStacks)
            .values(newStackNames.map((name) => ({ name })))
            .returning({ id: techStacks.id });
        }

        const allStackIds = [
          ...existingStacks.map((stack) => stack.id),
          ...newStacks.map((stack) => stack.id),
        ];

        if (allStackIds.length > 0) {
          const techStackLinks = allStackIds.map((stackId) => ({
            positionId: createdPosition.id,
            techStackId: stackId,
          }));
          await transaction.insert(positionTechStacks).values(techStackLinks);
        }
      }

      return createdPosition;
    });

    revalidatePath('/positions');
    return getPosition(newPosition.id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create position' };
  }
}

export async function getPosition(id: string) {
  try {
    const position = await db.query.positions.findFirst({
      where: eq(positions.id, id),
      with: {
        positionTechStacks: {
          with: {
            techStack: true,
          },
        },
      },
    });

    if (!position) {
      return { success: false, error: 'Position not found' };
    }
    return { success: true, data: position };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch position' };
  }
}

export async function getPositions() {
  try {
    const allPositions = await db.query.positions.findMany({
      with: {
        positionTechStacks: {
          with: {
            techStack: true,
          },
        },
      },
    });

    return { success: true, data: allPositions };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to fetch positions' };
  }
}

export async function updatePosition(id: string, input: UpdatePositionInput) {
  try {
    const { techStacks: techStackNames, ...positionData } =
      updatePositionSchema.parse(input);

    await db.transaction(async (transaction) => {
      if (Object.keys(positionData).length > 0) {
        await transaction
          .update(positions)
          .set(positionData)
          .where(eq(positions.id, id));
      }

      if (techStackNames) {
        await transaction
          .delete(positionTechStacks)
          .where(eq(positionTechStacks.positionId, id));

        if (techStackNames.length > 0) {
          const lowerCaseTechStacks = techStackNames.map((name) =>
            name.toLowerCase(),
          );
          const existingStacks = await transaction.query.techStacks.findMany({
            where: inArray(techStacks.name, lowerCaseTechStacks),
          });

          const existingStackNames = new Set(
            existingStacks.map((stack) => stack.name),
          );
          const newStackNames = lowerCaseTechStacks.filter(
            (name) => !existingStackNames.has(name),
          );

          let newStacks: { id: string }[] = [];
          if (newStackNames.length > 0) {
            newStacks = await transaction
              .insert(techStacks)
              .values(newStackNames.map((name) => ({ name })))
              .returning({ id: techStacks.id });
          }

          const allStackIds = [
            ...existingStacks.map((stack) => stack.id),
            ...newStacks.map((stack) => stack.id),
          ];

          if (allStackIds.length > 0) {
            await transaction.insert(positionTechStacks).values(
              allStackIds.map((stackId) => ({
                positionId: id,
                techStackId: stackId,
              })),
            );
          }
        }
      }
    });

    revalidatePath('/positions');
    revalidatePath(`/positions/${id}`);

    return getPosition(id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to update position' };
  }
}

export async function deletePosition(id: string) {
  try {
    const deletedPosition = await db.transaction(async (transaction) => {
      await transaction
        .delete(positionTechStacks)
        .where(eq(positionTechStacks.positionId, id));

      const [deleted] = await transaction
        .delete(positions)
        .where(eq(positions.id, id))
        .returning();

      if (!deleted) {
        throw new Error('Position not found');
      }
      return deleted;
    });

    revalidatePath('/positions');
    return { success: true, data: deletedPosition };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to delete position' };
  }
}
