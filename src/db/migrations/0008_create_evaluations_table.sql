CREATE TYPE "public"."evaluation_format" AS ENUM('structured_json', 'drive_doc');--> statement-breakpoint
CREATE TYPE "public"."evaluation_outcome" AS ENUM('Strong Hire', 'Hire', 'Fail', 'Hold');--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interview_assignment_id" uuid NOT NULL,
	"evaluator_id" uuid NOT NULL,
	"outcome" "evaluation_outcome" NOT NULL,
	"format" "evaluation_format" NOT NULL,
	"structured_data" jsonb,
	"drive_doc_url" text,
	"recording_url" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evaluations_interview_assignment_id_unique" UNIQUE("interview_assignment_id")
);
--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_interview_assignment_id_interview_assignments_id_fk" FOREIGN KEY ("interview_assignment_id") REFERENCES "public"."interview_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_interviewers_id_fk" FOREIGN KEY ("evaluator_id") REFERENCES "public"."interviewers"("id") ON DELETE no action ON UPDATE no action;