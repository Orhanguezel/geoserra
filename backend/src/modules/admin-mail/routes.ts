import type { FastifyInstance } from 'fastify';
import { sendWelcomeEmail } from '@/services/mail.service';

export async function registerAdminMail(app: FastifyInstance) {
  /** POST /admin/site-settings/test-email */
  app.post('/site-settings/test-email', async (req, reply) => {
    const { email } = req.body as { email?: string };
    if (!email || !email.includes('@')) {
      return reply.code(400).send({ error: 'Geçerli bir email adresi girin' });
    }

    try {
      await sendWelcomeEmail(email, 'Admin Test');
      return reply.send({ ok: true, message: `Test email gönderildi: ${email}` });
    } catch (err: any) {
      req.log?.error?.(err, 'smtp_test_failed');
      return reply.code(500).send({ error: 'SMTP_FAILED', detail: err?.message });
    }
  });
}
