# Tài liệu nghiệp vụ và mô tả công việc — Hệ thống thương mại điện tử (Microservices)

Tài liệu này mô tả **nghiệp vụ** cốt lõi của nền tảng và **phạm vi công việc** liên quan tới phát triển, vận hành và bảo trì. Có thể dùng làm cơ sở trao đổi với nghiệp vụ, onboarding kỹ thuật, hoặc khung mô tả vai trò trong nhóm dự án.

---

## 1. Mục đích và phạm vi hệ thống

**Mục đích:** Hỗ trợ bán hàng trực tuyến — quản lý người dùng, danh mục & sản phẩm, giỏ hàng, đơn hàng, thanh toán, giao hàng, thông báo và ghi nhận hoạt động — theo kiến trúc **microservices**, đăng ký dịch vụ qua **Eureka**, vào/ra qua **API Gateway (Zuul)**.

**Phạm vi ngoài (có thể mở rộng sau):** Kế toán chi tiết, CRM đầy đủ, hệ thống kho vật lý đa kho thực tế, chống gian lận nâng cao (fraud), v.v.

---

## 2. Nghiệp vụ theo miền (domain)

### 2.1. Tài khoản & xác thực (User Service)

| Nghiệp vụ | Mô tả ngắn |
|-----------|------------|
| Đăng ký người dùng | Tạo tài khoản, gán vai trò mặc định, mật khẩu được mã hóa. |
| Đăng nhập | Xác thực, cấp **access token** (JWT, thời gian sống ngắn) và **refresh token** (thời gian sống dài hơn). |
| Làm mới token | Endpoint refresh: đổi refresh token hợp lệ lấy cặp token mới (có thể xoay refresh). |
| Quản lý hồ sơ người dùng | Đọc/cập nhật thông tin người dùng (theo API hiện có của dịch vụ). |

**Quy tắc nghiệp vụ liên quan JWT:** Access token dùng cho gọi API bảo vệ; refresh token **không** được dùng thay access khi gọi API nghiệp vụ (gateway và dịch vụ đích có thể từ chối).

### 2.2. Danh mục & sản phẩm (Product Catalog Service)

| Nghiệp vụ | Mô tả ngắn |
|-----------|------------|
| Danh mục (category) | Phân loại sản phẩm, hỗ trợ quản trị. |
| Sản phẩm & ảnh | Sản phẩm có thể có nhiều ảnh; giá hiển thị có thể phản ánh khuyến mãi (effective price). |
| Giảm giá / khuyến mãi | Cấu hình giảm giá theo sản phẩm (theo mô hình đã triển khai). |
| Kho & tồn | Kho, số dư tồn, phiếu nhập/xuất (quản trị). |

### 2.3. Giỏ hàng & đơn hàng (Order Service)

| Nghiệp vụ | Mô tả ngắn |
|-----------|------------|
| Giỏ hàng | Thêm/sửa/xóa dòng giỏ, lưu trữ phiên (thường gắn cookie/session/redis tùy cấu hình). |
| Đặt hàng | Từ giỏ hợp lệ tạo đơn: tổng tiền, trạng thái ban đầu (ví dụ chờ thanh toán), liên kết người dùng. |
| Bảo mật đặt hàng | **Không chỉ tin gateway:** dịch vụ đơn hàng kiểm tra JWT access; `userId` trên URL phải **khớp** `uid` trong token khi gọi tạo đơn. |

### 2.4. Thanh toán, giao hàng, thông báo (Payment / Shipping / Notification)

| Nghiệp vụ | Mô tả ngắn |
|-----------|------------|
| Thanh toán | Xử lý hoặc ghi nhận luồng thanh toán (theo API dịch vụ). |
| Giao hàng | Thông tin vận chuyển / trạng thái giao (theo API dịch vụ). |
| Thông báo | Gửi hoặc hàng đợi thông báo (email/push tùy triển khai). |

### 2.5. Nhật ký hoạt động (Activity Log Service)

| Nghiệp vụ | Mô tả ngắn |
|-----------|------------|
| Ghi log truy cập | Gateway (hoặc client) ghi lại hoạt động web/API để phục vụ audit, phân tích hành vi (theo cấu hình bật/tắt). |

