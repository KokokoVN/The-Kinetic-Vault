# 🛒 E-Commerce Microservices System (Enterprise Edition v2.5.0)

> Hệ thống Thương mại điện tử kiến trúc Microservices phân tán hiện đại, xây dựng trên nền tảng Spring Boot, Spring Cloud và Next.js 16 BFF Web App.

---

## 🏗️ Kiến trúc Tổng thể Hệ thống

Hệ thống bao gồm **13 Microservices Backend**, **1 API Gateway**, **1 Netflix Eureka Server** và **1 Frontend Web Client (Next.js 16)**:

```
[ Next.js 16 BFF Client (Port 3000) ]
                 │
                 ▼ (REST API)
[ API Gateway (Port 8080) ] ◄───► [ Netflix Eureka Discovery (Port 8761) ]
                 │
  ┌──────────────┼───────────────────────────┬──────────────────────┐
  ▼              ▼                           ▼                      ▼
[user-service] [product-catalog]       [cart-service]        [order-service]
 (Port 8081)     (Port 8082)            (Port 8084)            (Port 8085)
  │              │                           │                      │
  ▼              ▼                           ▼                      ▼
[inventory]    [payment-service]       [sale-service]         [review-service]
 (Port 8083)     (Port 8086)            (Port 8087)            (Port 8088)
  │              │                           │                      │
  ▼              ▼                           ▼                      ▼
[ai-chatbot]   [recommendation]        [activity-log]         [notification]
 (Port 8089)     (Port 8090)            (Port 8091)            (Port 8092)
                                             │
                                             ▼
                                     [telegram-service]
                                        (Port 8093)
```

---

## 🛠️ Công nghệ Sử dụng

### 1. Frontend & BFF Layer
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript.
- **Styling & UI**: Tailwind CSS, `lucide-react`, `sonner` (Toast), `next-themes` (Dark/Light Mode).
- **Tiện ích**: `xlsx` (Excel Reader/Writer), `jspdf` (Hóa đơn PDF), `qrcode.react`.

### 2. Backend Microservices
- **Core Framework**: Java 11 / Java 17 + Spring Boot 2.1.5.RELEASE.
- **Spring Cloud Stack**: Spring Cloud Greenwich.SR1 (Eureka Server/Client, OpenFeign, Spring Cloud Gateway).
- **Bảo mật & Phân quyền**: JWT HMAC SHA-256 (`jjwt 0.9.1`), Two-Factor Authentication 2FA (`dev.samstevens.totp`), BCrypt.
- **Cơ sở dữ liệu**: MySQL 8.0 / MariaDB (Mô hình Database-per-Service), Spring Data JPA + Hibernate ORM.
- **Tích hợp Thanh toán**: VNPay Sandbox, PayOS, SePay Webhook (VietQR tự động gạch nợ).
- **Tích hợp Bot CSKH**: Telegram Bot API cảnh báo tồn kho và thông báo đơn mới tức thời.

### 3. Vận hành & DevOps
- **Docker Compose**: Đóng gói cụm container backend & database.
- **Cloudflare Tunnel**: Expose webhook internet vào môi trường local an toàn.
- **Automation Scripts**: `build-all.bat`, `chay-nhanh.bat`, `chay-toi-thieu.bat`.

---

## 🚀 Hướng dẫn Khởi chạy Nhanh

### Cách 1: Khởi chạy bằng Docker (Khuyến nghị cho Triển khai / Demo Độc lập)
> Yêu cầu: Đã bật Docker Desktop trên máy.

**Lựa chọn A - Dùng file Batch tự động (1-Click):**
Chạy file [chay-docker.bat](file:///e:/e-commerce-microservices-master/e-commerce-microservices-master/chay-docker.bat) và chọn chế độ mong muốn (Toàn bộ hoặc Rút gọn tiết kiệm RAM).

**Lựa chọn B - Dùng lệnh Docker Compose trực tiếp:**
- Chạy toàn bộ hệ thống (15 Microservices + Frontend + MySQL + Redis):
  ```bash
  docker compose up -d --build
  ```
- Chạy bản rút gọn (Core services: Eureka, Gateway, User, Product, Inventory, Cart, Order, Frontend, MySQL, Redis):
  ```bash
  docker compose -f docker-compose.lite.yml up -d --build
  ```
- Dừng hệ thống Docker:
  ```bash
  docker compose down
  ```

### Cách 2: Chế độ Tiết kiệm RAM chạy trên Host (Java Local)
Chỉ khởi chạy các dịch vụ lõi (Eureka, Gateway, User, Product, Cart, Order, Payment):
```cmd
chay-toi-thieu.bat
```

### Cách 3: Khởi chạy Đầy đủ Tất cả Microservices trên Host
```cmd
chay-nhanh.bat
```

### Khởi chạy Frontend Web Client (nếu chạy local)
```bash
cd stitch
npm install
npm run dev
```
Truy cập trình duyệt: `http://localhost:3000`

---

## 📑 Tài liệu Chi tiết API
Xem chi tiết danh sách tất cả 60+ API endpoints, tham số request/response và mã lỗi tại file:
👉 [DANH_SACH_CHI_TIET_API.md](./docs/DANH_SACH_CHI_TIET_API.md)
