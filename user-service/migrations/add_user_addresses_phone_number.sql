-- SĐT liên hệ theo địa chỉ. Bỏ qua lệnh ALTER nếu bảng đã có cột (hoặc dùng spring.jpa.hibernate.ddl-auto=update).
ALTER TABLE user_addresses ADD COLUMN phone_number VARCHAR(20) NULL;

-- (Tùy chọn MySQL/MariaDB) Gán SĐT từ bảng users cho địa chỉ đang là mặc định và còn trống SĐT —
-- chỉnh tên FK/bảng theo schema của bạn trước khi chạy.
/*
UPDATE user_addresses ua
INNER JOIN user_details ud ON ua.user_details_id = ud.id
INNER JOIN users u ON ud.user_id = u.id
SET ua.phone_number = u.phone_number
WHERE ua.is_default = TRUE
  AND (ua.phone_number IS NULL OR ua.phone_number = '')
  AND u.phone_number IS NOT NULL
  AND u.phone_number != '';
*/
