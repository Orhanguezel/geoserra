import {
  mysqlTable,
  char,
  varchar,
  text,
  json,
  decimal,
  mysqlEnum,
  datetime,
  index,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const domain_locks = mysqlTable(
  'domain_locks',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    first_analyzed_at: datetime('first_analyzed_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    analysis_count: char('analysis_count', { length: 11 }).notNull().default('1'),
  },
  (t) => [index('domain_locks_domain_idx').on(t.domain)],
);

export const analyses = mysqlTable(
  'analyses',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    url: text('url').notNull(),
    domain: varchar('domain', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['free', 'pending', 'processing', 'completed', 'failed'])
      .notNull()
      .default('free'),
    package_slug: mysqlEnum('package_slug', ['free', 'starter', 'pro', 'expert'])
      .notNull()
      .default('free'),
    free_data: json('free_data'),
    full_data: json('full_data'),
    pdf_path: varchar('pdf_path', { length: 500 }),
    pdf_sent_at: datetime('pdf_sent_at', { fsp: 3 }),
    payment_provider: mysqlEnum('payment_provider', ['stripe', 'paypal']),
    payment_id: varchar('payment_id', { length: 255 }),
    payment_amount: decimal('payment_amount', { precision: 10, scale: 2 }),
    payment_currency: varchar('payment_currency', { length: 10 }).default('USD'),
    error_message: text('error_message'),
    created_at: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updated_at: datetime('updated_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdateFn(() => new Date()),
    completed_at: datetime('completed_at', { fsp: 3 }),
  },
  (t) => [
    index('analyses_domain_idx').on(t.domain),
    index('analyses_email_idx').on(t.email),
    index('analyses_status_idx').on(t.status),
    index('analyses_payment_id_idx').on(t.payment_id),
  ],
);

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
export type DomainLock = typeof domain_locks.$inferSelect;
