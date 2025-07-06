import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  unique,
  pgEnum,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

// This is your Drizzle schema file.
// You will define your database tables and relations here.

// Example (you can delete this once you start adding your own schemas):
// import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
//
// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   fullName: text('full_name'),
//   phone: varchar('phone', { length: 256 }),
// });

// Start adding your schemas below.

export const accountManagers = pgTable('account_managers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contactInfo: text('contact_info'),
  logo: text('logo'),
  accountManagerId: uuid('account_manager_id').notNull().references(() => accountManagers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const techStacks = pgTable('tech_stacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const positions = pgTable('positions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  title: text('title').notNull(),
  details: text('details'),
  jobAd: text('job_ad'),
  minSalary: integer('min_salary'),
  maxSalary: integer('max_salary'),
  culturalFitCriteria: text('cultural_fit_criteria'),
  accountManagerId: uuid('account_manager_id').notNull().references(() => accountManagers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const positionTechStacks = pgTable('position_tech_stacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  positionId: uuid('position_id').notNull().references(() => positions.id),
  techStackId: uuid('tech_stack_id').notNull().references(() => techStacks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const originalAssignments = pgTable('original_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  googleDocFileId: text('google_doc_file_id').notNull().unique(),
  driveFolderPath: text('drive_folder_path'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const interviewStepTypes = pgTable(
  'interview_step_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    clientId: uuid('client_id')
      .notNull()
      .references(() => clients.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [unique('client_name_unq').on(table.clientId, table.name)],
);

export const interviewSteps = pgTable(
  'interview_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    positionId: uuid('position_id')
      .notNull()
      .references(() => positions.id),
    sequenceNumber: integer('sequence_number').notNull(),
    name: text('name').notNull(),
    typeId: uuid('type_id')
      .notNull()
      .references(() => interviewStepTypes.id),
    originalAssignmentId: uuid('original_assignment_id').references(
      () => originalAssignments.id,
    ),
    schedulingLink: text('scheduling_link'),
    emailTemplate: text('email_template'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('position_sequence_unq').on(table.positionId, table.sequenceNumber),
  ],
);

export const candidates = pgTable('candidates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  resume_link: text('resume_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const candidateStatusEnum = pgEnum('candidate_status', [
  'Initial state',
  'Invitation Sent',
  'Interview Scheduled',
  'Waiting for evaluation',
  'Needs additional review',
  'Needs final report',
  'Final report sent',
  'Passed',
  'Needs to be re-interviewed',
  'Hold',
  'Rejected',
  'Archived',
]);

export const candidateApplications = pgTable(
  'candidate_applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidates.id),
    positionId: uuid('position_id')
      .notNull()
      .references(() => positions.id),
    status: candidateStatusEnum('status').default('Initial state').notNull(),
    status_updated_at: timestamp('status_updated_at').defaultNow().notNull(),
    client_notified_at: timestamp('client_notified_at'),
    currentInterviewStepId: uuid('current_interview_step_id').references(
      () => interviewSteps.id,
    ),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique('candidate_position_unq').on(table.candidateId, table.positionId),
  ],
);

export const interviewEvents = pgTable('interview_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateApplicationId: uuid('candidate_application_id')
    .notNull()
    .references(() => candidateApplications.id),
  eventName: text('event_name').notNull(),
  // Can add more specific FKs later, e.g., to evaluations, steps, etc.
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const interviewers = pgTable('interviewers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  schedulingToolIdentifier: text('scheduling_tool_identifier'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const interviewerTechStacks = pgTable('interviewer_tech_stacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  interviewerId: uuid('interviewer_id')
    .notNull()
    .references(() => interviewers.id),
  techStackId: uuid('tech_stack_id')
    .notNull()
    .references(() => techStacks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const interviewAssignments = pgTable("interview_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateApplicationId: uuid("candidate_application_id")
    .notNull()
    .references(() => candidateApplications.id),
  interviewStepId: uuid("interview_step_id")
    .notNull()
    .references(() => interviewSteps.id),
  interviewerId: uuid("interviewer_id").references(() => interviewers.id),
  resourceUrl: text("resource_url"),
  resourceIdentifier: text("resource_identifier"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  resourceDeletedAt: timestamp("resource_deleted_at"),
});

export const evaluationOutcomeEnum = pgEnum("evaluation_outcome", [
  "Strong Hire",
  "Hire",
  "Fail",
  "Hold",
]);

export const evaluationFormatEnum = pgEnum("evaluation_format", [
  "structured_json",
  "drive_doc",
]);

export const evaluations = pgTable("evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  interviewAssignmentId: uuid("interview_assignment_id")
    .notNull()
    .references(() => interviewAssignments.id)
    .unique(),
  evaluatorId: uuid("evaluator_id")
    .notNull()
    .references(() => interviewers.id),
  outcome: evaluationOutcomeEnum("outcome").notNull(),
  format: evaluationFormatEnum("format").notNull(),
  structuredData: jsonb("structured_data"),
  driveDocUrl: text("drive_doc_url"),
  recordingUrl: text("recording_url"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
