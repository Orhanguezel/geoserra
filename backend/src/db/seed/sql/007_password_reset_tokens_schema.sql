-- 007_password_reset_tokens_schema.sql
-- Şifre sıfırlama token'ları

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires_at DATETIME(3)  NOT NULL,
  used_at    DATETIME(3),
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY prt_token_uq (token),
  INDEX prt_user_id_idx (user_id),
  INDEX prt_expires_at_idx (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
