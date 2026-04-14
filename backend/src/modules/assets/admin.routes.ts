import type { FastifyInstance } from 'fastify';
import path from 'node:path';
import fs from 'node:fs';

const ALLOWED = ['logo.png', 'logo-small.png', 'favicon.png'];
const ASSETS_DIR = path.resolve(process.cwd(), 'storage', 'assets');

export async function registerAssetsAdmin(app: FastifyInstance) {
  // POST /admin/assets/upload?name=logo.png
  app.post('/assets/upload', async (req, reply) => {
    const { name } = req.query as { name?: string };
    if (!name || !ALLOWED.includes(name)) {
      return reply.code(400).send({ error: 'name parametresi geçersiz. İzin verilenler: ' + ALLOWED.join(', ') });
    }

    const data = await req.file();
    if (!data) return reply.code(400).send({ error: 'Dosya bulunamadı' });

    const mime = data.mimetype;
    if (!mime.startsWith('image/')) {
      return reply.code(400).send({ error: 'Sadece görsel dosyaları yüklenebilir' });
    }

    const destPath = path.join(ASSETS_DIR, name);
    const buffer = await data.toBuffer();
    fs.writeFileSync(destPath, buffer);

    return reply.send({
      ok: true,
      url: `/assets/${name}`,
      name,
      size: buffer.byteLength,
    });
  });

  // GET /admin/assets — mevcut asset listesi
  app.get('/assets', async (_req, reply) => {
    const items = ALLOWED.map((name) => {
      const filePath = path.join(ASSETS_DIR, name);
      const exists = fs.existsSync(filePath);
      const stat = exists ? fs.statSync(filePath) : null;
      return {
        name,
        url: `/assets/${name}`,
        exists,
        size: stat?.size ?? 0,
        updated_at: stat?.mtime?.toISOString() ?? null,
      };
    });
    return reply.send(items);
  });
}
