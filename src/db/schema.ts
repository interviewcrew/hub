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
import { relations } from 'drizzle-orm';

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

export type AccountManager = typeof accountManagers.$inferSelect;
export type NewAccountManager = typeof accountManagers.$inferInsert;

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contactInfo: text('contact_info'),
  logo: text('logo'),
  accountManagerId: uuid('account_manager_id').notNull().references(() => accountManagers.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export const techStacks = pgTable('tech_stacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export type TechStack = typeof techStacks.$inferSelect;
export type NewTechStack = typeof techStacks.$inferInsert;

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

export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;

export const positionTechStacks = pgTable('position_tech_stacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  positionId: uuid('position_id').notNull().references(() => positions.id),
  techStackId: uuid('tech_stack_id').notNull().references(() => techStacks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PositionTechStack = typeof positionTechStacks.$inferSelect;
export type NewPositionTechStack = typeof positionTechStacks.$inferInsert;

export const positionsRelations = relations(positions, ({ many }) => ({
  positionTechStacks: many(positionTechStacks),
}));

export const techStacksRelations = relations(techStacks, ({ many }) => ({
  positionTechStacks: many(positionTechStacks),
}));

export const positionTechStacksRelations = relations(
  positionTechStacks,
  ({ one }) => ({
    position: one(positions, {
      fields: [positionTechStacks.positionId],
      references: [positions.id],
    }),
    techStack: one(techStacks, {
      fields: [positionTechStacks.techStackId],
      references: [techStacks.id],
    }),
  }),
);

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

export type OriginalAssignment = typeof originalAssignments.$inferSelect;
export type NewOriginalAssignment = typeof originalAssignments.$inferInsert;

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

export type InterviewStepType = typeof interviewStepTypes.$inferSelect;
export type NewInterviewStepType = typeof interviewStepTypes.$inferInsert;

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

export type InterviewStep = typeof interviewSteps.$inferSelect;
export type NewInterviewStep = typeof interviewSteps.$inferInsert;

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

export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;

export const CANDIDATE_STATUSES = {
  INITIAL_STATE: 'Initial state',
  INVITATION_SENT: 'Invitation Sent',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  WAITING_FOR_EVALUATION: 'Waiting for evaluation',
  NEEDS_ADDITIONAL_REVIEW: 'Needs additional review',
  NEEDS_FINAL_REPORT: 'Needs final report',
  FINAL_REPORT_SENT: 'Final report sent',
  PASSED: 'Passed',
  NEEDS_TO_BE_RE_INTERVIEWED: 'Needs to be re-interviewed',
  HOLD: 'Hold',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
} as const;

const statuses = Object.values(CANDIDATE_STATUSES) as [string, ...string[]];
export const candidateStatusEnum = pgEnum('candidate_status', statuses);

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
    status: candidateStatusEnum('status').default(CANDIDATE_STATUSES.INITIAL_STATE).notNull(),
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

export type CandidateApplication = typeof candidateApplications.$inferSelect;
export type NewCandidateApplication = typeof candidateApplications.$inferInsert;

export const candidateApplicationsRelations = relations(
  candidateApplications,
  ({ one, many }) => ({
    candidate: one(candidates, {
      fields: [candidateApplications.candidateId],
      references: [candidates.id],
    }),
    position: one(positions, {
      fields: [candidateApplications.positionId],
      references: [positions.id],
    }),
    currentInterviewStep: one(interviewSteps, {
      fields: [candidateApplications.currentInterviewStepId],
      references: [interviewSteps.id],
    }),
    interviewEvents: many(interviewEvents),
  }),
);

export const candidatesRelations = relations(candidates, ({ many }) => ({
  applications: many(candidateApplications),
}));

export const INTERVIEW_EVENT_NAMES = {
  CANDIDATE_APPLIED: 'CANDIDATE_APPLIED',
  STATUS_CHANGED: 'STATUS_CHANGED',
} as const;

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

export type InterviewEvent = typeof interviewEvents.$inferSelect;
export type NewInterviewEvent = typeof interviewEvents.$inferInsert;

export const interviewEventsRelations = relations(interviewEvents, ({ one }) => ({
  candidateApplication: one(candidateApplications, {
    fields: [interviewEvents.candidateApplicationId],
    references: [candidateApplications.id],
  }),
}));

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

export type Interviewer = typeof interviewers.$inferSelect;
export type NewInterviewer = typeof interviewers.$inferInsert;

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

export type InterviewerTechStack = typeof interviewerTechStacks.$inferSelect;
export type NewInterviewerTechStack = typeof interviewerTechStacks.$inferInsert;


export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateApplicationId: uuid("candidate_application_id")
    .notNull()
    .references(() => candidateApplications.id),
  interviewStepId: uuid("interview_step_id")
    .notNull()
    .references(() => interviewSteps.id),
  interviewerId: uuid("interviewer_id").references(() => interviewers.id),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Interview = typeof interviews.$inferSelect;
export type NewInterview = typeof interviews.$inferInsert;

export const interviewAssignments = pgTable("interview_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  interviewId: uuid("interview_id")
    .notNull()
    .references(() => interviews.id),
  resourceUrl: text("resource_url"),
  resourceIdentifier: text("resource_identifier"),
  resourceDeletedAt: timestamp("resource_deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type InterviewAssignment = typeof interviewAssignments.$inferSelect;
export type NewInterviewAssignment = typeof interviewAssignments.$inferInsert;

export const EVALUATION_OUTCOMES = {
  STRONG_HIRE: 'Strong Hire',
  HIRE: 'Hire',
  NO_HIRE: 'No Hire',
  HOLD: 'Hold',
} as const;
const evaluationOutcomes = Object.values(EVALUATION_OUTCOMES) as [string, ...string[]];
export const evaluationOutcomeEnum = pgEnum('evaluation_outcome', evaluationOutcomes);

export const EVALUATION_FORMATS = {
  STRUCTURED_JSON: 'structured_json',
  DRIVE_DOC: 'drive_doc',
} as const;
const evaluationFormats = Object.values(EVALUATION_FORMATS) as [string, ...string[]];
export const evaluationFormatEnum = pgEnum('evaluation_format', evaluationFormats);

export const evaluations = pgTable('evaluations', {
  id: uuid('id').defaultRandom().primaryKey(),
  interviewId: uuid('interview_id')
    .notNull()
    .references(() => interviews.id),
  evaluatorId: uuid('evaluator_id')
    .notNull()
    .references(() => interviewers.id),
  outcome: evaluationOutcomeEnum("outcome").notNull(),
  format: evaluationFormatEnum("format").notNull(),
  structuredData: jsonb("structured_data"),
  driveDocUrl: text("drive_doc_url"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type NewEvaluation = typeof evaluations.$inferInsert;

export const TRANSCRIPTION_TYPES = {
  LIVE: 'live',
  PROCESSED: 'processed',
} as const;
const transcriptionTypes = Object.values(TRANSCRIPTION_TYPES) as [string, ...string[]];
export const transcriptionTypeEnum = pgEnum('transcription_type', transcriptionTypes);

export const TRANSCRIPTION_PROCESSING_STATUSES = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
const transcriptionProcessingStatuses = Object.values(TRANSCRIPTION_PROCESSING_STATUSES) as [
  string,
  ...string[],
];
export const transcriptionProcessingStatusEnum = pgEnum(
  'transcription_processing_status',
  transcriptionProcessingStatuses,
);

export const transcriptions = pgTable('transcriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  interviewId: uuid('interview_id')
    .notNull()
    .references(() => interviews.id),
  type: transcriptionTypeEnum("type").notNull(),
  status: transcriptionProcessingStatusEnum("status").notNull(),
  content: jsonb("content"),
  provider: text("provider"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Transcription = typeof transcriptions.$inferSelect;
export type NewTranscription = typeof transcriptions.$inferInsert;
