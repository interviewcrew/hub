# InterviewCrew MVP: Project Checklist

This checklist is derived from the "InterviewCrew MVP: Development Blueprint & LLM Prompts" document.

## Phase 1: Project Foundation & Core Schemas

### [x] Prompt 1.1: Initialize Next.js Project
- [x] Initialize Next.js project "interview-crew-platform" with TypeScript
- [x] Set up Tailwind CSS
- [x] Ensure local run (npm run dev)
- [x] Create basic README.md

### [x] Prompt 1.2: Install and Configure Core Dev Dependencies
- [x] Install Drizzle ORM, Drizzle Kit, pg
- [x] Install Zod
- [x] Install Vitest, @vitest/ui, jsdom
- [x] Configure Drizzle Kit (drizzle.config.ts, package.json scripts)
- [x] Configure Vitest (vitest.config.ts, package.json script)
- [x] Initialize shadcn/ui (npx shadcn@latest init, configure tailwind.config.ts, globals.css)

### [x] Prompt 1.3: Basic Project Structure and DB Connection
- [x] Create directory structure (app, components/ui, lib/db.ts, lib/utils.ts, db/schema.ts, services, app/api)
- [x] Implement Drizzle client setup in src/lib/db.ts (env vars for DB connection)
- [x] Create initial empty src/db/schema.ts
- [x] Generate initial empty migration (npm run db:generate)

## Phase 2: Core Entity Schemas & Basic CRUD APIs (Account Management Focus)

### [x] Prompt 2.1: AccountManager Schema and Zod Validation
- [x] Define AccountManager Drizzle schema (accountManagers table)
- [x] Create AccountManager Zod schemas (createAccountManagerSchema, updateAccountManagerSchema) in src/lib/validators/accountManager.ts
- [x] Write unit tests for Zod schemas in src/lib/validators/accountManager.test.ts
- [x] Generate database migration (create_account_managers_table)
- [x] Apply migration

### [x] Prompt 2.2: Client Schema and Zod Validation
- [x] Define Client Drizzle schema (clients table with FK to accountManagers)
- [x] Create Client Zod schemas (createClientSchema, updateClientSchema) in src/lib/validators/client.ts
- [x] Write unit tests for Zod schemas in src/lib/validators/client.test.ts
- [x] Generate database migration (create_clients_table)
- [x] Apply migration

### [x] Prompt 2.3: Position Schema and Zod Validation
- [x] Define Position Drizzle schema (positions table with FKs to clients, accountManagers)
- [x] Create Position Zod schemas (createPositionSchema, updatePositionSchema) in src/lib/validators/position.ts
- [x] Write unit tests for Zod schemas in src/lib/validators/position.test.ts
- [x] Generate database migration (create_positions_table)
- [x] Apply migration

### [x] Prompt 2.4: Basic API Setup & AccountManager CRUD Endpoints
- [x] Create AccountManager CRUD Server Actions (createAccountManager, getAccountManagers, getAccountManager, updateAccountManager, deleteAccountManager) in src/lib/actions/accountManagers.ts
- [x] Implement Server Actions with Drizzle, Zod validation, error handling
- [x] Write unit tests for Server Actions in src/lib/actions/accountManagers.test.ts

### [x] Prompt 2.5: Client CRUD Endpoints
- [x] Create Client CRUD Server Actions (createClient, getClients, getClient, updateClient, deleteClient) in src/lib/actions/clients.ts
- [x] Implement Server Actions with Drizzle, Zod validation, error handling (ensure accountManagerId exists on create)
- [x] Write unit tests for Server Actions in src/lib/actions/clients.test.ts

## Phase 3: Schemas for Interview Structure & Management

### [x] Prompt 3.1: OriginalAssignment Schema and Zod Validation
- [x] Define OriginalAssignment Drizzle schema (originalAssignments table)
- [x] Create OriginalAssignment Zod schemas (createOriginalAssignmentSchema, updateOriginalAssignmentSchema) in src/lib/validators/originalAssignment.ts
- [x] Write unit tests for Zod schemas in src/lib/validators/originalAssignment.test.ts
- [x] Generate database migration (create_original_assignments_table)
- [x] Apply migration

