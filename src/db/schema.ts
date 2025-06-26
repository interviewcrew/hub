import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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