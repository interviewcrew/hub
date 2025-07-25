# InterviewCrew MVP: Development Blueprint & LLM Prompts

This document outlines the step-by-step plan for building the InterviewCrew MVP and provides a series of prompts for a code-generation LLM to implement each stage in a test-driven manner.

## Phase 1: Project Foundation & Core Schemas

This phase focuses on setting up the development environment, installing core dependencies, and defining the initial database schemas for fundamental entities.

### Prompt 1.1: Initialize Next.js Project

Initialize a new Next.js project named "interview-crew-platform" using TypeScript.

- Set up Tailwind CSS for styling.
- Ensure the project can be run locally (e.g., `npm run dev`).
- Create a basic `README.md` with setup instructions.

### Prompt 1.2: Install and Configure Core Dev Dependencies

In the "interview-crew-platform" Next.js project:

1. Install Drizzle ORM (`drizzle-orm`, `postgres`), Drizzle Kit (`drizzle-kit`), and the PostgreSQL driver (`pg`).
2. Install Zod for validation (`zod`).
3. Install Vitest (`vitest`), `@vitest/ui`, and `jsdom` for testing.
4. Configure Drizzle Kit:
   - Create a `drizzle.config.ts` file. Configure it for PostgreSQL, pointing to a schema file (e.g., `./src/db/schema.ts`) and an output directory for migrations (e.g., `./drizzle`).
   - Add scripts to `package.json` for generating migrations (`db:generate`), applying migrations (`db:migrate`), and opening the Drizzle Studio (`db:studio`).
5. Configure Vitest:
   - Create a `vitest.config.ts` file. Configure it for testing TypeScript files, including React components, and enabling a testing environment like `jsdom`.
   - Add a test script to `package.json` (e.g., `test`, `test:ui`).
6. Initialize shadcn/ui:
   - Run the shadcn/ui init command (`npx shadcn-ui@latest init`).
   - Configure it to use TypeScript, your preferred style (e.g., Default), base color (e.g., Slate), and CSS variables. Set up `tailwind.config.js` and `globals.css` as per its instructions.
   - Set the components alias to `@/components` and utils alias to `@/lib/utils`.

### Prompt 1.3: Basic Project Structure and DB Connection

In the "interview-crew-platform" project:

1. Create the following directory structure within the `src` folder:
   - `app/` (for Next.js app router)
   - `components/` (for UI components, further sub-organized by feature or commonality)
     - `ui/` (for shadcn-ui generated components)
   - `lib/` (for utility functions, constants, etc.)
     - `db.ts` (for Drizzle client instance and connection)
     - `utils.ts` (for shadcn/ui and other general utilities)
   - `db/`
     - `schema.ts` (for Drizzle ORM schemas)
     - `migrations/` (will be managed by Drizzle Kit)
   - `services/` (for business logic interacting with external APIs or complex internal operations)
   - `app/api/` (for Next.js API routes)

2. Implement the Drizzle client setup in `src/lib/db.ts`:
   - Import necessary Drizzle and `pg` modules.
   - Set up the database connection using environment variables for connection details (e.g., `POSTGRES_URL`).
   - Export the `db` client instance.

3. Create an initial empty schema file at `src/db/schema.ts`.

4. Generate an initial (empty) migration to ensure Drizzle Kit is configured correctly: `npm run db:generate`.

## Phase 2: Core Entity Schemas & Basic CRUD APIs (Account Management Focus)

This phase defines the schemas for Account Managers, Clients, and Hiring Pipelines, and starts building out the API layer for managing them.

### Prompt 2.1: AccountManager Schema and Zod Validation

In `src/db/schema.ts`:

1. Define the Drizzle schema for `AccountManager` (`accountManagers` table).
   - Fields: `id` (UUID, primary key, auto-generated), `name` (text, not null), `email` (text, not null, unique), `createdAt` (timestamp, default now), `updatedAt` (timestamp, default now, auto-update on change).
2. Create a corresponding Zod schema in a new file `src/lib/validators/accountManager.ts` for validating `AccountManager` creation and updates.
   - `createAccountManagerSchema`: requires `name` and `email`.
   - `updateAccountManagerSchema`: allows optional `name` and `email`.
3. Write unit tests for these Zod schemas using Vitest in a new file `src/lib/validators/accountManager.test.ts`. Test valid and invalid inputs.
4. Generate the database migration: `npm run db:generate -- --name="create_account_managers_table"`.
5. Apply the migration: `npm run db:migrate`.

### Prompt 2.2: Client Schema and Zod Validation

In `src/db/schema.ts`:

1. Define the Drizzle schema for `Client` (`clients` table).
   - Fields: `id` (UUID, primary key, auto-generated), `name` (text, not null), `contactInfo` (text), `accountManagerId` (UUID, foreign key referencing `accountManagers.id`, not null), `createdAt` (timestamp, default now), `updatedAt` (timestamp, default now, auto-update on change).
2. Create corresponding Zod schemas in `src/lib/validators/client.ts`:
   - `createClientSchema`: requires `name` and `accountManagerId`. `contactInfo` is optional.
   - `updateClientSchema`: allows optional `name` and `contactInfo`. `accountManagerId` should not be updatable through this schema directly (or handle with care if allowed).
3. Write unit tests for these Zod schemas in `src/lib/validators/client.test.ts`.
4. Generate the database migration: `npm run db:generate -- --name="create_clients_table"`.
5. Apply the migration.

### Prompt 2.3: Position Schema and Zod Validation

In `src/db/schema.ts`:

1. Define the Drizzle schema for `Position` (`positions` table).
   - Fields:
     - `id` (UUID, primary key, auto-generated)
     - `clientId` (UUID, foreign key referencing `clients.id`, not null)
     - `jobTitle` (text, not null)
     - `jobPostingDetails` (text)
     - `techStacks` (jsonb, store as string[]; provide a Drizzle `.$type<string[]>()` hint)
     - `compensationRange` (text)
     - `culturalFitCriteria` (text)
     - `accountManagerId` (UUID, foreign key referencing `accountManagers.id`, not null) // Denormalized for easier querying by Account Manager, or could be derived via Client.
     - `workflowTemplateId` (UUID, nullable - for future use with Workflow Templates)
     - `createdAt` (timestamp, default now)
     - `updatedAt` (timestamp, default now, auto-update on change)
