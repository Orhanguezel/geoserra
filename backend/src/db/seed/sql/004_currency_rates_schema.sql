-- 004_currency_rates_schema.sql
-- open.er-api.com'dan çekilen USD bazlı döviz kurları

CREATE TABLE IF NOT EXISTS currency_rates (
  id          CHAR(36)       NOT NULL,
  base        VARCHAR(10)    NOT NULL DEFAULT 'USD',
  target      VARCHAR(10)    NOT NULL,
  rate        DECIMAL(15,6)  NOT NULL,
  fetched_at  DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY currency_rates_base_target_unique (base, target),
  KEY currency_rates_fetched_at_idx (fetched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Başlangıç değerleri (ör. kur fetch edilemediğinde fallback)
INSERT IGNORE INTO currency_rates (id, base, target, rate)
VALUES
  (UUID(), 'USD', 'TRY', 38.50),
  (UUID(), 'USD', 'EUR', 0.92);
