-- =============================================================================
-- 206 = Điện thoại (chỉ máy — nhiều iPhone demo) | 207 = Laptop (chỉ máy — MacBook demo)
-- 208 = Phụ kiện điện thoại & laptop (cáp, ốp, túi, hub…)
-- DB: product_catalog  |  Giá ≤ 9.990 ₫ (demo)
--
--   • categories: 206, 207, 208
--   • products: 3021–3042
--   • product_variants: 9381–9434
--   • product_technical_specs: 5061–5126
-- =============================================================================
-- XÓA TRƯỚC KHI IMPORT LẠI (tuỳ chọn):
-- SET FOREIGN_KEY_CHECKS=0;
-- DELETE FROM `product_catalog`.`product_technical_specs` WHERE id BETWEEN 5061 AND 5126;
-- DELETE FROM `product_catalog`.`product_variants` WHERE id BETWEEN 9381 AND 9434;
-- DELETE FROM `product_catalog`.`products` WHERE id BETWEEN 3021 AND 3042;
-- DELETE FROM `product_catalog`.`categories` WHERE id IN (206, 207, 208);
-- SET FOREIGN_KEY_CHECKS=1;
-- =============================================================================

USE `product_catalog`;

SET NAMES utf8mb4;

START TRANSACTION;

INSERT INTO `product_catalog`.`categories` (
  `id`, `created_at`, `created_by`, `created_by_user_id`,
  `deleted_at`, `deleted_by`, `deleted_by_user_id`,
  `updated_at`, `updated_by`, `updated_by_user_id`,
  `name`, `slug`, `parent_id`, `is_hidden`
) VALUES
(206, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, N'Điện thoại', N'seed-v5-dien-thoai', NULL, b'0'),
(207, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, N'Laptop', N'seed-v5-laptop', NULL, b'0'),
(208, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, N'Phụ kiện điện thoại & laptop', N'seed-v5-phu-kien', NULL, b'0');

INSERT INTO `product_catalog`.`products` (
  `id`, `created_at`, `created_by`, `created_by_user_id`,
  `deleted_at`, `deleted_by`, `deleted_by_user_id`,
  `updated_at`, `updated_by`, `updated_by_user_id`,
  `availability`, `discription`, `price`, `product_name`, `sku`, `category_id`, `is_hidden`
) VALUES
-- Điện thoại (206): 3 iPhone demo
(3021, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'iPhone mini / SE-style demo; dung lượng và màu trong biến thể.', 7990.00, N'iPhone mini demo', 'S40-IPH-MINI', 206, b'0'),
(3022, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'iPhone Plus demo (màn lớn); dung lượng và màu trong biến thể.', 8290.00, N'iPhone Plus demo', 'S40-IPH-PLUS', 206, b'0'),
(3023, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'iPhone Pro Max style demo; cấu hình trong biến thể.', 8490.00, N'iPhone Pro Max demo', 'S40-IPH-PMAX', 206, b'0'),
-- Laptop (207): 2 MacBook demo
(3024, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'MacBook Air 13″ demo; chip / RAM / màu trong biến thể.', 8490.00, N'MacBook Air 13″ demo', 'S40-MAC-AIR13', 207, b'0'),
(3025, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'MacBook Pro 14″ demo; chip / RAM / màu trong biến thể.', 8990.00, N'MacBook Pro 14″ demo', 'S40-MAC-PRO14', 207, b'0'),
-- Phụ kiện (208)
(3026, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 466,
 N'Phụ kiện dùng chung laptop.', 7590.00, N'Chuột không dây silent', 'S40-PK-MSE01', 208, b'0'),
(3027, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 382,
 N'Phụ kiện chụp ảnh cho điện thoại.', 3990.00, N'Mini tripod điện thoại', 'S40-PK-TRI01', 208, b'0'),
(3028, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 418,
 N'Hub USB‑C cho laptop.', 8990.00, N'Hub USB‑C HDMI PD', 'S40-PK-HUB4', 208, b'0'),
(3029, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 591,
 N'Che webcam laptop + khăn lau màn.', 2990.00, N'Combo nắp webcam + khăn', 'S40-PK-WPK03', 208, b'0'),
