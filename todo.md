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

### [x] Prompt 4.3: InterviewAssignment Schema and Zod Validation
- [x] Define InterviewAssignment Drizzle schema (`interview_assignments` table, with `resourceDeletedAt` and no unique constraint).
- [x] Create Zod schemas for InterviewAssignments in `src/lib/validators/interviewAssignment.ts`.
- [x] Write unit tests for the Zod schema in `src/lib/validators/interviewAssignment.test.ts`.
- [x] Generate database migration.
- [x] Apply migration.

### [x] Prompt 4.4: Evaluation Schema and Zod Validation
- [x] Define Evaluation Drizzle schema (`evaluations` table with specific enums for outcome and format).
- [x] Create Evaluation Zod schemas with cross-field validation in `src/lib/validators/evaluation.ts`.
- [x] Write unit tests for Zod schemas in `src/lib/validators/evaluation.test.ts`.
- [x] Generate database migration.
- [x] Apply migration.

### [ ] Prompt 4.5: Transcription Schema and Zod Validation
- [ ] Define transcriptionProcessingStatusEnum in src/db/schema.ts
- [ ] Define Transcription Drizzle schema (transcriptions table with FKs to evaluations, candidates, interviewSteps, unique constraint on evaluationId)
- [ ] Create Transcription Zod schemas (createTranscriptionSchema, updateTranscriptionStatusSchema) in src/lib/validators/transcription.ts
- [ ] Write unit tests for Zod schemas in src/lib/validators/transcription.test.ts
- [ ] Generate database migration (create_transcriptions_table)
- [ ] Apply migration

## Phase 5: Server Actions for Core Interview Workflow Entities

### [ ] Prompt 5.1: Position CRUD Server Actions
- [ ] Create Position CRUD Server Actions (createPosition, getPositions, getPosition, updatePosition, deletePosition) in src/lib/actions/positions.ts
- [ ] Implement with Drizzle, Zod validation, error handling
- [ ] Write unit tests in src/lib/actions/positions.test.ts

### [ ] Prompt 5.2: OriginalAssignment CRUD Server Actions
- [ ] Create OriginalAssignment CRUD Server Actions under src/lib/actions/originalAssignments.ts
- [ ] Implement with Drizzle, Zod validation, error handling
- [ ] Write unit tests in src/lib/actions/originalAssignments.test.ts

### [ ] Prompt 5.3: InterviewStep CRUD Server Actions (within a Position context)
- [ ] Create nested InterviewStep CRUD Server Actions under src/lib/actions/interviewSteps.ts
- [ ] Implement with Drizzle, Zod validation, error handling
- [ ] Write unit tests in src/lib/actions/interviewSteps.test.ts

### [ ] Prompt 5.4: Candidate Application CRUD Server Actions
- [ ] Create Server Actions to manage `candidate_applications` (create, update, get, etc.).
- [ ] The `updateCandidateApplication` action must set `status_updated_at` whenever the `status` changes.
- [ ] The `updateCandidateApplication` action will handle setting the `client_notified_at` timestamp.
- [ ] All actions that change application status or create an application must also create a corresponding record in the `interview_events` table.
- [ ] Write unit tests for these Server Actions.

### [ ] Prompt 5.5: Interviewer CRUD Server Actions
- [ ] Create Interviewer CRUD Server Actions under `src/lib/actions/interviewers.ts`.
- [ ] The create/update actions must also handle linking/unlinking skills in the `interviewer_tech_stacks` join table.
- [ ] Write unit tests for these server actions.

## Phase 6: Account Manager (AM) UI - Basic Management Pages

### [ ] Prompt 6.1: Placeholder Authentication & AM Layout
- [ ] Implement basic placeholder AM authentication (src/lib/auth.ts, getCurrentUser())
- [ ] Protect relevant API routes and pages
- [ ] Create AM layout src/app/(am)/layout.tsx (sidebar navigation, main content area)
- [ ] Use shadcn/ui for styling

### [ ] Prompt 6.2: AM UI - Client Management Page
- [ ] Create page src/app/(am)/clients/page.tsx
- [ ] List Clients (shadcn/ui Table)
- [ ] "Create New Client" button (shadcn/ui Button, Dialog, Form with react-hook-form, Zod)
- [ ] Form: name, contactInfo, select AccountManager
- [ ] Table actions: Edit, Delete (with confirmation)
- [ ] Implement Server Actions for data operations and useEffect for initial data fetching
- [ ] State management for form, dialogs, list updates
- [ ] Basic component tests (Vitest)

