import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { hash as argonHash } from 'argon2';

import {
  googleBody,
  repoGetUserByEmail,
  repoGetUserById,
  repoCreateUser,
  repoAssignRole,
  repoEnsureProfileRow,
  repoUpdateLastSignIn,
  issueTokens,
  setAccessCookie,
  setRefreshCookie,
  parseAdminEmailAllowlist,
  type Role,
} from '@vps/shared-backend/modules/auth';
import { getPrimaryRole } from '@vps/shared-backend/modules/userRoles';
import { handleRouteError } from '@vps/shared-backend/modules/_shared';

import {
  verifyGoogleIdToken,
  GoogleTokenError,
} from './verify';
import {
  findOAuthLink,
  findUserProviderLink,
  createOAuthLink,
} from './repository';

const PROVIDER = 'google';
const adminEmails = parseAdminEmailAllowlist();

/** POST /api/v1/auth/google */
export async function googleLogin(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parsed = googleBody.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: { message: 'invalid_body' } });
    }

    // 1) Google id_token doğrula
    let info;
    try {
      info = await verifyGoogleIdToken(parsed.data.id_token);
    } catch (e) {
      if (e instanceof GoogleTokenError) {
        const status = e.code === 'config_missing' ? 500 : 401;
        return reply.status(status).send({ error: { message: e.code, detail: e.message } });
      }
      throw e;
    }

    // 2) Mevcut OAuth linki var mı?
    const link = await findOAuthLink(PROVIDER, info.sub);
    let userId: string;

    if (link) {
      userId = link.user_id;
    } else {
      // 3) Aynı email'le zaten user var mı?
      const existing = await repoGetUserByEmail(info.email);

      if (existing) {
        userId = existing.id;
        // Bu user için provider linki yoksa bağla (idempotent)
        const userLink = await findUserProviderLink(userId, PROVIDER);
        if (!userLink) {
          await createOAuthLink({
            userId,
            provider: PROVIDER,
            providerId: info.sub,
            providerEmail: info.email,
          });
        }
      } else {
        // 4) Yeni user oluştur
        userId = randomUUID();
        // Password kullanılmayacak; argon2 ile random secret hash'le.
        const password_hash = await argonHash(`oauth:${PROVIDER}:${randomUUID()}`);

        await repoCreateUser({
          id: userId,
          email: info.email,
          password_hash,
          full_name: info.name ?? undefined,
          rules_accepted_at: new Date(),
        });

        const isAdmin = adminEmails.has(info.email.toLowerCase());
        const assignedRole: Role = isAdmin ? 'admin' : 'customer';
        await repoAssignRole(userId, assignedRole);

        await repoEnsureProfileRow(userId, {
          full_name: info.name ?? null,
          phone: null,
        });

        await createOAuthLink({
          userId,
          provider: PROVIDER,
          providerId: info.sub,
          providerEmail: info.email,
        });
      }
    }

    // 5) Kullanıcıyı oku, oturum aç
    const u = await repoGetUserById(userId);
    if (!u) {
      return reply.status(500).send({ error: { message: 'user_lookup_failed' } });
    }
    if (u.is_active === 0) {
      return reply.status(403).send({ error: { message: 'user_inactive' } });
    }

    await repoUpdateLastSignIn(userId);

    const role = await getPrimaryRole(userId);
    const { access, refresh } = await issueTokens(req.server, u, role);
    setAccessCookie(reply, access);
    setRefreshCookie(reply, refresh);

    return reply.send({
      access_token: access,
      token_type: 'bearer',
      user: {
        id: u.id,
        email: u.email,
        full_name: u.full_name ?? info.name ?? null,
        phone: u.phone ?? null,
        email_verified: 1,
        is_active: u.is_active,
        ecosystem_id: u.ecosystem_id ?? null,
        role,
        avatar_url: info.picture ?? null,
      },
    });
  } catch (e) {
    return handleRouteError(reply, req, e, 'auth_google');
  }
}
