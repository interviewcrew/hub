CREATE TABLE "original_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"google_doc_file_id" text NOT NULL,
	"drive_folder_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "original_assignments_name_unique" UNIQUE("name"),
	CONSTRAINT "original_assignments_google_doc_file_id_unique" UNIQUE("google_doc_file_id")
);
