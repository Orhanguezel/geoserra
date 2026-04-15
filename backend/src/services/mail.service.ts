import nodemailer from 'nodemailer';
import { env } from '@/core/env';

// ─── Transporter ────────────────────────────────────────────────────────────

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;
  if (!env.SMTP_HOST) throw new Error('SMTP_HOST tanımlı değil');

  _transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return _transporter;
}

async function send(to: string, subject: string, html: string) {
  const transport = getTransporter();
  await transport.sendMail({ from: env.MAIL_FROM, to, subject, html });
}

// ─── Templates ──────────────────────────────────────────────────────────────

const base = (content: string) => `
<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827;max-width:600px;margin:0 auto">
  <div style="background:#06090f;padding:24px 32px;border-radius:12px 12px 0 0">
    <span style="color:#10b981;font-size:22px;font-weight:700">Geo</span><span style="color:#f0f2f5;font-size:22px;font-weight:700">Serra</span>
  </div>
  <div style="background:#f9fafb;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    ${content}
  </div>
  <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:16px">
    geoserra.com · AI Görünürlük & SEO Analiz Platformu
  </p>
</div>`;

// B-3.1: Şifre sıfırlama
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = base(`
    <h2 style="color:#111827;margin:0 0 16px">Şifre Sıfırlama</h2>
    <p>Merhaba,</p>
    <p>GeoSerra hesabınız için şifre sıfırlama talebiniz alındı.</p>
    <p style="margin:24px 0">
      <a href="${resetUrl}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
        Şifremi Sıfırla
      </a>
    </p>
    <p style="color:#6b7280;font-size:14px">Bu bağlantı 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız bu e-postayı dikkate almayın.</p>
  `);
  await send(to, 'GeoSerra — Şifre Sıfırlama', html);
}

// B-3.2: Analiz tamamlandı
export async function sendAnalysisCompleteEmail(params: {
  to: string;
  domain: string;
  geoScore?: number | null;
  performanceScore?: number | null;
  pdfUrl?: string | null;
  analysisId: string;
}) {
  const { to, domain, geoScore, performanceScore, pdfUrl, analysisId } = params;
  const reportUrl = `${env.FRONTEND_URL}/analyze?id=${analysisId}`;

  const html = base(`
    <h2 style="color:#111827;margin:0 0 16px">Analiziniz Hazır!</h2>
    <p><strong>${domain}</strong> için GEO SEO analiziniz tamamlandı.</p>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px;color:#6b7280">GEO Skoru</td>
          <td style="padding:8px;font-weight:700;color:#10b981">${geoScore ?? '-'} / 100</td>
        </tr>
        <tr>
          <td style="padding:8px;color:#6b7280">Performans</td>
          <td style="padding:8px;font-weight:700;color:#0ea5e9">${performanceScore ?? '-'} / 100</td>
        </tr>
      </table>
    </div>
    <p style="margin:24px 0">
      <a href="${reportUrl}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
        Raporu Görüntüle
      </a>
      ${pdfUrl ? `&nbsp;<a href="${pdfUrl}" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">PDF İndir</a>` : ''}
    </p>
  `);
  await send(to, `GeoSerra — ${domain} Analizi Tamamlandı`, html);
}

// B-3.3: Ödeme başarılı
export async function sendPaymentSuccessEmail(params: {
  to: string;
  plan: string;
  amount: string;
  currency: string;
  domain: string;
}) {
  const { to, plan, amount, currency, domain } = params;
  const html = base(`
    <h2 style="color:#111827;margin:0 0 16px">Ödeme Başarılı</h2>
    <p>Merhaba, ödemeniz onaylandı ve analiziniz başlatıldı.</p>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;color:#6b7280">Plan</td><td style="padding:8px;font-weight:700">${plan}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Tutar</td><td style="padding:8px;font-weight:700">${amount} ${currency}</td></tr>
        <tr><td style="padding:8px;color:#6b7280">Domain</td><td style="padding:8px;font-weight:700">${domain}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:14px">Analiz tamamlandığında size ayrıca bildirim gönderilecektir.</p>
  `);
  await send(to, 'GeoSerra — Ödemeniz Onaylandı', html);
}

// B-3.4: Hoş geldin (kayıt)
export async function sendWelcomeEmail(to: string, name?: string | null) {
  const userName = name?.trim() || to.split('@')[0] || 'Kullanıcı';
  const html = base(`
    <h2 style="color:#111827;margin:0 0 16px">GeoSerra'ya Hoş Geldiniz!</h2>
    <p>Merhaba ${userName},</p>
    <p>Hesabınız başarıyla oluşturuldu. Artık web sitenizin AI görünürlüğünü analiz edebilirsiniz.</p>
    <p style="margin:24px 0">
      <a href="${env.FRONTEND_URL}/analyze" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
        İlk Analizimi Başlat
      </a>
    </p>
  `);
  await send(to, 'GeoSerra\'ya Hoş Geldiniz', html);
}