2. Create corresponding Zod schemas in `src/lib/validators/position.ts`:
   - `createPositionSchema`: requires `clientId`, `jobTitle`, `accountManagerId`. Other fields optional. `techStacks` should be an array of strings.
   - `updatePositionSchema`: all fields optional.
3. Write unit tests for these Zod schemas in `src/lib/validators/position.test.ts`.
4. Generate the database migration: `npm run db:generate -- --name="create_positions_table"`.
5. Apply the migration.

### Prompt 2.4: Basic API Setup & AccountManager CRUD Endpoints

1. Create Next.js API route handlers for `AccountManager` CRUD operations under `src/app/api/account-managers/`:
   - `POST /api/account-managers`: Create a new Account Manager.
     - Use `createAccountManagerSchema` for request body validation.
     - Return the created account manager or 201 status.
   - `GET /api/account-managers`: Get all Account Managers.
     - Return a list of account managers.
   - `GET /api/account-managers/[id]`: Get a single Account Manager by ID.
     - Return the account manager or 404 if not found.
   - `PUT /api/account-managers/[id]`: Update an Account Manager.
     - Use `updateAccountManagerSchema` for request body validation.
     - Return the updated account manager or 200 status.
   - `DELETE /api/account-managers/[id]`: Delete an Account Manager.
     - Return 204 status.
2. Implement these handlers using the Drizzle client (`src/lib/db.ts`).
3. Include robust error handling (e.g., validation errors, database errors, not found errors) and appropriate HTTP status codes.
4. For now, these routes are open. We will address authentication later.
5. Write integration tests for these API endpoints using Vitest.
   - Set up a test database instance or use a transaction-based rollback strategy for each test.
   - Mock any external dependencies if necessary (none for this step).
   - Test successful CRUD operations and error cases (e.g., invalid input, non-existent ID).
   - Place tests in a relevant folder, e.g., `src/app/api/account-managers/accountManagers.test.ts`.

### Prompt 2.5: Client CRUD API Endpoints

1. Create Next.js API route handlers for `Client` CRUD operations under `src/app/api/clients/`:
   - `POST /api/clients`: Create a new Client. Validate against `createClientSchema`. Ensure `accountManagerId` exists.
   - `GET /api/clients`: Get all Clients. Allow optional filtering by `accountManagerId`.
   - `GET /api/clients/[id]`: Get a single Client by ID.
   - `PUT /api/clients/[id]`: Update a Client. Validate against `updateClientSchema`.
   - `DELETE /api/clients/[id]`: Delete a Client.
2. Implement using Drizzle, include error handling, and use appropriate status codes.
3. Write integration tests for these API endpoints using Vitest, similar to the AccountManager API tests. Place tests in `src/app/api/clients/clients.test.ts`.

## Phase 3: Schemas for Interview Structure & Management

This phase defines schemas for entities directly involved in the interview process itself, such as assignments and interview steps.

### Prompt 3.1: OriginalAssignment Schema and Zod Validation

In `src/db/schema.ts`:

1. Define the Drizzle schema for `OriginalAssignment` (`originalAssignments` table).
   - Fields:
     - `id` (UUID, primary key, auto-generated)
     - `name` (text, not null, unique within a certain context if necessary, e.g., per Account Manager or globally)
     - `googleDocFileId` (text, not null, unique) // The ID of the master Google Doc
     - `driveFolderPath` (text) // Path within Google Drive where this original resides, for informational purposes
     - `createdAt` (timestamp, default now)
     - `updatedAt` (timestamp, default now, auto-update on change)
2. Create corresponding Zod schemas in `src/lib/validators/originalAssignment.ts`:
   - `createOriginalAssignmentSchema`: requires `name`, `googleDocFileId`. `driveFolderPath` is optional.
   - `updateOriginalAssignmentSchema`: all fields optional.
3. Write unit tests for these Zod schemas in `src/lib/validators/originalAssignment.test.ts`.
4. Generate the database migration: `npm run db:generate -- --name="create_original_assignments_table"`.
5. Apply the migration.

### Prompt 3.2: InterviewStepType & InterviewStep Schemas and Zod Validation

In `src/db/schema.ts`:

1. Define the Drizzle schema for `InterviewStepType` in a new `interviewStepTypes` table.
   - Fields: `id` (UUID, primary key, auto-generated), `name` (text, not null), `clientId` (UUID, FK to `clients.id`, not null), `createdAt` (timestamp, default now), `updatedAt` (timestamp, default now, auto-update on change).
   - Add a unique constraint on (`clientId`, `name`).
2. The concept of seeding will be handled by a separate process later, such as seeding default types whenever a new Client is created.
3. Define the Drizzle schema for `InterviewStep` (`interviewSteps` table).
   - Fields:
     - `id` (UUID, primary key, auto-generated)
     - `positionId` (UUID, foreign key referencing `positions.id`, not null)
     - `sequenceNumber` (integer, not null) // Order of the step in the pipeline
     - `name` (text, not null) // e.g., "Python Live Coding Round 1"
     - `typeId` (UUID, foreign key referencing `interviewStepTypes.id`, not null)
     - `originalAssignmentId` (UUID, foreign key referencing `originalAssignments.id`, nullable, as not all steps might have a pre-defined assignment)
     - `schedulingLink` (text) // Manually entered URL for MVP
     - `emailTemplate` (text) // Manually entered email template text for MVP
     - `createdAt` (timestamp, default now)
     - `updatedAt` (timestamp, default now, auto-update on change)
   - Add a unique constraint on (`positionId`, `sequenceNumber`).
4. Create corresponding Zod schemas in `src/lib/validators/interviewStep.ts`:
   - `createInterviewStepSchema`: requires `positionId`, `sequenceNumber`, `name`, `typeId`. Other fields optional.
   - `updateInterviewStepSchema`: all fields optional, but `sequenceNumber` might need special handling if reordering is complex.
5. Write unit tests for these Zod schemas in `src/lib/validators/interviewStep.test.ts`.
6. Generate the database migration: `npm run db:generate -- --name="create_interview_step_types_and_steps_tables"`.
7. Apply the migration.

## Phase 4: Schemas for Participants (Candidate, Interviewer) & Interview Artifacts

