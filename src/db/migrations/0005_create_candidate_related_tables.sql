CREATE TYPE "public"."candidate_status" AS ENUM('Initial state', 'Invitation Sent', 'Interview Scheduled', 'Waiting for evaluation', 'Needs additional review', 'Needs final report', 'Final report sent', 'Passed', 'Needs to be re-interviewed', 'Hold', 'Rejected', 'Archived');--> statement-breakpoint
CREATE TABLE "candidate_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"status" "candidate_status" DEFAULT 'Initial state' NOT NULL,
	"status_updated_at" timestamp DEFAULT now() NOT NULL,
	"client_notified_at" timestamp,
	"current_interview_step_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_position_unq" UNIQUE("candidate_id","position_id")
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"resume_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "interview_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_application_id" uuid NOT NULL,
	"event_name" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_current_interview_step_id_interview_steps_id_fk" FOREIGN KEY ("current_interview_step_id") REFERENCES "public"."interview_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_events" ADD CONSTRAINT "interview_events_candidate_application_id_candidate_applications_id_fk" FOREIGN KEY ("candidate_application_id") REFERENCES "public"."candidate_applications"("id") ON DELETE no action ON UPDATE no action;