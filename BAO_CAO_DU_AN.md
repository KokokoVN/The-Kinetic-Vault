# BÁO CÁO TỔNG QUAN DỰ ÁN KINETIC VAULT (E-COMMERCE MICROSERVICES)

Tài liệu này tổng hợp toàn bộ các tính năng cốt lõi và các công nghệ/thư viện đã được sử dụng để xây dựng hệ thống thương mại điện tử **The Kinetic Vault** dựa trên kiến trúc Microservices.

---

## I. KIẾN TRÚC HỆ THỐNG (ARCHITECTURE)

Dự án được xây dựng theo mô hình **Microservices Architecture**. Hệ thống chia nhỏ một ứng dụng bán hàng khổng lồ thành 15 dịch vụ nhỏ (services) độc lập. 
- Ưu điểm: Nếu một dịch vụ bị lỗi (ví dụ: đánh giá sản phẩm bị sập), toàn bộ các chức năng khác (mua hàng, thanh toán) vẫn hoạt động bình thường.
- Giao tiếp: Các dịch vụ nói chuyện với nhau thông qua mạng nội bộ bằng REST API (OpenFeign) và được quản lý tập trung qua API Gateway.

---

## II. CÔNG NGHỆ VÀ THƯ VIỆN SỬ DỤNG

### 1. BACKEND (Hệ sinh thái Java / Spring)
Backend được xây dựng hoàn toàn bằng ngôn ngữ **Java** kết hợp framework **Spring Boot**.

* **Spring Boot (v2.1.5.RELEASE):** Cung cấp bộ khung mạnh mẽ để xây dựng API nhanh chóng, tích hợp sẵn Tomcat server.
* **Spring Cloud Netflix (Eureka, Zuul, Hystrix, Ribbon):**
  * *Eureka Server:* Sổ danh bạ mạng. Giúp các Microservices tự động tìm thấy nhau mà không cần gán cứng địa chỉ IP.
  * *Zuul API Gateway:* Nhạc trưởng của hệ thống. Nhận mọi yêu cầu từ người dùng (Frontend) và điều phối về đúng dịch vụ đích. Xử lý luôn cả CORS và xác thực (Authentication).
  * *Feign Client / Ribbon:* Giúp các dịch vụ gọi API nội bộ cho nhau một cách dễ dàng và cân bằng tải.
* **Spring Data JPA & Hibernate:** Thư viện ORM giúp giao tiếp với cơ sở dữ liệu MySQL thông qua các đối tượng Java thay vì viết câu lệnh SQL thủ công.
* **Spring Security & JJWT:** Bảo mật hệ thống. Xác thực người dùng bằng JWT (JSON Web Token), mã hóa mật khẩu bằng BCrypt.
* **Cơ sở dữ liệu:** 
  * **MySQL:** Lưu trữ dữ liệu cấu trúc (người dùng, sản phẩm, đơn hàng...).
  * **Redis:** Lưu trữ bộ nhớ đệm (Cache) tốc độ cao, quản lý giỏ hàng và phiên hoạt động (session) siêu tốc.
* **Thư viện khác:** 
  * *Telegram Bots API:* Tích hợp Robot thông báo tin nhắn tự động.
  * *Apache Maven:* Trình quản lý thư viện và đóng gói dự án.

### 2. FRONTEND (Giao diện người dùng)
Giao diện người dùng được xây dựng bằng hệ sinh thái **JavaScript/TypeScript** hiện đại.

* **Next.js (v15) / React (v19):** Framework mạnh mẽ nhất hiện nay để xây dựng website. Hỗ trợ kết xuất máy chủ (SSR) giúp tối ưu hóa công cụ tìm kiếm (SEO) và tăng tốc độ tải trang.
* **Tailwind CSS:** Thư viện CSS tiện ích giúp tạo ra các giao diện UI/UX đẹp mắt, hiện đại, hỗ trợ Dark Mode và Responsive cho điện thoại một cách nhanh chóng.
* **TypeScript:** Đảm bảo code chặt chẽ, bắt lỗi ngay trong quá trình gõ code, giúp dự án lớn không bị vỡ (crash).
* **Framer Motion / Lucide React:** Thư viện tạo hiệu ứng chuyển động mượt mà và hệ thống biểu tượng (icon) sắc nét.
* **Công cụ triển khai:** Vercel (Hosting) kết hợp Cloudflare Tunnel (Đường hầm kết nối bảo mật).

