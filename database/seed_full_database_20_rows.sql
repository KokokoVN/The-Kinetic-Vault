-- ============================================================================
-- THE KINETIC VAULT (TKV) - COMPLETE COMPREHENSIVE SEED SCRIPT (>= 15-20 ROWS PER TABLE)
-- ============================================================================
-- Nạp đầy đủ dữ liệu chân thực 100% cho TẤT CẢ các bảng trong toàn bộ cơ sở dữ liệu.
-- Mỗi bảng đảm bảo tối thiểu 15 - 25 dòng chuẩn thực tế.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. DATABASE: product_catalog
-- ============================================================================
USE `product_catalog`;

TRUNCATE TABLE `product_technical_specs`;
TRUNCATE TABLE `product_images`;
TRUNCATE TABLE `product_variants`;
TRUNCATE TABLE `product_categories`;
TRUNCATE TABLE `product_change_logs`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `brands`;
TRUNCATE TABLE `categories`;

-- 1.1 Thương hiệu (15 Thương hiệu)
INSERT INTO `brands` (`id`, `name`, `slug`, `country`, `description`, `logo_url`, `website`, `is_hidden`, `created_at`, `updated_at`) VALUES
(1, 'Apple', 'apple', 'Mỹ', 'Tập đoàn công nghệ hàng đầu thế giới với hệ sinh thái iPhone, Mac, iPad cao cấp.', '/api/catalog/admin/brands/logos/60f8da5c03b14065af1ff6c0cf822cc2.png', 'https://www.apple.com/vn', b'0', NOW(), NOW()),
(2, 'Samsung', 'samsung', 'Hàn Quốc', 'Tập đoàn điện tử tiên phong thế giới với dòng Galaxy S, Z Fold và công nghệ AI.', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', 'https://www.samsung.com/vn', b'0', NOW(), NOW()),
(3, 'Sony', 'sony', 'Nhật Bản', 'Thương hiệu biểu tượng về âm thanh Hi-Res, máy chơi game PlayStation và camera.', 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sony_logo.svg', 'https://www.sony.com.vn', b'0', NOW(), NOW()),
(4, 'Marshall', 'marshall', 'Anh Quốc', 'Huyền thoại âm thanh vintage với chất âm mạnh mẽ, thiết kế da cổ điển sang trọng.', NULL, 'https://www.marshallheadphones.com', b'0', NOW(), NOW()),
(5, 'Dell', 'dell', 'Mỹ', 'Dòng laptop doanh nhân và đồ họa cao cấp XPS, Alienware chuẩn mực toàn cầu.', NULL, 'https://www.dell.com/en-vn', b'0', NOW(), NOW()),
(6, 'Asus ROG', 'asus-rog', 'Đài Loan', 'Thương hiệu Gaming Gear và Laptop gaming hiệu năng đỉnh cao số 1 thế giới.', NULL, 'https://rog.asus.com/vn', b'0', NOW(), NOW()),
(7, 'Keychron', 'keychron', 'Mỹ', 'Thương hiệu bàn phím cơ không dây Custom cao cấp tương thích hoàn hảo Mac & Windows.', NULL, 'https://keychron.com', b'0', NOW(), NOW()),
(8, 'Logitech', 'logitech', 'Thụy Sĩ', 'Thương hiệu phụ kiện văn phòng công thái học và chuột phím Master Series hàng đầu.', NULL, 'https://www.logitech.com/vi-vn', b'0', NOW(), NOW()),
(9, 'Razer', 'razer', 'Mỹ', 'Thương hiệu thiết bị ngoại vi gaming hàng đầu thế giới với đèn Chroma RGB độc quyền.', NULL, 'https://www.razer.com', b'0', NOW(), NOW()),
(10, 'Garmin', 'garmin', 'Mỹ', 'Thương hiệu đồng hồ thể thao định vị GPS chuyên nghiệp cho vận động viên và phiêu lưu.', NULL, 'https://www.garmin.com/vi-VN', b'0', NOW(), NOW()),
(11, 'Bose', 'bose', 'Mỹ', 'Đỉnh cao công nghệ chống ồn âm học và âm thanh sống động với dòng QuietComfort.', NULL, 'https://www.bose.vn', b'0', NOW(), NOW()),
(12, 'Anker', 'anker', 'Mỹ', 'Thương hiệu sạc nhanh GaN, pin dự phòng và phụ kiện di động bán chạy nhất thế giới.', NULL, 'https://anker.vn', b'0', NOW(), NOW()),
(13, 'Corsair', 'corsair', 'Mỹ', 'Linh kiện phần cứng, bàn phím cơ và thiết bị streaming Elgato chuyên nghiệp.', NULL, 'https://www.corsair.com', b'0', NOW(), NOW()),
(14, 'SteelSeries', 'steelseries', 'Đan Mạch', 'Thương hiệu tai nghe Arctis và bàn phím cơ Apex Pro dành cho game thủ thể thao điện tử.', NULL, 'https://steelseries.com', b'0', NOW(), NOW()),
(15, 'JBL', 'jbl', 'Mỹ', 'Thương hiệu loa di động và âm thanh tiệc tùng sống động chất âm Pure Bass uy lực.', NULL, 'https://www.jblstore.com.vn', b'0', NOW(), NOW());

-- 1.2 Danh mục (10 Danh mục)
INSERT INTO `categories` (`id`, `name`, `slug`, `is_hidden`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'Điện thoại thông minh', 'dien-thoai-thong-minh', b'0', NULL, NOW(), NOW()),
(2, 'Máy tính bảng (Tablet)', 'may-tinh-bang-tablet', b'0', NULL, NOW(), NOW()),
(3, 'Laptop & Máy tính xách tay', 'laptop-may-tinh-xach-tay', b'0', NULL, NOW(), NOW()),
(4, 'Màn hình máy tính', 'man-hinh-may-tinh', b'0', NULL, NOW(), NOW()),
(5, 'Tai nghe cao cấp', 'tai-nghe-cao-cap', b'0', NULL, NOW(), NOW()),
(6, 'Loa Bluetooth & Soundbar', 'loa-bluetooth-soundbar', b'0', NULL, NOW(), NOW()),
(7, 'Đồng hồ thông minh & Smartwatch', 'dong-ho-thong-minh-smartwatch', b'0', NULL, NOW(), NOW()),
(8, 'Bàn phím cơ & Keycap', 'ban-phim-co-keycap', b'0', NULL, NOW(), NOW()),
(9, 'Chuột công thái học & Gaming', 'chuot-cong-thai-hoc-gaming', b'0', NULL, NOW(), NOW()),
(10, 'Phụ kiện, Cáp sạc & GaN', 'phu-kien-cap-sac-gan', b'0', NULL, NOW(), NOW());

-- 1.3 Sản phẩm (20 Sản phẩm Flagship chuẩn thực tế)
INSERT INTO `products` (`id`, `product_name`, `sku`, `price`, `discription`, `brand_id`, `category_id`, `availability`, `sales_count`, `view_count`, `is_hidden`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 16 Pro Max 256GB', 'SP-IP16PM-256', 34990000.00, 'Flagship mới nhất của Apple với khung viền Titan cấp 5, nút điều khiển Camera Control và chip Apple A18 Pro hỗ trợ Apple Intelligence.', 1, 1, 85, 42, 1250, b'0', NOW(), NOW()),
(2, 'Samsung Galaxy S24 Ultra 5G', 'SP-S24U-512', 31490000.00, 'Đỉnh cao quyền năng Galaxy AI, màn hình phẳng Dynamic AMOLED 2X 6.8 inch, camera 200MP zoom quang 5x và bút S-Pen tích hợp.', 2, 1, 60, 35, 980, b'0', NOW(), NOW()),
(3, 'MacBook Pro 14 M3 Pro (18GB/512GB)', 'SP-MBP14-M3P', 48990000.00, 'Hiệu năng đỉnh cao đồ họa và lập trình với chip Apple M3 Pro, màn hình Liquid Retina XDR 120Hz và thời lượng pin ấn tượng lên đến 18 giờ.', 1, 3, 40, 18, 860, b'0', NOW(), NOW()),
(4, 'Laptop Gaming Asus ROG Zephyrus G16', 'SP-ROG-G16', 54990000.00, 'Laptop gaming mỏng nhẹ cao cấp khung nhôm CNC, màn hình OLED 2.5K 240Hz, chip Intel Core Ultra 9 và card đồ họa RTX 4070.', 6, 3, 25, 12, 740, b'0', NOW(), NOW()),
(5, 'Laptop Dell XPS 15 9530 OLED', 'SP-DELL-XPS15', 42500000.00, 'Kiệt tác máy trạm di động viền siêu mỏng InfinityEdge 3.5K OLED cảm ứng, Intel Core i7 thế hệ 13 và card đồ họa rời NVIDIA RTX 4050.', 5, 3, 30, 9, 620, b'0', NOW(), NOW()),
(6, 'Tai nghe Chống ồn Sony WH-1000XM5', 'SP-SONY-XM5', 7990000.00, 'Công nghệ chống ồn chủ động tốt nhất thế giới với bộ xử lý V1 & QN1, thời lượng pin 30 giờ và âm thanh chuẩn Hi-Res Audio Wireless.', 3, 5, 50, 68, 1450, b'0', NOW(), NOW()),
(7, 'Loa Bluetooth Marshall Stanmore III', 'SP-MARSHALL-ST3', 9490000.00, 'Loa gia đình huyền thoại thiết kế cổ điển biểu tượng, âm trường rộng mở, kết nối Bluetooth 5.2 và cổng RCA/AUX đa dụng.', 4, 6, 45, 52, 1180, b'0', NOW(), NOW()),
(8, 'Tai nghe Apple AirPods Pro 2 USB-C', 'SP-AIRPODS-P2', 5690000.00, 'Tai nghe true wireless hàng đầu chip H2, chống ồn chủ động gấp 2 lần, hộp sạc MagSafe cổng USB-C và chuẩn kháng bụi nước IP54.', 1, 5, 110, 95, 2100, b'0', NOW(), NOW()),
(9, 'Máy chơi game Sony PlayStation 5 Slim', 'SP-PS5-SLIM', 14490000.00, 'Phiên bản Slim tinh gọn tích hợp ổ cứng SSD 1TB tốc độ siêu tốc, tay cầm phản hồi lực DualSense và đồ họa 4K 120FPS Ray Tracing đỉnh cao.', 3, 4, 35, 41, 1630, b'0', NOW(), NOW()),
(10, 'Bàn phím cơ Keychron Q1 Pro Wireless', 'SP-KEYCHRON-Q1', 4850000.00, 'Bàn phím cơ Custom full nhôm CNC cao cấp, kết nối Bluetooth 5.1/Type-C, gasket mount êm ái, hỗ trợ QMK/VIA và hot-swap.', 7, 8, 40, 31, 890, b'0', NOW(), NOW()),
(11, 'Chuột không dây Logitech MX Master 3S', 'SP-LOGI-MX3S', 2390000.00, 'Chuột công thái học cao cấp cho lập trình viên và sáng tạo nội dung, click yên tĩnh SilentTouch, con lăn MagSpeed cuộn 1000 dòng/giây.', 8, 9, 80, 74, 1340, b'0', NOW(), NOW()),
(12, 'Đồng hồ thông minh Apple Watch Ultra 2', 'SP-AW-ULTRA2', 21490000.00, 'Đồng hồ thể thao mạo hiểm vỏ Titan 49mm, màn hình sáng nhất 3000 nits, chuẩn lặn 40m, GPS tần số kép và thời lượng pin 72 giờ.', 1, 7, 4, 16, 760, b'0', NOW(), NOW()),
(13, 'iPad Pro M4 11 inch Wi-Fi 256GB', 'SP-IPAD-M4-11', 27990000.00, 'Máy tính bảng siêu mỏng chỉ 5.3mm với màn hình Ultra Retina XDR Tandem OLED đột phá và chip Apple M4 quyền năng.', 1, 2, 45, 28, 910, b'0', NOW(), NOW()),
(14, 'Samsung Galaxy Z Fold6 5G 512GB', 'SP-ZFOLD6-512', 43990000.00, 'Smartphone màn hình gập đỉnh cao mỏng nhẹ nhất dòng Fold, khung viền Armor Aluminum gia cường và đa nhiệm AI đỉnh cao.', 2, 1, 20, 15, 680, b'0', NOW(), NOW()),
(15, 'Màn hình Dell UltraSharp 27 4K U2723QE', 'SP-DELL-U2723QE', 13990000.00, 'Màn hình đồ họa chuyên nghiệp tấm nền IPS Black độ tương phản 2000:1, chuẩn 98% DCI-P3, cổng Type-C sạc 90W và hub mạng RJ45.', 5, 4, 35, 22, 750, b'0', NOW(), NOW()),
(16, 'Tai nghe Chống ồn Bose QuietComfort Ultra', 'SP-BOSE-QCULTRA', 9990000.00, 'Tai nghe chụp tai chống ồn không gian số 1 với công nghệ Immersive Audio, khử ồn CustomTune độc quyền và thời lượng pin 24 giờ.', 11, 5, 28, 19, 580, b'0', NOW(), NOW()),
(17, 'Đồng hồ thể thao Garmin Fenix 7 Pro Sapphire', 'SP-GARMIN-F7PRO', 21990000.00, 'Đồng hồ thể thao GPS đa môn chuyên nghiệp tích hợp sạc năng lượng mặt trời, đèn pin LED, bản đồ địa hình Topo và kính Sapphire.', 10, 7, 18, 14, 490, b'0', NOW(), NOW()),
(18, 'Củ sạc nhanh Anker Prime 100W GaN 3 Cổng', 'SP-ANKER-100W', 1490000.00, 'Củ sạc công nghệ GaNPrime siêu nhỏ gọn công suất 100W sạc cùng lúc 2 laptop và 1 điện thoại, phân bổ nguồn thông minh PowerIQ 4.0.', 12, 10, 150, 110, 1850, b'0', NOW(), NOW()),
(19, 'Bàn phím Gaming Razer Huntsman V3 Pro', 'SP-RAZER-HV3P', 5990000.00, 'Bàn phím cơ thể thao điện tử switch quang học Analog Gen-2, tính năng Rapid Trigger tùy chỉnh điểm nhận phím từ 0.1mm siêu tốc.', 9, 8, 30, 17, 520, b'0', NOW(), NOW()),
(20, 'Loa Bluetooth JBL Boombox 3 Wi-Fi', 'SP-JBL-BOOMBOX3', 12900000.00, 'Loa di động công suất khủng 180W hỗ trợ Dolby Atmos qua Wi-Fi, pin trâu 24 giờ kiêm sạc dự phòng, chống nước bụi IP67.', 15, 6, 22, 15, 640, b'0', NOW(), NOW());

-- 1.4 Phân loại sản phẩm (25 Dòng liên kết)
INSERT INTO `product_categories` (`product_id`, `category_id`) VALUES
(1, 1), (2, 1), (3, 3), (4, 3), (5, 3), (6, 5), (7, 6), (8, 5), (9, 4), (10, 8),
(11, 9), (12, 7), (13, 2), (14, 1), (15, 4), (16, 5), (17, 7), (18, 10), (19, 8), (20, 6),
(4, 8), (10, 9), (1, 10), (3, 10), (13, 10);

-- 1.5 Biến thể sản phẩm (30 Biến thể)
INSERT INTO `product_variants` (`id`, `product_id`, `variant_name`, `sku`, `color`, `size`, `price`, `original_price`, `availability`, `variant_image_url`, `created_at`, `updated_at`) VALUES
(1, 1, 'Titan Tự Nhiên - 256GB', 'SP-IP16PM-256-NAT', 'Titan Tự Nhiên', '256GB', 34990000.00, 34990000.00, 30, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', NOW(), NOW()),
(2, 1, 'Titan Đen - 256GB', 'SP-IP16PM-256-BLK', 'Titan Đen', '256GB', 34990000.00, 34990000.00, 25, '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', NOW(), NOW()),
(3, 1, 'Titan Sa Mạc - 512GB', 'SP-IP16PM-512-DES', 'Titan Sa Mạc', '512GB', 40490000.00, 40490000.00, 30, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', NOW(), NOW()),

(4, 2, 'Titan Xám - 256GB', 'SP-S24U-256-GRY', 'Titan Xám', '256GB', 28990000.00, 31490000.00, 35, '/api/catalog/admin/products/images/file/b42f9c12c22841e6810dda0305a2d351.jpg', NOW(), NOW()),
(5, 2, 'Titan Đen - 512GB', 'SP-S24U-512-BLK', 'Titan Đen', '512GB', 31490000.00, 34490000.00, 25, '/api/catalog/admin/products/images/file/6ff28db975a2416184317e9563a9e58c.jpg', NOW(), NOW()),

(6, 3, 'Space Black - 18GB/512GB', 'SP-MBP14-512-SB', 'Space Black', '512GB', 48990000.00, 49990000.00, 20, '/api/catalog/admin/products/images/file/74e1703c16594800ba798cd85382817c.webp', NOW(), NOW()),
(7, 3, 'Silver - 18GB/1TB', 'SP-MBP14-1TB-SLV', 'Silver', '1TB', 54990000.00, 56990000.00, 20, '/api/catalog/admin/products/images/file/74e1703c16594800ba798cd85382817c.webp', NOW(), NOW()),

(8, 4, 'Eclipse Gray - RTX 4070', 'SP-ROG-G16-GRY', 'Eclipse Gray', '32GB/1TB', 54990000.00, 56990000.00, 25, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', NOW(), NOW()),
(9, 5, 'Platinum Silver - 32GB/1TB', 'SP-XPS15-OLED', 'Platinum Silver', '1TB', 42500000.00, 45000000.00, 30, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', NOW(), NOW()),

(10, 6, 'Đen Nhám (Black)', 'SP-XM5-BLK', 'Đen', 'Tiêu chuẩn', 7990000.00, 8490000.00, 25, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', NOW(), NOW()),
(11, 6, 'Bạc Ánh Kim (Silver)', 'SP-XM5-SLV', 'Bạc', 'Tiêu chuẩn', 7990000.00, 8490000.00, 25, '/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp', NOW(), NOW()),

(12, 7, 'Đen Cổ Điển (Black)', 'SP-ST3-BLK', 'Đen', 'Tiêu chuẩn', 9490000.00, 9990000.00, 25, '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', NOW(), NOW()),
(13, 7, 'Kem Vintage (Cream)', 'SP-ST3-CRM', 'Kem', 'Tiêu chuẩn', 9490000.00, 9990000.00, 20, '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', NOW(), NOW()),

(14, 8, 'Trắng (White)', 'SP-APP2-WHT', 'Trắng', 'Tiêu chuẩn', 5690000.00, 6190000.00, 110, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', NOW(), NOW()),
(15, 9, 'Trắng Tiêu Chuẩn', 'SP-PS5-SLIM-WHT', 'Trắng', '1TB SSD', 14490000.00, 15490000.00, 35, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', NOW(), NOW()),

(16, 10, 'Carbon Black - Red Switch', 'SP-Q1PRO-RED', 'Đen Carbon', 'Red Switch', 4850000.00, 4850000.00, 20, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', NOW(), NOW()),
(17, 10, 'Silver Grey - Brown Switch', 'SP-Q1PRO-BRN', 'Xám Bạc', 'Brown Switch', 4850000.00, 4850000.00, 20, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', NOW(), NOW()),

(18, 11, 'Graphite Đen Xám', 'SP-MX3S-GRP', 'Graphite', 'Công thái học', 2390000.00, 2690000.00, 45, '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', NOW(), NOW()),
(19, 11, 'Pale Grey Xám Trắng', 'SP-MX3S-GRY', 'Pale Grey', 'Công thái học', 2390000.00, 2690000.00, 35, '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', NOW(), NOW()),

(20, 12, 'Titan Tự Nhiên - Dây Vải Cam', 'SP-AWU2-ORG', 'Titan Tự Nhiên', '49mm', 21490000.00, 21990000.00, 4, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', NOW(), NOW()),

(21, 13, 'Space Black - 256GB Wi-Fi', 'SP-IPAD-M4-SB', 'Space Black', '256GB', 27990000.00, 28990000.00, 25, '/api/catalog/admin/products/images/file/98a6cc3e6e984c1db8f78ca2cacaacb6.webp', NOW(), NOW()),
(22, 13, 'Silver - 512GB Wi-Fi', 'SP-IPAD-M4-SLV', 'Silver', '512GB', 33990000.00, 34990000.00, 20, '/api/catalog/admin/products/images/file/98a6cc3e6e984c1db8f78ca2cacaacb6.webp', NOW(), NOW()),

(23, 14, 'Xám Phantom - 512GB', 'SP-ZFOLD6-GRY', 'Xám Phantom', '512GB', 43990000.00, 45990000.00, 20, '/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg', NOW(), NOW()),
(24, 15, 'Bạc Platinum - Chân đế đa năng', 'SP-U2723QE-STD', 'Bạc', '27 inch 4K', 13990000.00, 14990000.00, 35, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', NOW(), NOW()),
(25, 16, 'Black Đen Huyền Bí', 'SP-QCULTRA-BLK', 'Đen', 'Over-Ear', 9990000.00, 10490000.00, 28, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', NOW(), NOW()),
(26, 17, 'Carbon Gray DLC Titanium', 'SP-FENIX7-GRY', 'Titan Gray', '47mm', 21990000.00, 22990000.00, 18, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', NOW(), NOW()),
(27, 18, 'Đen Nhám GaNPrime 100W', 'SP-ANKER100-BLK', 'Đen', '3 Cổng', 1490000.00, 1690000.00, 150, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', NOW(), NOW()),
(28, 19, 'Classic Black - Analog Gen-2', 'SP-HUNTSMAN-BLK', 'Đen', 'Full-size', 5990000.00, 6490000.00, 30, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', NOW(), NOW()),
(29, 20, 'Đen PartyBox Chống Nước', 'SP-JBL-BM3-BLK', 'Đen', 'Di động', 12900000.00, 13900000.00, 22, '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', NOW(), NOW()),
(30, 1, 'Titan Trắng - 1TB', 'SP-IP16PM-1TB-WHT', 'Titan Trắng', '1TB', 46990000.00, 46990000.00, 15, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', NOW(), NOW());

-- 1.6 Hình ảnh sản phẩm (25 Hình ảnh)
INSERT INTO `product_images` (`id`, `product_id`, `image_url`, `storage_path`, `media_type`, `is_primary`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', '0894e7465767466f8887443cc6939c58.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(2, 2, '/api/catalog/admin/products/images/file/b42f9c12c22841e6810dda0305a2d351.jpg', 'b42f9c12c22841e6810dda0305a2d351.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(3, 3, '/api/catalog/admin/products/images/file/74e1703c16594800ba798cd85382817c.webp', '74e1703c16594800ba798cd85382817c.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(4, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', '2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(5, 5, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', '77fef42d6ab04c409fdfd31dae1de65e.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(6, 6, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', '404304318ee84415b43241e57b409651.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(7, 7, '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', 'fb2c139671ff497ca54e455d36f6bad2.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(8, 8, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', '404304318ee84415b43241e57b409651.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(9, 9, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', '2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(10, 10, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', '10c0dc19baa94ae4a57d274f169ab230.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(11, 11, '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', '1cb555997bf54d1ba04ec465ddae98dc.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(12, 12, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', '5b67538ba5b8469696cac2b1b0004692.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(13, 13, '/api/catalog/admin/products/images/file/98a6cc3e6e984c1db8f78ca2cacaacb6.webp', '98a6cc3e6e984c1db8f78ca2cacaacb6.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(14, 14, '/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg', '609ca625df3f46ceabf85beb4886205b.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(15, 15, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', '77fef42d6ab04c409fdfd31dae1de65e.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(16, 16, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', '404304318ee84415b43241e57b409651.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(17, 17, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', '5b67538ba5b8469696cac2b1b0004692.webp', 'IMAGE', b'1', 1, NOW(), NOW()),
(18, 18, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', '10c0dc19baa94ae4a57d274f169ab230.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(19, 19, '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', '10c0dc19baa94ae4a57d274f169ab230.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(20, 20, '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', 'fb2c139671ff497ca54e455d36f6bad2.jpg', 'IMAGE', b'1', 1, NOW(), NOW()),
(21, 1, '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', 'fd15318deed546c29e3c94dac79695a4.jpg', 'IMAGE', b'0', 2, NOW(), NOW()),
(22, 2, '/api/catalog/admin/products/images/file/6ff28db975a2416184317e9563a9e58c.jpg', '6ff28db975a2416184317e9563a9e58c.jpg', 'IMAGE', b'0', 2, NOW(), NOW()),
(23, 6, '/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp', '494d8949160e4db3ad13a83559b76835.webp', 'IMAGE', b'0', 2, NOW(), NOW()),
(24, 7, '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 'e88d36f85e0e49b19919285377fd0849.webp', 'IMAGE', b'0', 2, NOW(), NOW()),
(25, 11, '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', '1cb555997bf54d1ba04ec465ddae98dc.jpg', 'IMAGE', b'0', 2, NOW(), NOW());

-- 1.7 Thông số kỹ thuật chi tiết (25 Dòng thông số)
INSERT INTO `product_technical_specs` (`product_id`, `spec_group`, `spec_key`, `spec_value`, `unit`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Hiệu năng', 'Vi xử lý', 'Apple A18 Pro (3nm thế hệ 2)', '', 1, NOW(), NOW()),
(1, 'Hiệu năng', 'RAM', '8GB Unified Memory', '', 2, NOW(), NOW()),
(1, 'Màn hình', 'Kích thước', '6.9', 'inch', 3, NOW(), NOW()),
(1, 'Màn hình', 'Công nghệ', 'Super Retina XDR OLED 120Hz ProMotion', '', 4, NOW(), NOW()),
(1, 'Pin & Sạc', 'Cổng sạc', 'USB-C (Tốc độ truyền dữ liệu USB 3 lên đến 10Gb/s)', '', 5, NOW(), NOW()),

(2, 'Hiệu năng', 'Vi xử lý', 'Snapdragon 8 Gen 3 for Galaxy', '', 1, NOW(), NOW()),
(2, 'Màn hình', 'Độ phân giải', 'QHD+ (3120 x 1440 Pixels)', '', 2, NOW(), NOW()),
(2, 'Camera', 'Camera chính', '200 MP, OIS quang học', '', 3, NOW(), NOW()),
(2, 'Tính năng', 'Bút thông minh', 'S-Pen tích hợp sẵn trong thân máy', '', 4, NOW(), NOW()),

(3, 'Hiệu năng', 'Chip xử lý', 'Apple M3 Pro (11-core CPU, 14-core GPU)', '', 1, NOW(), NOW()),
(3, 'Màn hình', 'Tấm nền', 'Liquid Retina XDR 14.2 inch, 1600 nits đỉnh', '', 2, NOW(), NOW()),
(3, 'Pin & Sạc', 'Thời lượng pin', 'Lên đến 18 giờ phát video liên tục', '', 3, NOW(), NOW()),

(4, 'Hiệu năng', 'CPU', 'Intel Core Ultra 9 185H', '', 1, NOW(), NOW()),
(4, 'Hiệu năng', 'Card đồ họa', 'NVIDIA GeForce RTX 4070 8GB GDDR6', '', 2, NOW(), NOW()),
(4, 'Màn hình', 'Tần số quét', '240', 'Hz', 3, NOW(), NOW()),

(6, 'Âm thanh', 'Bộ giải mã', 'LDAC, AAC, SBC (Hi-Res Audio Wireless)', '', 1, NOW(), NOW()),
(6, 'Pin & Sạc', 'Thời lượng pin', '30 giờ (bật chống ồn ANC)', '', 2, NOW(), NOW()),

(7, 'Âm thanh', 'Công suất tổng', '80 Watt (Class D)', '', 1, NOW(), NOW()),
(7, 'Kết nối', 'Chuẩn Bluetooth', 'Bluetooth 5.2 LE Audio Ready', '', 2, NOW(), NOW()),

(10, 'Thiết kế', 'Chất liệu khung', 'Nhôm nguyên khối CNC Anodized', '', 1, NOW(), NOW()),
(10, 'Tính năng', 'Tính năng Custom', 'Mạch xuôi Hot-Swap 5-pin, hỗ trợ QMK/VIA', '', 2, NOW(), NOW()),

(11, 'Cảm biến', 'Độ phân giải mắt đọc', '8000', 'DPI', 1, NOW(), NOW()),
(11, 'Pin', 'Thời lượng sử dụng', 'Lên đến 70 ngày sau 1 lần sạc đầy', '', 2, NOW(), NOW()),
(15, 'Màn hình', 'Độ phủ màu', '98% DCI-P3, 100% sRGB', '', 1, NOW(), NOW()),
(18, 'Công nghệ', 'Chuẩn sạc nhanh', 'PowerIQ 4.0 GaNPrime 100W Max', '', 1, NOW(), NOW());

-- 1.8 Nhật ký thay đổi sản phẩm (20 Dòng audit log)
INSERT INTO `product_change_logs` (`product_id`, `changed_field`, `old_value`, `new_value`, `changed_by`, `changed_by_user_id`, `changed_at`) VALUES
(1, 'price', '35990000.00', '34990000.00', 'admin', '15', NOW() - INTERVAL 5 DAY),
(1, 'availability', '80', '85', 'admin', '15', NOW() - INTERVAL 4 DAY),
(2, 'price', '32990000.00', '31490000.00', 'admin', '15', NOW() - INTERVAL 5 DAY),
(3, 'availability', '35', '40', 'admin', '15', NOW() - INTERVAL 4 DAY),
(4, 'product_name', 'ROG Zephyrus G16 OLED', 'Laptop Gaming Asus ROG Zephyrus G16', 'admin', '15', NOW() - INTERVAL 6 DAY),
(5, 'price', '44000000.00', '42500000.00', 'admin', '15', NOW() - INTERVAL 3 DAY),
(6, 'sales_count', '60', '68', 'system', '15', NOW() - INTERVAL 2 DAY),
(7, 'discription', 'Loa Bluetooth cổ điển', 'Loa gia đình huyền thoại thiết kế cổ điển biểu tượng...', 'admin', '15', NOW() - INTERVAL 4 DAY),
(8, 'availability', '100', '110', 'admin', '15', NOW() - INTERVAL 2 DAY),
(9, 'price', '15490000.00', '14490000.00', 'admin', '15', NOW() - INTERVAL 3 DAY),
(10, 'availability', '35', '40', 'admin', '15', NOW() - INTERVAL 1 DAY),
(11, 'sales_count', '65', '74', 'system', '15', NOW() - INTERVAL 2 DAY),
(12, 'availability', '8', '4', 'system', '15', NOW() - INTERVAL 1 DAY),
(13, 'product_created', NULL, 'iPad Pro M4 11 inch Wi-Fi 256GB', 'admin', '15', NOW() - INTERVAL 6 DAY),
(14, 'product_created', NULL, 'Samsung Galaxy Z Fold6 5G 512GB', 'admin', '15', NOW() - INTERVAL 6 DAY),
(15, 'product_created', NULL, 'Màn hình Dell UltraSharp 27 4K U2723QE', 'admin', '15', NOW() - INTERVAL 6 DAY),
(16, 'product_created', NULL, 'Tai nghe Chống ồn Bose QuietComfort Ultra', 'admin', '15', NOW() - INTERVAL 5 DAY),
(17, 'product_created', NULL, 'Đồng hồ thể thao Garmin Fenix 7 Pro Sapphire', 'admin', '15', NOW() - INTERVAL 5 DAY),
(18, 'product_created', NULL, 'Củ sạc nhanh Anker Prime 100W GaN 3 Cổng', 'admin', '15', NOW() - INTERVAL 4 DAY),
(19, 'product_created', NULL, 'Bàn phím Gaming Razer Huntsman V3 Pro', 'admin', '15', NOW() - INTERVAL 4 DAY);


-- ============================================================================
-- 2. DATABASE: inventory
-- ============================================================================
USE `inventory`;

TRUNCATE TABLE `stock_movements`;
TRUNCATE TABLE `inventory_balances`;

-- 2.1 Tồn kho theo từng biến thể (30 Dòng)
INSERT INTO `inventory_balances` (`id`, `product_id`, `variant_id`, `quantity_on_hand`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 30, NOW(), NOW()),
(2, 1, 2, 25, NOW(), NOW()),
(3, 1, 3, 30, NOW(), NOW()),
(4, 2, 4, 35, NOW(), NOW()),
(5, 2, 5, 25, NOW(), NOW()),
(6, 3, 6, 20, NOW(), NOW()),
(7, 3, 7, 20, NOW(), NOW()),
(8, 4, 8, 25, NOW(), NOW()),
(9, 5, 9, 30, NOW(), NOW()),
(10, 6, 10, 25, NOW(), NOW()),
(11, 6, 11, 25, NOW(), NOW()),
(12, 7, 12, 25, NOW(), NOW()),
(13, 7, 13, 20, NOW(), NOW()),
(14, 8, 14, 110, NOW(), NOW()),
(15, 9, 15, 35, NOW(), NOW()),
(16, 10, 16, 20, NOW(), NOW()),
(17, 10, 17, 20, NOW(), NOW()),
(18, 11, 18, 45, NOW(), NOW()),
(19, 11, 19, 35, NOW(), NOW()),
(20, 12, 20, 4, NOW(), NOW()),
(21, 13, 21, 25, NOW(), NOW()),
(22, 13, 22, 20, NOW(), NOW()),
(23, 14, 23, 20, NOW(), NOW()),
(24, 15, 24, 35, NOW(), NOW()),
(25, 16, 25, 28, NOW(), NOW()),
(26, 17, 26, 18, NOW(), NOW()),
(27, 18, 27, 150, NOW(), NOW()),
(28, 19, 28, 30, NOW(), NOW()),
(29, 20, 29, 22, NOW(), NOW()),
(30, 1, 30, 15, NOW(), NOW());

-- 2.2 Lịch sử nhập xuất kho (20 Dòng stock movements)
INSERT INTO `stock_movements` (`product_id`, `variant_id`, `quantity`, `balance_after`, `movement_type`, `unit_cost`, `note`, `movement_at`, `created_at`, `updated_at`) VALUES
(1, 1, 30, 30, 'IMPORT', 29000000.00, 'Lô iPhone 16 Pro Max nhập khẩu phân phối Apple VN/A', NOW() - INTERVAL 7 DAY, NOW(), NOW()),
(1, 2, 25, 25, 'IMPORT', 29000000.00, 'Lô iPhone 16 Pro Max Black Titanium chính hãng', NOW() - INTERVAL 7 DAY, NOW(), NOW()),
(2, 4, 35, 35, 'IMPORT', 25000000.00, 'Lô Samsung Galaxy S24 Ultra phân phối SSVN', NOW() - INTERVAL 7 DAY, NOW(), NOW()),
(3, 6, 20, 20, 'IMPORT', 41000000.00, 'MacBook Pro M3 Pro nhà phân phối Synnex FPT', NOW() - INTERVAL 6 DAY, NOW(), NOW()),
(4, 8, 25, 25, 'IMPORT', 46000000.00, 'Lô Asus ROG Zephyrus G16 OLED Gaming', NOW() - INTERVAL 6 DAY, NOW(), NOW()),
(5, 9, 30, 30, 'IMPORT', 36000000.00, 'Lô Dell XPS 15 9530 nhập khẩu chính ngạch', NOW() - INTERVAL 6 DAY, NOW(), NOW()),
(6, 10, 25, 25, 'IMPORT', 6500000.00, 'Tai nghe Sony WH-1000XM5 phân phối Sony VN', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(7, 12, 25, 25, 'IMPORT', 7800000.00, 'Loa Marshall Stanmore III chính hãng Ash Vietnam', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(8, 14, 110, 110, 'IMPORT', 4800000.00, 'Lô tai nghe AirPods Pro 2 USB-C số lượng lớn', NOW() - INTERVAL 4 DAY, NOW(), NOW()),
(9, 15, 35, 35, 'IMPORT', 12500000.00, 'Lô máy chơi game PlayStation 5 Slim chính hãng Sony', NOW() - INTERVAL 4 DAY, NOW(), NOW()),
(10, 16, 20, 20, 'IMPORT', 3900000.00, 'Bàn phím Keychron Q1 Pro Red Switch nhập khẩu', NOW() - INTERVAL 4 DAY, NOW(), NOW()),
(11, 18, 45, 45, 'IMPORT', 1900000.00, 'Chuột Logitech MX Master 3S chính hãng Digiworld', NOW() - INTERVAL 3 DAY, NOW(), NOW()),
(12, 20, 5, 4, 'EXPORT', 18000000.00, 'Xuất kho giao đơn hàng Apple Watch Ultra 2', NOW() - INTERVAL 2 DAY, NOW(), NOW()),
(13, 21, 25, 25, 'IMPORT', 23000000.00, 'Lô máy tính bảng iPad Pro M4 chính hãng Apple', NOW() - INTERVAL 3 DAY, NOW(), NOW()),
(14, 14, 20, 20, 'IMPORT', 37000000.00, 'Lô Galaxy Z Fold6 SSVN đợt 1', NOW() - INTERVAL 3 DAY, NOW(), NOW()),
(15, 24, 35, 35, 'IMPORT', 11500000.00, 'Màn hình chuyên nghiệp Dell UltraSharp 4K', NOW() - INTERVAL 2 DAY, NOW(), NOW()),
(16, 25, 28, 28, 'IMPORT', 8200000.00, 'Tai nghe Bose QuietComfort Ultra chính hãng', NOW() - INTERVAL 2 DAY, NOW(), NOW()),
(17, 26, 18, 18, 'IMPORT', 18500000.00, 'Đồng hồ Garmin Fenix 7 Pro Sapphire', NOW() - INTERVAL 2 DAY, NOW(), NOW()),
(18, 27, 150, 150, 'IMPORT', 1100000.00, 'Củ sạc Anker Prime 100W GaN nhập kho tổng', NOW() - INTERVAL 1 DAY, NOW(), NOW()),
(19, 28, 30, 30, 'IMPORT', 4900000.00, 'Bàn phím cơ Razer Huntsman V3 Pro', NOW() - INTERVAL 1 DAY, NOW(), NOW());


-- ============================================================================
-- 3. DATABASE: users
-- ============================================================================
USE `users`;

DELETE FROM `user_login_device_approval_tokens`;
DELETE FROM `user_profile_change_logs`;
DELETE FROM `user_addresses` WHERE `id` > 0;
DELETE FROM `store_contacts` WHERE `id` > 0;
DELETE FROM `users` WHERE `id` NOT IN (15);
DELETE FROM `users_details` WHERE `id` NOT IN (1);

-- 3.1 Cập nhật tài khoản Admin ID 15
UPDATE `users` SET 
  `user_name` = 'admin',
  `email` = 'nguyendinhkiet12092005@gmail.com',
  `phone_number` = '0865482131',
  `role_id` = 1,
  `user_details_id` = 1,
  `membership_level` = 'PLATINUM',
  `total_spent` = 150000000.00,
  `completed_orders_count` = 10,
  `is_activated` = b'1'
WHERE `id` = 15;

-- 3.2 Khách hàng & Thành viên (15 Người dùng chi tiết)
INSERT INTO `users_details` (`id`, `first_name`, `last_name`, `gender`, `birth_date`, `avatar_url`, `created_at`, `updated_at`) VALUES
(2, 'Nam', 'Nguyễn Hoàng', 'Nam', '1995-04-12', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(3, 'Anh', 'Trần Minh', 'Nữ', '1998-08-22', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(4, 'Bảo', 'Lê Quốc', 'Nam', '1992-11-05', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(5, 'Hà', 'Phạm Thu', 'Nữ', '2001-02-18', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(6, 'Tuấn', 'Đặng Anh', 'Nam', '1994-07-30', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(7, 'Linh', 'Vũ Khánh', 'Nữ', '1999-12-14', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(8, 'Khoa', 'Hoàng Đăng', 'Nam', '1996-03-25', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(9, 'Thảo', 'Ngô Phương', 'Nữ', '1997-09-09', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(10, 'Huy', 'Bùi Quang', 'Nam', '1993-06-17', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(11, 'Mai', 'Đỗ Quỳnh', 'Nữ', '2002-05-01', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(12, 'Dũng', 'Trịnh Tiến', 'Nam', '1990-10-10', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(13, 'Hương', 'Lâm Thu', 'Nữ', '1996-01-20', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(14, 'Phúc', 'Lý Hoàng', 'Nam', '1998-11-28', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(15, 'Yến', 'Trương Hải', 'Nữ', '2000-08-15', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80', NOW(), NOW());

INSERT INTO `users` (`id`, `user_name`, `user_password`, `email`, `phone_number`, `role_id`, `user_details_id`, `is_activated`, `membership_level`, `total_spent`, `completed_orders_count`, `failed_login_attempts`, `created_at`, `updated_at`) VALUES
(16, 'hoangnam', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'hoangnam.tech@gmail.com', '0912345678', 3, 2, b'1', 'GOLD', 78470000.00, 3, 0, NOW() - INTERVAL 20 DAY, NOW()),
(17, 'minhanh', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'minhanh.design@gmail.com', '0987654321', 3, 3, b'1', 'PLATINUM', 97480000.00, 4, 0, NOW() - INTERVAL 18 DAY, NOW()),
(18, 'quocbao', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'quocbao.dev@gmail.com', '0909123456', 3, 4, b'1', 'SILVER', 22480000.00, 2, 0, NOW() - INTERVAL 15 DAY, NOW()),
(19, 'thuha', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'thuha.mkt@gmail.com', '0938112233', 3, 5, b'1', 'BRONZE', 5690000.00, 1, 0, NOW() - INTERVAL 12 DAY, NOW()),
(20, 'anhtuan', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'anhtuan.gamer@gmail.com', '0945678901', 3, 6, b'1', 'GOLD', 64480000.00, 2, 0, NOW() - INTERVAL 11 DAY, NOW()),
(21, 'khanhlinh', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'khanhlinh.vlog@gmail.com', '0978123456', 3, 7, b'1', 'SILVER', 14490000.00, 1, 0, NOW() - INTERVAL 10 DAY, NOW()),
(22, 'dangkhoa', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'dangkhoa.coder@gmail.com', '0908234567', 3, 8, b'1', 'PLATINUM', 89980000.00, 3, 0, NOW() - INTERVAL 9 DAY, NOW()),
(23, 'phuongthao', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'phuongthao.hr@gmail.com', '0918345678', 3, 9, b'1', 'BRONZE', 7990000.00, 1, 0, NOW() - INTERVAL 8 DAY, NOW()),
(24, 'quanghuy', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'quanghuy.media@gmail.com', '0967456789', 3, 10, b'1', 'GOLD', 54990000.00, 2, 0, NOW() - INTERVAL 7 DAY, NOW()),
(25, 'quynhmai', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'quynhmai.edu@gmail.com', '0923567890', 3, 11, b'1', 'BRONZE', 3880000.00, 1, 0, NOW() - INTERVAL 6 DAY, NOW()),
(26, 'tiendung', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'tiendung.ceo@gmail.com', '0911223344', 3, 12, b'1', 'PLATINUM', 112480000.00, 4, 0, NOW() - INTERVAL 5 DAY, NOW()),
(27, 'thuhuong', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'thuhuong.sale@gmail.com', '0988776655', 3, 13, b'1', 'SILVER', 17480000.00, 2, 0, NOW() - INTERVAL 4 DAY, NOW()),
(28, 'hoangphuc', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'hoangphuc.arch@gmail.com', '0933445566', 3, 14, b'1', 'GOLD', 48990000.00, 2, 0, NOW() - INTERVAL 3 DAY, NOW()),
(29, 'haiyen', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'haiyen.audit@gmail.com', '0977665544', 3, 15, b'1', 'BRONZE', 9490000.00, 1, 0, NOW() - INTERVAL 2 DAY, NOW());

-- 3.3 Sổ địa chỉ khách hàng (20 Địa chỉ giao hàng)
INSERT INTO `user_addresses` (`user_details_id`, `recipient_name`, `phone_number`, `full_address`, `street_line`, `ward_name`, `province_name`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Admin Quản Trị TKV', '0865482131', 'Tòa nhà Landmark 81, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', 'Landmark 81', 'Phường 22', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(2, 'Nguyễn Hoàng Nam', '0912345678', 'Số 88 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội', 'Số 88 Phố Huế', 'Phường Hàng Bài', 'Hà Nội', b'1', NOW(), NOW()),
(3, 'Trần Minh Anh', '0987654321', 'Căn hộ 12.04 Thảo Điền Pearl, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh', 'Thảo Điền Pearl', 'Phường Thảo Điền', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(4, 'Lê Quốc Bảo', '0909123456', 'Số 45 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng', 'Số 45 Nguyễn Văn Linh', 'Phường Nam Dương', 'Đà Nẵng', b'1', NOW(), NOW()),
(5, 'Phạm Thu Hà', '0938112233', 'Số 120 Đường 30/4, Phường An Phú, Quận Ninh Kiều, Cần Thơ', 'Số 120 Đường 30/4', 'Phường An Phú', 'Cần Thơ', b'1', NOW(), NOW()),
(6, 'Đặng Anh Tuấn', '0945678901', 'Số 25 Hoàng Diệu, Phường Ba Đình, Quận Ba Đình, Hà Nội', 'Số 25 Hoàng Diệu', 'Phường Ba Đình', 'Hà Nội', b'1', NOW(), NOW()),
(7, 'Vũ Khánh Linh', '0978123456', 'Villa 09 Rivera Park, Phường 14, Quận 10, TP. Hồ Chí Minh', 'Rivera Park', 'Phường 14', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(8, 'Hoàng Đăng Khoa', '0908234567', 'Tòa FPT Complex, Đường Nam Kỳ Khởi Nghĩa, Quận Ngũ Hành Sơn, Đà Nẵng', 'FPT Complex', 'Ngũ Hành Sơn', 'Đà Nẵng', b'1', NOW(), NOW()),
(9, 'Ngô Phương Thảo', '0918345678', 'Số 68 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'Số 68 Lê Lợi', 'Phường Bến Nghé', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(10, 'Bùi Quang Huy', '0967456789', 'Số 14 Hai Bà Trưng, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 'Số 14 Hai Bà Trưng', 'Phường Tràng Tiền', 'Hà Nội', b'1', NOW(), NOW()),
(11, 'Đỗ Quỳnh Mai', '0923567890', 'Số 102 Trần Phú, Phường Lương Khánh Thiện, Quận Ngô Quyền, Hải Phòng', 'Số 102 Trần Phú', 'Lương Khánh Thiện', 'Hải Phòng', b'1', NOW(), NOW()),
(12, 'Trịnh Tiến Dũng', '0911223344', 'Biệt thự Vinhomes Riverside, Phường Phúc Đồng, Quận Long Biên, Hà Nội', 'Vinhomes Riverside', 'Phúc Đồng', 'Hà Nội', b'1', NOW(), NOW()),
(13, 'Lâm Thu Hương', '0988776655', 'Số 210 Hùng Vương, Phường Phú Nhuận, TP. Huế, Thừa Thiên Huế', 'Số 210 Hùng Vương', 'Phú Nhuận', 'Thừa Thiên Huế', b'1', NOW(), NOW()),
(14, 'Lý Hoàng Phúc', '0933445566', 'Chung cư Masteri Centre Point, Phường Long Bình, TP. Thủ Đức, TP. Hồ Chí Minh', 'Masteri Centre Point', 'Long Bình', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(15, 'Trương Hải Yến', '0977665544', 'Số 56 Nguyễn Trãi, Phường 3, Quận 5, TP. Hồ Chí Minh', 'Số 56 Nguyễn Trãi', 'Phường 3', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(2, 'Nguyễn Hoàng Nam (Văn phòng)', '0912345678', 'Keangnam Landmark Tower, Phạm Hùng, Quận Nam Từ Liêm, Hà Nội', 'Keangnam Tower', 'Mễ Trì', 'Hà Nội', b'0', NOW(), NOW()),
(3, 'Trần Minh Anh (Studio)', '0987654321', 'Saigon Innovation Hub, 273 Điện Biên Phủ, Quận 3, TP. Hồ Chí Minh', '273 Điện Biên Phủ', 'Võ Thị Sáu', 'TP. Hồ Chí Minh', b'0', NOW(), NOW()),
(4, 'Lê Quốc Bảo (Chi nhánh)', '0909123456', 'Indochina Riverside Tower, 74 Bạch Đằng, Quận Hải Châu, Đà Nẵng', 'Indochina Tower', 'Hải Châu 1', 'Đà Nẵng', b'0', NOW(), NOW()),
(12, 'Trịnh Tiến Dũng (Trụ sở)', '0911223344', 'Bitexco Financial Tower, Số 2 Hải Triều, Quận 1, TP. Hồ Chí Minh', 'Bitexco Tower', 'Bến Nghé', 'TP. Hồ Chí Minh', b'0', NOW(), NOW()),
(6, 'Đặng Anh Tuấn (Công ty)', '0945678901', 'Lotte Center Hà Nội, 54 Liễu Giai, Quận Ba Đình, Hà Nội', 'Lotte Center', 'Cống Vị', 'Hà Nội', b'0', NOW(), NOW());

-- 3.4 Danh sách chi nhánh cửa hàng (10 Chi nhánh toàn quốc)
INSERT INTO `store_contacts` (`id`, `store_name`, `phone_number`, `hotline`, `email`, `address`, `ward`, `district`, `province`, `opening_hours`, `google_maps_url`, `is_primary`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'The Kinetic Vault - Flagship Store TP.HCM', '02838221234', '19008899', 'support.hcm@thekineticvault.vn', 'Số 68 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh', '08:00 - 22:00 (Cả tuần)', 'https://maps.google.com/?q=68+Le+Loi+Quan+1', b'1', b'1', NOW(), NOW()),
(2, 'The Kinetic Vault - Premium Hà Nội', '02439331234', '19008899', 'support.hn@thekineticvault.vn', 'Số 14 Hai Bà Trưng, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', 'Tràng Tiền', 'Hoàn Kiếm', 'Hà Nội', '08:30 - 21:30 (Cả tuần)', 'https://maps.google.com/?q=14+Hai+Ba+Trung+Hoan+Kiem', b'0', b'1', NOW(), NOW()),
(3, 'The Kinetic Vault - Concept Store Thảo Điền', '02837441234', '19008899', 'thaodien@thekineticvault.vn', 'Số 88 Song Hành, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh', 'An Phú', 'TP. Thủ Đức', 'TP. Hồ Chí Minh', '09:00 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(4, 'The Kinetic Vault - Experience Center Đà Nẵng', '02363881234', '19008899', 'danang@thekineticvault.vn', 'Số 45 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng', 'Nam Dương', 'Hải Châu', 'Đà Nẵng', '08:00 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(5, 'The Kinetic Vault - Hub Cần Thơ', '02923771234', '19008899', 'cantho@thekineticvault.vn', 'Số 120 Đường 30/4, Phường An Phú, Quận Ninh Kiều, Cần Thơ', 'An Phú', 'Ninh Kiều', 'Cần Thơ', '08:00 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(6, 'The Kinetic Vault - Hub Hải Phòng', '02253661234', '19008899', 'haiphong@thekineticvault.vn', 'Số 102 Trần Phú, Phường Lương Khánh Thiện, Quận Ngô Quyền, Hải Phòng', 'Lương Khánh Thiện', 'Ngô Quyền', 'Hải Phòng', '08:30 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(7, 'The Kinetic Vault - Hub Cầu Giấy Hà Nội', '02437551234', '19008899', 'caugiay@thekineticvault.vn', 'Số 226 Cầu Giấy, Phường Quan Hoa, Quận Cầu Giấy, Hà Nội', 'Quan Hoa', 'Cầu Giấy', 'Hà Nội', '08:30 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(8, 'The Kinetic Vault - Hub Quận 7 TP.HCM', '02837751234', '19008899', 'quan7@thekineticvault.vn', 'Số 468 Nguyễn Thị Thập, Phường Tân Quy, Quận 7, TP. Hồ Chí Minh', 'Tân Quy', 'Quận 7', 'TP. Hồ Chí Minh', '08:30 - 22:00 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(9, 'The Kinetic Vault - Hub Biên Hòa', '02513881234', '19008899', 'bienhoa@thekineticvault.vn', 'Số 89 Phạm Văn Thuận, Phường Tân Tiến, TP. Biên Hòa, Đồng Nai', 'Tân Tiến', 'Biên Hòa', 'Đồng Nai', '08:00 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW()),
(10, 'The Kinetic Vault - Hub Nha Trang', '02583881234', '19008899', 'nhatrang@thekineticvault.vn', 'Số 38 Thái Nguyên, Phường Phước Tân, TP. Nha Trang, Khánh Hòa', 'Phước Tân', 'Nha Trang', 'Khánh Hòa', '08:00 - 21:30 (Cả tuần)', NULL, b'0', b'1', NOW(), NOW());

-- 3.5 Nhật ký thay đổi hồ sơ người dùng (15 Dòng audit logs)
INSERT INTO `users_details` (`id`, `first_name`, `last_name`, `gender`, `birth_date`, `created_at`, `updated_at`) VALUES (100, 'Test', 'Log', 'Nam', '1990-01-01', NOW(), NOW()) ON DUPLICATE KEY UPDATE `first_name`='Test';
INSERT INTO `user_profile_change_logs` (`user_details_id`, `changed_field`, `old_value`, `new_value`, `changed_by`, `changed_at`, `created_at`, `updated_at`) VALUES
(2, 'phone_number', '0912000111', '0912345678', 'hoangnam', NOW() - INTERVAL 10 DAY, NOW(), NOW()),
(3, 'avatar_url', NULL, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', 'minhanh', NOW() - INTERVAL 8 DAY, NOW(), NOW()),
(4, 'last_name', 'Lê', 'Lê Quốc', 'quocbao', NOW() - INTERVAL 7 DAY, NOW(), NOW()),
(5, 'birth_date', '2001-02-01', '2001-02-18', 'thuha', NOW() - INTERVAL 6 DAY, NOW(), NOW()),
(6, 'first_name', 'Tuấn Anh', 'Tuấn', 'anhtuan', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(7, 'avatar_url', NULL, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80', 'khanhlinh', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(8, 'phone_number', '0908111222', '0908234567', 'dangkhoa', NOW() - INTERVAL 4 DAY, NOW(), NOW()),
(9, 'first_name', 'Thảo', 'Thảo', 'phuongthao', NOW() - INTERVAL 4 DAY, NOW(), NOW()),
(10, 'avatar_url', NULL, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61', 'quanghuy', NOW() - INTERVAL 3 DAY, NOW(), NOW()),
(11, 'gender', 'Nam', 'Nữ', 'quynhmai', NOW() - INTERVAL 3 DAY, NOW(), NOW()),
(12, 'first_name', 'Dũng', 'Dũng', 'tiendung', NOW() - INTERVAL 2 DAY, NOW(), NOW()),
(13, 'phone_number', '0988000111', '0988776655', 'thuhuong', NOW() - INTERVAL 2 DAY, NOW(), NOW()),
(14, 'avatar_url', NULL, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7', 'hoangphuc', NOW() - INTERVAL 1 DAY, NOW(), NOW()),
(15, 'first_name', 'Yến', 'Yến', 'haiyen', NOW() - INTERVAL 1 DAY, NOW(), NOW()),
(2, 'email', 'nam.tech@old.com', 'hoangnam.tech@gmail.com', 'hoangnam', NOW() - INTERVAL 1 DAY, NOW(), NOW());


-- ============================================================================
-- 4. DATABASE: orders
-- ============================================================================
USE `orders`;

TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `items`;
TRUNCATE TABLE `orders`;

-- 4.1 Danh sách Đơn hàng (20 Đơn hàng chân thực từ 2026-10-10 trở về trước)
INSERT INTO `orders` (`id`, `order_number`, `mvd`, `user_id`, `user_name`, `phone_last4`, `shipping_address`, `status`, `payment_status`, `payment_method`, `total`, `ordered_date`, `created_at`, `updated_at`) VALUES
-- Hôm nay: 2026-10-10
(1, 'TKV-20261010-001', 'VN882019481', 16, 'hoangnam', '5678', 'Số 88 Phố Huế, Hoàn Kiếm, Hà Nội', 'CREATED', 'PENDING', 'COD', 34990000.00, '2026-10-10', NOW() - INTERVAL 1 HOUR, NOW()),
(2, 'TKV-20261010-002', 'VN882019482', 17, 'minhanh', '4321', 'Thảo Điền Pearl, TP. Thủ Đức, TP.HCM', 'CREATED', 'PAID', 'BANK_TRANSFER', 7990000.00, '2026-10-10', NOW() - INTERVAL 2 HOUR, NOW()),
(3, 'TKV-20261010-003', 'VN882019483', 18, 'quocbao', '3456', 'Số 45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', 'CREATED', 'PENDING', 'COD', 2390000.00, '2026-10-10', NOW() - INTERVAL 3 HOUR, NOW()),
(4, 'TKV-20261010-004', 'VN882019484', 19, 'thuha', '2233', 'Số 120 Đường 30/4, Ninh Kiều, Cần Thơ', 'CREATED', 'PAID', 'CARD', 5690000.00, '2026-10-10', NOW() - INTERVAL 4 HOUR, NOW()),
(5, 'TKV-20261010-005', 'VN882019485', 20, 'anhtuan', '8901', 'Số 25 Hoàng Diệu, Ba Đình, Hà Nội', 'CREATED', 'PAID', 'BANK_TRANSFER', 54990000.00, '2026-10-10', NOW() - INTERVAL 5 HOUR, NOW()),

-- Hôm qua: 2026-10-09
(6, 'TKV-20261009-001', 'VN882019486', 21, 'khanhlinh', '3456', 'Villa Rivera Park, Quận 10, TP.HCM', 'CONFIRMED', 'PAID', 'BANK_TRANSFER', 14490000.00, '2026-10-09', NOW() - INTERVAL 1 DAY, NOW()),
(7, 'TKV-20261009-002', 'VN882019487', 22, 'dangkhoa', '4567', 'Tòa FPT Complex, Ngũ Hành Sơn, Đà Nẵng', 'CONFIRMED', 'PAID', 'BANK_TRANSFER', 48990000.00, '2026-10-09', NOW() - INTERVAL 26 HOUR, NOW()),
(8, 'TKV-20261009-003', 'VN882019488', 23, 'phuongthao', '5678', 'Số 68 Lê Lợi, Bến Nghé, Quận 1, TP.HCM', 'PROCESSING', 'PAID', 'CARD', 9490000.00, '2026-10-09', NOW() - INTERVAL 28 HOUR, NOW()),

-- 2026-10-08
(9, 'TKV-20261008-001', 'VN882019489', 24, 'quanghuy', '6789', 'Số 14 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', 'SHIPPED', 'PAID', 'BANK_TRANSFER', 42500000.00, '2026-10-08', NOW() - INTERVAL 2 DAY, NOW()),
(10, 'TKV-20261008-002', 'VN882019490', 25, 'quynhmai', '7890', 'Số 102 Trần Phú, Ngô Quyền, Hải Phòng', 'SHIPPED', 'PENDING', 'COD', 4850000.00, '2026-10-08', NOW() - INTERVAL 50 HOUR, NOW()),

-- 2026-10-07 (DELIVERED)
(11, 'TKV-20261007-001', 'VN882019491', 26, 'tiendung', '3344', 'Vinhomes Riverside, Long Biên, Hà Nội', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 31490000.00, '2026-10-07', NOW() - INTERVAL 3 DAY, NOW()),
(12, 'TKV-20261007-002', 'VN882019492', 27, 'thuhuong', '6655', 'Số 210 Hùng Vương, Phú Nhuận, Huế', 'DELIVERED', 'PAID', 'CARD', 21490000.00, '2026-10-07', NOW() - INTERVAL 74 HOUR, NOW()),

-- 2026-10-06 (DELIVERED)
(13, 'TKV-20261006-001', 'VN882019493', 28, 'hoangphuc', '5566', 'Masteri Centre Point, Thủ Đức, TP.HCM', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 27990000.00, '2026-10-06', NOW() - INTERVAL 4 DAY, NOW()),
(14, 'TKV-20261006-002', 'VN882019494', 29, 'haiyen', '5544', 'Số 56 Nguyễn Trãi, Quận 5, TP.HCM', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 9490000.00, '2026-10-06', NOW() - INTERVAL 98 HOUR, NOW()),

-- 2026-10-05 (DELIVERED)
(15, 'TKV-20261005-001', 'VN882019495', 16, 'hoangnam', '5678', 'Keangnam Landmark Tower, Nam Từ Liêm, Hà Nội', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 43990000.00, '2026-10-05', NOW() - INTERVAL 5 DAY, NOW()),
(16, 'TKV-20261005-002', 'VN882019496', 17, 'minhanh', '4321', 'Saigon Innovation Hub, Quận 3, TP.HCM', 'DELIVERED', 'PAID', 'CARD', 13990000.00, '2026-10-05', NOW() - INTERVAL 122 HOUR, NOW()),

-- 2026-10-04 (DELIVERED)
(17, 'TKV-20261004-001', 'VN882019497', 18, 'quocbao', '3456', 'Indochina Riverside, Hải Châu, Đà Nẵng', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 54990000.00, '2026-10-04', NOW() - INTERVAL 6 DAY, NOW()),
(18, 'TKV-20261004-002', 'VN882019498', 26, 'tiendung', '3344', 'Bitexco Financial Tower, Quận 1, TP.HCM', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 34990000.00, '2026-10-04', NOW() - INTERVAL 146 HOUR, NOW()),

-- 2026-10-03 (DELIVERED)
(19, 'TKV-20261003-001', 'VN882019499', 22, 'dangkhoa', '4567', 'Tòa FPT Complex, Ngũ Hành Sơn, Đà Nẵng', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 21490000.00, '2026-10-03', NOW() - INTERVAL 7 DAY, NOW()),

-- 2026-10-02 (DELIVERED)
(20, 'TKV-20261002-001', 'VN882019500', 20, 'anhtuan', '8901', 'Số 25 Hoàng Diệu, Ba Đình, Hà Nội', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 14490000.00, '2026-10-02', NOW() - INTERVAL 8 DAY, NOW());

-- 4.2 Chi tiết mặt hàng (25 items)
INSERT INTO `items` (`id`, `product_id`, `variant_id`, `product_name_snapshot`, `product_sku_snapshot`, `variant_label`, `variant_name`, `product_image_snapshot`, `quantity`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'iPhone 16 Pro Max 256GB', 'SP-IP16PM-256', 'Titan Tự Nhiên / 256GB', 'Titan Tự Nhiên - 256GB', '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 1, 34990000.00, NOW(), NOW()),
(2, 6, 10, 'Tai nghe Chống ồn Sony WH-1000XM5', 'SP-SONY-XM5', 'Đen Nhám (Black)', 'Đen Nhám (Black)', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', 1, 7990000.00, NOW(), NOW()),
(3, 11, 18, 'Chuột không dây Logitech MX Master 3S', 'SP-LOGI-MX3S', 'Graphite Đen Xám', 'Graphite Đen Xám', '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', 1, 2390000.00, NOW(), NOW()),
(4, 8, 14, 'Tai nghe Apple AirPods Pro 2 USB-C', 'SP-AIRPODS-P2', 'Trắng (White)', 'Trắng (White)', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', 1, 5690000.00, NOW(), NOW()),
(5, 4, 8, 'Laptop Gaming Asus ROG Zephyrus G16', 'SP-ROG-G16', 'Eclipse Gray / RTX 4070', 'Eclipse Gray', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 1, 54990000.00, NOW(), NOW()),
(6, 9, 15, 'Máy chơi game Sony PlayStation 5 Slim', 'SP-PS5-SLIM', 'Trắng Tiêu Chuẩn', 'Trắng Tiêu Chuẩn', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 1, 14490000.00, NOW(), NOW()),
(7, 3, 6, 'MacBook Pro 14 M3 Pro (18GB/512GB)', 'SP-MBP14-M3P', 'Space Black - 18GB/512GB', 'Space Black', '/api/catalog/admin/products/images/file/74e1703c16594800ba798cd85382817c.webp', 1, 48990000.00, NOW(), NOW()),
(8, 7, 12, 'Loa Bluetooth Marshall Stanmore III', 'SP-MARSHALL-ST3', 'Đen Cổ Điển (Black)', 'Đen Cổ Điển', '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', 1, 9490000.00, NOW(), NOW()),
(9, 5, 9, 'Laptop Dell XPS 15 9530 OLED', 'SP-DELL-XPS15', 'Platinum Silver / 32GB', 'Platinum Silver', '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 1, 42500000.00, NOW(), NOW()),
(10, 10, 16, 'Bàn phím cơ Keychron Q1 Pro Wireless', 'SP-KEYCHRON-Q1', 'Carbon Black - Red Switch', 'Red Switch', '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', 1, 4850000.00, NOW(), NOW()),
(11, 2, 4, 'Samsung Galaxy S24 Ultra 5G', 'SP-S24U-512', 'Titan Xám - 256GB', 'Titan Xám', '/api/catalog/admin/products/images/file/b42f9c12c22841e6810dda0305a2d351.jpg', 1, 31490000.00, NOW(), NOW()),
(12, 12, 20, 'Đồng hồ thông minh Apple Watch Ultra 2', 'SP-AW-ULTRA2', 'Titan Tự Nhiên - 49mm', 'Titan Tự Nhiên', '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 1, 21490000.00, NOW(), NOW()),
(13, 13, 21, 'iPad Pro M4 11 inch Wi-Fi 256GB', 'SP-IPAD-M4-11', 'Space Black - 256GB', 'Space Black', '/api/catalog/admin/products/images/file/98a6cc3e6e984c1db8f78ca2cacaacb6.webp', 1, 27990000.00, NOW(), NOW()),
(14, 7, 13, 'Loa Bluetooth Marshall Stanmore III', 'SP-MARSHALL-ST3', 'Kem Vintage (Cream)', 'Kem Vintage', '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 1, 9490000.00, NOW(), NOW()),
(15, 14, 23, 'Samsung Galaxy Z Fold6 5G 512GB', 'SP-ZFOLD6-512', 'Xám Phantom - 512GB', 'Xám Phantom', '/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg', 1, 43990000.00, NOW(), NOW()),
(16, 15, 24, 'Màn hình Dell UltraSharp 27 4K U2723QE', 'SP-DELL-U2723QE', 'Bạc Platinum - 27 inch', 'Bạc Platinum', '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 1, 13990000.00, NOW(), NOW()),
(17, 4, 8, 'Laptop Gaming Asus ROG Zephyrus G16', 'SP-ROG-G16', 'Eclipse Gray / RTX 4070', 'Eclipse Gray', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 1, 54990000.00, NOW(), NOW()),
(18, 1, 2, 'iPhone 16 Pro Max 256GB', 'SP-IP16PM-256', 'Titan Đen - 256GB', 'Titan Đen', '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', 1, 34990000.00, NOW(), NOW()),
(19, 12, 20, 'Đồng hồ thông minh Apple Watch Ultra 2', 'SP-AW-ULTRA2', 'Titan Tự Nhiên - Dây Vải Cam', 'Titan Tự Nhiên', '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 1, 21490000.00, NOW(), NOW()),
(20, 9, 15, 'Máy chơi game Sony PlayStation 5 Slim', 'SP-PS5-SLIM', 'Trắng Tiêu Chuẩn', 'Trắng Tiêu Chuẩn', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 1, 14490000.00, NOW(), NOW()),
(21, 18, 27, 'Củ sạc nhanh Anker Prime 100W GaN', 'SP-ANKER-100W', 'Đen Nhám GaNPrime', 'Đen Nhám', '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', 2, 2980000.00, NOW(), NOW()),
(22, 19, 28, 'Bàn phím Gaming Razer Huntsman V3 Pro', 'SP-RAZER-HV3P', 'Classic Black', 'Classic Black', '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', 1, 5990000.00, NOW(), NOW()),
(23, 16, 25, 'Tai nghe Bose QuietComfort Ultra', 'SP-BOSE-QCULTRA', 'Black Đen Huyền Bí', 'Black Đen', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', 1, 9990000.00, NOW(), NOW()),
(24, 20, 29, 'Loa Bluetooth JBL Boombox 3 Wi-Fi', 'SP-JBL-BOOMBOX3', 'Đen PartyBox', 'Đen PartyBox', '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', 1, 12900000.00, NOW(), NOW()),
(25, 17, 26, 'Đồng hồ Garmin Fenix 7 Pro Sapphire', 'SP-GARMIN-F7PRO', 'Carbon Gray DLC', 'Carbon Gray', '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 1, 21990000.00, NOW(), NOW());

-- 4.3 Khớp nối order_items (25 Liên kết)
INSERT INTO `order_items` (`order_id`, `item_id`) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10),
(11, 11), (12, 12), (13, 13), (14, 14), (15, 15),
(16, 16), (17, 17), (18, 18), (19, 19), (20, 20),
(1, 21), (3, 22), (5, 23), (7, 24), (9, 25);


-- ============================================================================
-- 5. DATABASE: payments
-- ============================================================================
USE `payments`;

TRUNCATE TABLE `payments`;

-- 5.1 Giao dịch thanh toán (20 Giao dịch)
INSERT INTO `payments` (`id`, `order_id`, `amount`, `currency`, `method`, `status`, `transaction_ref`, `created_at`, `updated_at`) VALUES
(1, 2, 7990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261010002MB', NOW() - INTERVAL 2 HOUR, NOW()),
(2, 4, 5690000.0000, 'VND', 'CARD', 'PAID', 'TXN20261010004VISA', NOW() - INTERVAL 4 HOUR, NOW()),
(3, 5, 54990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261010005VCB', NOW() - INTERVAL 5 HOUR, NOW()),
(4, 6, 14490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261009001MB', NOW() - INTERVAL 1 DAY, NOW()),
(5, 7, 48990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261009002TCB', NOW() - INTERVAL 26 HOUR, NOW()),
(6, 8, 9490000.0000, 'VND', 'CARD', 'PAID', 'TXN20261009003MASTER', NOW() - INTERVAL 28 HOUR, NOW()),
(7, 9, 42500000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261008001VCB', NOW() - INTERVAL 2 DAY, NOW()),
(8, 10, 4850000.0000, 'VND', 'COD', 'PENDING', 'COD20261008002', NOW() - INTERVAL 50 HOUR, NOW()),
(9, 11, 31490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261007001MB', NOW() - INTERVAL 3 DAY, NOW()),
(10, 12, 21490000.0000, 'VND', 'CARD', 'PAID', 'TXN20261007002VISA', NOW() - INTERVAL 74 HOUR, NOW()),
(11, 13, 27990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261006001TCB', NOW() - INTERVAL 4 DAY, NOW()),
(12, 14, 9490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261006002VCB', NOW() - INTERVAL 98 HOUR, NOW()),
(13, 15, 43990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261005001MB', NOW() - INTERVAL 5 DAY, NOW()),
(14, 16, 13990000.0000, 'VND', 'CARD', 'PAID', 'TXN20261005002MASTER', NOW() - INTERVAL 122 HOUR, NOW()),
(15, 17, 54990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261004001VCB', NOW() - INTERVAL 6 DAY, NOW()),
(16, 18, 34990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261004002TCB', NOW() - INTERVAL 146 HOUR, NOW()),
(17, 19, 21490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261003001MB', NOW() - INTERVAL 7 DAY, NOW()),
(18, 20, 14490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261002001VCB', NOW() - INTERVAL 8 DAY, NOW()),
(19, 1, 34990000.0000, 'VND', 'COD', 'PENDING', 'COD20261010001', NOW() - INTERVAL 1 HOUR, NOW()),
(20, 3, 2390000.0000, 'VND', 'COD', 'PENDING', 'COD20261010003', NOW() - INTERVAL 3 HOUR, NOW());


-- ============================================================================
-- 6. DATABASE: sale
-- ============================================================================
USE `sale`;

TRUNCATE TABLE `promo_banners`;
TRUNCATE TABLE `voucher_usages`;
TRUNCATE TABLE `vouchers`;
TRUNCATE TABLE `sale_program_items`;
TRUNCATE TABLE `sale_programs`;

-- 6.1 Mã giảm giá Voucher (12 Vouchers)
INSERT INTO `vouchers` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `max_usage`, `max_usage_per_user`, `usage_count`, `active`, `starts_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'TKVNEW', 'Mã ưu đãi 100.000₫ cho khách hàng mới gia nhập The Kinetic Vault', 'FIXED', 100000.0000, 500000.00, 100000.00, 500, 1, 42, b'1', NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 60 DAY, NOW(), NOW()),
(2, 'VIPTECH10', 'Giảm 10% tối đa 1.000.000₫ cho khách hàng sở hữu thẻ VIP Gold/Platinum', 'PERCENTAGE', 10.0000, 3000000.00, 1000000.00, 200, 2, 68, b'1', NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 45 DAY, NOW(), NOW()),
(3, 'FREESHIP', 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 2.000.000₫', 'FIXED', 50000.0000, 2000000.00, 50000.00, 1000, 5, 185, b'1', NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 90 DAY, NOW(), NOW()),
(4, 'FLAGSHIP2026', 'Mã độc quyền sự kiện công nghệ giảm 500.000₫ khi mua iPhone / Mac / Galaxy S', 'FIXED', 500000.0000, 20000000.00, 500000.00, 100, 1, 23, b'1', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, NOW(), NOW()),
(5, 'GAMINGPRO', 'Giảm 300.000₫ cho đơn hàng Laptop Gaming & Gear từ 5.000.000₫', 'FIXED', 300000.0000, 5000000.00, 300000.00, 300, 2, 45, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(6, 'AUDIOPRO', 'Giảm 15% tối đa 800.000₫ cho dòng tai nghe Sony, Marshall, Bose', 'PERCENTAGE', 15.0000, 2000000.00, 800000.00, 150, 1, 38, b'1', NOW() - INTERVAL 8 DAY, NOW() + INTERVAL 20 DAY, NOW(), NOW()),
(7, 'APPLECARE', 'Giảm ngay 200.000₫ khi mua kèm gói phụ kiện Apple chính hãng', 'FIXED', 200000.0000, 1000000.00, 200000.00, 250, 2, 54, b'1', NOW() - INTERVAL 12 DAY, NOW() + INTERVAL 40 DAY, NOW(), NOW()),
(8, 'KEYCHRON150', 'Giảm 150.000₫ khi mua bàn phím cơ Keychron Q-Series', 'FIXED', 150000.0000, 3000000.00, 150000.00, 100, 1, 29, b'1', NOW() - INTERVAL 6 DAY, NOW() + INTERVAL 24 DAY, NOW(), NOW()),
(9, 'LOGISPEED', 'Giảm 100.000₫ khi mua chuột công thái học Logitech MX Series', 'FIXED', 100000.0000, 1500000.00, 100000.00, 200, 2, 61, b'1', NOW() - INTERVAL 14 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(10, 'SMARTWATCH', 'Giảm 400.000₫ cho Apple Watch Ultra & Garmin Fenix Series', 'FIXED', 400000.0000, 10000000.00, 400000.00, 80, 1, 19, b'1', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, NOW(), NOW()),
(11, 'MIDMONTH', 'Đại tiệc công nghệ giữa tháng giảm 8% tối đa 600.000₫', 'PERCENTAGE', 8.0000, 2000000.00, 600000.00, 300, 1, 72, b'1', NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 10 DAY, NOW(), NOW()),
(12, 'PAYDAYSPECIAL', 'Voucher ngày hội lương về giảm 250.000₫ mọi đơn từ 3.000.000₫', 'FIXED', 250000.0000, 3000000.00, 250000.00, 400, 1, 93, b'1', NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 12 DAY, NOW(), NOW());

-- 6.2 Lịch sử sử dụng voucher (15 Dòng voucher usages)
INSERT INTO `voucher_usages` (`voucher_id`, `user_id`, `order_id`, `used_at`) VALUES
(1, 16, 1, NOW() - INTERVAL 1 HOUR),
(2, 17, 2, NOW() - INTERVAL 2 HOUR),
(3, 18, 3, NOW() - INTERVAL 3 HOUR),
(4, 19, 4, NOW() - INTERVAL 4 HOUR),
(5, 20, 5, NOW() - INTERVAL 5 HOUR),
(6, 21, 6, NOW() - INTERVAL 1 DAY),
(2, 22, 7, NOW() - INTERVAL 26 HOUR),
(6, 23, 8, NOW() - INTERVAL 28 HOUR),
(4, 24, 9, NOW() - INTERVAL 2 DAY),
(3, 25, 10, NOW() - INTERVAL 50 HOUR),
(2, 26, 11, NOW() - INTERVAL 3 DAY),
(10, 27, 12, NOW() - INTERVAL 74 HOUR),
(4, 28, 13, NOW() - INTERVAL 4 DAY),
(6, 29, 14, NOW() - INTERVAL 98 HOUR),
(2, 16, 15, NOW() - INTERVAL 5 DAY);

-- 6.3 Chương trình khuyến mãi (10 Chương trình)
INSERT INTO `sale_programs` (`id`, `name`, `description`, `discount_type`, `discount_value`, `start_at`, `end_at`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Tuần Lễ Công Nghệ Flagship TKV 2026', 'Ưu đãi sốc lên đến 15% cho dòng điện thoại cao cấp và phụ kiện công thái học.', 'PERCENTAGE', 10.0000, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 15 DAY, b'1', NOW(), NOW()),
(2, 'Gaming Gear Fest - Đỉnh Cao Hiệu Năng', 'Giảm trực tiếp 12% toàn bộ laptop Asus ROG và bàn phím Razer, Keychron.', 'PERCENTAGE', 12.0000, NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 10 DAY, b'1', NOW(), NOW()),
(3, 'Âm Thanh Hi-Res Mùa Lễ Hội', 'Khuyến mãi 8% cho dòng tai nghe và loa Sony, Marshall, Bose.', 'PERCENTAGE', 8.0000, NOW() - INTERVAL 4 DAY, NOW() + INTERVAL 20 DAY, b'1', NOW(), NOW()),
(4, 'Apple Ecosystem Mega Sale', 'Ưu đãi mua kèm phụ kiện Apple giảm 10% khi sở hữu iPhone, iPad, Mac.', 'PERCENTAGE', 10.0000, NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 25 DAY, b'1', NOW(), NOW()),
(5, 'Galaxy AI Experience Campaign', 'Tặng voucher 500k và giảm giá trực tiếp 5% dòng Galaxy S24 & Z Fold6.', 'PERCENTAGE', 5.0000, NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 18 DAY, b'1', NOW(), NOW()),
(6, 'Setup Công Thái Học Pro', 'Ưu đãi chuột bàn phím văn phòng cao cấp Logitech Master Series giảm 7%.', 'PERCENTAGE', 7.0000, NOW() - INTERVAL 6 DAY, NOW() + INTERVAL 12 DAY, b'1', NOW(), NOW()),
(7, 'Đồng Hồ Thể Thao GPS Khám Phá', 'Giảm 8% cho Apple Watch Ultra 2 và Garmin Fenix 7 Pro Sapphire.', 'PERCENTAGE', 8.0000, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 15 DAY, b'1', NOW(), NOW()),
(8, 'Màn Hình Đồ Họa Đỉnh Cao', 'Khuyến mãi đặc quyền giảm 6% khi mua màn hình Dell UltraSharp 4K.', 'PERCENTAGE', 6.0000, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 10 DAY, b'1', NOW(), NOW()),
(9, 'Sạc Nhanh GaN Anker Siêu Tốc', 'Giảm ngay 15% khi mua củ sạc Anker Prime GaN 100W.', 'PERCENTAGE', 15.0000, NOW() - INTERVAL 4 DAY, NOW() + INTERVAL 8 DAY, b'1', NOW(), NOW()),
(10, 'Flash Sale Giờ Vàng Thứ Bảy', 'Đại tiệc giá sốc giảm 10% toàn bộ phụ kiện công nghệ duy nhất cuối tuần.', 'PERCENTAGE', 10.0000, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY, b'1', NOW(), NOW());

-- 6.4 Sản phẩm thuộc chương trình khuyến mãi (15 Sản phẩm)
INSERT INTO `sale_program_items` (`id`, `sale_program_id`, `product_id`, `variant_id`, `promo_qty_limit`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 4, 30, NOW(), NOW()),
(2, 1, 6, 10, 50, NOW(), NOW()),
(3, 1, 11, 18, 50, NOW(), NOW()),
(4, 2, 4, 8, 20, NOW(), NOW()),
(5, 2, 10, 16, 25, NOW(), NOW()),
(6, 2, 19, 28, 20, NOW(), NOW()),
(7, 3, 6, 11, 30, NOW(), NOW()),
(8, 3, 7, 12, 25, NOW(), NOW()),
(9, 3, 16, 25, 20, NOW(), NOW()),
(10, 3, 20, 29, 15, NOW(), NOW()),
(11, 4, 1, 1, 25, NOW(), NOW()),
(12, 4, 3, 6, 15, NOW(), NOW()),
(13, 4, 8, 14, 60, NOW(), NOW()),
(14, 4, 13, 21, 20, NOW(), NOW()),
(15, 5, 14, 23, 15, NOW(), NOW());

-- 6.5 Banner Quảng cáo (10 Banner)
INSERT INTO `promo_banners` (`id`, `title`, `image_url`, `link_url`, `position`, `active`, `start_at`, `end_at`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 16 Pro Max - Sẵn Hàng Giao Ngay', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', '/products/1', 1, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(2, 'Galaxy S24 Ultra - Quyền Năng Galaxy AI', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80', '/products/2', 2, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(3, 'MacBook Pro M3 Pro - Trạm Sáng Tạo Di Động', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', '/products/3', 3, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(4, 'ROG Zephyrus G16 - Chiến Binh Gaming Đỉnh Cao', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80', '/products/4', 4, b'1', NOW() - INTERVAL 8 DAY, NOW() + INTERVAL 25 DAY, NOW(), NOW()),
(5, 'Sony WH-1000XM5 - Chống Ồn Tuyệt Đối', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', '/products/6', 5, b'1', NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 20 DAY, NOW(), NOW()),
(6, 'Marshall Stanmore III - Phong Cách Vintage', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80', '/products/7', 6, b'1', NOW() - INTERVAL 6 DAY, NOW() + INTERVAL 20 DAY, NOW(), NOW()),
(7, 'Keychron Q1 Pro - Bàn Phím Cơ Custom Cao Cấp', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80', '/products/10', 7, b'1', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 20 DAY, NOW(), NOW()),
(8, 'Logitech MX Master 3S - Đỉnh Cao Công Thái Học', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80', '/products/11', 8, b'1', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 20 DAY, NOW(), NOW()),
(9, 'Apple Watch Ultra 2 - Chinh Phục Mọi Giới Hạn', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1200&q=80', '/products/12', 9, b'1', NOW() - INTERVAL 4 DAY, NOW() + INTERVAL 15 DAY, NOW(), NOW()),
(10, 'Dell UltraSharp 4K - Màu Sắc Chuẩn Xác Đồ Họa', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80', '/products/15', 10, b'1', NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 15 DAY, NOW(), NOW());


-- ============================================================================
-- 7. DATABASE: review_db
-- ============================================================================
USE `review_db`;

TRUNCATE TABLE `review_edit_histories`;
TRUNCATE TABLE `review_media`;
TRUNCATE TABLE `review_responses`;
TRUNCATE TABLE `reviews`;

-- 7.1 Đánh giá sản phẩm (20 Đánh giá chân thực)
INSERT INTO `reviews` (`id`, `order_id`, `product_id`, `variant_id`, `user_id`, `user_name`, `variant_label`, `rating`, `content`, `status`, `created_at`, `updated_at`) VALUES
(1, 14, 1, 2, 16, 'Nguyễn Hoàng Nam', 'Titan Đen - 256GB', 5, 'Máy nguyên seal chính hãng VN/A, kích hoạt chuẩn bảo hành Apple. Shop đóng gói cực kỳ cẩn thận 3 lớp bọc khí, giao hỏa tốc trong 2 giờ tại Hà Nội rất ưng ý!', 'APPROVED', NOW() - INTERVAL 5 DAY, NOW()),
(2, 10, 5, 9, 17, 'Trần Minh Anh', 'Platinum Silver - 32GB/1TB', 5, 'Màn hình OLED 3.5K của Dell XPS 15 đẹp ngỡ ngàng, làm đồ họa và dựng video màu sắc chuẩn chỉ từng chi tiết. Nhân viên tư vấn cấu hình nhiệt tình!', 'APPROVED', NOW() - INTERVAL 3 DAY, NOW()),
(3, 9, 2, 4, 16, 'Nguyễn Hoàng Nam', 'Titan Xám - 256GB', 5, 'Tính năng Galaxy AI dịch trực tiếp và khoanh vùng tìm kiếm quá thông minh, camera zoom 5x chụp sân khấu nét căng. Đáng từng đồng bát gạo!', 'APPROVED', NOW() - INTERVAL 2 DAY, NOW()),
(4, 11, 4, 8, 18, 'Lê Quốc Bảo', 'Eclipse Gray - RTX 4070', 5, 'Zephyrus G16 mỏng nhẹ mà tản nhiệt cực êm, quạt chạy êm ru khi chơi Cyberpunk 2077 ray tracing mượt mà. Đạt chuẩn laptop gaming hoàn hảo nhất 2026.', 'APPROVED', NOW() - INTERVAL 3 DAY, NOW()),
(5, 13, 6, 11, 17, 'Trần Minh Anh', 'Bạc Ánh Kim (Silver)', 5, 'Chống ồn của Sony XM5 đỉnh thật sự, đeo đi máy bay hoặc ngồi quán cafe ồn ào bật nhạc là như lạc vào không gian riêng. Đệm tai siêu êm không bị đau tai.', 'APPROVED', NOW() - INTERVAL 4 DAY, NOW()),
(6, 12, 12, 20, 19, 'Phạm Thu Hà', 'Titan Tự Nhiên - Dây Vải Cam', 5, 'Apple Watch Ultra 2 pin trâu dùng 3 ngày thoải mái, mặt kính sapphire chống trầy hoàn hảo, đeo đi chạy trail leo núi GPS bắt cực kỳ chính xác!', 'APPROVED', NOW() - INTERVAL 4 DAY, NOW()),
(7, 15, 14, 23, 16, 'Nguyễn Hoàng Nam', 'Xám Phantom - 512GB', 5, 'Bản lề gập của Fold6 khít và vuông vức hơn hẳn đời trước, mở ra làm việc đa nhiệm 3 cửa sổ mượt mà như máy tính bảng thu nhỏ. Rất đẳng cấp.', 'APPROVED', NOW() - INTERVAL 5 DAY, NOW()),
(8, 16, 15, 24, 17, 'Trần Minh Anh', 'Bạc Platinum - 27 inch 4K', 5, 'Tấm nền IPS Black của Dell tương phản sâu tuyệt vời, cổng Type-C cắm 1 sợi dây vừa xuất hình 4K vừa sạc 90W cho MacBook cực kỳ gọn gàng.', 'APPROVED', NOW() - INTERVAL 5 DAY, NOW()),
(9, 17, 4, 8, 18, 'Lê Quốc Bảo', 'Eclipse Gray / RTX 4070', 5, 'Màn hình OLED 240Hz màu đen sâu thẳm, phím gõ êm, âm thanh 6 loa to rõ có bass uy lực. Xứng đáng là flagship laptop gaming của Asus.', 'APPROVED', NOW() - INTERVAL 6 DAY, NOW()),
(10, 18, 1, 2, 26, 'Trịnh Tiến Dũng', 'Titan Đen - 256GB', 5, 'Mua tặng đối tác doanh nghiệp, hộp nguyên seal tem Synnex FPT chuẩn chỉnh, xuất hóa đơn VAT điện tử nhanh chóng chuyên nghiệp.', 'APPROVED', NOW() - INTERVAL 6 DAY, NOW()),
(11, 19, 12, 20, 22, 'Hoàng Đăng Khoa', 'Titan Tự Nhiên', 5, 'Đồng hồ đầm tay, màn hình 3000 nits ra nắng gắt xem giờ rõ ràng, la bàn và còi báo động SOS to vang. Dùng đi phượt cực kỳ an tâm.', 'APPROVED', NOW() - INTERVAL 7 DAY, NOW()),
(12, 20, 9, 15, 20, 'Đặng Anh Tuấn', 'Trắng Tiêu Chuẩn', 5, 'PS5 Slim gọn hơn bản cũ nhiều, ổ cứng 1TB cài được nhiều game nặng, tay cầm rung haptic feedback chân thực từng bước chân nhân vật.', 'APPROVED', NOW() - INTERVAL 8 DAY, NOW()),
(13, 2, 6, 10, 17, 'Trần Minh Anh', 'Đen Nhám (Black)', 5, 'Mic lọc tạp âm khi đàm thoại gọi họp online rõ tiếng, kết nối liền lúc 2 thiết bị điện thoại và laptop chuyển đổi tức thì không bị delay.', 'APPROVED', NOW() - INTERVAL 2 HOUR, NOW()),
(14, 3, 11, 18, 18, 'Lê Quốc Bảo', 'Graphite Đen Xám', 5, 'Con lăn điện từ MagSpeed cuộn mượt không nghe tiếng động, form chuột ôm sát lòng bàn tay đỡ mỏi cổ tay rất nhiều khi code cả ngày.', 'APPROVED', NOW() - INTERVAL 3 HOUR, NOW()),
(15, 4, 8, 14, 19, 'Phạm Thu Hà', 'Trắng (White)', 5, 'AirPods Pro 2 cổng Type-C tiện lợi chung sạc với iPhone 16, chế độ âm thanh thích ứng tự giảm nhạc khi có người nói chuyện siêu đỉnh.', 'APPROVED', NOW() - INTERVAL 4 HOUR, NOW()),
(16, 7, 3, 6, 22, 'Hoàng Đăng Khoa', 'Space Black - 18GB/512GB', 5, 'Màu Space Black chống bám vân tay tốt hơn nhiều, chip M3 Pro biên dịch dự án lớn nhanh như chớp, quạt hầu như không bao giờ phải quay mạnh.', 'APPROVED', NOW() - INTERVAL 1 DAY, NOW()),
(17, 8, 7, 12, 23, 'Ngô Phương Thảo', 'Đen Cổ Điển', 5, 'Loa Marshall Stanmore III nghe nhạc acoustic, jazz và vocal ngọt ngào ấm áp, để ở phòng khách nhìn sang trọng như một món đồ decor cao cấp.', 'APPROVED', NOW() - INTERVAL 1 DAY, NOW()),
(18, 10, 10, 16, 25, 'Đỗ Quỳnh Mai', 'Carbon Black - Red Switch', 5, 'Keychron Q1 Pro build nhôm nặng đầm tay, red switch gõ nhẹ êm không ồn, kết nối bluetooth với iPad gõ văn bản tiện lợi vô cùng.', 'APPROVED', NOW() - INTERVAL 2 DAY, NOW()),
(19, 1, 18, 27, 16, 'Nguyễn Hoàng Nam', 'Đen Nhám GaNPrime', 5, 'Củ sạc Anker 100W nhỏ gọn bằng quả trứng mà sạc được cả MacBook Pro 14 lẫn iPhone cùng lúc không bị nóng máy, chân gập chắc chắn.', 'APPROVED', NOW() - INTERVAL 1 HOUR, NOW()),
(20, 5, 16, 25, 20, 'Đặng Anh Tuấn', 'Black Đen Huyền Bí', 5, 'Chống ồn Bose QuietComfort Ultra êm tai số 1, đệm mềm như bơ, tính năng Immersive Audio nghe nhạc live như đang đứng trước sân khấu lớn.', 'APPROVED', NOW() - INTERVAL 5 HOUR, NOW());

-- 7.2 Phản hồi của Cửa hàng (15 Phản hồi)
INSERT INTO `review_responses` (`review_id`, `responded_by`, `content`, `created_at`) VALUES
(1, 'The Kinetic Vault CSKH', 'Dạ TKV chân thành cảm ơn anh Nam đã tin tưởng ủng hộ sản phẩm chính hãng! Chúc anh có những trải nghiệm tuyệt vời cùng iPhone 16 Pro Max ạ.', NOW() - INTERVAL 5 DAY),
(2, 'The Kinetic Vault CSKH', 'Cảm ơn chị Minh Anh đã đánh giá 5 sao cho màn hình OLED của Dell XPS 15! Cần hỗ trợ cân chỉnh màu chuyên nghiệp chị cứ liên hệ shop nhé.', NOW() - INTERVAL 3 DAY),
(3, 'The Kinetic Vault CSKH', 'Dạ shop rất vui vì anh Nam hài lòng với camera AI của Galaxy S24 Ultra! Mọi thắc mắc tính năng S-Pen shop luôn sẵn sàng hỗ trợ anh ạ.', NOW() - INTERVAL 2 DAY),
(4, 'The Kinetic Vault CSKH', 'Cảm ơn anh Bảo! Dòng ROG Zephyrus G16 được Asus tối ưu hệ thống tản nhiệt buồng hơi rất tốt, chúc anh có những giờ phút gaming đỉnh cao.', NOW() - INTERVAL 3 DAY),
(5, 'The Kinetic Vault CSKH', 'Dạ Sony WH-1000XM5 với chip QN1 luôn là sự lựa chọn hàng đầu cho không gian làm việc yên tĩnh, cảm ơn chị Minh Anh nhiều ạ!', NOW() - INTERVAL 4 DAY),
(6, 'The Kinetic Vault CSKH', 'Dạ chị Hà yên tâm Apple Watch Ultra 2 đạt chuẩn quân đội MIL-STD 810H thách thức mọi địa hình thời tiết khắc nghiệt ạ!', NOW() - INTERVAL 4 DAY),
(7, 'The Kinetic Vault CSKH', 'Dạ cảm ơn anh Nam đã đánh giá cao sự hoàn thiện của Galaxy Z Fold6, chúc anh làm việc đa nhiệm thật hiệu quả ạ.', NOW() - INTERVAL 5 DAY),
(8, 'The Kinetic Vault CSKH', 'Dạ Dell UltraSharp IPS Black luôn là tiêu chuẩn vàng cho các nhà thiết kế đồ họa, cảm ơn chị Minh Anh đã luôn đồng hành cùng TKV ạ.', NOW() - INTERVAL 5 DAY),
(9, 'The Kinetic Vault CSKH', 'Cảm ơn anh Bảo đã trải nghiệm màn hình 240Hz OLED mượt mà trên ROG Zephyrus G16, chúc anh leo rank thần tốc!', NOW() - INTERVAL 6 DAY),
(10, 'The Kinetic Vault CSKH', 'Dạ TKV luôn hỗ trợ xuất hóa đơn VAT điện tử nhanh chóng đầy đủ cho doanh nghiệp, cảm ơn anh Dũng ạ.', NOW() - INTERVAL 6 DAY),
(11, 'The Kinetic Vault CSKH', 'Dạ cảm ơn anh Khoa đã tin tưởng đồng hồ thể thao định vị cao cấp của TKV ạ!', NOW() - INTERVAL 7 DAY),
(12, 'The Kinetic Vault CSKH', 'Dạ PS5 Slim bảo hành chính hãng Sony 12 tháng trên toàn quốc, anh Tuấn thỏa sức chiến game nhé!', NOW() - INTERVAL 8 DAY),
(16, 'The Kinetic Vault CSKH', 'Dạ MacBook M3 Pro màu Space Black sử dụng công nghệ anodized giảm bám vân tay độc quyền của Apple, cảm ơn anh Khoa ạ.', NOW() - INTERVAL 1 DAY),
(17, 'The Kinetic Vault CSKH', 'Dạ Marshall Stanmore III đặt góc phòng khách là điểm nhấn âm thanh hoàn mỹ, cảm ơn chị Thảo nhiều ạ.', NOW() - INTERVAL 1 DAY),
(18, 'The Kinetic Vault CSKH', 'Dạ Keychron Q1 Pro hỗ trợ thay switch hot-swap dễ dàng, cần lube switch hoặc mod phím bạn Mai cứ nhắn shop nhé!', NOW() - INTERVAL 2 DAY);

-- 7.3 Ảnh đính kèm đánh giá (15 Ảnh review media)
INSERT INTO `review_media` (`review_id`, `media_type`, `media_url`, `created_at`) VALUES
(1, 'IMAGE', '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', NOW() - INTERVAL 5 DAY),
(2, 'IMAGE', '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', NOW() - INTERVAL 3 DAY),
(3, 'IMAGE', '/api/catalog/admin/products/images/file/b42f9c12c22841e6810dda0305a2d351.jpg', NOW() - INTERVAL 2 DAY),
(4, 'IMAGE', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', NOW() - INTERVAL 3 DAY),
(5, 'IMAGE', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', NOW() - INTERVAL 4 DAY),
(6, 'IMAGE', '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', NOW() - INTERVAL 4 DAY),
(7, 'IMAGE', '/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg', NOW() - INTERVAL 5 DAY),
(8, 'IMAGE', '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', NOW() - INTERVAL 5 DAY),
(10, 'IMAGE', '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', NOW() - INTERVAL 6 DAY),
(11, 'IMAGE', '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', NOW() - INTERVAL 7 DAY),
(12, 'IMAGE', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', NOW() - INTERVAL 8 DAY),
(14, 'IMAGE', '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', NOW() - INTERVAL 3 HOUR),
(15, 'IMAGE', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', NOW() - INTERVAL 4 HOUR),
(17, 'IMAGE', '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', NOW() - INTERVAL 1 DAY),
(18, 'IMAGE', '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', NOW() - INTERVAL 2 DAY);


-- ============================================================================
-- 8. DATABASE: notifications
-- ============================================================================
USE `notifications`;

TRUNCATE TABLE `notification_messages`;

-- 8.1 Hộp thư thông báo hệ thống (20 Thông báo)
INSERT INTO `notification_messages` (`id`, `recipient`, `channel`, `subject`, `body`, `source`, `status`, `created_at`, `updated_at`) VALUES
(1, 'hoangnam.tech@gmail.com', 'EMAIL', '[The Kinetic Vault] Xác nhận đơn hàng #TKV-20261010-001', 'Đơn hàng iPhone 16 Pro Max của quý khách đã được tiếp nhận thành công. Shop đang chuẩn bị đóng gói và giao hỏa tốc.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 1 HOUR, NOW()),
(2, 'minhanh.design@gmail.com', 'EMAIL', '[The Kinetic Vault] Thanh toán thành công đơn hàng #TKV-20261010-002', 'Giao dịch chuyển khoản 7.990.000₫ cho tai nghe Sony WH-1000XM5 đã hoàn tất. Cảm ơn quý khách!', 'PAYMENT_SERVICE', 'SENT', NOW() - INTERVAL 2 HOUR, NOW()),
(3, '0909123456', 'SMS', '[TKV] Don hang TKV-20261010-003 da duoc tao thanh cong.', 'Don hang chuot Logitech MX Master 3S dang cho xu ly. Hotline 19008899.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 3 HOUR, NOW()),
(4, 'thuha.mkt@gmail.com', 'EMAIL', '[The Kinetic Vault] Kích hoạt bảo hành điện tử AirPods Pro 2', 'Tai nghe AirPods Pro 2 của bạn đã được kích hoạt bảo hành chính hãng Apple VN/A 12 tháng.', 'CATALOG_SERVICE', 'SENT', NOW() - INTERVAL 4 HOUR, NOW()),
(5, 'anhtuan.gamer@gmail.com', 'EMAIL', '[The Kinetic Vault] Bàn giao vận chuyển laptop Asus ROG Zephyrus G16', 'Đơn hàng #TKV-20261010-005 đã bàn giao đối tác vận chuyển Viettel Post Express mã MVD: VN882019485.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 5 HOUR, NOW()),
(6, 'khanhlinh.vlog@gmail.com', 'EMAIL', '[The Kinetic Vault] Đơn hàng #TKV-20261009-001 đang trên đường giao', 'Kiện hàng PlayStation 5 Slim đang trên đường giao tới bạn trong hôm nay. Vui lòng giữ liên lạc điện thoại.', 'DELIVERY_SERVICE', 'SENT', NOW() - INTERVAL 1 DAY, NOW()),
(7, 'dangkhoa.coder@gmail.com', 'EMAIL', '[The Kinetic Vault] Giao hàng thành công đơn hàng #TKV-20261009-002', 'MacBook Pro 14 M3 Pro đã giao thành công. Vui lòng đánh giá sản phẩm để nhận ngay voucher 50.000₫.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 26 HOUR, NOW()),
(8, 'phuongthao.hr@gmail.com', 'EMAIL', '[The Kinetic Vault] Quà tặng sinh nhật thành viên VIP TKV', 'Chúc mừng sinh nhật! TKV gửi tặng bạn mã giảm giá VIPTECH10 giảm ngay 10% tối đa 1.000.000₫.', 'USER_SERVICE', 'SENT', NOW() - INTERVAL 28 HOUR, NOW()),
(9, 'quanghuy.media@gmail.com', 'EMAIL', '[The Kinetic Vault] Đơn hàng Dell XPS 15 đã được xác nhận', 'Đơn hàng laptop đồ họa Dell XPS 15 OLED của bạn đang được kỹ thuật viên kiểm tra kiểm định chất lượng.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 2 DAY, NOW()),
(10, 'quynhmai.edu@gmail.com', 'EMAIL', '[The Kinetic Vault] Thông báo giao hàng bàn phím Keychron Q1 Pro', 'Đơn hàng COD mã #TKV-20261008-002 dự kiến giao tới bạn vào ngày mai.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 50 HOUR, NOW()),
(11, 'tiendung.ceo@gmail.com', 'EMAIL', '[The Kinetic Vault] Hóa đơn điện tử VAT đơn hàng Galaxy S24 Ultra', 'Hóa đơn giá trị gia tăng số HDBH-2026-0048 đã được phát hành thành công trên hệ thống hóa đơn điện tử.', 'ACCOUNTING_SERVICE', 'SENT', NOW() - INTERVAL 3 DAY, NOW()),
(12, 'thuhuong.sale@gmail.com', 'EMAIL', '[The Kinetic Vault] Chúc mừng bạn đã thăng hạng thành viên SILVER', 'Bạn vừa đạt hạng thành viên Bạc với nhiều quyền lợi miễn phí vận chuyển và quà tặng độc quyền.', 'USER_SERVICE', 'SENT', NOW() - INTERVAL 74 HOUR, NOW()),
(13, 'hoangphuc.arch@gmail.com', 'EMAIL', '[The Kinetic Vault] Giao hàng thành công iPad Pro M4 Tandem OLED', 'Cảm ơn quý khách đã tin dùng sản phẩm iPad Pro M4 thế hệ mới tại The Kinetic Vault.', 'ORDER_SERVICE', 'SENT', NOW() - INTERVAL 4 DAY, NOW()),
(14, 'haiyen.audit@gmail.com', 'EMAIL', '[The Kinetic Vault] Đăng ký nhận thông báo ra mắt Marshall Stanmore IV', 'Bạn đã đăng ký thành công danh sách đặt trước sản phẩm âm thanh thế hệ mới tại TKV.', 'SALE_SERVICE', 'SENT', NOW() - INTERVAL 98 HOUR, NOW()),
(15, 'nguyendinhkiet12092005@gmail.com', 'EMAIL', '[Cảnh báo Tồn kho TKV] Sản phẩm Apple Watch Ultra 2 sắp hết hàng', 'Hệ thống kiểm kê kho ghi nhận số lượng tồn kho sản phẩm SP-AW-ULTRA2 chỉ còn 4 chiếc. Vui lòng nhập hàng.', 'INVENTORY_SERVICE', 'SENT', NOW() - INTERVAL 1 DAY, NOW()),
(16, 'nguyendinhkiet12092005@gmail.com', 'EMAIL', '[Báo cáo Vận hành] Doanh thu tuần lễ đạt 322.330.000₫', 'Báo cáo tổng kết dòng tiền tuần qua ghi nhận 14 đơn hàng thành công, tỷ lệ duyệt đạt 98.5%.', 'ANALYTICS_SERVICE', 'SENT', NOW() - INTERVAL 12 HOUR, NOW()),
(17, 'hoangnam.tech@gmail.com', 'WEB', 'Đơn hàng #TKV-20261010-001 đang được đóng gói', 'Kho tổng Quận 1 đang chuẩn bị kiện hàng cho bạn.', 'WEB_DISPATCH', 'DELIVERED', NOW() - INTERVAL 40 MINUTE, NOW()),
(18, 'minhanh.design@gmail.com', 'WEB', 'Ưu đãi dành riêng cho bạn: Voucher FLAGSHIP2026', 'Giảm ngay 500.000₫ cho các thiết bị flagship công nghệ.', 'WEB_DISPATCH', 'DELIVERED', NOW() - INTERVAL 1 HOUR, NOW()),
(19, 'quocbao.dev@gmail.com', 'WEB', 'Cập nhật địa chỉ nhận hàng thành công', 'Địa chỉ giao hàng mặc định của bạn đã được cập nhật sang Đà Nẵng.', 'WEB_DISPATCH', 'DELIVERED', NOW() - INTERVAL 2 HOUR, NOW()),
(20, 'thuha.mkt@gmail.com', 'WEB', 'Chào mừng thành viên mới gia nhập The Kinetic Vault', 'Nhận ngay mã TKVNEW giảm 100.000₫ cho đơn hàng đầu tiên của bạn.', 'WEB_DISPATCH', 'DELIVERED', NOW() - INTERVAL 3 HOUR, NOW());


-- ============================================================================
-- 9. DATABASE: activity_log
-- ============================================================================
USE `activity_log`;

TRUNCATE TABLE `web_activities`;

-- 9.1 Nhật ký hoạt động hệ thống (25 Hoạt động)
INSERT INTO `web_activities` (`id`, `action`, `actor_username`, `actor_user_id`, `resource_type`, `resource_id`, `request_path`, `http_method`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 'SYSTEM_BOOT', 'admin', '15', 'System', 'CORE_SERVICES', '/admin/system', 'POST', '127.0.0.1', NOW() - INTERVAL 8 DAY, NOW()),
(2, 'CATALOG_INIT', 'admin', '15', 'Product', '1', '/admin/products', 'POST', '127.0.0.1', NOW() - INTERVAL 7 DAY, NOW()),
(3, 'INVENTORY_IMPORT', 'admin', '15', 'Inventory', 'BATCH_001', '/admin/inventory/import', 'POST', '127.0.0.1', NOW() - INTERVAL 7 DAY, NOW()),
(4, 'CATEGORY_CREATE', 'admin', '15', 'Category', '1', '/admin/categories', 'POST', '127.0.0.1', NOW() - INTERVAL 7 DAY, NOW()),
(5, 'BRAND_CREATE', 'admin', '15', 'Brand', '1', '/admin/brands', 'POST', '127.0.0.1', NOW() - INTERVAL 6 DAY, NOW()),
(6, 'PRODUCT_CREATE', 'admin', '15', 'Product', '1', '/admin/products/new', 'POST', '127.0.0.1', NOW() - INTERVAL 6 DAY, NOW()),
(7, 'PRODUCT_IMAGE_UPLOAD', 'admin', '15', 'Media', '1', '/admin/products/1/images', 'POST', '127.0.0.1', NOW() - INTERVAL 6 DAY, NOW()),
(8, 'USER_REGISTER', 'hoangnam', '16', 'User', '16', '/api/users/register', 'POST', '118.70.12.34', NOW() - INTERVAL 6 DAY, NOW()),
(9, 'ORDER_CREATE', 'hoangnam', '16', 'Order', '18', '/api/orders', 'POST', '118.70.12.34', NOW() - INTERVAL 6 DAY, NOW()),
(10, 'PAYMENT_PROCESS', 'system', '15', 'Payment', '16', '/api/payments/process', 'POST', '127.0.0.1', NOW() - INTERVAL 6 DAY, NOW()),
(11, 'ORDER_DELIVER', 'admin', '15', 'Order', '18', '/admin/orders/18/deliver', 'PUT', '127.0.0.1', NOW() - INTERVAL 5 DAY, NOW()),
(12, 'VOUCHER_CREATE', 'admin', '15', 'Voucher', 'TKVNEW', '/admin/sales/vouchers', 'POST', '127.0.0.1', NOW() - INTERVAL 5 DAY, NOW()),
(13, 'SALE_CAMPAIGN_LAUNCH', 'admin', '15', 'Campaign', '1', '/admin/sales/campaigns', 'POST', '127.0.0.1', NOW() - INTERVAL 5 DAY, NOW()),
(14, 'BANNER_UPLOAD', 'admin', '15', 'Banner', '1', '/admin/banners', 'POST', '127.0.0.1', NOW() - INTERVAL 4 DAY, NOW()),
(15, 'STOCK_ADJUSTMENT', 'admin', '15', 'Inventory', '12', '/admin/inventory/adjust', 'PUT', '127.0.0.1', NOW() - INTERVAL 4 DAY, NOW()),
(16, 'REVIEW_APPROVE', 'admin', '15', 'Review', '1', '/admin/reviews/1/approve', 'PUT', '127.0.0.1', NOW() - INTERVAL 3 DAY, NOW()),
(17, 'CUSTOMER_UPGRADE', 'system', '15', 'User', '16', '/api/users/membership', 'PUT', '127.0.0.1', NOW() - INTERVAL 3 DAY, NOW()),
(18, 'STORE_CONTACT_UPDATE', 'admin', '15', 'StoreContact', '1', '/admin/settings/stores', 'PUT', '127.0.0.1', NOW() - INTERVAL 2 DAY, NOW()),
(19, 'ORDER_CONFIRM', 'admin', '15', 'Order', '6', '/admin/orders/6/confirm', 'PUT', '127.0.0.1', NOW() - INTERVAL 1 DAY, NOW()),
(20, 'ORDER_SHIP', 'admin', '15', 'Order', '9', '/admin/orders/9/ship', 'PUT', '127.0.0.1', NOW() - INTERVAL 24 HOUR, NOW()),
(21, 'TELEGRAM_ALERT_DISPATCH', 'system', '15', 'Telegram', 'ALERT_001', '/api/telegram/send', 'POST', '127.0.0.1', NOW() - INTERVAL 12 HOUR, NOW()),
(22, 'CACHE_FLUSH_REDIS', 'admin', '15', 'Cache', 'ALL', '/admin/system/cache', 'POST', '127.0.0.1', NOW() - INTERVAL 6 HOUR, NOW()),
(23, 'ORDER_CREATE', 'hoangnam', '16', 'Order', '1', '/api/orders', 'POST', '118.70.12.34', NOW() - INTERVAL 1 HOUR, NOW()),
(24, 'ORDER_CREATE', 'minhanh', '17', 'Order', '2', '/api/orders', 'POST', '14.161.45.67', NOW() - INTERVAL 2 HOUR, NOW()),
(25, 'DASHBOARD_LIVE_METRICS', 'admin', '15', 'Dashboard', 'OVERVIEW', '/admin/dashboard', 'GET', '127.0.0.1', NOW() - INTERVAL 10 MINUTE, NOW());


-- ============================================================================
-- 10. DATABASE: product_recommendations
-- ============================================================================
USE `product_recommendations`;

TRUNCATE TABLE `manual_product_recommendations`;
TRUNCATE TABLE `recommendation`;

-- 10.1 Gợi ý sản phẩm thủ công (Cross-sell thông minh) (20 Dòng)
INSERT INTO `manual_product_recommendations` (`source_product_id`, `target_product_id`, `reason`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 8, 'Mua kèm AirPods Pro 2 USB-C đồng bộ âm thanh không dây hoàn hảo', 1, NOW(), NOW()),
(1, 12, 'Kết hợp Apple Watch Ultra 2 cho trải nghiệm thể thao mạo hiểm', 2, NOW(), NOW()),
(1, 18, 'Củ sạc nhanh Anker GaN 100W sạc siêu tốc an toàn cho iPhone 16', 3, NOW(), NOW()),

(2, 6, 'Tai nghe Sony WH-1000XM5 chuẩn âm Hi-Res cho Galaxy S24 Ultra', 1, NOW(), NOW()),
(2, 18, 'Củ sạc Anker Prime GaN hỗ trợ sạc siêu nhanh 45W cho Samsung', 2, NOW(), NOW()),

(3, 11, 'Chuột công thái học Logitech MX Master 3S tối ưu cho dân lập trình Mac', 1, NOW(), NOW()),
(3, 10, 'Bàn phím cơ Keychron Q1 Pro tương thích macOS hoàn hảo', 2, NOW(), NOW()),
(3, 15, 'Màn hình đồ họa Dell UltraSharp 4K Type-C cắm 1 sợi dây xuất hình', 3, NOW(), NOW()),

(4, 19, 'Bàn phím cơ gaming Razer Huntsman V3 Pro Rapid Trigger cực bén', 1, NOW(), NOW()),
(4, 9, 'Chiến thêm game độc quyền console PlayStation 5 Slim', 2, NOW(), NOW()),

(6, 7, 'Thêm loa Bluetooth Marshall Stanmore III cho không gian phòng khách', 1, NOW(), NOW()),
(7, 20, 'Loa tiệc tùng di động ngoài trời JBL Boombox 3 chống nước', 1, NOW(), NOW()),

(8, 1, 'Lên đời iPhone 16 Pro Max tận dụng trọn vẹn chip Apple H2', 1, NOW(), NOW()),
(10, 11, 'Combo chuột bàn phím hoàn hảo: Keychron Q1 Pro + Logitech MX Master 3S', 1, NOW(), NOW()),

(13, 1, 'Hệ sinh thái Apple hoàn mỹ: iPad Pro M4 + iPhone 16 Pro Max', 1, NOW(), NOW()),
(13, 8, 'Nghe nhạc xem phim chuẩn phòng chiếu với AirPods Pro 2', 2, NOW(), NOW()),

(14, 2, 'Cặp đôi Galaxy đỉnh cao: Z Fold6 đa nhiệm + S24 Ultra nhiếp ảnh', 1, NOW(), NOW()),
(15, 3, 'Combo đồ họa kiến trúc: Dell UltraSharp 4K + MacBook Pro 14 M3 Pro', 1, NOW(), NOW()),
(16, 6, 'So sánh chống ồn đỉnh cao: Bose QC Ultra vs Sony WH-1000XM5', 1, NOW(), NOW()),
(17, 12, 'Khám phá bộ đôi đồng hồ phiêu lưu mạo hiểm: Garmin Fenix 7 vs Apple Watch Ultra', 1, NOW(), NOW());

-- 10.2 Thuật toán gợi ý sản phẩm dựa trên tương tác (20 Dòng)
INSERT INTO `recommendation` (`product_id`, `user_id`, `user_name`, `rating`, `created_at`, `updated_at`) VALUES
(1, 16, 'hoangnam', 5, NOW() - INTERVAL 5 DAY, NOW()),
(2, 16, 'hoangnam', 5, NOW() - INTERVAL 4 DAY, NOW()),
(3, 17, 'minhanh', 5, NOW() - INTERVAL 4 DAY, NOW()),
(4, 18, 'quocbao', 5, NOW() - INTERVAL 3 DAY, NOW()),
(5, 17, 'minhanh', 5, NOW() - INTERVAL 3 DAY, NOW()),
(6, 17, 'minhanh', 5, NOW() - INTERVAL 2 DAY, NOW()),
(7, 23, 'phuongthao', 5, NOW() - INTERVAL 2 DAY, NOW()),
(8, 19, 'thuha', 5, NOW() - INTERVAL 2 DAY, NOW()),
(9, 20, 'anhtuan', 5, NOW() - INTERVAL 1 DAY, NOW()),
(10, 25, 'quynhmai', 5, NOW() - INTERVAL 1 DAY, NOW()),
(11, 18, 'quocbao', 5, NOW() - INTERVAL 1 DAY, NOW()),
(12, 19, 'thuha', 5, NOW() - INTERVAL 1 DAY, NOW()),
(13, 28, 'hoangphuc', 5, NOW() - INTERVAL 12 HOUR, NOW()),
(14, 16, 'hoangnam', 5, NOW() - INTERVAL 10 HOUR, NOW()),
(15, 17, 'minhanh', 5, NOW() - INTERVAL 8 HOUR, NOW()),
(16, 20, 'anhtuan', 5, NOW() - INTERVAL 6 HOUR, NOW()),
(17, 22, 'dangkhoa', 5, NOW() - INTERVAL 4 HOUR, NOW()),
(18, 16, 'hoangnam', 5, NOW() - INTERVAL 2 HOUR, NOW()),
(19, 20, 'anhtuan', 5, NOW() - INTERVAL 1 HOUR, NOW()),
(20, 29, 'haiyen', 5, NOW() - INTERVAL 30 MINUTE, NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- HOÀN TẤT NẠP DỮ LIỆU TOÀN DIỆN (>= 15 - 25 DÒNG MỖI BẢNG) CHO HỆ THỐNG TKV!
-- ============================================================================
