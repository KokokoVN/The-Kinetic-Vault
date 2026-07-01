-- Move email + phone_number from users_details to users.
-- Run this ONCE on database `users` after deploying updated user-service code.

-- 1) Add new columns to users
-- (Nếu cột đã tồn tại, MySQL sẽ báo lỗi. Khi đó bỏ qua bước này.)
ALTER TABLE users
  ADD COLUMN email VARCHAR(120),
  ADD COLUMN phone_number VARCHAR(20);

-- 2) Copy data from users_details → users (based on users.user_details_id)
UPDATE users u
JOIN users_details d ON d.id = u.user_details_id
SET
  u.email = COALESCE(u.email, d.email),
  u.phone_number = COALESCE(u.phone_number, d.phone_number)
WHERE u.user_details_id IS NOT NULL;

-- 3) Add unique index on users.email
-- Note: If duplicate emails exist, fix them before enabling unique constraint.
CREATE UNIQUE INDEX ux_users_email ON users (email);

-- 4) Drop old columns from users_details
-- Nếu MySQL báo lỗi vì cột không tồn tại, bỏ qua.
ALTER TABLE users_details
  DROP COLUMN email,
  DROP COLUMN phone_number;