### [ ] Prompt 6.3: AM UI - Position Management Page
- [ ] Create page src/app/(am)/positions/page.tsx
- [ ] List Positions (shadcn/ui Table)
- [ ] Filter positions by Client
- [ ] "Create New Position" button (Dialog + Form)
- [ ] Form fields: Select Client, Job Title, Details, Tech Stacks, Comp Range, Culture Notes
- [ ] Table actions: Edit, Delete, View Details (link)
- [ ] Implement Server Actions for data operations and useEffect for initial data fetching
- [ ] Use shadcn/ui, react-hook-form, Zod

### [ ] Prompt 6.4: AM UI - Position Detail Page & Interview Step Management
- [ ] Create dynamic route src/app/(am)/positions/[positionId]/page.tsx
- [ ] Display Position details
- [ ] Section for InterviewSteps management:
  - [ ] List steps (Table: Sequence, Name, Type, Assignment)
  - [ ] Allow reordering (manual sequence edit or dnd)
  - [ ] "Add Interview Step" button (Dialog + Form)
  - [ ] Form fields: Sequence, Name, Type, Original Assignment (Select), Scheduling Link, Email Template
  - [ ] Step actions: Edit, Delete
- [ ] Implement Server Actions for data operations and useEffect for initial data fetching
- [ ] Use shadcn/ui

### [ ] Prompt 6.5: AM UI - Original Assignment Library Page
- [ ] Create page src/app/(am)/assignments/page.tsx
- [ ] List OriginalAssignments (Table: Name, Google Doc ID, Drive Path)
- [ ] "Add New Assignment" button (Dialog + Form)
- [ ] Form fields: Name, Google Doc File ID, Drive Folder Path
- [ ] Table actions: Edit, Delete
- [ ] Implement Server Actions for data operations and useEffect for initial data fetching
- [ ] Use shadcn/ui

### [ ] Prompt 6.6: AM UI - Candidate Management Page (Manual Import & List)
- [ ] Create page src/app/(am)/candidates/page.tsx
- [ ] List Candidates (Table: Name, Email, Position, Status, Current Step)
- [ ] Filter by Position, Status
- [ ] "Import Candidate" button (Dialog + Form)
- [ ] Form fields: Select Position, Name, Email, Resume Info
- [ ] Table actions: View Details (link), Edit, Delete
- [ ] Implement Server Actions for data operations and useEffect for initial data fetching
- [ ] Use shadcn/ui

### [ ] Prompt 6.7: AM UI - Interviewer Management Page
- [ ] Create page src/app/(am)/interviewers/page.tsx
- [ ] List Interviewers (Table: Name, Email, Credits, Active Status)
- [ ] "Add New Interviewer" button (Dialog + Form)
- [ ] Form fields: Name, Email, Scheduling Tool ID
- [ ] Table actions: Edit, Toggle Active, Adjust Credits
- [ ] Implement Server Actions for data operations and useEffect for initial data fetching
- [ ] Use shadcn/ui

## Phase 7: AM Dashboard & Candidate Workflow UI

### [ ] Prompt 7.1: AM Dashboard UI - Candidate Workflow Display
- [ ] Create AM Dashboard page src/app/(am)/dashboard/page.tsx
- [ ] Display candidates requiring action (Kanban or task list)
- [ ] Columns/Sections for statuses/action buckets
- [ ] Candidate card details: Name, Position, Current Step, Status
- [ ] Implement dashboard filters (by Position)
- [ ] Fetch candidate data with associations
- [ ] Use shadcn/ui for cards and layout

### [ ] Prompt 7.2: AM Dashboard UI - Candidate Status Transitions (Manual Actions)
- [ ] On Dashboard/Candidate Detail: UI buttons/actions for AM to transition candidate statuses:
  - [ ] 'New' -> "Review Resume" -> 'PendingAmReview'
  - [ ] 'PendingAmReview' -> "Approve Resume" / "Reject Resume"
  - [ ] 'ResumeApproved' -> Display scheduling/email info, "Mark Invite Sent" button
- [ ] Server Actions to handle status updates, currentInterviewStepId, interviewHistory
- [ ] Optimistic UI updates or re-fetch
- [ ] Unit tests for Server Actions status transition logic

## Phase 8: Google Drive Integration (Service & Basic API)