### [x] Prompt 3.2: InterviewStepType & InterviewStep Schemas and Zod Validation
- [x] Define InterviewStepType Drizzle schema (interviewStepTypes table with clientId FK)
- [x] Define InterviewStep Drizzle schema (interviewSteps table with FK to interviewStepTypes)
- [x] Create InterviewStep Zod schemas (createInterviewStepSchema, updateInterviewStepSchema)
- [x] Write unit tests for Zod schemas
- [x] Generate database migration
- [x] Apply migration

## Phase 4: Schemas for Participants (Candidate, Interviewer) & Interview Artifacts

### [x] Prompt 4.1: Candidate & Candidate Application Schemas and Zod Validation
- [x] Define `candidates` table for unique people (name, email, etc.).
- [x] Define `candidate_applications` table to link a candidate to a position, containing status and notification timestamps.
- [x] Define `interview_events` table, with each row representing a single event in an application's lifecycle (FK to `candidate_applications`).
- [x] Create Zod schemas for `candidates` and `candidate_applications` in `validators/candidate.ts`.
- [x] Create a dedicated Zod schema for `interview_events` in `validators/interviewEvent.ts`.
- [x] Write unit tests for all new Zod schemas in their respective test files.
- [x] Generate database migration.
- [x] Apply migration.

### [x] Prompt 4.2: Interviewer Schema and Zod Validation
- [x] Define Interviewer Drizzle schema (interviewers table).
- [x] Create `interviewer_tech_stacks` join table for a M2M relationship with `tech_stacks`.
- [x] Create Interviewer Zod schemas (create, update) in `src/lib/validators/interviewer.ts`.
- [x] Write unit tests for Zod schemas in `src/lib/validators/interviewer.test.ts`.
- [x] Generate database migration (create_interviewers_table).
- [x] Apply migration.

### [x] Prompt 4.3: Interview and InterviewAssignment Schemas and Zod Validation
- [x] Define `interviews` table as the new central entity.
- [x] Refine `interview_assignments` table to link to `interviews` and hold resource-specific info.
- [x] Create Zod schemas in `validators/interview.ts` and `validators/interviewAssignment.ts`.
- [x] Write unit tests for all new Zod schemas.
- [x] Generate database migration.
- [x] Apply migration.

### [x] Prompt 4.4: Evaluation Schema and Zod Validation
- [x] Define Evaluation Drizzle schema (`evaluations` table with FK to `interviews`).
- [x] Create Evaluation Zod schemas with cross-field validation in `src/lib/validators/evaluation.ts`.
- [x] Write unit tests for Zod schemas in `src/lib/validators/evaluation.test.ts`.
- [x] Generate database migration.
- [x] Apply migration.

### [x] Prompt 4.5: Transcription Schema and Zod Validation
- [x] Define `transcriptionProcessingStatusEnum` in `src/db/schema.ts`.
- [x] Define Transcription Drizzle schema (`transcriptions` table with a foreign key to `interviews`).
- [x] Create Transcription Zod schemas in `src/lib/validators/transcription.ts`.
- [x] Write unit tests for Zod schemas in `src/lib/validators/transcription.test.ts`.
- [x] Generate database migration (`create_transcriptions_table`).
- [x] Apply migration.

## Phase 5: Server Actions for Core Interview Workflow Entities

### [x] Prompt 5.1: Position CRUD Server Actions
- [x] Create Position CRUD Server Actions (createPosition, getPositions, getPosition, updatePosition, deletePosition) in src/lib/actions/positions.ts
- [x] Implement with Drizzle, Zod validation, error handling
- [x] Write unit tests in src/lib/actions/positions.test.ts

### [x] Prompt 5.2: OriginalAssignment CRUD Server Actions
- [x] Create OriginalAssignment CRUD Server Actions under src/lib/actions/originalAssignments.ts
- [x] Implement with Drizzle, Zod validation, error handling
- [x] Write unit tests in src/lib/actions/originalAssignments.test.ts