---

## III. CHI TIẾT 15 MICROSERVICES VÀ CHỨC NĂNG CỦA CHÚNG

Dưới đây là danh sách toàn bộ các mảnh ghép tạo nên hệ thống:

1. **eureka-server (Máy chủ Đăng ký):**
   * *Chức năng:* Trái tim của mạng nội bộ. Lưu trữ địa chỉ của tất cả 14 dịch vụ còn lại. Khi một dịch vụ bật lên, nó phải báo danh với Eureka.
2. **api-gateway (Cổng Giao tiếp):**
   * *Chức năng:* Điểm vào duy nhất của toàn bộ hệ thống. Kiểm tra thẻ ID (Token) của người dùng trước khi cho phép đi vào mua hàng.
3. **user-service (Dịch vụ Người dùng):**
   * *Chức năng:* Xử lý đăng ký, đăng nhập, quên mật khẩu, quản lý hồ sơ cá nhân và phân quyền (Admin / Khách hàng).
4. **product-catalog-service (Dịch vụ Sản phẩm):**
   * *Chức năng:* Quản lý danh mục, thương hiệu, biến thể (màu sắc, kích thước) và tải lên hình ảnh sản phẩm. Cung cấp dữ liệu để hiển thị tủ kính cửa hàng.
5. **inventory-service (Dịch vụ Kho hàng):**
   * *Chức năng:* Quản lý số lượng tồn kho. Kiểm tra xem mặt hàng còn đủ để bán không và tự động trừ kho khi có người mua.
6. **cart-service (Dịch vụ Giỏ hàng):**
   * *Chức năng:* Quản lý giỏ hàng của từng khách. Sử dụng Redis để lưu trữ giúp khách thêm/bớt món hàng với tốc độ mili-giây.
7. **order-service (Dịch vụ Đơn hàng):**
   * *Chức năng:* Cốt lõi của kinh doanh. Xử lý quy trình đặt hàng, tính tổng tiền, tạo mã đơn và cập nhật trạng thái (Đang giao, Hoàn thành, Hủy).
8. **payment-service (Dịch vụ Thanh toán):**
   * *Chức năng:* Xử lý giao dịch tài chính, kết nối mã QR chuyển khoản (SePay) hoặc ví điện tử, xác nhận tiền đã vào tài khoản.
9. **sale-service (Dịch vụ Khuyến mãi):**
   * *Chức năng:* Tạo mã giảm giá (Voucher), quản lý các chương trình Flash Sale và treo các biển quảng cáo (Banner) lên trang chủ.
10. **review-service (Dịch vụ Đánh giá):**
    * *Chức năng:* Cho phép khách hàng chấm điểm 5 sao và viết nhận xét có kèm hình ảnh cho sản phẩm đã mua.
11. **notification-service (Dịch vụ Thông báo):**
    * *Chức năng:* Gửi email hoặc tin nhắn thông báo cho khách hàng khi họ tạo đơn thành công hoặc đổi mật khẩu.
12. **telegram-service (Dịch vụ Telegram):**
    * *Chức năng:* Gắn một con Robot Telegram để tự động nhắn tin cho Quản trị viên (Admin) mỗi khi có khách chốt đơn mới hoặc khi một sản phẩm sắp hết hàng trong kho.
13. **activity-log-service (Dịch vụ Nhật ký):**
    * *Chức năng:* Camera an ninh của hệ thống. Ghi lại mọi hành động của nhân viên/Admin (ai đã xóa sản phẩm, ai đã sửa giá tiền) để truy vết khi cần.
14. **product-recommendation-service (Dịch vụ Gợi ý):**
    * *Chức năng:* Đề xuất các sản phẩm liên quan ("Có thể bạn cũng thích") giúp giữ chân khách hàng và tăng doanh thu.
15. **ai-chatbot-service (Dịch vụ AI Chatbot):**
    * *Chức năng:* Nhân viên tư vấn ảo. Tích hợp Trí tuệ nhân tạo (LLM / Ollama) giúp tư vấn cấu hình, giải đáp thắc mắc của khách hàng tự động 24/7.

---
*Báo cáo được trích xuất tự động từ hệ thống - The Kinetic Vault E-commerce Project.*