(3030, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Phụ kiện sạc / sync cho iPhone.', 4490.00, N'Cáp USB‑C to Lightning 20 cm', 'S41-PK-CBL20', 208, b'0'),
(3031, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Ring holder dán lưng điện thoại (MagSafe-style demo).', 3590.00, N'Ring holder dán lưng', 'S41-PK-RING', 208, b'0'),
(3032, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Bảo vệ màn điện thoại.', 6990.00, N'Kính cường lực iPhone 6.7″', 'S41-PK-GL67', 208, b'0'),
(3033, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Phụ kiện SIM cho điện thoại.', 1990.00, N'Bộ hộp SIM + que chọc', 'S41-PK-SIMK', 208, b'0'),
(3034, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Loa ngoài Bluetooth.', 8990.00, N'Loa mini Bluetooth', 'S41-PK-BTSP', 208, b'0'),
(3035, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Cáp sạc laptop USB‑C.', 5490.00, N'Cáp USB‑C to USB‑C 1 m', 'S41-PK-CC1M', 208, b'0'),
(3036, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Đế tản nhiệt laptop.', 6290.00, N'Đế nhôm tản nhiệt laptop', 'S41-PK-STND', 208, b'0'),
(3037, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Bảo vệ trackpad laptop.', 3190.00, N'Miếng phủ trackpad', 'S41-PK-TRKP', 208, b'0'),
(3038, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Vệ sinh màn laptop.', 4190.00, N'Bộ lau màn Retina', 'S41-PK-SPRY', 208, b'0'),
(3039, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Nâng góc laptop.', 8490.00, N'Giá nâng góc laptop', 'S41-PK-LIFT', 208, b'0'),
(3040, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Túi chống sốc cho laptop mỏng.', 8490.00, N'Túi sleeve laptop', 'S40-PK-SLV', 208, b'0'),
(3041, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 0,
 N'Ốp lưng silicon cho iPhone.', 3290.00, N'Ốp lưng silicon iPhone', 'S40-PK-CASE', 208, b'0'),
(3042, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 395,
 N'Dán privacy màn điện thoại 6,1″.', 8390.00, N'Miếng dán privacy 6.1″', 'S40-PK-PRV61', 208, b'0');

INSERT INTO `product_catalog`.`product_variants` (
  `id`, `created_at`, `created_by`, `created_by_user_id`,
  `deleted_at`, `deleted_by`, `deleted_by_user_id`,
  `updated_at`, `updated_by`, `updated_by_user_id`,
  `availability`, `color`, `price`, `size`, `variant_image_url`, `product_id`
) VALUES
(9381, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 118, N'Đen', 8290.00, N'64 GB', NULL, 3021),
(9382, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 115, N'Xanh mint', 8390.00, N'64 GB', NULL, 3021),
(9383, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 108, N'Đen', 8990.00, N'128 GB', NULL, 3021),
(9384, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 103, N'Trắng', 9190.00, N'128 GB', NULL, 3021),
(9385, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 97, N'Xanh Navy', 9490.00, N'128 GB', NULL, 3021),
(9386, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 90, N'Lavender', 9890.00, N'128 GB', NULL, 3021),
(9387, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 112, N'Titan tự nhiên', 8490.00, N'128 GB', NULL, 3022),
(9388, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 108, N'Đen', 8690.00, N'128 GB', NULL, 3022),
(9389, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 102, N'Trắng', 8990.00, N'256 GB', NULL, 3022),
(9390, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 96, N'Xanh mòng két', 9290.00, N'256 GB', NULL, 3022),
(9391, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 90, N'Vàng nhạt', 9590.00, N'512 GB', NULL, 3022),
(9392, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 84, N'Titan xanh', 9890.00, N'512 GB', NULL, 3022),
(9425, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 95, N'Titan đen', 8690.00, N'256 GB', NULL, 3023),
(9426, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 91, N'Titan tự nhiên', 8890.00, N'256 GB', NULL, 3023),
(9427, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 86, N'Trắng bạc', 9190.00, N'512 GB', NULL, 3023),
(9428, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 80, N'Xanh mòng két', 9490.00, N'512 GB', NULL, 3023),
(9429, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 74, N'Vàng đồng', 9790.00, N'1 TB', NULL, 3023),
(9430, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 68, N'Tím deep', 9990.00, N'1 TB', NULL, 3023),
(9393, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 42, N'Đen không gian', 8690.00, N'M2 8G/256', NULL, 3024),
(9394, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 39, N'Bạc', 8890.00, N'M2 8G/256', NULL, 3024),
(9395, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 35, N'Xám không gian', 9390.00, N'M3 16G/512', NULL, 3024),
(9396, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 31, N'Vàng nhạt', 9590.00, N'M3 16G/512', NULL, 3024),
(9397, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 26, N'Bạc', 9890.00, N'M3 24G/1TB', NULL, 3024),
(9398, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 22, N'Xanh midnight', 9990.00, N'M3 24G/1TB', NULL, 3024),
(9399, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 38, N'Đen không gian', 9190.00, N'M3 Pro 18G/512', NULL, 3025),
(9400, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 34, N'Bạc', 9390.00, N'M3 Pro 18G/512', NULL, 3025),
(9401, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 30, N'Đen không gian', 9690.00, N'M3 Max 36G/1TB', NULL, 3025),
(9402, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 26, N'Bạc', 9890.00, N'M3 Max 36G/1TB', NULL, 3025),
(9403, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 22, N'Xám', 9950.00, N'M4 Pro 24G/512', NULL, 3025),
(9404, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 18, N'Đen', 9990.00, N'M4 Pro 24G/512', NULL, 3025),
(9405, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 300, N'Đen', 4590.00, N'20 cm', NULL, 3030),
(9406, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 292, N'Trắng', 4790.00, N'20 cm', NULL, 3030),
(9407, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 280, N'Bạc', 3690.00, N'Đế mỏng', NULL, 3031),
(9408, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 275, N'Đen', 3890.00, N'Đế dày', NULL, 3031),
(9409, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 260, N'Trong suốt', 7190.00, N'6.7″ chuẩn', NULL, 3032),
(9410, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 252, N'Matte', 7390.00, N'6.7″ matte', NULL, 3032),
(9411, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 400, N'Bạc', 2090.00, N'Hộp nhựa', NULL, 3033),
(9412, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 388, N'Đen', 2290.00, N'Hộp kim loại', NULL, 3033),
(9413, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 180, N'Trắng', 9090.00, N'5 W', NULL, 3034),
(9414, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 172, N'Xám không gian', 9390.00, N'5 W+', NULL, 3034),
(9415, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 220, N'Đen', 5590.00, N'1 m', NULL, 3035),
(9416, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 210, N'Trắng', 5790.00, N'1 m', NULL, 3035),
(9417, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 150, N'Bạc', 6490.00, N'13″', NULL, 3036),
(9418, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 142, N'Xám', 6790.00, N'15″', NULL, 3036),
(9419, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 330, N'Mờ nhám', 3290.00, N'Air 13″', NULL, 3037),
(9420, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 318, N'Trong suốt', 3490.00, N'Pro 13–14″', NULL, 3037),
(9421, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 255, N'Bộ S', 4290.00, N'50 ml', NULL, 3038),
(9422, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 240, N'Bộ L', 4590.00, N'100 ml', NULL, 3038),
(9423, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 130, N'Đen', 8690.00, N'Góc ~15°', NULL, 3039),
(9424, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 122, N'Bạc', 8990.00, N'Góc ~18°', NULL, 3039),
(9431, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 140, N'Đen', 8590.00, N'13 inch', NULL, 3040),
(9432, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 128, N'Xám', 8890.00, N'15 inch', NULL, 3040),
(9433, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 620, N'Trong suốt', 3290.00, N'Mỏng 0.8 mm', NULL, 3041),
(9434, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 600, N'Đen graphite', 3490.00, N'Matte grip', NULL, 3041);

INSERT INTO `product_catalog`.`product_technical_specs` (
  `id`, `created_at`, `created_by`, `created_by_user_id`,
  `deleted_at`, `deleted_by`, `deleted_by_user_id`,
  `updated_at`, `updated_by`, `updated_by_user_id`,
  `sort_order`, `spec_key`, `spec_value`, `unit`, `product_id`
) VALUES
(5061, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Màn hình', N'IPS 5,5″ HD+ 60 Hz (demo)', NULL, 3021),
(5062, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Kết nối', N'5G / Wi‑Fi 6 / BT 5.2 (claim)', NULL, 3021),
(5063, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Pin', N'3000 mAh typ (demo)', NULL, 3021),
(5064, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Màn hình', N'Super Retina 6,7″ demo', NULL, 3022),
(5065, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Camera sau', N'48 MP + UW (marketing)', NULL, 3022),
(5066, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Chip', N'A‑series demo 6 nhân', NULL, 3022),
(5067, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Màn hình', N'ProMotion 6,7″ demo', NULL, 3023),
(5068, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Camera', N'Tele + LiDAR (claim)', NULL, 3023),
(5069, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Khung', N'Titan / thép không gỉ (demo)', NULL, 3023),
(5070, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Màn hình', N'Liquid Retina 13,6″ (demo)', NULL, 3024),
(5071, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'HĐH', N'macOS (demo storefront)', NULL, 3024),
(5072, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Cổng', N'MagSafe 3 + USB‑C ×2', NULL, 3024),
(5073, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Màn hình', N'Liquid Retina XDR 14,2″ (demo)', NULL, 3025),
(5074, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Chip', N'Apple Silicon M‑series (demo)', NULL, 3025),
(5075, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Kết nối', N'HDMI + SD + Thunderbolt (claim)', NULL, 3025),
(5076, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Độ phân giải', N'1200 dpi (claim)', NULL, 3026),
(5077, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Kết nối', N'2.4 GHz USB dongle', NULL, 3026),
(5078, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Click', N'Silent (claim)', NULL, 3026),
(5079, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Giá đỡ', N'3 chân gấp', NULL, 3027),
(5080, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Ren', N'1/4″', NULL, 3027),
(5081, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Phù hợp', N'Điện thoại 5,5″–6,8″', NULL, 3027),
(5082, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'HDMI', N'4K@30 (claim)', NULL, 3028),
(5083, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'USB', N'USB‑A 3.0 + PD pass', NULL, 3028),
(5084, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Nhiệt độ', N'0–40 °C', NULL, 3028),
(5085, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Trong bộ', N'3 nắp + khăn', NULL, 3029),
(5086, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Nắp', N'Nano dán', NULL, 3029),
(5087, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Khăn', N'Microfiber 200 mm', NULL, 3029),
(5088, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Đầu nối', N'USB‑C + Lightning', NULL, 3030),
(5089, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Độ dài', N'200 mm', NULL, 3030),
(5090, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Dòng điện', N'3 A max (claim)', NULL, 3030),
(5091, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Chất liệu', N'PC + silicone', NULL, 3031),
(5092, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Keo', N'Removable (claim)', NULL, 3031),
(5093, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Xoay', N'360° (claim)', NULL, 3031),
(5094, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Độ dày', N'0,33 mm', NULL, 3032),
(5095, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Độ cứng', N'9H (marketing)', NULL, 3032),
(5096, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Cỡ', N'6,7″', NULL, 3032),
(5097, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Khay', N'Nano SIM ×2', NULL, 3033),
(5098, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Que', N'Thép không gỉ', NULL, 3033),
(5099, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Phụ kiện', N'Vòng chống mất', NULL, 3033),
(5100, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Bluetooth', N'5.3 (claim)', NULL, 3034),
(5101, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Pin', N'800 mAh', NULL, 3034),
(5102, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Codec', N'AAC (claim)', NULL, 3034),
(5103, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Chuẩn', N'USB‑PD 60 W (claim)', NULL, 3035),
(5104, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Độ dài', N'1 m', NULL, 3035),
(5105, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Vỏ', N'TPE', NULL, 3035),
(5106, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Chất liệu', N'Nhôm', NULL, 3036),
(5107, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Góc nâng', N'12° (claim)', NULL, 3036),
(5108, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Tản nhiệt', N'Rãnh thoát khí', NULL, 3036),
(5109, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Độ dày', N'0,15 mm', NULL, 3037),
(5110, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Bề mặt', N'Matte / trong', NULL, 3037),
(5111, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Dán', N'Không bọt (claim)', NULL, 3037),
(5112, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Thành phần', N'Không cồn mạnh (claim)', NULL, 3038),
(5113, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Khăn', N'Microfiber', NULL, 3038),
(5114, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Phù hợp', N'Retina / glass', NULL, 3038),
(5115, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Chất liệu', N'Nhôm gấp', NULL, 3039),
(5116, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Tải', N'≤2,5 kg (claim)', NULL, 3039),
(5117, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Đệm', N'Cao su 4 điểm', NULL, 3039),
(5118, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Chất liệu', N'Neoprene + nỉ', NULL, 3040),
(5119, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Khóa', N'Khóa kéo', NULL, 3040),
(5120, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Ngăn', N'Lưới phụ kiện', NULL, 3040),
(5121, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Chất liệu', N'Silicon TPU', NULL, 3041),
(5122, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Phù hợp', N'iPhone 6,1–6,7″ (claim)', NULL, 3041),
(5123, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Camera', N'Ô cắt chính xác (claim)', NULL, 3041),
(5124, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 1, N'Độ dày', N'0,35 mm', NULL, 3042),
(5125, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 2, N'Góc nhìn', N'±30° (demo)', NULL, 3042),
(5126, NOW(6), 'seed', NULL, NULL, NULL, NULL, NOW(6), 'seed', NULL, 3, N'Cỡ màn', N'6,1″', NULL, 3042);

COMMIT;