### [x] Prompt 5.3: InterviewStep CRUD Server Actions (within a Position context)
- [x] Create nested InterviewStep CRUD Server Actions under src/lib/actions/interviewSteps.ts
- [x] Implement with Drizzle, Zod validation, error handling
- [x] Write unit tests in src/lib/actions/interviewSteps.test.ts

### [x] Prompt 5.4: Candidate Application and Candidate Management Server Actions
- [x] Refactor `createCandidateApplication` to find or create a `Candidate` before creating the application.
- [x] Ensure `createCandidateApplication` is a single transaction and prevents duplicate applications.
- [x] Ensure `updateCandidateApplication` correctly handles status changes, timestamps, and `interview_events`.
- [x] Update Zod validators for the new `createCandidateApplication` input.
- [x] Update unit tests to cover the new candidate creation/retrieval logic and duplicate application prevention.

### [x] Prompt 5.5: Interviewer CRUD Server Actions
- [x] Create Interviewer CRUD Server Actions under `src/lib/actions/interviewers.ts`.
- [x] The create/update actions must also handle linking/unlinking skills in the `interviewer_tech_stacks` join table.
- [x] Write unit tests for these server actions.

## Phase 6: Codebase Refactoring & Quality Improvements

### [ ] Prompt 6.1: Fix Linting Issues and Add Pre-commit Hook

- [x] Fix ESLint issues in `src/tests/utils/drizzleMocks.ts`.
- [x] Install and configure Prettier for consistent code formatting.
- [x] Integrate Prettier with ESLint to enforce a single, unified code style.
- [x] Install and configure Husky for Git hooks.
- [x] Install and configure `lint-staged` for efficient pre-commit checks.
- [x] Set up a pre-commit hook to automatically format code, run linting, and execute tests.
- [ ] Verify all tests pass and linting is clean.

### [ ] Prompt 6.2: Set Up Integration Testing with a Test Database
- [ ] Configure a separate test database using Docker Compose.
- [ ] Create a script to run migrations and seed data for the test database.
- [ ] Add a new `test:integration` script to `package.json` that runs Vitest with a specific configuration pointing to the test database.
- [ ] Update the pre-commit hook to run both `test` (unit) and `test:integration` scripts.

### [ ] Prompt 6.3: Remediate NPM Package Vulnerabilities
- [ ] Run `npm audit` to identify all vulnerabilities.
- [ ] Run `npm audit fix` or manually update packages to resolve vulnerabilities.
- [ ] Verify that the application and all tests still function correctly after updates.

## Phase 7: Account Manager (AM) UI - Basic Management Pages

### [ ] Prompt 7.1: Placeholder Authentication & AM Layout
- [ ] Implement basic placeholder AM authentication (`src/lib/auth.ts`, `getCurrentUser()`)
- [ ] Protect relevant API routes and pages.
- [ ] Create AM layout `src/app/(am)/layout.tsx` (sidebar navigation, main content area).
- [ ] Use shadcn/ui for styling.

### [ ] Prompt 7.2: AM UI - Client Management Page
- [ ] Create page `src/app/(am)/clients/page.tsx`.
- [ ] List Clients (shadcn/ui Table).
- [ ] "Create New Client" button (shadcn/ui Button, Dialog, Form with react-hook-form, Zod).
- [ ] Form: name, contactInfo, select AccountManager.
- [ ] Table actions: Edit, Delete (with confirmation).
- [ ] Implement Server Actions for data operations and `useEffect` for initial data fetching.
- [ ] State management for form, dialogs, list updates.
- [ ] Basic component tests (Vitest).

### [ ] Prompt 7.3: AM UI - Position Management Page
- [ ] Create page `src/app/(am)/positions/page.tsx`.
- [ ] List Positions (shadcn/ui Table).
- [ ] Filter positions by Client.
- [ ] "Create New Position" button (Dialog + Form).
- [ ] Form fields: Select Client, Job Title, Details, Tech Stacks, Comp Range, Culture Notes.
- [ ] Table actions: Edit, Delete, View Details (link).
- [ ] Implement Server Actions for data operations and `useEffect` for initial data fetching.
- [ ] Use shadcn/ui, react-hook-form, Zod.

