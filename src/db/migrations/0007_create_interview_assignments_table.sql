CREATE TABLE "interview_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_application_id" uuid NOT NULL,
	"interview_step_id" uuid NOT NULL,
	"interviewer_id" uuid,
	"resource_url" text,
	"resource_identifier" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"resource_deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "interview_assignments" ADD CONSTRAINT "interview_assignments_candidate_application_id_candidate_applications_id_fk" FOREIGN KEY ("candidate_application_id") REFERENCES "public"."candidate_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_assignments" ADD CONSTRAINT "interview_assignments_interview_step_id_interview_steps_id_fk" FOREIGN KEY ("interview_step_id") REFERENCES "public"."interview_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_assignments" ADD CONSTRAINT "interview_assignments_interviewer_id_interviewers_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."interviewers"("id") ON DELETE no action ON UPDATE no action;