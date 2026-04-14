-- 001_auth_schema.sql
-- @vps/shared-backend auth + userRoles + profiles modülleriyle uyumlu

CREATE TABLE IF NOT EXISTS users (
  id                    CHAR(36)      NOT NULL,
  email                 VARCHAR(255)  NOT NULL,
  password_hash         VARCHAR(255)  NOT NULL,
  full_name             VARCHAR(255)  DEFAULT NULL,
  phone                 VARCHAR(50)   DEFAULT NULL,
  ecosystem_id          CHAR(36)      DEFAULT NULL,
  is_active             TINYINT(1)    NOT NULL DEFAULT 1,
  email_verified        TINYINT(1)    NOT NULL DEFAULT 0,
  reset_token           VARCHAR(255)  DEFAULT NULL,
  reset_token_expires   DATETIME(3)   DEFAULT NULL,
  rules_accepted_at     DATETIME(3)   DEFAULT NULL,
  created_at            DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at            DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  last_sign_in_at       DATETIME(3)   DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           CHAR(36)     NOT NULL,
  user_id      CHAR(36)     NOT NULL,
  token_hash   VARCHAR(255) NOT NULL,
  created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expires_at   DATETIME(3)  NOT NULL,
  revoked_at   DATETIME(3)  DEFAULT NULL,
  replaced_by  CHAR(36)     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY refresh_tokens_user_id_idx (user_id),
  KEY refresh_tokens_expires_at_idx (expires_at),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS profiles (
  id             CHAR(36)      NOT NULL,
  full_name      TEXT          DEFAULT NULL,
  phone          VARCHAR(64)   DEFAULT NULL,
  avatar_url     TEXT          DEFAULT NULL,
  address_line1  VARCHAR(255)  DEFAULT NULL,
  city           VARCHAR(128)  DEFAULT NULL,
  country        VARCHAR(128)  DEFAULT NULL,
  created_at     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT fk_profiles_users
    FOREIGN KEY (id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  id          CHAR(36)     NOT NULL,
  user_id     CHAR(36)     NOT NULL,
  role        ENUM('admin','editor','carrier','customer','dealer') NOT NULL DEFAULT 'customer',
  created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY user_roles_user_id_role_unique (user_id, role),
  KEY user_roles_user_id_idx (user_id),
  KEY user_roles_role_idx (role),
  CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin seed kullanıcısı
-- @ADMIN_EMAIL, @ADMIN_ID, @ADMIN_PASSWORD_HASH seed/index.ts tarafından set edilir
INSERT IGNORE INTO users (id, email, password_hash, full_name, is_active, email_verified)
VALUES (@ADMIN_ID, @ADMIN_EMAIL, @ADMIN_PASSWORD_HASH, 'Admin', 1, 1);

INSERT IGNORE INTO profiles (id) VALUES (@ADMIN_ID);

INSERT IGNORE INTO user_roles (id, user_id, role)
VALUES (UUID(), @ADMIN_ID, 'admin');
