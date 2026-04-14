import 'dotenv/config';

const toInt = (v: string | undefined, d: number) => {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : d;
};
const toBool = (v: string | undefined, d = false) => {
  if (v == null) return d;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};
const toList = (v: string | undefined) =>
  (v ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3071';
const CORS_LIST = toList(process.env.CORS_ORIGIN);
const CORS_ORIGIN = CORS_LIST.length ? CORS_LIST : [FRONTEND_URL];

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: toInt(process.env.PORT, 8095),

  DB: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: toInt(process.env.DB_PORT, 3306),
    user: process.env.DB_USER || 'app',
    password: process.env.DB_PASSWORD || 'app',
    name: process.env.DB_NAME || 'geoserra',
  },

  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret',

  CORS_ORIGIN,
  FRONTEND_URL,
  ADMIN_URL: process.env.ADMIN_URL || 'http://localhost:3072',
  PUBLIC_URL: process.env.PUBLIC_URL || 'http://localhost:8095',

  // Mail
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: toInt(process.env.SMTP_PORT, 465),
  SMTP_SECURE: toBool(process.env.SMTP_SECURE, true),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'GeoSerra <noreply@geoserra.com>',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',

  // PayPal
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  PAYPAL_BASE_URL: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
  PAYPAL_WEBHOOK_ID: process.env.PAYPAL_WEBHOOK_ID || '',

  // ExchangeRate
  EXCHANGE_RATE_API_URL: process.env.EXCHANGE_RATE_API_URL || 'https://open.er-api.com/v6/latest/USD',
  EXCHANGE_RATE_CACHE_TTL_SECONDS: toInt(process.env.EXCHANGE_RATE_CACHE_TTL_SECONDS, 3600),

  // Python analiz
  PYTHON_BIN: process.env.PYTHON_BIN || 'python3',
  PYTHON_SCRIPTS_DIR: process.env.PYTHON_SCRIPTS_DIR || './python',
  GOOGLE_PSI_API_KEY: process.env.GOOGLE_PSI_API_KEY || '',

  // Raporlar
  REPORTS_DIR: process.env.REPORTS_DIR || './storage/reports',

  // Auth admin allowlist
  AUTH_ADMIN_EMAILS: process.env.AUTH_ADMIN_EMAILS || '',

  // Storage (shared-backend uyumluluğu için)
  STORAGE_DRIVER: 'local' as const,
  LOCAL_STORAGE_ROOT: process.env.REPORTS_DIR || './storage/reports',
  LOCAL_STORAGE_BASE_URL: '/reports',
  CLOUDINARY_CLOUD_NAME: '',
  CLOUDINARY_UNSIGNED_PRESET: '',
  CLOUDINARY_API_KEY: '',
  CLOUDINARY_API_SECRET: '',
  CLOUDINARY_UPLOAD_PRESET: '',
  CLOUDINARY_FOLDER: '',
  CLOUDINARY_BASE_PUBLIC: '',
  CLOUDINARY_UNSIGNED_UPLOAD_PRESET: '',
  STORAGE_CDN_PUBLIC_BASE: '',
  STORAGE_PUBLIC_API_BASE: process.env.PUBLIC_URL || 'http://localhost:8095',
  CLOUDINARY: {
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    folder: '',
    basePublic: '',
    publicStorageBase: '',
  },

  SITE_NAME: 'GeoSerra',
} as const;

export type AppEnv = typeof env;
