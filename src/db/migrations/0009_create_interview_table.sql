CREATE TABLE "interviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_application_id" uuid NOT NULL,
	"interview_step_id" uuid NOT NULL,
	"interviewer_id" uuid,
	"recording_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evaluations" RENAME COLUMN "interview_assignment_id" TO "interview_id";--> statement-breakpoint
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_interview_assignment_id_unique";--> statement-breakpoint
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_interview_assignment_id_interview_assignments_id_fk";
--> statement-breakpoint
ALTER TABLE "interview_assignments" DROP CONSTRAINT "interview_assignments_candidate_application_id_candidate_applications_id_fk";
--> statement-breakpoint
ALTER TABLE "interview_assignments" DROP CONSTRAINT "interview_assignments_interview_step_id_interview_steps_id_fk";
--> statement-breakpoint
ALTER TABLE "interview_assignments" DROP CONSTRAINT "interview_assignments_interviewer_id_interviewers_id_fk";
--> statement-breakpoint
ALTER TABLE "evaluations" ALTER COLUMN "outcome" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."evaluation_outcome";--> statement-breakpoint
CREATE TYPE "public"."evaluation_outcome" AS ENUM('Strong Hire', 'Hire', 'No Hire', 'Hold');--> statement-breakpoint
ALTER TABLE "evaluations" ALTER COLUMN "outcome" SET DATA TYPE "public"."evaluation_outcome" USING "outcome"::"public"."evaluation_outcome";--> statement-breakpoint
ALTER TABLE "interview_assignments" ADD COLUMN "interview_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidate_application_id_candidate_applications_id_fk" FOREIGN KEY ("candidate_application_id") REFERENCES "public"."candidate_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interview_step_id_interview_steps_id_fk" FOREIGN KEY ("interview_step_id") REFERENCES "public"."interview_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."interviewers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_assignments" ADD CONSTRAINT "interview_assignments_interview_id_interviews_id_fk" FOREIGN KEY ("interview_id") REFERENCES "public"."interviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" DROP COLUMN "recording_url";--> statement-breakpoint
ALTER TABLE "interview_assignments" DROP COLUMN "candidate_application_id";--> statement-breakpoint
ALTER TABLE "interview_assignments" DROP COLUMN "interview_step_id";--> statement-breakpoint
ALTER TABLE "interview_assignments" DROP COLUMN "interviewer_id";