### [ ] Prompt 8.1: Google Drive Service Setup & Credentials
- [ ] Create src/services/googleDriveService.ts
- [ ] Set up googleapis client library
- [ ] Document Google Cloud Project setup (Drive & Docs API, Service Account)
- [ ] Securely store Service Account JSON key (env var GOOGLE_SERVICE_ACCOUNT_KEY_JSON)
- [ ] Implement helper functions for initializing Drive/Docs API clients
- [ ] Ensure correct scopes
- [ ] Configure "Generated Assignment Copies" folder ID (env var GOOGLE_GENERATED_ASSIGNMENTS_FOLDER_ID)

### [ ] Prompt 8.2: Google Drive Service - Copy Document Function
- [ ] Implement copyDocument(originalDocFileId, newFileName, candidateName) in googleDriveService.ts
- [ ] Use Drive API files.copy
- [ ] Name file distinctively
- [ ] Use Drive API files.get for id, webViewLink
- [ ] Return details
- [ ] Comprehensive error handling
- [ ] Unit tests for copyDocument (mock googleapis)

### [ ] Prompt 8.3: Google Drive Service - Personalize & Set Permissions
- [ ] Implement personalizeDocument(copiedDocFileId, candidateName) in googleDriveService.ts
- [ ] Use Docs API documents.batchUpdate to replace {{CANDIDATE_NAME}}
- [ ] Error handling
- [ ] Implement setDocumentPermissionsAnyoneReader(fileId) in googleDriveService.ts
- [ ] Use Drive API permissions.create (type=anyone, role=reader)
- [ ] Error handling
- [ ] Unit tests for these functions (mock API calls)

### [ ] Prompt 8.4: API Endpoint for Assignment Generation
- [ ] Create API route POST /api/interviews/generate-assignment (req body: candidateId, interviewStepId)
- [ ] Endpoint logic:
  - [ ] Fetch Candidate, InterviewStep, OriginalAssignment
  - [ ] Construct new file name
  - [ ] Call googleDriveService.copyDocument()
  - [ ] Call googleDriveService.personalizeDocument()
  - [ ] Call googleDriveService.setDocumentPermissionsAnyoneReader()
  - [ ] Create CopiedAssignment DB record
  - [ ] Return CopiedAssignment or webViewLink
- [ ] Error handling, transactionality
- [ ] Add button on AM dashboard to trigger this API
- [ ] Integration tests (mock Google Drive service)

## Phase 9: Interviewer View & Evaluation Submission

### [ ] Prompt 9.1: Basic Interviewer View Page
- [ ] Create page src/app/interview/[interviewSessionId]/page.tsx (use copiedAssignmentId as interviewSessionId)
- [ ] Fetch CopiedAssignment, Candidate, InterviewStep info
- [ ] Display Candidate Name, Job Title, Step Name/Type
- [ ] Display iframe or link to CopiedAssignment.webViewLink
- [ ] Basic styling

### [ ] Prompt 9.2: Evaluation Form and Submission API
- [ ] On Interviewer View page: add evaluation form (shadcn/ui Form, Textarea, Input)
- [ ] Fields: "Overall Feedback / Notes", "Google Meet Recording Link" (mandatory)
- [ ] "Submit Evaluation" button
- [ ] Create API route POST /api/evaluations (req body: copiedAssignmentId/candidateId+stepId, interviewerId, structuredFormResponses, googleMeetRecordingLink)
- [ ] Endpoint logic:
  - [ ] Validate input
  - [ ] Create Evaluation DB record
  - [ ] Update Candidate.currentStatus to "EvaluationSubmitted"
  - [ ] Create an "Evaluation Submitted" event in the `interview_events` table.
  - [ ] Note: Interviewer credits will be calculated from the number of completed evaluations, not stored.
  - [ ] Update Candidate.currentInterviewStepId
  - [ ] Increment Interviewer.accruedCredits
  - [ ] Return success response
- [ ] Client-side form submission logic
- [ ] Integration tests for /api/evaluations

## Phase 10: Transcription Service Integration (Placeholder & Basic Flow)

### [ ] Prompt 10.1: Transcription Service Module & Placeholder
- [ ] Create src/services/transcriptionService.ts
- [ ] Implement placeholder transcribeAudioFromLink(recordingLink, evaluationId):
  - [ ] Simulate download, extraction, API call, result (mock JSON)
  - [ ] Simulate failure

### [ ] Prompt 10.2: API/Job to Trigger Transcription
- [ ] Modify POST /api/evaluations:
  - [ ] After saving Evaluation, create Transcription record (status: 'Pending')
  - [ ] Trigger background job/service call for transcription
