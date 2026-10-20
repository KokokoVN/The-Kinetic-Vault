-- Script tái tạo database với mã hóa utf8mb4 để hiển thị tiếng Việt chuẩn xác
-- Hãy chạy script này trong MySQL client của bạn (DBeaver, TablePlus, Navicat, MySQL Workbench, v.v.)

-- 1. Database Product Catalog
DROP DATABASE IF EXISTS product_catalog;
CREATE DATABASE product_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Database Users
DROP DATABASE IF EXISTS users;
CREATE DATABASE users CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Database Orders
DROP DATABASE IF EXISTS orders;
CREATE DATABASE orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sau khi chạy script này, hãy khởi động lại các Backend Microservices (npm run dev:backend:lite:inline)
-- Hibernate sẽ tự động tạo lại các bảng với mã hóa utf8mb4 chuẩn.
