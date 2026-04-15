import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { pool } from '@/db/client';

/**
 * oauth_providers tablosu için minimal repository.
 * shared-backend'de bu tablo henüz schema olarak tanımlı değil; raw mysql2 ile
 * çalışıyoruz. Tablo tanımı: src/db/seed/sql/006_oauth_providers_schema.sql
 */

export interface OAuthProviderRow {
  id: string;
  user_id: string;
  provider: string;
  provider_id: string;
  provider_email: string | null;
  created_at: string;
}

/** provider + sub'a göre link satırını döndürür. */
export async function findOAuthLink(
  provider: string,
  providerId: string,
): Promise<OAuthProviderRow | null> {
  const [rows] = await pool.query<(OAuthProviderRow & RowDataPacket)[]>(
    'SELECT * FROM oauth_providers WHERE provider = ? AND provider_id = ? LIMIT 1',
    [provider, providerId],
  );
  return rows[0] ?? null;
}

/** Aynı kullanıcıda aynı provider linkini tekrar yaratma. */
export async function findUserProviderLink(
  userId: string,
  provider: string,
): Promise<OAuthProviderRow | null> {
  const [rows] = await pool.query<(OAuthProviderRow & RowDataPacket)[]>(
    'SELECT * FROM oauth_providers WHERE user_id = ? AND provider = ? LIMIT 1',
    [userId, provider],
  );
  return rows[0] ?? null;
}

export async function createOAuthLink(input: {
  userId: string;
  provider: string;
  providerId: string;
  providerEmail?: string | null;
}): Promise<string> {
  const id = randomUUID();
  await pool.query(
    `INSERT INTO oauth_providers (id, user_id, provider, provider_id, provider_email)
     VALUES (?, ?, ?, ?, ?)`,
    [id, input.userId, input.provider, input.providerId, input.providerEmail ?? null],
  );
  return id;
}