This phase defines schemas for candidates, interviewers, and the artifacts generated during an interview, like copied assignments, evaluations, and transcriptions.

### Prompt 4.1: Candidate & Candidate Applications Schemas and Zod Validation

In `src/db/schema.ts`:

1.  **Redefine `candidates` table:** This table will now store unique information about a person.
    - Fields: `id`, `name` (not null), `email` (not null, unique), `resume_link` (nullable), timestamps.
2.  **Define new `candidate_applications` table:** This table links a candidate to a specific position.
    - Fields: `id`, `candidateId` (FK to `candidates`), `positionId` (FK to `positions`).
    - **Status Management:**
      - `status` (using the `candidateStatusEnum`).
      - `status_updated_at` (timestamp, not null, updates when status changes).
      - `client_notified_at` (timestamp, nullable, set when client is notified).
    - Other application-specific fields: `currentInterviewStepId`, timestamps.
    - Add a unique constraint on (`candidateId`, `positionId`).
3.  **Define new `interview_events` table:** This table will provide a structured audit log for each application.
    - Fields: `id`, `candidateApplicationId` (FK to `candidate_applications`), `eventName` (text), `details` (jsonb), `createdAt`.
4.  Create corresponding Zod schemas:
    - In `src/lib/validators/candidate.ts`: `createCandidateSchema`, `updateCandidateSchema`, `createCandidateApplicationSchema`, `updateCandidateApplicationSchema`.
    - In a new file, `src/lib/validators/interviewEvent.ts`: `createInterviewEventSchema`.
5.  Write comprehensive unit tests for these Zod schemas in their respective test files.
6.  Generate the database migration.
7.  Apply the migration.

### Prompt 4.2: Interviewer Schema and Zod Validation

In `src/db/schema.ts`:

1.  Define the Drizzle schema for `Interviewer` (`interviewers` table).
    - Fields: `id`, `name`, `email` (unique), `schedulingToolIdentifier`, `isActive`, timestamps.
    - `accruedCredits` will be calculated, not stored.
2.  Define the `interviewer_tech_stacks` join table to create a many-to-many relationship between `interviewers` and `tech_stacks`.
3.  Create corresponding Zod schemas in `src/lib/validators/interviewer.ts`. The schemas will not include `skills`, as that relationship will be managed in the server action.
4.  Write unit tests for these Zod schemas.
5.  Generate the database migration.
6.  Apply the migration.

### Prompt 4.3: InterviewAssignment Schema and Zod Validation

In `src/db/schema.ts`:

1.  **Define the `interviews` table:** This is the new central table for any given interview event.
    - Fields: `id`, `candidateApplicationId` (FK), `interviewStepId` (FK), `interviewerId` (FK, nullable), `scheduledAt` (timestamp, nullable), `completedAt` (timestamp, nullable), `recordingUrl` (text, nullable), timestamps.
2.  **Refine the `interview_assignments` table:** This table now links a specific resource (like a Google Doc) to an interview.
    - It no longer contains participant information.
    - Fields: `id`, `interviewId` (FK to `interviews`, unique), `originalAssignmentId` (FK, to trace back to the template), `resourceUrl` (the link to the live document), `resourceIdentifier` (e.g., the Google Doc file ID), `resourceDeletedAt` (for auditing soft deletes), timestamps.
3.  Create corresponding Zod schemas:
    - In a new file `src/lib/validators/interview.ts` for the `interviews` table.
    - In `src/lib/validators/interviewAssignment.ts` for the `interview_assignments` table.
4.  Write comprehensive unit tests for these Zod schemas in their respective test files.
5.  Generate the database migration.
6.  Apply the migration.

### Prompt 4.4: Evaluation Schema and Zod Validation

In `src/db/schema.ts`:

1.  Define enums for `evaluationOutcome` ('Strong Hire', 'Hire', 'Fail', 'Hold') and `evaluationFormat` ('structured_json', 'drive_doc').
2.  Define the Drizzle schema for `Evaluation` (`evaluations` table). An interview can have multiple evaluations (e.g., from a panel).
    - Fields: `id`, `interviewId` (FK to `interviews`), `evaluatorId` (FK to `interviewers`), `outcome` (enum), `format` (enum), `structuredData` (jsonb, optional), `driveDocUrl` (text, optional), `submittedAt`, timestamps.
3.  Create corresponding Zod schemas in `src/lib/validators/evaluation.ts`.
    - Implement a `.refine()` rule to ensure `structuredData` is present if format is `structured_json`, and `driveDocUrl` is present if format is `drive_doc`.
4.  Write comprehensive unit tests for these Zod schemas in `src/lib/validators/evaluation.test.ts`, including tests for the `.refine()` logic.
5.  Generate the database migration.
6.  Apply the migration.

### Prompt 4.5: Transcription Schema and Zod Validation

In `src/db/schema.ts`:

1. Define an enum for `TranscriptionStatus`: `export const transcriptionProcessingStatusEnum = pgEnum('transcription_status', ['Pending', 'Processing', 'Complete', 'Failed']);`
2. Define the Drizzle schema for `Transcription` (`transcriptions` table). Each interview has one transcription.
   - Fields:
     - `id` (UUID, primary key, auto-generated)
     - `interviewId` (UUID, foreign key referencing `interviews.id`, not null, unique)
     - `status` (`transcriptionProcessingStatusEnum`, not null, default 'Pending')
     - `transcriptionData` (jsonb, nullable) // Stores structured transcription (full text, timestamps, speaker labels)
     - `errorMessage` (text, nullable) // If transcription failed
     - `processedAt` (timestamp, nullable) // When transcription completed or failed
     - `createdAt` (timestamp, default now)
     - `updatedAt` (timestamp, default now, auto-update on change)
3. Create corresponding Zod schemas in `src/lib/validators/transcription.ts`:
   - `createTranscriptionSchema`: requires `interviewId`.
   - `updateTranscriptionSchema`: allows optional `status`, `transcriptionData` or `errorMessage`.
4. Write unit tests for these Zod schemas in `src/lib/validators/transcription.ts`.
5. Generate the database migration.
6. Apply the migration.

## Phase 5: Server Actions for Core Interview Workflow Entities

This phase focuses on creating Server Actions for managing entities central to the interview workflow, building upon the schemas defined earlier.

