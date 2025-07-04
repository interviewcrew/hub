CREATE TABLE "interview_step_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"client_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_name_unq" UNIQUE("client_id","name")
);
--> statement-breakpoint
CREATE TABLE "interview_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"sequence_number" integer NOT NULL,
	"name" text NOT NULL,
	"type_id" uuid NOT NULL,
	"original_assignment_id" uuid,
	"scheduling_link" text,
	"email_template" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "position_sequence_unq" UNIQUE("position_id","sequence_number")
);
--> statement-breakpoint
ALTER TABLE "interview_step_types" ADD CONSTRAINT "interview_step_types_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_steps" ADD CONSTRAINT "interview_steps_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_steps" ADD CONSTRAINT "interview_steps_type_id_interview_step_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."interview_step_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_steps" ADD CONSTRAINT "interview_steps_original_assignment_id_original_assignments_id_fk" FOREIGN KEY ("original_assignment_id") REFERENCES "public"."original_assignments"("id") ON DELETE no action ON UPDATE no action;