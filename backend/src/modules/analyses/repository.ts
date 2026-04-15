import { randomUUID } from 'crypto';
import { eq, desc, like, and, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import { analyses, domain_locks, type Analysis, type NewAnalysis } from './schema';
import type { AnalysisListParams } from './validation';

// ─── Domain Lock ────────────────────────────────────────────────────────────

export async function repoIsDomainLocked(domain: string): Promise<boolean> {
  const [row] = await db
    .select({ id: domain_locks.id })
    .from(domain_locks)
    .where(eq(domain_locks.domain, domain))
    .limit(1);
  return !!row;
}

export async function repoLockDomain(domain: string): Promise<void> {
  await db
    .insert(domain_locks)
    .values({ id: randomUUID(), domain })
    .onDuplicateKeyUpdate({
      set: { analysis_count: '999' }, // placeholder — gerçek increment SQL ile yapılır
    });
}

// ─── Analyses ───────────────────────────────────────────────────────────────

export async function repoCreateAnalysis(
  data: Pick<NewAnalysis, 'url' | 'domain' | 'email' | 'status' | 'package_slug'>,
): Promise<Analysis> {
  const id = randomUUID();
  await db.insert(analyses).values({ id, ...data });
  const [row] = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);
  return row as Analysis;
}

export async function repoGetAnalysisById(id: string): Promise<Analysis | null> {
  const [row] = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);
  return (row ?? null) as Analysis | null;
}

export async function repoGetAnalysisByPaymentId(paymentId: string): Promise<Analysis | null> {
  const [row] = await db
    .select()
    .from(analyses)
    .where(eq(analyses.payment_id, paymentId))
    .limit(1);
  return (row ?? null) as Analysis | null;
}

export async function repoUpdateAnalysis(
  id: string,
  patch: Partial<NewAnalysis>,
): Promise<Analysis | null> {
  await db.update(analyses).set(patch).where(eq(analyses.id, id));
  return repoGetAnalysisById(id);
}

export async function repoListAnalyses(params: AnalysisListParams): Promise<Analysis[]> {
  const { limit, offset, order, search, status, package_slug } = params;

  const conditions: SQL[] = [];
  if (search) {
    conditions.push(like(analyses.domain, `%${search}%`));
  }
  if (status) conditions.push(eq(analyses.status, status));
  if (package_slug) conditions.push(eq(analyses.package_slug, package_slug));

  const query = db.select().from(analyses);
  const filtered = conditions.length ? query.where(and(...conditions)) : query;

  const rows = await filtered
    .orderBy(order === 'asc' ? analyses.created_at : desc(analyses.created_at))
    .limit(limit)
    .offset(offset);

  return rows as Analysis[];
}

export async function repoCountAnalyses(params: AnalysisListParams): Promise<number> {
  const { search, status, package_slug } = params;
  const conditions: SQL[] = [];
  if (search) conditions.push(like(analyses.domain, `%${search}%`));
  if (status) conditions.push(eq(analyses.status, status));
  if (package_slug) conditions.push(eq(analyses.package_slug, package_slug));

  const query = db.select({ id: analyses.id }).from(analyses);
  const filtered = conditions.length ? query.where(and(...conditions)) : query;
  const rows = await filtered;
  return rows.length;
}

export async function repoGetAnalysesByEmail(
  email: string,
  limit = 20,
  offset = 0,
): Promise<Analysis[]> {
  const rows = await db
    .select()
    .from(analyses)
    .where(eq(analyses.email, email))
    .orderBy(desc(analyses.created_at))
    .limit(limit)
    .offset(offset);
  return rows as Analysis[];
}

export async function repoCountAnalysesByEmail(email: string): Promise<number> {
  const rows = await db
    .select({ id: analyses.id })
    .from(analyses)
    .where(eq(analyses.email, email));
  return rows.length;
}
