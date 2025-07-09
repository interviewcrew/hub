import { z } from "zod";
import {
  transcriptionProcessingStatusEnum,
  transcriptionTypeEnum,
} from "@/db/schema";

const transcriptionObjectSchema = z.object({
  interviewId: z.string().uuid(),
  type: z.enum(transcriptionTypeEnum.enumValues),
  status: z.enum(transcriptionProcessingStatusEnum.enumValues),
  content: z.record(z.unknown()).optional(),
  provider: z.string().optional(),
});

export const createTranscriptionSchema = transcriptionObjectSchema;

export const updateTranscriptionSchema = transcriptionObjectSchema.partial(); 