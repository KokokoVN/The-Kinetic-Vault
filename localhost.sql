-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost:3306
-- Thời gian đã tạo: Th7 07, 2026 lúc 01:40 AM
-- Phiên bản máy phục vụ: 8.0.30
-- Phiên bản PHP: 8.4.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `activity_log`
--
CREATE DATABASE IF NOT EXISTS `activity_log` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `activity_log`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `web_activities`
--

CREATE TABLE `web_activities` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `action` varchar(128) DEFAULT NULL,
  `actor_user_id` varchar(64) DEFAULT NULL,
  `actor_username` varchar(128) DEFAULT NULL,
  `detail_json` varchar(4000) DEFAULT NULL,
  `http_method` varchar(16) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `request_path` varchar(512) DEFAULT NULL,
  `resource_id` varchar(64) DEFAULT NULL,
  `resource_type` varchar(64) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `web_activities`
--

INSERT INTO `web_activities` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `action`, `actor_user_id`, `actor_username`, `detail_json`, `http_method`, `ip_address`, `request_path`, `resource_id`, `resource_type`, `user_agent`) VALUES
(1, '2026-07-02 15:59:06.200718', 'admin', NULL, NULL, '2026-07-02 15:59:06.200718', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands', NULL, 'Gateway', 'node'),
(2, '2026-07-02 15:59:37.199140', 'admin', NULL, NULL, '2026-07-02 15:59:37.199140', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories', NULL, 'Category', 'node'),
(3, '2026-07-02 15:59:38.564038', 'admin', NULL, NULL, '2026-07-02 15:59:38.564038', 'admin', 'CATEGORY_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":6,\"after\":{\"categoryId\":6,\"name\":\"Gmail domain cho thuê\",\"slug\":\"d\",\"hidden\":false},\"newData\":{\"categoryId\":6,\"name\":\"Gmail domain cho thuê\",\"slug\":\"d\",\"hidden\":false},\"at\":\"2026-07-02T08:59:37.328437700Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/admin/categories', '6', 'Category', NULL),
(4, '2026-07-02 15:59:43.568017', 'system', NULL, NULL, '2026-07-02 15:59:43.568017', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":1,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Tạo danh mục\"},\"at\":\"2026-07-02T08:59:41.546789600Z\"}', 'POST', NULL, '/send', '1', 'NotificationMessage', NULL),
(5, '2026-07-02 15:59:48.819898', 'admin', NULL, NULL, '2026-07-02 15:59:48.819898', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories/6', '6', 'Category', 'node'),
(6, '2026-07-02 15:59:48.992139', 'admin', NULL, NULL, '2026-07-02 15:59:48.992139', 'admin', 'CATEGORY_DELETE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":6,\"before\":{\"categoryId\":6,\"name\":\"Gmail domain cho thuê\",\"slug\":\"d\"},\"categoryName\":\"Gmail domain cho thuê\",\"slug\":\"d\",\"productCountAtDelete\":0,\"confirmDeleteWithProducts\":false,\"deletedAt\":\"2026-07-02T08:59:48.954594200Z\",\"deletedByUsername\":\"admin\",\"deletedByUserId\":\"15\",\"softDelete\":true,\"restorableCategoryId\":6}', 'DELETE', NULL, '/admin/categories/6', '6', 'Category', NULL),
(7, '2026-07-02 15:59:49.444126', 'system', NULL, NULL, '2026-07-02 15:59:49.444126', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":2,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Xóa danh mục\"},\"at\":\"2026-07-02T08:59:49.424180200Z\"}', 'POST', NULL, '/send', '2', 'NotificationMessage', NULL),
(8, '2026-07-02 16:05:58.464681', NULL, NULL, NULL, '2026-07-02 16:05:58.464681', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(9, '2026-07-02 16:07:33.269930', NULL, NULL, NULL, '2026-07-02 16:07:33.272377', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(10, '2026-07-02 16:07:42.440669', NULL, NULL, NULL, '2026-07-02 16:07:42.440669', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(11, '2026-07-02 16:10:08.655538', NULL, NULL, NULL, '2026-07-02 16:10:08.655538', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(12, '2026-07-02 16:11:17.875313', 'admin', NULL, NULL, '2026-07-02 16:11:17.876312', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/confirm', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(13, '2026-07-02 16:11:33.055599', 'admin', NULL, NULL, '2026-07-02 16:11:33.055599', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/confirm', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(14, '2026-07-02 16:12:40.967205', NULL, NULL, NULL, '2026-07-02 16:12:40.967205', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(15, '2026-07-02 16:14:23.701937', NULL, NULL, NULL, '2026-07-02 16:14:23.706302', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(16, '2026-07-02 16:14:52.470401', NULL, NULL, NULL, '2026-07-02 16:14:52.473368', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/preview', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(17, '2026-07-02 16:14:56.907232', 'admin', NULL, NULL, '2026-07-02 16:14:56.907232', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/confirm', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(18, '2026-07-02 16:17:30.427526', 'admin', NULL, NULL, '2026-07-02 16:17:30.435521', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(19, '2026-07-02 16:17:37.880690', 'admin', NULL, NULL, '2026-07-02 16:17:37.880690', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":3}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(20, '2026-07-02 16:17:51.702273', 'admin', NULL, NULL, '2026-07-02 16:17:51.704298', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(21, '2026-07-02 16:17:51.946703', 'admin', NULL, NULL, '2026-07-02 16:17:51.946703', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(22, '2026-07-02 16:17:52.193176', 'admin', NULL, NULL, '2026-07-02 16:17:52.193176', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/109', '10', 'Product', 'node'),
(23, '2026-07-02 16:17:52.794723', 'admin', NULL, NULL, '2026-07-02 16:17:52.794723', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":109,\"productId\":10,\"size\":\"Tiêu chuẩn\",\"color\":\"Trắng\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/109', '109', 'ProductVariant', NULL),
(24, '2026-07-02 16:18:01.610906', 'admin', NULL, NULL, '2026-07-02 16:18:01.610906', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(25, '2026-07-02 16:18:01.710717', 'admin', NULL, NULL, '2026-07-02 16:18:01.710717', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(26, '2026-07-02 16:18:01.875784', 'admin', NULL, NULL, '2026-07-02 16:18:01.875784', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/110', '10', 'Product', 'node'),
(27, '2026-07-02 16:18:01.962475', 'admin', NULL, NULL, '2026-07-02 16:18:01.962475', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":110,\"productId\":10,\"size\":\"Tiêu chuẩn\",\"color\":\"Đen\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/5aba4243868f4b21b5b823ae2c231b8c.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/110', '110', 'ProductVariant', NULL),
(28, '2026-07-02 16:18:36.808711', 'admin', NULL, NULL, '2026-07-02 16:18:36.808711', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(29, '2026-07-02 16:18:36.842122', 'admin', NULL, NULL, '2026-07-02 16:18:36.842122', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(30, '2026-07-02 16:18:36.890444', 'admin', NULL, NULL, '2026-07-02 16:18:36.890444', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/112', '10', 'Product', 'node'),
(31, '2026-07-02 16:18:36.915814', 'admin', NULL, NULL, '2026-07-02 16:18:36.915814', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":112,\"productId\":10,\"size\":\"Tiêu chuẩn\",\"color\":\"Đỏ\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/c3ddb8f79e3b4408937d71a7632a3dc1.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/112', '112', 'ProductVariant', NULL),
(32, '2026-07-02 16:18:44.278314', 'admin', NULL, NULL, '2026-07-02 16:18:44.278314', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(33, '2026-07-02 16:18:44.482408', 'admin', NULL, NULL, '2026-07-02 16:18:44.482408', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(34, '2026-07-02 16:18:44.843163', 'admin', NULL, NULL, '2026-07-02 16:18:44.844163', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/113', '10', 'Product', 'node'),
(35, '2026-07-02 16:18:45.028593', 'admin', NULL, NULL, '2026-07-02 16:18:45.028593', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":113,\"productId\":10,\"size\":\"Pro\",\"color\":\"Trắng\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/1830e7e1d8734a769b1289a5fd8c53fb.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/113', '113', 'ProductVariant', NULL),
(36, '2026-07-02 16:18:55.084238', 'admin', NULL, NULL, '2026-07-02 16:18:55.084238', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(37, '2026-07-02 16:18:55.175538', 'admin', NULL, NULL, '2026-07-02 16:18:55.175538', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(38, '2026-07-02 16:18:55.480603', 'admin', NULL, NULL, '2026-07-02 16:18:55.480603', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/114', '10', 'Product', 'node'),
(39, '2026-07-02 16:18:55.559525', 'admin', NULL, NULL, '2026-07-02 16:18:55.559525', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":114,\"productId\":10,\"size\":\"Pro\",\"color\":\"Đen\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/e6521e3e2ec04c219823300e0d906d45.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/114', '114', 'ProductVariant', NULL),
(40, '2026-07-02 16:19:14.324589', 'admin', NULL, NULL, '2026-07-02 16:19:14.336019', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(41, '2026-07-02 16:19:14.405289', 'admin', NULL, NULL, '2026-07-02 16:19:14.405289', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(42, '2026-07-02 16:19:15.229690', 'admin', NULL, NULL, '2026-07-02 16:19:15.229690', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/115', '10', 'Product', 'node'),
(43, '2026-07-02 16:19:15.337192', 'admin', NULL, NULL, '2026-07-02 16:19:15.337192', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":115,\"productId\":10,\"size\":\"Pro\",\"color\":\"Xanh\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/edd9ae8dc10f46fab53a94762d3c2fc4.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/115', '115', 'ProductVariant', NULL),
(44, '2026-07-02 16:19:30.556314', 'admin', NULL, NULL, '2026-07-02 16:19:30.556314', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(45, '2026-07-02 16:19:30.587349', 'admin', NULL, NULL, '2026-07-02 16:19:30.587349', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(46, '2026-07-02 16:19:30.637485', 'admin', NULL, NULL, '2026-07-02 16:19:30.637485', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/116', '10', 'Product', 'node'),
(47, '2026-07-02 16:19:30.659798', 'admin', NULL, NULL, '2026-07-02 16:19:30.659798', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":116,\"productId\":10,\"size\":\"Pro\",\"color\":\"Đỏ\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/143d4edd1d1c47c8bb60f0a23b2d750f.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/116', '116', 'ProductVariant', NULL),
(48, '2026-07-02 16:19:40.085964', 'admin', NULL, NULL, '2026-07-02 16:19:40.085964', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(49, '2026-07-02 16:19:40.155673', 'admin', NULL, NULL, '2026-07-02 16:19:40.155673', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(50, '2026-07-02 16:19:40.207854', 'admin', NULL, NULL, '2026-07-02 16:19:40.207854', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/117', '10', 'Product', 'node'),
(51, '2026-07-02 16:19:40.238307', 'admin', NULL, NULL, '2026-07-02 16:19:40.238307', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":117,\"productId\":10,\"size\":\"Ultra\",\"color\":\"Trắng\",\"price\":\"15000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/01d3ac175f5947bd94b8c94fe958e2ad.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/117', '117', 'ProductVariant', NULL),
(52, '2026-07-02 16:19:48.405402', 'admin', NULL, NULL, '2026-07-02 16:19:48.405402', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(53, '2026-07-02 16:19:48.521782', 'admin', NULL, NULL, '2026-07-02 16:19:48.521782', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(54, '2026-07-02 16:19:48.703351', 'admin', NULL, NULL, '2026-07-02 16:19:48.703351', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/118', '10', 'Product', 'node'),
(55, '2026-07-02 16:19:48.905260', 'admin', NULL, NULL, '2026-07-02 16:19:48.905260', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":118,\"productId\":10,\"size\":\"Ultra\",\"color\":\"Đen\",\"price\":\"15000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/10098d2812dd4aec8ff57a26938d6dfa.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/118', '118', 'ProductVariant', NULL),
(56, '2026-07-02 16:20:06.841931', 'admin', NULL, NULL, '2026-07-02 16:20:06.841931', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(57, '2026-07-02 16:20:06.899740', 'admin', NULL, NULL, '2026-07-02 16:20:06.899740', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(58, '2026-07-02 16:20:07.070488', 'admin', NULL, NULL, '2026-07-02 16:20:07.070488', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/119', '10', 'Product', 'node'),
(59, '2026-07-02 16:20:07.170900', 'admin', NULL, NULL, '2026-07-02 16:20:07.170900', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":119,\"productId\":10,\"size\":\"Ultra\",\"color\":\"Xanh\",\"price\":\"15000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/406317e0a9db4dfcbbe6a1063f0afd39.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/119', '119', 'ProductVariant', NULL),
(60, '2026-07-02 16:20:14.757608', 'admin', NULL, NULL, '2026-07-02 16:20:14.757608', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(61, '2026-07-02 16:20:14.855657', 'admin', NULL, NULL, '2026-07-02 16:20:14.855657', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(62, '2026-07-02 16:20:15.039281', 'admin', NULL, NULL, '2026-07-02 16:20:15.039281', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/variants/120', '10', 'Product', 'node'),
(63, '2026-07-02 16:20:15.205588', 'admin', NULL, NULL, '2026-07-02 16:20:15.206124', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":120,\"productId\":10,\"size\":\"Ultra\",\"color\":\"Đỏ\",\"price\":\"15000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/ba423091409543f4ba060be275e0b9b3.webp\"}}', 'PUT', NULL, '/admin/products/10/variants/120', '120', 'ProductVariant', NULL),
(64, '2026-07-02 16:21:26.459436', 'admin', NULL, NULL, '2026-07-02 16:21:26.465796', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(65, '2026-07-02 16:21:26.459436', 'admin', NULL, NULL, '2026-07-02 16:21:26.465796', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(66, '2026-07-02 16:22:33.326734', 'admin', NULL, NULL, '2026-07-02 16:22:33.327770', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(67, '2026-07-02 16:22:33.472190', 'admin', NULL, NULL, '2026-07-02 16:22:33.472190', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(68, '2026-07-02 16:22:33.695785', 'admin', NULL, NULL, '2026-07-02 16:22:33.695785', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/99', '9', 'Product', 'node'),
(69, '2026-07-02 16:22:34.178109', 'admin', NULL, NULL, '2026-07-02 16:22:34.179102', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":99,\"productId\":9,\"size\":\"Tiêu chuẩn\",\"color\":\"Xanh\",\"price\":\"40000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/6ff28db975a2416184317e9563a9e58c.jpg\"}}', 'PUT', NULL, '/admin/products/9/variants/99', '99', 'ProductVariant', NULL),
(70, '2026-07-02 16:22:41.333687', 'admin', NULL, NULL, '2026-07-02 16:22:41.333687', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(71, '2026-07-02 16:22:41.445212', 'admin', NULL, NULL, '2026-07-02 16:22:41.445212', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(72, '2026-07-02 16:22:41.717777', 'admin', NULL, NULL, '2026-07-02 16:22:41.717777', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/100', '9', 'Product', 'node'),
(73, '2026-07-02 16:22:41.828402', 'admin', NULL, NULL, '2026-07-02 16:22:41.828402', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":100,\"productId\":9,\"size\":\"Tiêu chuẩn\",\"color\":\"Đỏ\",\"price\":\"40000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/a95b036e60ff47af9172a7680d951197.jpg\"}}', 'PUT', NULL, '/admin/products/9/variants/100', '100', 'ProductVariant', NULL),
(74, '2026-07-02 16:22:49.396582', 'admin', NULL, NULL, '2026-07-02 16:22:49.396582', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(75, '2026-07-02 16:22:49.746750', 'admin', NULL, NULL, '2026-07-02 16:22:49.746750', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(76, '2026-07-02 16:22:50.135595', 'admin', NULL, NULL, '2026-07-02 16:22:50.135595', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/101', '9', 'Product', 'node'),
(77, '2026-07-02 16:22:50.615275', 'admin', NULL, NULL, '2026-07-02 16:22:50.615275', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":101,\"productId\":9,\"size\":\"Pro\",\"color\":\"Trắng\",\"price\":\"43000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/d35c6ebe98cd4787bfcfd6bcadaa50fc.jpg\"}}', 'PUT', NULL, '/admin/products/9/variants/101', '101', 'ProductVariant', NULL),
(78, '2026-07-02 16:23:07.173684', 'admin', NULL, NULL, '2026-07-02 16:23:07.183857', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(79, '2026-07-02 16:23:07.173684', 'admin', NULL, NULL, '2026-07-02 16:23:07.183857', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(80, '2026-07-02 16:23:08.076461', 'admin', NULL, NULL, '2026-07-02 16:23:08.076461', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/102', '9', 'Product', 'node'),
(81, '2026-07-02 16:23:08.459526', 'admin', NULL, NULL, '2026-07-02 16:23:08.459526', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":102,\"productId\":9,\"size\":\"Pro\",\"color\":\"Đen\",\"price\":\"43000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/6600d4c4a96f4cf9baf3e5324050f979.jpg\"}}', 'PUT', NULL, '/admin/products/9/variants/102', '102', 'ProductVariant', NULL),
(82, '2026-07-02 16:23:18.430974', 'admin', NULL, NULL, '2026-07-02 16:23:18.430974', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(83, '2026-07-02 16:23:18.514067', 'admin', NULL, NULL, '2026-07-02 16:23:18.514067', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(84, '2026-07-02 16:23:18.785499', 'admin', NULL, NULL, '2026-07-02 16:23:18.785499', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/103', '9', 'Product', 'node'),
(85, '2026-07-02 16:23:19.009565', 'admin', NULL, NULL, '2026-07-02 16:23:19.009565', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":103,\"productId\":9,\"size\":\"Pro\",\"color\":\"Xanh\",\"price\":\"43000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/b4e0c1d9b7dc4634aa9f2517c6c14c48.webp\"}}', 'PUT', NULL, '/admin/products/9/variants/103', '103', 'ProductVariant', NULL),
(86, '2026-07-02 16:23:26.823037', 'admin', NULL, NULL, '2026-07-02 16:23:26.823037', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(87, '2026-07-02 16:23:26.906473', 'admin', NULL, NULL, '2026-07-02 16:23:26.906473', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(88, '2026-07-02 16:23:27.060106', 'admin', NULL, NULL, '2026-07-02 16:23:27.060106', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/104', '9', 'Product', 'node'),
(89, '2026-07-02 16:23:27.160679', 'admin', NULL, NULL, '2026-07-02 16:23:27.160679', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":104,\"productId\":9,\"size\":\"Pro\",\"color\":\"Đỏ\",\"price\":\"43000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/820ec25ee85e402daa84c419c0382a9e.jpg\"}}', 'PUT', NULL, '/admin/products/9/variants/104', '104', 'ProductVariant', NULL),
(90, '2026-07-02 16:23:35.763021', 'admin', NULL, NULL, '2026-07-02 16:23:35.763021', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/images/upload', '9', 'Product', 'node'),
(91, '2026-07-02 16:23:35.846019', 'admin', NULL, NULL, '2026-07-02 16:23:35.846019', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":9,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/9/images/upload', '9', 'ProductImage', NULL),
(92, '2026-07-02 16:23:35.961391', 'admin', NULL, NULL, '2026-07-02 16:23:35.966396', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/9/variants/105', '9', 'Product', 'node'),
(93, '2026-07-02 16:23:36.063984', 'admin', NULL, NULL, '2026-07-02 16:23:36.063984', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":105,\"productId\":9,\"size\":\"Ultra\",\"color\":\"Trắng\",\"price\":\"46000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg\"}}', 'PUT', NULL, '/admin/products/9/variants/105', '105', 'ProductVariant', NULL),
(94, '2026-07-02 16:24:27.616399', 'admin', NULL, NULL, '2026-07-02 16:24:27.616399', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(95, '2026-07-02 16:24:27.703485', 'admin', NULL, NULL, '2026-07-02 16:24:27.703485', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(96, '2026-07-02 16:24:38.185917', 'admin', NULL, NULL, '2026-07-02 16:24:38.185917', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(97, '2026-07-02 16:24:38.319680', 'admin', NULL, NULL, '2026-07-02 16:24:38.319680', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(98, '2026-07-02 16:24:38.634688', 'admin', NULL, NULL, '2026-07-02 16:24:38.634688', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/73', '7', 'Product', 'node'),
(99, '2026-07-02 16:24:38.919997', 'admin', NULL, NULL, '2026-07-02 16:24:38.919997', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":73,\"productId\":7,\"size\":\"Tiêu chuẩn\",\"color\":\"Trắng\",\"price\":\"6000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/73', '73', 'ProductVariant', NULL),
(100, '2026-07-02 16:24:47.433691', 'admin', NULL, NULL, '2026-07-02 16:24:47.433691', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(101, '2026-07-02 16:24:47.503056', 'admin', NULL, NULL, '2026-07-02 16:24:47.503056', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(102, '2026-07-02 16:24:47.610125', 'admin', NULL, NULL, '2026-07-02 16:24:47.610125', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/74', '7', 'Product', 'node'),
(103, '2026-07-02 16:24:47.722163', 'admin', NULL, NULL, '2026-07-02 16:24:47.722163', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":74,\"productId\":7,\"size\":\"Tiêu chuẩn\",\"color\":\"Đen\",\"price\":\"6000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/c56111c0da7049f8b90aa7d924e70ce3.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/74', '74', 'ProductVariant', NULL),
(104, '2026-07-02 16:24:53.940836', 'admin', NULL, NULL, '2026-07-02 16:24:53.940836', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(105, '2026-07-02 16:24:54.001682', 'admin', NULL, NULL, '2026-07-02 16:24:54.001682', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(106, '2026-07-02 16:24:54.148615', 'admin', NULL, NULL, '2026-07-02 16:24:54.148615', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/75', '7', 'Product', 'node'),
(107, '2026-07-02 16:24:54.235701', 'admin', NULL, NULL, '2026-07-02 16:24:54.235701', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":75,\"productId\":7,\"size\":\"Tiêu chuẩn\",\"color\":\"Xanh\",\"price\":\"6000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/be3ae947845248e489cccb6785825104.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/75', '75', 'ProductVariant', NULL),
(108, '2026-07-02 16:25:00.370912', 'admin', NULL, NULL, '2026-07-02 16:25:00.370912', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(109, '2026-07-02 16:25:00.412583', 'admin', NULL, NULL, '2026-07-02 16:25:00.412583', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(110, '2026-07-02 16:25:00.462960', 'admin', NULL, NULL, '2026-07-02 16:25:00.462960', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/76', '7', 'Product', 'node'),
(111, '2026-07-02 16:25:00.484870', 'admin', NULL, NULL, '2026-07-02 16:25:00.484870', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":76,\"productId\":7,\"size\":\"Tiêu chuẩn\",\"color\":\"Đỏ\",\"price\":\"6000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/e8b818df5dff416dbd8c0b8f1ab5263d.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/76', '76', 'ProductVariant', NULL),
(112, '2026-07-02 16:25:06.188802', 'admin', NULL, NULL, '2026-07-02 16:25:06.188802', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(113, '2026-07-02 16:25:06.272196', 'admin', NULL, NULL, '2026-07-02 16:25:06.272196', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(114, '2026-07-02 16:25:06.588916', 'admin', NULL, NULL, '2026-07-02 16:25:06.588916', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/77', '7', 'Product', 'node'),
(115, '2026-07-02 16:25:06.692932', 'admin', NULL, NULL, '2026-07-02 16:25:06.692932', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":77,\"productId\":7,\"size\":\"Pro\",\"color\":\"Trắng\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/43e6af48caeb4d53805964214263b788.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/77', '77', 'ProductVariant', NULL),
(116, '2026-07-02 16:25:14.001488', 'admin', NULL, NULL, '2026-07-02 16:25:14.001488', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(117, '2026-07-02 16:25:14.081775', 'admin', NULL, NULL, '2026-07-02 16:25:14.081775', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(118, '2026-07-02 16:25:14.142289', 'admin', NULL, NULL, '2026-07-02 16:25:14.142289', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/78', '7', 'Product', 'node'),
(119, '2026-07-02 16:25:14.154857', 'admin', NULL, NULL, '2026-07-02 16:25:14.154857', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":78,\"productId\":7,\"size\":\"Pro\",\"color\":\"Đen\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/8dd4474227c5416991e6bd1c03de3089.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/78', '78', 'ProductVariant', NULL),
(120, '2026-07-02 16:25:19.843550', 'admin', NULL, NULL, '2026-07-02 16:25:19.843550', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(121, '2026-07-02 16:25:19.897931', 'admin', NULL, NULL, '2026-07-02 16:25:19.897931', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(122, '2026-07-02 16:25:19.956649', 'admin', NULL, NULL, '2026-07-02 16:25:19.956649', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/79', '7', 'Product', 'node'),
(123, '2026-07-02 16:25:20.028802', 'admin', NULL, NULL, '2026-07-02 16:25:20.028802', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":79,\"productId\":7,\"size\":\"Pro\",\"color\":\"Xanh\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/3c7eeef0f3fc4b1ba235e231ac98d278.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/79', '79', 'ProductVariant', NULL),
(124, '2026-07-02 16:25:28.035579', 'admin', NULL, NULL, '2026-07-02 16:25:28.035579', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(125, '2026-07-02 16:25:28.130532', 'admin', NULL, NULL, '2026-07-02 16:25:28.130532', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(126, '2026-07-02 16:25:28.603347', 'admin', NULL, NULL, '2026-07-02 16:25:28.603347', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/80', '7', 'Product', 'node'),
(127, '2026-07-02 16:25:28.752139', 'admin', NULL, NULL, '2026-07-02 16:25:28.755888', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":80,\"productId\":7,\"size\":\"Pro\",\"color\":\"Đỏ\",\"price\":\"9000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/a23ded0d81e348f0a654bbf6f8ef8b3e.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/80', '80', 'ProductVariant', NULL),
(128, '2026-07-02 16:25:35.575920', 'admin', NULL, NULL, '2026-07-02 16:25:35.577996', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(129, '2026-07-02 16:25:35.667334', 'admin', NULL, NULL, '2026-07-02 16:25:35.667334', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(130, '2026-07-02 16:25:35.864535', 'admin', NULL, NULL, '2026-07-02 16:25:35.864535', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/81', '7', 'Product', 'node'),
(131, '2026-07-02 16:25:35.929058', 'admin', NULL, NULL, '2026-07-02 16:25:35.929058', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":81,\"productId\":7,\"size\":\"Ultra\",\"color\":\"Trắng\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/bf359efd8f3a44dcbcd4101bd225812c.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/81', '81', 'ProductVariant', NULL),
(132, '2026-07-02 16:25:43.376719', 'admin', NULL, NULL, '2026-07-02 16:25:43.376719', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(133, '2026-07-02 16:25:43.425027', 'admin', NULL, NULL, '2026-07-02 16:25:43.425027', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(134, '2026-07-02 16:25:43.459930', 'admin', NULL, NULL, '2026-07-02 16:25:43.459930', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/82', '7', 'Product', 'node'),
(135, '2026-07-02 16:25:43.479851', 'admin', NULL, NULL, '2026-07-02 16:25:43.479851', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":82,\"productId\":7,\"size\":\"Ultra\",\"color\":\"Đen\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/8788a65897694ba8b1d81956434527cf.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/82', '82', 'ProductVariant', NULL),
(136, '2026-07-02 16:25:49.267432', 'admin', NULL, NULL, '2026-07-02 16:25:49.267432', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(137, '2026-07-02 16:25:49.359047', 'admin', NULL, NULL, '2026-07-02 16:25:49.359047', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(138, '2026-07-02 16:25:49.617687', 'admin', NULL, NULL, '2026-07-02 16:25:49.617687', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/83', '7', 'Product', 'node'),
(139, '2026-07-02 16:25:49.652839', 'admin', NULL, NULL, '2026-07-02 16:25:49.652839', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":83,\"productId\":7,\"size\":\"Ultra\",\"color\":\"Xanh\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/fa912d6f33044142bf3d13f550d098da.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/83', '83', 'ProductVariant', NULL),
(140, '2026-07-02 16:25:56.810534', 'admin', NULL, NULL, '2026-07-02 16:25:56.810534', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(141, '2026-07-02 16:25:56.882522', 'admin', NULL, NULL, '2026-07-02 16:25:56.882522', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(142, '2026-07-02 16:25:57.024732', 'admin', NULL, NULL, '2026-07-02 16:25:57.024732', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/variants/84', '7', 'Product', 'node'),
(143, '2026-07-02 16:25:57.113766', 'admin', NULL, NULL, '2026-07-02 16:25:57.113766', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":84,\"productId\":7,\"size\":\"Ultra\",\"color\":\"Đỏ\",\"price\":\"12000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/05606ef551f24fdfae7ed9a96cafdbbf.webp\"}}', 'PUT', NULL, '/admin/products/7/variants/84', '84', 'ProductVariant', NULL),
(144, '2026-07-02 16:26:25.229415', 'admin', NULL, NULL, '2026-07-02 16:26:25.229415', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(145, '2026-07-02 16:26:25.355743', 'admin', NULL, NULL, '2026-07-02 16:26:25.355743', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(146, '2026-07-02 16:26:34.049615', 'admin', NULL, NULL, '2026-07-02 16:26:34.049615', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(147, '2026-07-02 16:26:34.137273', 'admin', NULL, NULL, '2026-07-02 16:26:34.137273', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(148, '2026-07-02 16:26:34.288162', 'admin', NULL, NULL, '2026-07-02 16:26:34.288162', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/85', '8', 'Product', 'node'),
(149, '2026-07-02 16:26:34.396360', 'admin', NULL, NULL, '2026-07-02 16:26:34.396360', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":85,\"productId\":8,\"size\":\"Tiêu chuẩn\",\"color\":\"Trắng\",\"price\":\"45000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/85', '85', 'ProductVariant', NULL),
(150, '2026-07-02 16:26:42.665601', 'admin', NULL, NULL, '2026-07-02 16:26:42.665601', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(151, '2026-07-02 16:26:42.763273', 'admin', NULL, NULL, '2026-07-02 16:26:42.763273', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(152, '2026-07-02 16:26:42.889145', 'admin', NULL, NULL, '2026-07-02 16:26:42.891239', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/86', '8', 'Product', 'node'),
(153, '2026-07-02 16:26:42.975142', 'admin', NULL, NULL, '2026-07-02 16:26:42.975142', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":86,\"productId\":8,\"size\":\"Tiêu chuẩn\",\"color\":\"Đen\",\"price\":\"45000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/5c895a08682e4613ac954bbc094285ff.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/86', '86', 'ProductVariant', NULL),
(154, '2026-07-02 16:26:48.476287', 'admin', NULL, NULL, '2026-07-02 16:26:48.476287', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(155, '2026-07-02 16:26:48.586944', 'admin', NULL, NULL, '2026-07-02 16:26:48.586944', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(156, '2026-07-02 16:26:48.697861', 'admin', NULL, NULL, '2026-07-02 16:26:48.697861', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/87', '8', 'Product', 'node'),
(157, '2026-07-02 16:26:48.758589', 'admin', NULL, NULL, '2026-07-02 16:26:48.758589', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":87,\"productId\":8,\"size\":\"Tiêu chuẩn\",\"color\":\"Xanh\",\"price\":\"45000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/00e28b7d3e0948eba06b63854d33d4dc.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/87', '87', 'ProductVariant', NULL),
(158, '2026-07-02 16:26:54.314432', 'admin', NULL, NULL, '2026-07-02 16:26:54.314432', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(159, '2026-07-02 16:26:54.479364', 'admin', NULL, NULL, '2026-07-02 16:26:54.479364', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL);
INSERT INTO `web_activities` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `action`, `actor_user_id`, `actor_username`, `detail_json`, `http_method`, `ip_address`, `request_path`, `resource_id`, `resource_type`, `user_agent`) VALUES
(160, '2026-07-02 16:26:54.613314', 'admin', NULL, NULL, '2026-07-02 16:26:54.613314', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/88', '8', 'Product', 'node'),
(161, '2026-07-02 16:26:54.694903', 'admin', NULL, NULL, '2026-07-02 16:26:54.694903', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":88,\"productId\":8,\"size\":\"Tiêu chuẩn\",\"color\":\"Đỏ\",\"price\":\"45000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/84374380fd1541bab6c2e5773e0485f9.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/88', '88', 'ProductVariant', NULL),
(162, '2026-07-02 16:27:01.000063', 'admin', NULL, NULL, '2026-07-02 16:27:01.001096', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(163, '2026-07-02 16:27:01.080688', 'admin', NULL, NULL, '2026-07-02 16:27:01.080688', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(164, '2026-07-02 16:27:01.284840', 'admin', NULL, NULL, '2026-07-02 16:27:01.284840', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/89', '8', 'Product', 'node'),
(165, '2026-07-02 16:27:01.342227', 'admin', NULL, NULL, '2026-07-02 16:27:01.342227', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":89,\"productId\":8,\"size\":\"Pro\",\"color\":\"Trắng\",\"price\":\"48000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/f6de580b27cb4d8cb96a762294a0d93b.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/89', '89', 'ProductVariant', NULL),
(166, '2026-07-02 16:27:07.117595', 'admin', NULL, NULL, '2026-07-02 16:27:07.117595', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(167, '2026-07-02 16:27:07.238173', 'admin', NULL, NULL, '2026-07-02 16:27:07.238173', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(168, '2026-07-02 16:27:07.290542', 'admin', NULL, NULL, '2026-07-02 16:27:07.290542', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/90', '8', 'Product', 'node'),
(169, '2026-07-02 16:27:07.349654', 'admin', NULL, NULL, '2026-07-02 16:27:07.349654', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":90,\"productId\":8,\"size\":\"Pro\",\"color\":\"Đen\",\"price\":\"48000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/f10df1688b0d425198b726f4c292f650.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/90', '90', 'ProductVariant', NULL),
(170, '2026-07-02 16:27:13.577062', 'admin', NULL, NULL, '2026-07-02 16:27:13.577062', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(171, '2026-07-02 16:27:13.661699', 'admin', NULL, NULL, '2026-07-02 16:27:13.661699', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(172, '2026-07-02 16:27:13.796199', 'admin', NULL, NULL, '2026-07-02 16:27:13.796199', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/91', '8', 'Product', 'node'),
(173, '2026-07-02 16:27:13.861406', 'admin', NULL, NULL, '2026-07-02 16:27:13.861406', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":91,\"productId\":8,\"size\":\"Pro\",\"color\":\"Xanh\",\"price\":\"48000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/ad1f51ad36904352af03a32d3361174e.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/91', '91', 'ProductVariant', NULL),
(174, '2026-07-02 16:27:22.326613', 'admin', NULL, NULL, '2026-07-02 16:27:22.326613', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(175, '2026-07-02 16:27:22.392569', 'admin', NULL, NULL, '2026-07-02 16:27:22.392569', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(176, '2026-07-02 16:27:22.645702', 'admin', NULL, NULL, '2026-07-02 16:27:22.645702', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/92', '8', 'Product', 'node'),
(177, '2026-07-02 16:27:22.713420', 'admin', NULL, NULL, '2026-07-02 16:27:22.713420', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":92,\"productId\":8,\"size\":\"Pro\",\"color\":\"Đỏ\",\"price\":\"48000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/4dabf0c6e1044a1d9bf5eceba6524f67.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/92', '92', 'ProductVariant', NULL),
(178, '2026-07-02 16:27:29.729684', 'admin', NULL, NULL, '2026-07-02 16:27:29.729684', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(179, '2026-07-02 16:27:29.841104', 'admin', NULL, NULL, '2026-07-02 16:27:29.841104', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(180, '2026-07-02 16:27:30.045706', 'admin', NULL, NULL, '2026-07-02 16:27:30.045706', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/93', '8', 'Product', 'node'),
(181, '2026-07-02 16:27:30.127314', 'admin', NULL, NULL, '2026-07-02 16:27:30.127314', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":93,\"productId\":8,\"size\":\"Ultra\",\"color\":\"Trắng\",\"price\":\"51000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/36bf360afd9740e2a9d42667879a2601.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/93', '93', 'ProductVariant', NULL),
(182, '2026-07-02 16:27:37.126671', 'admin', NULL, NULL, '2026-07-02 16:27:37.126671', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(183, '2026-07-02 16:27:37.217212', 'admin', NULL, NULL, '2026-07-02 16:27:37.217212', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(184, '2026-07-02 16:27:37.345183', 'admin', NULL, NULL, '2026-07-02 16:27:37.345183', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/95', '8', 'Product', 'node'),
(185, '2026-07-02 16:27:37.433666', 'admin', NULL, NULL, '2026-07-02 16:27:37.433666', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":95,\"productId\":8,\"size\":\"Ultra\",\"color\":\"Xanh\",\"price\":\"51000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/2231701ddf6048d0aaca30ef7581a46b.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/95', '95', 'ProductVariant', NULL),
(186, '2026-07-02 16:27:44.023856', 'admin', NULL, NULL, '2026-07-02 16:27:44.023856', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/images/upload', '8', 'Product', 'node'),
(187, '2026-07-02 16:27:44.104703', 'admin', NULL, NULL, '2026-07-02 16:27:44.104703', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":8,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/8/images/upload', '8', 'ProductImage', NULL),
(188, '2026-07-02 16:27:44.228016', 'admin', NULL, NULL, '2026-07-02 16:27:44.228016', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/8/variants/96', '8', 'Product', 'node'),
(189, '2026-07-02 16:27:44.277925', 'admin', NULL, NULL, '2026-07-02 16:27:44.277925', 'admin', 'PRODUCT_VARIANT_UPDATE', NULL, 'admin', '{\"resourceType\":\"ProductVariant\",\"after\":{\"variantId\":96,\"productId\":8,\"size\":\"Ultra\",\"color\":\"Đỏ\",\"price\":\"51000000\",\"availability\":0,\"variantImageUrl\":\"/api/catalog/admin/products/images/file/f47cd9653ef24cf6a712efb66465b475.webp\"}}', 'PUT', NULL, '/admin/products/8/variants/96', '96', 'ProductVariant', NULL),
(190, '2026-07-02 16:28:13.742914', 'admin', NULL, NULL, '2026-07-02 16:28:13.742914', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/23', '7', 'Product', 'node'),
(191, '2026-07-02 16:28:14.242407', 'admin', NULL, NULL, '2026-07-02 16:28:14.242407', 'admin', 'PRODUCT_IMAGE_DELETE', '15', 'admin', '{\"resourceType\":\"ProductImage\",\"before\":{\"imageId\":23,\"productId\":7,\"storagePath\":\"6b4d1795fd594136864d2bc5d61f1133.webp\",\"imageUrl\":\"/api/catalog/admin/products/images/file/6b4d1795fd594136864d2bc5d61f1133.webp\"}}', 'DELETE', NULL, '/admin/products/7/images/23', '23', 'ProductImage', NULL),
(192, '2026-07-02 16:28:18.033026', 'admin', NULL, NULL, '2026-07-02 16:28:18.033026', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/24', '7', 'Product', 'node'),
(193, '2026-07-02 16:28:18.071076', 'admin', NULL, NULL, '2026-07-02 16:28:18.071076', 'admin', 'PRODUCT_IMAGE_DELETE', '15', 'admin', '{\"resourceType\":\"ProductImage\",\"before\":{\"imageId\":24,\"productId\":7,\"storagePath\":\"494d8949160e4db3ad13a83559b76835.webp\",\"imageUrl\":\"/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp\"}}', 'DELETE', NULL, '/admin/products/7/images/24', '24', 'ProductImage', NULL),
(194, '2026-07-02 16:28:26.090819', 'admin', NULL, NULL, '2026-07-02 16:28:26.090819', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/7/images/upload', '7', 'Product', 'node'),
(195, '2026-07-02 16:28:26.258919', 'admin', NULL, NULL, '2026-07-02 16:28:26.258919', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":7,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/7/images/upload', '7', 'ProductImage', NULL),
(196, '2026-07-02 16:29:06.297858', 'admin', NULL, NULL, '2026-07-02 16:29:06.297858', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/6/images/upload', '6', 'Product', 'node'),
(197, '2026-07-02 16:29:06.421093', 'admin', NULL, NULL, '2026-07-02 16:29:06.421093', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":6,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/6/images/upload', '6', 'ProductImage', NULL),
(198, '2026-07-02 16:29:40.646222', 'admin', NULL, NULL, '2026-07-02 16:29:40.648265', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":5,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/5/images/upload', '5', 'ProductImage', NULL),
(199, '2026-07-02 16:29:40.646222', 'admin', NULL, NULL, '2026-07-02 16:29:40.648265', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/5/images/upload', '5', 'Product', 'node'),
(200, '2026-07-02 16:30:10.153937', 'admin', NULL, NULL, '2026-07-02 16:30:10.153937', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/4/images/upload', '4', 'Product', 'node'),
(201, '2026-07-02 16:30:10.302059', 'admin', NULL, NULL, '2026-07-02 16:30:10.302059', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":4,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/4/images/upload', '4', 'ProductImage', NULL),
(202, '2026-07-02 16:30:38.622715', 'admin', NULL, NULL, '2026-07-02 16:30:38.622715', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/3/images/upload', '3', 'Product', 'node'),
(203, '2026-07-02 16:30:38.697232', 'admin', NULL, NULL, '2026-07-02 16:30:38.697232', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":3,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/3/images/upload', '3', 'ProductImage', NULL),
(204, '2026-07-02 16:31:18.887396', 'admin', NULL, NULL, '2026-07-02 16:31:18.887396', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/2/images/upload', '2', 'Product', 'node'),
(205, '2026-07-02 16:31:18.960496', 'admin', NULL, NULL, '2026-07-02 16:31:18.960496', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":2,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/2/images/upload', '2', 'ProductImage', NULL),
(206, '2026-07-02 16:31:49.001023', 'admin', NULL, NULL, '2026-07-02 16:31:49.001023', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/1/images/upload', '1', 'Product', 'node'),
(207, '2026-07-02 16:31:49.085621', 'admin', NULL, NULL, '2026-07-02 16:31:49.085621', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":1,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/1/images/upload', '1', 'ProductImage', NULL),
(208, '2026-07-02 16:34:03.719853', NULL, NULL, NULL, '2026-07-02 16:34:03.723098', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(209, '2026-07-02 16:34:18.427582', NULL, NULL, NULL, '2026-07-02 16:34:18.427582', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/confirm', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(210, '2026-07-02 16:41:10.151493', 'admin', NULL, NULL, '2026-07-02 16:41:10.157992', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(211, '2026-07-02 16:43:59.400285', 'admin', NULL, NULL, '2026-07-02 16:43:59.405494', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/vouchers', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(212, '2026-07-02 16:43:59.400285', 'admin', NULL, NULL, '2026-07-02 16:43:59.405494', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/vouchers', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(213, '2026-07-02 16:43:59.400285', 'admin', NULL, NULL, '2026-07-02 16:43:59.405494', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/vouchers', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(214, '2026-07-02 16:43:59.400285', 'admin', NULL, NULL, '2026-07-02 16:43:59.405494', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/vouchers', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(215, '2026-07-02 16:43:59.400285', 'admin', NULL, NULL, '2026-07-02 16:43:59.405494', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/vouchers', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(216, '2026-07-02 16:49:16.772381', NULL, NULL, NULL, '2026-07-02 16:49:16.777464', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(217, '2026-07-02 16:52:56.535899', NULL, NULL, NULL, '2026-07-02 16:52:56.542341', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(218, '2026-07-02 16:57:01.431580', NULL, NULL, NULL, '2026-07-02 16:57:01.463913', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(219, '2026-07-02 16:57:25.466370', 'system', NULL, NULL, '2026-07-02 16:57:25.467236', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"quantity\":1,\"variantId\":109,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T09:57:24.548348400Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(220, '2026-07-02 16:57:35.349026', 'system', NULL, NULL, '2026-07-02 16:57:35.349026', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"quantity\":1,\"variantId\":109,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T09:57:35.341704700Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(221, '2026-07-02 17:06:10.432032', NULL, NULL, NULL, '2026-07-02 17:06:10.478871', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(222, '2026-07-02 17:06:18.836183', NULL, NULL, NULL, '2026-07-02 17:06:18.836183', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(223, '2026-07-02 17:06:25.679524', NULL, NULL, NULL, '2026-07-02 17:06:25.679524', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(224, '2026-07-02 17:06:35.362666', 'admin', NULL, NULL, '2026-07-02 17:06:35.362666', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":1,\"orderNumber\":\"DH2607021706-2131-614184\",\"userId\":15,\"total\":\"17900000.00\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-02T10:06:32.995346200Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '1', 'Order', NULL),
(225, '2026-07-02 17:06:37.550400', 'system', NULL, NULL, '2026-07-02 17:06:37.550400', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"variantId\":109,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:06:37.479359900Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(226, '2026-07-02 17:10:58.618698', 'system', NULL, NULL, '2026-07-02 17:10:58.618698', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":3,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"hihi\"},\"at\":\"2026-07-02T10:10:58.055772500Z\"}', 'POST', NULL, '/send', '3', 'NotificationMessage', NULL),
(227, '2026-07-02 17:15:03.628499', NULL, NULL, NULL, '2026-07-02 17:15:03.644165', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/telegram/generate-token', NULL, 'Gateway', 'node'),
(228, '2026-07-02 17:17:07.073550', 'system', NULL, NULL, '2026-07-02 17:17:07.073550', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":4,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"fhfh\"},\"at\":\"2026-07-02T10:17:05.830823Z\"}', 'POST', NULL, '/send', '4', 'NotificationMessage', NULL),
(229, '2026-07-02 17:19:06.317882', 'admin', NULL, NULL, '2026-07-02 17:19:06.321883', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PATCH', '0:0:0:0:0:0:0:1', '/api/shop/orders/1/status', '1', 'Order', 'node'),
(230, '2026-07-02 17:19:07.383806', 'admin', NULL, NULL, '2026-07-02 17:19:07.383806', 'admin', 'ORDER_STATUS_UPDATE', NULL, 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CONFIRMED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVD000A131382\",\"estimatedDeliveryDate\":\"2026-07-06\"},\"at\":\"2026-07-02T10:19:07.314172200Z\",\"actorUsername\":\"admin\"}', 'PATCH', NULL, '/orders/1/status', '1', 'Order', NULL),
(231, '2026-07-02 17:19:13.582754', 'system', NULL, NULL, '2026-07-02 17:19:13.582754', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":5,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607021706-2131-614184 đã được xác nhận\"},\"at\":\"2026-07-02T10:19:13.452113300Z\"}', 'POST', NULL, '/send', '5', 'NotificationMessage', NULL),
(232, '2026-07-02 17:19:13.920419', 'admin', NULL, NULL, '2026-07-02 17:19:13.920419', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PATCH', '0:0:0:0:0:0:0:1', '/api/shop/orders/1/status', '1', 'Order', 'node'),
(233, '2026-07-02 17:19:14.000738', NULL, NULL, NULL, '2026-07-02 17:19:14.000738', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(234, '2026-07-02 17:19:15.943292', 'admin', NULL, NULL, '2026-07-02 17:19:15.943292', 'admin', 'ORDER_STATUS_UPDATE', NULL, 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"SHIPPED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVD000A131382\",\"estimatedDeliveryDate\":\"2026-07-06\"},\"at\":\"2026-07-02T10:19:15.928970500Z\",\"actorUsername\":\"admin\"}', 'PATCH', NULL, '/orders/1/status', '1', 'Order', NULL),
(235, '2026-07-02 17:19:25.061926', 'admin', NULL, NULL, '2026-07-02 17:19:25.061926', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PATCH', '0:0:0:0:0:0:0:1', '/api/shop/orders/1/status', '1', 'Order', 'node'),
(236, '2026-07-02 17:19:26.646879', 'admin', NULL, NULL, '2026-07-02 17:19:26.646879', 'admin', 'ORDER_STATUS_UPDATE', NULL, 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"DELIVERED\",\"paymentStatus\":\"PAID\",\"paymentMethod\":\"COD\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVD000A131382\",\"estimatedDeliveryDate\":\"2026-07-06\"},\"at\":\"2026-07-02T10:19:26.640560500Z\",\"actorUsername\":\"admin\"}', 'PATCH', NULL, '/orders/1/status', '1', 'Order', NULL),
(237, '2026-07-02 17:23:40.263550', 'admin', NULL, NULL, '2026-07-02 17:23:40.271485', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/1', '1', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(238, '2026-07-02 17:24:30.069842', NULL, NULL, NULL, '2026-07-02 17:24:30.076652', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/upload-image', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(239, '2026-07-02 17:24:34.945328', 'admin', NULL, NULL, '2026-07-02 17:24:34.945328', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/1', '1', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(240, '2026-07-02 17:24:54.609043', NULL, NULL, NULL, '2026-07-02 17:24:54.609043', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/upload-image', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(241, '2026-07-02 17:25:03.395985', 'admin', NULL, NULL, '2026-07-02 17:25:03.395985', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/2', '2', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(242, '2026-07-02 17:25:12.711846', NULL, NULL, NULL, '2026-07-02 17:25:12.711846', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/upload-image', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(243, '2026-07-02 17:25:23.459984', 'admin', NULL, NULL, '2026-07-02 17:25:23.459984', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/banners/3', '3', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(244, '2026-07-02 17:38:03.250000', NULL, NULL, NULL, '2026-07-02 17:38:03.255384', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/9/view', '9', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(245, '2026-07-02 17:46:57.529848', NULL, NULL, NULL, '2026-07-02 17:46:57.542322', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/2/view', '2', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(246, '2026-07-02 17:47:02.726922', 'system', NULL, NULL, '2026-07-02 17:47:02.726922', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":2,\"quantity\":1,\"variantId\":13,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:47:02.672213900Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(247, '2026-07-02 17:47:26.379881', NULL, NULL, NULL, '2026-07-02 17:47:26.392389', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(248, '2026-07-02 17:47:28.789335', 'system', NULL, NULL, '2026-07-02 17:47:28.789335', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"quantity\":1,\"variantId\":117,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:47:28.745759200Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(249, '2026-07-02 17:47:31.440347', 'system', NULL, NULL, '2026-07-02 17:47:31.440347', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"quantity\":1,\"variantId\":109,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:47:31.421080800Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(250, '2026-07-02 17:50:38.674112', 'admin', NULL, NULL, '2026-07-02 17:50:38.688118', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":2,\"orderNumber\":\"DH2607021750-2131-420685\",\"userId\":15,\"total\":\"9000030.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":3},\"at\":\"2026-07-02T10:50:38.457429Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '2', 'Order', NULL),
(251, '2026-07-02 17:50:38.674112', NULL, NULL, NULL, '2026-07-02 17:50:38.688118', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(252, '2026-07-02 17:50:45.752281', 'system', NULL, NULL, '2026-07-02 17:50:45.752281', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":6,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607021750-2131-420685 — thanh toán QR (SePay)\"},\"at\":\"2026-07-02T10:50:45.337943900Z\"}', 'POST', NULL, '/send', '6', 'NotificationMessage', NULL),
(253, '2026-07-02 17:50:59.204408', 'system', NULL, NULL, '2026-07-02 17:50:59.204408', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":1,\"orderId\":2,\"amount\":\"9000030\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-0f2f1c034d614525\"},\"at\":\"2026-07-02T10:50:56.742411300Z\"}', 'POST', NULL, '/create', '1', 'Payment', NULL),
(254, '2026-07-02 17:52:54.738509', NULL, NULL, NULL, '2026-07-02 17:52:54.742261', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(255, '2026-07-02 17:52:56.892650', NULL, NULL, NULL, '2026-07-02 17:52:56.893666', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(256, '2026-07-02 17:54:39.175433', NULL, NULL, NULL, '2026-07-02 17:54:39.186471', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(257, '2026-07-02 17:54:43.058538', 'admin', NULL, NULL, '2026-07-02 17:54:43.058538', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":3,\"orderNumber\":\"DH2607021754-2131-FE6661\",\"userId\":15,\"total\":\"8500030.0000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":3},\"at\":\"2026-07-02T10:54:43.000670100Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '3', 'Order', NULL),
(258, '2026-07-02 17:54:45.276997', 'system', NULL, NULL, '2026-07-02 17:54:45.276997', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"variantId\":117,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:54:45.210023400Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(259, '2026-07-02 17:54:45.761017', 'system', NULL, NULL, '2026-07-02 17:54:45.761017', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":2,\"variantId\":13,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:54:45.723020900Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(260, '2026-07-02 17:54:46.093417', 'system', NULL, NULL, '2026-07-02 17:54:46.093417', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"variantId\":109,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-02T10:54:46.068342300Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(261, '2026-07-02 18:01:34.691985', 'admin', NULL, NULL, '2026-07-02 18:01:34.691985', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PATCH', '0:0:0:0:0:0:0:1', '/api/shop/orders/3/status', '3', 'Order', 'node'),
(262, '2026-07-02 18:01:34.691985', 'admin', NULL, NULL, '2026-07-02 18:01:34.691985', 'admin', 'ORDER_STATUS_UPDATE', NULL, 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CANCELLED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":null,\"estimatedDeliveryDate\":null},\"at\":\"2026-07-02T11:01:33.988855100Z\",\"actorUsername\":\"admin\"}', 'PATCH', NULL, '/orders/3/status', '3', 'Order', NULL),
(263, '2026-07-02 18:06:19.492171', 'admin', NULL, NULL, '2026-07-02 18:06:19.492171', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PATCH', '0:0:0:0:0:0:0:1', '/api/shop/orders/2/status', '2', 'Order', 'node'),
(264, '2026-07-02 18:06:19.492171', 'admin', NULL, NULL, '2026-07-02 18:06:19.492171', 'admin', 'ORDER_STATUS_UPDATE', NULL, 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"PAID\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":null,\"estimatedDeliveryDate\":null},\"at\":\"2026-07-02T11:06:18.998596500Z\",\"actorUsername\":\"admin\"}', 'PATCH', NULL, '/orders/2/status', '2', 'Order', NULL),
(265, '2026-07-02 18:06:28.961130', 'admin', NULL, NULL, '2026-07-02 18:06:28.961130', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PATCH', '0:0:0:0:0:0:0:1', '/api/shop/orders/2/status', '2', 'Order', 'node'),
(266, '2026-07-02 18:06:29.078446', 'admin', NULL, NULL, '2026-07-02 18:06:29.078446', 'admin', 'ORDER_STATUS_UPDATE', NULL, 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CONFIRMED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVDBA140E582E\",\"estimatedDeliveryDate\":\"2026-07-06\"},\"at\":\"2026-07-02T11:06:29.068177200Z\",\"actorUsername\":\"admin\"}', 'PATCH', NULL, '/orders/2/status', '2', 'Order', NULL),
(267, '2026-07-02 18:06:40.492270', 'system', NULL, NULL, '2026-07-02 18:06:40.492270', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":7,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607021750-2131-420685 đã được xác nhận\"},\"at\":\"2026-07-02T11:06:40.127594300Z\"}', 'POST', NULL, '/send', '7', 'NotificationMessage', NULL),
(268, '2026-07-02 18:12:33.273985', NULL, NULL, NULL, '2026-07-02 18:12:33.280645', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/chatbot/chat', NULL, 'Gateway', 'node'),
(269, '2026-07-02 18:18:05.461311', NULL, NULL, NULL, '2026-07-02 18:18:05.461311', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/chatbot/chat', NULL, 'Gateway', 'node'),
(270, '2026-07-02 18:19:20.972891', NULL, NULL, NULL, '2026-07-02 18:19:20.987903', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/chatbot/chat', NULL, 'Gateway', 'node'),
(271, '2026-07-04 13:09:02.099129', 'admin', NULL, NULL, '2026-07-04 13:09:02.099129', 'admin', 'CATEGORY_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":6,\"after\":{\"categoryId\":6,\"name\":\"Gmail domain cho thuê\",\"slug\":\"gmail-domain-cho-thue\",\"hidden\":false},\"newData\":{\"categoryId\":6,\"name\":\"Gmail domain cho thuê\",\"slug\":\"gmail-domain-cho-thue\",\"hidden\":false},\"at\":\"2026-07-04T06:08:56.695288400Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/admin/categories', '6', 'Category', NULL),
(272, '2026-07-04 13:09:02.099129', 'admin', NULL, NULL, '2026-07-04 13:09:02.099129', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories', NULL, 'Category', 'node'),
(273, '2026-07-04 13:09:06.777460', 'system', NULL, NULL, '2026-07-04 13:09:06.777460', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":8,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Tạo danh mục\"},\"at\":\"2026-07-04T06:09:05.277795500Z\"}', 'POST', NULL, '/send', '8', 'NotificationMessage', NULL),
(274, '2026-07-04 13:17:37.940066', 'admin', NULL, NULL, '2026-07-04 13:17:37.946614', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories', NULL, 'Category', 'node'),
(275, '2026-07-04 13:17:38.488400', 'admin', NULL, NULL, '2026-07-04 13:17:38.488400', 'admin', 'CATEGORY_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":7,\"after\":{\"categoryId\":7,\"name\":\"TT Việt NEW có info\",\"slug\":\"tt-viet-new-co-info\",\"hidden\":false},\"newData\":{\"categoryId\":7,\"name\":\"TT Việt NEW có info\",\"slug\":\"tt-viet-new-co-info\",\"hidden\":false},\"at\":\"2026-07-04T06:17:38.268736200Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/admin/categories', '7', 'Category', NULL),
(276, '2026-07-04 13:17:41.939679', 'system', NULL, NULL, '2026-07-04 13:17:41.939679', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":9,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Tạo danh mục\"},\"at\":\"2026-07-04T06:17:41.557934200Z\"}', 'POST', NULL, '/send', '9', 'NotificationMessage', NULL),
(277, '2026-07-04 13:18:45.757020', 'admin', NULL, NULL, '2026-07-04 13:18:45.759026', 'admin', 'CATEGORY_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":8,\"after\":{\"categoryId\":8,\"name\":\"TT Việt NEW có info1\",\"slug\":\"tt-viet-new-co-info-1\",\"hidden\":false},\"newData\":{\"categoryId\":8,\"name\":\"TT Việt NEW có info1\",\"slug\":\"tt-viet-new-co-info-1\",\"hidden\":false},\"at\":\"2026-07-04T06:18:45.526668800Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/admin/categories', '8', 'Category', NULL),
(278, '2026-07-04 13:18:45.757020', 'admin', NULL, NULL, '2026-07-04 13:18:45.759026', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories', NULL, 'Category', 'node'),
(279, '2026-07-04 13:18:47.166491', 'system', NULL, NULL, '2026-07-04 13:18:47.166491', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":10,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Tạo danh mục\"},\"at\":\"2026-07-04T06:18:47.104464900Z\"}', 'POST', NULL, '/send', '10', 'NotificationMessage', NULL),
(280, '2026-07-04 13:19:09.540446', 'admin', NULL, NULL, '2026-07-04 13:19:09.540961', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories/1', '1', 'Category', 'node'),
(281, '2026-07-04 13:19:10.152900', 'admin', NULL, NULL, '2026-07-04 13:19:10.152900', 'admin', 'CATEGORY_UPDATE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":1,\"before\":{\"categoryId\":1,\"name\":\"Điện thoại thông minh\",\"slug\":\"dien-thoai-thong-minh\",\"hidden\":false},\"after\":{\"categoryId\":1,\"name\":\"Điện thoại thông minh1\",\"slug\":\"dien-thoai-thong-minh\",\"hidden\":false},\"at\":\"2026-07-04T06:19:10.139622900Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'PUT', NULL, '/admin/categories/1', '1', 'Category', NULL),
(282, '2026-07-04 13:19:10.366333', 'system', NULL, NULL, '2026-07-04 13:19:10.366333', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":11,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Cập nhật danh mục\"},\"at\":\"2026-07-04T06:19:10.357365900Z\"}', 'POST', NULL, '/send', '11', 'NotificationMessage', NULL),
(283, '2026-07-04 13:19:58.688567', 'admin', NULL, NULL, '2026-07-04 13:19:58.695082', 'admin', 'GATEWAY_REQUEST', '15', 'admin', '{\"query\":\"confirm=true\"}', 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/categories/1', '1', 'Category', 'node'),
(284, '2026-07-04 13:19:59.008056', 'admin', NULL, NULL, '2026-07-04 13:19:59.008056', 'admin', 'CATEGORY_DELETE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Category\",\"categoryId\":1,\"before\":{\"categoryId\":1,\"name\":\"Điện thoại thông minh1\",\"slug\":\"dien-thoai-thong-minh\"},\"categoryName\":\"Điện thoại thông minh1\",\"slug\":\"dien-thoai-thong-minh\",\"productCountAtDelete\":3,\"confirmDeleteWithProducts\":true,\"deletedAt\":\"2026-07-04T06:19:58.803616500Z\",\"deletedByUsername\":\"admin\",\"deletedByUserId\":\"15\",\"softDelete\":true,\"restorableCategoryId\":1}', 'DELETE', NULL, '/admin/categories/1', '1', 'Category', NULL),
(285, '2026-07-04 13:20:02.091884', 'system', NULL, NULL, '2026-07-04 13:20:02.091884', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":12,\"channel\":\"WEB\",\"recipientMasked\":\"****.com\",\"subject\":\"[Danh mục] Xóa danh mục\"},\"at\":\"2026-07-04T06:20:01.905102200Z\"}', 'POST', NULL, '/send', '12', 'NotificationMessage', NULL),
(286, '2026-07-04 13:26:41.462550', 'admin', NULL, NULL, '2026-07-04 13:26:41.467940', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/upload-logo', NULL, 'Gateway', 'node'),
(287, '2026-07-04 13:26:42.174142', 'admin', NULL, NULL, '2026-07-04 13:26:42.174142', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/1', '1', 'Gateway', 'node'),
(288, '2026-07-04 13:41:09.554674', 'admin', NULL, NULL, '2026-07-04 13:41:09.560560', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/5', '5', 'Gateway', 'node'),
(289, '2026-07-04 13:41:23.883813', 'admin', NULL, NULL, '2026-07-04 13:41:23.883813', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/5', '5', 'Gateway', 'node'),
(290, '2026-07-04 13:41:33.822759', 'admin', NULL, NULL, '2026-07-04 13:41:33.823286', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/5', '5', 'Gateway', 'node'),
(291, '2026-07-04 13:45:08.487033', 'admin', NULL, NULL, '2026-07-04 13:45:08.491546', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/5', '5', 'Gateway', 'node'),
(292, '2026-07-04 13:47:41.882050', 'admin', NULL, NULL, '2026-07-04 13:47:41.886921', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/4', '4', 'Gateway', 'node'),
(293, '2026-07-04 13:50:34.920859', 'admin', NULL, NULL, '2026-07-04 13:50:34.925434', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/upload-logo', NULL, 'Gateway', 'node'),
(294, '2026-07-04 13:50:36.830436', 'admin', NULL, NULL, '2026-07-04 13:50:36.830436', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands', NULL, 'Gateway', 'node'),
(295, '2026-07-04 13:50:54.676030', 'admin', NULL, NULL, '2026-07-04 13:50:54.683032', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/catalog/admin/brands/6', '6', 'Gateway', 'node'),
(296, '2026-07-04 14:01:28.877993', 'admin', NULL, NULL, '2026-07-04 14:01:28.884427', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products', NULL, 'Product', 'node'),
(297, '2026-07-04 14:01:32.081928', 'admin', NULL, NULL, '2026-07-04 14:01:32.081928', 'admin', 'PRODUCT_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Product\",\"productId\":11,\"after\":{\"productId\":11,\"productName\":\"test\",\"discription\":\"ádfasdfasdf\",\"categoryId\":3,\"price\":\"1\",\"availability\":0,\"hidden\":false,\"sku\":\"SKU-f4938b353362\"},\"newData\":{\"productId\":11,\"productName\":\"test\",\"discription\":\"ádfasdfasdf\",\"categoryId\":3,\"price\":\"1\",\"availability\":0,\"hidden\":false,\"sku\":\"SKU-f4938b353362\"},\"at\":\"2026-07-04T07:01:30.298384600Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/admin/products', '11', 'Product', NULL),
(298, '2026-07-04 14:01:58.230750', 'admin', NULL, NULL, '2026-07-04 14:01:58.272747', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/11/images/upload', '11', 'Product', 'node'),
(299, '2026-07-04 14:01:59.587989', 'admin', NULL, NULL, '2026-07-04 14:01:59.587989', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":11,\"uploadCount\":2}}', 'POST', NULL, '/admin/products/11/images/upload', '11', 'ProductImage', NULL),
(300, '2026-07-06 21:35:23.628611', 'admin', NULL, NULL, '2026-07-06 21:35:23.645445', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/inbound', NULL, 'Inventory', 'node'),
(301, '2026-07-06 21:35:23.627610', 'admin', NULL, NULL, '2026-07-06 21:35:23.644431', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/inbound', NULL, 'Inventory', 'node'),
(302, '2026-07-06 21:35:28.632686', 'admin', NULL, NULL, '2026-07-06 21:35:28.632686', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/inbound', NULL, 'Inventory', 'node'),
(303, '2026-07-06 21:37:54.870792', 'admin', NULL, NULL, '2026-07-06 21:37:54.875990', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/10/images/upload', '10', 'Product', 'node'),
(304, '2026-07-06 21:38:10.356106', 'admin', NULL, NULL, '2026-07-06 21:38:10.357658', 'admin', 'PRODUCT_IMAGE_UPLOAD', NULL, 'admin', '{\"resourceType\":\"ProductImage\",\"after\":{\"productId\":10,\"uploadCount\":1}}', 'POST', NULL, '/admin/products/10/images/upload', '10', 'ProductImage', NULL),
(305, '2026-07-06 22:39:35.984524', NULL, NULL, NULL, '2026-07-06 22:39:35.984524', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(306, '2026-07-06 22:40:09.867933', NULL, NULL, NULL, '2026-07-06 22:40:09.867933', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/excel/inventory-template', 'excel', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(307, '2026-07-06 22:40:50.358083', NULL, NULL, NULL, '2026-07-06 22:40:50.358083', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(308, '2026-07-06 22:43:30.909642', NULL, NULL, NULL, '2026-07-06 22:43:30.920961', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36');
INSERT INTO `web_activities` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `action`, `actor_user_id`, `actor_username`, `detail_json`, `http_method`, `ip_address`, `request_path`, `resource_id`, `resource_type`, `user_agent`) VALUES
(309, '2026-07-06 22:47:32.244066', NULL, NULL, NULL, '2026-07-06 22:47:32.254585', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/confirm', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(310, '2026-07-06 22:48:55.638171', NULL, NULL, NULL, '2026-07-06 22:48:55.646574', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(311, '2026-07-06 22:49:02.459505', NULL, NULL, NULL, '2026-07-06 22:49:02.459505', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/confirm', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(312, '2026-07-06 22:52:27.276405', NULL, NULL, NULL, '2026-07-06 22:52:27.293132', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(313, '2026-07-06 22:52:35.290358', NULL, NULL, NULL, '2026-07-06 22:52:35.290358', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/confirm', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(314, '2026-07-06 22:53:03.708284', NULL, NULL, NULL, '2026-07-06 22:53:03.708284', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/preview', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(315, '2026-07-06 22:55:30.621554', NULL, NULL, NULL, '2026-07-06 22:55:30.628677', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/inventory/admin/stock/excel/confirm', NULL, 'Inventory', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(316, '2026-07-06 23:55:06.807341', NULL, NULL, NULL, '2026-07-06 23:55:06.819740', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(317, '2026-07-06 23:55:35.048379', 'system', NULL, NULL, '2026-07-06 23:55:35.052906', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":10,\"quantity\":1,\"variantId\":109,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T16:55:34.479200100Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(318, '2026-07-07 00:09:23.404901', NULL, NULL, NULL, '2026-07-07 00:09:23.428201', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(319, '2026-07-07 00:14:07.488269', NULL, NULL, NULL, '2026-07-07 00:14:07.495323', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/accounts/users/16/role', '16', 'User', 'node'),
(320, '2026-07-07 00:14:14.215725', 'admin', NULL, NULL, '2026-07-07 00:14:14.215725', 'admin', 'USER_ROLE_UPDATE', '16', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"user-service\",\"resourceType\":\"User\",\"after\":{\"userId\":16,\"userName\":\"adminpro\",\"activated\":true,\"roleName\":\"ROLE_ADMIN\"},\"at\":\"2026-07-06T17:14:08.506555400Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"16\"}', 'PUT', NULL, '/users/16/role', '16', 'User', NULL),
(321, '2026-07-07 00:49:38.195570', 'admin', NULL, NULL, '2026-07-07 00:49:38.205567', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(322, '2026-07-07 00:50:04.980680', 'admin', NULL, NULL, '2026-07-07 00:50:04.980680', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(323, '2026-07-07 00:50:44.759177', 'admin', NULL, NULL, '2026-07-07 00:50:44.759177', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/1', '1', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(324, '2026-07-07 00:51:18.175024', 'admin', NULL, NULL, '2026-07-07 00:51:18.175024', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/3', '3', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(325, '2026-07-07 00:53:42.026297', NULL, NULL, NULL, '2026-07-07 00:53:42.034006', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(326, '2026-07-07 00:55:55.441629', 'admin', NULL, NULL, '2026-07-07 00:55:55.447250', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/3', '3', 'Gateway', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(327, '2026-07-07 01:13:32.798279', 'admin', NULL, NULL, '2026-07-07 01:13:32.800297', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/3', '3', 'Gateway', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(328, '2026-07-07 01:20:12.045492', 'admin', NULL, NULL, '2026-07-07 01:20:12.050545', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/1', '1', 'Gateway', 'node'),
(329, '2026-07-07 01:20:13.539293', 'admin', NULL, NULL, '2026-07-07 01:20:13.539293', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/3', '3', 'Gateway', 'node'),
(330, '2026-07-07 01:20:39.056624', 'admin', NULL, NULL, '2026-07-07 01:20:39.066164', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(331, '2026-07-07 01:24:41.938052', 'admin', NULL, NULL, '2026-07-07 01:24:41.943059', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/4', '4', 'Gateway', 'node'),
(332, '2026-07-07 01:25:27.513285', 'admin', NULL, NULL, '2026-07-07 01:25:27.518033', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(333, '2026-07-07 01:25:40.095235', 'admin', NULL, NULL, '2026-07-07 01:25:40.095235', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/4', '4', 'Gateway', 'node'),
(334, '2026-07-07 01:25:52.279100', 'admin', NULL, NULL, '2026-07-07 01:25:52.279100', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(335, '2026-07-07 01:26:01.514989', 'admin', NULL, NULL, '2026-07-07 01:26:01.514989', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'DELETE', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/6', '6', 'Gateway', 'node'),
(336, '2026-07-07 01:26:12.433222', 'admin', NULL, NULL, '2026-07-07 01:26:12.433222', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs', NULL, 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(337, '2026-07-07 01:26:44.017862', 'system', NULL, NULL, '2026-07-07 01:26:44.026514', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":13,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%\"},\"at\":\"2026-07-06T18:26:39.974281Z\"}', 'POST', NULL, '/send', '13', 'NotificationMessage', NULL),
(338, '2026-07-07 01:26:47.822137', 'system', NULL, NULL, '2026-07-07 01:26:47.822137', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":14,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%\"},\"at\":\"2026-07-06T18:26:47.796656700Z\"}', 'POST', NULL, '/send', '14', 'NotificationMessage', NULL),
(339, '2026-07-07 01:48:26.510584', 'system', NULL, NULL, '2026-07-07 01:48:26.527864', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":15,\"channel\":\"BOTH\",\"recipientMasked\":\"****.com\",\"subject\":\"ádfasd\"},\"at\":\"2026-07-06T18:48:25.260574400Z\"}', 'POST', NULL, '/send', '15', 'NotificationMessage', NULL),
(340, '2026-07-07 01:54:38.491985', NULL, NULL, NULL, '2026-07-07 01:54:38.511960', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(341, '2026-07-07 02:06:43.856648', NULL, NULL, NULL, '2026-07-07 02:06:43.906791', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/chatbot/chat', NULL, 'Gateway', 'node'),
(342, '2026-07-07 02:17:31.553305', NULL, NULL, NULL, '2026-07-07 02:17:31.570034', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/10/view', '10', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(343, '2026-07-07 02:24:55.941519', NULL, NULL, NULL, '2026-07-07 02:24:55.954916', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/8/view', '8', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(344, '2026-07-07 02:36:16.738174', NULL, NULL, NULL, '2026-07-07 02:36:16.748201', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/6/view', '6', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(345, '2026-07-07 02:36:31.393918', 'system', NULL, NULL, '2026-07-07 02:36:31.400435', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":6,\"quantity\":1,\"variantId\":61,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T19:36:30.710402200Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(346, '2026-07-07 02:47:01.635070', NULL, NULL, NULL, '2026-07-07 02:47:01.655164', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(347, '2026-07-07 02:47:10.101508', 'admin', NULL, NULL, '2026-07-07 02:47:10.101508', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":4,\"orderNumber\":\"DH2607070247-2131-DEAA30\",\"userId\":15,\"total\":\"8500000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T19:47:07.992627100Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '4', 'Order', NULL),
(348, '2026-07-07 02:47:12.079067', 'system', NULL, NULL, '2026-07-07 02:47:12.079067', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":6,\"variantId\":61,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T19:47:11.913850900Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(349, '2026-07-07 02:48:36.285027', NULL, NULL, NULL, '2026-07-07 02:48:36.296301', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/8/view', '8', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(350, '2026-07-07 02:53:03.223642', 'admin', NULL, NULL, '2026-07-07 02:53:03.228608', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/admin/products/1/unhide', '1', 'Product', 'node'),
(351, '2026-07-07 02:53:06.307874', 'admin', NULL, NULL, '2026-07-07 02:53:06.307874', 'admin', 'PRODUCT_UNHIDE', '15', 'admin', '{\"schemaVersion\":2,\"resourceType\":\"Product\",\"productId\":1,\"before\":{\"productId\":1,\"productName\":\"iPhone 15 Pro Max\",\"discription\":\"Smartphone cao cấp nhất của Apple với khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ.\",\"categoryId\":1,\"price\":\"29000000.00\",\"availability\":1200,\"hidden\":true,\"sku\":\"SP-VIP-001\"},\"after\":{\"productId\":1,\"productName\":\"iPhone 15 Pro Max\",\"discription\":\"Smartphone cao cấp nhất của Apple với khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ.\",\"categoryId\":1,\"price\":\"29000000.00\",\"availability\":1200,\"hidden\":false,\"sku\":\"SP-VIP-001\"},\"newData\":{\"hidden\":false},\"at\":\"2026-07-06T19:53:02.941478500Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/admin/products/1/unhide', '1', 'Product', NULL),
(352, '2026-07-07 02:56:02.203016', NULL, NULL, NULL, '2026-07-07 02:56:02.211357', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/telegram/generate-token', NULL, 'Gateway', 'node'),
(353, '2026-07-07 02:57:20.040909', NULL, NULL, NULL, '2026-07-07 02:57:20.057451', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(354, '2026-07-07 02:57:42.670675', NULL, NULL, NULL, '2026-07-07 02:57:42.676155', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(355, '2026-07-07 02:57:47.255623', 'admin', NULL, NULL, '2026-07-07 02:57:47.255623', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":5,\"orderNumber\":\"DH2607070257-2131-42A4D0\",\"userId\":15,\"total\":\"24650000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T19:57:47.113776300Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '5', 'Order', NULL),
(356, '2026-07-07 02:57:49.195015', 'system', NULL, NULL, '2026-07-07 02:57:49.195015', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":1,\"variantId\":1,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T19:57:49.022894700Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(357, '2026-07-07 03:15:45.334680', 'admin', NULL, NULL, '2026-07-07 03:15:45.349319', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/7', '7', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(358, '2026-07-07 03:17:33.839117', NULL, NULL, NULL, '2026-07-07 03:17:33.845319', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(359, '2026-07-07 03:17:49.493795', NULL, NULL, NULL, '2026-07-07 03:17:49.500736', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(360, '2026-07-07 03:17:52.965492', NULL, NULL, NULL, '2026-07-07 03:17:52.965492', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(361, '2026-07-07 03:18:05.090519', 'admin', NULL, NULL, '2026-07-07 03:18:05.099872', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":6,\"orderNumber\":\"DH2607070317-2131-9482EA\",\"userId\":15,\"total\":\"24650000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T20:18:01.087854400Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '6', 'Order', NULL),
(362, '2026-07-07 03:19:48.117413', NULL, NULL, NULL, '2026-07-07 03:19:48.123430', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(363, '2026-07-07 03:19:50.447634', NULL, NULL, NULL, '2026-07-07 03:19:50.447634', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(364, '2026-07-07 03:19:51.940332', 'admin', NULL, NULL, '2026-07-07 03:19:51.941574', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":7,\"orderNumber\":\"DH2607070319-2131-4E97AB\",\"userId\":15,\"total\":\"24650000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T20:19:51.883499200Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '7', 'Order', NULL),
(365, '2026-07-07 03:19:53.299988', 'system', NULL, NULL, '2026-07-07 03:19:53.299988', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":1,\"variantId\":1,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T20:19:53.047177600Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(366, '2026-07-07 03:21:21.318688', NULL, NULL, NULL, '2026-07-07 03:21:21.340920', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(367, '2026-07-07 03:27:16.178040', NULL, NULL, NULL, '2026-07-07 03:27:16.186044', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(368, '2026-07-07 03:27:49.475868', NULL, NULL, NULL, '2026-07-07 03:27:49.480689', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(369, '2026-07-07 03:27:51.753998', NULL, NULL, NULL, '2026-07-07 03:27:51.753998', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(370, '2026-07-07 03:27:53.189691', 'admin', NULL, NULL, '2026-07-07 03:27:53.189691', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":8,\"orderNumber\":\"DH2607070327-2131-8349BF\",\"userId\":15,\"total\":\"24650000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T20:27:53.152827400Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '8', 'Order', NULL),
(371, '2026-07-07 03:27:54.067701', 'system', NULL, NULL, '2026-07-07 03:27:54.067701', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":1,\"variantId\":1,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T20:27:53.835512400Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(372, '2026-07-07 03:33:24.303982', NULL, NULL, NULL, '2026-07-07 03:33:24.319930', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(373, '2026-07-07 03:45:30.468798', NULL, NULL, NULL, '2026-07-07 03:45:30.475192', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(374, '2026-07-07 03:45:32.944783', NULL, NULL, NULL, '2026-07-07 03:45:32.944783', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(375, '2026-07-07 03:45:34.205190', 'admin', NULL, NULL, '2026-07-07 03:45:34.205190', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":9,\"orderNumber\":\"DH2607070345-2131-40A869\",\"userId\":15,\"total\":\"24650000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T20:45:34.160733100Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '9', 'Order', NULL),
(376, '2026-07-07 03:45:35.351010', 'system', NULL, NULL, '2026-07-07 03:45:35.351010', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":1,\"variantId\":1,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T20:45:35.083219800Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(377, '2026-07-07 03:58:55.216160', NULL, NULL, NULL, '2026-07-07 03:58:55.216160', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(378, '2026-07-07 03:59:25.332494', NULL, NULL, NULL, '2026-07-07 03:59:25.340525', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(379, '2026-07-07 03:59:31.408969', 'admin', NULL, NULL, '2026-07-07 03:59:31.408969', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":10,\"orderNumber\":\"DH2607070359-2131-6EEE73\",\"userId\":15,\"total\":\"29000000.00\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T20:59:29.650850300Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '10', 'Order', NULL),
(380, '2026-07-07 03:59:31.729756', NULL, NULL, NULL, '2026-07-07 03:59:31.729756', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=1&variantId=1\"}', 'DELETE', '0:0:0:0:0:0:0:1', '/api/shop/cart', NULL, 'Cart', 'node'),
(381, '2026-07-07 04:12:03.611414', NULL, NULL, NULL, '2026-07-07 04:12:03.612425', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(382, '2026-07-07 04:12:03.611414', NULL, NULL, NULL, '2026-07-07 04:12:03.612425', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=1&quantity=1&variantId=1\"}', 'POST', '0:0:0:0:0:0:0:1', '/api/shop/cart', NULL, 'Cart', 'node'),
(383, '2026-07-07 04:12:23.944399', NULL, NULL, NULL, '2026-07-07 04:12:23.951406', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(384, '2026-07-07 04:12:40.715392', NULL, NULL, NULL, '2026-07-07 04:12:40.716700', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(385, '2026-07-07 04:12:41.930698', NULL, NULL, NULL, '2026-07-07 04:12:41.930698', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(386, '2026-07-07 04:12:50.113699', 'admin', NULL, NULL, '2026-07-07 04:12:50.113699', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":11,\"orderNumber\":\"DH2607070412-2131-06A949\",\"userId\":15,\"total\":\"29000000.00\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T21:12:47.443400700Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '11', 'Order', NULL),
(387, '2026-07-07 04:12:50.383855', NULL, NULL, NULL, '2026-07-07 04:12:50.383855', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=1&variantId=1\"}', 'DELETE', '0:0:0:0:0:0:0:1', '/api/shop/cart', NULL, 'Cart', 'node'),
(388, '2026-07-07 04:13:44.465724', NULL, NULL, NULL, '2026-07-07 04:13:44.477985', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/6/view', '6', 'Product', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'),
(389, '2026-07-07 04:14:15.161328', NULL, NULL, NULL, '2026-07-07 04:14:15.165183', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/telegram/generate-token', NULL, 'Gateway', 'node'),
(390, '2026-07-07 04:15:06.177716', NULL, NULL, NULL, '2026-07-07 04:15:06.183174', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(391, '2026-07-07 04:15:07.623375', NULL, NULL, NULL, '2026-07-07 04:15:07.623375', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(392, '2026-07-07 04:15:27.015610', NULL, NULL, NULL, '2026-07-07 04:15:27.024801', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/sales/vouchers/validate', NULL, 'Gateway', 'node'),
(393, '2026-07-07 04:15:32.448940', NULL, NULL, NULL, '2026-07-07 04:15:32.448940', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(394, '2026-07-07 04:15:34.187902', NULL, NULL, NULL, '2026-07-07 04:15:34.187902', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(395, '2026-07-07 04:15:34.998176', 'admin', NULL, NULL, '2026-07-07 04:15:34.998176', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":12,\"orderNumber\":\"DH2607070415-2131-78CB86\",\"userId\":15,\"total\":\"8000000.000000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T21:15:34.970529100Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '12', 'Order', NULL),
(396, '2026-07-07 04:15:35.272111', NULL, NULL, NULL, '2026-07-07 04:15:35.273110', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=6&variantId=61\"}', 'DELETE', '0:0:0:0:0:0:0:1', '/api/shop/cart', NULL, 'Cart', 'node'),
(397, '2026-07-07 04:16:35.932090', 'admin', NULL, NULL, '2026-07-07 04:16:35.935896', 'admin', 'GATEWAY_REQUEST', '15', 'admin', NULL, 'PUT', '0:0:0:0:0:0:0:1', '/api/sales/admin/sales/programs/7', '7', 'Gateway', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(398, '2026-07-07 04:17:10.483131', 'system', NULL, NULL, '2026-07-07 04:17:10.485137', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":16,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%\"},\"at\":\"2026-07-06T21:17:00.356916Z\"}', 'POST', NULL, '/send', '16', 'NotificationMessage', NULL),
(399, '2026-07-07 04:17:14.683990', 'system', NULL, NULL, '2026-07-07 04:17:14.683990', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":17,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%\"},\"at\":\"2026-07-06T21:17:14.660481300Z\"}', 'POST', NULL, '/send', '17', 'NotificationMessage', NULL),
(400, '2026-07-07 04:18:47.037168', NULL, NULL, NULL, '2026-07-07 04:18:47.048763', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(401, '2026-07-07 04:19:06.619950', NULL, NULL, NULL, '2026-07-07 04:19:06.621351', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(402, '2026-07-07 04:19:07.268802', NULL, NULL, NULL, '2026-07-07 04:19:07.268802', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(403, '2026-07-07 04:19:08.693036', 'admin', NULL, NULL, '2026-07-07 04:19:08.693036', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":13,\"orderNumber\":\"DH2607070419-2131-84AFD1\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T21:19:08.659031900Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '13', 'Order', NULL),
(404, '2026-07-07 04:19:13.861215', 'system', NULL, NULL, '2026-07-07 04:19:13.861215', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":18,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070419-2131-84AFD1 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T21:19:13.671539800Z\"}', 'POST', NULL, '/send', '18', 'NotificationMessage', NULL),
(405, '2026-07-07 04:19:20.663225', 'system', NULL, NULL, '2026-07-07 04:19:20.663225', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":2,\"orderId\":13,\"amount\":\"2000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-658796a4dc0f4e57\"},\"at\":\"2026-07-06T21:19:18.649851500Z\"}', 'POST', NULL, '/create', '2', 'Payment', NULL),
(406, '2026-07-07 04:31:24.492348', 'system', NULL, NULL, '2026-07-07 04:31:24.495422', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":3,\"orderId\":9999,\"amount\":\"50000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-4584bb585fe74865\"},\"at\":\"2026-07-06T21:31:23.628526800Z\"}', 'POST', NULL, '/create', '3', 'Payment', NULL),
(407, '2026-07-07 04:31:29.312985', 'system', NULL, NULL, '2026-07-07 04:31:29.312985', 'system', 'PAYMENT_COMPLETE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":3,\"orderId\":9999,\"amount\":\"50000.0000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"COMPLETED\",\"transactionRef\":\"TEST_UI_CLICK\"},\"at\":\"2026-07-06T21:31:29.288599100Z\"}', 'POST', NULL, '/3/complete', '3', 'Payment', NULL),
(408, '2026-07-07 04:36:03.443539', 'system', NULL, NULL, '2026-07-07 04:36:03.448005', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":4,\"orderId\":13,\"amount\":\"2000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-b8bdb871016541b2\"},\"at\":\"2026-07-06T21:36:03.058638700Z\"}', 'POST', NULL, '/create', '4', 'Payment', NULL),
(409, '2026-07-07 04:36:18.202330', 'system', NULL, NULL, '2026-07-07 04:36:18.202330', 'system', 'PAYMENT_COMPLETE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":4,\"orderId\":13,\"amount\":\"2000.0000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"COMPLETED\",\"transactionRef\":\"682ITC1261885649\"},\"at\":\"2026-07-06T21:36:18.192298600Z\"}', 'POST', NULL, '/4/complete', '4', 'Payment', NULL),
(410, '2026-07-07 04:39:49.574527', NULL, NULL, NULL, '2026-07-07 04:39:49.596887', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(411, '2026-07-07 04:40:03.188928', NULL, NULL, NULL, '2026-07-07 04:40:03.188928', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(412, '2026-07-07 04:40:06.860853', NULL, NULL, NULL, '2026-07-07 04:40:06.860853', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(413, '2026-07-07 04:40:07.748933', 'admin', NULL, NULL, '2026-07-07 04:40:07.748933', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":14,\"orderNumber\":\"DH2607070440-2131-0564D6\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T21:40:07.717698900Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '14', 'Order', NULL),
(414, '2026-07-07 04:40:09.005012', 'system', NULL, NULL, '2026-07-07 04:40:09.005012', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":5,\"orderId\":14,\"amount\":\"2000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-cbcbb6cc5d694b2a\"},\"at\":\"2026-07-06T21:40:08.765597400Z\"}', 'POST', NULL, '/create', '5', 'Payment', NULL),
(415, '2026-07-07 04:40:14.099248', 'system', NULL, NULL, '2026-07-07 04:40:14.099248', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":19,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070440-2131-0564D6 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T21:40:13.860132900Z\"}', 'POST', NULL, '/send', '19', 'NotificationMessage', NULL),
(416, '2026-07-07 04:40:35.368906', 'system', NULL, NULL, '2026-07-07 04:40:35.368906', 'system', 'PAYMENT_COMPLETE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":5,\"orderId\":14,\"amount\":\"2000.0000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"COMPLETED\",\"transactionRef\":\"682ITC1261885689\"},\"at\":\"2026-07-06T21:40:34.612861400Z\"}', 'POST', NULL, '/5/complete', '5', 'Payment', NULL),
(417, '2026-07-07 04:40:37.685755', NULL, NULL, NULL, '2026-07-07 04:40:37.685755', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=1&variantId=1\"}', 'DELETE', '0:0:0:0:0:0:0:1', '/api/shop/cart', NULL, 'Cart', 'node'),
(418, '2026-07-07 04:45:15.468739', 'system', NULL, NULL, '2026-07-07 04:45:15.471739', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":6,\"orderId\":14,\"amount\":\"2000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-bd8398f8f6b1441e\"},\"at\":\"2026-07-06T21:45:14.997758900Z\"}', 'POST', NULL, '/create', '6', 'Payment', NULL),
(419, '2026-07-07 04:59:13.986756', 'KokokoVN', NULL, NULL, '2026-07-07 04:59:13.986756', 'KokokoVN', 'ORDER_STATUS_UPDATE', NULL, 'KokokoVN', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CONFIRMED\",\"paymentStatus\":\"PAID\",\"paymentMethod\":\"SEPAY\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVDDF19F1DA27\",\"estimatedDeliveryDate\":\"2026-07-11\"},\"at\":\"2026-07-06T21:59:10.255732700Z\",\"actorUsername\":\"KokokoVN\"}', 'PATCH', NULL, '/orders/14/status', '14', 'Order', NULL),
(420, '2026-07-07 04:59:27.076444', 'system', NULL, NULL, '2026-07-07 04:59:27.076444', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":20,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070440-2131-0564D6 đã được xác nhận\"},\"at\":\"2026-07-06T21:59:25.039969300Z\"}', 'POST', NULL, '/send', '20', 'NotificationMessage', NULL),
(421, '2026-07-07 05:09:07.870093', NULL, NULL, NULL, '2026-07-07 05:09:07.930534', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/8/view', '8', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(422, '2026-07-07 05:09:21.304728', NULL, NULL, NULL, '2026-07-07 05:09:21.304728', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=8&quantity=1&variantId=85\"}', 'POST', '0:0:0:0:0:0:0:1', '/api/shop/cart', NULL, 'Cart', 'node'),
(423, '2026-07-07 05:13:22.316027', 'system', NULL, NULL, '2026-07-07 05:13:22.319914', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":8,\"quantity\":1,\"variantId\":85,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T22:13:18.885614200Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(424, '2026-07-07 05:15:46.134425', NULL, NULL, NULL, '2026-07-07 05:15:46.139449', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/8/view', '8', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(425, '2026-07-07 05:17:41.520208', NULL, NULL, NULL, '2026-07-07 05:17:41.523512', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/catalog/products/4/view', '4', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(426, '2026-07-07 05:17:43.858294', 'system', NULL, NULL, '2026-07-07 05:17:43.858294', 'system', 'CART_ITEM_UPSERT', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":4,\"quantity\":1,\"variantId\":37,\"variantLabel\":null,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T22:17:43.700554Z\"}', 'POST', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(427, '2026-07-07 05:18:17.134310', NULL, NULL, NULL, '2026-07-07 05:18:17.135892', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '0:0:0:0:0:0:0:1', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(428, '2026-07-07 05:18:18.217776', NULL, NULL, NULL, '2026-07-07 05:18:18.217776', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(429, '2026-07-07 05:18:25.173760', NULL, NULL, NULL, '2026-07-07 05:18:25.173760', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(430, '2026-07-07 05:18:26.382243', 'admin', NULL, NULL, '2026-07-07 05:18:26.382243', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":15,\"orderNumber\":\"DH2607070518-2131-BA09E2\",\"userId\":15,\"total\":\"45002000.0000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":2},\"at\":\"2026-07-06T22:18:26.329215600Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '15', 'Order', NULL),
(431, '2026-07-07 05:18:27.355412', 'system', NULL, NULL, '2026-07-07 05:18:27.355412', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":4,\"variantId\":37,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T22:18:27.331403600Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(432, '2026-07-07 05:18:27.658716', 'system', NULL, NULL, '2026-07-07 05:18:27.658716', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":8,\"variantId\":85,\"cartKeySuffix\":\"ser:15\"},\"at\":\"2026-07-06T22:18:27.641709200Z\"}', 'DELETE', NULL, '/cart', 'cart:user:15', 'Cart', NULL),
(433, '2026-07-07 05:18:58.407567', 'KokokoVN', NULL, NULL, '2026-07-07 05:18:58.413087', 'KokokoVN', 'ORDER_STATUS_UPDATE', NULL, 'KokokoVN', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CONFIRMED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVD0AF5F68CD8\",\"estimatedDeliveryDate\":\"2026-07-11\"},\"at\":\"2026-07-06T22:18:56.570624100Z\",\"actorUsername\":\"KokokoVN\"}', 'PATCH', NULL, '/orders/15/status', '15', 'Order', NULL),
(434, '2026-07-07 05:19:14.140588', 'KokokoVN', NULL, NULL, '2026-07-07 05:19:14.148091', 'KokokoVN', 'ORDER_STATUS_UPDATE', NULL, 'KokokoVN', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CONFIRMED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVD0AF5F68CD8\",\"estimatedDeliveryDate\":\"2026-07-11\"},\"at\":\"2026-07-06T22:19:11.462988100Z\",\"actorUsername\":\"KokokoVN\"}', 'PATCH', NULL, '/orders/15/status', '15', 'Order', NULL),
(435, '2026-07-07 05:19:59.553253', 'system', NULL, NULL, '2026-07-07 05:19:59.566787', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":22,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070518-2131-BA09E2 đã được xác nhận\"},\"at\":\"2026-07-06T22:19:44.645035700Z\"}', 'POST', NULL, '/send', '22', 'NotificationMessage', NULL),
(436, '2026-07-07 05:19:59.559765', 'system', NULL, NULL, '2026-07-07 05:19:59.570321', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":21,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070518-2131-BA09E2 đã được xác nhận\"},\"at\":\"2026-07-06T22:19:44.648037200Z\"}', 'POST', NULL, '/send', '21', 'NotificationMessage', NULL),
(437, '2026-07-07 05:20:33.568137', 'KokokoVN', NULL, NULL, '2026-07-07 05:20:33.578696', 'KokokoVN', 'ORDER_STATUS_UPDATE', NULL, 'KokokoVN', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"status\":\"CONFIRMED\",\"paymentStatus\":\"PAID\",\"paymentMethod\":\"SEPAY\",\"shippingAddress\":\"1312313123, Xã Thái Bình, Tỉnh Tuyên Quang\",\"mvd\":\"MVD9225255246\",\"estimatedDeliveryDate\":\"2026-07-11\"},\"at\":\"2026-07-06T22:20:32.127357400Z\",\"actorUsername\":\"KokokoVN\"}', 'PATCH', NULL, '/orders/13/status', '13', 'Order', NULL),
(438, '2026-07-07 05:20:45.731256', 'system', NULL, NULL, '2026-07-07 05:20:45.731256', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":23,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070419-2131-84AFD1 đã được xác nhận\"},\"at\":\"2026-07-06T22:20:45.534454500Z\"}', 'POST', NULL, '/send', '23', 'NotificationMessage', NULL),
(439, '2026-07-07 06:32:03.794608', NULL, NULL, NULL, '2026-07-07 06:32:03.795608', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '2402:800:6f5f:4a39:3cbb:1c4b:dd20:7c3f', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(440, '2026-07-07 06:32:24.268393', NULL, NULL, NULL, '2026-07-07 06:32:24.268393', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(441, '2026-07-07 06:32:25.285859', NULL, NULL, NULL, '2026-07-07 06:32:25.285859', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(442, '2026-07-07 06:32:30.529281', 'admin', NULL, NULL, '2026-07-07 06:32:30.529281', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":16,\"orderNumber\":\"DH2607070632-2131-BFFC5B\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:32:29.213927800Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '16', 'Order', NULL),
(443, '2026-07-07 06:32:39.359959', 'system', NULL, NULL, '2026-07-07 06:32:39.359959', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":30,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070632-2131-BFFC5B — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:32:38.421230300Z\"}', 'POST', NULL, '/send', '30', 'NotificationMessage', NULL),
(444, '2026-07-07 06:32:40.139936', NULL, NULL, NULL, '2026-07-07 06:32:40.139936', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(445, '2026-07-07 06:32:40.333346', NULL, NULL, NULL, '2026-07-07 06:32:40.333346', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29');
INSERT INTO `web_activities` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `action`, `actor_user_id`, `actor_username`, `detail_json`, `http_method`, `ip_address`, `request_path`, `resource_id`, `resource_type`, `user_agent`) VALUES
(446, '2026-07-07 06:32:40.559364', 'admin', NULL, NULL, '2026-07-07 06:32:40.559364', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":17,\"orderNumber\":\"DH2607070632-2131-5D0654\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:32:40.544554700Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '17', 'Order', NULL),
(447, '2026-07-07 06:32:46.351325', 'system', NULL, NULL, '2026-07-07 06:32:46.351325', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":31,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070632-2131-5D0654 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:32:46.332230500Z\"}', 'POST', NULL, '/send', '31', 'NotificationMessage', NULL),
(448, '2026-07-07 06:32:46.622242', NULL, NULL, NULL, '2026-07-07 06:32:46.622242', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(449, '2026-07-07 06:32:46.797731', NULL, NULL, NULL, '2026-07-07 06:32:46.797731', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(450, '2026-07-07 06:32:46.914034', 'admin', NULL, NULL, '2026-07-07 06:32:46.914034', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":18,\"orderNumber\":\"DH2607070632-2131-F8A3B5\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:32:46.907034700Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '18', 'Order', NULL),
(451, '2026-07-07 06:32:57.512940', NULL, NULL, NULL, '2026-07-07 06:32:57.513937', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(452, '2026-07-07 06:32:58.150604', NULL, NULL, NULL, '2026-07-07 06:32:58.150604', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(453, '2026-07-07 06:32:58.590851', 'admin', NULL, NULL, '2026-07-07 06:32:58.590851', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":19,\"orderNumber\":\"DH2607070632-2131-A9473F\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"CREATED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"COD\",\"itemCount\":1},\"at\":\"2026-07-06T23:32:58.575737200Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '19', 'Order', NULL),
(454, '2026-07-07 06:32:58.818719', 'system', NULL, NULL, '2026-07-07 06:32:58.818719', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":32,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070632-2131-F8A3B5 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:32:58.727730100Z\"}', 'POST', NULL, '/send', '32', 'NotificationMessage', NULL),
(455, '2026-07-07 06:32:59.466491', NULL, NULL, NULL, '2026-07-07 06:32:59.466491', NULL, 'GATEWAY_REQUEST', NULL, NULL, '{\"query\":\"productId=1&variantId=1\"}', 'DELETE', '34.207.130.51', '/api/shop/cart', NULL, 'Cart', 'node'),
(456, '2026-07-07 06:33:05.439553', 'system', NULL, NULL, '2026-07-07 06:33:05.439553', 'system', 'CART_ITEM_REMOVE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"cart-service\",\"resourceType\":\"Cart\",\"after\":{\"productId\":1,\"variantId\":1,\"cartKeySuffix\":\"A29921\"},\"at\":\"2026-07-06T23:33:00.542884600Z\"}', 'DELETE', NULL, '/cart', '09D4DB2FF6176BD7E0113DE456A29921', 'Cart', NULL),
(457, '2026-07-07 06:33:06.569436', NULL, NULL, NULL, '2026-07-07 06:33:06.569436', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/payments/order/19/reconcile-paid', '19', 'Gateway', 'node'),
(458, '2026-07-07 06:33:22.241893', NULL, NULL, NULL, '2026-07-07 06:33:22.241893', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/payments/order/19/reconcile-paid', '19', 'Gateway', 'node'),
(459, '2026-07-07 06:33:22.921846', NULL, NULL, NULL, '2026-07-07 06:33:22.921846', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/payments/order/19/reconcile-paid', '19', 'Gateway', 'node'),
(460, '2026-07-07 06:34:47.784087', NULL, NULL, NULL, '2026-07-07 06:34:47.789087', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '2402:800:6f5f:4a39:3cbb:1c4b:dd20:7c3f', '/api/catalog/products/4/view', '4', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(461, '2026-07-07 06:34:53.426648', NULL, NULL, NULL, '2026-07-07 06:34:53.426648', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(462, '2026-07-07 06:34:53.651248', NULL, NULL, NULL, '2026-07-07 06:34:53.651248', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(463, '2026-07-07 06:34:54.361012', 'admin', NULL, NULL, '2026-07-07 06:34:54.361012', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":20,\"orderNumber\":\"DH2607070634-2131-BEC443\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:34:54.337592700Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '20', 'Order', NULL),
(464, '2026-07-07 06:34:59.237250', 'system', NULL, NULL, '2026-07-07 06:34:59.237250', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":33,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070634-2131-BEC443 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:34:59.214527500Z\"}', 'POST', NULL, '/send', '33', 'NotificationMessage', NULL),
(465, '2026-07-07 06:35:19.139866', NULL, NULL, NULL, '2026-07-07 06:35:19.139866', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(466, '2026-07-07 06:35:19.274829', NULL, NULL, NULL, '2026-07-07 06:35:19.274829', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(467, '2026-07-07 06:35:19.420391', 'admin', NULL, NULL, '2026-07-07 06:35:19.420391', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":21,\"orderNumber\":\"DH2607070635-2131-ECA605\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:35:19.414862300Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '21', 'Order', NULL),
(468, '2026-07-07 06:35:22.959764', 'system', NULL, NULL, '2026-07-07 06:35:22.959764', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":34,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070635-2131-ECA605 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:35:22.949983900Z\"}', 'POST', NULL, '/send', '34', 'NotificationMessage', NULL),
(469, '2026-07-07 06:35:30.806680', NULL, NULL, NULL, '2026-07-07 06:35:30.806680', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(470, '2026-07-07 06:35:31.112382', NULL, NULL, NULL, '2026-07-07 06:35:31.112382', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(471, '2026-07-07 06:35:31.516196', 'admin', NULL, NULL, '2026-07-07 06:35:31.516196', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":22,\"orderNumber\":\"DH2607070635-2131-B6225D\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:35:31.504338200Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '22', 'Order', NULL),
(472, '2026-07-07 06:35:36.330227', 'system', NULL, NULL, '2026-07-07 06:35:36.330227', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":35,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070635-2131-B6225D — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:35:36.272638400Z\"}', 'POST', NULL, '/send', '35', 'NotificationMessage', NULL),
(473, '2026-07-07 06:37:11.405789', NULL, NULL, NULL, '2026-07-07 06:37:11.407787', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '34.207.130.51', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(474, '2026-07-07 06:37:13.134593', NULL, NULL, NULL, '2026-07-07 06:37:13.134593', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(475, '2026-07-07 06:37:13.913118', 'admin', NULL, NULL, '2026-07-07 06:37:13.913118', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":23,\"orderNumber\":\"DH2607070637-2131-867B68\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:37:13.843585500Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '23', 'Order', NULL),
(476, '2026-07-07 06:37:18.177620', 'system', NULL, NULL, '2026-07-07 06:37:18.177620', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":36,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070637-2131-867B68 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:37:18.094745200Z\"}', 'POST', NULL, '/send', '36', 'NotificationMessage', NULL),
(477, '2026-07-07 06:47:32.815506', NULL, NULL, NULL, '2026-07-07 06:47:32.815506', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(478, '2026-07-07 06:47:32.815506', NULL, NULL, NULL, '2026-07-07 06:47:32.815506', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '98.80.144.45', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(479, '2026-07-07 06:47:37.108893', 'admin', NULL, NULL, '2026-07-07 06:47:37.108893', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":24,\"orderNumber\":\"DH2607070647-2131-2F743C\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:47:35.882467Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '24', 'Order', NULL),
(480, '2026-07-07 06:47:45.339975', 'system', NULL, NULL, '2026-07-07 06:47:45.339975', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":37,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070647-2131-2F743C — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:47:44.293679Z\"}', 'POST', NULL, '/send', '37', 'NotificationMessage', NULL),
(481, '2026-07-07 06:50:24.370011', NULL, NULL, NULL, '2026-07-07 06:50:24.371294', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '54.89.87.159', '/api/chatbot/chat', NULL, 'Gateway', 'node'),
(482, '2026-07-07 06:52:48.288633', NULL, NULL, NULL, '2026-07-07 06:52:48.290630', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '2402:800:6f5f:4a39:3cbb:1c4b:dd20:7c3f', '/api/catalog/products/1/view', '1', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(483, '2026-07-07 06:53:14.723592', NULL, NULL, NULL, '2026-07-07 06:53:14.723592', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '3.237.23.183', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(484, '2026-07-07 06:53:15.007899', NULL, NULL, NULL, '2026-07-07 06:53:15.007899', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(485, '2026-07-07 06:53:16.154097', 'admin', NULL, NULL, '2026-07-07 06:53:16.154097', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":25,\"orderNumber\":\"DH2607070653-2131-98C99C\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:53:16.102358Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '25', 'Order', NULL),
(486, '2026-07-07 06:53:22.870473', 'system', NULL, NULL, '2026-07-07 06:53:22.870473', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":38,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070653-2131-98C99C — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:53:22.805272600Z\"}', 'POST', NULL, '/send', '38', 'NotificationMessage', NULL),
(487, '2026-07-07 06:57:04.816324', NULL, NULL, NULL, '2026-07-07 06:57:04.820727', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '2402:800:6f5f:4a39:3cbb:1c4b:dd20:7c3f', '/api/catalog/products/8/view', '8', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(488, '2026-07-07 06:57:10.266722', NULL, NULL, NULL, '2026-07-07 06:57:10.266722', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '100.48.58.48', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(489, '2026-07-07 06:57:10.747779', NULL, NULL, NULL, '2026-07-07 06:57:10.747779', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(490, '2026-07-07 06:57:11.232684', 'admin', NULL, NULL, '2026-07-07 06:57:11.232684', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":26,\"orderNumber\":\"DH2607070657-2131-A909F5\",\"userId\":15,\"total\":\"45000000.00\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:57:11.208451800Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '26', 'Order', NULL),
(491, '2026-07-07 06:57:22.427569', 'system', NULL, NULL, '2026-07-07 06:57:22.427569', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":39,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070657-2131-A909F5 — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:57:22.261891Z\"}', 'POST', NULL, '/send', '39', 'NotificationMessage', NULL),
(492, '2026-07-07 06:57:50.940039', NULL, NULL, NULL, '2026-07-07 06:57:50.941041', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '100.48.58.48', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(493, '2026-07-07 06:57:52.764283', NULL, NULL, NULL, '2026-07-07 06:57:52.764283', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(494, '2026-07-07 06:57:53.501024', 'admin', NULL, NULL, '2026-07-07 06:57:53.501024', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":27,\"orderNumber\":\"DH2607070657-2131-120E4E\",\"userId\":15,\"total\":\"45000000.00\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-06T23:57:53.459145Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '27', 'Order', NULL),
(495, '2026-07-07 06:57:59.179327', 'system', NULL, NULL, '2026-07-07 06:57:59.179327', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":40,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070657-2131-120E4E — thanh toán QR (SePay)\"},\"at\":\"2026-07-06T23:57:59.123976300Z\"}', 'POST', NULL, '/send', '40', 'NotificationMessage', NULL),
(496, '2026-07-07 07:00:37.267781', 'system', NULL, NULL, '2026-07-07 07:00:37.269161', 'system', 'PAYMENT_CREATE', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"payment-service\",\"resourceType\":\"Payment\",\"after\":{\"paymentId\":7,\"orderId\":45,\"amount\":\"200000\",\"currency\":\"VND\",\"method\":\"SEPAY\",\"status\":\"PENDING\",\"transactionRef\":\"TMP-785f6ed956da4d5a\"},\"at\":\"2026-07-07T00:00:34.877336400Z\"}', 'POST', NULL, '/create', '7', 'Payment', NULL),
(497, '2026-07-07 07:02:39.117570', NULL, NULL, NULL, '2026-07-07 07:02:39.121064', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '18.212.245.99', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(498, '2026-07-07 07:02:40.917046', NULL, NULL, NULL, '2026-07-07 07:02:40.917046', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(499, '2026-07-07 07:02:41.655396', 'admin', NULL, NULL, '2026-07-07 07:02:41.655396', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":28,\"orderNumber\":\"DH2607070702-2131-FB9777\",\"userId\":15,\"total\":\"45000000.00\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-07T00:02:41.625303600Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '28', 'Order', NULL),
(500, '2026-07-07 07:02:46.709506', 'system', NULL, NULL, '2026-07-07 07:02:46.709506', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":41,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070702-2131-FB9777 — thanh toán QR (SePay)\"},\"at\":\"2026-07-07T00:02:46.645215Z\"}', 'POST', NULL, '/send', '41', 'NotificationMessage', NULL),
(501, '2026-07-07 07:07:06.079035', NULL, NULL, NULL, '2026-07-07 07:07:06.099078', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '44.192.74.142', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(502, '2026-07-07 07:07:18.838877', NULL, NULL, NULL, '2026-07-07 07:07:18.858170', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(503, '2026-07-07 07:07:21.588600', 'admin', NULL, NULL, '2026-07-07 07:07:21.588600', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":29,\"orderNumber\":\"DH2607070707-2131-14AA2E\",\"userId\":15,\"total\":\"45000000.00\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-07T00:07:21.319794600Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '29', 'Order', NULL),
(504, '2026-07-07 07:07:35.336883', 'system', NULL, NULL, '2026-07-07 07:07:35.346484', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":42,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070707-2131-14AA2E — thanh toán QR (SePay)\"},\"at\":\"2026-07-07T00:07:33.062344100Z\"}', 'POST', NULL, '/send', '42', 'NotificationMessage', NULL),
(505, '2026-07-07 07:46:27.568794', NULL, NULL, NULL, '2026-07-07 07:46:27.568794', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '2001:ee0:264:f862:4cef:50aa:4511:944f', '/api/catalog/products/4/view', '4', 'Product', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36'),
(506, '2026-07-07 07:46:31.556142', NULL, NULL, NULL, '2026-07-07 07:46:31.556142', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '54.90.100.49', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(507, '2026-07-07 07:46:32.441667', NULL, NULL, NULL, '2026-07-07 07:46:32.441667', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(508, '2026-07-07 07:46:42.205234', 'admin', NULL, NULL, '2026-07-07 07:46:42.205234', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":30,\"orderNumber\":\"DH2607070746-2131-049829\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-07T00:46:40.135357400Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '30', 'Order', NULL),
(509, '2026-07-07 07:46:58.221533', NULL, NULL, NULL, '2026-07-07 07:46:58.221533', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '54.90.100.49', '/api/shop/orders/manual', NULL, 'Order', 'node'),
(510, '2026-07-07 07:46:58.370991', 'system', NULL, NULL, '2026-07-07 07:46:58.370991', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":43,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070746-2131-049829 — thanh toán QR (SePay)\"},\"at\":\"2026-07-07T00:46:54.152879800Z\"}', 'POST', NULL, '/send', '43', 'NotificationMessage', NULL),
(511, '2026-07-07 07:46:58.874374', NULL, NULL, NULL, '2026-07-07 07:46:58.874374', NULL, 'GATEWAY_REQUEST', NULL, NULL, NULL, 'POST', '127.0.0.1', '/api/inventory/admin/stock/outbound', NULL, 'Inventory', 'Java/11.0.29'),
(512, '2026-07-07 07:46:59.307281', 'admin', NULL, NULL, '2026-07-07 07:46:59.307281', 'admin', 'ORDER_MANUAL_CREATE', '15', 'admin', '{\"schemaVersion\":2,\"originatingService\":\"order-service\",\"resourceType\":\"Order\",\"after\":{\"orderId\":31,\"orderNumber\":\"DH2607070746-2131-3FE73C\",\"userId\":15,\"total\":\"2000.0000\",\"status\":\"PAYMENT_EXPECTED\",\"paymentStatus\":\"PENDING\",\"paymentMethod\":\"SEPAY\",\"itemCount\":1},\"at\":\"2026-07-07T00:46:59.279828900Z\",\"actorUsername\":\"admin\",\"actorUserId\":\"15\"}', 'POST', NULL, '/orders/manual', '31', 'Order', NULL),
(513, '2026-07-07 07:47:04.090109', 'system', NULL, NULL, '2026-07-07 07:47:04.090109', 'system', 'NOTIFICATION_SEND', NULL, NULL, '{\"schemaVersion\":2,\"originatingService\":\"notification-service\",\"resourceType\":\"NotificationMessage\",\"after\":{\"messageId\":44,\"channel\":\"EMAIL\",\"recipientMasked\":\"****.com\",\"subject\":\"Đơn hàng DH2607070746-2131-3FE73C — thanh toán QR (SePay)\"},\"at\":\"2026-07-07T00:47:04.059733800Z\"}', 'POST', NULL, '/send', '44', 'NotificationMessage', NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `web_activities`
--
ALTER TABLE `web_activities`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `web_activities`
--
ALTER TABLE `web_activities`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=514;
--
-- Cơ sở dữ liệu: `inventory`
--
CREATE DATABASE IF NOT EXISTS `inventory` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `inventory`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_balances`
--

CREATE TABLE `inventory_balances` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `quantity_on_hand` int NOT NULL,
  `variant_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory_balances`
--

INSERT INTO `inventory_balances` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `product_id`, `quantity_on_hand`, `variant_id`) VALUES
(1, '2026-07-02 16:34:18.723782', NULL, NULL, NULL, NULL, NULL, '2026-07-07 06:53:15.776177', 'admin', NULL, 1, 88, 1),
(2, '2026-07-02 16:34:19.081068', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.088292', 'admin', NULL, 1, 100, 2),
(3, '2026-07-02 16:34:19.135360', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.141625', 'admin', NULL, 1, 100, 3),
(4, '2026-07-02 16:34:19.184152', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.190992', 'admin', NULL, 1, 100, 4),
(5, '2026-07-02 16:34:19.233672', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.240295', 'admin', NULL, 1, 100, 5),
(6, '2026-07-02 16:34:19.279185', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.286130', 'admin', NULL, 1, 100, 6),
(7, '2026-07-02 16:34:19.320074', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.327294', 'admin', NULL, 1, 100, 7),
(8, '2026-07-02 16:34:19.367527', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.376690', 'admin', NULL, 1, 100, 8),
(9, '2026-07-02 16:34:19.419434', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.429360', 'admin', NULL, 1, 100, 9),
(10, '2026-07-02 16:34:19.472347', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.478689', 'admin', NULL, 1, 100, 10),
(11, '2026-07-02 16:34:19.521139', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.527064', 'admin', NULL, 1, 100, 11),
(12, '2026-07-02 16:34:19.568792', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.576209', 'admin', NULL, 1, 100, 12),
(13, '2026-07-02 16:34:19.614096', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.619820', 'admin', NULL, 2, 100, 13),
(14, '2026-07-02 16:34:19.655376', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.664013', 'admin', NULL, 2, 100, 14),
(15, '2026-07-02 16:34:19.705616', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.711693', 'admin', NULL, 2, 100, 15),
(16, '2026-07-02 16:34:19.747143', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.754346', 'admin', NULL, 2, 100, 16),
(17, '2026-07-02 16:34:19.789174', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.798063', 'admin', NULL, 2, 100, 17),
(18, '2026-07-02 16:34:19.948041', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.982049', 'admin', NULL, 2, 100, 18),
(19, '2026-07-02 16:34:20.027794', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.033814', 'admin', NULL, 2, 100, 19),
(20, '2026-07-02 16:34:20.074322', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.082441', 'admin', NULL, 2, 100, 20),
(21, '2026-07-02 16:34:20.117658', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.123699', 'admin', NULL, 2, 100, 21),
(22, '2026-07-02 16:34:20.166981', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.190735', 'admin', NULL, 2, 100, 22),
(23, '2026-07-02 16:34:20.228197', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.236132', 'admin', NULL, 2, 100, 23),
(24, '2026-07-02 16:34:20.276180', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.282909', 'admin', NULL, 2, 100, 24),
(25, '2026-07-02 16:34:20.332280', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.339648', 'admin', NULL, 3, 100, 25),
(26, '2026-07-02 16:34:20.393029', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.399179', 'admin', NULL, 3, 100, 26),
(27, '2026-07-02 16:34:20.436845', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.442287', 'admin', NULL, 3, 100, 27),
(28, '2026-07-02 16:34:20.476803', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.481660', 'admin', NULL, 3, 100, 28),
(29, '2026-07-02 16:34:20.526247', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.537909', 'admin', NULL, 3, 100, 29),
(30, '2026-07-02 16:34:20.588187', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.595897', 'admin', NULL, 3, 100, 30),
(31, '2026-07-02 16:34:20.637273', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.644161', 'admin', NULL, 3, 100, 31),
(32, '2026-07-02 16:34:20.682110', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.690162', 'admin', NULL, 3, 100, 32),
(33, '2026-07-02 16:34:20.759047', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.766256', 'admin', NULL, 3, 100, 33),
(34, '2026-07-02 16:34:20.814414', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.824825', 'admin', NULL, 3, 100, 34),
(35, '2026-07-02 16:34:20.857522', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.863061', 'admin', NULL, 3, 100, 35),
(36, '2026-07-02 16:34:20.915376', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.926686', 'admin', NULL, 3, 100, 36),
(37, '2026-07-02 16:34:20.971989', NULL, NULL, NULL, NULL, NULL, '2026-07-07 07:46:59.060896', 'admin', NULL, 4, 92, 37),
(38, '2026-07-02 16:34:21.014312', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.017589', 'admin', NULL, 4, 100, 38),
(39, '2026-07-02 16:34:21.047508', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.050637', 'admin', NULL, 4, 100, 39),
(40, '2026-07-02 16:34:21.074663', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.078883', 'admin', NULL, 4, 100, 40),
(41, '2026-07-02 16:34:21.132986', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.141208', 'admin', NULL, 4, 100, 41),
(42, '2026-07-02 16:34:21.234387', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.246158', 'admin', NULL, 4, 100, 42),
(43, '2026-07-02 16:34:21.371937', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.402905', 'admin', NULL, 4, 100, 43),
(44, '2026-07-02 16:34:21.551193', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.571031', 'admin', NULL, 4, 100, 44),
(45, '2026-07-02 16:34:21.721759', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.728591', 'admin', NULL, 4, 100, 45),
(46, '2026-07-02 16:34:21.802267', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.821658', 'admin', NULL, 4, 100, 46),
(47, '2026-07-02 16:34:21.880334', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.886719', 'admin', NULL, 4, 100, 47),
(48, '2026-07-02 16:34:21.922008', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.926179', 'admin', NULL, 4, 100, 48),
(49, '2026-07-02 16:34:21.956470', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.961263', 'admin', NULL, 5, 100, 49),
(50, '2026-07-02 16:34:21.992499', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.996681', 'admin', NULL, 5, 100, 50),
(51, '2026-07-02 16:34:22.029363', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.040432', 'admin', NULL, 5, 100, 51),
(52, '2026-07-02 16:34:22.083945', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.104469', 'admin', NULL, 5, 100, 52),
(53, '2026-07-02 16:34:22.222527', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.245126', 'admin', NULL, 5, 100, 53),
(54, '2026-07-02 16:34:22.308918', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.317104', 'admin', NULL, 5, 100, 54),
(55, '2026-07-02 16:34:22.411794', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.432101', 'admin', NULL, 5, 100, 55),
(56, '2026-07-02 16:34:22.513501', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.518358', 'admin', NULL, 5, 100, 56),
(57, '2026-07-02 16:34:22.555493', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.565339', 'admin', NULL, 5, 100, 57),
(58, '2026-07-02 16:34:22.642462', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.683275', 'admin', NULL, 5, 100, 58),
(59, '2026-07-02 16:34:22.774840', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.792385', 'admin', NULL, 5, 100, 59),
(60, '2026-07-02 16:34:22.848789', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.857854', 'admin', NULL, 5, 100, 60),
(61, '2026-07-02 16:34:23.019494', NULL, NULL, NULL, NULL, NULL, '2026-07-07 04:15:34.674714', 'admin', NULL, 6, 99, 61),
(62, '2026-07-02 16:34:23.100885', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.119943', 'admin', NULL, 6, 100, 62),
(63, '2026-07-02 16:34:23.183983', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.191751', 'admin', NULL, 6, 100, 63),
(64, '2026-07-02 16:34:23.312484', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.327968', 'admin', NULL, 6, 100, 64),
(65, '2026-07-02 16:34:23.448754', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.480159', 'admin', NULL, 6, 100, 65),
(66, '2026-07-02 16:34:23.558155', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.561803', 'admin', NULL, 6, 100, 66),
(67, '2026-07-02 16:34:23.596995', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.605026', 'admin', NULL, 6, 100, 67),
(68, '2026-07-02 16:34:23.668079', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.668079', 'admin', NULL, 6, 100, 68),
(69, '2026-07-02 16:34:23.732996', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.742105', 'admin', NULL, 6, 100, 69),
(70, '2026-07-02 16:34:23.924835', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.952672', 'admin', NULL, 6, 100, 70),
(71, '2026-07-02 16:34:24.015019', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.020693', 'admin', NULL, 6, 100, 71),
(72, '2026-07-02 16:34:24.068372', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.072777', 'admin', NULL, 6, 100, 72),
(73, '2026-07-02 16:34:24.119384', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.137721', 'admin', NULL, 7, 100, 73),
(74, '2026-07-02 16:34:24.229478', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.247096', 'admin', NULL, 7, 100, 74),
(75, '2026-07-02 16:34:24.310117', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.317115', 'admin', NULL, 7, 100, 75),
(76, '2026-07-02 16:34:24.363497', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.365512', 'admin', NULL, 7, 100, 76),
(77, '2026-07-02 16:34:24.398773', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.405492', 'admin', NULL, 7, 100, 77),
(78, '2026-07-02 16:34:24.447868', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.452954', 'admin', NULL, 7, 100, 78),
(79, '2026-07-02 16:34:24.481887', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.484699', 'admin', NULL, 7, 100, 79),
(80, '2026-07-02 16:34:24.517536', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.521567', 'admin', NULL, 7, 100, 80),
(81, '2026-07-02 16:34:24.568044', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.598774', 'admin', NULL, 7, 100, 81),
(82, '2026-07-02 16:34:24.633803', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.637831', 'admin', NULL, 7, 100, 82),
(83, '2026-07-02 16:34:24.669750', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.678012', 'admin', NULL, 7, 100, 83),
(84, '2026-07-02 16:34:24.710560', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.716181', 'admin', NULL, 7, 100, 84),
(85, '2026-07-02 16:34:24.753527', NULL, NULL, NULL, NULL, NULL, '2026-07-07 07:07:20.259086', 'admin', NULL, 8, 95, 85),
(86, '2026-07-02 16:34:24.787547', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.792081', 'admin', NULL, 8, 100, 86),
(87, '2026-07-02 16:34:24.824935', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.831846', 'admin', NULL, 8, 100, 87),
(88, '2026-07-02 16:34:24.865578', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.881295', 'admin', NULL, 8, 100, 88),
(89, '2026-07-02 16:34:24.944900', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.953989', 'admin', NULL, 8, 100, 89),
(90, '2026-07-02 16:34:25.008259', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.011898', 'admin', NULL, 8, 100, 90),
(91, '2026-07-02 16:34:25.054827', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.059480', 'admin', NULL, 8, 100, 91),
(92, '2026-07-02 16:34:25.081582', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.092246', 'admin', NULL, 8, 100, 92),
(93, '2026-07-02 16:34:25.121961', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.128007', 'admin', NULL, 8, 100, 93),
(94, '2026-07-02 16:34:25.159453', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.163467', 'admin', NULL, 8, 100, 94),
(95, '2026-07-02 16:34:25.192364', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.198387', 'admin', NULL, 8, 100, 95),
(96, '2026-07-02 16:34:25.229054', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.251338', 'admin', NULL, 8, 100, 96),
(97, '2026-07-02 16:34:25.306909', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.311939', 'admin', NULL, 9, 100, 97),
(98, '2026-07-02 16:34:25.367818', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.373830', 'admin', NULL, 9, 100, 98),
(99, '2026-07-02 16:34:25.423194', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.451813', 'admin', NULL, 9, 100, 99),
(100, '2026-07-02 16:34:25.497437', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.505376', 'admin', NULL, 9, 100, 100),
(101, '2026-07-02 16:34:25.544801', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.550983', 'admin', NULL, 9, 100, 101),
(102, '2026-07-02 16:34:25.567579', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.581689', 'admin', NULL, 9, 100, 102),
(103, '2026-07-02 16:34:25.598224', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.598224', 'admin', NULL, 9, 100, 103),
(104, '2026-07-02 16:34:25.642205', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.645155', 'admin', NULL, 9, 100, 104),
(105, '2026-07-02 16:34:25.675780', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.692099', 'admin', NULL, 9, 100, 105),
(106, '2026-07-02 16:34:25.732518', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.742123', 'admin', NULL, 9, 100, 106),
(107, '2026-07-02 16:34:25.786208', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.803645', 'admin', NULL, 9, 100, 107),
(108, '2026-07-02 16:34:25.851744', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.865764', 'admin', NULL, 9, 100, 108),
(109, '2026-07-02 16:34:25.900316', NULL, NULL, NULL, NULL, NULL, '2026-07-06 22:55:31.132638', 'admin', NULL, 10, 104, 109),
(110, '2026-07-02 16:34:25.950818', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.959982', 'admin', NULL, 10, 100, 110),
(111, '2026-07-02 16:34:26.007218', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.007218', 'admin', NULL, 10, 100, 111),
(112, '2026-07-02 16:34:26.057352', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.059361', 'admin', NULL, 10, 100, 112),
(113, '2026-07-02 16:34:26.092349', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.121372', 'admin', NULL, 10, 100, 113),
(114, '2026-07-02 16:34:26.159508', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.163744', 'admin', NULL, 10, 100, 114),
(115, '2026-07-02 16:34:26.219047', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.221051', 'admin', NULL, 10, 100, 115),
(116, '2026-07-02 16:34:26.258052', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.258052', 'admin', NULL, 10, 100, 116),
(117, '2026-07-02 16:34:26.285232', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.285232', 'admin', NULL, 10, 100, 117),
(118, '2026-07-02 16:34:26.315397', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.315397', 'admin', NULL, 10, 100, 118),
(119, '2026-07-02 16:34:26.342366', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.352742', 'admin', NULL, 10, 100, 119),
(120, '2026-07-02 16:34:26.406439', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.416800', 'admin', NULL, 10, 100, 120);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `balance_after` int DEFAULT NULL,
  `movement_at` datetime(6) DEFAULT NULL,
  `movement_type` varchar(16) NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `quantity` int NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `reference_type` varchar(64) DEFAULT NULL,
  `unit_cost` decimal(19,2) DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `balance_after`, `movement_at`, `movement_type`, `note`, `product_id`, `quantity`, `reference_id`, `reference_type`, `unit_cost`, `variant_id`) VALUES
(1, '2026-07-02 16:34:18.769412', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:18.769412', 'admin', NULL, 100, '2026-07-02 16:34:18.758319', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 20300000.00, 1),
(2, '2026-07-02 16:34:19.085426', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.085426', 'admin', NULL, 100, '2026-07-02 16:34:19.084369', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 20300000.00, 2),
(3, '2026-07-02 16:34:19.139133', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.139133', 'admin', NULL, 100, '2026-07-02 16:34:19.137090', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 20300000.00, 3),
(4, '2026-07-02 16:34:19.187367', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.187367', 'admin', NULL, 100, '2026-07-02 16:34:19.185748', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 20300000.00, 4),
(5, '2026-07-02 16:34:19.236306', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.236306', 'admin', NULL, 100, '2026-07-02 16:34:19.236306', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 22400000.00, 5),
(6, '2026-07-02 16:34:19.282247', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.282247', 'admin', NULL, 100, '2026-07-02 16:34:19.282247', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 22400000.00, 6),
(7, '2026-07-02 16:34:19.322807', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.322807', 'admin', NULL, 100, '2026-07-02 16:34:19.322807', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 22400000.00, 7),
(8, '2026-07-02 16:34:19.371062', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.371062', 'admin', NULL, 100, '2026-07-02 16:34:19.371062', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 22400000.00, 8),
(9, '2026-07-02 16:34:19.423185', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.423185', 'admin', NULL, 100, '2026-07-02 16:34:19.422680', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 24500000.00, 9),
(10, '2026-07-02 16:34:19.476102', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.476102', 'admin', NULL, 100, '2026-07-02 16:34:19.474496', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 24500000.00, 10),
(11, '2026-07-02 16:34:19.524326', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.524326', 'admin', NULL, 100, '2026-07-02 16:34:19.522315', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 24500000.00, 11),
(12, '2026-07-02 16:34:19.573001', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.573001', 'admin', NULL, 100, '2026-07-02 16:34:19.571762', 'INBOUND', 'Nhập kho khai trương', 1, 100, NULL, 'EXCEL_IMPORT', 24500000.00, 12),
(13, '2026-07-02 16:34:19.618184', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.618184', 'admin', NULL, 100, '2026-07-02 16:34:19.616580', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 13),
(14, '2026-07-02 16:34:19.660042', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.660042', 'admin', NULL, 100, '2026-07-02 16:34:19.658766', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 14),
(15, '2026-07-02 16:34:19.709309', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.709309', 'admin', NULL, 100, '2026-07-02 16:34:19.707617', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 15),
(16, '2026-07-02 16:34:19.749724', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.749724', 'admin', NULL, 100, '2026-07-02 16:34:19.749724', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 16),
(17, '2026-07-02 16:34:19.794621', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.794621', 'admin', NULL, 100, '2026-07-02 16:34:19.793674', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 17),
(18, '2026-07-02 16:34:19.967055', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.967055', 'admin', NULL, 100, '2026-07-02 16:34:19.964717', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 18),
(19, '2026-07-02 16:34:20.032197', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.032197', 'admin', NULL, 100, '2026-07-02 16:34:20.030622', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 19),
(20, '2026-07-02 16:34:20.079135', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.079135', 'admin', NULL, 100, '2026-07-02 16:34:20.079135', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 20),
(21, '2026-07-02 16:34:20.122114', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.122114', 'admin', NULL, 100, '2026-07-02 16:34:20.121110', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 25900000.00, 21),
(22, '2026-07-02 16:34:20.185817', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.185817', 'admin', NULL, 100, '2026-07-02 16:34:20.184106', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 25900000.00, 22),
(23, '2026-07-02 16:34:20.232963', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.232963', 'admin', NULL, 100, '2026-07-02 16:34:20.231413', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 25900000.00, 23),
(24, '2026-07-02 16:34:20.279563', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.279563', 'admin', NULL, 100, '2026-07-02 16:34:20.277893', 'INBOUND', 'Nhập kho khai trương', 2, 100, NULL, 'EXCEL_IMPORT', 25900000.00, 24),
(25, '2026-07-02 16:34:20.335384', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.335384', 'admin', NULL, 100, '2026-07-02 16:34:20.335384', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 27300000.00, 25),
(26, '2026-07-02 16:34:20.396225', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.396225', 'admin', NULL, 100, '2026-07-02 16:34:20.396225', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 27300000.00, 26),
(27, '2026-07-02 16:34:20.439674', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.439674', 'admin', NULL, 100, '2026-07-02 16:34:20.438516', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 27300000.00, 27),
(28, '2026-07-02 16:34:20.478443', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.478443', 'admin', NULL, 100, '2026-07-02 16:34:20.478443', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 27300000.00, 28),
(29, '2026-07-02 16:34:20.529501', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.529501', 'admin', NULL, 100, '2026-07-02 16:34:20.529501', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 29400000.00, 29),
(30, '2026-07-02 16:34:20.591481', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.591481', 'admin', NULL, 100, '2026-07-02 16:34:20.591481', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 29400000.00, 30),
(31, '2026-07-02 16:34:20.639050', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.639050', 'admin', NULL, 100, '2026-07-02 16:34:20.639050', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 29400000.00, 31),
(32, '2026-07-02 16:34:20.685359', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.685359', 'admin', NULL, 100, '2026-07-02 16:34:20.685359', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 29400000.00, 32),
(33, '2026-07-02 16:34:20.762993', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.762993', 'admin', NULL, 100, '2026-07-02 16:34:20.761917', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 33),
(34, '2026-07-02 16:34:20.822973', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.822973', 'admin', NULL, 100, '2026-07-02 16:34:20.821944', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 34),
(35, '2026-07-02 16:34:20.860616', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.860616', 'admin', NULL, 100, '2026-07-02 16:34:20.860616', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 35),
(36, '2026-07-02 16:34:20.923259', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.923259', 'admin', NULL, 100, '2026-07-02 16:34:20.921992', 'INBOUND', 'Nhập kho khai trương', 3, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 36),
(37, '2026-07-02 16:34:20.975290', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.975290', 'admin', NULL, 100, '2026-07-02 16:34:20.975290', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 37),
(38, '2026-07-02 16:34:21.015946', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.015946', 'admin', NULL, 100, '2026-07-02 16:34:21.014312', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 38),
(39, '2026-07-02 16:34:21.049082', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.049082', 'admin', NULL, 100, '2026-07-02 16:34:21.049082', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 39),
(40, '2026-07-02 16:34:21.075797', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.075797', 'admin', NULL, 100, '2026-07-02 16:34:21.075797', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 40),
(41, '2026-07-02 16:34:21.137589', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.137589', 'admin', NULL, 100, '2026-07-02 16:34:21.137589', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 12600000.00, 41),
(42, '2026-07-02 16:34:21.238767', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.238767', 'admin', NULL, 100, '2026-07-02 16:34:21.237125', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 12600000.00, 42),
(43, '2026-07-02 16:34:21.382519', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.382519', 'admin', NULL, 100, '2026-07-02 16:34:21.381261', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 12600000.00, 43),
(44, '2026-07-02 16:34:21.559896', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.559896', 'admin', NULL, 100, '2026-07-02 16:34:21.555183', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 12600000.00, 44),
(45, '2026-07-02 16:34:21.726186', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.726186', 'admin', NULL, 100, '2026-07-02 16:34:21.725178', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 14700000.00, 45),
(46, '2026-07-02 16:34:21.816536', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.816536', 'admin', NULL, 100, '2026-07-02 16:34:21.812504', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 14700000.00, 46),
(47, '2026-07-02 16:34:21.883520', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.883520', 'admin', NULL, 100, '2026-07-02 16:34:21.881903', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 14700000.00, 47),
(48, '2026-07-02 16:34:21.924943', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.924943', 'admin', NULL, 100, '2026-07-02 16:34:21.923629', 'INBOUND', 'Nhập kho khai trương', 4, 100, NULL, 'EXCEL_IMPORT', 14700000.00, 48),
(49, '2026-07-02 16:34:21.959678', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.959678', 'admin', NULL, 100, '2026-07-02 16:34:21.959678', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 19600000.00, 49),
(50, '2026-07-02 16:34:21.993522', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.993522', 'admin', NULL, 100, '2026-07-02 16:34:21.993522', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 19600000.00, 50),
(51, '2026-07-02 16:34:22.037292', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.037292', 'admin', NULL, 100, '2026-07-02 16:34:22.037292', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 19600000.00, 51),
(52, '2026-07-02 16:34:22.092655', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.092655', 'admin', NULL, 100, '2026-07-02 16:34:22.090341', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 19600000.00, 52),
(53, '2026-07-02 16:34:22.239166', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.239166', 'admin', NULL, 100, '2026-07-02 16:34:22.239166', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 53),
(54, '2026-07-02 16:34:22.314743', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.314743', 'admin', NULL, 100, '2026-07-02 16:34:22.314063', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 54),
(55, '2026-07-02 16:34:22.427182', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.427182', 'admin', NULL, 100, '2026-07-02 16:34:22.426147', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 55),
(56, '2026-07-02 16:34:22.516702', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.516702', 'admin', NULL, 100, '2026-07-02 16:34:22.516702', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 21700000.00, 56),
(57, '2026-07-02 16:34:22.562825', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.562825', 'admin', NULL, 100, '2026-07-02 16:34:22.562825', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 57),
(58, '2026-07-02 16:34:22.662110', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.662110', 'admin', NULL, 100, '2026-07-02 16:34:22.654093', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 58),
(59, '2026-07-02 16:34:22.788540', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.788540', 'admin', NULL, 100, '2026-07-02 16:34:22.788540', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 59),
(60, '2026-07-02 16:34:22.854127', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.854127', 'admin', NULL, 100, '2026-07-02 16:34:22.848789', 'INBOUND', 'Nhập kho khai trương', 5, 100, NULL, 'EXCEL_IMPORT', 23800000.00, 60),
(61, '2026-07-02 16:34:23.029818', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.029818', 'admin', NULL, 100, '2026-07-02 16:34:23.028816', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 7000000.00, 61),
(62, '2026-07-02 16:34:23.114459', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.114459', 'admin', NULL, 100, '2026-07-02 16:34:23.111453', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 7000000.00, 62),
(63, '2026-07-02 16:34:23.188963', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.188963', 'admin', NULL, 100, '2026-07-02 16:34:23.187068', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 7000000.00, 63),
(64, '2026-07-02 16:34:23.318044', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.318044', 'admin', NULL, 100, '2026-07-02 16:34:23.318044', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 7000000.00, 64),
(65, '2026-07-02 16:34:23.471296', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.471296', 'admin', NULL, 100, '2026-07-02 16:34:23.471296', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 9100000.00, 65),
(66, '2026-07-02 16:34:23.560174', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.560174', 'admin', NULL, 100, '2026-07-02 16:34:23.560174', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 9100000.00, 66),
(67, '2026-07-02 16:34:23.596995', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.596995', 'admin', NULL, 100, '2026-07-02 16:34:23.596995', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 9100000.00, 67),
(68, '2026-07-02 16:34:23.668079', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.668079', 'admin', NULL, 100, '2026-07-02 16:34:23.668079', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 9100000.00, 68),
(69, '2026-07-02 16:34:23.742105', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.742105', 'admin', NULL, 100, '2026-07-02 16:34:23.742105', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 11200000.00, 69),
(70, '2026-07-02 16:34:23.950673', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.950673', 'admin', NULL, 100, '2026-07-02 16:34:23.949633', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 11200000.00, 70),
(71, '2026-07-02 16:34:24.018470', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.018470', 'admin', NULL, 100, '2026-07-02 16:34:24.017017', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 11200000.00, 71),
(72, '2026-07-02 16:34:24.070370', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.070370', 'admin', NULL, 100, '2026-07-02 16:34:24.070370', 'INBOUND', 'Nhập kho khai trương', 6, 100, NULL, 'EXCEL_IMPORT', 11200000.00, 72),
(73, '2026-07-02 16:34:24.133744', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.133744', 'admin', NULL, 100, '2026-07-02 16:34:24.129739', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 4200000.00, 73),
(74, '2026-07-02 16:34:24.232469', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.232469', 'admin', NULL, 100, '2026-07-02 16:34:24.231462', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 4200000.00, 74),
(75, '2026-07-02 16:34:24.313119', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.313119', 'admin', NULL, 100, '2026-07-02 16:34:24.312105', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 4200000.00, 75),
(76, '2026-07-02 16:34:24.365512', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.365512', 'admin', NULL, 100, '2026-07-02 16:34:24.365512', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 4200000.00, 76),
(77, '2026-07-02 16:34:24.405492', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.405492', 'admin', NULL, 100, '2026-07-02 16:34:24.405492', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 77),
(78, '2026-07-02 16:34:24.449885', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.449885', 'admin', NULL, 100, '2026-07-02 16:34:24.449885', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 78),
(79, '2026-07-02 16:34:24.484699', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.484699', 'admin', NULL, 100, '2026-07-02 16:34:24.484699', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 79),
(80, '2026-07-02 16:34:24.519552', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.519552', 'admin', NULL, 100, '2026-07-02 16:34:24.517536', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 80),
(81, '2026-07-02 16:34:24.595057', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.595057', 'admin', NULL, 100, '2026-07-02 16:34:24.592443', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 81),
(82, '2026-07-02 16:34:24.635819', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.635819', 'admin', NULL, 100, '2026-07-02 16:34:24.633803', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 82),
(83, '2026-07-02 16:34:24.676004', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.676004', 'admin', NULL, 100, '2026-07-02 16:34:24.676004', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 83),
(84, '2026-07-02 16:34:24.712768', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.712768', 'admin', NULL, 100, '2026-07-02 16:34:24.712171', 'INBOUND', 'Nhập kho khai trương', 7, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 84),
(85, '2026-07-02 16:34:24.754349', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.754349', 'admin', NULL, 100, '2026-07-02 16:34:24.754349', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 85),
(86, '2026-07-02 16:34:24.789559', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.789559', 'admin', NULL, 100, '2026-07-02 16:34:24.789559', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 86),
(87, '2026-07-02 16:34:24.826963', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.826963', 'admin', NULL, 100, '2026-07-02 16:34:24.826963', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 87),
(88, '2026-07-02 16:34:24.865578', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.865578', 'admin', NULL, 100, '2026-07-02 16:34:24.865578', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 31500000.00, 88),
(89, '2026-07-02 16:34:24.949962', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.949962', 'admin', NULL, 100, '2026-07-02 16:34:24.949962', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 33600000.00, 89),
(90, '2026-07-02 16:34:25.011898', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.011898', 'admin', NULL, 100, '2026-07-02 16:34:25.011898', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 33600000.00, 90),
(91, '2026-07-02 16:34:25.056843', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.056843', 'admin', NULL, 100, '2026-07-02 16:34:25.054827', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 33600000.00, 91),
(92, '2026-07-02 16:34:25.090728', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.090728', 'admin', NULL, 100, '2026-07-02 16:34:25.090728', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 33600000.00, 92),
(93, '2026-07-02 16:34:25.123986', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.123986', 'admin', NULL, 100, '2026-07-02 16:34:25.123986', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 35700000.00, 93),
(94, '2026-07-02 16:34:25.161461', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.161461', 'admin', NULL, 100, '2026-07-02 16:34:25.161461', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 35700000.00, 94),
(95, '2026-07-02 16:34:25.194371', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.194371', 'admin', NULL, 100, '2026-07-02 16:34:25.194371', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 35700000.00, 95),
(96, '2026-07-02 16:34:25.248389', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.248389', 'admin', NULL, 100, '2026-07-02 16:34:25.246379', 'INBOUND', 'Nhập kho khai trương', 8, 100, NULL, 'EXCEL_IMPORT', 35700000.00, 96),
(97, '2026-07-02 16:34:25.308918', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.308918', 'admin', NULL, 100, '2026-07-02 16:34:25.308918', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 28000000.00, 97),
(98, '2026-07-02 16:34:25.371826', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.371826', 'admin', NULL, 100, '2026-07-02 16:34:25.369822', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 28000000.00, 98),
(99, '2026-07-02 16:34:25.442432', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.442432', 'admin', NULL, 100, '2026-07-02 16:34:25.442432', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 28000000.00, 99),
(100, '2026-07-02 16:34:25.503480', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.503480', 'admin', NULL, 100, '2026-07-02 16:34:25.502960', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 28000000.00, 100),
(101, '2026-07-02 16:34:25.544801', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.544801', 'admin', NULL, 100, '2026-07-02 16:34:25.544801', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 30100000.00, 101),
(102, '2026-07-02 16:34:25.567579', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.567579', 'admin', NULL, 100, '2026-07-02 16:34:25.567579', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 30100000.00, 102),
(103, '2026-07-02 16:34:25.598224', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.598224', 'admin', NULL, 100, '2026-07-02 16:34:25.598224', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 30100000.00, 103),
(104, '2026-07-02 16:34:25.645155', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.645155', 'admin', NULL, 100, '2026-07-02 16:34:25.644429', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 30100000.00, 104),
(105, '2026-07-02 16:34:25.692099', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.692099', 'admin', NULL, 100, '2026-07-02 16:34:25.692099', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 32200000.00, 105),
(106, '2026-07-02 16:34:25.742123', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.742123', 'admin', NULL, 100, '2026-07-02 16:34:25.742123', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 32200000.00, 106),
(107, '2026-07-02 16:34:25.803645', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.803645', 'admin', NULL, 100, '2026-07-02 16:34:25.803645', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 32200000.00, 107),
(108, '2026-07-02 16:34:25.851744', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.851744', 'admin', NULL, 100, '2026-07-02 16:34:25.851744', 'INBOUND', 'Nhập kho khai trương', 9, 100, NULL, 'EXCEL_IMPORT', 32200000.00, 108),
(109, '2026-07-02 16:34:25.900316', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.900316', 'admin', NULL, 100, '2026-07-02 16:34:25.900316', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 109),
(110, '2026-07-02 16:34:25.950818', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.950818', 'admin', NULL, 100, '2026-07-02 16:34:25.950818', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 110),
(111, '2026-07-02 16:34:26.007218', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.007218', 'admin', NULL, 100, '2026-07-02 16:34:26.007218', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 111),
(112, '2026-07-02 16:34:26.058358', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.058358', 'admin', NULL, 100, '2026-07-02 16:34:26.058358', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 6300000.00, 112),
(113, '2026-07-02 16:34:26.116264', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.116264', 'admin', NULL, 100, '2026-07-02 16:34:26.116264', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 113),
(114, '2026-07-02 16:34:26.163744', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.163744', 'admin', NULL, 100, '2026-07-02 16:34:26.163744', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 114),
(115, '2026-07-02 16:34:26.219047', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.219047', 'admin', NULL, 100, '2026-07-02 16:34:26.219047', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 115),
(116, '2026-07-02 16:34:26.258052', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.258052', 'admin', NULL, 100, '2026-07-02 16:34:26.258052', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 8400000.00, 116),
(117, '2026-07-02 16:34:26.285232', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.285232', 'admin', NULL, 100, '2026-07-02 16:34:26.285232', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 117),
(118, '2026-07-02 16:34:26.315397', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.315397', 'admin', NULL, 100, '2026-07-02 16:34:26.315397', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 118),
(119, '2026-07-02 16:34:26.342366', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.342366', 'admin', NULL, 100, '2026-07-02 16:34:26.342366', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 119),
(120, '2026-07-02 16:34:26.416800', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.416800', 'admin', NULL, 100, '2026-07-02 16:34:26.416800', 'INBOUND', 'Nhập kho khai trương', 10, 100, NULL, 'EXCEL_IMPORT', 10500000.00, 120),
(121, '2026-07-02 17:19:15.479788', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 17:19:15.481287', 'admin', NULL, 98, '2026-07-02 17:19:13.948551', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607021706-2131-614184', 10, 2, 1, 'ORDER', NULL, 109),
(122, '2026-07-06 21:34:58.557619', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 21:34:58.557619', 'admin', NULL, 99, '2026-07-06 21:34:57.977845', 'INBOUND', '1', 10, 1, NULL, NULL, 1.00, 109),
(123, '2026-07-06 21:35:23.538010', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 21:35:23.538516', 'admin', NULL, 100, '2026-07-06 21:35:23.153405', 'INBOUND', '1', 10, 1, NULL, NULL, 1.00, 109),
(124, '2026-07-06 21:35:28.626465', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 21:35:28.626465', 'admin', NULL, 101, '2026-07-06 21:35:28.621678', 'INBOUND', '1', 10, 1, NULL, NULL, 1.00, 109),
(125, '2026-07-06 22:49:04.502131', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 22:49:04.503142', 'admin', NULL, 102, '2026-07-06 22:49:04.121705', 'INBOUND', NULL, 10, 1, NULL, 'EXCEL_IMPORT', 9000000.00, 109),
(126, '2026-07-06 22:52:36.303641', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 22:52:36.303641', 'admin', NULL, 103, '2026-07-06 22:52:36.263215', 'INBOUND', NULL, 10, 1, NULL, 'EXCEL_IMPORT', 9000000.00, 109),
(127, '2026-07-06 22:55:31.049469', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 22:55:31.049469', 'admin', NULL, 104, '2026-07-06 22:55:30.988259', 'INBOUND', NULL, 10, 1, NULL, 'EXCEL_IMPORT', 9000000.00, 109),
(128, '2026-07-07 03:17:56.160241', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 03:17:56.161241', 'admin', NULL, 99, '2026-07-07 03:17:52.886502', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070317-2131-9482EA', 1, 1, 6, 'ORDER', NULL, 1),
(129, '2026-07-07 03:19:51.203170', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 03:19:51.205167', 'admin', NULL, 98, '2026-07-07 03:19:50.394124', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070319-2131-4E97AB', 1, 1, 7, 'ORDER', NULL, 1),
(130, '2026-07-07 03:27:52.462682', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 03:27:52.464682', 'admin', NULL, 97, '2026-07-07 03:27:51.671635', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070327-2131-8349BF', 1, 1, 8, 'ORDER', NULL, 1),
(131, '2026-07-07 03:45:33.519475', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 03:45:33.521474', 'admin', NULL, 96, '2026-07-07 03:45:32.901075', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070345-2131-40A869', 1, 1, 9, 'ORDER', NULL, 1),
(132, '2026-07-07 04:12:44.671281', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 04:12:44.671281', 'admin', NULL, 95, '2026-07-07 04:12:41.899386', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070412-2131-06A949', 1, 1, 11, 'ORDER', NULL, 1),
(133, '2026-07-07 04:15:34.643131', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 04:15:34.644206', 'admin', NULL, 99, '2026-07-07 04:15:34.169404', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070415-2131-78CB86', 6, 1, 12, 'ORDER', NULL, 61),
(134, '2026-07-07 04:19:08.013271', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 04:19:08.014269', 'admin', NULL, 94, '2026-07-07 04:19:07.226028', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070419-2131-84AFD1', 1, 1, 13, 'ORDER', NULL, 1),
(135, '2026-07-07 04:40:07.384512', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 04:40:07.386510', 'admin', NULL, 93, '2026-07-07 04:40:06.830376', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070440-2131-0564D6', 1, 1, 14, 'ORDER', NULL, 1),
(136, '2026-07-07 05:18:22.870819', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 05:18:22.870819', 'admin', NULL, 99, '2026-07-07 05:18:18.172236', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070518-2131-BA09E2', 4, 1, 15, 'ORDER', NULL, 37),
(137, '2026-07-07 05:18:25.188177', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 05:18:25.188177', 'admin', NULL, 99, '2026-07-07 05:18:25.140570', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070518-2131-BA09E2', 8, 1, 15, 'ORDER', NULL, 85),
(138, '2026-07-07 06:32:27.457622', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:32:27.459062', 'admin', NULL, 92, '2026-07-07 06:32:25.241611', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070632-2131-BFFC5B', 1, 1, 16, 'ORDER', NULL, 1),
(139, '2026-07-07 06:32:40.406167', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:32:40.406167', 'admin', NULL, 91, '2026-07-07 06:32:40.314510', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070632-2131-5D0654', 1, 1, 17, 'ORDER', NULL, 1),
(140, '2026-07-07 06:32:46.821143', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:32:46.821143', 'admin', NULL, 90, '2026-07-07 06:32:46.778798', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070632-2131-F8A3B5', 1, 1, 18, 'ORDER', NULL, 1),
(141, '2026-07-07 06:32:58.267977', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:32:58.268986', 'admin', NULL, 89, '2026-07-07 06:32:58.114401', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070632-2131-A9473F', 1, 1, 19, 'ORDER', NULL, 1),
(142, '2026-07-07 06:34:53.814745', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:34:53.814745', 'admin', NULL, 98, '2026-07-07 06:34:53.623660', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070634-2131-BEC443', 4, 1, 20, 'ORDER', NULL, 37),
(143, '2026-07-07 06:35:19.330205', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:35:19.330205', 'admin', NULL, 97, '2026-07-07 06:35:19.261332', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070635-2131-ECA605', 4, 1, 21, 'ORDER', NULL, 37),
(144, '2026-07-07 06:35:31.146636', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:35:31.146636', 'admin', NULL, 96, '2026-07-07 06:35:31.089625', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070635-2131-B6225D', 4, 1, 22, 'ORDER', NULL, 37),
(145, '2026-07-07 06:37:13.485129', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:37:13.486832', 'admin', NULL, 95, '2026-07-07 06:37:13.092659', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070637-2131-867B68', 4, 1, 23, 'ORDER', NULL, 37),
(146, '2026-07-07 06:47:33.607103', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:47:33.608112', 'admin', NULL, 94, '2026-07-07 06:47:29.998703', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070647-2131-2F743C', 4, 1, 24, 'ORDER', NULL, 37),
(147, '2026-07-07 06:53:15.717314', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:53:15.722013', 'admin', NULL, 88, '2026-07-07 06:53:14.988125', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070653-2131-98C99C', 1, 1, 25, 'ORDER', NULL, 1),
(148, '2026-07-07 06:57:11.015053', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:57:11.016250', 'admin', NULL, 98, '2026-07-07 06:57:10.729252', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070657-2131-A909F5', 8, 1, 26, 'ORDER', NULL, 85),
(149, '2026-07-07 06:57:53.007249', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 06:57:53.008251', 'admin', NULL, 97, '2026-07-07 06:57:52.626358', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070657-2131-120E4E', 8, 1, 27, 'ORDER', NULL, 85),
(150, '2026-07-07 07:02:41.227936', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 07:02:41.229078', 'admin', NULL, 96, '2026-07-07 07:02:40.859578', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070702-2131-FB9777', 8, 1, 28, 'ORDER', NULL, 85),
(151, '2026-07-07 07:07:20.137072', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 07:07:20.139709', 'admin', NULL, 95, '2026-07-07 07:07:15.153086', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070707-2131-14AA2E', 8, 1, 29, 'ORDER', NULL, 85),
(152, '2026-07-07 07:46:35.904243', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 07:46:35.904243', 'admin', NULL, 93, '2026-07-07 07:46:32.383890', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070746-2131-049829', 4, 1, 30, 'ORDER', NULL, 37),
(153, '2026-07-07 07:46:59.035377', 'admin', NULL, NULL, NULL, NULL, '2026-07-07 07:46:59.035377', 'admin', NULL, 92, '2026-07-07 07:46:58.835753', 'OUTBOUND', 'Xuất kho tự động cho đơn hàng DH2607070746-2131-3FE73C', 4, 1, 31, 'ORDER', NULL, 37);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `inventory_balances`
--
ALTER TABLE `inventory_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_product_variant_balance` (`product_id`,`variant_id`);

--
-- Chỉ mục cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `inventory_balances`
--
ALTER TABLE `inventory_balances`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=154;
--
-- Cơ sở dữ liệu: `notifications`
--
CREATE DATABASE IF NOT EXISTS `notifications` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `notifications`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notification_messages`
--

CREATE TABLE `notification_messages` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `body` varchar(4000) DEFAULT NULL,
  `channel` varchar(16) NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `source` varchar(32) DEFAULT NULL,
  `status` varchar(32) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `notification_messages`
--

INSERT INTO `notification_messages` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `body`, `channel`, `recipient`, `source`, `status`, `subject`) VALUES
(1, '2026-07-02 15:59:41.271147', NULL, NULL, NULL, '2026-07-02 15:59:41.274901', NULL, 'Admin vừa tạo danh mục: Gmail domain cho thuê (slug: d).', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Tạo danh mục'),
(2, '2026-07-02 15:59:49.402246', NULL, NULL, NULL, '2026-07-02 15:59:49.402246', NULL, 'Admin vừa xóa danh mục #6.', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Xóa danh mục'),
(3, '2026-07-02 17:10:57.996840', NULL, NULL, NULL, '2026-07-02 17:10:57.996840', NULL, '12411', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'FAILED', 'hihi'),
(4, '2026-07-02 17:17:05.792042', NULL, NULL, NULL, '2026-07-02 17:17:05.792042', NULL, 'fhfgh', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'fhfh'),
(5, '2026-07-02 17:19:13.402454', NULL, NULL, NULL, '2026-07-02 17:19:13.403454', NULL, '<p>Xin chào <strong>admin</strong>,</p><p>Đơn hàng <b>DH2607021706-2131-614184</b> của bạn đã được <b>admin</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p><h3>Thông tin cập nhật</h3><ul><li><b>Trạng thái:</b> CONFIRMED</li><li><b>Tổng tiền:</b> 17900000.00 ₫</li><li><b>Dự kiến giao:</b> 2026-07-06</li></ul><p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607021706-2131-614184 đã được xác nhận'),
(6, '2026-07-02 17:50:44.985519', NULL, NULL, NULL, '2026-07-02 17:50:44.989530', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607021750-2131-420685</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 9000030.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Loa Marshall Stanmore III (Phân loại: Ultra / Trắng) - Số lượng: 1 - Thành tiền: 15.0000 ₫</li><li>Samsung Galaxy S24 Ultra (Phân loại: Tiêu chuẩn / Trắng) - Số lượng: 1 - Thành tiền: 15.0000 ₫</li><li>Loa Marshall Stanmore III (Phân loại: Tiêu chuẩn / Trắng) - Số lượng: 1 - Thành tiền: 9000000.00 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607021750-2131-420685 — thanh toán QR (SePay)'),
(7, '2026-07-02 18:06:39.963959', NULL, NULL, NULL, '2026-07-02 18:06:39.967442', NULL, '<p>Xin chào <strong>admin</strong>,</p><p>Đơn hàng <b>DH2607021750-2131-420685</b> của bạn đã được <b>admin</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p><h3>Thông tin cập nhật</h3><ul><li><b>Trạng thái:</b> CONFIRMED</li><li><b>Tổng tiền:</b> 9000030.00 ₫</li><li><b>Dự kiến giao:</b> 2026-07-06</li></ul><p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607021750-2131-420685 đã được xác nhận'),
(8, '2026-07-04 13:09:05.121720', NULL, NULL, NULL, '2026-07-04 13:09:05.121720', NULL, 'Admin vừa tạo danh mục: Gmail domain cho thuê (slug: gmail-domain-cho-thue).', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Tạo danh mục'),
(9, '2026-07-04 13:17:41.340192', NULL, NULL, NULL, '2026-07-04 13:17:41.345207', NULL, 'Admin vừa tạo danh mục: TT Việt NEW có info (slug: tt-viet-new-co-info).', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Tạo danh mục'),
(10, '2026-07-04 13:18:47.053156', NULL, NULL, NULL, '2026-07-04 13:18:47.054631', NULL, 'Admin vừa tạo danh mục: TT Việt NEW có info1 (slug: tt-viet-new-co-info-1).', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Tạo danh mục'),
(11, '2026-07-04 13:19:10.351340', NULL, NULL, NULL, '2026-07-04 13:19:10.351340', NULL, 'Admin vừa cập nhật danh mục #1: Điện thoại thông minh1 (slug: dien-thoai-thong-minh).', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Cập nhật danh mục'),
(12, '2026-07-04 13:20:01.790329', NULL, NULL, NULL, '2026-07-04 13:20:01.794936', NULL, 'Admin vừa xóa danh mục #1: Điện thoại thông minh1.', 'WEB', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', '[Danh mục] Xóa danh mục'),
(13, '2026-07-07 01:26:39.772724', NULL, NULL, NULL, '2026-07-07 01:26:39.773722', NULL, 'Xin chào,\n\nChúng tôi vừa ra mắt chương trình khuyến mãi mới: Siêu Sale Khai Trương 15%\nChi tiết: Giảm 15% toàn bộ gian hàng\n\nĐừng bỏ lỡ cơ hội săn sale tuyệt vời này!\n\nTrân trọng,\nĐội ngũ VIP PRO', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', '🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%'),
(14, '2026-07-07 01:26:47.783727', NULL, NULL, NULL, '2026-07-07 01:26:47.784557', NULL, 'Xin chào,\n\nChúng tôi vừa ra mắt chương trình khuyến mãi mới: Siêu Sale Khai Trương 15%\nChi tiết: Giảm 15% toàn bộ gian hàng\n\nĐừng bỏ lỡ cơ hội săn sale tuyệt vời này!\n\nTrân trọng,\nĐội ngũ VIP PRO', 'EMAIL', 'nguyendinhkiet122005@gmail.com', 'ADMIN', 'SENT', '🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%'),
(15, '2026-07-07 01:48:24.864267', NULL, NULL, NULL, '2026-07-07 01:48:24.869019', NULL, 'ádfasdfas', 'BOTH', 'nguyendinhkiet12092005@gmail.com', 'WEB', 'SENT', 'ádfasd'),
(16, '2026-07-07 04:16:59.315428', NULL, NULL, NULL, '2026-07-07 04:16:59.355144', NULL, 'Xin chào,\n\nChúng tôi vừa ra mắt chương trình khuyến mãi mới: Siêu Sale Khai Trương 15%\nChi tiết: Giảm 15% toàn bộ gian hàng\n\nĐừng bỏ lỡ cơ hội săn sale tuyệt vời này!\n\nTrân trọng,\nĐội ngũ VIP PRO', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', '🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%'),
(17, '2026-07-07 04:17:14.651151', NULL, NULL, NULL, '2026-07-07 04:17:14.651151', NULL, 'Xin chào,\n\nChúng tôi vừa ra mắt chương trình khuyến mãi mới: Siêu Sale Khai Trương 15%\nChi tiết: Giảm 15% toàn bộ gian hàng\n\nĐừng bỏ lỡ cơ hội săn sale tuyệt vời này!\n\nTrân trọng,\nĐội ngũ VIP PRO', 'EMAIL', 'nguyendinhkiet122005@gmail.com', 'ADMIN', 'SENT', '🎉 Khuyến mãi mới: Siêu Sale Khai Trương 15%'),
(18, '2026-07-07 04:19:13.572141', NULL, NULL, NULL, '2026-07-07 04:19:13.576511', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070419-2131-84AFD1</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>iPhone 15 Pro Max (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070419-2131-84AFD1 — thanh toán QR (SePay)'),
(19, '2026-07-07 04:40:13.596321', NULL, NULL, NULL, '2026-07-07 04:40:13.604093', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070440-2131-0564D6</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>iPhone 15 Pro Max (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070440-2131-0564D6 — thanh toán QR (SePay)'),
(20, '2026-07-07 04:59:24.873481', NULL, NULL, NULL, '2026-07-07 04:59:24.873481', NULL, '<p>Xin chào <strong>admin</strong>,</p><p>Đơn hàng <b>DH2607070440-2131-0564D6</b> của bạn đã được <b>KokokoVN</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p><h3>Thông tin cập nhật</h3><ul><li><b>Trạng thái:</b> CONFIRMED</li><li><b>Tổng tiền:</b> 2000.00 ₫</li><li><b>Dự kiến giao:</b> 2026-07-11</li></ul><p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070440-2131-0564D6 đã được xác nhận'),
(21, '2026-07-07 05:19:42.902964', NULL, NULL, NULL, '2026-07-07 05:19:42.910411', NULL, '<p>Xin chào <strong>admin</strong>,</p><p>Đơn hàng <b>DH2607070518-2131-BA09E2</b> của bạn đã được <b>KokokoVN</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p><h3>Thông tin cập nhật</h3><ul><li><b>Trạng thái:</b> CONFIRMED</li><li><b>Tổng tiền:</b> 45002000.00 ₫</li><li><b>Dự kiến giao:</b> 2026-07-11</li></ul><p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070518-2131-BA09E2 đã được xác nhận'),
(22, '2026-07-07 05:19:42.902964', NULL, NULL, NULL, '2026-07-07 05:19:42.911905', NULL, '<p>Xin chào <strong>admin</strong>,</p><p>Đơn hàng <b>DH2607070518-2131-BA09E2</b> của bạn đã được <b>KokokoVN</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p><h3>Thông tin cập nhật</h3><ul><li><b>Trạng thái:</b> CONFIRMED</li><li><b>Tổng tiền:</b> 45002000.00 ₫</li><li><b>Dự kiến giao:</b> 2026-07-11</li></ul><p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070518-2131-BA09E2 đã được xác nhận'),
(23, '2026-07-07 05:20:45.334742', NULL, NULL, NULL, '2026-07-07 05:20:45.335734', NULL, '<p>Xin chào <strong>admin</strong>,</p><p>Đơn hàng <b>DH2607070419-2131-84AFD1</b> của bạn đã được <b>KokokoVN</b> xác nhận và đang trong quá trình chuẩn bị giao hàng.</p><h3>Thông tin cập nhật</h3><ul><li><b>Trạng thái:</b> CONFIRMED</li><li><b>Tổng tiền:</b> 2000.00 ₫</li><li><b>Dự kiến giao:</b> 2026-07-11</li></ul><p>Bạn có thể truy cập lịch sử đơn hàng trên website để theo dõi trạng thái vận chuyển chi tiết.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070419-2131-84AFD1 đã được xác nhận'),
(24, '2026-07-07 05:45:40.794866', NULL, NULL, NULL, '2026-07-07 05:45:40.805327', NULL, '<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>admin</strong>,</p><p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng nhấn nút bên dưới để tạo mật khẩu mới:</p><div style=\"text-align:center;margin:32px 0;\">  <a href=\"http://localhost:3000/reset-password?token=20f64a6dd2954e88ba988d438e02786ce559668b434444cfb21c35e7f68d6a7b\" style=\"display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#06b6d4 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:800;box-shadow:0 4px 6px -1px rgba(37,99,235,0.3);\">Đặt Lại Mật Khẩu Ngay</a></div><p style=\"margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Liên kết có hiệu lực trong 30 phút.</p><p style=\"margin:0;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;word-break:break-all;\">Nếu nút không hoạt động, hãy copy link này:<br/>http://localhost:3000/reset-password?token=20f64a6dd2954e88ba988d438e02786ce559668b434444cfb21c35e7f68d6a7b</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Dat lai mat khau The Kinetic Vault'),
(25, '2026-07-07 05:48:34.699534', NULL, NULL, NULL, '2026-07-07 05:48:34.707537', NULL, '<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>admin</strong>,</p><p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#475569;\">Hệ thống vừa ghi nhận một yêu cầu đăng nhập từ thiết bị mới. Vui lòng sử dụng mã OTP dưới đây để xác nhận:</p><div style=\"text-align:center;margin:24px 0;\">  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">36642291</span></div><div style=\"background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:24px 0;font-size:13px;line-height:1.8;color:#475569;\">  <p style=\"margin:0;\"><strong>Thiết bị:</strong> node | *</p>  <p style=\"margin:0;\"><strong>IP:</strong> 0:0:0:0:0:0:0:1</p>  <p style=\"margin:0;\"><strong>Vị trí:</strong> Chua cap quyen vi tri</p>  <p style=\"margin:0;\"><strong>Thời gian:</strong> 2026-07-07T05:48:26.950754600</p></div><p style=\"margin:0;font-size:13px;line-height:1.6;color:#ef4444;\">OTP có hiệu lực trong 15 phút. Nếu không phải bạn, hãy đổi mật khẩu ngay lập tức!</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'OTP dang nhap The Kinetic Vault'),
(26, '2026-07-07 05:57:51.275910', NULL, NULL, NULL, '2026-07-07 05:57:51.280446', NULL, '<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>admin</strong>,</p><p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu thay đổi địa chỉ email. Mã OTP của bạn là:</p><div style=\"text-align:center;margin:32px 0;\">  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">54238283</span></div><p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Mã này chỉ có hiệu lực trong thời gian ngắn. Nếu không phải bạn, hãy bỏ qua email này.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Ma OTP doi Gmail'),
(27, '2026-07-07 06:07:14.520746', NULL, NULL, NULL, '2026-07-07 06:07:14.537296', NULL, '<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>admin</strong>,</p><p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu thay đổi địa chỉ email. Mã OTP của bạn là:</p><div style=\"text-align:center;margin:32px 0;\">  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">85241900</span></div><p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Mã này chỉ có hiệu lực trong thời gian ngắn. Nếu không phải bạn, hãy bỏ qua email này.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Ma OTP doi Gmail'),
(28, '2026-07-07 06:07:28.066029', NULL, NULL, NULL, '2026-07-07 06:07:28.086880', NULL, '<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>admin</strong>,</p><p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu thay đổi địa chỉ email. Mã OTP của bạn là:</p><div style=\"text-align:center;margin:32px 0;\">  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">52754582</span></div><p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Mã này chỉ có hiệu lực trong thời gian ngắn. Nếu không phải bạn, hãy bỏ qua email này.</p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Ma OTP doi Gmail'),
(29, '2026-07-07 06:09:05.807395', NULL, NULL, NULL, '2026-07-07 06:09:05.808851', NULL, '<p style=\"margin:0 0 16px 0;font-size:15px;line-height:1.6;\">Xin chào <strong>admin</strong>,</p><p style=\"margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;\">Bạn vừa yêu cầu thay đổi địa chỉ email. Mã OTP của bạn là:</p><div style=\"text-align:center;margin:32px 0;\">  <span style=\"display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;color:#0f172a;font-size:32px;font-weight:900;letter-spacing:12px;padding:16px 24px;border-radius:16px;\">14219193</span></div><p style=\"margin:0;font-size:13px;line-height:1.6;color:#64748b;text-align:center;\">Mã này chỉ có hiệu lực trong thời gian ngắn. Nếu không phải bạn, hãy bỏ qua email này.</p>', 'EMAIL', 'ng.dinhkiet.it@gmail.com', 'ADMIN', 'SENT', 'Ma OTP doi Gmail'),
(30, '2026-07-07 06:32:38.332011', NULL, NULL, NULL, '2026-07-07 06:32:38.332011', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070632-2131-BFFC5B</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>iPhone 15 Pro Max (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070632-2131-BFFC5B — thanh toán QR (SePay)'),
(31, '2026-07-07 06:32:46.320904', NULL, NULL, NULL, '2026-07-07 06:32:46.320904', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070632-2131-5D0654</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>iPhone 15 Pro Max (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070632-2131-5D0654 — thanh toán QR (SePay)'),
(32, '2026-07-07 06:32:58.714040', NULL, NULL, NULL, '2026-07-07 06:32:58.714040', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070632-2131-F8A3B5</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>iPhone 15 Pro Max (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070632-2131-F8A3B5 — thanh toán QR (SePay)'),
(33, '2026-07-07 06:34:59.178314', NULL, NULL, NULL, '2026-07-07 06:34:59.180222', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070634-2131-BEC443</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070634-2131-BEC443 — thanh toán QR (SePay)'),
(34, '2026-07-07 06:35:22.942206', NULL, NULL, NULL, '2026-07-07 06:35:22.942206', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070635-2131-ECA605</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070635-2131-ECA605 — thanh toán QR (SePay)'),
(35, '2026-07-07 06:35:36.235063', NULL, NULL, NULL, '2026-07-07 06:35:36.235573', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070635-2131-B6225D</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070635-2131-B6225D — thanh toán QR (SePay)'),
(36, '2026-07-07 06:37:18.039528', NULL, NULL, NULL, '2026-07-07 06:37:18.040036', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070637-2131-867B68</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070637-2131-867B68 — thanh toán QR (SePay)'),
(37, '2026-07-07 06:47:44.204470', NULL, NULL, NULL, '2026-07-07 06:47:44.204470', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070647-2131-2F743C</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070647-2131-2F743C — thanh toán QR (SePay)'),
(38, '2026-07-07 06:53:22.746709', NULL, NULL, NULL, '2026-07-07 06:53:22.747712', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070653-2131-98C99C</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>iPhone 15 Pro Max (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070653-2131-98C99C — thanh toán QR (SePay)'),
(39, '2026-07-07 06:57:22.224595', NULL, NULL, NULL, '2026-07-07 06:57:22.225595', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070657-2131-A909F5</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 45000000.00 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Laptop Dell XPS 15 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 45000000.00 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070657-2131-A909F5 — thanh toán QR (SePay)'),
(40, '2026-07-07 06:57:59.077832', NULL, NULL, NULL, '2026-07-07 06:57:59.080063', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070657-2131-120E4E</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 45000000.00 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Laptop Dell XPS 15 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 45000000.00 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070657-2131-120E4E — thanh toán QR (SePay)'),
(41, '2026-07-07 07:02:46.592862', NULL, NULL, NULL, '2026-07-07 07:02:46.593862', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070702-2131-FB9777</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 45000000.00 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Laptop Dell XPS 15 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 45000000.00 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070702-2131-FB9777 — thanh toán QR (SePay)'),
(42, '2026-07-07 07:07:32.496493', NULL, NULL, NULL, '2026-07-07 07:07:32.501018', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070707-2131-14AA2E</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 45000000.00 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Laptop Dell XPS 15 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 45000000.00 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070707-2131-14AA2E — thanh toán QR (SePay)'),
(43, '2026-07-07 07:46:53.822801', NULL, NULL, NULL, '2026-07-07 07:46:53.823508', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070746-2131-049829</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070746-2131-049829 — thanh toán QR (SePay)'),
(44, '2026-07-07 07:47:04.043864', NULL, NULL, NULL, '2026-07-07 07:47:04.043864', NULL, '<p>Đơn hàng của bạn đã được tạo thành công. Vui lòng hoàn tất thanh toán bằng mã QR trên website để đơn hàng được xử lý.</p><h3>Thông tin đơn hàng</h3><ul><li><b>Mã đơn:</b> DH2607070746-2131-3FE73C</li><li><b>Thanh toán:</b> SEPAY</li><li><b>Trạng thái:</b> PAYMENT_EXPECTED</li><li><b>Địa chỉ:</b> 1312313123, Xã Thái Bình, Tỉnh Tuyên Quang</li><li><b>Tổng tiền:</b> 2000.0000 ₫</li></ul><h3>Chi tiết sản phẩm</h3><ul><li>Sony PlayStation 5 (Phân loại: Trắng • Tiêu chuẩn) - Số lượng: 1 - Thành tiền: 2000.0000 ₫</li></ul><p><i>Nếu bạn đã thanh toán thành công, vui lòng chờ ít phút để hệ thống cập nhật tự động và bỏ qua email này.</i></p>', 'EMAIL', 'nguyendinhkiet12092005@gmail.com', 'ADMIN', 'SENT', 'Đơn hàng DH2607070746-2131-3FE73C — thanh toán QR (SePay)');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `notification_messages`
--
ALTER TABLE `notification_messages`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `notification_messages`
--
ALTER TABLE `notification_messages`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;
--
-- Cơ sở dữ liệu: `orders`
--
CREATE DATABASE IF NOT EXISTS `orders` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `orders`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `items`
--

CREATE TABLE `items` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `product_image_snapshot` varchar(500) DEFAULT NULL,
  `product_name_snapshot` varchar(255) DEFAULT NULL,
  `product_sku_snapshot` varchar(128) DEFAULT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(19,2) NOT NULL,
  `variant_id` bigint DEFAULT NULL,
  `variant_label` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `items`
--

INSERT INTO `items` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `product_id`, `product_image_snapshot`, `product_name_snapshot`, `product_sku_snapshot`, `quantity`, `subtotal`, `variant_id`, `variant_label`) VALUES
(1, '2026-07-02 17:06:32.754367', NULL, NULL, NULL, '2026-07-02 17:06:32.754367', NULL, 10, '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 'Loa Marshall Stanmore III', 'SP-VIP-010', 2, 18000000.00, 109, 'Tiêu chuẩn / Trắng'),
(2, '2026-07-02 17:50:38.411712', NULL, NULL, NULL, '2026-07-02 17:50:38.411712', NULL, 10, '/api/catalog/admin/products/images/file/01d3ac175f5947bd94b8c94fe958e2ad.webp', 'Loa Marshall Stanmore III', 'SP-VIP-010', 1, 15.00, 117, 'Ultra / Trắng'),
(3, '2026-07-02 17:50:38.416479', NULL, NULL, NULL, '2026-07-02 17:50:38.416479', NULL, 2, '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', 'Samsung Galaxy S24 Ultra', 'SP-VIP-002', 1, 15.00, 13, 'Tiêu chuẩn / Trắng'),
(4, '2026-07-02 17:50:38.418369', NULL, NULL, NULL, '2026-07-02 17:50:38.418369', NULL, 10, '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 'Loa Marshall Stanmore III', 'SP-VIP-010', 1, 9000000.00, 109, 'Tiêu chuẩn / Trắng'),
(5, '2026-07-02 17:54:42.925101', NULL, NULL, NULL, '2026-07-02 17:54:42.925101', NULL, 10, '/api/catalog/admin/products/images/file/01d3ac175f5947bd94b8c94fe958e2ad.webp', 'Loa Marshall Stanmore III', 'SP-VIP-010', 1, 15.00, 117, 'Ultra / Trắng'),
(6, '2026-07-02 17:54:42.942332', NULL, NULL, NULL, '2026-07-02 17:54:42.942332', NULL, 2, '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', 'Samsung Galaxy S24 Ultra', 'SP-VIP-002', 1, 15.00, 13, 'Tiêu chuẩn / Trắng'),
(7, '2026-07-02 17:54:42.942332', NULL, NULL, NULL, '2026-07-02 17:54:42.942332', NULL, 10, '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 'Loa Marshall Stanmore III', 'SP-VIP-010', 1, 9000000.00, 109, 'Tiêu chuẩn / Trắng'),
(8, '2026-07-07 02:47:07.779948', NULL, NULL, NULL, '2026-07-07 02:47:07.779948', NULL, 6, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 'Apple Watch Series 9', 'SP-VIP-006', 1, 8500000.00, 61, 'Tiêu chuẩn / Trắng'),
(9, '2026-07-07 02:57:47.025903', NULL, NULL, NULL, '2026-07-07 02:57:47.025903', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 24650000.00, 1, 'Trắng • Tiêu chuẩn'),
(10, '2026-07-07 03:17:52.800923', NULL, NULL, NULL, '2026-07-07 03:17:52.800923', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 24650000.00, 1, 'Trắng • Tiêu chuẩn'),
(11, '2026-07-07 03:19:50.361605', NULL, NULL, NULL, '2026-07-07 03:19:50.361605', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 24650000.00, 1, 'Trắng • Tiêu chuẩn'),
(12, '2026-07-07 03:27:51.608006', NULL, NULL, NULL, '2026-07-07 03:27:51.608006', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 24650000.00, 1, 'Trắng • Tiêu chuẩn'),
(13, '2026-07-07 03:45:32.857530', NULL, NULL, NULL, '2026-07-07 03:45:32.857530', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 24650000.00, 1, 'Trắng • Tiêu chuẩn'),
(14, '2026-07-07 03:59:29.385628', NULL, NULL, NULL, '2026-07-07 03:59:29.385628', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 29000000.00, 1, 'Trắng • Tiêu chuẩn'),
(15, '2026-07-07 04:12:41.825241', NULL, NULL, NULL, '2026-07-07 04:12:41.825241', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 29000000.00, 1, 'Trắng • Tiêu chuẩn'),
(16, '2026-07-07 04:15:34.142509', NULL, NULL, NULL, '2026-07-07 04:15:34.142509', NULL, 6, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 'Apple Watch Series 9', 'SP-VIP-006', 1, 8500000.00, 61, 'Trắng • Tiêu chuẩn'),
(17, '2026-07-07 04:19:07.194908', NULL, NULL, NULL, '2026-07-07 04:19:07.194908', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(18, '2026-07-07 04:40:06.789484', NULL, NULL, NULL, '2026-07-07 04:40:06.789484', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(19, '2026-07-07 05:18:18.133923', NULL, NULL, NULL, '2026-07-07 05:18:18.133923', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Tiêu chuẩn / Trắng'),
(20, '2026-07-07 05:18:18.140120', NULL, NULL, NULL, '2026-07-07 05:18:18.140120', NULL, 8, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 'Laptop Dell XPS 15', 'SP-VIP-008', 1, 45000000.00, 85, 'Tiêu chuẩn / Trắng'),
(21, '2026-07-07 06:32:25.109459', NULL, NULL, NULL, '2026-07-07 06:32:25.109459', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(22, '2026-07-07 06:32:40.307508', NULL, NULL, NULL, '2026-07-07 06:32:40.307508', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(23, '2026-07-07 06:32:46.771736', NULL, NULL, NULL, '2026-07-07 06:32:46.771736', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(24, '2026-07-07 06:32:58.098893', NULL, NULL, NULL, '2026-07-07 06:32:58.098893', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(25, '2026-07-07 06:34:53.609347', NULL, NULL, NULL, '2026-07-07 06:34:53.609347', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn'),
(26, '2026-07-07 06:35:19.255328', NULL, NULL, NULL, '2026-07-07 06:35:19.255328', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn'),
(27, '2026-07-07 06:35:31.060876', NULL, NULL, NULL, '2026-07-07 06:35:31.060876', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn'),
(28, '2026-07-07 06:37:13.063569', NULL, NULL, NULL, '2026-07-07 06:37:13.063569', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn'),
(29, '2026-07-07 06:47:29.949991', NULL, NULL, NULL, '2026-07-07 06:47:29.949991', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn'),
(30, '2026-07-07 06:53:14.973854', NULL, NULL, NULL, '2026-07-07 06:53:14.973854', NULL, 1, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'iPhone 15 Pro Max', 'SP-VIP-001', 1, 2000.00, 1, 'Trắng • Tiêu chuẩn'),
(31, '2026-07-07 06:57:10.717218', NULL, NULL, NULL, '2026-07-07 06:57:10.717218', NULL, 8, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 'Laptop Dell XPS 15', 'SP-VIP-008', 1, 45000000.00, 85, 'Trắng • Tiêu chuẩn'),
(32, '2026-07-07 06:57:52.574637', NULL, NULL, NULL, '2026-07-07 06:57:52.574637', NULL, 8, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 'Laptop Dell XPS 15', 'SP-VIP-008', 1, 45000000.00, 85, 'Trắng • Tiêu chuẩn'),
(33, '2026-07-07 07:02:40.824543', NULL, NULL, NULL, '2026-07-07 07:02:40.824543', NULL, 8, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 'Laptop Dell XPS 15', 'SP-VIP-008', 1, 45000000.00, 85, 'Trắng • Tiêu chuẩn'),
(34, '2026-07-07 07:07:14.876087', NULL, NULL, NULL, '2026-07-07 07:07:14.876087', NULL, 8, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 'Laptop Dell XPS 15', 'SP-VIP-008', 1, 45000000.00, 85, 'Trắng • Tiêu chuẩn'),
(35, '2026-07-07 07:46:32.290144', NULL, NULL, NULL, '2026-07-07 07:46:32.290144', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn'),
(36, '2026-07-07 07:46:58.818902', NULL, NULL, NULL, '2026-07-07 07:46:58.818902', NULL, 4, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'Sony PlayStation 5', 'SP-VIP-004', 1, 2000.00, 37, 'Trắng • Tiêu chuẩn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `estimated_delivery_date` date DEFAULT NULL,
  `mvd` varchar(32) DEFAULT NULL,
  `order_number` varchar(48) DEFAULT NULL,
  `ordered_date` date NOT NULL,
  `payment_method` varchar(32) DEFAULT NULL,
  `payment_status` varchar(32) DEFAULT NULL,
  `phone_last4` varchar(4) DEFAULT NULL,
  `shipping_address` varchar(500) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `total` decimal(19,2) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `user_name` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `estimated_delivery_date`, `mvd`, `order_number`, `ordered_date`, `payment_method`, `payment_status`, `phone_last4`, `shipping_address`, `status`, `total`, `user_id`, `user_name`) VALUES
(1, '2026-07-02 17:06:32.629448', NULL, NULL, NULL, '2026-07-02 17:19:26.635547', 'admin', '2026-07-06', 'MVD000A131382', 'DH2607021706-2131-614184', '2026-07-01', 'COD', 'PAID', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'DELIVERED', 17900000.00, 15, 'admin'),
(2, '2026-07-02 17:50:38.314024', NULL, NULL, NULL, '2026-07-02 18:06:29.057704', 'admin', '2026-07-06', 'MVDBA140E582E', 'DH2607021750-2131-420685', '2026-07-02', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CONFIRMED', 9000030.00, 15, 'admin'),
(3, '2026-07-02 17:54:42.823910', NULL, NULL, NULL, '2026-07-02 18:01:33.874451', 'admin', NULL, NULL, 'DH2607021754-2131-FE6661', '2026-07-02', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CANCELLED', 8500030.00, 15, 'admin'),
(4, '2026-07-07 02:47:07.621907', NULL, NULL, NULL, '2026-07-07 02:47:07.621907', NULL, NULL, NULL, 'DH2607070247-2131-DEAA30', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 8500000.00, 15, 'admin'),
(5, '2026-07-07 02:57:46.841088', NULL, NULL, NULL, '2026-07-07 02:57:46.842652', NULL, NULL, NULL, 'DH2607070257-2131-42A4D0', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 24650000.00, 15, 'admin'),
(6, '2026-07-07 03:17:52.571258', NULL, NULL, NULL, '2026-07-07 03:17:52.571258', NULL, NULL, NULL, 'DH2607070317-2131-9482EA', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 24650000.00, 15, 'admin'),
(7, '2026-07-07 03:19:50.287977', NULL, NULL, NULL, '2026-07-07 03:19:50.289343', NULL, NULL, NULL, 'DH2607070319-2131-4E97AB', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 24650000.00, 15, 'admin'),
(8, '2026-07-07 03:27:51.520939', NULL, NULL, NULL, '2026-07-07 03:27:51.520939', NULL, NULL, NULL, 'DH2607070327-2131-8349BF', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 24650000.00, 15, 'admin'),
(9, '2026-07-07 03:45:32.738029', NULL, NULL, NULL, '2026-07-07 03:45:32.739033', NULL, NULL, NULL, 'DH2607070345-2131-40A869', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 24650000.00, 15, 'admin'),
(10, '2026-07-07 03:59:28.727363', NULL, NULL, NULL, '2026-07-07 03:59:28.727363', NULL, NULL, NULL, 'DH2607070359-2131-6EEE73', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 29000000.00, 15, 'admin'),
(11, '2026-07-07 04:12:41.763090', NULL, NULL, NULL, '2026-07-07 04:12:41.763090', NULL, NULL, NULL, 'DH2607070412-2131-06A949', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 29000000.00, 15, 'admin'),
(12, '2026-07-07 04:15:34.095163', NULL, NULL, NULL, '2026-07-07 04:15:34.097163', NULL, NULL, NULL, 'DH2607070415-2131-78CB86', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 8000000.00, 15, 'admin'),
(13, '2026-07-07 04:19:07.165272', NULL, NULL, NULL, '2026-07-07 05:20:32.084276', 'KokokoVN', '2026-07-11', 'MVD9225255246', 'DH2607070419-2131-84AFD1', '2026-07-07', 'SEPAY', 'PAID', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CONFIRMED', 2000.00, 15, 'admin'),
(14, '2026-07-07 04:40:06.760711', NULL, NULL, NULL, '2026-07-07 04:59:10.199242', 'KokokoVN', '2026-07-11', 'MVDDF19F1DA27', 'DH2607070440-2131-0564D6', '2026-07-07', 'SEPAY', 'PAID', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CONFIRMED', 2000.00, 15, 'admin'),
(15, '2026-07-07 05:18:18.087545', NULL, NULL, NULL, '2026-07-07 05:18:56.461818', 'KokokoVN', '2026-07-11', 'MVD0AF5F68CD8', 'DH2607070518-2131-BA09E2', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CONFIRMED', 45002000.00, 15, 'admin'),
(16, '2026-07-07 06:32:25.063301', NULL, NULL, NULL, '2026-07-07 06:32:25.063301', NULL, NULL, NULL, 'DH2607070632-2131-BFFC5B', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(17, '2026-07-07 06:32:40.304513', NULL, NULL, NULL, '2026-07-07 06:32:40.304513', NULL, NULL, NULL, 'DH2607070632-2131-5D0654', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(18, '2026-07-07 06:32:46.766196', NULL, NULL, NULL, '2026-07-07 06:32:46.766196', NULL, NULL, NULL, 'DH2607070632-2131-F8A3B5', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(19, '2026-07-07 06:32:58.089401', NULL, NULL, NULL, '2026-07-07 06:32:58.089401', NULL, NULL, NULL, 'DH2607070632-2131-A9473F', '2026-07-07', 'COD', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'CREATED', 2000.00, 15, 'admin'),
(20, '2026-07-07 06:34:53.601753', NULL, NULL, NULL, '2026-07-07 06:34:53.601753', NULL, NULL, NULL, 'DH2607070634-2131-BEC443', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(21, '2026-07-07 06:35:19.252352', NULL, NULL, NULL, '2026-07-07 06:35:19.252352', NULL, NULL, NULL, 'DH2607070635-2131-ECA605', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(22, '2026-07-07 06:35:31.053250', NULL, NULL, NULL, '2026-07-07 06:35:31.053250', NULL, NULL, NULL, 'DH2607070635-2131-B6225D', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(23, '2026-07-07 06:37:13.009160', NULL, NULL, NULL, '2026-07-07 06:37:13.009160', NULL, NULL, NULL, 'DH2607070637-2131-867B68', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(24, '2026-07-07 06:47:29.899951', NULL, NULL, NULL, '2026-07-07 06:47:29.899951', NULL, NULL, NULL, 'DH2607070647-2131-2F743C', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(25, '2026-07-07 06:53:14.956674', NULL, NULL, NULL, '2026-07-07 06:53:14.956674', NULL, NULL, NULL, 'DH2607070653-2131-98C99C', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(26, '2026-07-07 06:57:10.705514', NULL, NULL, NULL, '2026-07-07 06:57:10.705754', NULL, NULL, NULL, 'DH2607070657-2131-A909F5', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 45000000.00, 15, 'admin'),
(27, '2026-07-07 06:57:52.501655', NULL, NULL, NULL, '2026-07-07 06:57:52.501655', NULL, NULL, NULL, 'DH2607070657-2131-120E4E', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 45000000.00, 15, 'admin'),
(28, '2026-07-07 07:02:40.767364', NULL, NULL, NULL, '2026-07-07 07:02:40.767364', NULL, NULL, NULL, 'DH2607070702-2131-FB9777', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 45000000.00, 15, 'admin'),
(29, '2026-07-07 07:07:14.692680', NULL, NULL, NULL, '2026-07-07 07:07:14.693899', NULL, NULL, NULL, 'DH2607070707-2131-14AA2E', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 45000000.00, 15, 'admin'),
(30, '2026-07-07 07:46:32.236403', NULL, NULL, NULL, '2026-07-07 07:46:32.236403', NULL, NULL, NULL, 'DH2607070746-2131-049829', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin'),
(31, '2026-07-07 07:46:58.806742', NULL, NULL, NULL, '2026-07-07 07:46:58.806742', NULL, NULL, NULL, 'DH2607070746-2131-3FE73C', '2026-07-07', 'SEPAY', 'PENDING', '2131', '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', 'PAYMENT_EXPECTED', 2000.00, 15, 'admin');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `order_id` bigint NOT NULL,
  `item_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`order_id`, `item_id`) VALUES
(1, 1),
(2, 2),
(2, 3),
(2, 4),
(3, 5),
(3, 6),
(3, 7),
(4, 8),
(5, 9),
(6, 10),
(7, 11),
(8, 12),
(9, 13),
(10, 14),
(11, 15),
(12, 16),
(13, 17),
(14, 18),
(15, 19),
(15, 20),
(16, 21),
(17, 22),
(18, 23),
(19, 24),
(20, 25),
(21, 26),
(22, 27),
(23, 28),
(24, 29),
(25, 30),
(26, 31),
(27, 32),
(28, 33),
(29, 34),
(30, 35),
(31, 36);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_6lu1qv3ysnboremg2qyvbwyss` (`mvd`),
  ADD UNIQUE KEY `UK_nthkiu7pgmnqnu86i2jyoe2v7` (`order_number`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD KEY `FK88tn2oqcxl1034banqif9r70x` (`item_id`),
  ADD KEY `FKbioxgbv59vetrxe0ejfubep1w` (`order_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `items`
--
ALTER TABLE `items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FK88tn2oqcxl1034banqif9r70x` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `FKbioxgbv59vetrxe0ejfubep1w` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);
--
-- Cơ sở dữ liệu: `payments`
--
CREATE DATABASE IF NOT EXISTS `payments` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `payments`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `amount` decimal(19,4) NOT NULL,
  `currency` varchar(8) DEFAULT NULL,
  `method` varchar(32) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  `status` varchar(32) DEFAULT NULL,
  `transaction_ref` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `amount`, `currency`, `method`, `order_id`, `status`, `transaction_ref`) VALUES
(1, '2026-07-02 17:50:56.499545', NULL, NULL, NULL, '2026-07-02 17:50:56.502874', NULL, 9000030.0000, 'VND', 'SEPAY', 2, 'paid', 'TMP-0f2f1c034d614525'),
(2, '2026-07-07 04:19:18.459029', NULL, NULL, NULL, '2026-07-07 04:19:18.460322', NULL, 2000.0000, 'VND', 'SEPAY', 13, 'PENDING', 'TMP-658796a4dc0f4e57'),
(3, '2026-07-07 04:31:23.442330', NULL, NULL, NULL, '2026-07-07 04:31:29.081613', NULL, 50000.0000, 'VND', 'SEPAY', 9999, 'COMPLETED', 'TEST_UI_CLICK'),
(4, '2026-07-07 04:36:02.913014', NULL, NULL, NULL, '2026-07-07 04:36:18.171807', NULL, 2000.0000, 'VND', 'SEPAY', 13, 'COMPLETED', '682ITC1261885649'),
(5, '2026-07-07 04:40:08.233587', NULL, NULL, NULL, '2026-07-07 04:40:34.520267', NULL, 2000.0000, 'VND', 'SEPAY', 14, 'COMPLETED', '682ITC1261885689'),
(6, '2026-07-07 04:45:14.861038', NULL, NULL, NULL, '2026-07-07 04:45:14.864361', NULL, 2000.0000, 'VND', 'SEPAY', 14, 'PENDING', 'TMP-bd8398f8f6b1441e'),
(7, '2026-07-07 07:00:34.441965', NULL, NULL, NULL, '2026-07-07 07:00:34.445323', NULL, 200000.0000, 'VND', 'SEPAY', 45, 'PENDING', 'TMP-785f6ed956da4d5a');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- Cơ sở dữ liệu: `product_catalog`
--
CREATE DATABASE IF NOT EXISTS `product_catalog` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `product_catalog`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brands`
--

CREATE TABLE `brands` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `logo_url` varchar(1024) DEFAULT NULL,
  `name` varchar(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `brands`
--

INSERT INTO `brands` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `description`, `logo_url`, `name`) VALUES
(1, '2026-07-02 16:14:09.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-04 13:26:42.468503', 'admin', '15', 'Thương hiệu công nghệ hàng đầu thế giới từ Mỹ', '/api/catalog/admin/brands/logos/85cea24f54324803b1d1094b121a90a7.png', 'samsung1'),
(2, '2026-07-02 16:14:09.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:09.000000', NULL, NULL, 'Tập đoàn công nghệ đa quốc gia của Hàn Quốc', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', 'Samsung'),
(3, '2026-07-02 16:14:09.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:09.000000', NULL, NULL, 'Tập đoàn đa quốc gia của Nhật Bản chuyên về điện tử', 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sony_logo.svg', 'Sony');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `is_hidden` bit(1) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `slug` varchar(160) DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `is_hidden`, `name`, `slug`, `parent_id`) VALUES
(1, '2026-07-02 16:14:03.000000', NULL, NULL, '2026-07-04 13:19:58.479724', 'admin', '15', '2026-07-04 13:19:59.107044', 'admin', '15', b'1', 'Điện thoại thông minh1', 'dien-thoai-thong-minh', NULL),
(2, '2026-07-02 16:14:03.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:03.000000', NULL, NULL, b'0', 'Laptop & Máy tính', 'laptop-may-tinh', NULL),
(3, '2026-07-02 16:14:03.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:03.000000', NULL, NULL, b'0', 'Phụ kiện công nghệ', 'phu-kien-cong-nghe', NULL),
(4, '2026-07-02 16:14:03.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:03.000000', NULL, NULL, b'0', 'Thiết bị âm thanh', 'thiet-bi-am-thanh', NULL),
(5, '2026-07-02 16:14:03.000000', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:03.000000', NULL, NULL, b'0', 'Đồng hồ thông minh', 'dong-ho-thong-minh', NULL),
(6, '2026-07-04 13:08:56.539878', 'admin', '15', NULL, NULL, NULL, '2026-07-04 13:08:56.542876', 'admin', '15', b'0', 'Gmail domain cho thuê', 'gmail-domain-cho-thue', NULL),
(7, '2026-07-04 13:17:38.007388', 'admin', '15', NULL, NULL, NULL, '2026-07-04 13:17:38.019927', 'admin', '15', b'0', 'TT Việt NEW có info', 'tt-viet-new-co-info', NULL),
(8, '2026-07-04 13:18:45.437716', 'admin', '15', NULL, NULL, NULL, '2026-07-04 13:18:45.438712', 'admin', '15', b'0', 'TT Việt NEW có info1', 'tt-viet-new-co-info-1', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `availability` int NOT NULL,
  `discription` varchar(255) DEFAULT NULL,
  `is_hidden` bit(1) NOT NULL,
  `price` decimal(19,2) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `sales_count` bigint NOT NULL,
  `sku` varchar(64) DEFAULT NULL,
  `view_count` bigint NOT NULL,
  `brand_id` bigint DEFAULT NULL,
  `category_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `availability`, `discription`, `is_hidden`, `price`, `product_name`, `sales_count`, `sku`, `view_count`, `brand_id`, `category_id`) VALUES
(1, '2026-07-02 16:14:57.418503', NULL, NULL, NULL, NULL, NULL, '2026-07-07 06:53:15.870906', 'admin', '15', 1188, 'Smartphone cao cấp nhất của Apple với khung Titan siêu nhẹ, chip A17 Pro mạnh mẽ.', b'0', 29000000.00, 'iPhone 15 Pro Max', 0, 'SP-VIP-001', 12, 1, 1),
(2, '2026-07-02 16:14:57.894714', NULL, NULL, NULL, NULL, NULL, '2026-07-02 17:46:56.063877', NULL, NULL, 1200, 'Điện thoại AI đỉnh cao từ Samsung, camera 200MP zoom quang học 5x, kèm bút S-Pen.', b'1', 31000000.00, 'Samsung Galaxy S24 Ultra', 0, 'SP-VIP-002', 1, 2, 1),
(3, '2026-07-02 16:14:58.292490', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.947597', NULL, NULL, 1200, 'Laptop chuyên nghiệp trang bị chip M3 siêu mạnh, màn hình Liquid Retina XDR.', b'0', 39000000.00, 'MacBook Pro 14 M3', 0, 'SP-VIP-003', 0, 1, 2),
(4, '2026-07-02 16:14:58.750890', NULL, NULL, NULL, NULL, NULL, '2026-07-07 07:46:59.106783', NULL, NULL, 1192, 'Máy chơi game Console thế hệ mới với ổ cứng SSD tốc độ cao, tay cầm DualSense.', b'0', 15000000.00, 'Sony PlayStation 5', 0, 'SP-VIP-004', 3, 3, 4),
(5, '2026-07-02 16:14:59.233086', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.917089', NULL, NULL, 1200, 'Máy tính bảng mạnh nhất thế giới với chip M4, màn hình OLED siêu mỏng.', b'0', 28000000.00, 'iPad Pro M4 11-inch', 0, 'SP-VIP-005', 0, 1, 3),
(6, '2026-07-02 16:14:59.662303', NULL, NULL, NULL, NULL, NULL, '2026-07-07 04:15:34.808004', NULL, NULL, 1199, 'Đồng hồ thông minh theo dõi sức khỏe, chip S9 mới với tính năng Chạm hai lần (Double Tap).', b'0', 10000000.00, 'Apple Watch Series 9', 0, 'SP-VIP-006', 2, 1, 5),
(7, '2026-07-02 16:15:00.025658', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.728147', NULL, NULL, 1200, 'Tai nghe không dây chống ồn chủ động xuất sắc, chip H2 mang lại âm thanh sống động.', b'0', 6000000.00, 'Tai nghe AirPods Pro 2', 0, 'SP-VIP-007', 0, 1, 4),
(8, '2026-07-02 16:15:00.187400', NULL, NULL, NULL, NULL, NULL, '2026-07-07 07:07:20.628216', NULL, NULL, 1195, 'Laptop Windows cao cấp, màn hình viền mỏng InfinityEdge OLED tuyệt đẹp.', b'0', 45000000.00, 'Laptop Dell XPS 15', 0, 'SP-VIP-008', 5, NULL, 2),
(9, '2026-07-02 16:15:00.329450', NULL, NULL, NULL, NULL, NULL, '2026-07-02 17:38:02.512207', NULL, NULL, 1200, 'Điện thoại gập cao cấp, bản lề Flex siêu khít, đa nhiệm mạnh mẽ.', b'1', 40000000.00, 'Samsung Galaxy Z Fold5', 0, 'SP-VIP-009', 1, 2, 1),
(10, '2026-07-02 16:15:00.488269', NULL, NULL, NULL, NULL, NULL, '2026-07-07 05:42:47.707454', NULL, NULL, 1204, 'Loa Bluetooth phong cách cổ điển, âm thanh uy lực, kết nối ổn định.', b'0', 9000000.00, 'Loa Marshall Stanmore III', 2, 'SP-VIP-010', 10, NULL, 4),
(11, '2026-07-04 14:01:30.111977', NULL, NULL, NULL, NULL, NULL, '2026-07-04 14:01:30.114629', NULL, NULL, 0, 'ádfasdfasdf', b'0', 1.00, 'test', 0, 'SKU-f4938b353362', 0, 1, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_categories`
--

CREATE TABLE `product_categories` (
  `product_id` bigint NOT NULL,
  `category_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `product_categories`
--

INSERT INTO `product_categories` (`product_id`, `category_id`) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 4),
(5, 3),
(6, 5),
(7, 4),
(8, 2),
(9, 1),
(10, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_change_logs`
--

CREATE TABLE `product_change_logs` (
  `id` bigint NOT NULL,
  `changed_at` datetime(6) NOT NULL,
  `changed_by` varchar(120) DEFAULT NULL,
  `changed_by_user_id` varchar(64) DEFAULT NULL,
  `changed_field` varchar(120) NOT NULL,
  `new_value` varchar(2000) DEFAULT NULL,
  `old_value` varchar(2000) DEFAULT NULL,
  `product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `product_change_logs`
--

INSERT INTO `product_change_logs` (`id`, `changed_at`, `changed_by`, `changed_by_user_id`, `changed_field`, `new_value`, `old_value`, `product_id`) VALUES
(1, '2026-07-02 16:17:31.861202', 'admin', '15', 'media_uploaded', 'count=3', NULL, 10),
(2, '2026-07-02 16:17:51.863944', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(3, '2026-07-02 16:17:52.593006', 'admin', NULL, 'variant_updated[109]', 'size=Tiêu chuẩn, color=Trắng, price=9000000', 'size=Tiêu chuẩn, color=Trắng, price=9000000.00', 10),
(4, '2026-07-02 16:18:01.669292', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(5, '2026-07-02 16:18:01.908383', 'admin', NULL, 'variant_updated[110]', 'size=Tiêu chuẩn, color=Đen, price=9000000', 'size=Tiêu chuẩn, color=Đen, price=9000000.00', 10),
(6, '2026-07-02 16:18:36.831618', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(7, '2026-07-02 16:18:36.903540', 'admin', NULL, 'variant_updated[112]', 'size=Tiêu chuẩn, color=Đỏ, price=9000000', 'size=Tiêu chuẩn, color=Đỏ, price=9000000.00', 10),
(8, '2026-07-02 16:18:44.343871', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(9, '2026-07-02 16:18:44.824633', 'admin', NULL, 'variant_updated[113]', 'size=Pro, color=Trắng, price=12000000', 'size=Pro, color=Trắng, price=12000000.00', 10),
(10, '2026-07-02 16:18:55.144628', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(11, '2026-07-02 16:18:55.544494', 'admin', NULL, 'variant_updated[114]', 'size=Pro, color=Đen, price=12000000', 'size=Pro, color=Đen, price=12000000.00', 10),
(12, '2026-07-02 16:19:13.687796', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(13, '2026-07-02 16:19:15.296262', 'admin', NULL, 'variant_updated[115]', 'size=Pro, color=Xanh, price=12000000', 'size=Pro, color=Xanh, price=12000000.00', 10),
(14, '2026-07-02 16:19:30.572945', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(15, '2026-07-02 16:19:30.659798', 'admin', NULL, 'variant_updated[116]', 'size=Pro, color=Đỏ, price=12000000', 'size=Pro, color=Đỏ, price=12000000.00', 10),
(16, '2026-07-02 16:19:40.108704', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(17, '2026-07-02 16:19:40.218868', 'admin', NULL, 'variant_updated[117]', 'size=Ultra, color=Trắng, price=15000000', 'size=Ultra, color=Trắng, price=15000000.00', 10),
(18, '2026-07-02 16:19:48.480402', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(19, '2026-07-02 16:19:48.772452', 'admin', NULL, 'variant_updated[118]', 'size=Ultra, color=Đen, price=15000000', 'size=Ultra, color=Đen, price=15000000.00', 10),
(20, '2026-07-02 16:20:06.857525', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(21, '2026-07-02 16:20:07.103433', 'admin', NULL, 'variant_updated[119]', 'size=Ultra, color=Xanh, price=15000000', 'size=Ultra, color=Xanh, price=15000000.00', 10),
(22, '2026-07-02 16:20:14.800546', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10),
(23, '2026-07-02 16:20:15.094486', 'admin', NULL, 'variant_updated[120]', 'size=Ultra, color=Đỏ, price=15000000', 'size=Ultra, color=Đỏ, price=15000000.00', 10),
(24, '2026-07-02 16:21:26.020470', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(25, '2026-07-02 16:22:33.372875', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(26, '2026-07-02 16:22:34.045953', 'admin', NULL, 'variant_updated[99]', 'size=Tiêu chuẩn, color=Xanh, price=40000000', 'size=Tiêu chuẩn, color=Xanh, price=40000000.00', 9),
(27, '2026-07-02 16:22:41.384084', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(28, '2026-07-02 16:22:41.755098', 'admin', NULL, 'variant_updated[100]', 'size=Tiêu chuẩn, color=Đỏ, price=40000000', 'size=Tiêu chuẩn, color=Đỏ, price=40000000.00', 9),
(29, '2026-07-02 16:22:49.597789', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(30, '2026-07-02 16:22:50.241771', 'admin', NULL, 'variant_updated[101]', 'size=Pro, color=Trắng, price=43000000', 'size=Pro, color=Trắng, price=43000000.00', 9),
(31, '2026-07-02 16:23:06.592580', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(32, '2026-07-02 16:23:08.402513', 'admin', NULL, 'variant_updated[102]', 'size=Pro, color=Đen, price=43000000', 'size=Pro, color=Đen, price=43000000.00', 9),
(33, '2026-07-02 16:23:18.498377', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(34, '2026-07-02 16:23:18.961322', 'admin', NULL, 'variant_updated[103]', 'size=Pro, color=Xanh, price=43000000', 'size=Pro, color=Xanh, price=43000000.00', 9),
(35, '2026-07-02 16:23:26.860375', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(36, '2026-07-02 16:23:27.110889', 'admin', NULL, 'variant_updated[104]', 'size=Pro, color=Đỏ, price=43000000', 'size=Pro, color=Đỏ, price=43000000.00', 9),
(37, '2026-07-02 16:23:35.825591', 'admin', '15', 'media_uploaded', 'count=1', NULL, 9),
(38, '2026-07-02 16:23:35.987858', 'admin', NULL, 'variant_updated[105]', 'size=Ultra, color=Trắng, price=46000000', 'size=Ultra, color=Trắng, price=46000000.00', 9),
(39, '2026-07-02 16:24:27.661972', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(40, '2026-07-02 16:24:38.255126', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(41, '2026-07-02 16:24:38.859411', 'admin', NULL, 'variant_updated[73]', 'size=Tiêu chuẩn, color=Trắng, price=6000000', 'size=Tiêu chuẩn, color=Trắng, price=6000000.00', 7),
(42, '2026-07-02 16:24:47.486181', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(43, '2026-07-02 16:24:47.642237', 'admin', NULL, 'variant_updated[74]', 'size=Tiêu chuẩn, color=Đen, price=6000000', 'size=Tiêu chuẩn, color=Đen, price=6000000.00', 7),
(44, '2026-07-02 16:24:53.976455', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(45, '2026-07-02 16:24:54.183257', 'admin', NULL, 'variant_updated[75]', 'size=Tiêu chuẩn, color=Xanh, price=6000000', 'size=Tiêu chuẩn, color=Xanh, price=6000000.00', 7),
(46, '2026-07-02 16:25:00.381045', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(47, '2026-07-02 16:25:00.472124', 'admin', NULL, 'variant_updated[76]', 'size=Tiêu chuẩn, color=Đỏ, price=6000000', 'size=Tiêu chuẩn, color=Đỏ, price=6000000.00', 7),
(48, '2026-07-02 16:25:06.252122', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(49, '2026-07-02 16:25:06.627253', 'admin', NULL, 'variant_updated[77]', 'size=Pro, color=Trắng, price=9000000', 'size=Pro, color=Trắng, price=9000000.00', 7),
(50, '2026-07-02 16:25:14.051242', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(51, '2026-07-02 16:25:14.147697', 'admin', NULL, 'variant_updated[78]', 'size=Pro, color=Đen, price=9000000', 'size=Pro, color=Đen, price=9000000.00', 7),
(52, '2026-07-02 16:25:19.870241', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(53, '2026-07-02 16:25:19.975161', 'admin', NULL, 'variant_updated[79]', 'size=Pro, color=Xanh, price=9000000', 'size=Pro, color=Xanh, price=9000000.00', 7),
(54, '2026-07-02 16:25:28.073180', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(55, '2026-07-02 16:25:28.720425', 'admin', NULL, 'variant_updated[80]', 'size=Pro, color=Đỏ, price=9000000', 'size=Pro, color=Đỏ, price=9000000.00', 7),
(56, '2026-07-02 16:25:35.617899', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(57, '2026-07-02 16:25:35.885099', 'admin', NULL, 'variant_updated[81]', 'size=Ultra, color=Trắng, price=12000000', 'size=Ultra, color=Trắng, price=12000000.00', 7),
(58, '2026-07-02 16:25:43.398698', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(59, '2026-07-02 16:25:43.469879', 'admin', NULL, 'variant_updated[82]', 'size=Ultra, color=Đen, price=12000000', 'size=Ultra, color=Đen, price=12000000.00', 7),
(60, '2026-07-02 16:25:49.317840', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(61, '2026-07-02 16:25:49.608997', 'admin', NULL, 'variant_updated[83]', 'size=Ultra, color=Xanh, price=12000000', 'size=Ultra, color=Xanh, price=12000000.00', 7),
(62, '2026-07-02 16:25:56.844799', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(63, '2026-07-02 16:25:57.059796', 'admin', NULL, 'variant_updated[84]', 'size=Ultra, color=Đỏ, price=12000000', 'size=Ultra, color=Đỏ, price=12000000.00', 7),
(64, '2026-07-02 16:26:25.299064', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(65, '2026-07-02 16:26:34.081476', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(66, '2026-07-02 16:26:34.341214', 'admin', NULL, 'variant_updated[85]', 'size=Tiêu chuẩn, color=Trắng, price=45000000', 'size=Tiêu chuẩn, color=Trắng, price=45000000.00', 8),
(67, '2026-07-02 16:26:42.725351', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(68, '2026-07-02 16:26:42.915914', 'admin', NULL, 'variant_updated[86]', 'size=Tiêu chuẩn, color=Đen, price=45000000', 'size=Tiêu chuẩn, color=Đen, price=45000000.00', 8),
(69, '2026-07-02 16:26:48.535654', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(70, '2026-07-02 16:26:48.727013', 'admin', NULL, 'variant_updated[87]', 'size=Tiêu chuẩn, color=Xanh, price=45000000', 'size=Tiêu chuẩn, color=Xanh, price=45000000.00', 8),
(71, '2026-07-02 16:26:54.429777', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(72, '2026-07-02 16:26:54.645659', 'admin', NULL, 'variant_updated[88]', 'size=Tiêu chuẩn, color=Đỏ, price=45000000', 'size=Tiêu chuẩn, color=Đỏ, price=45000000.00', 8),
(73, '2026-07-02 16:27:01.033064', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(74, '2026-07-02 16:27:01.309490', 'admin', NULL, 'variant_updated[89]', 'size=Pro, color=Trắng, price=48000000', 'size=Pro, color=Trắng, price=48000000.00', 8),
(75, '2026-07-02 16:27:07.177419', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(76, '2026-07-02 16:27:07.308775', 'admin', NULL, 'variant_updated[90]', 'size=Pro, color=Đen, price=48000000', 'size=Pro, color=Đen, price=48000000.00', 8),
(77, '2026-07-02 16:27:13.611161', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(78, '2026-07-02 16:27:13.808865', 'admin', NULL, 'variant_updated[91]', 'size=Pro, color=Xanh, price=48000000', 'size=Pro, color=Xanh, price=48000000.00', 8),
(79, '2026-07-02 16:27:22.363067', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(80, '2026-07-02 16:27:22.658840', 'admin', NULL, 'variant_updated[92]', 'size=Pro, color=Đỏ, price=48000000', 'size=Pro, color=Đỏ, price=48000000.00', 8),
(81, '2026-07-02 16:27:29.797567', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(82, '2026-07-02 16:27:30.041751', 'admin', NULL, 'variant_updated[93]', 'size=Ultra, color=Trắng, price=51000000', 'size=Ultra, color=Trắng, price=51000000.00', 8),
(83, '2026-07-02 16:27:37.189371', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(84, '2026-07-02 16:27:37.383713', 'admin', NULL, 'variant_updated[95]', 'size=Ultra, color=Xanh, price=51000000', 'size=Ultra, color=Xanh, price=51000000.00', 8),
(85, '2026-07-02 16:27:44.061528', 'admin', '15', 'media_uploaded', 'count=1', NULL, 8),
(86, '2026-07-02 16:27:44.247543', 'admin', NULL, 'variant_updated[96]', 'size=Ultra, color=Đỏ, price=51000000', 'size=Ultra, color=Đỏ, price=51000000.00', 8),
(87, '2026-07-02 16:28:14.215358', 'admin', '15', 'media_deleted[23]', NULL, 'url=/api/catalog/admin/products/images/file/6b4d1795fd594136864d2bc5d61f1133.webp, type=IMAGE', 7),
(88, '2026-07-02 16:28:18.048345', 'admin', '15', 'media_deleted[24]', NULL, 'url=/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp, type=IMAGE', 7),
(89, '2026-07-02 16:28:26.229901', 'admin', '15', 'media_uploaded', 'count=1', NULL, 7),
(90, '2026-07-02 16:29:06.360039', 'admin', '15', 'media_uploaded', 'count=1', NULL, 6),
(91, '2026-07-02 16:29:40.504623', 'admin', '15', 'media_uploaded', 'count=1', NULL, 5),
(92, '2026-07-02 16:30:10.236932', 'admin', '15', 'media_uploaded', 'count=1', NULL, 4),
(93, '2026-07-02 16:30:38.669869', 'admin', '15', 'media_uploaded', 'count=1', NULL, 3),
(94, '2026-07-02 16:31:18.907520', 'admin', '15', 'media_uploaded', 'count=1', NULL, 2),
(95, '2026-07-02 16:31:49.036497', 'admin', '15', 'media_uploaded', 'count=1', NULL, 1),
(96, '2026-07-04 14:01:32.137351', 'admin', '15', 'product_created', 'name=test, price=1', NULL, 11),
(97, '2026-07-04 14:01:58.891777', 'admin', '15', 'media_uploaded', 'count=2', NULL, 11),
(98, '2026-07-06 21:37:57.447817', 'admin', '15', 'media_uploaded', 'count=1', NULL, 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `media_type` varchar(32) NOT NULL,
  `is_primary` bit(1) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `storage_path` varchar(1024) NOT NULL,
  `product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `product_images`
--

INSERT INTO `product_images` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `image_url`, `media_type`, `is_primary`, `sort_order`, `storage_path`, `product_id`) VALUES
(1, '2026-07-02 16:17:31.697736', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 21:37:57.431773', 'admin', NULL, '/api/catalog/admin/products/images/file/aac2f623e1374253a9fa54c49aaf765c.webp', 'IMAGE', b'0', 1, 'aac2f623e1374253a9fa54c49aaf765c.webp', 10),
(2, '2026-07-02 16:17:31.787019', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:17:31.787019', 'admin', NULL, '/api/catalog/admin/products/images/file/bf3c157d16a04f7eb62ec24d9e216f4c.webp', 'IMAGE', b'0', 2, 'bf3c157d16a04f7eb62ec24d9e216f4c.webp', 10),
(3, '2026-07-02 16:17:31.800059', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:17:31.800059', 'admin', NULL, '/api/catalog/admin/products/images/file/e93fadb20230450998afebcfc8c06ef2.webp', 'IMAGE', b'0', 3, 'e93fadb20230450998afebcfc8c06ef2.webp', 10),
(4, '2026-07-02 16:17:51.828058', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:17:51.828058', 'admin', NULL, '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 'IMAGE', b'0', 4, 'e88d36f85e0e49b19919285377fd0849.webp', 10),
(5, '2026-07-02 16:18:01.653259', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:18:01.653259', 'admin', NULL, '/api/catalog/admin/products/images/file/5aba4243868f4b21b5b823ae2c231b8c.webp', 'IMAGE', b'0', 5, '5aba4243868f4b21b5b823ae2c231b8c.webp', 10),
(6, '2026-07-02 16:18:36.825610', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:18:36.825610', 'admin', NULL, '/api/catalog/admin/products/images/file/c3ddb8f79e3b4408937d71a7632a3dc1.webp', 'IMAGE', b'0', 6, 'c3ddb8f79e3b4408937d71a7632a3dc1.webp', 10),
(7, '2026-07-02 16:18:44.327076', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:18:44.327076', 'admin', NULL, '/api/catalog/admin/products/images/file/1830e7e1d8734a769b1289a5fd8c53fb.webp', 'IMAGE', b'0', 7, '1830e7e1d8734a769b1289a5fd8c53fb.webp', 10),
(8, '2026-07-02 16:18:55.127995', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:18:55.127995', 'admin', NULL, '/api/catalog/admin/products/images/file/e6521e3e2ec04c219823300e0d906d45.webp', 'IMAGE', b'0', 8, 'e6521e3e2ec04c219823300e0d906d45.webp', 10),
(9, '2026-07-02 16:19:13.663323', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:19:13.663323', 'admin', NULL, '/api/catalog/admin/products/images/file/edd9ae8dc10f46fab53a94762d3c2fc4.webp', 'IMAGE', b'0', 9, 'edd9ae8dc10f46fab53a94762d3c2fc4.webp', 10),
(10, '2026-07-02 16:19:30.567836', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:19:30.567836', 'admin', NULL, '/api/catalog/admin/products/images/file/143d4edd1d1c47c8bb60f0a23b2d750f.webp', 'IMAGE', b'0', 10, '143d4edd1d1c47c8bb60f0a23b2d750f.webp', 10),
(11, '2026-07-02 16:19:40.102154', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:19:40.102154', 'admin', NULL, '/api/catalog/admin/products/images/file/01d3ac175f5947bd94b8c94fe958e2ad.webp', 'IMAGE', b'0', 11, '01d3ac175f5947bd94b8c94fe958e2ad.webp', 10),
(12, '2026-07-02 16:19:48.469657', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:19:48.469657', 'admin', NULL, '/api/catalog/admin/products/images/file/10098d2812dd4aec8ff57a26938d6dfa.webp', 'IMAGE', b'0', 12, '10098d2812dd4aec8ff57a26938d6dfa.webp', 10),
(13, '2026-07-02 16:20:06.851545', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:20:06.851545', 'admin', NULL, '/api/catalog/admin/products/images/file/406317e0a9db4dfcbbe6a1063f0afd39.webp', 'IMAGE', b'0', 13, '406317e0a9db4dfcbbe6a1063f0afd39.webp', 10),
(14, '2026-07-02 16:20:14.784172', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:20:14.784172', 'admin', NULL, '/api/catalog/admin/products/images/file/ba423091409543f4ba060be275e0b9b3.webp', 'IMAGE', b'0', 14, 'ba423091409543f4ba060be275e0b9b3.webp', 10),
(15, '2026-07-02 16:21:25.952588', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:21:25.953551', 'admin', NULL, '/api/catalog/admin/products/images/file/b42f9c12c22841e6810dda0305a2d351.jpg', 'IMAGE', b'1', 1, 'b42f9c12c22841e6810dda0305a2d351.jpg', 9),
(16, '2026-07-02 16:22:33.363651', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:22:33.363651', 'admin', NULL, '/api/catalog/admin/products/images/file/6ff28db975a2416184317e9563a9e58c.jpg', 'IMAGE', b'0', 2, '6ff28db975a2416184317e9563a9e58c.jpg', 9),
(17, '2026-07-02 16:22:41.377054', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:22:41.377054', 'admin', NULL, '/api/catalog/admin/products/images/file/a95b036e60ff47af9172a7680d951197.jpg', 'IMAGE', b'0', 3, 'a95b036e60ff47af9172a7680d951197.jpg', 9),
(18, '2026-07-02 16:22:49.576055', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:22:49.576055', 'admin', NULL, '/api/catalog/admin/products/images/file/d35c6ebe98cd4787bfcfd6bcadaa50fc.jpg', 'IMAGE', b'0', 4, 'd35c6ebe98cd4787bfcfd6bcadaa50fc.jpg', 9),
(19, '2026-07-02 16:23:06.430903', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:23:06.430903', 'admin', NULL, '/api/catalog/admin/products/images/file/6600d4c4a96f4cf9baf3e5324050f979.jpg', 'IMAGE', b'0', 5, '6600d4c4a96f4cf9baf3e5324050f979.jpg', 9),
(20, '2026-07-02 16:23:18.476471', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:23:18.476471', 'admin', NULL, '/api/catalog/admin/products/images/file/b4e0c1d9b7dc4634aa9f2517c6c14c48.webp', 'IMAGE', b'0', 6, 'b4e0c1d9b7dc4634aa9f2517c6c14c48.webp', 9),
(21, '2026-07-02 16:23:26.857615', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:23:26.857615', 'admin', NULL, '/api/catalog/admin/products/images/file/820ec25ee85e402daa84c419c0382a9e.jpg', 'IMAGE', b'0', 7, '820ec25ee85e402daa84c419c0382a9e.jpg', 9),
(22, '2026-07-02 16:23:35.806421', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:23:35.806421', 'admin', NULL, '/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg', 'IMAGE', b'0', 8, '609ca625df3f46ceabf85beb4886205b.jpg', 9),
(25, '2026-07-02 16:24:47.469674', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:28:26.218967', 'admin', NULL, '/api/catalog/admin/products/images/file/c56111c0da7049f8b90aa7d924e70ce3.webp', 'IMAGE', b'0', 3, 'c56111c0da7049f8b90aa7d924e70ce3.webp', 7),
(26, '2026-07-02 16:24:53.966418', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:24:53.966418', 'admin', NULL, '/api/catalog/admin/products/images/file/be3ae947845248e489cccb6785825104.webp', 'IMAGE', b'0', 4, 'be3ae947845248e489cccb6785825104.webp', 7),
(27, '2026-07-02 16:25:00.381045', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:00.381045', 'admin', NULL, '/api/catalog/admin/products/images/file/e8b818df5dff416dbd8c0b8f1ab5263d.webp', 'IMAGE', b'0', 5, 'e8b818df5dff416dbd8c0b8f1ab5263d.webp', 7),
(28, '2026-07-02 16:25:06.237530', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:06.237530', 'admin', NULL, '/api/catalog/admin/products/images/file/43e6af48caeb4d53805964214263b788.webp', 'IMAGE', b'0', 6, '43e6af48caeb4d53805964214263b788.webp', 7),
(29, '2026-07-02 16:25:14.039146', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:14.039146', 'admin', NULL, '/api/catalog/admin/products/images/file/8dd4474227c5416991e6bd1c03de3089.webp', 'IMAGE', b'0', 7, '8dd4474227c5416991e6bd1c03de3089.webp', 7),
(30, '2026-07-02 16:25:19.864241', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:19.864241', 'admin', NULL, '/api/catalog/admin/products/images/file/3c7eeef0f3fc4b1ba235e231ac98d278.webp', 'IMAGE', b'0', 8, '3c7eeef0f3fc4b1ba235e231ac98d278.webp', 7),
(31, '2026-07-02 16:25:28.054537', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:28.054537', 'admin', NULL, '/api/catalog/admin/products/images/file/a23ded0d81e348f0a654bbf6f8ef8b3e.webp', 'IMAGE', b'0', 9, 'a23ded0d81e348f0a654bbf6f8ef8b3e.webp', 7),
(32, '2026-07-02 16:25:35.605040', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:35.605040', 'admin', NULL, '/api/catalog/admin/products/images/file/bf359efd8f3a44dcbcd4101bd225812c.webp', 'IMAGE', b'0', 10, 'bf359efd8f3a44dcbcd4101bd225812c.webp', 7),
(33, '2026-07-02 16:25:43.395931', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:43.395931', 'admin', NULL, '/api/catalog/admin/products/images/file/8788a65897694ba8b1d81956434527cf.webp', 'IMAGE', b'0', 11, '8788a65897694ba8b1d81956434527cf.webp', 7),
(34, '2026-07-02 16:25:49.301575', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:49.301575', 'admin', NULL, '/api/catalog/admin/products/images/file/fa912d6f33044142bf3d13f550d098da.webp', 'IMAGE', b'0', 12, 'fa912d6f33044142bf3d13f550d098da.webp', 7),
(35, '2026-07-02 16:25:56.831092', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:25:56.831092', 'admin', NULL, '/api/catalog/admin/products/images/file/05606ef551f24fdfae7ed9a96cafdbbf.webp', 'IMAGE', b'0', 13, '05606ef551f24fdfae7ed9a96cafdbbf.webp', 7),
(36, '2026-07-02 16:26:25.284022', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:26:25.284022', 'admin', NULL, '/api/catalog/admin/products/images/file/131ada4cc0044c0e8c34eb7528fdf156.webp', 'IMAGE', b'1', 1, '131ada4cc0044c0e8c34eb7528fdf156.webp', 8),
(37, '2026-07-02 16:26:34.074994', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:26:34.074994', 'admin', NULL, '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 'IMAGE', b'0', 2, '77fef42d6ab04c409fdfd31dae1de65e.webp', 8),
(38, '2026-07-02 16:26:42.718797', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:26:42.719748', 'admin', NULL, '/api/catalog/admin/products/images/file/5c895a08682e4613ac954bbc094285ff.webp', 'IMAGE', b'0', 3, '5c895a08682e4613ac954bbc094285ff.webp', 8),
(39, '2026-07-02 16:26:48.526446', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:26:48.528501', 'admin', NULL, '/api/catalog/admin/products/images/file/00e28b7d3e0948eba06b63854d33d4dc.webp', 'IMAGE', b'0', 4, '00e28b7d3e0948eba06b63854d33d4dc.webp', 8),
(40, '2026-07-02 16:26:54.409492', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:26:54.409492', 'admin', NULL, '/api/catalog/admin/products/images/file/84374380fd1541bab6c2e5773e0485f9.webp', 'IMAGE', b'0', 5, '84374380fd1541bab6c2e5773e0485f9.webp', 8),
(41, '2026-07-02 16:27:01.022106', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:01.022106', 'admin', NULL, '/api/catalog/admin/products/images/file/f6de580b27cb4d8cb96a762294a0d93b.webp', 'IMAGE', b'0', 6, 'f6de580b27cb4d8cb96a762294a0d93b.webp', 8),
(42, '2026-07-02 16:27:07.150396', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:07.150396', 'admin', NULL, '/api/catalog/admin/products/images/file/f10df1688b0d425198b726f4c292f650.webp', 'IMAGE', b'0', 7, 'f10df1688b0d425198b726f4c292f650.webp', 8),
(43, '2026-07-02 16:27:13.601742', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:13.601742', 'admin', NULL, '/api/catalog/admin/products/images/file/ad1f51ad36904352af03a32d3361174e.webp', 'IMAGE', b'0', 8, 'ad1f51ad36904352af03a32d3361174e.webp', 8),
(44, '2026-07-02 16:27:22.351788', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:22.351788', 'admin', NULL, '/api/catalog/admin/products/images/file/4dabf0c6e1044a1d9bf5eceba6524f67.webp', 'IMAGE', b'0', 9, '4dabf0c6e1044a1d9bf5eceba6524f67.webp', 8),
(45, '2026-07-02 16:27:29.786469', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:29.786469', 'admin', NULL, '/api/catalog/admin/products/images/file/36bf360afd9740e2a9d42667879a2601.webp', 'IMAGE', b'0', 10, '36bf360afd9740e2a9d42667879a2601.webp', 8),
(46, '2026-07-02 16:27:37.167670', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:37.167670', 'admin', NULL, '/api/catalog/admin/products/images/file/2231701ddf6048d0aaca30ef7581a46b.webp', 'IMAGE', b'0', 11, '2231701ddf6048d0aaca30ef7581a46b.webp', 8),
(47, '2026-07-02 16:27:44.056528', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:27:44.056528', 'admin', NULL, '/api/catalog/admin/products/images/file/f47cd9653ef24cf6a712efb66465b475.webp', 'IMAGE', b'0', 12, 'f47cd9653ef24cf6a712efb66465b475.webp', 8),
(48, '2026-07-02 16:28:26.212979', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:28:26.212979', 'admin', NULL, '/api/catalog/admin/products/images/file/404304318ee84415b43241e57b409651.webp', 'IMAGE', b'1', 14, '404304318ee84415b43241e57b409651.webp', 7),
(49, '2026-07-02 16:29:06.335270', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:29:06.335270', 'admin', NULL, '/api/catalog/admin/products/images/file/5b67538ba5b8469696cac2b1b0004692.webp', 'IMAGE', b'1', 1, '5b67538ba5b8469696cac2b1b0004692.webp', 6),
(50, '2026-07-02 16:29:40.433772', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:29:40.439862', 'admin', NULL, '/api/catalog/admin/products/images/file/98a6cc3e6e984c1db8f78ca2cacaacb6.webp', 'IMAGE', b'1', 1, '98a6cc3e6e984c1db8f78ca2cacaacb6.webp', 5),
(51, '2026-07-02 16:30:10.218437', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:30:10.218437', 'admin', NULL, '/api/catalog/admin/products/images/file/2e437fe1874e4a3688fbbec610d3c9ec.jpg', 'IMAGE', b'1', 1, '2e437fe1874e4a3688fbbec610d3c9ec.jpg', 4),
(52, '2026-07-02 16:30:38.657900', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:30:38.657900', 'admin', NULL, '/api/catalog/admin/products/images/file/74e1703c16594800ba798cd85382817c.webp', 'IMAGE', b'1', 1, '74e1703c16594800ba798cd85382817c.webp', 3),
(53, '2026-07-02 16:31:18.891217', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:31:18.891217', 'admin', NULL, '/api/catalog/admin/products/images/file/fd15318deed546c29e3c94dac79695a4.jpg', 'IMAGE', b'1', 1, 'fd15318deed546c29e3c94dac79695a4.jpg', 2),
(54, '2026-07-02 16:31:49.017196', 'admin', NULL, NULL, NULL, NULL, '2026-07-02 16:31:49.017196', 'admin', NULL, '/api/catalog/admin/products/images/file/0894e7465767466f8887443cc6939c58.webp', 'IMAGE', b'1', 1, '0894e7465767466f8887443cc6939c58.webp', 1),
(55, '2026-07-04 14:01:58.817174', 'admin', NULL, NULL, NULL, NULL, '2026-07-04 14:01:58.821979', 'admin', NULL, '/api/catalog/admin/products/images/file/4cc6daa01ad9403ab3027c0a0f3cb7ac.jpg', 'IMAGE', b'1', 1, '4cc6daa01ad9403ab3027c0a0f3cb7ac.jpg', 11),
(56, '2026-07-04 14:01:58.864396', 'admin', NULL, NULL, NULL, NULL, '2026-07-04 14:01:58.864396', 'admin', NULL, '/api/catalog/admin/products/images/file/5bd0b66e62004935814d205769c9d009.mp4', 'VIDEO', b'0', 2, '5bd0b66e62004935814d205769c9d009.mp4', 11),
(57, '2026-07-06 21:37:57.333396', 'admin', NULL, NULL, NULL, NULL, '2026-07-06 21:37:57.335399', 'admin', NULL, '/api/catalog/admin/products/images/file/fb2c139671ff497ca54e455d36f6bad2.jpg', 'IMAGE', b'1', 15, 'fb2c139671ff497ca54e455d36f6bad2.jpg', 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_technical_specs`
--

CREATE TABLE `product_technical_specs` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `spec_group` varchar(120) DEFAULT NULL,
  `spec_key` varchar(120) NOT NULL,
  `spec_value` varchar(1000) NOT NULL,
  `unit` varchar(64) DEFAULT NULL,
  `product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `product_technical_specs`
--

INSERT INTO `product_technical_specs` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `sort_order`, `spec_group`, `spec_key`, `spec_value`, `unit`, `product_id`) VALUES
(1, '2026-07-02 16:14:57.704588', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.704588', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 1),
(2, '2026-07-02 16:14:57.715075', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.715075', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 1),
(3, '2026-07-02 16:14:57.719091', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.719091', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 1),
(4, '2026-07-02 16:14:57.724772', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.724772', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 1),
(5, '2026-07-02 16:14:57.724772', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.724772', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 1),
(6, '2026-07-02 16:14:57.735197', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.735197', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 1),
(7, '2026-07-02 16:14:57.742142', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.742142', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 1),
(8, '2026-07-02 16:14:57.748184', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.748184', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 1),
(9, '2026-07-02 16:14:57.753959', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.753959', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 1),
(10, '2026-07-02 16:14:57.757978', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.757978', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 1),
(11, '2026-07-02 16:14:57.759985', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.759985', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 1),
(12, '2026-07-02 16:14:57.767085', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.767085', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 1),
(13, '2026-07-02 16:14:57.775518', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.775518', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 1),
(14, '2026-07-02 16:14:57.791971', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.791971', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 1),
(15, '2026-07-02 16:14:57.799962', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.799962', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 1),
(16, '2026-07-02 16:14:57.814824', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.814824', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 1),
(17, '2026-07-02 16:14:57.846664', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.846664', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 1),
(18, '2026-07-02 16:14:57.847197', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.847197', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 1),
(19, '2026-07-02 16:14:57.862147', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.862147', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 1),
(20, '2026-07-02 16:14:57.877922', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:57.877922', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 1),
(21, '2026-07-02 16:14:58.075375', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.075375', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 2),
(22, '2026-07-02 16:14:58.080514', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.080514', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 2),
(23, '2026-07-02 16:14:58.085165', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.085165', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 2),
(24, '2026-07-02 16:14:58.090171', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.090171', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 2),
(25, '2026-07-02 16:14:58.093685', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.093685', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 2),
(26, '2026-07-02 16:14:58.093685', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.093685', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 2),
(27, '2026-07-02 16:14:58.109987', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.109987', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 2),
(28, '2026-07-02 16:14:58.111991', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.111991', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 2),
(29, '2026-07-02 16:14:58.111991', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.111991', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 2),
(30, '2026-07-02 16:14:58.141444', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.141444', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 2),
(31, '2026-07-02 16:14:58.142457', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.142457', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 2),
(32, '2026-07-02 16:14:58.157970', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.157970', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 2),
(33, '2026-07-02 16:14:58.172957', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.172957', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 2),
(34, '2026-07-02 16:14:58.188719', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.188719', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 2),
(35, '2026-07-02 16:14:58.204820', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.204820', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 2),
(36, '2026-07-02 16:14:58.220271', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.220271', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 2),
(37, '2026-07-02 16:14:58.236119', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.236119', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 2),
(38, '2026-07-02 16:14:58.252880', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.252880', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 2),
(39, '2026-07-02 16:14:58.268300', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.268300', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 2),
(40, '2026-07-02 16:14:58.289012', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.289012', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 2),
(41, '2026-07-02 16:14:58.470454', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.470454', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 3),
(42, '2026-07-02 16:14:58.502856', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.502856', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 3),
(43, '2026-07-02 16:14:58.507193', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.507193', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 3),
(44, '2026-07-02 16:14:58.521353', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.521353', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 3),
(45, '2026-07-02 16:14:58.526546', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.526546', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 3),
(46, '2026-07-02 16:14:58.540218', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.540218', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 3),
(47, '2026-07-02 16:14:58.561714', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.561714', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 3),
(48, '2026-07-02 16:14:58.566703', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.566703', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 3),
(49, '2026-07-02 16:14:58.579794', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.579794', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 3),
(50, '2026-07-02 16:14:58.593029', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.593029', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 3),
(51, '2026-07-02 16:14:58.607533', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.607533', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 3),
(52, '2026-07-02 16:14:58.612594', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.612594', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 3),
(53, '2026-07-02 16:14:58.625762', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.625762', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 3),
(54, '2026-07-02 16:14:58.644091', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.644091', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 3),
(55, '2026-07-02 16:14:58.660887', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.660887', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 3),
(56, '2026-07-02 16:14:58.676464', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.676464', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 3),
(57, '2026-07-02 16:14:58.680478', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.680478', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 3),
(58, '2026-07-02 16:14:58.692721', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.692721', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 3),
(59, '2026-07-02 16:14:58.716186', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.719955', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 3),
(60, '2026-07-02 16:14:58.719955', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.719955', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 3),
(61, '2026-07-02 16:14:58.973195', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.973195', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 4),
(62, '2026-07-02 16:14:58.977359', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:58.977359', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 4),
(63, '2026-07-02 16:14:59.046591', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.046591', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 4),
(64, '2026-07-02 16:14:59.049592', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.049592', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 4),
(65, '2026-07-02 16:14:59.062487', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.062487', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 4),
(66, '2026-07-02 16:14:59.074824', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.074824', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 4),
(67, '2026-07-02 16:14:59.075767', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.075767', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 4),
(68, '2026-07-02 16:14:59.092743', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.092743', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 4),
(69, '2026-07-02 16:14:59.107112', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.107112', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 4),
(70, '2026-07-02 16:14:59.124441', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.124441', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 4),
(71, '2026-07-02 16:14:59.142158', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.142158', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 4),
(72, '2026-07-02 16:14:59.170142', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.170142', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 4),
(73, '2026-07-02 16:14:59.170142', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.170142', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 4),
(74, '2026-07-02 16:14:59.170142', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.170142', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 4),
(75, '2026-07-02 16:14:59.185852', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.185852', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 4),
(76, '2026-07-02 16:14:59.185852', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.185852', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 4),
(77, '2026-07-02 16:14:59.192360', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.192360', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 4),
(78, '2026-07-02 16:14:59.202671', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.202671', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 4),
(79, '2026-07-02 16:14:59.217364', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.217364', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 4),
(80, '2026-07-02 16:14:59.217364', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.217364', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 4),
(81, '2026-07-02 16:14:59.376391', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.376391', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 5),
(82, '2026-07-02 16:14:59.407588', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.407588', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 5),
(83, '2026-07-02 16:14:59.422855', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.422855', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 5),
(84, '2026-07-02 16:14:59.442153', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.442153', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 5),
(85, '2026-07-02 16:14:59.455911', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.455911', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 5),
(86, '2026-07-02 16:14:59.472496', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.472496', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 5),
(87, '2026-07-02 16:14:59.487739', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.487739', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 5),
(88, '2026-07-02 16:14:59.502875', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.502875', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 5),
(89, '2026-07-02 16:14:59.517729', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.517729', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 5),
(90, '2026-07-02 16:14:59.517729', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.517729', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 5),
(91, '2026-07-02 16:14:59.542289', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.542289', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 5),
(92, '2026-07-02 16:14:59.550756', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.550756', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 5),
(93, '2026-07-02 16:14:59.567798', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.567798', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 5),
(94, '2026-07-02 16:14:59.592279', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.592279', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 5),
(95, '2026-07-02 16:14:59.599159', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.599159', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 5),
(96, '2026-07-02 16:14:59.614514', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.614514', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 5),
(97, '2026-07-02 16:14:59.630694', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.630694', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 5),
(98, '2026-07-02 16:14:59.642144', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.642144', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 5),
(99, '2026-07-02 16:14:59.647218', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.647218', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 5),
(100, '2026-07-02 16:14:59.647218', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.647218', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 5),
(101, '2026-07-02 16:14:59.903189', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.903189', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 6),
(102, '2026-07-02 16:14:59.903189', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.903189', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 6),
(103, '2026-07-02 16:14:59.921162', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.921162', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 6),
(104, '2026-07-02 16:14:59.934658', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.934658', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 6),
(105, '2026-07-02 16:14:59.942305', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.942305', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 6),
(106, '2026-07-02 16:14:59.950696', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.950696', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 6),
(107, '2026-07-02 16:14:59.950696', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.950696', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 6),
(108, '2026-07-02 16:14:59.960378', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.960378', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 6),
(109, '2026-07-02 16:14:59.965454', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.965454', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 6),
(110, '2026-07-02 16:14:59.965454', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.965454', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 6),
(111, '2026-07-02 16:14:59.977242', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.977242', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 6),
(112, '2026-07-02 16:14:59.981116', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.981116', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 6),
(113, '2026-07-02 16:14:59.985271', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.985271', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 6),
(114, '2026-07-02 16:14:59.988611', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.988611', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 6),
(115, '2026-07-02 16:14:59.992099', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.993107', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 6),
(116, '2026-07-02 16:14:59.997588', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:14:59.997588', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 6),
(117, '2026-07-02 16:15:00.002038', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.002038', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 6),
(118, '2026-07-02 16:15:00.007458', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.007458', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 6),
(119, '2026-07-02 16:15:00.011774', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.011774', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 6),
(120, '2026-07-02 16:15:00.015387', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.015387', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 6),
(121, '2026-07-02 16:15:00.108963', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.108963', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 7),
(122, '2026-07-02 16:15:00.108963', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.108963', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 7),
(123, '2026-07-02 16:15:00.108963', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.108963', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 7),
(124, '2026-07-02 16:15:00.108963', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.108963', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 7),
(125, '2026-07-02 16:15:00.108963', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.108963', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 7),
(126, '2026-07-02 16:15:00.123771', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.123771', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 7),
(127, '2026-07-02 16:15:00.123771', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.123771', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 7),
(128, '2026-07-02 16:15:00.123771', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.123771', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 7),
(129, '2026-07-02 16:15:00.123771', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.123771', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 7),
(130, '2026-07-02 16:15:00.123771', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.123771', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 7),
(131, '2026-07-02 16:15:00.142327', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.142327', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 7),
(132, '2026-07-02 16:15:00.146335', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.146335', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 7),
(133, '2026-07-02 16:15:00.146335', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.146335', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 7),
(134, '2026-07-02 16:15:00.156353', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.156353', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 7),
(135, '2026-07-02 16:15:00.156353', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.156353', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 7),
(136, '2026-07-02 16:15:00.156353', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.156353', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 7),
(137, '2026-07-02 16:15:00.171729', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.171729', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 7),
(138, '2026-07-02 16:15:00.171729', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.171729', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 7),
(139, '2026-07-02 16:15:00.171729', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.171729', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 7),
(140, '2026-07-02 16:15:00.171729', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.171729', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 7),
(141, '2026-07-02 16:15:00.242038', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.242038', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 8),
(142, '2026-07-02 16:15:00.242038', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.242038', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 8),
(143, '2026-07-02 16:15:00.251032', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.251032', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 8),
(144, '2026-07-02 16:15:00.255830', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.255830', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 8),
(145, '2026-07-02 16:15:00.259848', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.259848', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 8),
(146, '2026-07-02 16:15:00.259848', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.259848', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 8),
(147, '2026-07-02 16:15:00.266028', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.266028', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 8),
(148, '2026-07-02 16:15:00.274164', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.274164', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 8),
(149, '2026-07-02 16:15:00.278704', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.278704', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 8),
(150, '2026-07-02 16:15:00.281685', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.281685', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 8),
(151, '2026-07-02 16:15:00.288494', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.288494', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 8),
(152, '2026-07-02 16:15:00.292270', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.292270', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 8),
(153, '2026-07-02 16:15:00.298078', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.298078', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 8),
(154, '2026-07-02 16:15:00.298078', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.298078', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 8),
(155, '2026-07-02 16:15:00.298078', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.298078', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 8),
(156, '2026-07-02 16:15:00.298078', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.298078', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 8),
(157, '2026-07-02 16:15:00.313488', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.313488', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 8),
(158, '2026-07-02 16:15:00.313488', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.313488', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 8),
(159, '2026-07-02 16:15:00.329450', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.329450', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 8),
(160, '2026-07-02 16:15:00.329450', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.329450', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 8),
(161, '2026-07-02 16:15:00.411561', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.411561', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 9),
(162, '2026-07-02 16:15:00.411561', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.411561', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 9),
(163, '2026-07-02 16:15:00.424443', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.424443', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 9),
(164, '2026-07-02 16:15:00.424443', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.424443', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 9),
(165, '2026-07-02 16:15:00.431521', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.431521', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 9),
(166, '2026-07-02 16:15:00.435206', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.435206', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 9),
(167, '2026-07-02 16:15:00.439984', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.439984', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 9),
(168, '2026-07-02 16:15:00.442438', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.442438', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 9),
(169, '2026-07-02 16:15:00.442438', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.442438', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 9),
(170, '2026-07-02 16:15:00.442438', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.442438', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 9),
(171, '2026-07-02 16:15:00.450886', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.450886', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 9),
(172, '2026-07-02 16:15:00.450886', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.450886', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 9),
(173, '2026-07-02 16:15:00.456503', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.456503', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 9),
(174, '2026-07-02 16:15:00.456503', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.456503', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 9),
(175, '2026-07-02 16:15:00.464373', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.464373', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 9),
(176, '2026-07-02 16:15:00.468430', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.468430', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 9),
(177, '2026-07-02 16:15:00.471273', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.471273', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 9),
(178, '2026-07-02 16:15:00.476218', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.476218', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 9),
(179, '2026-07-02 16:15:00.479231', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.479231', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 9),
(180, '2026-07-02 16:15:00.483270', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.483270', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 9),
(181, '2026-07-02 16:15:00.544903', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.544903', NULL, NULL, 0, 'Hiệu năng', 'Vi xử lý', 'Snapdragon / Apple Silicon', '', 10),
(182, '2026-07-02 16:15:00.544903', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.544903', NULL, NULL, 1, 'Màn hình', 'RAM', '8GB / 16GB', '', 10),
(183, '2026-07-02 16:15:00.558475', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.558475', NULL, NULL, 2, 'Pin & Sạc', 'ROM', '256GB / 512GB', '', 10),
(184, '2026-07-02 16:15:00.558475', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.558475', NULL, NULL, 3, 'Kết nối', 'Kích thước màn hình', 'Khoảng 6-7 inch', 'inch', 10),
(185, '2026-07-02 16:15:00.558475', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.558475', NULL, NULL, 4, 'Thiết kế', 'Công nghệ màn hình', 'OLED / AMOLED', '', 10),
(186, '2026-07-02 16:15:00.567623', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.567623', NULL, NULL, 5, 'Hiệu năng', 'Độ phân giải', '2K / 4K', 'Pixels', 10),
(187, '2026-07-02 16:15:00.567623', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.567623', NULL, NULL, 6, 'Màn hình', 'Tần số quét', '120Hz', 'Hz', 10),
(188, '2026-07-02 16:15:00.574279', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.574279', NULL, NULL, 7, 'Pin & Sạc', 'Dung lượng Pin', '4500-5000', 'mAh', 10),
(189, '2026-07-02 16:15:00.574279', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.574279', NULL, NULL, 8, 'Kết nối', 'Sạc nhanh', 'Có hỗ trợ', '', 10),
(190, '2026-07-02 16:15:00.574279', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.574279', NULL, NULL, 9, 'Thiết kế', 'Cổng sạc', 'Type-C', '', 10),
(191, '2026-07-02 16:15:00.574279', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.574279', NULL, NULL, 10, 'Hiệu năng', 'Wi-Fi', 'Wi-Fi 6E', '', 10),
(192, '2026-07-02 16:15:00.574279', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.574279', NULL, NULL, 11, 'Màn hình', 'Bluetooth', 'Bluetooth 5.3', '', 10),
(193, '2026-07-02 16:15:00.589463', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.589463', NULL, NULL, 12, 'Pin & Sạc', 'Mạng di động', '5G', '', 10),
(194, '2026-07-02 16:15:00.592250', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.592250', NULL, NULL, 13, 'Kết nối', 'Chất liệu', 'Nhôm / Kính / Titan', '', 10),
(195, '2026-07-02 16:15:00.592250', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.592250', NULL, NULL, 14, 'Thiết kế', 'Trọng lượng', 'Khoảng 200', 'g', 10),
(196, '2026-07-02 16:15:00.592250', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.592250', NULL, NULL, 15, 'Hiệu năng', 'Kích thước', 'Dài x Rộng x Dày', 'mm', 10),
(197, '2026-07-02 16:15:00.592250', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.592250', NULL, NULL, 16, 'Màn hình', 'Kháng nước', 'IP68', '', 10),
(198, '2026-07-02 16:15:00.605197', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.605197', NULL, NULL, 17, 'Pin & Sạc', 'Bảo mật', 'Face ID / Vân tay', '', 10),
(199, '2026-07-02 16:15:00.605848', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.605848', NULL, NULL, 18, 'Kết nối', 'Hệ điều hành', 'iOS / Android', '', 10),
(200, '2026-07-02 16:15:00.605848', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:15:00.605848', NULL, NULL, 19, 'Thiết kế', 'Năm ra mắt', '2023 - 2024', '', 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `created_by_user_id` varchar(64) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `deleted_by_user_id` varchar(64) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `updated_by_user_id` varchar(64) DEFAULT NULL,
  `availability` int DEFAULT NULL,
  `color` varchar(64) NOT NULL,
  `price` decimal(19,2) DEFAULT NULL,
  `size` varchar(64) NOT NULL,
  `variant_image_url` varchar(1024) DEFAULT NULL,
  `product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `product_variants`
--

INSERT INTO `product_variants` (`id`, `created_at`, `created_by`, `created_by_user_id`, `deleted_at`, `deleted_by`, `deleted_by_user_id`, `updated_at`, `updated_by`, `updated_by_user_id`, `availability`, `color`, `price`, `size`, `variant_image_url`, `product_id`) VALUES
(1, '2026-07-02 16:14:57.559252', NULL, NULL, NULL, NULL, NULL, '2026-07-07 06:53:15.919670', NULL, NULL, 88, 'Trắng', 29000000.00, 'Tiêu chuẩn', NULL, 1),
(2, '2026-07-02 16:14:57.567527', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.122671', NULL, NULL, 100, 'Đen', 29000000.00, 'Tiêu chuẩn', NULL, 1),
(3, '2026-07-02 16:14:57.576900', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.171790', NULL, NULL, 100, 'Xanh', 29000000.00, 'Tiêu chuẩn', NULL, 1),
(4, '2026-07-02 16:14:57.583905', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.220160', NULL, NULL, 100, 'Đỏ', 29000000.00, 'Tiêu chuẩn', NULL, 1),
(5, '2026-07-02 16:14:57.587906', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.265737', NULL, NULL, 100, 'Trắng', 32000000.00, 'Pro', NULL, 1),
(6, '2026-07-02 16:14:57.592413', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.307662', NULL, NULL, 100, 'Đen', 32000000.00, 'Pro', NULL, 1),
(7, '2026-07-02 16:14:57.608554', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.355041', NULL, NULL, 100, 'Xanh', 32000000.00, 'Pro', NULL, 1),
(8, '2026-07-02 16:14:57.626981', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.405431', NULL, NULL, 100, 'Đỏ', 32000000.00, 'Pro', NULL, 1),
(9, '2026-07-02 16:14:57.642689', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.455611', NULL, NULL, 100, 'Trắng', 35000000.00, 'Ultra', NULL, 1),
(10, '2026-07-02 16:14:57.659129', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.505965', NULL, NULL, 100, 'Đen', 35000000.00, 'Ultra', NULL, 1),
(11, '2026-07-02 16:14:57.674218', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.554015', NULL, NULL, 100, 'Xanh', 35000000.00, 'Ultra', NULL, 1),
(12, '2026-07-02 16:14:57.682249', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.602641', NULL, NULL, 100, 'Đỏ', 35000000.00, 'Ultra', NULL, 1),
(13, '2026-07-02 16:14:57.911966', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.644005', NULL, NULL, 100, 'Trắng', 31000000.00, 'Tiêu chuẩn', NULL, 2),
(14, '2026-07-02 16:14:57.922041', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.690997', NULL, NULL, 100, 'Đen', 31000000.00, 'Tiêu chuẩn', NULL, 2),
(15, '2026-07-02 16:14:57.929815', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.735644', NULL, NULL, 100, 'Xanh', 31000000.00, 'Tiêu chuẩn', NULL, 2),
(16, '2026-07-02 16:14:57.948186', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.777472', NULL, NULL, 100, 'Đỏ', 31000000.00, 'Tiêu chuẩn', NULL, 2),
(17, '2026-07-02 16:14:57.965468', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:19.865671', NULL, NULL, 100, 'Trắng', 34000000.00, 'Pro', NULL, 2),
(18, '2026-07-02 16:14:57.973550', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.010101', NULL, NULL, 100, 'Đen', 34000000.00, 'Pro', NULL, 2),
(19, '2026-07-02 16:14:57.980807', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.061476', NULL, NULL, 100, 'Xanh', 34000000.00, 'Pro', NULL, 2),
(20, '2026-07-02 16:14:57.989459', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.106772', NULL, NULL, 100, 'Đỏ', 34000000.00, 'Pro', NULL, 2),
(21, '2026-07-02 16:14:57.992511', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.156261', NULL, NULL, 100, 'Trắng', 37000000.00, 'Ultra', NULL, 2),
(22, '2026-07-02 16:14:58.021585', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.218510', NULL, NULL, 100, 'Đen', 37000000.00, 'Ultra', NULL, 2),
(23, '2026-07-02 16:14:58.045126', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.263483', NULL, NULL, 100, 'Xanh', 37000000.00, 'Ultra', NULL, 2),
(24, '2026-07-02 16:14:58.054061', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.320589', NULL, NULL, 100, 'Đỏ', 37000000.00, 'Ultra', NULL, 2),
(25, '2026-07-02 16:14:58.300770', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.365847', NULL, NULL, 100, 'Trắng', 39000000.00, 'Tiêu chuẩn', NULL, 3),
(26, '2026-07-02 16:14:58.331983', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.423626', NULL, NULL, 100, 'Đen', 39000000.00, 'Tiêu chuẩn', NULL, 3),
(27, '2026-07-02 16:14:58.348641', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.464203', NULL, NULL, 100, 'Xanh', 39000000.00, 'Tiêu chuẩn', NULL, 3),
(28, '2026-07-02 16:14:58.365001', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.511771', NULL, NULL, 100, 'Đỏ', 39000000.00, 'Tiêu chuẩn', NULL, 3),
(29, '2026-07-02 16:14:58.382856', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.566030', NULL, NULL, 100, 'Trắng', 42000000.00, 'Pro', NULL, 3),
(30, '2026-07-02 16:14:58.386869', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.622582', NULL, NULL, 100, 'Đen', 42000000.00, 'Pro', NULL, 3),
(31, '2026-07-02 16:14:58.397110', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.670899', NULL, NULL, 100, 'Xanh', 42000000.00, 'Pro', NULL, 3),
(32, '2026-07-02 16:14:58.416309', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.731008', NULL, NULL, 100, 'Đỏ', 42000000.00, 'Pro', NULL, 3),
(33, '2026-07-02 16:14:58.416309', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.803384', NULL, NULL, 100, 'Trắng', 45000000.00, 'Ultra', NULL, 3),
(34, '2026-07-02 16:14:58.428382', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.846209', NULL, NULL, 100, 'Đen', 45000000.00, 'Ultra', NULL, 3),
(35, '2026-07-02 16:14:58.444870', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.896175', NULL, NULL, 100, 'Xanh', 45000000.00, 'Ultra', NULL, 3),
(36, '2026-07-02 16:14:58.460167', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:20.962069', NULL, NULL, 100, 'Đỏ', 45000000.00, 'Ultra', NULL, 3),
(37, '2026-07-02 16:14:58.766070', NULL, NULL, NULL, NULL, NULL, '2026-07-07 07:46:59.160575', NULL, NULL, 92, 'Trắng', 15000000.00, 'Tiêu chuẩn', NULL, 4),
(38, '2026-07-02 16:14:58.782147', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.038534', NULL, NULL, 100, 'Đen', 15000000.00, 'Tiêu chuẩn', NULL, 4),
(39, '2026-07-02 16:14:58.799095', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.066497', NULL, NULL, 100, 'Xanh', 15000000.00, 'Tiêu chuẩn', NULL, 4),
(40, '2026-07-02 16:14:58.814066', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.113365', NULL, NULL, 100, 'Đỏ', 15000000.00, 'Tiêu chuẩn', NULL, 4),
(41, '2026-07-02 16:14:58.834545', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.178375', NULL, NULL, 100, 'Trắng', 18000000.00, 'Pro', NULL, 4),
(42, '2026-07-02 16:14:58.861854', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.321712', NULL, NULL, 100, 'Đen', 18000000.00, 'Pro', NULL, 4),
(43, '2026-07-02 16:14:58.883373', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.497984', NULL, NULL, 100, 'Xanh', 18000000.00, 'Pro', NULL, 4),
(44, '2026-07-02 16:14:58.894054', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.668340', NULL, NULL, 100, 'Đỏ', 18000000.00, 'Pro', NULL, 4),
(45, '2026-07-02 16:14:58.909199', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.775706', NULL, NULL, 100, 'Trắng', 21000000.00, 'Ultra', NULL, 4),
(46, '2026-07-02 16:14:58.924950', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.867127', NULL, NULL, 100, 'Đen', 21000000.00, 'Ultra', NULL, 4),
(47, '2026-07-02 16:14:58.942402', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.912062', NULL, NULL, 100, 'Xanh', 21000000.00, 'Ultra', NULL, 4),
(48, '2026-07-02 16:14:58.967607', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.946955', NULL, NULL, 100, 'Đỏ', 21000000.00, 'Ultra', NULL, 4),
(49, '2026-07-02 16:14:59.233086', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:21.982577', NULL, NULL, 100, 'Trắng', 28000000.00, 'Tiêu chuẩn', NULL, 5),
(50, '2026-07-02 16:14:59.249565', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.018092', NULL, NULL, 100, 'Đen', 28000000.00, 'Tiêu chuẩn', NULL, 5),
(51, '2026-07-02 16:14:59.275394', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.062632', NULL, NULL, 100, 'Xanh', 28000000.00, 'Tiêu chuẩn', NULL, 5),
(52, '2026-07-02 16:14:59.296800', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.181422', NULL, NULL, 100, 'Đỏ', 28000000.00, 'Tiêu chuẩn', NULL, 5),
(53, '2026-07-02 16:14:59.312011', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.282349', NULL, NULL, 100, 'Trắng', 31000000.00, 'Pro', NULL, 5),
(54, '2026-07-02 16:14:59.312011', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.380656', NULL, NULL, 100, 'Đen', 31000000.00, 'Pro', NULL, 5),
(55, '2026-07-02 16:14:59.327847', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.500213', NULL, NULL, 100, 'Xanh', 31000000.00, 'Pro', NULL, 5),
(56, '2026-07-02 16:14:59.343822', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.544915', NULL, NULL, 100, 'Đỏ', 31000000.00, 'Pro', NULL, 5),
(57, '2026-07-02 16:14:59.346469', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.620736', NULL, NULL, 100, 'Trắng', 34000000.00, 'Ultra', NULL, 5),
(58, '2026-07-02 16:14:59.355769', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.759640', NULL, NULL, 100, 'Đen', 34000000.00, 'Ultra', NULL, 5),
(59, '2026-07-02 16:14:59.359558', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.827059', NULL, NULL, 100, 'Xanh', 34000000.00, 'Ultra', NULL, 5),
(60, '2026-07-02 16:14:59.376391', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:22.985542', NULL, NULL, 100, 'Đỏ', 34000000.00, 'Ultra', NULL, 5),
(61, '2026-07-02 16:14:59.662303', NULL, NULL, NULL, NULL, NULL, '2026-07-07 04:15:34.888689', NULL, NULL, 99, 'Trắng', 10000000.00, 'Tiêu chuẩn', NULL, 6),
(62, '2026-07-02 16:14:59.692359', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.161386', NULL, NULL, 100, 'Đen', 10000000.00, 'Tiêu chuẩn', NULL, 6),
(63, '2026-07-02 16:14:59.700021', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.245327', NULL, NULL, 100, 'Xanh', 10000000.00, 'Tiêu chuẩn', NULL, 6),
(64, '2026-07-02 16:14:59.722641', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.415507', NULL, NULL, 100, 'Đỏ', 10000000.00, 'Tiêu chuẩn', NULL, 6),
(65, '2026-07-02 16:14:59.747175', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.542650', NULL, NULL, 100, 'Trắng', 13000000.00, 'Pro', NULL, 6),
(66, '2026-07-02 16:14:59.767140', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.588943', NULL, NULL, 100, 'Đen', 13000000.00, 'Pro', NULL, 6),
(67, '2026-07-02 16:14:59.792667', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.646221', NULL, NULL, 100, 'Xanh', 13000000.00, 'Pro', NULL, 6),
(68, '2026-07-02 16:14:59.792667', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.714959', NULL, NULL, 100, 'Đỏ', 13000000.00, 'Pro', NULL, 6),
(69, '2026-07-02 16:14:59.822324', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.871299', NULL, NULL, 100, 'Trắng', 16000000.00, 'Ultra', NULL, 6),
(70, '2026-07-02 16:14:59.855167', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:23.991381', NULL, NULL, 100, 'Đen', 16000000.00, 'Ultra', NULL, 6),
(71, '2026-07-02 16:14:59.864634', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.057471', NULL, NULL, 100, 'Xanh', 16000000.00, 'Ultra', NULL, 6),
(72, '2026-07-02 16:14:59.892560', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.096521', NULL, NULL, 100, 'Đỏ', 16000000.00, 'Ultra', NULL, 6),
(73, '2026-07-02 16:15:00.032945', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.197316', 'admin', NULL, 100, 'Trắng', 6000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/494d8949160e4db3ad13a83559b76835.webp', 7),
(74, '2026-07-02 16:15:00.039711', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.280747', 'admin', NULL, 100, 'Đen', 6000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/c56111c0da7049f8b90aa7d924e70ce3.webp', 7),
(75, '2026-07-02 16:15:00.047743', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.352672', 'admin', NULL, 100, 'Xanh', 6000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/be3ae947845248e489cccb6785825104.webp', 7),
(76, '2026-07-02 16:15:00.051895', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.392363', 'admin', NULL, 100, 'Đỏ', 6000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/e8b818df5dff416dbd8c0b8f1ab5263d.webp', 7),
(77, '2026-07-02 16:15:00.064778', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.421349', 'admin', NULL, 100, 'Trắng', 9000000.00, 'Pro', '/api/catalog/admin/products/images/file/43e6af48caeb4d53805964214263b788.webp', 7),
(78, '2026-07-02 16:15:00.070769', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.468615', 'admin', NULL, 100, 'Đen', 9000000.00, 'Pro', '/api/catalog/admin/products/images/file/8dd4474227c5416991e6bd1c03de3089.webp', 7),
(79, '2026-07-02 16:15:00.077453', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.500526', 'admin', NULL, 100, 'Xanh', 9000000.00, 'Pro', '/api/catalog/admin/products/images/file/3c7eeef0f3fc4b1ba235e231ac98d278.webp', 7),
(80, '2026-07-02 16:15:00.082471', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.547897', 'admin', NULL, 100, 'Đỏ', 9000000.00, 'Pro', '/api/catalog/admin/products/images/file/a23ded0d81e348f0a654bbf6f8ef8b3e.webp', 7),
(81, '2026-07-02 16:15:00.087774', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.622754', 'admin', NULL, 100, 'Trắng', 12000000.00, 'Ultra', '/api/catalog/admin/products/images/file/bf359efd8f3a44dcbcd4101bd225812c.webp', 7),
(82, '2026-07-02 16:15:00.094553', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.663721', 'admin', NULL, 100, 'Đen', 12000000.00, 'Ultra', '/api/catalog/admin/products/images/file/8788a65897694ba8b1d81956434527cf.webp', 7),
(83, '2026-07-02 16:15:00.100086', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.700534', 'admin', NULL, 100, 'Xanh', 12000000.00, 'Ultra', '/api/catalog/admin/products/images/file/fa912d6f33044142bf3d13f550d098da.webp', 7),
(84, '2026-07-02 16:15:00.104808', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.742219', 'admin', NULL, 100, 'Đỏ', 12000000.00, 'Ultra', '/api/catalog/admin/products/images/file/05606ef551f24fdfae7ed9a96cafdbbf.webp', 7),
(85, '2026-07-02 16:15:00.191992', NULL, NULL, NULL, NULL, NULL, '2026-07-07 07:07:20.953729', 'admin', NULL, 95, 'Trắng', 45000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/77fef42d6ab04c409fdfd31dae1de65e.webp', 8),
(86, '2026-07-02 16:15:00.191992', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.813872', 'admin', NULL, 100, 'Đen', 45000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/5c895a08682e4613ac954bbc094285ff.webp', 8),
(87, '2026-07-02 16:15:00.201371', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.865578', 'admin', NULL, 100, 'Xanh', 45000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/00e28b7d3e0948eba06b63854d33d4dc.webp', 8),
(88, '2026-07-02 16:15:00.203723', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.926411', 'admin', NULL, 100, 'Đỏ', 45000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/84374380fd1541bab6c2e5773e0485f9.webp', 8),
(89, '2026-07-02 16:15:00.203723', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:24.982484', 'admin', NULL, 100, 'Trắng', 48000000.00, 'Pro', '/api/catalog/admin/products/images/file/f6de580b27cb4d8cb96a762294a0d93b.webp', 8),
(90, '2026-07-02 16:15:00.203723', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.040416', 'admin', NULL, 100, 'Đen', 48000000.00, 'Pro', '/api/catalog/admin/products/images/file/f10df1688b0d425198b726f4c292f650.webp', 8),
(91, '2026-07-02 16:15:00.218873', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.079702', 'admin', NULL, 100, 'Xanh', 48000000.00, 'Pro', '/api/catalog/admin/products/images/file/ad1f51ad36904352af03a32d3361174e.webp', 8),
(92, '2026-07-02 16:15:00.218873', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.112927', 'admin', NULL, 100, 'Đỏ', 48000000.00, 'Pro', '/api/catalog/admin/products/images/file/4dabf0c6e1044a1d9bf5eceba6524f67.webp', 8),
(93, '2026-07-02 16:15:00.218873', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.150361', 'admin', NULL, 100, 'Trắng', 51000000.00, 'Ultra', '/api/catalog/admin/products/images/file/36bf360afd9740e2a9d42667879a2601.webp', 8),
(94, '2026-07-02 16:15:00.218873', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.181562', NULL, NULL, 100, 'Đen', 51000000.00, 'Ultra', NULL, 8),
(95, '2026-07-02 16:15:00.234654', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.219012', 'admin', NULL, 100, 'Xanh', 51000000.00, 'Ultra', '/api/catalog/admin/products/images/file/2231701ddf6048d0aaca30ef7581a46b.webp', 8),
(96, '2026-07-02 16:15:00.242038', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.288385', 'admin', NULL, 100, 'Đỏ', 51000000.00, 'Ultra', '/api/catalog/admin/products/images/file/f47cd9653ef24cf6a712efb66465b475.webp', 8),
(97, '2026-07-02 16:15:00.346159', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.346754', NULL, NULL, 100, 'Trắng', 40000000.00, 'Tiêu chuẩn', NULL, 9),
(98, '2026-07-02 16:15:00.346159', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.407975', NULL, NULL, 100, 'Đen', 40000000.00, 'Tiêu chuẩn', NULL, 9),
(99, '2026-07-02 16:15:00.361785', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.481182', 'admin', NULL, 100, 'Xanh', 40000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/6ff28db975a2416184317e9563a9e58c.jpg', 9),
(100, '2026-07-02 16:15:00.361785', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.534372', 'admin', NULL, 100, 'Đỏ', 40000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/a95b036e60ff47af9172a7680d951197.jpg', 9),
(101, '2026-07-02 16:15:00.376802', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.567579', 'admin', NULL, 100, 'Trắng', 43000000.00, 'Pro', '/api/catalog/admin/products/images/file/d35c6ebe98cd4787bfcfd6bcadaa50fc.jpg', 9),
(102, '2026-07-02 16:15:00.376802', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.598224', 'admin', NULL, 100, 'Đen', 43000000.00, 'Pro', '/api/catalog/admin/products/images/file/6600d4c4a96f4cf9baf3e5324050f979.jpg', 9),
(103, '2026-07-02 16:15:00.385115', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.631075', 'admin', NULL, 100, 'Xanh', 43000000.00, 'Pro', '/api/catalog/admin/products/images/file/b4e0c1d9b7dc4634aa9f2517c6c14c48.webp', 9),
(104, '2026-07-02 16:15:00.392788', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.660976', 'admin', NULL, 100, 'Đỏ', 43000000.00, 'Pro', '/api/catalog/admin/products/images/file/820ec25ee85e402daa84c419c0382a9e.jpg', 9),
(105, '2026-07-02 16:15:00.396140', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.712004', 'admin', NULL, 100, 'Trắng', 46000000.00, 'Ultra', '/api/catalog/admin/products/images/file/609ca625df3f46ceabf85beb4886205b.jpg', 9),
(106, '2026-07-02 16:15:00.396140', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.755312', NULL, NULL, 100, 'Đen', 46000000.00, 'Ultra', NULL, 9),
(107, '2026-07-02 16:15:00.408179', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.842470', NULL, NULL, 100, 'Xanh', 46000000.00, 'Ultra', NULL, 9),
(108, '2026-07-02 16:15:00.411561', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.885159', NULL, NULL, 100, 'Đỏ', 46000000.00, 'Ultra', NULL, 9),
(109, '2026-07-02 16:15:00.494298', NULL, NULL, NULL, NULL, NULL, '2026-07-06 22:55:32.648846', 'admin', NULL, 104, 'Trắng', 9000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/e88d36f85e0e49b19919285377fd0849.webp', 10),
(110, '2026-07-02 16:15:00.499654', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:25.996875', 'admin', NULL, 100, 'Đen', 9000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/5aba4243868f4b21b5b823ae2c231b8c.webp', 10),
(111, '2026-07-02 16:15:00.504100', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.048009', NULL, NULL, 100, 'Xanh', 9000000.00, 'Tiêu chuẩn', NULL, 10),
(112, '2026-07-02 16:15:00.510085', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.074181', 'admin', NULL, 100, 'Đỏ', 9000000.00, 'Tiêu chuẩn', '/api/catalog/admin/products/images/file/c3ddb8f79e3b4408937d71a7632a3dc1.webp', 10),
(113, '2026-07-02 16:15:00.515163', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.142659', 'admin', NULL, 100, 'Trắng', 12000000.00, 'Pro', '/api/catalog/admin/products/images/file/1830e7e1d8734a769b1289a5fd8c53fb.webp', 10),
(114, '2026-07-02 16:15:00.520507', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.200528', 'admin', NULL, 100, 'Đen', 12000000.00, 'Pro', '/api/catalog/admin/products/images/file/e6521e3e2ec04c219823300e0d906d45.webp', 10),
(115, '2026-07-02 16:15:00.525869', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.242011', 'admin', NULL, 100, 'Xanh', 12000000.00, 'Pro', '/api/catalog/admin/products/images/file/edd9ae8dc10f46fab53a94762d3c2fc4.webp', 10),
(116, '2026-07-02 16:15:00.530042', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.279657', 'admin', NULL, 100, 'Đỏ', 12000000.00, 'Pro', '/api/catalog/admin/products/images/file/143d4edd1d1c47c8bb60f0a23b2d750f.webp', 10),
(117, '2026-07-02 16:15:00.534041', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.305862', 'admin', NULL, 100, 'Trắng', 15000000.00, 'Ultra', '/api/catalog/admin/products/images/file/01d3ac175f5947bd94b8c94fe958e2ad.webp', 10),
(118, '2026-07-02 16:15:00.539556', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.327014', 'admin', NULL, 100, 'Đen', 15000000.00, 'Ultra', '/api/catalog/admin/products/images/file/10098d2812dd4aec8ff57a26938d6dfa.webp', 10),
(119, '2026-07-02 16:15:00.542889', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.393428', 'admin', NULL, 100, 'Xanh', 15000000.00, 'Ultra', '/api/catalog/admin/products/images/file/406317e0a9db4dfcbbe6a1063f0afd39.webp', 10),
(120, '2026-07-02 16:15:00.544903', NULL, NULL, NULL, NULL, NULL, '2026-07-02 16:34:26.464157', 'admin', NULL, 100, 'Đỏ', 15000000.00, 'Ultra', '/api/catalog/admin/products/images/file/ba423091409543f4ba060be275e0b9b3.webp', 10);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_oce3937d2f4mpfqrycbr0l93m` (`name`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_oul14ho7bctbefv8jywp5v3i2` (`slug`),
  ADD KEY `FKsaok720gsu4u2wrgbk10b5n8d` (`parent_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_fhmd06dsmj6k0n90swsh8ie9g` (`sku`),
  ADD KEY `FKa3a4mpsfdf4d2y6r8ra3sc8mv` (`brand_id`),
  ADD KEY `FKog2rp4qthbtt2lfyhfo32lsw9` (`category_id`);

--
-- Chỉ mục cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  ADD KEY `FKd112rx0alycddsms029iifrih` (`category_id`),
  ADD KEY `FKlda9rad6s180ha3dl1ncsp8n7` (`product_id`);

--
-- Chỉ mục cho bảng `product_change_logs`
--
ALTER TABLE `product_change_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pcl_product_id` (`product_id`),
  ADD KEY `idx_pcl_changed_at` (`changed_at`);

--
-- Chỉ mục cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKqnq71xsohugpqwf3c9gxmsuy` (`product_id`);

--
-- Chỉ mục cho bảng `product_technical_specs`
--
ALTER TABLE `product_technical_specs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pts_product` (`product_id`),
  ADD KEY `idx_pts_key` (`spec_key`);

--
-- Chỉ mục cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_pv_product_size_color` (`product_id`,`size`,`color`),
  ADD KEY `idx_pv_product` (`product_id`),
  ADD KEY `idx_pv_size_color` (`size`,`color`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `product_change_logs`
--
ALTER TABLE `product_change_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT cho bảng `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT cho bảng `product_technical_specs`
--
ALTER TABLE `product_technical_specs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=201;

--
-- AUTO_INCREMENT cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `FKsaok720gsu4u2wrgbk10b5n8d` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`);

--
-- Ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `FKa3a4mpsfdf4d2y6r8ra3sc8mv` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`),
  ADD CONSTRAINT `FKog2rp4qthbtt2lfyhfo32lsw9` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Ràng buộc cho bảng `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `FKd112rx0alycddsms029iifrih` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `FKlda9rad6s180ha3dl1ncsp8n7` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `FKqnq71xsohugpqwf3c9gxmsuy` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ràng buộc cho bảng `product_technical_specs`
--
ALTER TABLE `product_technical_specs`
  ADD CONSTRAINT `FK8o9d1vjfo5yqxdbwykgcl3fa8` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ràng buộc cho bảng `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `FKosqitn4s405cynmhb87lkvuau` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
--
-- Cơ sở dữ liệu: `product_recommendations`
--
CREATE DATABASE IF NOT EXISTS `product_recommendations` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `product_recommendations`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `manual_product_recommendations`
--

CREATE TABLE `manual_product_recommendations` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `reason` varchar(200) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `source_product_id` bigint NOT NULL,
  `target_product_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `sku` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `recommendation`
--

CREATE TABLE `recommendation` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `user_name` varchar(120) DEFAULT NULL,
  `product_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `manual_product_recommendations`
--
ALTER TABLE `manual_product_recommendations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_manual_rec_source_target` (`source_product_id`,`target_product_id`),
  ADD KEY `idx_manual_rec_source` (`source_product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `recommendation`
--
ALTER TABLE `recommendation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKo0353mdic5a439h2dhnst344t` (`product_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `manual_product_recommendations`
--
ALTER TABLE `manual_product_recommendations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `recommendation`
--
ALTER TABLE `recommendation`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `recommendation`
--
ALTER TABLE `recommendation`
  ADD CONSTRAINT `FKo0353mdic5a439h2dhnst344t` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
--
-- Cơ sở dữ liệu: `rainbowforest_telegram`
--
CREATE DATABASE IF NOT EXISTS `rainbowforest_telegram` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `rainbowforest_telegram`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `telegram_tokens`
--

CREATE TABLE `telegram_tokens` (
  `id` bigint NOT NULL,
  `expires_at` datetime NOT NULL,
  `role` varchar(255) NOT NULL,
  `system_user_id` bigint NOT NULL,
  `token` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `telegram_users`
--

CREATE TABLE `telegram_users` (
  `id` bigint NOT NULL,
  `chat_id` bigint NOT NULL,
  `linked_at` datetime DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  `system_user_id` bigint NOT NULL,
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `telegram_tokens`
--
ALTER TABLE `telegram_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_lrhvx397uccswnliybshbr8qs` (`token`);

--
-- Chỉ mục cho bảng `telegram_users`
--
ALTER TABLE `telegram_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_r5kb2ndyxk91f3v8m4oj0kg6y` (`chat_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `telegram_tokens`
--
ALTER TABLE `telegram_tokens`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `telegram_users`
--
ALTER TABLE `telegram_users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;
--
-- Cơ sở dữ liệu: `review_db`
--
CREATE DATABASE IF NOT EXISTS `review_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `review_db`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint NOT NULL,
  `content` varchar(2000) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  `variant_label` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `reviews`
--

INSERT INTO `reviews` (`id`, `content`, `created_at`, `order_id`, `product_id`, `rating`, `status`, `updated_at`, `user_id`, `user_name`, `variant_id`, `variant_label`) VALUES
(1, 'tuyệt vời', '2026-07-07 05:41:16.530000', 1, 10, 5, NULL, '2026-07-07 05:41:16.530000', 15, NULL, 109, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `review_edit_histories`
--

CREATE TABLE `review_edit_histories` (
  `id` bigint NOT NULL,
  `edited_at` datetime(6) NOT NULL,
  `old_content` varchar(1000) NOT NULL,
  `old_rating` int NOT NULL,
  `review_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `review_media`
--

CREATE TABLE `review_media` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `media_type` varchar(255) NOT NULL,
  `media_url` varchar(255) NOT NULL,
  `review_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `review_media`
--

INSERT INTO `review_media` (`id`, `created_at`, `media_type`, `media_url`, `review_id`) VALUES
(1, '2026-07-07 05:41:17.242000', 'IMAGE', '/api/reviews/media/b946a345-d158-43fa-8f8e-75fc94a7b202.png', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `review_responses`
--

CREATE TABLE `review_responses` (
  `id` bigint NOT NULL,
  `content` varchar(2000) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `responded_by` varchar(255) DEFAULT NULL,
  `review_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `review_edit_histories`
--
ALTER TABLE `review_edit_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKg606ayivrgfcym8rt3qwdb783` (`review_id`);

--
-- Chỉ mục cho bảng `review_media`
--
ALTER TABLE `review_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK5eeii8rke42oss6yq63k2hrte` (`review_id`);

--
-- Chỉ mục cho bảng `review_responses`
--
ALTER TABLE `review_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKgpf1f9hvtterlrnytx65nto9n` (`review_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `review_edit_histories`
--
ALTER TABLE `review_edit_histories`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `review_media`
--
ALTER TABLE `review_media`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `review_responses`
--
ALTER TABLE `review_responses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `review_edit_histories`
--
ALTER TABLE `review_edit_histories`
  ADD CONSTRAINT `FKg606ayivrgfcym8rt3qwdb783` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`);

--
-- Ràng buộc cho bảng `review_media`
--
ALTER TABLE `review_media`
  ADD CONSTRAINT `FK5eeii8rke42oss6yq63k2hrte` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`);

--
-- Ràng buộc cho bảng `review_responses`
--
ALTER TABLE `review_responses`
  ADD CONSTRAINT `FKgpf1f9hvtterlrnytx65nto9n` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`);
--
-- Cơ sở dữ liệu: `sale`
--
CREATE DATABASE IF NOT EXISTS `sale` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `sale`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promo_banners`
--

CREATE TABLE `promo_banners` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `end_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `position` int DEFAULT NULL,
  `start_at` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `promo_banners`
--

INSERT INTO `promo_banners` (`id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `active`, `end_at`, `image_url`, `link_url`, `position`, `start_at`, `title`) VALUES
(1, '2026-07-02 16:46:59.000000', NULL, '2026-07-02 17:24:35.851466', 'admin', b'1', '2027-10-30 19:59:00.000000', '/api/sales/banners/image/8e277f21-5004-4c13-845e-a21e19d52a60.jpg', '/collections/summer-sale', 1, '2023-12-30 20:00:00.000000', 'Siêu Khuyến Mãi Mùa Hè - Giảm 50%'),
(2, '2026-07-02 16:46:59.000000', NULL, '2026-07-02 17:25:03.509692', 'admin', b'1', '2026-08-06 09:59:00.000000', '/api/sales/banners/image/8deacce5-c669-4ba3-8b60-7a1a2e4557e8.jpg', '/products/1', 2, '2023-12-31 10:00:00.000000', 'Độc quyền iPhone 15 Pro Max'),
(3, '2026-07-02 16:46:59.000000', NULL, '2026-07-02 17:25:23.473553', 'admin', b'1', '2026-08-08 09:59:00.000000', '/api/sales/banners/image/74fcf69d-1b77-4a4f-bf31-05de4154ecc4.jpg', '/collections/gaming-gear', 3, '2023-12-31 10:00:00.000000', 'Tuần lễ vàng - Bàn phím cơ cực cháy');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sale_programs`
--

CREATE TABLE `sale_programs` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `description` text,
  `discount_type` varchar(16) NOT NULL,
  `discount_value` decimal(18,4) NOT NULL,
  `end_at` datetime(6) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_at` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `sale_programs`
--

INSERT INTO `sale_programs` (`id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `active`, `description`, `discount_type`, `discount_value`, `end_at`, `name`, `start_at`) VALUES
(7, '2026-07-07 01:26:12.414008', 'admin', '2026-07-07 04:16:35.489573', 'admin', b'1', 'Giảm 15% toàn bộ gian hàng', 'AMOUNT', 2000.0000, '2026-07-16 05:39:00.000000', 'Siêu Sale Khai Trương 15%', '2026-07-01 05:39:00.000000');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sale_program_items`
--

CREATE TABLE `sale_program_items` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `promo_qty_limit` int DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  `sale_program_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `sale_program_items`
--

INSERT INTO `sale_program_items` (`id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `product_id`, `promo_qty_limit`, `variant_id`, `sale_program_id`) VALUES
(65, '2026-07-07 04:16:36.126482', 'admin', '2026-07-07 04:16:36.126482', NULL, 1, NULL, NULL, 7),
(66, '2026-07-07 04:16:36.162647', 'admin', '2026-07-07 07:46:59.266097', NULL, 4, 42, NULL, 7),
(67, '2026-07-07 04:16:36.190987', 'admin', '2026-07-07 04:16:36.190987', NULL, 9, 50, NULL, 7);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
--

CREATE TABLE `vouchers` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) DEFAULT NULL,
  `active` bit(1) NOT NULL,
  `code` varchar(64) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `discount_type` varchar(16) NOT NULL,
  `discount_value` decimal(18,4) NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `max_discount_amount` decimal(18,2) DEFAULT NULL,
  `max_usage` int DEFAULT NULL,
  `max_usage_per_user` int DEFAULT NULL,
  `min_order_amount` decimal(18,2) DEFAULT NULL,
  `starts_at` datetime(6) DEFAULT NULL,
  `usage_count` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `vouchers`
--

INSERT INTO `vouchers` (`id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `active`, `code`, `description`, `discount_type`, `discount_value`, `expires_at`, `max_discount_amount`, `max_usage`, `max_usage_per_user`, `min_order_amount`, `starts_at`, `usage_count`) VALUES
(1, '2026-07-02 16:43:58.939411', 'admin', '2026-07-02 17:06:31.962981', NULL, b'1', 'VIP100K', 'Giảm thẳng 100k cho đơn từ 1 triệu', 'AMOUNT', 100000.0000, '2026-08-01 09:43:00.000000', NULL, 1000, 1, 1000000.00, '2026-07-02 09:43:00.000000', 1),
(2, '2026-07-02 16:43:59.063144', 'admin', '2026-07-02 17:54:42.625092', NULL, b'1', 'MEGA10', 'Giảm 10% tối đa 500k', 'PERCENT', 10.0000, '2026-08-01 09:43:00.000000', 500000.00, 500, 2, 2000000.00, '2026-07-02 09:43:00.000000', 1),
(3, '2026-07-02 16:43:59.101930', 'admin', '2026-07-02 16:43:59.101930', NULL, b'1', 'FREESHIP', 'Mã Miễn phí vận chuyển (Giảm 50k)', 'AMOUNT', 50000.0000, '2026-09-30 09:43:00.000000', NULL, 5000, 5, NULL, '2026-07-02 09:43:00.000000', 0),
(4, '2026-07-02 16:43:59.152043', 'admin', '2026-07-07 04:15:33.939602', NULL, b'1', 'NEWUSER500', 'Chào bạn mới, giảm 500k đơn 5 củ', 'AMOUNT', 500000.0000, '2026-08-01 09:43:00.000000', NULL, 200, 1, 5000000.00, '2026-07-02 09:43:00.000000', 1),
(5, '2026-07-02 16:43:59.199342', 'admin', '2026-07-02 16:43:59.199342', NULL, b'1', 'HIGHTECH20', 'Giảm 20% phụ kiện', 'PERCENT', 20.0000, '2026-08-01 09:43:00.000000', 200000.00, 100, 1, 500000.00, '2026-07-02 09:43:00.000000', 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `voucher_usages`
--

CREATE TABLE `voucher_usages` (
  `id` bigint NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `used_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `voucher_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `voucher_usages`
--

INSERT INTO `voucher_usages` (`id`, `order_id`, `used_at`, `user_id`, `voucher_id`) VALUES
(1, NULL, '2026-07-02 17:06:31.654528', 15, 1),
(2, NULL, '2026-07-02 17:54:42.475158', 15, 2),
(3, NULL, '2026-07-07 04:15:33.631560', 15, 4);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `promo_banners`
--
ALTER TABLE `promo_banners`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `sale_programs`
--
ALTER TABLE `sale_programs`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `sale_program_items`
--
ALTER TABLE `sale_program_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKbto6shpdtbry13g7tohu4g3cx` (`sale_program_id`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_30ftp2biebbvpik8e49wlmady` (`code`);

--
-- Chỉ mục cho bảng `voucher_usages`
--
ALTER TABLE `voucher_usages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_voucher_user` (`voucher_id`,`user_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `promo_banners`
--
ALTER TABLE `promo_banners`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `sale_programs`
--
ALTER TABLE `sale_programs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `sale_program_items`
--
ALTER TABLE `sale_program_items`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `voucher_usages`
--
ALTER TABLE `voucher_usages`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `sale_program_items`
--
ALTER TABLE `sale_program_items`
  ADD CONSTRAINT `FKbto6shpdtbry13g7tohu4g3cx` FOREIGN KEY (`sale_program_id`) REFERENCES `sale_programs` (`id`);
--
-- Cơ sở dữ liệu: `users`
--
CREATE DATABASE IF NOT EXISTS `users` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `users`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_activated` bit(1) NOT NULL,
  `completed_orders_count` bigint NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_changed_at` datetime(6) DEFAULT NULL,
  `email_verified_at` datetime(6) DEFAULT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `last_login_device_fingerprint` varchar(190) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `membership_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_changed_at` datetime(6) DEFAULT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_verified_at` datetime(6) DEFAULT NULL,
  `total_spent` decimal(19,2) NOT NULL,
  `user_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint DEFAULT NULL,
  `user_details_id` bigint DEFAULT NULL,
  `failed_login_attempts` int NOT NULL,
  `lockout_end_time` datetime(6) DEFAULT NULL,
  `is_2fa_enabled` bit(1) DEFAULT NULL,
  `totp_secret` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `is_activated`, `completed_orders_count`, `email`, `email_changed_at`, `email_verified_at`, `last_login_at`, `last_login_device_fingerprint`, `last_login_ip`, `membership_level`, `password_changed_at`, `phone_number`, `phone_verified_at`, `total_spent`, `user_name`, `user_password`, `role_id`, `user_details_id`, `failed_login_attempts`, `lockout_end_time`, `is_2fa_enabled`, `totp_secret`) VALUES
(15, '2026-06-24 16:26:47.888458', NULL, NULL, NULL, '2026-07-07 05:48:26.137689', 'admin', b'1', 6, 'nguyendinhkiet12092005@gmail.com', NULL, '2026-06-24 16:26:47.285932', '2026-06-29 18:45:45.580811', 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', '0:0:0:0:0:0:0:1', 'PLATINUM', '2026-06-24 23:52:29.880576', '0865482131', NULL, 17952923.00, 'admin', '$2a$10$Xm9uIxWP20XtYADNE.rTM.kpM9c6yRmV4tY89t8vIyB/T5X9UlLfG', 1, 10, 0, NULL, b'1', 'LOGNUMCAUXF3C2JYEP4KIX7OWUSNZYK4'),
(16, '2026-07-02 11:27:49.587950', NULL, NULL, NULL, '2026-07-07 00:14:08.209502', 'admin', b'1', 0, 'nguyendinhkiet122005@gmail.com', NULL, '2026-07-02 11:27:48.556612', NULL, NULL, NULL, 'BRONZE', NULL, NULL, NULL, 0.00, 'adminpro', '$2a$10$V6kFwxw7fbbOsoePCAgqceyquvFz37mqJIAfPWIr9mhqG0Rnp1Ivm', 1, NULL, 0, NULL, b'0', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users_details`
--

CREATE TABLE `users_details` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users_details`
--

INSERT INTO `users_details` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `avatar_url`, `birth_date`, `first_name`, `gender`, `last_name`) VALUES
(1, '2026-06-08 01:31:28.171275', NULL, NULL, NULL, '2026-06-08 01:31:28.175698', NULL, NULL, NULL, 'demo_user', NULL, 'User'),
(2, '2026-06-08 01:53:20.184474', NULL, NULL, NULL, '2026-06-08 01:53:20.187169', NULL, NULL, NULL, 'demo_user', NULL, 'User'),
(3, '2026-06-08 02:08:09.783697', NULL, NULL, NULL, '2026-06-08 02:08:09.787547', NULL, NULL, NULL, 'demo_user', NULL, 'User'),
(6, '2026-06-10 00:44:01.862885', NULL, NULL, NULL, '2026-06-10 00:44:01.863407', NULL, NULL, NULL, 'admin1', NULL, 'User'),
(7, '2026-06-10 00:49:44.150248', NULL, NULL, NULL, '2026-06-10 00:49:44.150248', NULL, NULL, NULL, 'admin1gh', NULL, 'User'),
(8, '2026-06-10 00:51:55.729369', NULL, NULL, NULL, '2026-06-10 00:51:55.729891', NULL, NULL, NULL, 'admin1f', NULL, 'User'),
(9, '2026-06-16 23:21:36.750220', NULL, NULL, NULL, '2026-06-17 01:16:40.289205', NULL, '/api/accounts/users/14/avatar/file/b6048c02fb434ade9894be57abb63cb4.jpg', '2003-01-28', 'Nguyễn g', 'male', 'Kiệtf'),
(10, '2026-06-24 16:38:46.929039', NULL, NULL, NULL, '2026-06-24 18:00:39.229177', NULL, '/api/accounts/users/15/avatar/file/2de141803ed64723a20369abc12c61cc.jpg', '2005-09-12', 'Nguyễn Đình', 'male', 'Kiệt');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_activation_tokens`
--

CREATE TABLE `user_activation_tokens` (
  `id` bigint NOT NULL,
  `delivery_channel` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recipient` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_addresses`
--

CREATE TABLE `user_addresses` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default` bit(1) NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `street_line` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ward_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_details_id` bigint NOT NULL,
  `recipient_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `full_address`, `is_default`, `phone_number`, `province_code`, `province_name`, `street_line`, `ward_code`, `ward_name`, `user_details_id`, `recipient_name`) VALUES
(1, '2026-06-18 00:14:59.040555', NULL, NULL, NULL, '2026-06-18 00:14:59.040555', NULL, '123123', b'1', '0865482131', NULL, 'TP. Hồ Chí Minh', '123123', NULL, 'Phường 1', 9, 'kiet'),
(2, '2026-06-18 11:02:44.293026', NULL, NULL, NULL, '2026-06-18 11:02:44.293026', NULL, '123 Duong Cau Giay, Phường Yên Hòa, Thành phố Hà Nội', b'0', '0987654321', '1', 'Thành phố Hà Nội', '123 Duong Cau Giay', '175', 'Phường Yên Hòa', 9, 'Nguyen Van A'),
(15, '2026-06-25 01:20:19.172289', NULL, NULL, NULL, '2026-06-26 12:08:40.509647', NULL, '12313123, Phường Ba Đình, Thành phố Hà Nội', b'0', '0865124124', '1', 'Thành phố Hà Nội', '12313123', '4', 'Phường Ba Đình', 10, 'nguyễn đình kiệt'),
(16, '2026-06-26 12:08:31.690770', NULL, NULL, NULL, '2026-06-26 12:08:40.539243', NULL, '1312313123, Xã Thái Bình, Tỉnh Tuyên Quang', b'1', '0865482131', NULL, 'Tỉnh Tuyên Quang', '1312313123', NULL, 'Xã Thái Bình', 10, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_login_devices`
--

CREATE TABLE `user_login_devices` (
  `id` bigint NOT NULL,
  `device_fingerprint` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_seen_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  `last_login_ip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_locale` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login_timezone` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_login_devices`
--

INSERT INTO `user_login_devices` (`id`, `device_fingerprint`, `device_label`, `last_seen_at`, `user_id`, `last_login_ip`, `last_login_locale`, `last_login_location`, `last_login_timezone`) VALUES
(1, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-24 15:55:19.266338', 14, '0:0:0:0:0:0:0:1', NULL, NULL, NULL),
(2, 'YWRtaW4xMQ', 'node | *', '2026-06-22 23:31:46.275813', 14, '0:0:0:0:0:0:0:1', NULL, NULL, NULL),
(3, 'bmd1eWVuZGluaGtpZXQxNTBAZ21haWwu', 'node | *', '2026-06-24 16:33:12.351215', 15, '0:0:0:0:0:0:0:1', NULL, NULL, NULL),
(4, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-06-29 18:45:45.476460', 15, '0:0:0:0:0:0:0:1', NULL, NULL, NULL),
(5, 'YWRtaW4', 'node | *', '2026-06-25 01:25:53.283806', 15, '0:0:0:0:0:0:0:1', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_login_device_approval_tokens`
--

CREATE TABLE `user_login_device_approval_tokens` (
  `id` bigint NOT NULL,
  `device_fingerprint` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locale_label` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone_label` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_login_device_approval_tokens`
--

INSERT INTO `user_login_device_approval_tokens` (`id`, `device_fingerprint`, `device_label`, `expires_at`, `token`, `used_at`, `user_id`, `ip_address`, `locale_label`, `location_label`, `otp_code`, `timezone_label`) VALUES
(1, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-14 01:01:27.590619', '85b1c098f8d5423187ef7747466612b682e84de20b8f46f68c30b9a7ff80664f', NULL, 14, '0:0:0:0:0:0:0:1', NULL, NULL, '465528', NULL),
(2, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-15 23:09:55.623169', '410d69a1cf6f4268a64156e2129c8d36ee2615ea12a64105b0bd208abd0975fe', NULL, 14, '0:0:0:0:0:0:0:1', NULL, NULL, '11916980', NULL),
(3, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-15 23:41:14.869619', '7a9f17c7f1f54a8a8c9012303e282ee411d030a0c5f94e4ea56936bdec00f2c2', '2026-06-15 23:26:42.573460', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '49659267', NULL),
(4, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-15 23:46:05.143246', '08f383b285794cbda23442b42f59f20ba8fafd286056429faca21184b4e9b1d3', '2026-06-15 23:31:21.732197', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '01269610', NULL),
(5, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 13:08:51.411691', '974b5d6f27264a30b1d3501baf720a762f8df70a33494f5ab9ee6808794d774e', '2026-06-16 12:54:32.110731', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '93608295', NULL),
(6, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 13:10:41.689436', '5cfd1af079e748439ce8f49904616dd27bb5eaaab40042698444921c0190ac89', '2026-06-16 12:55:56.575102', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '71663366', NULL),
(7, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 13:14:34.603639', 'ad4c21e170e24ff88d182db12cdf06b9a7061ffbeb22479d8674ad87a11e72b8', '2026-06-16 12:59:46.232136', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '22437942', NULL),
(8, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 13:21:06.444174', '37ed79b4e51b4ea0be80b5ad6c673e44b8ac172380484265a7fa010b101c4ba6', '2026-06-16 13:06:22.371035', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '23425302', NULL),
(9, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 13:38:55.287802', '379a5158da7b4c389d39224b162d67a097055d067e5b4881a2021cd59dcc61e3', '2026-06-16 13:24:14.091720', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '72946808', NULL),
(10, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 13:56:51.021367', '09f8152012ba4c58ae4e76f4b363cc011cb07cd398b34431883479f3efb1bd38', '2026-06-16 13:42:15.418068', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '49907254', NULL),
(11, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-16 23:31:01.709426', 'd58f6bee9f2449ae9309f214f778e8f5837f5db491b64b76ac3c627bde74344b', '2026-06-16 23:16:27.208755', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '98409225', NULL),
(12, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 00:01:27.823011', 'a14cac6f3b6e4a5581f5e8b23f62a1dd70edfda900494e94acac3faa1bf2ece1', '2026-06-16 23:53:03.851445', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '38161318', NULL),
(13, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 01:28:47.732058', '33a8a4978710467ca4e631f9acdc146aeab9da249b57456a83f32c466d5ec87c', '2026-06-17 01:14:37.510170', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '33904475', NULL),
(14, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 01:49:31.882642', '3d32c6dcb2ae4c57abfa4e1a4e2b8d31a12ed57d94cf485ba427cea0e5efef35', '2026-06-17 01:34:47.164171', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '21264054', NULL),
(15, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 02:06:38.190171', '1fc21bd7546c473889c620adf681d623fc1dc89039f64dca8abdc1f50122fabc', '2026-06-17 01:52:01.623828', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '76641935', NULL),
(16, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 02:31:17.256107', '2be9c84c92eb4d0481caea5e2f10c862ccb8ca442fcd4d7cb5f2e89211c48c24', '2026-06-17 02:16:51.903951', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '70039890', NULL),
(17, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 03:24:02.207399', '070229f111774f77bfdb462f9bb796b5ed1846cce60b4b37ac644acf5457a24b', '2026-06-17 03:09:29.098027', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '81999072', NULL),
(18, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 22:06:10.050226', 'fa4893ff358345fbb1ab66541cb0df6e341a17148e5242e6b284d0c6b4971c2c', '2026-06-17 21:51:27.560649', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '29801271', NULL),
(19, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 22:24:28.345938', 'd693d9b0b4454ae48e411e5a7580cad3ba062a541a7b4ad3944ce5c4644b9d6b', '2026-06-17 22:09:50.967635', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '18324908', NULL),
(20, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 22:43:45.176584', 'd3f4f95637824fb294bfb684d504128fc28bd6b526e841e9a6432a8e80315163', '2026-06-17 22:29:01.786433', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '31236285', NULL),
(21, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 23:03:52.970233', 'ee28a5b6ad444060a6bc296479519c9d1ed6e68d2b22442f87a29fd6db3b9096', '2026-06-17 22:49:10.006068', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '14927949', NULL),
(22, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-17 23:49:19.581516', 'd2ce9fc2003f403281199c3b3db9e67f512d65d226954433b97e14690e11c9f1', '2026-06-17 23:34:34.187271', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '79525969', NULL),
(23, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-18 00:28:55.506681', 'd9b226564c4644de9f34bf9e01590b9f1e6a9877b066477588be506010d8e8ed', '2026-06-18 00:14:23.017267', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '68303505', NULL),
(24, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-18 10:28:55.156193', '3518d5a4cfc54347981a3346606d85aaf779b2b169b343459204196d74da1c06', '2026-06-18 10:14:11.734408', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '55498665', NULL),
(25, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-18 11:11:10.871614', '7e3f3e89a3824c54bde72182184e5f8dc75cd147f1d74d3da5f550a458f11ce5', '2026-06-18 10:57:01.529336', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '90293563', NULL),
(26, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-18 11:19:51.070008', '11ea8f8c154a428c876b6d638ffdea109901f359564142e88a03061ac4f6406d', '2026-06-18 11:05:08.350823', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '98530102', NULL),
(27, 'myfingerprint', 'curl/8.19.0 | null', '2026-06-18 11:26:58.214245', '83eeed90e49f43e5830f8cb4bd25e8219fce44370fed437faf9a6f7898a965cf', NULL, 14, '0:0:0:0:0:0:0:1', NULL, NULL, '89754380', NULL),
(28, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-18 11:27:31.909522', 'a01e86bc4edb4e91a42f0d4cefe63acea764d00c34f74b52bde9efe19c6ff06f', '2026-06-18 11:12:54.337931', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '30358526', NULL),
(29, 'YWRtaW4xMQ', 'node | *', '2026-06-18 11:37:58.860210', 'bc9011f75e2f4d8098c1cef2722ca57ce059ce07ccca4bd493021e7aa467546a', '2026-06-18 11:23:14.668468', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '82588255', NULL),
(30, 'YWRtaW4xMQ', 'node | *', '2026-06-18 11:41:47.282630', 'd7db81d0c5ff45e2843572d8c63685f9ae6701695c3e4e22976d6eaf95af3ae0', '2026-06-18 11:27:04.173367', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '33618491', NULL),
(31, 'YWRtaW4xMQ', 'node | *', '2026-06-18 12:37:05.593908', 'a364af4e35a345389b3719158aeb3c51ff460464941f4c20a9691a8d59438c1a', '2026-06-18 12:22:24.501981', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '95575748', NULL),
(32, 'YWRtaW4xMQ', 'node | *', '2026-06-18 17:51:00.948792', '7e4112c212924df5adb74ffa4d743d178b95b928188d4c47a226fcd7f789387b', '2026-06-18 17:36:19.719207', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '65254083', NULL),
(33, 'YWRtaW4xMQ', 'node | *', '2026-06-18 18:08:34.735508', '83a3fde3c0e74e7c853b6e0986cf6bd0e4e5543df7cf4f87bb46104805e920cd', '2026-06-18 17:53:53.560726', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '14422391', NULL),
(34, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-18 18:47:00.593375', 'bc026c97af6241129cb24148560e9eb694184d9c64fc49238c6255aa47dcbe97', NULL, 14, '0:0:0:0:0:0:0:1', NULL, NULL, '93780543', NULL),
(35, 'YWRtaW4xMQ', 'node | *', '2026-06-18 18:47:51.952193', '56e2f5958bd547a4a6008dfd636953eba1606c1a94d74940ac7ad4fbb5bfcc4c', '2026-06-18 18:33:10.088697', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '39176711', NULL),
(36, 'YWRtaW4xMQ', 'node | *', '2026-06-18 19:19:55.151219', 'abfb0f96d31c4a38a883f8ba7ffdbe20c9308182ad75431b8da01e40599a599d', '2026-06-18 19:05:37.324528', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '64177088', NULL),
(37, 'YWRtaW4xMQ', 'node | *', '2026-06-18 19:37:47.317245', 'dd40958523bd4770b7975723b1ebc578b5541b6655c54c689a1e6ac4a2f50309', '2026-06-18 19:23:27.826487', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '53120268', NULL),
(38, 'YWRtaW4xMQ', 'node | *', '2026-06-18 19:53:40.575202', '60d0e7ed5ea14b03a1f27e3755b47817882865475f6840debf0eb6915510e2f7', '2026-06-18 19:39:01.209912', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '81736497', NULL),
(39, 'YWRtaW4xMQ', 'node | *', '2026-06-18 20:12:38.048641', '1c3e08bd42884717bb24ff5c63928f0a0a0e82adcf1946ccb8a2b7219ce91b20', '2026-06-18 19:58:05.761879', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '43366270', NULL),
(40, 'YWRtaW4xMQ', 'node | *', '2026-06-18 20:33:23.503567', 'd60c8838b5f34bfd9c9ad459ebbea065104a6b7077c64c2192ebb56b6b532519', '2026-06-18 20:18:50.133551', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '03420148', NULL),
(41, 'YWRtaW4xMQ', 'node | *', '2026-06-19 13:01:02.444998', '877ab8e97f38478f9251a3ab70b1949a604cdf0c4e01479fb407efb8e9687993', '2026-06-19 12:46:17.199257', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '59163819', NULL),
(42, 'YWRtaW4xMQ', 'node | *', '2026-06-19 13:17:46.991564', 'fc27cf47b90f40e78c5ab01fca8b07e7af84016cea874c0b970d906066890eaa', '2026-06-19 13:03:05.372702', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '26696313', NULL),
(43, 'YWRtaW4xMQ', 'node | *', '2026-06-19 14:06:35.250819', 'f8c0c47f77194afba53294dd418d5e90b9e1a2e5ac6e4e019c9e701ac7b4ed6f', '2026-06-19 13:52:04.617121', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '57389739', NULL),
(44, 'YWRtaW4xMQ', 'node | *', '2026-06-19 14:23:33.500831', '09cc1a799a7d429c81a59c138f7ef590461bfbb1ecce4823af9e974e6f76be88', '2026-06-19 14:08:52.027219', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '49279481', NULL),
(45, 'YWRtaW4xMQ', 'node | *', '2026-06-19 14:55:12.392848', '94df62f672ae4ef8bc17c15c387ac27ed6bf76e5d62c4bd59ac663dd8aafb926', '2026-06-19 14:40:46.367603', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '16296160', NULL),
(46, 'YWRtaW4xMQ', 'node | *', '2026-06-19 15:11:17.960626', '90fa73e1483f492eb8716891f82fe90668263297c7794f43b3d4ba4582140392', '2026-06-19 14:56:41.165481', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '44940709', NULL),
(47, 'YWRtaW4xMQ', 'node | *', '2026-06-19 15:38:43.021652', 'e628c4b255034166891f66e44281a90ab1885e6a4fd74d2aa23091797429dc68', '2026-06-19 15:24:01.913672', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '10947491', NULL),
(48, 'YWRtaW4xMQ', 'node | *', '2026-06-22 22:30:05.525997', '08614fa927e9447b8e1151416068d2a80ea3dc611a994a9790485025b4c0ebb7', '2026-06-22 22:15:32.892959', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '74737228', NULL),
(49, 'YWRtaW4xMQ', 'node | *', '2026-06-22 22:47:47.143431', '71494d08b260458998ef503c0ab9b8112e2b82ad31a448aab16ed7e4bb5c6b0b', '2026-06-22 22:33:06.190140', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '02982523', NULL),
(50, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-22 23:06:20.998098', 'd5e08c02067f4d9db3f7f99365f4c6ef29ff02b0bc7f4ed796030313c0c6df70', NULL, 14, '0:0:0:0:0:0:0:1', NULL, NULL, '41993827', NULL),
(51, 'YWRtaW4xMQ', 'node | *', '2026-06-22 23:07:37.544644', 'bca5b22e680f40e79ff98144119826ad80e0cde7405a4c32a77bf5e7da1ea564', '2026-06-22 22:52:49.748431', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '87250859', NULL),
(52, 'YWRtaW4xMQ', 'node | *', '2026-06-22 23:27:22.928167', '8b54a7aa8eb24b30946fc9b1af2a473bab0f83a3727c4f3fa2a823578bdaa6c1', '2026-06-22 23:12:48.610944', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '00130536', NULL),
(53, 'YWRtaW4xMQ', 'node | *', '2026-06-22 23:46:23.614024', '1f6fce503cb74c1a903d3aaecfe98b9a4a7299f039c2476db5c4056006dffbcb', '2026-06-22 23:31:46.283231', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '28068912', NULL),
(54, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-06-24 16:11:18.610628', 'b65c65e9ab424b798a4be839e9decc50aa438d280a4449f19b2af4cb4aec3681', NULL, 14, '0:0:0:0:0:0:0:1', NULL, NULL, '80530694', NULL),
(55, '2b59864d5e8302481f300c37483aab13ff2c052ef9deaef03d06bff43b26a86d', 'node | *', '2026-06-24 16:05:29.233264', 'a9d89eebc43a4153b3178f573951d41f9cb1eb00a4b844639f1b2ac30ea88fa2', '2026-06-24 15:55:19.333281', 14, '0:0:0:0:0:0:0:1', NULL, NULL, '61317621', NULL),
(56, 'YWRtaW4', 'node | *', '2026-06-24 16:43:25.959968', 'faa1b3cb77ea4c5994c6687ce173c1bbf66fc9519d37496b96bfed31861c7407', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '03089795', NULL),
(57, 'bmd1eWVuZGluaGtpZXQxNTBAZ21haWwu', 'node | *', '2026-06-24 16:47:47.277162', '3c7b680c533540a898509b7761d4b5eba4f2d639f0c3495d9706fd5876602837', '2026-06-24 16:33:12.526263', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '44694803', NULL),
(58, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-06-24 19:25:26.258368', '009b54b43fbb4f02af46a6b59e22eb76b4ce5d51baca453cbf55474f4f88e710', '2026-06-24 19:10:37.453557', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '23930872', NULL),
(59, 'YWRtaW4', 'node | *', '2026-06-24 23:32:37.960668', '06ab2d00647c46c1a6f4fa9795899b7e2918df3353f44c15a0ce17be8bd8faf2', '2026-06-24 23:18:58.683091', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '95106042', NULL),
(60, 'YWRtaW4', 'node | *', '2026-06-25 01:07:40.255177', '0b2da0b89a8b4283837159bfc881467a31d6011fd39d4f46b1e4e6b28fdaf1e3', '2026-06-25 00:53:38.309007', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '16114209', NULL),
(61, 'YWRtaW4', 'node | *', '2026-06-25 01:20:19.528918', '7cd758d24b734e63a1a1de667ea3e8b586cadc7b0ef44db289e0bfdc6bef1bdd', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '82169569', NULL),
(62, 'YWRtaW4', 'node | *', '2026-06-25 01:40:11.692081', '1cc693cc30124049a486357e06696edafb1db5c307f846a6a8eddddc073914fb', '2026-06-25 01:25:53.422908', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '23238515', NULL),
(63, 'YWRtaW4', 'node | *', '2026-06-25 19:53:06.713367', '3f7c4fb985374cee837a73d900e2c82d1868487f7aa74eb7a60f4b3704194924', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '28981772', NULL),
(64, 'YWRtaW4', 'node | *', '2026-06-25 20:08:28.077755', 'bc0b3a1e6e7849d8967c13f07bd3967f7f0ad483116f412c9c4a40be2765f274', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '92710514', NULL),
(65, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-06-28 01:40:41.469629', 'beb72392dec2431cafa98b2c5861e6d169b64cb451ae4c1b90f98dc2f851b57f', '2026-06-28 01:26:22.477563', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '45836902', NULL),
(66, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-06-29 18:59:54.230595', '1dbd04dcdd844ca19ecf1f86538a9ffcf77bbd25347c44dcae58721c92947a3b', '2026-06-29 18:45:45.578119', 15, '0:0:0:0:0:0:0:1', NULL, NULL, '28413733', NULL),
(67, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-07-01 13:45:09.575228', 'd6448ff8a03347e7a74a680b9002e9af66e4341b085e4b0c9a8c2373667ff01e', NULL, 15, '3.214.184.111', NULL, NULL, '13929700', NULL),
(68, 'YWRtaW5wcm8', 'node | *', '2026-07-02 11:53:09.265645', '8dad4a89412748caa02528a521a1f7b8413c08bc71024a16827c1e762fb0950a', NULL, 16, '0:0:0:0:0:0:0:1', NULL, NULL, '63576363', NULL),
(69, 'YWRtaW4', 'node | *', '2026-07-02 11:54:46.964798', '414b2ff04d5747668e93b5c8c9747701d6b59866bfc44827ae40b2e6ca9e217b', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '47105455', NULL),
(70, 'bmd1eWVuZGluaGtpZXQxMjA5MjAwNUBn', 'node | *', '2026-07-02 12:02:06.096591', 'e3753c02cce3459aa69e30b5a03ebdbdffb157b5a6d5463db87f8cb9555d188a', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '28970671', NULL),
(71, 'YWRtaW4', 'node | *', '2026-07-07 06:03:26.814138', '639be50581f3442fb6117ac1fe0fcacf255a04d6c3b245a0b928f930cdaac921', NULL, 15, '0:0:0:0:0:0:0:1', NULL, NULL, '36642291', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_password_reset_tokens`
--

CREATE TABLE `user_password_reset_tokens` (
  `id` bigint NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `token` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `used_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_password_reset_tokens`
--

INSERT INTO `user_password_reset_tokens` (`id`, `expires_at`, `token`, `used_at`, `user_id`) VALUES
(3, '2026-07-07 06:15:28.270846', '20f64a6dd2954e88ba988d438e02786ce559668b434444cfb21c35e7f68d6a7b', '2026-07-07 05:48:12.815832', 15);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_profile_change_logs`
--

CREATE TABLE `user_profile_change_logs` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` datetime(6) DEFAULT NULL,
  `changed_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_field` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_value` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_value` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_details_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_profile_change_logs`
--

INSERT INTO `user_profile_change_logs` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `changed_at`, `changed_by`, `changed_field`, `new_value`, `old_value`, `user_details_id`) VALUES
(1, '2026-06-16 23:21:36.780300', NULL, NULL, NULL, '2026-06-16 23:21:36.780822', NULL, '2026-06-16 23:21:36.777005', NULL, 'firstName', 'Nguyễn', 'admin11', 9),
(2, '2026-06-16 23:21:36.810922', NULL, NULL, NULL, '2026-06-16 23:21:36.810922', NULL, '2026-06-16 23:21:36.809757', NULL, 'lastName', 'Kiệt', 'User', 9),
(3, '2026-06-16 23:21:36.814927', NULL, NULL, NULL, '2026-06-16 23:21:36.814927', NULL, '2026-06-16 23:21:36.814397', NULL, 'phoneNumber', '0865482131', NULL, 9),
(4, '2026-06-16 23:21:36.818132', NULL, NULL, NULL, '2026-06-16 23:21:36.818132', NULL, '2026-06-16 23:21:36.818132', NULL, 'gender', 'male', NULL, 9),
(5, '2026-06-16 23:21:36.820500', NULL, NULL, NULL, '2026-06-16 23:21:36.820500', NULL, '2026-06-16 23:21:36.820500', NULL, 'birthDate', '2003-01-28', NULL, 9),
(6, '2026-06-16 23:27:51.363976', NULL, NULL, NULL, '2026-06-16 23:27:51.363976', NULL, '2026-06-16 23:27:51.352967', NULL, 'lastName', 'Kiệtf', 'Kiệt', 9),
(7, '2026-06-16 23:31:33.275130', NULL, NULL, NULL, '2026-06-16 23:31:33.275710', NULL, '2026-06-16 23:31:33.258832', NULL, 'firstName', 'Nguyễn g', 'Nguyễn', 9),
(8, '2026-06-17 01:15:37.100651', NULL, NULL, NULL, '2026-06-17 01:15:37.101672', NULL, '2026-06-17 01:15:36.789154', 'admin11', 'avatarUrl', '/api/accounts/users/14/avatar/file/d0257321dafd41e09ad7be8cef98fb94.jpg', NULL, 9),
(9, '2026-06-17 01:16:40.231465', NULL, NULL, NULL, '2026-06-17 01:16:40.231988', NULL, '2026-06-17 01:16:40.208963', 'admin11', 'avatarUrl', '/api/accounts/users/14/avatar/file/b6048c02fb434ade9894be57abb63cb4.jpg', '/api/accounts/users/14/avatar/file/d0257321dafd41e09ad7be8cef98fb94.jpg', 9),
(10, '2026-06-17 22:35:28.056451', NULL, NULL, NULL, '2026-06-17 22:35:28.056451', NULL, '2026-06-17 22:35:28.037993', NULL, 'email', 'nguyendinhkiet150@gmail.com', 'nguyendinhkiet12092005@gmail.com', 9),
(11, '2026-06-17 22:52:53.535525', NULL, NULL, NULL, '2026-06-17 22:52:53.535525', NULL, '2026-06-17 22:52:53.522148', NULL, 'email', 'nguyendinhkiet12092005@gmail.com', 'nguyendinhkiet150@gmail.com', 9),
(12, '2026-06-17 23:38:46.148784', NULL, NULL, NULL, '2026-06-17 23:38:46.148784', NULL, '2026-06-17 23:38:46.123480', 'admin11', 'password', '[UPDATED]', '[PROTECTED]', 9),
(13, '2026-06-17 23:45:03.564735', NULL, NULL, NULL, '2026-06-17 23:45:03.564735', NULL, '2026-06-17 23:45:03.533971', 'admin11', 'password', '[UPDATED]', '[PROTECTED]', 9),
(14, '2026-06-24 17:37:10.831823', NULL, NULL, NULL, '2026-06-24 17:37:10.831823', NULL, '2026-06-24 17:37:10.700028', NULL, 'firstName', 'admina aa', 'admin', 10),
(15, '2026-06-24 17:37:10.998760', NULL, NULL, NULL, '2026-06-24 17:37:10.998760', NULL, '2026-06-24 17:37:10.984616', NULL, 'phoneNumber', '086548213', '0865482131', 10),
(16, '2026-06-24 17:37:11.012949', NULL, NULL, NULL, '2026-06-24 17:37:11.014248', NULL, '2026-06-24 17:37:11.005397', NULL, 'gender', 'male', NULL, 10),
(17, '2026-06-24 17:37:11.017297', NULL, NULL, NULL, '2026-06-24 17:37:11.017297', NULL, '2026-06-24 17:37:11.017297', NULL, 'birthDate', '2005-09-12', NULL, 10),
(18, '2026-06-24 17:37:14.322598', NULL, NULL, NULL, '2026-06-24 17:37:14.322598', NULL, '2026-06-24 17:37:14.317330', NULL, 'phoneNumber', '086548213', NULL, 10),
(19, '2026-06-24 17:37:18.382378', NULL, NULL, NULL, '2026-06-24 17:37:18.382378', NULL, '2026-06-24 17:37:18.381833', NULL, 'phoneNumber', '086548213', NULL, 10),
(20, '2026-06-24 17:37:18.732265', NULL, NULL, NULL, '2026-06-24 17:37:18.732265', NULL, '2026-06-24 17:37:18.731738', NULL, 'phoneNumber', '086548213', NULL, 10),
(21, '2026-06-24 17:37:31.791611', NULL, NULL, NULL, '2026-06-24 17:37:31.791611', NULL, '2026-06-24 17:37:31.788217', NULL, 'phoneNumber', '086548213', NULL, 10),
(22, '2026-06-24 18:00:08.721119', NULL, NULL, NULL, '2026-06-24 18:00:08.721652', NULL, '2026-06-24 18:00:08.546524', 'admin', 'avatarUrl', '/api/accounts/users/15/avatar/file/2de141803ed64723a20369abc12c61cc.jpg', '/api/accounts/users/15/avatar/file/a1cdd08defe641a0ac4004d25d3dab6b.jpg', 10),
(23, '2026-06-24 18:00:39.179481', NULL, NULL, NULL, '2026-06-24 18:00:39.179481', NULL, '2026-06-24 18:00:39.175977', NULL, 'firstName', 'Nguyễn Đình', 'admina aa', 10),
(24, '2026-06-24 18:00:39.187167', NULL, NULL, NULL, '2026-06-24 18:00:39.187167', NULL, '2026-06-24 18:00:39.184341', NULL, 'lastName', 'Kiệt', 'User', 10),
(25, '2026-06-24 18:00:39.195752', NULL, NULL, NULL, '2026-06-24 18:00:39.195752', NULL, '2026-06-24 18:00:39.195228', NULL, 'phoneNumber', '0865482131', NULL, 10),
(26, '2026-06-24 18:05:14.534510', NULL, NULL, NULL, '2026-06-24 18:05:14.534510', NULL, '2026-06-24 18:05:14.491235', 'admin', 'password', '[UPDATED]', '[PROTECTED]', 10),
(27, '2026-06-24 19:05:45.637717', NULL, NULL, NULL, '2026-06-24 19:05:45.637717', NULL, '2026-06-24 19:05:45.520591', NULL, 'email', 'nguyendinhkiet12092005@gmail.com', 'nguyendinhkiet150@gmail.com', 10),
(28, '2026-06-24 23:21:38.363988', NULL, NULL, NULL, '2026-06-24 23:21:38.372864', NULL, '2026-06-24 23:21:38.227105', NULL, 'email', 'nguyendinhkiet150@gmail.com', 'nguyendinhkiet12092005@gmail.com', 10),
(29, '2026-06-24 23:39:18.119962', NULL, NULL, NULL, '2026-06-24 23:39:18.120653', NULL, '2026-06-24 23:39:17.756565', NULL, 'email', 'nguyendinhkiet12092005@gmail.com', 'nguyendinhkiet150@gmail.com', 10),
(30, '2026-06-24 23:40:08.039087', NULL, NULL, NULL, '2026-06-24 23:40:08.039087', NULL, '2026-06-24 23:40:08.037951', NULL, 'email', 'nguyendinhkiet150@gmail.com', 'nguyendinhkiet12092005@gmail.com', 10),
(31, '2026-06-24 23:44:04.648418', NULL, NULL, NULL, '2026-06-24 23:44:04.648418', NULL, '2026-06-24 23:44:04.636522', NULL, 'email', 'nguyendinhkiet12092005@gmail.com', 'nguyendinhkiet150@gmail.com', 10),
(32, '2026-06-24 23:52:29.957660', NULL, NULL, NULL, '2026-06-24 23:52:29.958282', NULL, '2026-06-24 23:52:29.880576', 'admin', 'password', '[UPDATED]', '[PROTECTED]', 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_role`
--

CREATE TABLE `user_role` (
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `deleted_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_role`
--

INSERT INTO `user_role` (`id`, `created_at`, `created_by`, `deleted_at`, `deleted_by`, `updated_at`, `updated_by`, `role_name`) VALUES
(1, '2026-06-12 11:54:48.000000', 'system', NULL, NULL, '2026-06-12 11:54:48.000000', 'system', 'ROLE_ADMIN'),
(2, '2026-06-12 11:54:48.000000', 'system', NULL, NULL, '2026-06-12 11:54:48.000000', 'system', 'ROLE_STAFF'),
(3, '2026-06-12 11:54:48.000000', 'system', NULL, NULL, '2026-06-12 11:54:48.000000', 'system', 'ROLE_USER');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_k8d0f2n7n88w1a16yhua64onx` (`user_name`),
  ADD UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`),
  ADD KEY `FKqjp6iwe2anthe5yx88fl0coan` (`role_id`),
  ADD KEY `FKo67696pv3l098u660mnbtsi32` (`user_details_id`);

--
-- Chỉ mục cho bảng `users_details`
--
ALTER TABLE `users_details`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `user_activation_tokens`
--
ALTER TABLE `user_activation_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_rjm5ug207x92udi7f7hhck9sq` (`token`),
  ADD KEY `FKn3ecsoid6jap5yyfk5llb2s06` (`user_id`);

--
-- Chỉ mục cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKprpd1m1cco0obn30efx8mdw95` (`user_details_id`);

--
-- Chỉ mục cho bảng `user_login_devices`
--
ALTER TABLE `user_login_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_login_device_fingerprint` (`user_id`,`device_fingerprint`);

--
-- Chỉ mục cho bảng `user_login_device_approval_tokens`
--
ALTER TABLE `user_login_device_approval_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_4kj4sobuvjy1er4ubfojrhb3m` (`token`),
  ADD KEY `FKikp624s1ry3vphhjco6chmr0u` (`user_id`);

--
-- Chỉ mục cho bảng `user_password_reset_tokens`
--
ALTER TABLE `user_password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_c8wboe5fuhvg5j5btgw1sbrpm` (`token`),
  ADD KEY `FKinxw48vu6y9ovjiqhbtldx40l` (`user_id`);

--
-- Chỉ mục cho bảng `user_profile_change_logs`
--
ALTER TABLE `user_profile_change_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKagx94fv9c53mujot1jlsc3fjf` (`user_details_id`);

--
-- Chỉ mục cho bảng `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `users_details`
--
ALTER TABLE `users_details`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `user_activation_tokens`
--
ALTER TABLE `user_activation_tokens`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `user_login_devices`
--
ALTER TABLE `user_login_devices`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `user_login_device_approval_tokens`
--
ALTER TABLE `user_login_device_approval_tokens`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT cho bảng `user_password_reset_tokens`
--
ALTER TABLE `user_password_reset_tokens`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `user_profile_change_logs`
--
ALTER TABLE `user_profile_change_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FKo67696pv3l098u660mnbtsi32` FOREIGN KEY (`user_details_id`) REFERENCES `users_details` (`id`),
  ADD CONSTRAINT `FKqjp6iwe2anthe5yx88fl0coan` FOREIGN KEY (`role_id`) REFERENCES `user_role` (`id`);

--
-- Ràng buộc cho bảng `user_activation_tokens`
--
ALTER TABLE `user_activation_tokens`
  ADD CONSTRAINT `FKn3ecsoid6jap5yyfk5llb2s06` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ràng buộc cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `FKprpd1m1cco0obn30efx8mdw95` FOREIGN KEY (`user_details_id`) REFERENCES `users_details` (`id`);

--
-- Ràng buộc cho bảng `user_login_devices`
--
ALTER TABLE `user_login_devices`
  ADD CONSTRAINT `FKi1in5drkyfg24u3nt8rapaj6h` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ràng buộc cho bảng `user_login_device_approval_tokens`
--
ALTER TABLE `user_login_device_approval_tokens`
  ADD CONSTRAINT `FKikp624s1ry3vphhjco6chmr0u` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ràng buộc cho bảng `user_password_reset_tokens`
--
ALTER TABLE `user_password_reset_tokens`
  ADD CONSTRAINT `FKinxw48vu6y9ovjiqhbtldx40l` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ràng buộc cho bảng `user_profile_change_logs`
--
ALTER TABLE `user_profile_change_logs`
  ADD CONSTRAINT `FKagx94fv9c53mujot1jlsc3fjf` FOREIGN KEY (`user_details_id`) REFERENCES `users_details` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