### [ ] Prompt 7.4: AM UI - Position Detail Page & Interview Step Management
- [ ] Create dynamic route `src/app/(am)/positions/[positionId]/page.tsx`.
- [ ] Display Position details.
- [ ] Section for InterviewSteps management:
  - [ ] List steps (Table: Sequence, Name, Type, Assignment).
  - [ ] Allow reordering (manual sequence edit or dnd).
  - [ ] "Add Interview Step" button (Dialog + Form).
  - [ ] Form fields: Sequence, Name, Type, Original Assignment (Select), Scheduling Link, Email Template.
  - [ ] Step actions: Edit, Delete.
- [ ] Implement Server Actions for data operations and `useEffect` for initial data fetching.
- [ ] Use shadcn/ui.

### [ ] Prompt 7.5: AM UI - Original Assignment Library Page
- [ ] Create page `src/app/(am)/assignments/page.tsx`.
- [ ] List OriginalAssignments (Table: Name, Google Doc ID, Drive Path).
- [ ] "Add New Assignment" button (Dialog + Form).
- [ ] Form fields: Name, Google Doc File ID, Drive Folder Path.
- [ ] Table actions: Edit, Delete.
- [ ] Implement Server Actions for data operations and `useEffect` for initial data fetching.
- [ ] Use shadcn/ui.

### [ ] Prompt 7.6: AM UI - Candidate Management Page (Manual Import & List)
- [ ] Create page `src/app/(am)/candidates/page.tsx`.
- [ ] List Candidates (Table: Name, Email, Position, Status, Current Step).
- [ ] Filter by Position, Status.
- [ ] "Import Candidate" button (Dialog + Form).
- [ ] Form fields: Select Position, Name, Email, Resume Info.
- [ ] Table actions: View Details (link), Edit, Delete.
- [ ] Implement Server Actions for data operations and `useEffect` for initial data fetching.
- [ ] Use shadcn/ui.

### [ ] Prompt 7.7: AM UI - Interviewer Management Page
- [ ] Create page `src/app/(am)/interviewers/page.tsx`.
- [ ] List Interviewers (Table: Name, Email, Credits, Active Status).
- [ ] "Add New Interviewer" button (Dialog + Form).
- [ ] Form fields: Name, Email, Scheduling Tool ID.
- [ ] Table actions: Edit, Toggle Active, Adjust Credits.
- [ ] Implement Server Actions for data operations and `useEffect` for initial data fetching.
- [ ] Use shadcn/ui.

## Phase 8: AM Dashboard & Candidate Workflow UI

### [ ] Prompt 8.1: AM Dashboard UI - Candidate Workflow Display
- [ ] Create AM Dashboard page `src/app/(am)/dashboard/page.tsx`.
- [ ] Display candidates requiring action (Kanban or task list).
- [ ] Columns/Sections for statuses/action buckets.
- [ ] Candidate card details: Name, Position, Current Step, Status.
- [ ] Implement dashboard filters (by Position).
- [ ] Fetch candidate data with associations.
- [ ] Use shadcn/ui for cards and layout.

### [ ] Prompt 8.2: AM Dashboard UI - Candidate Status Transitions (Manual Actions)
- [ ] On Dashboard/Candidate Detail: UI buttons/actions for AM to transition candidate statuses:
  - [ ] 'New' -> "Review Resume" -> 'PendingAmReview'
  - [ ] 'PendingAmReview' -> "Approve Resume" / "Reject Resume"
  - [ ] 'ResumeApproved' -> Display scheduling/email info, "Mark Invite Sent" button
- [ ] Server Actions to handle status updates, `currentInterviewStepId`, `interviewHistory`.
- [ ] Optimistic UI updates or re-fetch.
- [ ] Unit tests for Server Actions status transition logic.

## Phase 9: Google Drive Integration (Service & Basic API)

