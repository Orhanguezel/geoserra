import { mysqlTable, char, varchar, decimal, datetime, uniqueIndex, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const currency_rates = mysqlTable(
  'currency_rates',
  {
    id: char('id', { length: 36 }).primaryKey().notNull(),
    base: varchar('base', { length: 10 }).notNull().default('USD'),
    target: varchar('target', { length: 10 }).notNull(),
    rate: decimal('rate', { precision: 15, scale: 6 }).notNull(),
    fetched_at: datetime('fetched_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (t) => [
    uniqueIndex('currency_rates_base_target_unique').on(t.base, t.target),
    index('currency_rates_fetched_at_idx').on(t.fetched_at),
  ],
);

export type CurrencyRate = typeof currency_rates.$inferSelect;
