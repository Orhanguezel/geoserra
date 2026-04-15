import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID, randomBytes } from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '@/db/client';
import { password_reset_tokens } from './schema';

// shared-backend users table
import { users } from '@vps/shared-backend/modules/auth/schema';
import bcrypt from 'bcryptjs';

/** POST /api/v1/auth/forgot-password */
export async function forgotPassword(req: FastifyRequest, reply: FastifyReply) {
  const { email } = req.body as { email?: string };
  if (!email) return reply.code(400).send({ error: 'email_required' });

  // Kullanıcı var mı — bulunamasa da başarılı döndür (email enumeration önleme)
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (user) {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    await db.insert(password_reset_tokens).values({
      id: randomUUID(),
      user_id: user.id,
      token,
      expires_at: expiresAt,
    });

    // Email gönder (SMTP varsa)
    const resetUrl = `${process.env.FRONTEND_URL}/sifremi-sifirla?token=${token}`;
    req.log.info({ email, resetUrl }, 'password_reset_requested');

    
    const { sendPasswordResetEmail } = await import('@/services/mail.service');
    await sendPasswordResetEmail(email, resetUrl).catch((e) => req.log.warn(e, 'reset_email_failed'));
  }

  return reply.send({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
}

/** POST /api/v1/auth/reset-password */
export async function resetPassword(req: FastifyRequest, reply: FastifyReply) {
  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) return reply.code(400).send({ error: 'token_and_password_required' });
  if (password.length < 8) return reply.code(400).send({ error: 'password_too_short' });

  const now = new Date();
  const [prt] = await db
    .select()
    .from(password_reset_tokens)
    .where(
      and(
        eq(password_reset_tokens.token, token),
        gt(password_reset_tokens.expires_at, now),
      ),
    )
    .limit(1);

  if (!prt || prt.used_at) {
    return reply.code(400).send({ error: 'invalid_or_expired_token' });
  }

  // Şifreyi güncelle
  const hashed = await bcrypt.hash(password, 12);
  await db.update(users).set({ password_hash: hashed }).where(eq(users.id, prt.user_id));

  // Token'ı kullanıldı olarak işaretle
  await db
    .update(password_reset_tokens)
    .set({ used_at: now })
    .where(eq(password_reset_tokens.id, prt.id));

  return reply.send({ message: 'Şifreniz başarıyla güncellendi.' });
}
