import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { env } from '@/core/env';
import { cleanSql, splitStatements, logStep } from './utils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Flags = { noDrop?: boolean; only?: string[] };

function parseFlags(argv: string[]): Flags {
  const flags: Flags = {};
  for (const a of argv.slice(2)) {
    if (a === '--no-drop') flags.noDrop = true;
    else if (a.startsWith('--only=')) {
      flags.only = a.replace('--only=', '').split(',').map((s) => s.trim());
    }
  }
  return flags;
}

function assertSafeToDrop(dbName: string) {
  const allowDrop = process.env.ALLOW_DROP === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  const isSystem = ['mysql', 'information_schema', 'performance_schema', 'sys'].includes(
    dbName.toLowerCase(),
  );
  if (isSystem) throw new Error(`Sistem DB'si drop edilemez: ${dbName}`);
  if (isProd && !allowDrop) throw new Error('Prod ortamda DROP için ALLOW_DROP=true bekleniyor.');
}

async function createRoot(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: env.DB_ADMIN.host,
    port: env.DB_ADMIN.port,
    user: env.DB_ADMIN.user,
    password: env.DB_ADMIN.password,
    multipleStatements: true,
  });
}

async function createConnToDb(): Promise<mysql.Connection> {
  return mysql.createConnection({
    host: env.DB.host,
    port: env.DB.port,
    user: env.DB.user,
    password: env.DB.password,
    database: env.DB.name,
    multipleStatements: true,
    charset: 'utf8mb4_unicode_ci',
  });
}

function getAdminVars() {
  const email = (process.env.ADMIN_EMAIL || 'admin@geoserra.com').trim();
  const id = (process.env.ADMIN_ID || '00000000-0000-0000-0000-000000000001').trim();
  const plainPassword = process.env.ADMIN_PASSWORD || 'change-me-admin';
  const passwordHash = bcrypt.hashSync(plainPassword, 12);
  return { email, id, passwordHash };
}

function sqlStr(v: string) {
  return v.replaceAll("'", "''");
}

function shouldRun(file: string, flags: Flags) {
  if (!flags.only?.length) return true;
  const m = path.basename(file).match(/^(\d+)/);
  const prefix = m?.[1];
  return prefix ? flags.only.includes(prefix) : false;
}

function prepareSql(
  rawSql: string,
  admin: { email: string; id: string; passwordHash: string },
): string {
  let sql = cleanSql(rawSql);
  const header = [
    `SET @ADMIN_EMAIL := '${sqlStr(admin.email)}';`,
    `SET @ADMIN_ID := '${sqlStr(admin.id)}';`,
    `SET @ADMIN_PASSWORD_HASH := '${sqlStr(admin.passwordHash)}';`,
  ].join('\n');

  sql = sql
    .replaceAll('{{ADMIN_BCRYPT}}', admin.passwordHash)
    .replaceAll('{{ADMIN_PASSWORD_HASH}}', admin.passwordHash)
    .replaceAll('{{ADMIN_EMAIL}}', admin.email)
    .replaceAll('{{ADMIN_ID}}', admin.id);

  return `${header}\n${sql}`;
}

async function runSqlFile(
  conn: mysql.Connection,
  absPath: string,
  admin: { email: string; id: string; passwordHash: string },
) {
  const name = path.basename(absPath);
  logStep(`⏳ ${name} çalışıyor...`);
  const raw = fs.readFileSync(absPath, 'utf8');
  const sql = prepareSql(raw, admin);
  const statements = splitStatements(sql);

  await conn.query('SET NAMES utf8mb4;');
  await conn.query("SET time_zone = '+00:00';");

  for (const stmt of statements) {
    if (!stmt) continue;
    await conn.query(stmt);
  }
  logStep(`✅ ${name} bitti`);
}

async function copyBrandAssets() {
  const srcDir = path.resolve(__dirname, 'assets');
  const destDir = path.resolve(process.cwd(), 'storage', 'assets');

  if (!fs.existsSync(srcDir)) {
    logStep('⚠️  seed/assets dizini bulunamadı, marka görselleri atlandı');
    return;
  }

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  }
  logStep(`🖼️  Marka görselleri kopyalandı: ${files.join(', ')}`);
}

async function main() {
  const flags = parseFlags(process.argv);

  if (!flags.noDrop) {
    const root = await createRoot();
    try {
      assertSafeToDrop(env.DB.name);
      logStep('💣 DROP + CREATE başlıyor');
      await root.query(`DROP DATABASE IF EXISTS \`${env.DB.name}\`;`);
      await root.query(
        `CREATE DATABASE \`${env.DB.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
      );
      logStep('🆕 DB oluşturuldu');
    } finally {
      await root.end();
    }
  } else {
    logStep('⤵️ --no-drop: DROP/CREATE atlanıyor');
  }

  const conn = await createConnToDb();
  try {
    const ADMIN = getAdminVars();

    const distSql = path.resolve(__dirname, 'sql');
    const srcSql = path.resolve(__dirname, '../../../src/db/seed/sql');
    const sqlDir = fs.existsSync(distSql) ? distSql : srcSql;

    const files = fs
      .readdirSync(sqlDir)
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const f of files) {
      const abs = path.join(sqlDir, f);
      if (!shouldRun(abs, flags)) {
        logStep(`⏭️ ${f} atlandı (--only filtresi)`);
        continue;
      }
      await runSqlFile(conn, abs, ADMIN);
    }
    logStep('🎉 Seed tamamlandı.');
  } finally {
    await conn.end();
  }

  await copyBrandAssets();
}

main().catch((err) => {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code || '');
    if (code === 'ER_DBACCESS_DENIED_ERROR' || code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(
        [
          'DB erişim hatası.',
          `Seed varsayılan olarak DB admin kullanıcısıyla çalışır.`,
          '`.env` içine `DB_ADMIN_USER` ve `DB_ADMIN_PASSWORD` ekleyin',
          'veya mevcut kullanıcıya veritabanı yetkisi verin.',
        ].join(' '),
      );
    }
  }
  console.error(err);
  process.exit(1);
});
