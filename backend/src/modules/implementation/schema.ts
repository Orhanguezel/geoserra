import {
  mysqlTable,
  char,
  varchar,
  text,
  mysqlEnum,
  datetime,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const implementation_requests = mysqlTable(
  'implementation_requests',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    package_slug: varchar('package_slug', { length: 100 }),
    notes: text('notes'),
    status: mysqlEnum('status', ['pending', 'in_progress', 'done', 'cancelled'])
      .notNull()
      .default('pending'),
    admin_notes: text('admin_notes'),
    analysis_id: char('analysis_id', { length: 36 }),
    created_at: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index('impl_email_idx').on(t.email),
    index('impl_status_idx').on(t.status),
    index('impl_created_at_idx').on(t.created_at),
  ],
);

export type ImplementationRequest = typeof implementation_requests.$inferSelect;
export type NewImplementationRequest = typeof implementation_requests.$inferInsert;