### Prompt 5.1: Position CRUD Server Actions

1. Create Next.js Server Actions for `Position` CRUD operations in `src/lib/actions/positions.ts`:
   - `createPosition`: Create a new Position. Validate against `createPositionSchema`. Ensure `clientId` and `accountManagerId` exist.
   - `getPositions`: Get all Positions. Allow filtering by `clientId` and/or `accountManagerId`.
   - `getPosition`: Get a single Position by ID, optionally including its associated `InterviewStep`s (use Drizzle relations).
   - `updatePosition`: Update a Position. Validate against `updatePositionSchema`.
   - `deletePosition`: Delete a Position. Consider cascading deletes or soft deletes for associated entities if necessary (for MVP, simple delete is fine, but note implications).
2. Implement using Drizzle, include error handling, and return appropriate results.
3. Write unit tests for these Server Actions using Vitest. Place tests in `src/lib/actions/positions.test.ts`.

### Prompt 5.2: OriginalAssignment CRUD Server Actions

1. Create Next.js Server Actions for `OriginalAssignment` CRUD operations in `src/lib/actions/originalAssignments.ts`:
   - `createOriginalAssignment`: Create. Validate with `createOriginalAssignmentSchema`.
   - `getOriginalAssignments`: Get all.
   - `getOriginalAssignment`: Get by ID.
   - `updateOriginalAssignment`: Update. Validate with `updateOriginalAssignmentSchema`.
   - `deleteOriginalAssignment`: Delete.
2. Implement using Drizzle, with error handling.
3. Write unit tests in `src/lib/actions/originalAssignments.test.ts`.

### Prompt 5.3: InterviewStep CRUD Server Actions (within a Position context)

1. Create Next.js Server Actions for `InterviewStep` CRUD operations in `src/lib/actions/interviewSteps.ts`:
   - `createInterviewStep`: Create an Interview Step for the given `positionId`. Validate with `createInterviewStepSchema` (ensure `positionId` matches). Ensure `originalAssignmentId` (if provided) exists. Handle `sequenceNumber` uniqueness within the position.
   - `getInterviewSteps`: Get all Interview Steps for a position, ordered by `sequenceNumber`.
   - `getInterviewStep`: Get a specific Interview Step.
   - `updateInterviewStep`: Update an Interview Step. Validate with `updateInterviewStepSchema`. Handle `sequenceNumber` changes carefully (may require reordering other steps).
   - `deleteInterviewStep`: Delete an Interview Step.
2. Implement using Drizzle, with error handling.
3. Write unit tests in `src/lib/actions/interviewSteps.test.ts`.

### Prompt 5.4: Candidate Application and Candidate Management Server Actions

1.  Create Server Actions to manage `candidate_applications` and associated `candidates` in `src/lib/actions/candidateApplications.ts`.
2.  Implement a `createCandidateApplication` action. This is a critical workflow that combines candidate creation/retrieval with application creation:
    - The action should accept `positionId` and candidate details (`name`, `email`).
    - It must first search for an existing candidate by email.
    - If the candidate does not exist, it must create a new record in the `candidates` table.
    - If the candidate exists, it will use their ID, but first check if they have already applied for the same position to prevent duplicates.
    - After securing a `candidateId`, it will create the new `candidate_applications` record.
    - Finally, it must create an initial "CANDIDATE_APPLIED" event in the `interview_events` table.
    - This entire process must be wrapped in a database transaction for data integrity.
3.  Implement `getCandidateApplication` and other getter actions as needed.
4.  Implement `updateCandidateApplication`. This action is critical for workflow progression:
    - It must handle status changes, updating both the `status` and the `status_updated_at` fields simultaneously.
    - When the status changes, it must also log a new "STATUS_CHANGED" event to the `interview_events` table, recording the old and new status.
    - It should also handle updating other fields like `client_notified_at`.
5.  Write comprehensive unit tests for these server actions, covering the logic for finding or creating a candidate, preventing duplicate applications, creating the application, and handling status updates.

### Prompt 5.5: Interviewer CRUD Server Actions

1.  Create `Interviewer` CRUD Server Actions under `src/lib/actions/interviewers.ts`.
2.  The `createInterviewer` and `updateInterviewer` actions must accept an array of `techStackId`s and manage the corresponding records in the `interviewer_tech_stacks` join table.
3.  Create a separate function `getInterviewerWithCredits(interviewerId)` that dynamically calculates credits.
4.  Write unit tests for these server actions.

## Phase 6: Codebase Refactoring & Quality Improvements

This phase is dedicated to improving the overall quality, stability, and security of the codebase.

### Prompt 6.1: Fix Linting Issues and Add Pre-commit Hook

- Identify and fix all existing ESLint issues across the codebase.
- Install and configure Husky to manage Git hooks.
- Install and configure `lint-staged` to run checks only on staged files.
- Create a `pre-commit` hook that runs `lint-staged`.
- Configure `lint-staged` to:
  - Run `eslint --fix` on all staged `*.{js,jsx,ts,tsx}` files.
  - Run the `npm test` script to execute all unit tests.
- Verify that commits are blocked if linting or tests fail.

### Prompt 6.2: Set Up Integration Testing with a Test Database

- In `docker-compose.yml`, add a new service for a dedicated test database (e.g., `test-db`).
- Create a new Vitest configuration file (e.g., `vitest.config.integration.ts`) that:
  - Connects to the test database using a specific environment variable (e.g., `TEST_DATABASE_URL`).
  - Specifies a different test file pattern to find integration tests (e.g., `**/*.integration.test.ts`).
- Create a setup file for integration tests (`src/tests/setup-integration.ts`) that:
  - Connects to the test database.
  - Runs all migrations before tests start.
  - Truncates all tables between tests to ensure isolation.
- Add a new script to `package.json`: `"test:integration": "vitest --config vitest.config.integration.ts --run"`.
- Update the `.husky/pre-commit` script to run both `npm test` and `npm run test:integration`.
- Write a sample integration test for a server action (e.g., `createClient.integration.test.ts`) to verify the setup.

### Prompt 6.3: Remediate NPM Package Vulnerabilities

