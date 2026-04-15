-- 006_oauth_providers_schema.sql
-- OAuth provider linkleri (Google, vb.) — bir kullanıcının birden fazla provider'a
-- bağlanabilmesi için n:1 ilişki. provider+provider_id global olarak unique.

CREATE TABLE IF NOT EXISTS oauth_providers (
  id              CHAR(36)     NOT NULL,
  user_id         CHAR(36)     NOT NULL,
  provider        VARCHAR(50)  NOT NULL,                 -- 'google', ileride 'apple', 'github'
  provider_id     VARCHAR(255) NOT NULL,                 -- Google sub
  provider_email  VARCHAR(255) DEFAULT NULL,
  created_at      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY oauth_providers_provider_sub (provider, provider_id),
  KEY oauth_providers_user_id (user_id),
  CONSTRAINT fk_oauth_providers_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
