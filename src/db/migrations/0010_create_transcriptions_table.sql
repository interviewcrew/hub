CREATE TYPE "public"."transcription_processing_status" AS ENUM('processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transcription_type" AS ENUM('live', 'processed');--> statement-breakpoint
CREATE TABLE "transcriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_id" uuid NOT NULL,
	"type" "transcription_type" NOT NULL,
	"status" "transcription_processing_status" NOT NULL,
	"content" jsonb,
	"provider" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;