- Run `npm audit` and save the report to analyze vulnerabilities.
- For each vulnerability, determine the best course of action (update, override, etc.).
- Run `npm audit fix` or manually update `package.json` for packages that need a major version bump.
- After updating, run all tests (`npm test` and `npm run test:integration`) to ensure no breaking changes were introduced.
- If necessary, update the code to conform to the new package versions.
- Commit the `package-lock.json` and any code changes.

## Phase 7: Account Manager UI - Basic Management Pages

This phase starts building the frontend for Account Managers to manage the core entities. We'll use shadcn/ui components.

### Prompt 7.1: WorkOS Project Setup (External Configuration)

**Prerequisites:** Before implementing authentication, complete these external setup steps:
1. Create a WorkOS account at [WorkOS Dashboard](https://dashboard.workos.com).
2. Create a new project in WorkOS dashboard.
3. Navigate to the "User Management" section and set up AuthKit.
4. Configure redirect URIs:
   - For development: `http://localhost:3000/callback`
   - Add logout redirect URI: `http://localhost:3000/`
5. Configure the initiate login URL: `http://localhost:3000/login`
6. Note down your API keys and Client ID from the WorkOS dashboard.
7. Generate a secure cookie password (32+ characters) using `openssl rand -base64 32`.

### Prompt 7.2: WorkOS AuthKit Integration & Account Manager Layout

1. Install and configure WorkOS AuthKit for Next.js authentication:
   - Install `@workos-inc/authkit-nextjs` package.
   - Set up environment variables:
     - `WORKOS_API_KEY` (from WorkOS dashboard)
     - `WORKOS_CLIENT_ID` (from WorkOS dashboard)  
     - `WORKOS_COOKIE_PASSWORD` (generate a secure 32+ character password)
     - `NEXT_PUBLIC_WORKOS_REDIRECT_URI` (e.g., "http://localhost:3000/callback")
   - Configure redirect URIs and initiate login URL in WorkOS dashboard.
2. Implement WorkOS AuthKit in the application:
   - Wrap the root layout with `AuthKitProvider` component in `src/app/layout.tsx`.
   - Create middleware (`middleware.ts`) using `authkitMiddleware` to protect `/` routes with page-based auth.
   - Create auth callback route at `src/app/callback/route.ts` using WorkOS callback handler.
   - Create login route at `src/app/login/route.ts` using `getSignInUrl()` and redirect.
   - Create logout functionality using `signOut()` action.
3. Create protected Account Manager layout in `src/app/(account-manager)/layout.tsx`:
   - Use `withAuth({ ensureSignedIn: true })` to protect the entire Account Manager section.
   - Display current user info from `withAuth()` result.
   - Include sidebar navigation (using shadcn/ui components).
   - Links to: Dashboard, Clients, Positions, Candidates, Interviewers, Assignment Library.
   - Add sign out button/form in the layout.
   - A main content area.
4. Update root page (`src/app/page.tsx`) to handle unauthenticated users:
   - Show sign in/sign up links using `getSignInUrl()` and `getSignUpUrl()`.
   - Redirect authenticated users to Account Manager dashboard.
5. Use shadcn/ui components for styling throughout.

**Note on API Route Protection:** With WorkOS AuthKit integrated, update existing Server Actions and API routes to use `withAuth()` for authentication checks. For Server Actions, call `withAuth({ ensureSignedIn: true })` at the beginning of protected actions. For API routes, use the WorkOS session validation methods to ensure only authenticated users can access protected endpoints.

**Note on User-AccountManager Relationship:** Consider adding a mapping between WorkOS User IDs and AccountManager records. This could be done by:
- Adding a `workosUserId` field to the `accountManagers` table, or
- Creating a separate mapping table, or  
- Using WorkOS user metadata to store the AccountManager ID.
This will allow the application to identify which AccountManager record corresponds to the authenticated WorkOS user.

### Prompt 7.3: Account Manager UI - Client Management Page

1. Create a new page at `src/app/(account-manager)/clients/page.tsx`.
2. This page should allow Account Managers to:
   - List all Clients in a shadcn/ui `Table`. Display columns like Name, Contact Info, Assigned Account Manager (Name/Email).
   - Include a "Create New Client" button (using shadcn/ui `Button` and `Dialog` with a `Form`).
   - The form (using `zod` for validation via `react-hook-form`, and shadcn/ui `Form` components) should allow input for Client `name`, `contactInfo`, and selection of an `AccountManager` (fetch Account Managers to populate a `Select` component).
   - Actions per client in the table: Edit (opens a similar dialog/form), Delete (with confirmation dialog).
3. Implement Server Actions for data operations (e.g., using Server Actions for create, update, delete operations) and use `useEffect` for initial data fetching with Server Actions.
4. Ensure proper state management for the form, dialogs, and list updates.
5. Write basic component tests with Vitest if possible (e.g., for form validation logic or component rendering).

### Prompt 7.4: Account Manager UI - Position Management Page

1. Create a new page at `src/app/(account-manager)/positions/page.tsx`.
2. This page should allow Account Managers to:
   - List all Positions in a shadcn/ui `Table`. Columns: Job Title, Client Name, Account Manager Name, Status (derived or simple).
   - Filter positions by Client (using a `Select` populated with clients).
   - "Create New Position" button (Dialog + Form).
     - Form fields: Select Client, Job Title, Job Posting Details, Tech Stacks (e.g., a tag input or comma-separated string), Comp Range, Culture Notes. Account Manager is pre-filled or selectable.
   - Actions per position: Edit, Delete, View Details (navigates to a position detail page - to be created next).
3. Implement Server Actions for data operations and use `useEffect` for initial data fetching with Server Actions.
4. Use shadcn/ui components and `react-hook-form` with Zod.

### Prompt 7.5: Account Manager UI - Position Detail Page & Interview Step Management

1. Create a dynamic route page at `src/app/(account-manager)/positions/[positionId]/page.tsx`.
2. This page should display details of a specific Position (fetched using `positionId`).
3. Below the position details, display a section for managing its `InterviewStep`s:
   - List existing steps in a table (Sequence, Name, Type, Assignment Name).
   - Allow reordering of steps (drag-and-drop if feasible for MVP, otherwise manual sequence number editing).
   - "Add Interview Step" button (Dialog + Form).
     - Form fields: Sequence Number, Name, Type (Select: Live Coding, System Design etc.), Original Assignment (Select populated from `OriginalAssignment` library), Scheduling Link (text input), Email Template (textarea).
   - Actions per step: Edit, Delete.
4. Implement Server Actions for data operations and use `useEffect` for initial data fetching with Server Actions.
5. Use shadcn/ui components.

### Prompt 7.6: Account Manager UI - Original Assignment Library Page

1. Create a new page at `src/app/(account-manager)/assignments/page.tsx`.
2. This page should allow Account Managers to:
   - List all `OriginalAssignment`s in a shadcn/ui `Table`. Columns: Name, Google Doc File ID, Drive Folder Path.
   - "Add New Assignment" button (Dialog + Form).
     - Form fields: Name, Google Doc File ID (manually entered string), Drive Folder Path (manually entered string).
   - Actions per assignment: Edit, Delete.
3. Implement Server Actions for data operations and use `useEffect` for initial data fetching with Server Actions.
4. Use shadcn/ui components.

### Prompt 7.7: Account Manager UI - Candidate Management Page (Manual Import & List)

1. Create a new page at `src/app/(account-manager)/candidates/page.tsx`.
2. This page should allow Account Managers to:
   - List all `Candidate`s in a shadcn/ui `Table`. Columns: Name, Email, Position (Job Title), Current Status, Current Step Name (if applicable).
   - Filter candidates by Position and/or Status.
   - "Import Candidate" (Create New) button (Dialog + Form).
     - Form fields: Select Position, Name, Email, Resume Info (textarea or link). Status defaults to 'New'.
   - Actions per candidate: View Details (navigates to candidate detail page - to be created), Edit basic info, Delete.
3. Implement Server Actions for data operations and use `useEffect` for initial data fetching with Server Actions.
4. Use shadcn/ui components.

### Prompt 7.8: Account Manager UI - Interviewer Management Page

1. Create a new page at `src/app/(account-manager)/interviewers/page.tsx`.
2. This page should allow Account Managers to:
   - List all `Interviewer`s in a shadcn/ui `Table`. Columns: Name, Email, Accrued Credits, Active Status.
   - "Add New Interviewer" button (Dialog + Form).
     - Form fields: Name, Email, Scheduling Tool Identifier (optional). Credits default to 0.
   - Actions per interviewer: Edit, Toggle Active Status, Manually Adjust Credits (simple +/- form).
3. Implement Server Actions for data operations and use `useEffect` for initial data fetching with Server Actions.
4. Use shadcn/ui components.

## Phase 8: Account Manager Dashboard & Candidate Workflow UI

This phase focuses on the Account Manager's primary interface for managing the candidate flow.

### Prompt 8.1: Account Manager Dashboard UI - Candidate Workflow Display

1. Create the Account Manager Dashboard page at `src/app/(account-manager)/dashboard/page.tsx`.
2. The dashboard should display candidates requiring Account Manager action. A Kanban board (using a library like `react-beautiful-dnd` or simpler columns if dnd is too complex for MVP) or a task-oriented list is suitable.
   - Columns/Sections could represent key statuses or action buckets (e.g., "New Resumes", "Pending Invite", "Review Evaluations").
   - Each candidate card should display: Name, Pipeline (Job Title), Current Step (if applicable), current status.
3. Implement filters for the dashboard: by Position.
4. Fetch candidate data, potentially with their associated position and current step details.
5. Use shadcn/ui components for cards and layout.

### Prompt 8.2: Account Manager Dashboard UI - Candidate Status Transitions (Manual Actions)

1. On the Account Manager Dashboard candidate cards (or a candidate detail view linked from the dashboard):
   - Implement Server Actions and UI buttons/actions for Account Managers to manually transition candidate statuses according to the flow in Section 4 of the spec. Examples:
     - For a 'New' candidate: "Review Resume" (moves to 'PendingAmReview').
     - For 'PendingAmReview': "Approve Resume" (moves to 'ResumeApproved', set `currentInterviewStepId` to the first step of their position), "Reject Resume" (moves to 'ResumeRejected').
     - For 'ResumeApproved' (for a specific step): Display `schedulingLink` and `emailTemplate` from the `InterviewStep`. Add "Mark Invite Sent" button (moves to 'InviteSent' for that `currentInterviewStepId`).
     - (Other transitions like 'EvaluationRejected', 'PipelineCompleted' will be added after evaluation/transcription parts).
2. The Server Actions should handle the logic for updating `currentStatus` and `currentInterviewStepId` and potentially adding to `interviewHistory`.
3. Update the UI optimistically or re-fetch data after status changes.
4. Write unit tests for the Server Actions handling these status transitions.

## Phase 9: Google Drive Integration (Service & Basic API)

This phase implements the core logic for interacting with Google Drive for assignment management. This requires setting up Google API credentials.

### Prompt 9.1: Google Drive Service Setup & Credentials

1. Create a new service module `src/services/googleDriveService.ts`.
2. Set up the Google API client library for Node.js (`googleapis`).
3. Guide on setting up Google Cloud Project, enabling Drive API & Docs API, and creating a Service Account:
   - Store the Service Account JSON key securely (e.g., as a base64 encoded environment variable `GOOGLE_SERVICE_ACCOUNT_KEY_JSON`).
   - The service should load these credentials to authenticate.
4. Implement helper functions within the service for initializing the Drive and Docs API clients.
5. Ensure the necessary scopes are requested (e.g., `https://www.googleapis.com/auth/drive`, `https://www.googleapis.com/auth/documents`).
6. Add a configuration for the target "Generated Assignment Copies" folder ID in Google Drive (e.g., `GOOGLE_GENERATED_ASSIGNMENTS_FOLDER_ID` env var).

### Prompt 9.2: Google Drive Service - Copy Document Function

In `src/services/googleDriveService.ts`:

1. Implement a function `copyDocument(originalDocFileId: string, newFileName: string, candidateName: string): Promise<{ copiedFileId: string, webViewLink: string }>`
   - It should use the Drive API (`files.copy`) to copy the `originalDocFileId` into the pre-configured "Generated Assignment Copies" folder.
   - Name the copied file distinctively (e.g., `[CandName]-[AssignmentTitle]-[Date]`). The `newFileName` parameter should incorporate this.
   - After copying, use Drive API (`files.get` with `fields='id, webViewLink'`) to get the ID and `webViewLink` of the new copy.
   - Return these details.
   - Implement comprehensive error handling (e.g., original file not found, copy failed, permission issues).
2. Write unit tests for `copyDocument`, mocking the `googleapis` calls. Test success and failure scenarios.

### Prompt 9.3: Google Drive Service - Personalize & Set Permissions

In `src/services/googleDriveService.ts`:

1. Implement `personalizeDocument(copiedDocFileId: string, candidateName: string): Promise<void>`:
   - Use the Google Docs API (`documents.batchUpdate`) to edit the copied document.
   - Replace a placeholder (e.g., `{{CANDIDATE_NAME}}`) with the `candidateName`.
   - Add error handling.
2. Implement `setDocumentPermissionsAnyoneReader(fileId: string): Promise<void>`:
   - Use the Drive API (`permissions.create`) to set permission on the file to `type=anyone`, `role=reader`.
   - Add error handling.
3. Write unit tests for these functions, mocking API calls.

### Prompt 9.4: API Endpoint for Assignment Generation

1. Create a Next.js API route `POST /api/interviews/generate-assignment`.
   - Request body: `candidateApplicationId: string`, `interviewStepId: string`, `interviewerId: string` (nullable).
2. This endpoint should:
   - Create an `Interview` record in the database, linking the `candidateApplicationId`, `interviewStepId`, and `interviewerId`.
   - Fetch the `OriginalAssignment` linked to the `InterviewStep`.
   - Fetch the `Candidate` details for their name.
   - Construct a new file name (e.g., using candidate name, assignment title, date).
   - Call `googleDriveService.copyDocument()`.
   - Call `googleDriveService.personalizeDocument()` with the candidate's name.
   - Call `googleDriveService.setDocumentPermissionsAnyoneReader()`.
   - Create an `InterviewAssignment` record in the database, linking it to the newly created `interviewId` and storing the `resourceIdentifier` and `resourceUrl`.
   - Return the `InterviewAssignment` record or at least the `resourceUrl`.
   - Implement robust error handling and transactionality.
3. Add a button on the Account Manager dashboard (e.g., next to a candidate scheduled for a step that needs an assignment) to trigger this API endpoint.
4. Write integration tests for this API endpoint, mocking the Google Drive service functions to avoid actual API calls during tests, but testing the overall flow and database interactions.

## Phase 10: Interviewer View & Evaluation Submission

This phase builds the minimal interface for interviewers.

### Prompt 10.1: Basic Interviewer View Page

1. Create a public-facing (or minimally protected) Next.js page, e.g., `src/app/interview/[interviewId]/page.tsx`.
   - The `interviewId` is the ID of an `interviews` record.
2. On this page:
   - Fetch the `Interview` details using `interviewId`.
   - If an assignment exists for this interview, fetch the `InterviewAssignment` details.
   - Fetch related `CandidateApplication` and `InterviewStep` information.
   - Display Candidate Name, Job Title, Interview Step Name/Type.
   - Prominently display an iframe or a link to the `InterviewAssignment.resourceUrl` if it exists.
3. Use basic styling (shadcn/ui if easily applicable, but focus on functionality).

### Prompt 10.2: Evaluation Form and Submission API

1. On the Interviewer View page (`src/app/interview/[interviewId]/page.tsx`):
   - Add an evaluation form (using shadcn/ui `Form`, `Textarea`, `Input`).
   - The form should allow the interviewer to select the format (`structured_json` or `drive_doc`).
   - Fields:
     - Based on format selection, show either a "structured data" input (e.g., textarea) or a "Drive Doc URL" input.
     - "Outcome" (Select: 'Strong Hire', 'Hire', 'Fail', 'Hold').
     - A field for `evaluatorId` (for MVP, could be a hidden input or simple text input; in future, it would come from interviewer auth using WorkOS organizations or role-based access).
   - "Submit Evaluation" button.
2. Create a Next.js API route `POST /api/evaluations`.
   - Request body should match the `createEvaluationSchema` (e.g., `interviewId`, `evaluatorId`, `outcome`, etc.).
   - This endpoint should:
     - Validate the input using `createEvaluationSchema`.
     - Create an `Evaluation` record in the database.
     - Update the `CandidateApplication.status` to "Waiting for evaluation review".
     - (Later, this will trigger the transcription job).
     - Return a success response.
3. Implement client-side logic on the Interviewer View page to submit this form to the API. Show a success/error message.
4. Write integration tests for the `/api/evaluations` endpoint.

## Phase 11: Transcription Service Integration (Placeholder & Basic Flow)

This phase sets up the transcription process. Initially with a placeholder, then with a real service.

### Prompt 11.1: Transcription Service Module & Placeholder

1. Create a new service module `src/services/transcriptionService.ts`.
2. Implement a placeholder function:
   `async transcribeAudioFromLink(recordingLink: string, evaluationId: string): Promise<{ success: boolean, data?: any, error?: string }>`
   - This function should simulate:
     - Downloading/accessing the audio from `recordingLink` (for now, just log it).
     - Extracting audio (log).
     - Sending to a transcription API (log).
     - Receiving a result (return mock JSON transcription data after a delay, e.g., `{ fullText: "Mock transcription...", segments: [{speaker: "S1", time: "0:01", text: "Hello"}] }`).
   - It should also be able to simulate failure.
3. This function will be called by a background job.

### Prompt 11.2: API/Job to Trigger Transcription

1. Modify the `POST /api/evaluations` endpoint (from Prompt 10.2):
   - After successfully saving the `Evaluation`, it should check if a `recordingUrl` was included in the parent `Interview` record.
   - If it was, it should create a `Transcription` record with `status: 'Pending'`, linking it to the `interviewId`.
   - Then, it should trigger a background job (or directly call a service function for now if background jobs aren't fully set up) to process this transcription.
2. Create a new API endpoint `POST /api/transcriptions/process-pending` (or a function to be run by a background job system).
   - This job/endpoint should:
     - Find `Transcription` records with `status: 'Pending'`.
     - For each, fetch the associated `Interview.recordingUrl`.
     - Call `transcriptionService.transcribeAudioFromLink()`.
     - If successful: update `Transcription` record with `status: 'Complete'`, store `transcriptionData`. Update `CandidateApplication.status` to "TranscriptionComplete".
     - If failed: update `Transcription` record with `status: 'Failed'`, store `errorMessage`. Update `CandidateApplication.status` to "TranscriptionFailed".
3. Write integration tests for the transcription triggering and processing logic (mocking the actual `transcribeAudioFromLink` call).

## Phase 12: Background Job System & Integrating Long-Running Tasks

This phase formalizes background job processing.

### Prompt 12.1: Setup Background Job System (e.g., BullMQ or Vercel Cron Jobs)

Choose and set up a background job processing system suitable for Next.js/Vercel:

Option A (BullMQ - more robust, requires Redis):

1. Install BullMQ (`bullmq`) and a Redis client (`ioredis`).
2. Configure a BullMQ queue (e.g., "interviewcrew-jobs").
3. Create worker functions for tasks:
   - `processAssignmentGeneration(jobData: { candidateId, interviewStepId })` (refactors logic from Prompt 9.4).
   - `processTranscription(jobData: { evaluationId, recordingLink })` (refactors logic from Prompt 11.2).
   - `processAssignmentCleanup()` (for Prompt 12.2).
4. Modify API endpoints to add jobs to the queue instead of direct execution.
5. Set up a worker process to listen to the queue. This might be a separate Node.js script or an API route designed to be kept alive/triggered.

Option B (Vercel Cron Jobs - simpler, for scheduled tasks & can trigger API routes for pseudo-queuing):

1. Define Vercel Cron Jobs in `vercel.json` to trigger API routes at intervals.
2. For "queue-like" behavior: an API route adds a task to a database table (e.g., `PendingJobs`), and a cron job periodically triggers another API route that processes items from this table.
   - `POST /api/queues/add-job`: Adds a job (type, payload) to the `PendingJobs` table.
   - `GET /api/queues/run-worker` (triggered by cron): Fetches and processes jobs from `PendingJobs`.

For this prompt, choose one approach. Let's assume Vercel Cron Jobs with a DB table for tasks for simplicity if BullMQ is too heavy for initial setup.

1. Create a Drizzle schema for `PendingJob` (`pendingJobs` table): `id`, `jobType` (enum: 'generateAssignment', 'transcribe', 'cleanupAssignments'), `payload` (jsonb), `status` ('pending', 'processing', 'complete', 'failed'), `attempts` (integer), `createdAt`, `updatedAt`.
2. Refactor `POST /api/interviews/generate-assignment` to add a 'generateAssignment' job to `PendingJobs`.
3. Refactor `POST /api/evaluations` to add a 'transcribe' job to `PendingJobs` (payload includes `evaluationId`).
4. Create an API route `POST /api/worker` (protected, perhaps by a secret key) that can be triggered by a Vercel Cron Job (e.g., every minute).
   - This worker fetches a batch of 'pending' jobs from `PendingJobs`.
   - Marks them 'processing'.
   - Based on `jobType`, calls the appropriate service function (e.g., the core logic from Prompt 9.4 for assignment generation, or Prompt 11.2 for transcription).
   - Updates job status to 'complete' or 'failed' (with error message and retry logic).
5. Configure a Vercel Cron Job in `vercel.json` to call `/api/worker`.

### Prompt 12.2: Background Job - Assignment Cleanup

1. Implement the logic for the assignment cleanup background job:
   - Service function in `googleDriveService.ts`: `deleteFile(fileId: string): Promise<void>`.
   - The worker function (triggered by a 'cleanupAssignments' job type from `PendingJobs` or a dedicated cron):
     - Finds `InterviewAssignment` records where the parent `Interview.completedAt` is more than X hours/days ago (configurable, e.g., 72 hours) and `resourceDeletedAt` is null.
     - For each, calls `googleDriveService.deleteFile(resourceIdentifier)`.
     - If successful, updates `InterviewAssignment.resourceDeletedAt` with the current timestamp.
     - Handles errors during deletion.
2. Add a mechanism to periodically queue a 'cleanupAssignments' job (e.g., a daily Vercel Cron Job that adds this job type to `PendingJobs`, or directly calls a cleanup API endpoint).
3. Write integration tests for the cleanup logic (mocking Drive API calls).

## Phase 13: Finalizing Account Manager Workflow & UI Polish

This phase completes the Account Manager's ability to manage the candidate lifecycle and polishes the UI.

### Prompt 13.1: Account Manager Dashboard - Reviewing Results & Final Decisions

1. On the Account Manager Dashboard (or Candidate Detail Page):
   - For candidates with status "Waiting for evaluation review":
     - Display the `Evaluation.outcome` for each evaluation linked to the interview.
     - Display a summary of/link to the `Evaluation.structuredData` or `Evaluation.driveDocUrl` based on the `format`.
     - Display a link to the `Interview.recordingUrl`.
     - If a transcription is available, display a summary of/link to the `Transcription.transcriptionData`.
   - Add Account Manager action buttons:
     - "Approve for Next Step", "Reject Candidate", "Put on Hold".
2. Implement the necessary API endpoint updates (likely on `PUT /api/applications/[id]`) to handle these complex status transitions and logic.
3. Write integration tests for these API transition logics.

### Prompt 13.2: UI Polish and Navigation

1. Review all Account Manager-facing pages (`Clients`, `Positions`, `Assignments`, `Candidates`, `Interviewers`, `Dashboard`).
2. Ensure consistent use of shadcn/ui components for layout, tables, forms, dialogs, buttons, and notifications/toasts (e.g., using shadcn/ui `toast` for success/error messages after API calls).
3. Improve navigation:
   - Ensure the sidebar layout (Prompt 7.1) is functional and links are correct.
   - Add breadcrumbs if helpful for nested views (e.g., Client > Position > Step).
   - Make tables sortable and potentially add pagination if lists become long.
4. Test responsiveness of the Account Manager interface.

## Phase 14: Real Transcription Service & End-to-End Testing

This phase replaces the placeholder transcription with a real service and focuses on broader testing.

### Prompt 14.1: (Optional - if time/budget allows) Integrate Real Transcription Service

This is a larger step, choose one service (e.g., AssemblyAI, Google Speech-to-Text via Gemini if suitable for long audio).
Example for AssemblyAI:

1. Sign up for AssemblyAI and get an API key. Store it securely as an environment variable.
2. In `src/services/transcriptionService.ts`, replace the placeholder `
