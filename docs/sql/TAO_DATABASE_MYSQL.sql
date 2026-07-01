-- =============================================================================
-- Tao 8 database cho cac microservice (JPA/Hibernate se tao bang khi chay service)
-- Chay bang: MySQL Workbench, DBeaver, hoac:
--   mysql -u root -p < TAO_DATABASE_MYSQL.sql
-- =============================================================================

CREATE DATABASE IF NOT EXISTS users
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS product_catalog
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS orders
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS payments
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS notifications
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS shipping
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS activity_log
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS product_recommendations
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kiem tra danh sach DB: SHOW DATABASES;
