import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

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