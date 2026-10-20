-- ============================================================================
-- THE KINETIC VAULT (TKV) - MASTER SEED SCRIPT: REALISTIC PRODUCTION-GRADE DATA
-- ============================================================================
-- Script làm sạch toàn bộ dữ liệu cũ và nạp dữ liệu mẫu mới chuẩn 100% như thật.
-- Mã hóa: UTF-8 (utf8mb4)
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

-- 1.1 Thương hiệu (Brands)
INSERT INTO `brands` (`id`, `name`, `slug`, `country`, `description`, `logo_url`, `website`, `is_hidden`, `created_at`, `updated_at`) VALUES
(1, 'Apple', 'apple', 'Mỹ', 'Tập đoàn công nghệ hàng đầu thế giới với hệ sinh thái iPhone, Mac, iPad cao cấp.', '/api/catalog/admin/brands/logos/60f8da5c03b14065af1ff6c0cf822cc2.png', 'https://www.apple.com/vn', b'0', NOW(), NOW()),
(2, 'Samsung', 'samsung', 'Hàn Quốc', 'Tập đoàn điện tử tiên phong thế giới với dòng Galaxy S, Z Fold và công nghệ AI.', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', 'https://www.samsung.com/vn', b'0', NOW(), NOW()),
(3, 'Sony', 'sony', 'Nhật Bản', 'Thương hiệu biểu tượng về âm thanh Hi-Res, máy chơi game PlayStation và camera.', 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sony_logo.svg', 'https://www.sony.com.vn', b'0', NOW(), NOW()),
(4, 'Marshall', 'marshall', 'Anh Quốc', 'Huyền thoại âm thanh vintage với chất âm mạnh mẽ, thiết kế da cổ điển sang trọng.', NULL, 'https://www.marshallheadphones.com', b'0', NOW(), NOW()),
(5, 'Dell', 'dell', 'Mỹ', 'Dòng laptop doanh nhân và đồ họa cao cấp XPS, Alienware chuẩn mực toàn cầu.', NULL, 'https://www.dell.com/en-vn', b'0', NOW(), NOW()),
(6, 'Asus ROG', 'asus-rog', 'Đài Loan', 'Thương hiệu Gaming Gear và Laptop gaming hiệu năng đỉnh cao số 1 thế giới.', NULL, 'https://rog.asus.com/vn', b'0', NOW(), NOW()),
(7, 'Keychron', 'keychron', 'Mỹ', 'Thương hiệu bàn phím cơ không dây Custom cao cấp tương thích hoàn hảo Mac & Windows.', NULL, 'https://keychron.com', b'0', NOW(), NOW()),
(8, 'Logitech', 'logitech', 'Thụy Sĩ', 'Thương hiệu phụ kiện văn phòng công thái học và chuột phím Master Series hàng đầu.', NULL, 'https://www.logitech.com/vi-vn', b'0', NOW(), NOW());

-- 1.2 Danh mục (Categories)
INSERT INTO `categories` (`id`, `name`, `slug`, `is_hidden`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'Điện thoại & Tablet', 'dien-thoai-tablet', b'0', NULL, NOW(), NOW()),
(2, 'Laptop & Máy tính', 'laptop-may-tinh', b'0', NULL, NOW(), NOW()),
(3, 'Thiết bị âm thanh', 'thiet-bi-am-thanh', b'0', NULL, NOW(), NOW()),
(4, 'Gaming Gear & Console', 'gaming-gear-console', b'0', NULL, NOW(), NOW()),
(5, 'Đồng hồ thông minh', 'dong-ho-thong-minh', b'0', NULL, NOW(), NOW()),
(6, 'Bàn phím & Chuột cao cấp', 'ban-phim-chuot-cao-cap', b'0', NULL, NOW(), NOW());

-- 1.3 Sản phẩm (Products)
INSERT INTO `products` (`id`, `product_name`, `sku`, `price`, `discription`, `brand_id`, `category_id`, `availability`, `sales_count`, `view_count`, `is_hidden`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 16 Pro Max 256GB', 'SP-IP16PM-256', 34990000.00, 'Flagship mới nhất của Apple với khung viền Titan cấp 5, nút điều khiển Camera Control và chip Apple A18 Pro hỗ trợ Apple Intelligence.', 1, 1, 85, 42, 1250, b'0', NOW(), NOW()),
(2, 'Samsung Galaxy S24 Ultra 5G', 'SP-S24U-512', 31490000.00, 'Đỉnh cao quyền năng Galaxy AI, màn hình phẳng Dynamic AMOLED 2X 6.8 inch, camera 200MP zoom quang 5x và bút S-Pen tích hợp.', 2, 1, 60, 35, 980, b'0', NOW(), NOW()),
(3, 'MacBook Pro 14 M3 Pro (18GB/512GB)', 'SP-MBP14-M3P', 48990000.00, 'Hiệu năng đỉnh cao đồ họa và lập trình với chip Apple M3 Pro, màn hình Liquid Retina XDR 120Hz và thời lượng pin ấn tượng lên đến 18 giờ.', 1, 2, 40, 18, 860, b'0', NOW(), NOW()),
(4, 'Laptop Gaming Asus ROG Zephyrus G16', 'SP-ROG-G16', 54990000.00, 'Laptop gaming mỏng nhẹ cao cấp khung nhôm CNC, màn hình OLED 2.5K 240Hz, chip Intel Core Ultra 9 và card đồ họa RTX 4070.', 6, 2, 25, 12, 740, b'0', NOW(), NOW()),
(5, 'Laptop Dell XPS 15 9530 OLED', 'SP-DELL-XPS15', 42500000.00, 'Kiệt tác máy trạm di động viền siêu mỏng InfinityEdge 3.5K OLED cảm ứng, Intel Core i7 thế hệ 13 và card đồ họa rời NVIDIA RTX 4050.', 5, 2, 30, 9, 620, b'0', NOW(), NOW()),
(6, 'Tai nghe Chống ồn Sony WH-1000XM5', 'SP-SONY-XM5', 7990000.00, 'Công nghệ chống ồn chủ động tốt nhất thế giới với bộ xử lý V1 & QN1, thời lượng pin 30 giờ và âm thanh chuẩn Hi-Res Audio Wireless.', 3, 3, 50, 68, 1450, b'0', NOW(), NOW()),
(7, 'Loa Bluetooth Marshall Stanmore III', 'SP-MARSHALL-ST3', 9490000.00, 'Loa gia đình huyền thoại thiết kế cổ điển biểu tượng, âm trường rộng mở, kết nối Bluetooth 5.2 và cổng RCA/AUX đa dụng.', 4, 3, 45, 52, 1180, b'0', NOW(), NOW()),
(8, 'Tai nghe Apple AirPods Pro 2 USB-C', 'SP-AIRPODS-P2', 5690000.00, 'Tai nghe true wireless hàng đầu chip H2, chống ồn chủ động gấp 2 lần, hộp sạc MagSafe cổng USB-C và chuẩn kháng bụi nước IP54.', 1, 3, 110, 95, 2100, b'0', NOW(), NOW()),
(9, 'Máy chơi game Sony PlayStation 5 Slim', 'SP-PS5-SLIM', 14490000.00, 'Phiên bản Slim tinh gọn tích hợp ổ cứng SSD 1TB tốc độ siêu tốc, tay cầm phản hồi lực DualSense và đồ họa 4K 120FPS Ray Tracing đỉnh cao.', 3, 4, 35, 41, 1630, b'0', NOW(), NOW()),
(10, 'Bàn phím cơ Keychron Q1 Pro Wireless', 'SP-KEYCHRON-Q1', 4850000.00, 'Bàn phím cơ Custom full nhôm CNC cao cấp, kết nối Bluetooth 5.1/Type-C, gasket mount êm ái, hỗ trợ QMK/VIA và hot-swap.', 7, 6, 40, 31, 890, b'0', NOW(), NOW()),
(11, 'Chuột không dây Logitech MX Master 3S', 'SP-LOGI-MX3S', 2390000.00, 'Chuột công thái học cao cấp cho lập trình viên và sáng tạo nội dung, click yên tĩnh SilentTouch, con lăn MagSpeed cuộn 1000 dòng/giây.', 8, 6, 80, 74, 1340, b'0', NOW(), NOW()),
(12, 'Đồng hồ thông minh Apple Watch Ultra 2', 'SP-AW-ULTRA2', 21490000.00, 'Đồng hồ thể thao mạo hiểm vỏ Titan 49mm, màn hình sáng nhất 3000 nits, chuẩn lặn 40m, GPS tần số kép và thời lượng pin 72 giờ.', 1, 5, 20, 16, 760, b'0', NOW(), NOW());

-- 1.4 Danh mục liên kết (product_categories)
INSERT INTO `product_categories` (`product_id`, `category_id`) VALUES
(1, 1), (2, 1), (3, 2), (4, 2), (4, 4), (5, 2), (6, 3), (7, 3), (8, 3), (9, 4), (10, 6), (10, 4), (11, 6), (12, 5);

-- 1.5 Biến thể sản phẩm (product_variants)
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

(20, 12, 'Titan Tự Nhiên - Dây Vải Cam', 'SP-AWU2-ORG', 'Titan Tự Nhiên', '49mm', 21490000.00, 21990000.00, 20, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', NOW(), NOW());

-- 1.6 Hình ảnh sản phẩm (product_images)
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
(12, 12, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', '5b67538ba5b8469696cac2b1b0004692.webp', 'IMAGE', b'1', 1, NOW(), NOW());

-- 1.7 Thông số kỹ thuật (product_technical_specs)
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
(11, 'Pin', 'Thời lượng sử dụng', 'Lên đến 70 ngày sau 1 lần sạc đầy', '', 2, NOW(), NOW());


-- ============================================================================
-- 2. DATABASE: inventory
-- ============================================================================
USE `inventory`;

TRUNCATE TABLE `stock_movements`;
TRUNCATE TABLE `inventory_balances`;

-- 2.1 Số lượng tồn kho theo sản phẩm & biến thể
INSERT INTO `inventory_balances` (`id`, `product_id`, `variant_id`, `quantity_on_hand`, `created_at`, `updated_at`) VALUES
-- SP 1: iPhone 16 Pro Max (Tổng: 85)
(1, 1, 1, 30, NOW(), NOW()),
(2, 1, 2, 25, NOW(), NOW()),
(3, 1, 3, 30, NOW(), NOW()),

-- SP 2: Galaxy S24 Ultra (Tổng: 60)
(4, 2, 4, 35, NOW(), NOW()),
(5, 2, 5, 25, NOW(), NOW()),

-- SP 3: MacBook Pro 14 M3 (Tổng: 40)
(6, 3, 6, 20, NOW(), NOW()),
(7, 3, 7, 20, NOW(), NOW()),

-- SP 4: Asus ROG Zephyrus G16 (25)
(8, 4, 8, 25, NOW(), NOW()),

-- SP 5: Dell XPS 15 (30)
(9, 5, 9, 30, NOW(), NOW()),

-- SP 6: Sony WH-1000XM5 (50)
(10, 6, 10, 25, NOW(), NOW()),
(11, 6, 11, 25, NOW(), NOW()),

-- SP 7: Marshall Stanmore III (45)
(12, 7, 12, 25, NOW(), NOW()),
(13, 7, 13, 20, NOW(), NOW()),

-- SP 8: AirPods Pro 2 (110)
(14, 8, 14, 110, NOW(), NOW()),

-- SP 9: PS5 Slim (35)
(15, 9, 15, 35, NOW(), NOW()),

-- SP 10: Keychron Q1 Pro (40)
(16, 10, 16, 20, NOW(), NOW()),
(17, 10, 17, 20, NOW(), NOW()),

-- SP 11: Logitech MX Master 3S (80)
(18, 11, 18, 45, NOW(), NOW()),
(19, 11, 19, 35, NOW(), NOW()),

-- SP 12: Apple Watch Ultra 2 (Tồn thấp: 4 - CẢNH BÁO TỒN KHO)
(20, 12, 20, 4, NOW(), NOW());

-- 2.2 Lịch sử nhập kho (Stock movements)
INSERT INTO `stock_movements` (`product_id`, `variant_id`, `quantity`, `balance_after`, `movement_type`, `unit_cost`, `note`, `movement_at`, `created_at`, `updated_at`) VALUES
(1, 1, 30, 30, 'IMPORT', 29000000.00, 'Nhập hàng lô flagship chính hãng Apple VN/A', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(1, 2, 25, 25, 'IMPORT', 29000000.00, 'Nhập hàng lô flagship chính hãng Apple VN/A', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(2, 4, 35, 35, 'IMPORT', 25000000.00, 'Lô hàng Samsung Galaxy S24 Ultra phân phối SSVN', NOW() - INTERVAL 5 DAY, NOW(), NOW()),
(3, 6, 20, 20, 'IMPORT', 41000000.00, 'Nhập kho MacBook Pro M3 Pro chính hãng Synnex FPT', NOW() - INTERVAL 4 DAY, NOW(), NOW()),
(6, 10, 25, 25, 'IMPORT', 6500000.00, 'Nhập hàng tai nghe Sony Electronics Vietnam', NOW() - INTERVAL 3 DAY, NOW(), NOW()),
(12, 20, 5, 4, 'EXPORT', 18000000.00, 'Xuất kho giao khách đặt trước - Hàng sắp hết', NOW() - INTERVAL 1 DAY, NOW(), NOW());


-- ============================================================================
-- 3. DATABASE: users
-- ============================================================================
USE `users`;

-- Xóa dữ liệu cũ nhưng bảo lưu Admin ID 15
DELETE FROM `user_login_device_approval_tokens`;
DELETE FROM `user_profile_change_logs`;
DELETE FROM `user_addresses` WHERE `id` > 0;
DELETE FROM `users` WHERE `id` NOT IN (15);
DELETE FROM `users_details` WHERE `id` NOT IN (1);

-- Đảm bảo admin ID 15 chuẩn xác
UPDATE `users` SET 
  `user_name` = 'admin',
  `email` = 'nguyendinhkiet12092005@gmail.com',
  `phone_number` = '0865482131',
  `role_id` = 1,
  `user_details_id` = 1,
  `membership_level` = 'PLATINUM',
  `total_spent` = 125000000.00,
  `completed_orders_count` = 8,
  `is_activated` = b'1'
WHERE `id` = 15;

-- Thêm khách hàng thân thiết chuẩn thực tế
INSERT INTO `users_details` (`id`, `first_name`, `last_name`, `gender`, `birth_date`, `avatar_url`, `created_at`, `updated_at`) VALUES
(2, 'Nam', 'Nguyễn Hoàng', 'Nam', '1995-04-12', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(3, 'Anh', 'Trần Minh', 'Nữ', '1998-08-22', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(4, 'Bảo', 'Lê Quốc', 'Nam', '1992-11-05', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', NOW(), NOW()),
(5, 'Hà', 'Phạm Thu', 'Nữ', '2001-02-18', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', NOW(), NOW());

INSERT INTO `users` (`id`, `user_name`, `user_password`, `email`, `phone_number`, `role_id`, `user_details_id`, `is_activated`, `membership_level`, `total_spent`, `completed_orders_count`, `failed_login_attempts`, `created_at`, `updated_at`) VALUES
(16, 'hoangnam', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'hoangnam.tech@gmail.com', '0912345678', 3, 2, b'1', 'GOLD', 78470000.00, 3, 0, NOW() - INTERVAL 15 DAY, NOW()),
(17, 'minhanh', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'minhanh.design@gmail.com', '0987654321', 3, 3, b'1', 'PLATINUM', 97480000.00, 4, 0, NOW() - INTERVAL 12 DAY, NOW()),
(18, 'quocbao', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'quocbao.dev@gmail.com', '0909123456', 3, 4, b'1', 'SILVER', 22480000.00, 2, 0, NOW() - INTERVAL 9 DAY, NOW()),
(19, 'thuha', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 'thuha.mkt@gmail.com', '0938112233', 3, 5, b'1', 'BRONZE', 5690000.00, 1, 0, NOW() - INTERVAL 6 DAY, NOW());

-- Sổ địa chỉ khách hàng
INSERT INTO `user_addresses` (`user_details_id`, `recipient_name`, `phone_number`, `full_address`, `street_line`, `ward_name`, `province_name`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'Admin Quản Trị TKV', '0865482131', 'Tòa nhà Landmark 81, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', 'Landmark 81', 'Phường 22', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(2, 'Nguyễn Hoàng Nam', '0912345678', 'Số 88 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội', 'Số 88 Phố Huế', 'Phường Hàng Bài', 'Hà Nội', b'1', NOW(), NOW()),
(3, 'Trần Minh Anh', '0987654321', 'Căn hộ 12.04 Thảo Điền Pearl, Phường Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh', 'Thảo Điền Pearl', 'Phường Thảo Điền', 'TP. Hồ Chí Minh', b'1', NOW(), NOW()),
(4, 'Lê Quốc Bảo', '0909123456', 'Số 45 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, Đà Nẵng', 'Số 45 Nguyễn Văn Linh', 'Phường Nam Dương', 'Đà Nẵng', b'1', NOW(), NOW()),
(5, 'Phạm Thu Hà', '0938112233', 'Số 120 Đường 30/4, Phường An Phú, Quận Ninh Kiều, Cần Thơ', 'Số 120 Đường 30/4', 'Phường An Phú', 'Cần Thơ', b'1', NOW(), NOW());


-- ============================================================================
-- 4. DATABASE: orders
-- ============================================================================
USE `orders`;

TRUNCATE TABLE `order_items`;
TRUNCATE TABLE `items`;
TRUNCATE TABLE `orders`;

-- Danh sách đơn hàng trải đều 7 ngày qua tạo doanh thu thực tế đỉnh cao
INSERT INTO `orders` (`id`, `order_number`, `mvd`, `user_id`, `user_name`, `phone_last4`, `shipping_address`, `status`, `payment_status`, `payment_method`, `total`, `ordered_date`, `created_at`, `updated_at`) VALUES
-- Ngày 1 (Hôm nay: 2026-10-10) - Đơn hàng mới tạo & đang duyệt
(1, 'TKV-20261010-001', 'VN882019481', 16, 'hoangnam', '5678', 'Số 88 Phố Huế, Hoàn Kiếm, Hà Nội', 'CREATED', 'PENDING', 'COD', 34990000.00, '2026-10-10', NOW() - INTERVAL 1 HOUR, NOW()),
(2, 'TKV-20261010-002', 'VN882019482', 17, 'minhanh', '4321', 'Thảo Điền Pearl, TP. Thủ Đức, TP.HCM', 'CREATED', 'PAID', 'BANK_TRANSFER', 7990000.00, '2026-10-10', NOW() - INTERVAL 2 HOUR, NOW()),
(3, 'TKV-20261010-003', 'VN882019483', 18, 'quocbao', '3456', 'Số 45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', 'CREATED', 'PENDING', 'COD', 2390000.00, '2026-10-10', NOW() - INTERVAL 3 HOUR, NOW()),
(4, 'TKV-20261010-004', 'VN882019484', 19, 'thuha', '2233', 'Số 120 Đường 30/4, Ninh Kiều, Cần Thơ', 'CREATED', 'PAID', 'CARD', 5690000.00, '2026-10-10', NOW() - INTERVAL 4 HOUR, NOW()),

-- Ngày 2 (2026-10-09) - Đang xử lý & Đã xác nhận
(5, 'TKV-20261009-001', 'VN882019485', 16, 'hoangnam', '5678', 'Số 88 Phố Huế, Hoàn Kiếm, Hà Nội', 'CONFIRMED', 'PAID', 'BANK_TRANSFER', 48990000.00, '2026-10-09', NOW() - INTERVAL 1 DAY, NOW()),
(6, 'TKV-20261009-002', 'VN882019486', 17, 'minhanh', '4321', 'Thảo Điền Pearl, TP. Thủ Đức, TP.HCM', 'PROCESSING', 'PAID', 'BANK_TRANSFER', 9490000.00, '2026-10-09', NOW() - INTERVAL 28 HOUR, NOW()),

-- Ngày 3 (2026-10-08) - Đang giao hàng
(7, 'TKV-20261008-001', 'VN882019487', 18, 'quocbao', '3456', 'Số 45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', 'SHIPPED', 'PAID', 'BANK_TRANSFER', 14490000.00, '2026-10-08', NOW() - INTERVAL 2 DAY, NOW()),
(8, 'TKV-20261008-002', 'VN882019488', 19, 'thuha', '2233', 'Số 120 Đường 30/4, Ninh Kiều, Cần Thơ', 'SHIPPED', 'PENDING', 'COD', 4850000.00, '2026-10-08', NOW() - INTERVAL 50 HOUR, NOW()),

-- Ngày 4 (2026-10-07) - Giao thành công (DELIVERED) -> Ghi nhận Doanh Thu
(9, 'TKV-20261007-001', 'VN882019489', 16, 'hoangnam', '5678', 'Số 88 Phố Huế, Hoàn Kiếm, Hà Nội', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 31490000.00, '2026-10-07', NOW() - INTERVAL 3 DAY, NOW()),
(10, 'TKV-20261007-002', 'VN882019490', 17, 'minhanh', '4321', 'Thảo Điền Pearl, TP. Thủ Đức, TP.HCM', 'DELIVERED', 'PAID', 'CARD', 42500000.00, '2026-10-07', NOW() - INTERVAL 74 HOUR, NOW()),

-- Ngày 5 (2026-10-06) - Giao thành công
(11, 'TKV-20261006-001', 'VN882019491', 18, 'quocbao', '3456', 'Số 45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 54990000.00, '2026-10-06', NOW() - INTERVAL 4 DAY, NOW()),

-- Ngày 6 (2026-10-05) - Giao thành công
(12, 'TKV-20261005-001', 'VN882019492', 19, 'thuha', '2233', 'Số 120 Đường 30/4, Ninh Kiều, Cần Thơ', 'DELIVERED', 'PAID', 'COD', 21490000.00, '2026-10-05', NOW() - INTERVAL 5 DAY, NOW()),
(13, 'TKV-20261005-002', 'VN882019493', 17, 'minhanh', '4321', 'Thảo Điền Pearl, TP. Thủ Đức, TP.HCM', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 7990000.00, '2026-10-05', NOW() - INTERVAL 122 HOUR, NOW()),

-- Ngày 7 (2026-10-04) - Giao thành công
(14, 'TKV-20261004-001', 'VN882019494', 16, 'hoangnam', '5678', 'Số 88 Phố Huế, Hoàn Kiếm, Hà Nội', 'DELIVERED', 'PAID', 'BANK_TRANSFER', 34990000.00, '2026-10-04', NOW() - INTERVAL 6 DAY, NOW());

-- Chi tiết mặt hàng trong đơn hàng (items)
INSERT INTO `items` (`id`, `product_id`, `variant_id`, `product_name_snapshot`, `product_sku_snapshot`, `variant_label`, `variant_name`, `product_image_snapshot`, `quantity`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'iPhone 16 Pro Max 256GB', 'SP-IP16PM-256', 'Titan Tự Nhiên / 256GB', 'Titan Tự Nhiên - 256GB', '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 1, 34990000.00, NOW(), NOW()),
(2, 6, 10, 'Tai nghe Chống ồn Sony WH-1000XM5', 'SP-SONY-XM5', 'Đen Nhám (Black)', 'Đen Nhám (Black)', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', 1, 7990000.00, NOW(), NOW()),
(3, 11, 18, 'Chuột không dây Logitech MX Master 3S', 'SP-LOGI-MX3S', 'Graphite Đen Xám', 'Graphite Đen Xám', '/api/catalog/admin/products/images/file/1cb555997bf54d1ba04ec465ddae98dc.jpg', 1, 2390000.00, NOW(), NOW()),
(4, 8, 14, 'Tai nghe Apple AirPods Pro 2 USB-C', 'SP-AIRPODS-P2', 'Trắng (White)', 'Trắng (White)', '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', 1, 5690000.00, NOW(), NOW()),
(5, 3, 6, 'MacBook Pro 14 M3 Pro (18GB/512GB)', 'SP-MBP14-M3P', 'Space Black - 18GB/512GB', 'Space Black', '/api/catalog/admin/products/images/file/74e1703c16594800ba798cd85382817c.webp', 1, 48990000.00, NOW(), NOW()),
(6, 7, 12, 'Loa Bluetooth Marshall Stanmore III', 'SP-MARSHALL-ST3', 'Đen Cổ Điển (Black)', 'Đen Cổ Điển', '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', 1, 9490000.00, NOW(), NOW()),
(7, 9, 15, 'Máy chơi game Sony PlayStation 5 Slim', 'SP-PS5-SLIM', 'Trắng Tiêu Chuẩn', 'Trắng Tiêu Chuẩn', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 1, 14490000.00, NOW(), NOW()),
(8, 10, 16, 'Bàn phím cơ Keychron Q1 Pro Wireless', 'SP-KEYCHRON-Q1', 'Carbon Black - Red Switch', 'Red Switch', '/api/catalog/admin/products/images/file/10c0dc19baa94ae4a57d274f169ab230.jpg', 1, 4850000.00, NOW(), NOW()),
(9, 2, 4, 'Samsung Galaxy S24 Ultra 5G', 'SP-S24U-512', 'Titan Xám - 256GB', 'Titan Xám', '/api/catalog/admin/products/images/file/b42f9c12c22841e6810dda0305a2d351.jpg', 1, 31490000.00, NOW(), NOW()),
(10, 5, 9, 'Laptop Dell XPS 15 9530 OLED', 'SP-DELL-XPS15', 'Platinum Silver - 32GB/1TB', 'Platinum Silver', '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 1, 42500000.00, NOW(), NOW()),
(11, 4, 8, 'Laptop Gaming Asus ROG Zephyrus G16', 'SP-ROG-G16', 'Eclipse Gray - RTX 4070', 'Eclipse Gray', '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 1, 54990000.00, NOW(), NOW()),
(12, 12, 20, 'Đồng hồ thông minh Apple Watch Ultra 2', 'SP-AW-ULTRA2', 'Titan Tự Nhiên - Dây Vải Cam', 'Titan Tự Nhiên', '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 1, 21490000.00, NOW(), NOW()),
(13, 6, 11, 'Tai nghe Chống ồn Sony WH-1000XM5', 'SP-SONY-XM5', 'Bạc Ánh Kim (Silver)', 'Bạc Ánh Kim', '/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp', 1, 7990000.00, NOW(), NOW()),
(14, 1, 2, 'iPhone 16 Pro Max 256GB', 'SP-IP16PM-256', 'Titan Đen - 256GB', 'Titan Đen', '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', 1, 34990000.00, NOW(), NOW());

-- Khớp nối bảng order_items
INSERT INTO `order_items` (`order_id`, `item_id`) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12), (13, 13), (14, 14);


-- ============================================================================
-- 5. DATABASE: sale
-- ============================================================================
USE `sale`;

TRUNCATE TABLE `promo_banners`;
TRUNCATE TABLE `voucher_usages`;
TRUNCATE TABLE `vouchers`;
TRUNCATE TABLE `sale_program_items`;
TRUNCATE TABLE `sale_programs`;

-- 5.1 Mã giảm giá (Vouchers)
INSERT INTO `vouchers` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order_amount`, `max_discount_amount`, `max_usage`, `max_usage_per_user`, `usage_count`, `active`, `starts_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'TKVNEW', 'Mã ưu đãi 100.000₫ cho khách hàng mới gia nhập The Kinetic Vault', 'FIXED', 100000.0000, 500000.00, 100000.00, 500, 1, 42, b'1', NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 60 DAY, NOW(), NOW()),
(2, 'VIPTECH10', 'Giảm 10% tối đa 1.000.000₫ cho khách hàng sở hữu thẻ VIP Gold/Platinum', 'PERCENTAGE', 10.0000, 3000000.00, 1000000.00, 200, 2, 68, b'1', NOW() - INTERVAL 15 DAY, NOW() + INTERVAL 45 DAY, NOW(), NOW()),
(3, 'FREESHIP', 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 2.000.000₫', 'FIXED', 50000.0000, 2000000.00, 50000.00, 1000, 5, 185, b'1', NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 90 DAY, NOW(), NOW()),
(4, 'FLAGSHIP2026', 'Mã độc quyền sự kiện công nghệ giảm 500.000₫ khi mua iPhone / Mac / Galaxy S', 'FIXED', 500000.0000, 20000000.00, 500000.00, 100, 1, 23, b'1', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, NOW(), NOW());

-- 5.2 Chương trình khuyến mãi (Sale Programs)
INSERT INTO `sale_programs` (`id`, `name`, `description`, `discount_type`, `discount_value`, `start_at`, `end_at`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Tuần Lễ Công Nghệ Flagship TKV 2026', 'Ưu đãi sốc lên đến 15% cho dòng điện thoại cao cấp và phụ kiện công thái học.', 'PERCENTAGE', 10.0000, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 15 DAY, b'1', NOW(), NOW());

INSERT INTO `sale_program_items` (`id`, `sale_program_id`, `product_id`, `variant_id`, `promo_qty_limit`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 4, 30, NOW(), NOW()),
(2, 1, 6, 10, 50, NOW(), NOW()),
(3, 1, 11, 18, 50, NOW(), NOW());

-- 5.3 Banner Quảng cáo
INSERT INTO `promo_banners` (`id`, `title`, `image_url`, `link_url`, `position`, `active`, `start_at`, `end_at`, `created_at`, `updated_at`) VALUES
(1, 'iPhone 16 Pro Max - Sẵn Hàng Giao Ngay', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80', '/products/1', 1, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(2, 'Galaxy S24 Ultra - Quyền Năng Galaxy AI', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=1200&q=80', '/products/2', 2, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW()),
(3, 'MacBook Pro M3 Pro - Trạm Sáng Tạo Di Động', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80', '/products/3', 3, b'1', NOW() - INTERVAL 10 DAY, NOW() + INTERVAL 30 DAY, NOW(), NOW());


-- ============================================================================
-- 6. DATABASE: review_db
-- ============================================================================
USE `review_db`;

TRUNCATE TABLE `review_edit_histories`;
TRUNCATE TABLE `review_media`;
TRUNCATE TABLE `review_responses`;
TRUNCATE TABLE `reviews`;

INSERT INTO `reviews` (`id`, `order_id`, `product_id`, `variant_id`, `user_id`, `user_name`, `variant_label`, `rating`, `content`, `status`, `created_at`, `updated_at`) VALUES
(1, 14, 1, 2, 16, 'Nguyễn Hoàng Nam', 'Titan Đen - 256GB', 5, 'Máy nguyên seal chính hãng VN/A, kích hoạt chuẩn bảo hành Apple. Shop đóng gói cực kỳ cẩn thận 3 lớp bọc khí, giao hỏa tốc trong 2 giờ tại Hà Nội rất ưng ý!', 'APPROVED', NOW() - INTERVAL 5 DAY, NOW()),
(2, 10, 5, 9, 17, 'Trần Minh Anh', 'Platinum Silver - 32GB/1TB', 5, 'Màn hình OLED 3.5K của Dell XPS 15 đẹp ngỡ ngàng, làm đồ họa và dựng video màu sắc chuẩn chỉ từng chi tiết. Nhân viên tư vấn cấu hình nhiệt tình!', 'APPROVED', NOW() - INTERVAL 3 DAY, NOW()),
(3, 9, 2, 4, 16, 'Nguyễn Hoàng Nam', 'Titan Xám - 256GB', 5, 'Tính năng Galaxy AI dịch trực tiếp và khoanh vùng tìm kiếm quá thông minh, camera zoom 5x chụp sân khấu nét căng. Đáng từng đồng bát gạo!', 'APPROVED', NOW() - INTERVAL 2 DAY, NOW()),
(4, 11, 4, 8, 18, 'Lê Quốc Bảo', 'Eclipse Gray - RTX 4070', 5, 'Zephyrus G16 mỏng nhẹ mà tản nhiệt cực êm, quạt chạy êm ru khi chơi Cyberpunk 2077 ray tracing mượt mà. Đạt chuẩn laptop gaming hoàn hảo nhất 2026.', 'APPROVED', NOW() - INTERVAL 3 DAY, NOW()),
(5, 13, 6, 11, 17, 'Trần Minh Anh', 'Bạc Ánh Kim (Silver)', 5, 'Chống ồn của Sony XM5 đỉnh thật sự, đeo đi máy bay hoặc ngồi quán cafe ồn ào bật nhạc là như lạc vào không gian riêng. Đệm tai siêu êm không bị đau tai.', 'APPROVED', NOW() - INTERVAL 4 DAY, NOW()),
(6, 12, 12, 20, 19, 'Phạm Thu Hà', 'Titan Tự Nhiên - Dây Vải Cam', 5, 'Apple Watch Ultra 2 pin trâu dùng 3 ngày thoải mái, mặt kính sapphire chống trầy hoàn hảo, đeo đi chạy trail leo núi GPS bắt cực kỳ chính xác!', 'APPROVED', NOW() - INTERVAL 4 DAY, NOW());


-- ============================================================================
-- 7. DATABASE: payments
-- ============================================================================
USE `payments`;

TRUNCATE TABLE `payments`;

INSERT INTO `payments` (`id`, `order_id`, `amount`, `currency`, `method`, `status`, `transaction_ref`, `created_at`, `updated_at`) VALUES
(1, 2, 7990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261010002MB', NOW() - INTERVAL 2 HOUR, NOW()),
(2, 4, 5690000.0000, 'VND', 'CARD', 'PAID', 'TXN20261010004VISA', NOW() - INTERVAL 4 HOUR, NOW()),
(3, 5, 48990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261009001MB', NOW() - INTERVAL 1 DAY, NOW()),
(4, 6, 9490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261009002VCB', NOW() - INTERVAL 28 HOUR, NOW()),
(5, 7, 14490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261008001TCB', NOW() - INTERVAL 2 DAY, NOW()),
(6, 9, 31490000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261007001MB', NOW() - INTERVAL 3 DAY, NOW()),
(7, 10, 42500000.0000, 'VND', 'CARD', 'PAID', 'TXN20261007002MASTER', NOW() - INTERVAL 74 HOUR, NOW()),
(8, 11, 54990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261006001VCB', NOW() - INTERVAL 4 DAY, NOW()),
(9, 12, 21490000.0000, 'VND', 'COD', 'PAID', 'COD20261005001', NOW() - INTERVAL 5 DAY, NOW()),
(10, 13, 7990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261005002MB', NOW() - INTERVAL 122 HOUR, NOW()),
(11, 14, 34990000.0000, 'VND', 'BANK_TRANSFER', 'PAID', 'TXN20261004001TCB', NOW() - INTERVAL 6 DAY, NOW());


-- ============================================================================
-- 8. DATABASE: activity_log
-- ============================================================================
USE `activity_log`;

TRUNCATE TABLE `web_activities`;

INSERT INTO `web_activities` (`id`, `action`, `actor_username`, `actor_user_id`, `resource_type`, `resource_id`, `request_path`, `http_method`, `ip_address`, `created_at`, `updated_at`) VALUES
(1, 'SYSTEM_INIT', 'admin', '15', 'System', 'ROOT', '/admin/system', 'POST', '127.0.0.1', NOW() - INTERVAL 6 DAY, NOW()),
(2, 'PRODUCT_IMPORT', 'admin', '15', 'Product', '1', '/admin/products', 'POST', '127.0.0.1', NOW() - INTERVAL 5 DAY, NOW()),
(3, 'INVENTORY_SYNC', 'admin', '15', 'Inventory', 'ALL', '/admin/inventory/sync', 'POST', '127.0.0.1', NOW() - INTERVAL 5 DAY, NOW()),
(4, 'ORDER_CONFIRM', 'admin', '15', 'Order', '14', '/admin/orders/14/confirm', 'POST', '127.0.0.1', NOW() - INTERVAL 4 DAY, NOW()),
(5, 'ORDER_DISPATCH', 'admin', '15', 'Order', '14', '/admin/orders/14/ship', 'POST', '127.0.0.1', NOW() - INTERVAL 3 DAY, NOW()),
(6, 'VOUCHER_CREATE', 'admin', '15', 'Voucher', 'FLAGSHIP2026', '/admin/sales/vouchers', 'POST', '127.0.0.1', NOW() - INTERVAL 2 DAY, NOW()),
(7, 'DASHBOARD_INSPECT', 'admin', '15', 'Dashboard', 'OVERVIEW', '/admin/dashboard', 'GET', '127.0.0.1', NOW() - INTERVAL 1 HOUR, NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- HOÀN TẤT NẠP DỮ LIỆU CHUẨN THỰC TẾ CHO THE KINETIC VAULT!
-- ============================================================================
