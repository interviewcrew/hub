import { z } from "zod";
import { evaluationOutcomeEnum, evaluationFormatEnum } from "@/db/schema";

const evaluationObjectSchema = z.object({
  interviewAssignmentId: z.string().uuid(),
  evaluatorId: z.string().uuid(),
  outcome: z.enum(evaluationOutcomeEnum.enumValues),
  format: z.enum(evaluationFormatEnum.enumValues),
  structuredData: z.record(z.unknown()).optional(),
  driveDocUrl: z.string().url().optional(),
  recordingUrl: z.string().url().optional(),
  submittedAt: z.date().optional(),
});

const refinementDetails = {
  logic: (data: Partial<z.infer<typeof evaluationObjectSchema>>) => {
    // If format isn't being specified (e.g. in a partial update), we can't validate its dependency.
    if (data.format === undefined) {
      return true;
    }
    if (data.format === "structured_json") {
      return data.structuredData !== undefined;
    }
    if (data.format === "drive_doc") {
      return data.driveDocUrl !== undefined;
    }
    return false; // Should not be reached if format is a valid enum value
  },
  params: {
    message:
      "Based on the format, either structuredData or driveDocUrl must be provided.",
    path: ["structuredData", "driveDocUrl"],
  },
};

export const createEvaluationSchema = evaluationObjectSchema.refine(
  refinementDetails.logic,
  refinementDetails.params,
);

export const updateEvaluationSchema = evaluationObjectSchema
  .partial()
  .refine(refinementDetails.logic, refinementDetails.params); 