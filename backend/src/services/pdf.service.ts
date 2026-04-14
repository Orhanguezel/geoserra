import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { env } from '@/core/env';
import nodemailer from 'nodemailer';

export class PdfService {
  /**
   * Python generate_pdf_report.py scriptini çağırarak PDF üretir.
   * Mevcut geo-seo-claude şablonu kullanılır.
   * @returns PDF dosyasının tam yolu
   */
  static async generatePdf(analysisId: string, data: any): Promise<string> {
    const reportsDir = path.resolve(process.cwd(), env.REPORTS_DIR);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // JSON'u geçici dosyaya yaz
    const tmpJson = path.join(os.tmpdir(), `geoserra-${analysisId}.json`);
    fs.writeFileSync(tmpJson, JSON.stringify(data, null, 2), 'utf8');

    const pdfOutputPath = path.join(reportsDir, `geoserra-report-${analysisId}.pdf`);
    const scriptPath = path.resolve(process.cwd(), env.PYTHON_SCRIPTS_DIR, 'generate_pdf_report.py');

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`PDF script bulunamadı: ${scriptPath}. python/ dizinine geo-seo-claude scriptlerini kopyalayın.`);
    }

    const proc = globalThis.Bun.spawn(
      [env.PYTHON_BIN, scriptPath, tmpJson, pdfOutputPath],
      {
        stdout: 'pipe',
        stderr: 'pipe',
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
      },
    );

    const [_stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    await proc.exited;

    // Geçici JSON temizle
    try { fs.unlinkSync(tmpJson); } catch { /* ignore */ }

    if (proc.exitCode !== 0) {
      throw new Error(`PDF üretim hatası: ${stderr || 'Bilinmeyen hata'}`);
    }

    if (!fs.existsSync(pdfOutputPath)) {
      throw new Error('PDF dosyası oluşturulamadı');
    }

    return pdfOutputPath;
  }

  /**
   * PDF'i müşteri email'ine gönderir.
   */
  static async sendPdfEmail(analysis: {
    id: string;
    email: string;
    pdf_path: string | null;
    domain?: string;
  }): Promise<void> {
    if (!analysis.pdf_path || !fs.existsSync(analysis.pdf_path)) {
      throw new Error('PDF dosyası bulunamadı');
    }

    if (!env.SMTP_HOST) {
      console.warn('[PdfService] SMTP_HOST tanımlı değil — email gönderilmedi');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    const domain = analysis.domain ?? path.basename(analysis.pdf_path, '.pdf');
    const filename = `GeoSerra-Rapor-${domain}.pdf`;

    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: analysis.email,
      subject: `GeoSerra — ${domain} için GEO SEO Raporunuz Hazır`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6B21F0;">GEO SEO Raporunuz Hazır!</h2>
          <p>Merhaba,</p>
          <p><strong>${domain}</strong> domaini için hazırlanan GEO SEO analiz raporunuz ektedir.</p>
          <p>Raporda bulacaklar:</p>
          <ul>
            <li>Teknik SEO ve performans analizi</li>
            <li>AI görünürlük skoru ve önerileri</li>
            <li>Öncelikli aksiyon planı</li>
          </ul>
          <p>Herhangi bir sorunuz olursa bize ulaşabilirsiniz.</p>
          <p style="margin-top: 24px; color: #666;">
            Saygılarımızla,<br>
            <strong>GeoSerra Ekibi</strong><br>
            <a href="https://geoserra.com">geoserra.com</a>
          </p>
        </div>
      `,
      text: `Merhaba,\n\n${domain} için GEO SEO raporunuz hazır. Lütfen ekteki PDF dosyasını inceleyiniz.\n\nGeoSerra Ekibi\nhttps://geoserra.com`,
      attachments: [
        {
          filename,
          path: analysis.pdf_path,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
