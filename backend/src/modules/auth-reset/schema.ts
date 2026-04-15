import { mysqlTable, char, varchar, datetime } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const password_reset_tokens = mysqlTable('password_reset_tokens', {
  id:         char('id', { length: 36 }).primaryKey().notNull(),
  user_id:    char('user_id', { length: 36 }).notNull(),
  token:      varchar('token', { length: 255 }).notNull(),
  expires_at: datetime('expires_at', { fsp: 3 }).notNull(),
  used_at:    datetime('used_at', { fsp: 3 }),
  created_at: datetime('created_at', { fsp: 3 }).notNull().default(sql`CURRENT_TIMESTAMP(3)`),
});

export type PasswordResetToken = typeof password_reset_tokens.$inferSelect;
