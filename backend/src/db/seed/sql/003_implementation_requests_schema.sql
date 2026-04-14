-- 003_implementation_requests_schema.sql

CREATE TABLE IF NOT EXISTS implementation_requests (
  id                CHAR(36)       NOT NULL,
  email             VARCHAR(255)   NOT NULL,
  domain            VARCHAR(255)   NOT NULL,
  package_slug      VARCHAR(100)   DEFAULT NULL,
  notes             TEXT           DEFAULT NULL,
  -- cPanel bilgileri: DB'ye kaydedilmez, email ile iletildikten sonra boş bırakılır
  -- Sadece geçici olarak admin email'e iletmek için alınır, persist edilmez
  status            ENUM('pending','in_progress','done','cancelled') NOT NULL DEFAULT 'pending',
  admin_notes       TEXT           DEFAULT NULL,
  analysis_id       CHAR(36)       DEFAULT NULL,
  created_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY impl_email_idx (email),
  KEY impl_domain_idx (domain),
  KEY impl_status_idx (status),
  KEY impl_created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