### [ ] Prompt 9.1: Google Drive Service Setup & Credentials
- [ ] Create `src/services/googleDriveService.ts`.
- [ ] Set up `googleapis` client library.
- [ ] Document Google Cloud Project setup (Drive & Docs API, Service Account).
- [ ] Securely store Service Account JSON key (env var `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`).
- [ ] Implement helper functions for initializing Drive/Docs API clients.
- [ ] Ensure correct scopes.
- [ ] Configure "Generated Assignment Copies" folder ID (env var `GOOGLE_GENERATED_ASSIGNMENTS_FOLDER_ID`).

### [ ] Prompt 9.2: Google Drive Service - Copy Document Function
- [ ] Implement `copyDocument(originalDocFileId, newFileName, candidateName)` in `googleDriveService.ts`.
- [ ] Use Drive API `files.copy`.
- [ ] Name file distinctively.
- [ ] Use Drive API `files.get` for id, `webViewLink`.
- [ ] Return details.
- [ ] Comprehensive error handling.
- [ ] Unit tests for `copyDocument` (mock `googleapis`).

### [ ] Prompt 9.3: Google Drive Service - Personalize & Set Permissions
- [ ] Implement `personalizeDocument(copiedDocFileId, candidateName)` in `googleDriveService.ts`.
- [ ] Use Docs API `documents.batchUpdate` to replace `{{CANDIDATE_NAME}}`.
- [ ] Error handling.
- [ ] Implement `setDocumentPermissionsAnyoneReader(fileId)` in `googleDriveService.ts`.
- [ ] Use Drive API `permissions.create` (`type=anyone`, `role=reader`).
- [ ] Error handling.
- [ ] Unit tests for these functions (mock API calls).

### [ ] Prompt 9.4: API Endpoint for Assignment Generation
- [ ] Create API route `POST /api/interviews/generate-assignment` (req body: `candidateApplicationId`, `interviewStepId`, `interviewerId`).
- [ ] Endpoint logic:
  - [ ] Create `Interview` record first.
  - [ ] Fetch related data (`OriginalAssignment`, `Candidate`).
  - [ ] Call Google Drive service to copy and personalize document.
  - [ ] Create `InterviewAssignment` DB record, linking it to the new `Interview`.
  - [ ] Return the new assignment details.
- [ ] Error handling, transactionality.
- [ ] Add button on AM dashboard to trigger this API.
- [ ] Integration tests (mock Google Drive service).

## Phase 10: Interviewer View & Evaluation Submission

### [ ] Prompt 10.1: Basic Interviewer View Page
- [ ] Create page `src/app/interview/[interviewId]/page.tsx`.
- [ ] Fetch `Interview`, `InterviewAssignment` (if exists), `CandidateApplication`, and `InterviewStep` info.
- [ ] Display interview details.
- [ ] Display iframe or link to `InterviewAssignment.resourceUrl`.
- [ ] Basic styling.

### [ ] Prompt 10.2: Evaluation Form and Submission API
- [ ] On Interviewer View page: add evaluation form.
- [ ] Fields: `format` selector, `outcome` selector, `structuredData`/`driveDocUrl`, `evaluatorId`.
- [ ] "Submit Evaluation" button.
- [ ] Create API route `POST /api/evaluations` (req body matching `createEvaluationSchema`).
- [ ] Endpoint logic:
  - [ ] Validate input.
  - [ ] Create `Evaluation` DB record, linking it to the `interviewId`.
  - [ ] Update `CandidateApplication.status` to "Waiting for evaluation review".
- [ ] Client-side form submission logic.
- [ ] Integration tests for `/api/evaluations`.

## Phase 11: Transcription Service Integration (Placeholder & Basic Flow)

### [ ] Prompt 11.1: Transcription Service Module & Placeholder
- [ ] Create `src/services/transcriptionService.ts`.
- [ ] Implement placeholder `transcribeAudioFromLink(recordingLink, interviewId)`.
- [ ] Simulate success and failure.

### [ ] Prompt 11.2: API/Job to Trigger Transcription
- [ ] Modify `POST /api/evaluations`:
  - [ ] Check for `recordingUrl` on the parent `Interview` record.
  - [ ] If present, create `Transcription` record (status: 'Pending') linked to `interviewId`.
  - [ ] Trigger background job for transcription.
