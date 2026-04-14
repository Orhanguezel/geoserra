import { randomUUID } from 'crypto';
import { eq, desc, like, and, type SQL } from 'drizzle-orm';
import { db } from '@/db/client';
import {
  implementation_requests,
  type ImplementationRequest,
  type NewImplementationRequest,
} from './schema';
import type { ImplementationListParams, ImplementationUpdateInput } from './validation';

export async function repoCreateImplRequest(
  data: Pick<NewImplementationRequest, 'email' | 'domain' | 'package_slug' | 'notes' | 'analysis_id'>,
): Promise<ImplementationRequest> {
  const id = randomUUID();
  await db.insert(implementation_requests).values({ id, ...data });
  const [row] = await db
    .select()
    .from(implementation_requests)
    .where(eq(implementation_requests.id, id))
    .limit(1);
  return row as ImplementationRequest;
}

export async function repoGetImplRequestById(id: string): Promise<ImplementationRequest | null> {
  const [row] = await db
    .select()
    .from(implementation_requests)
    .where(eq(implementation_requests.id, id))
    .limit(1);
  return (row ?? null) as ImplementationRequest | null;
}

export async function repoUpdateImplRequest(
  id: string,
  patch: ImplementationUpdateInput,
): Promise<ImplementationRequest | null> {
  await db
    .update(implementation_requests)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(implementation_requests.id, id));
  return repoGetImplRequestById(id);
}

export async function repoListImplRequests(
  params: ImplementationListParams,
): Promise<ImplementationRequest[]> {
  const { limit, offset, order, search, status } = params;
  const conditions: SQL[] = [];
  if (search) conditions.push(like(implementation_requests.domain, `%${search}%`));
  if (status) conditions.push(eq(implementation_requests.status, status));

  const query = db.select().from(implementation_requests);
  const filtered = conditions.length ? query.where(and(...conditions)) : query;

  const rows = await filtered
    .orderBy(
      order === 'asc' ? implementation_requests.created_at : desc(implementation_requests.created_at),
    )
    .limit(limit)
    .offset(offset);

  return rows as ImplementationRequest[];
}
