'use server';

import { db } from '@/lib/db';
import {
  candidateApplications,
  interviewEvents,
  candidates,
  CANDIDATE_STATUSES,
  INTERVIEW_EVENT_NAMES,
  type NewCandidateApplication,
  Candidate,
} from '@/db/schema';
import {
  createCandidateApplicationSchema,
  updateCandidateApplicationSchema,
  CreateCandidateApplicationInput,
  UpdateCandidateApplicationInput,
} from '@/lib/validators/candidate';
import { and, eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createCandidateApplication(
  input: CreateCandidateApplicationInput,
) {
  try {
    const { positionId, candidate: candidateData } =
      createCandidateApplicationSchema.parse(input);

    const {
      name: candidateName,
      email: candidateEmail,
      resume_link: resumeLink,
    } = candidateData;

    const newApplication = await db.transaction(async (transaction) => {
      let candidate: Candidate | undefined;
      const existingCandidates = await transaction
        .select()
        .from(candidates)
        .where(eq(candidates.email, candidateEmail));
      candidate = existingCandidates[0];

      if (!candidate) {
        const newCandidates = await transaction
          .insert(candidates)
          .values({
            name: candidateName,
            email: candidateEmail,
            resume_link: resumeLink,
          })
          .returning();
        candidate = newCandidates[0];
      } else {
        const existingApplication =
          await transaction.query.candidateApplications.findFirst({
            where: and(
              eq(candidateApplications.candidateId, candidate.id),
              eq(candidateApplications.positionId, positionId),
            ),
          });
        if (existingApplication) {
          throw new Error(
            'This candidate has already applied for this position.',
          );
        }
      }

      if (!candidate) {
        throw new Error('Failed to create or find candidate.');
      }

      const [candidateApplication] = await transaction
        .insert(candidateApplications)
        .values({
          candidateId: candidate.id,
          positionId: positionId,
          status: CANDIDATE_STATUSES.INITIAL_STATE,
        })
        .returning();

      await transaction.insert(interviewEvents).values({
        candidateApplicationId: candidateApplication.id,
        eventName: INTERVIEW_EVENT_NAMES.CANDIDATE_APPLIED,
        details: { notes: `Application received for position.` },
      });

      return candidateApplication;
    });

    revalidatePath(`/positions/${newApplication.positionId}`);

    return { success: true, data: newApplication };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Failed to create candidate application',
    };
  }
}

export async function getCandidateApplication(id: string) {
  try {
    const application = await db.query.candidateApplications.findFirst({
      where: eq(candidateApplications.id, id),
      with: {
        candidate: true,
        interviewEvents: {
          orderBy: [desc(interviewEvents.createdAt)],
        },
      },
    });

    if (!application) {
      return { success: false, error: 'Candidate application not found' };
    }

    return { success: true, data: application };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Failed to fetch candidate application',
    };
  }
}

export async function getCandidateApplicationsForPosition(positionId: string) {
  try {
    const applications = await db.query.candidateApplications.findMany({
      where: eq(candidateApplications.positionId, positionId),
      with: {
        candidate: true,
      },
      orderBy: [desc(candidateApplications.createdAt)],
    });

    return { success: true, data: applications };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Failed to fetch candidate applications for position',
    };
  }
}

export async function updateCandidateApplication(
  id: string,
  input: UpdateCandidateApplicationInput,
) {
  try {
    const data = updateCandidateApplicationSchema.parse(input);

    const updatedApplication = await db.transaction(async (transaction) => {
      const currentApplication =
        await transaction.query.candidateApplications.findFirst({
          where: eq(candidateApplications.id, id),
        });

      if (!currentApplication) {
        throw new Error('Candidate application not found');
      }

      const updateData: Partial<NewCandidateApplication> = {
        ...data,
      };

      if (data.status && data.status !== currentApplication.status) {
        updateData.status_updated_at = new Date();
        await transaction.insert(interviewEvents).values({
          candidateApplicationId: id,
          eventName: INTERVIEW_EVENT_NAMES.STATUS_CHANGED,
          details: {
            notes: `Status changed from ${currentApplication.status} to ${data.status}.`,
            oldStatus: currentApplication.status,
            newStatus: data.status,
          },
        });
      }

      const [app] = await transaction
        .update(candidateApplications)
        .set(updateData)
        .where(eq(candidateApplications.id, id))
        .returning();

      return app;
    });

    revalidatePath(`/positions/${updatedApplication.positionId}`);

    return { success: true, data: updatedApplication };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: JSON.stringify(error.issues) };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Failed to update candidate application',
    };
  }
}

export async function deleteCandidateApplication(id: string) {
  try {
    const deletedApplication = await db.transaction(async (transaction) => {
      // First delete all dependent interview_events
      await transaction
        .delete(interviewEvents)
        .where(eq(interviewEvents.candidateApplicationId, id));

      // Then delete the candidate application
      const [deleted] = await transaction
        .delete(candidateApplications)
        .where(eq(candidateApplications.id, id))
        .returning();

      if (!deleted) {
        throw new Error('Candidate application not found');
      }

      return deleted;
    });

    revalidatePath(`/positions/${deletedApplication.positionId}`);

    return { success: true, data: deletedApplication };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: 'Failed to delete candidate application',
    };
  }
}