- [ ] Create API endpoint or job function `POST /api/transcriptions/process-pending`.
- [ ] Find 'Pending' `Transcription` records.
- [ ] Fetch associated `Interview.recordingUrl`.
- [ ] Call `transcriptionService.transcribeAudioFromLink()`.
- [ ] On success: update `Transcription` status to 'Complete', update `CandidateApplication` status.
- [ ] On failure: update `Transcription` status to 'Failed', update `CandidateApplication` status.
- [ ] Integration tests for transcription triggering/processing.

## Phase 12: Background Job System & Integrating Long-Running Tasks

### [ ] Prompt 12.1: Setup Background Job System (Vercel Cron Jobs + DB Table)
- [ ] Create Drizzle schema for `PendingJob`.
- [ ] Refactor `POST /api/interviews/generate-assignment` to add a 'generateAssignment' job.
- [ ] Refactor `POST /api/evaluations` to add a 'transcribe' job.
- [ ] Create API route `POST /api/worker` (protected) to be triggered by cron.
- [ ] Worker logic to fetch and process jobs from the `PendingJobs` table.
- [ ] Configure Vercel Cron Job in `vercel.json`.

### [ ] Prompt 12.2: Background Job - Assignment Cleanup
- [ ] Implement `deleteFile(fileId)` in `googleDriveService.ts`.
- [ ] Worker function for 'cleanupAssignments' job type:
  - [ ] Find `InterviewAssignment` records where parent `Interview.completedAt` is past a threshold.
  - [ ] Call `googleDriveService.deleteFile()` for each.
  - [ ] Update `InterviewAssignment.resourceDeletedAt`.
- [ ] Mechanism to queue 'cleanupAssignments' job periodically (Vercel Cron).
- [ ] Integration tests for cleanup logic.

## Phase 13: Finalizing AM Workflow & UI Polish

### [ ] Prompt 13.1: AM Dashboard - Reviewing Results & Final Decisions
- [ ] On AM Dashboard/Candidate Detail for "Waiting for evaluation review" candidates:
  - [ ] Display all `Evaluation` outcomes for the interview.
  - [ ] Display `Evaluation` data/links.
  - [ ] Link to `Interview.recordingUrl`.
  - [ ] Link to `Transcription` data if available.
  - [ ] Add AM action buttons ("Approve for Next Step", "Reject Candidate", "Put on Hold").
- [ ] API endpoint updates for these complex status transitions.
- [ ] Integration tests for API transition logic.

### [ ] Prompt 13.2: UI Polish and Navigation
- [ ] Review all AM-facing pages.
- [ ] Consistent shadcn/ui components.
- [ ] Improve navigation (sidebar, breadcrumbs).
- [ ] Make tables sortable, consider pagination.
- [ ] Test AM interface responsiveness.

## Phase 14: Real Transcription Service & End-to-End Testing

### [ ] Prompt 14.1: (Optional) Integrate Real Transcription Service
- [ ] Choose service, get API key (store securely).
- [ ] Replace placeholder `transcribeAudioFromLink` in `src/services/transcriptionService.ts` with real implementation.
- [ ] Handle async processing (polling/webhooks).
- [ ] Update tests for `transcriptionService.ts`.

### [ ] Prompt 14.2: Comprehensive End-to-End Testing
- [ ] Manually test full AM workflow:
  - [ ] Create Client, Position, Original Assignment, Interview Steps.
  - [ ] Import Candidate and create a Candidate Application.
  - [ ] Move Candidate through statuses.
  - [ ] Trigger assignment generation (verifies creation of `Interview` and `InterviewAssignment` records).
  - [ ] As an interviewer, view the assignment and submit an `Evaluation` for the `Interview`.
  - [ ] Verify that the AM sees the `Evaluation` results.
  - [ ] Verify that the `Transcription` process kicks off for the `Interview` if a recording link is present.
  - [ ] AM reviews all artifacts and makes a final decision on the application.
- [ ] Write automated E2E tests (Playwright/Cypress) for critical paths (if feasible).
- [ ] Review error handling and logging.