-- 002_analyses_schema.sql
-- Analiz talepleri + domain lock mekanizması

CREATE TABLE IF NOT EXISTS domain_locks (
  id                 CHAR(36)      NOT NULL,
  domain             VARCHAR(255)  NOT NULL,
  first_analyzed_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  analysis_count     INT           NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY domain_locks_domain_unique (domain),
  KEY domain_locks_domain_idx (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analiz durumları:
-- free           → ücretsiz analiz (ödeme yok)
-- pending        → ödeme bekleniyor
-- processing     → analiz çalışıyor
-- completed      → tamamlandı, PDF hazır
-- failed         → hata oluştu

-- Paketler: starter | pro | expert | free
CREATE TABLE IF NOT EXISTS analyses (
  id                CHAR(36)       NOT NULL,
  url               TEXT           NOT NULL,
  domain            VARCHAR(255)   NOT NULL,
  email             VARCHAR(255)   NOT NULL,
  status            ENUM('free','pending','processing','completed','failed') NOT NULL DEFAULT 'free',
  package_slug      ENUM('free','starter','pro','expert') NOT NULL DEFAULT 'free',
  free_data         JSON           DEFAULT NULL,
  full_data         JSON           DEFAULT NULL,
  pdf_path          VARCHAR(500)   DEFAULT NULL,
  pdf_sent_at       DATETIME(3)    DEFAULT NULL,
  payment_provider  ENUM('stripe','paypal') DEFAULT NULL,
  payment_id        VARCHAR(255)   DEFAULT NULL,
  payment_amount    DECIMAL(10,2)  DEFAULT NULL,
  payment_currency  VARCHAR(10)    DEFAULT 'USD',
  error_message     TEXT           DEFAULT NULL,
  created_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  completed_at      DATETIME(3)    DEFAULT NULL,
  PRIMARY KEY (id),
  KEY analyses_domain_idx (domain),
  KEY analyses_email_idx (email),
  KEY analyses_status_idx (status),
  KEY analyses_payment_id_idx (payment_id),
  KEY analyses_created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
