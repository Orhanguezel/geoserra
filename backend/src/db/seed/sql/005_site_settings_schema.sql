-- 005_site_settings_schema.sql
-- @vps/shared-backend/modules/siteSettings ile uyumlu minimal tablo

CREATE TABLE IF NOT EXISTS site_settings (
  id              CHAR(36)      NOT NULL,
  key_name        VARCHAR(255)  NOT NULL,
  value_text      TEXT          DEFAULT NULL,
  value_json      JSON          DEFAULT NULL,
  created_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_unique (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Temel ayarlar
INSERT IGNORE INTO site_settings (id, key_name, value_text) VALUES
  (UUID(), 'site_name', 'GeoSerra'),
  (UUID(), 'site_url', 'https://geoserra.com'),
  (UUID(), 'contact_email', 'info@geoserra.com'),
  (UUID(), 'smtp_host', ''),
  (UUID(), 'smtp_port', '465'),
  (UUID(), 'smtp_secure', '1'),
  (UUID(), 'smtp_user', ''),
  (UUID(), 'smtp_pass', ''),
  (UUID(), 'smtp_from_email', 'noreply@geoserra.com'),
  (UUID(), 'smtp_from_name', 'GeoSerra');