### 2.6. Gợi ý sản phẩm (Recommendation Service)

| Nghiệp vụ | Mô tả ngắn |
|-----------|------------|
| Gợi ý | Đề xuất sản phẩm dựa trên lịch sử hoặc mô hình (theo logic dịch vụ). |

### 2.7. Audit dữ liệu (chung nhiều service)

Các thực thể quan trọng có thể có các trường: người tạo/sửa/xóa, thời điểm tương ứng — phục vụ truy vết thay đổi và tuân thủ nội bộ.

---

## 3. Luồng nghiệp vụ tiêu biểu

1. **Khách xem catalog** → không cần đăng nhập (tùy cấu hình public path trên gateway).  
2. **Khách thêm giỏ** → cookie/session giỏ hàng.  
3. **Khách đăng nhập** → nhận access + refresh token.  
4. **Khách đặt hàng** → gửi **Bearer access token**; gateway và **order-service** đều kiểm tra; `POST /order/{userId}` chỉ thành công nếu token đúng user.  
5. **Hết hạn access** → client gọi **refresh** lấy token mới, không gửi refresh token lên API đặt hàng.  
6. **Hậu mãi** → payment / shipping / notification xử lý theo từng dịch vụ.

---

## 4. Mô tả công việc (phạm vi phát triển & vận hành)

Phần này mô tả **công việc thường gặp** khi làm việc với codebase này (có thể dùng làm checklist hoặc mô tả sprint).

### 4.1. Phát triển tính năng

- Thiết kế/chỉnh sửa API REST theo từng service; cập nhật **Feign client** nếu có gọi liên service.  
- Đồng bộ cấu hình **JWT** (`jwt.secret`, thời gian hết hạn, public paths) giữa **user-service**, **api-gateway**, **order-service**.  
- Thêm route Zuul khi có microservice mới; cân nhắc public vs protected path.  
- Mở rộng entity JPA (audit, quan hệ) và migration/schema (`ddl-auto` hoặc script SQL tùy môi trường).  
- Viết/duy trì test (MockMvc, context test); profile `test` và H2 cho order-service khi không có SQL Server/Redis.

### 4.2. Bảo mật

- Không commit secret production; dùng biến môi trường hoặc vault.  
- Phân biệt rõ access vs refresh; gateway từ chối refresh trên API nghiệp vụ.  
- Order-service: bắt buộc JWT cho endpoint tạo đơn (khi bật `jwt.validation.enabled`).

### 4.3. Vận hành

- Khởi động thứ tự gợi ý: Eureka → các service → Gateway.  
- Đảm bảo **Redis** (order session/cart) và **SQL Server** (hoặc H2 dev) sẵn sàng theo `application.properties`.  
- Theo dõi log activity và lỗi 401/403 khi tích hợp frontend.

### 4.4. Mô tả vai trò mẫu (JD ngắn — Backend Microservices)

**Chức danh gợi ý:** Lập trình viên Backend (Java / Spring Boot — Microservices).

**Trách nhiệm chính:**

- Phát triển và bảo trì các dịch vụ Spring Boot (REST, JPA, Feign, Eureka).  
- Triển khai và duy trì xác thực JWT, refresh token, và kiểm tra token tại service đích khi có yêu cầu bảo mật.  
- Phối hợp định nghĩa hợp đồng API với frontend và các team khác.  
- Viết test tự động, hỗ trợ review code và tài liệu kỹ thuật ngắn.

**Yêu cầu kỹ năng gợi ý:**

- Java 8+, Spring Boot 2.x, Spring Cloud (Greenwich), REST, JPA/Hibernate.  
- Hiểu cơ bản về JWT, API Gateway, Redis, SQL Server.  
- Git, Maven, làm việc theo module độc lập.

---

## 5. Liên hệ & cập nhật tài liệu

- Khi thêm service hoặc đổi luồng auth, **cập nhật mục 2–3** và bảng public path trên gateway.  
- Phiên bản tài liệu: ghi chú ngày chỉnh sửa ở cuối file khi có thay đổi lớn.

---

*Bản nháp theo kiến trúc dự án e-commerce microservices (Rainbow Forest). Chỉnh sửa cho sát nghiệp vụ thực tế doanh nghiệp của bạn nếu cần.*
