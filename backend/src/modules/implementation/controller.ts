import type { FastifyRequest, FastifyReply } from 'fastify';
import { ImplementationRequestSchema } from './validation';
import { repoCreateImplRequest } from './repository';
import { env } from '@/core/env';
import nodemailer from 'nodemailer';

/** POST /api/v1/implementation/request */
export async function createImplementationRequest(req: FastifyRequest, reply: FastifyReply) {
  const parsed = ImplementationRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.code(400).send({ error: 'INVALID_BODY', details: parsed.error.flatten() });
  }

  const { email, domain, package_slug, notes, analysis_id, cpanel_host, cpanel_user, cpanel_pass } =
    parsed.data;

  // DB'ye kaydet (cPanel bilgileri hariç — kaydedilmez)
  const request = await repoCreateImplRequest({
    email,
    domain,
    package_slug: package_slug ?? null,
    notes: notes ?? null,
    analysis_id: analysis_id ?? null,
  });

  // cPanel bilgileri varsa sadece email ile ilet, DB'ye kaydetme
  if (cpanel_host || cpanel_user || cpanel_pass) {
    sendCpanelInfoEmail({ email, domain, cpanel_host, cpanel_user, cpanel_pass, request_id: request.id }).catch(
      (err) => req.log?.error?.(err, 'cpanel_email_send_failed'),
    );
  }

  // Admin bildirimi
  notifyAdmin(request).catch((err) => req.log?.error?.(err, 'impl_admin_notify_failed'));

  return reply.code(201).send({ ok: true, id: request.id });
}

async function sendCpanelInfoEmail(data: {
  email: string;
  domain: string;
  cpanel_host?: string;
  cpanel_user?: string;
  cpanel_pass?: string;
  request_id: string;
}) {
  if (!env.SMTP_HOST) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: env.SMTP_USER, // sadece admin'e gider
    subject: `[GeoSerra] Implementation Talebi — cPanel Bilgileri (#${data.request_id.slice(0, 8)})`,
    html: `
      <h3>Implementation Talebi — cPanel Erişim Bilgileri</h3>
      <p><strong>Request ID:</strong> ${data.request_id}</p>
      <p><strong>Domain:</strong> ${data.domain}</p>
      <p><strong>Müşteri Email:</strong> ${data.email}</p>
      <hr>
      <p><strong>cPanel Host:</strong> ${data.cpanel_host ?? '—'}</p>
      <p><strong>cPanel Kullanıcı:</strong> ${data.cpanel_user ?? '—'}</p>
      <p><strong>cPanel Şifre:</strong> ${data.cpanel_pass ?? '—'}</p>
      <hr>
      <p style="color:red"><strong>Bu email işlem tamamlandıktan sonra silinmelidir.</strong></p>
    `,
  });
}

async function notifyAdmin(request: { id: string; email: string; domain: string }) {
  if (!env.SMTP_HOST) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: env.SMTP_USER,
    subject: `[GeoSerra] Yeni Implementation Talebi — ${request.domain}`,
    html: `
      <p>Yeni bir implementation talebi geldi.</p>
      <p><strong>Domain:</strong> ${request.domain}</p>
      <p><strong>Email:</strong> ${request.email}</p>
      <p><a href="${env.ADMIN_URL}/implementation/${request.id}">Admin panelinde görüntüle</a></p>
    `,
  });
}
