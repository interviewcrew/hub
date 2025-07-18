# InterviewCrew Platform

Welcome to the InterviewCrew Platform! This project aims to streamline and enhance the technical interview process.

## Project Organization

- **Project Plan**: See `prompt_plan.md` for the detailed development blueprint and LLM prompts guiding the project.
- **TODO List**: Track the project's progress and outstanding tasks in `todo.md`.

## Getting Started

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, ensure you have Node.js and npm (or yarn/pnpm) installed. Then, install the project dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the main page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Core Technologies

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Testing**: Vitest

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Testing

This project uses Vitest for both unit and integration testing.

### Prerequisites

For integration tests, you'll need Docker running on your machine to spin up a test database.

### Test Commands

```bash
# Run all tests (unit + integration)
npm run test:all

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests in watch mode with UI
npm run test:ui

# Run integration tests in watch mode with UI
npm run test:integration:ui
```

### Setting Up Integration Tests

Integration tests require a PostgreSQL test database. The project includes Docker Compose configuration for this:

1. **Start the test database:**

   ```bash
   npm run db:test:start
   ```

2. **Run integration tests:**

   ```bash
   npm run test:integration
   ```

3. **Stop and clean up the test database:**
   ```bash
   npm run db:test:stop
   ```

### Test Database Management

- **Test database runs on port 5433** (different from dev database on 5432)
- **Automatic cleanup:** The `db:test:stop` script includes `--remove-orphans` to prevent port conflicts
- **Isolated environment:** Each test runs in a transaction that's rolled back, ensuring test isolation

### Integration Test Features

- **Real database operations:** Tests use actual PostgreSQL database
- **Transaction isolation:** Each test is wrapped in a transaction that's rolled back
- **Migration management:** Database schema is automatically migrated before tests
- **Connection pooling:** Proper database connection management with cleanup

### Troubleshooting Tests

**Database connection errors:**

- Ensure Docker is running: `docker --version`
- Start the test database: `npm run db:test:start`
- Check if port 5433 is available: `lsof -i :5433`

**Port conflicts:**

- Stop and clean up: `npm run db:test:stop`
- If issues persist: `docker-compose --profile test down --remove-orphans`

**Test isolation issues:**

- Integration tests automatically roll back transactions
- Each test starts with a clean database state

## Learn More about Next.js

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
