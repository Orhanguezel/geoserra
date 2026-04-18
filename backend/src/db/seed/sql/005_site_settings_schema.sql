-- 005_site_settings_schema.sql
-- @vps/shared-backend/modules/siteSettings ile uyumlu tablo
-- Kolonlar: id, key (varchar 100), locale (varchar 8), value (text), created_at, updated_at

CREATE TABLE IF NOT EXISTS site_settings (
  id          CHAR(36)     NOT NULL,
  `key`       VARCHAR(100) NOT NULL,
  locale      VARCHAR(8)   NOT NULL,
  value       TEXT         NOT NULL,
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_locale_uq (`key`, locale),
  KEY site_settings_key_idx (`key`),
  KEY site_settings_locale_idx (locale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Temel ayarlar (locale='*' = evrensel)
INSERT IGNORE INTO site_settings (id, `key`, locale, value) VALUES
  (UUID(), 'site_name',        '*', '"GeoSerra"'),
  (UUID(), 'site_url',         '*', '"https://geoserra.com"'),
  (UUID(), 'contact_email',    '*', '"info@geoserra.com"'),
  (UUID(), 'smtp_host',        '*', '"smtp.hostinger.com"'),
  (UUID(), 'smtp_port',        '*', '"465"'),
  (UUID(), 'smtp_secure',      '*', '"1"'),
  (UUID(), 'smtp_user',        '*', '"info@koenigsmassage.com"'),
  (UUID(), 'smtp_pass',        '*', '"Kaman@12!"'),
  (UUID(), 'smtp_from_email',  '*', '"info@koenigsmassage.com"'),
  (UUID(), 'smtp_from_name',   '*', '"GeoSerra"'),
  -- Marka görselleri (backend /assets/ üzerinden servis edilir)
  (UUID(), 'site.logo',             '*', '"/assets/logo.png"'),
  (UUID(), 'site.logo_small',       '*', '"/assets/logo-small.png"'),
  (UUID(), 'site.logo_small_light', '*', '"/assets/logo-small-light.png"'),
  (UUID(), 'site.favicon',          '*', '"/assets/favicon.png"'),
  -- Fiyatlar (Basic / Standart / Premium — slug korundu, sadece fiyat güncellendi)
  (UUID(), 'price.starter',    '*', '"5"'),
  (UUID(), 'price.pro',        '*', '"15"'),
  (UUID(), 'price.expert',     '*', '"50"'),
  -- Dil varsayılanı
  (UUID(), 'default_locale',   '*', '"tr"');