- [ ] Create API endpoint POST /api/transcriptions/process-pending (or background job function)
- [ ] Find Transcription records with status: 'Pending'
- [ ] Fetch Evaluation.googleMeetRecordingLink
- [ ] Call transcriptionService.transcribeAudioFromLink()
- [ ] On success: update Transcription (status: 'Complete', transcriptionData), update Candidate.currentStatus ("TranscriptionComplete")
- [ ] On failure: update Transcription (status: 'Failed', errorMessage), update Candidate.currentStatus ("TranscriptionFailed")
- [ ] Integration tests for transcription triggering/processing (mock transcribeAudioFromLink)

## Phase 11: Background Job System & Integrating Long-Running Tasks

### [ ] Prompt 11.1: Setup Background Job System (Vercel Cron Jobs + DB Table)
- [ ] Create Drizzle schema for PendingJob (pendingJobs table: id, jobType enum, payload, status enum, attempts, createdAt, updatedAt)
- [ ] Refactor POST /api/interviews/generate-assignment to add 'generateAssignment' job to PendingJobs
- [ ] Refactor POST /api/evaluations to add 'transcribe' job to PendingJobs
- [ ] Create API route POST /api/worker (protected):
  - [ ] Fetches batch of 'pending' jobs
  - [ ] Marks 'processing'
  - [ ] Calls appropriate service function based on jobType
  - [ ] Updates job status ('complete'/'failed', error message, retry logic)
- [ ] Configure Vercel Cron Job in vercel.json to call /api/worker

### [ ] Prompt 11.2: Background Job - Assignment Cleanup
- [ ] Implement deleteFile(fileId) in googleDriveService.ts
- [ ] Worker function for 'cleanupAssignments' job type:
  - [ ] Find old CopiedAssignment records
  - [ ] Call googleDriveService.deleteFile()
  - [ ] Update CopiedAssignment.isDeletedFromDrive or delete record
  - [ ] Handle errors
- [ ] Mechanism to queue 'cleanupAssignments' job periodically (Vercel Cron)
- [ ] Integration tests for cleanup logic (mock Drive API)

## Phase 12: Finalizing AM Workflow & UI Polish

### [ ] Prompt 12.1: AM Dashboard - Reviewing Results & Final Decisions
- [ ] On AM Dashboard/Candidate Detail for "TranscriptionComplete" candidates:
  - [ ] Display Evaluation summary/link
  - [ ] Display Transcription summary/link
  - [ ] Add AM action buttons:
    - [ ] "Reject based on Evaluation/Transcription" -> Candidate.currentStatus = "EvaluationRejected"
    - [ ] "Approve for Next Step" -> find next step, update Candidate.currentInterviewStepId, Candidate.currentStatus = "ResumeApproved" (for new step), add to interviewHistory
    - [ ] "Mark Position Completed" -> Candidate.currentStatus = "PositionCompleted"
- [ ] API endpoint updates (PUT /api/candidates/[id]) for these transitions
- [ ] Integration tests for API transition logic

### [ ] Prompt 12.2: UI Polish and Navigation
- [ ] Review all AM-facing pages
- [ ] Consistent shadcn/ui components (layout, tables, forms, dialogs, buttons, toasts)
- [ ] Improve navigation (sidebar, breadcrumbs)
- [ ] Make tables sortable, consider pagination
- [ ] Test AM interface responsiveness

## Phase 13: Real Transcription Service & End-to-End Testing

### [ ] Prompt 13.1: (Optional) Integrate Real Transcription Service
- [ ] Choose service, get API key (store securely)
- [ ] Replace placeholder transcribeAudioFromLink in src/services/transcriptionService.ts:
  - [ ] Download/access audio from googleMeetRecordingLink (handle Drive permissions, FFmpeg if needed)
  - [ ] Upload audio to service / submit URL
  - [ ] Handle async processing (polling/webhooks)
  - [ ] Fetch and parse transcript
  - [ ] Handle API errors, rate limits
  - [ ] Delete temporary files
- [ ] Update tests for transcriptionService.ts (mock real service client)

### [ ] Prompt 13.2: Comprehensive End-to-End Testing
- [ ] Manually test full AM workflow (Client setup -> Candidate journey -> Final decision):
  - [ ] Create Client, Position, Original Assignment, Interview Steps
  - [ ] Import Candidate
  - [ ] Move Candidate through statuses
  - [ ] Trigger assignment generation
  - [ ] Interviewer views assignment, submits evaluation
  - [ ] Verify AM sees evaluation
  - [ ] Verify transcription process
  - [ ] AM reviews results, makes final decision
- [ ] Write automated E2E tests (Playwright/Cypress) for critical paths (if feasible)
- [ ] Review error handling and logging