# PHIẾU THEO DÕI TIẾN ĐỘ THỰC HIỆN THỰC TẬP TỐT NGHIỆP

* **Tên đề tài:** Xây dựng hệ thống thương mại điện tử **The Kinetic Vault** dựa trên kiến trúc Microservices
* **Sinh viên thực hiện:** [Họ và tên Sinh viên]
* **Mã số sinh viên (MSSV):** [MSSV]
* **Giảng viên hướng dẫn:** [Họ và tên GVHD]
* **Thời gian thực hiện:** Từ ngày 11/05/2026 đến nay (06/07/2026)

---

## BẢNG THEO DÕI TIẾN ĐỘ CHI TIẾT THEO TUẦN

| Tuần | Khoảng thời gian | Nội dung công việc thực hiện | Kết quả đạt được | Tiến độ (%) | Đánh giá của GVHD/Đơn vị |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Tuần 1** | 11/05 - 17/05 | - Tìm hiểu đề tài, khảo sát nhu cầu thị trường.<br>- Nghiên cứu tài liệu về kiến trúc Microservices và hệ sinh thái Spring Cloud.<br>- Xác định các nghiệp vụ chính của hệ thống e-commerce. | - Báo cáo khảo sát đề tài.<br>- Sơ đồ kiến trúc tổng quan (Architecture Diagram) gồm 15 dịch vụ.<br>- Danh mục công nghệ dự kiến sử dụng. | 100% | |
| **Tuần 2** | 18/05 - 24/05 | - Phân tích & thiết kế cơ sở dữ liệu chi tiết.<br>- Thiết lập môi trường phát triển (Java 8/17, MySQL, Redis, Maven).<br>- Khởi tạo máy chủ Eureka Server và cổng API Gateway. | - Tài liệu đặc tả CSDL chi tiết gồm 37 bảng cho các dịch vụ.<br>- Dịch vụ `eureka-server` hoạt động ổn định.<br>- Cấu hình định tuyến và CORS trên `api-gateway`. | 100% | |
| **Tuần 3** | 25/05 - 31/05 | - Xây dựng dịch vụ quản lý người dùng và phân quyền.<br>- Thiết lập cơ chế bảo mật cho toàn hệ thống.<br>- Xây dựng dịch vụ danh mục sản phẩm. | - Dịch vụ `user-service` hoàn thành chức năng đăng ký/đăng nhập, xác thực bằng JWT (JJWT), mã hóa mật khẩu (BCrypt).<br>- Dịch vụ `product-catalog-service` hỗ trợ CRUD sản phẩm, thương hiệu, danh mục và biến thể (màu sắc/kích thước). | 100% | |
| **Tuần 4** | 01/06 - 07/06 | - Phát triển dịch vụ quản lý kho hàng.<br>- Xây dựng chức năng giỏ hàng cho người dùng đăng nhập và khách vãng lai. | - Dịch vụ `inventory-service` xử lý nhập/xuất kho (IN/OUT) và cập nhật số lượng tồn kho tự động.<br>- Dịch vụ `cart-service` tích hợp thành công Redis cache để lưu và quản lý giỏ hàng tốc độ cao. | 100% | |
| **Tuần 5** | 08/06 - 14/06 | - Phát triển quy trình đặt hàng cốt lõi.<br>- Tích hợp cổng thanh toán tự động. | - Dịch vụ `order-service` xử lý đặt hàng, tính tiền, tạo đơn và cập nhật trạng thái đơn (Pending, Paid, Shipped, Canceled).<br>- Dịch vụ `payment-service` tích hợp thành công cổng thanh toán SePay QR, tự động nhận diện giao dịch chuyển khoản. | 100% | |
| **Tuần 6** | 15/06 - 21/06 | - Phát triển các tính năng khuyến mãi (Voucher, Flash Sale, Banner quảng cáo).<br>- Xây dựng chức năng đánh giá sản phẩm. | - Dịch vụ `sale-service` hỗ trợ tạo mã giảm giá (Voucher), quản lý Flash Sale theo khung giờ.<br>- Dịch vụ `review-service` cho phép người dùng chấm điểm 5 sao và bình luận kèm hình ảnh. | 100% | |
| **Tuần 7** | 22/06 - 28/06 | - Phát triển dịch vụ gửi thông báo tự động.<br>- Tích hợp thông báo qua mạng xã hội cho Admin.<br>- Xây dựng nhật ký hoạt động hệ thống. | - Dịch vụ `notification-service` tự động gửi email xác nhận khi đăng ký tài khoản hoặc đặt đơn thành công.<br>- Dịch vụ `telegram-service` liên kết bot Telegram thông báo đơn hàng mới/sắp hết kho.<br>- Dịch vụ `activity-log-service` ghi nhận lịch sử thao tác của Admin/nhân viên. | 100% | |
| **Tuần 8** | 29/06 - 05/07 | - Tích hợp dịch vụ gợi ý sản phẩm thông minh.<br>- Xây dựng trợ lý ảo hỗ trợ khách hàng tự động. | - Dịch vụ `product-recommendation-service` phân tích tags để đề xuất các sản phẩm liên quan.<br>- Dịch vụ `ai-chatbot-service` tích hợp thành công Ollama (LLM) hỗ trợ tư vấn sản phẩm 24/7. | 100% | |
| **Tuần 9** | 06/07 - Nay | - Xây dựng giao diện Web cho người dùng và trang Admin quản trị.<br>- Kết nối giao diện với các REST API thông qua Gateway.<br>- Tiến hành kiểm thử tích hợp (Integration Testing) toàn hệ thống và sửa lỗi.<br>- Triển khai thử nghiệm (Deployment). | - Giao diện Frontend Web hoàn chỉnh xây dựng bằng Next.js (v15), React (v19) và Tailwind CSS.<br>- Các chức năng cốt lõi trên Web (mua hàng, thanh toán, quản lý admin) chạy mượt mà.<br>- Triển khai hệ thống lên Cloud thông qua Cloudflare Tunnel kết nối Vercel. | 90% | |

---

## CHI TIẾT TIẾN ĐỘ THỰC HIỆN CÁC MICROSERVICES

| STT | Tên Microservice | Chức năng chính | Trạng thái | Ghi chú |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **eureka-server** | Máy chủ đăng ký & khám phá dịch vụ | Hoàn thành | Hoạt động ổn định |
| 2 | **api-gateway** | Nhận yêu cầu, kiểm tra JWT Token và định tuyến | Hoàn thành | Sử dụng Zuul API Gateway |
| 3 | **user-service** | Đăng ký, đăng nhập, phân quyền, khôi phục mật khẩu | Hoàn thành | Bảo mật với JJWT & Spring Security |
| 4 | **product-catalog-service** | Quản lý sản phẩm, danh mục, thương hiệu, biến thể | Hoàn thành | Kết nối MySQL |
| 5 | **inventory-service** | Quản lý xuất nhập kho, trừ kho khi đặt hàng | Hoàn thành | Có nhật ký di chuyển kho (StockMovement) |
| 6 | **cart-service** | Quản lý giỏ hàng người dùng | Hoàn thành | Lưu trữ đệm trên Redis |
| 7 | **order-service** | Xử lý quy trình đặt hàng, tính tiền | Hoàn thành | Kết nối đồng bộ với inventory-service |
| 8 | **payment-service** | Thanh toán trực tuyến (SePay QR) hoặc COD | Hoàn thành | Tự động cập nhật trạng thái hóa đơn |
| 9 | **sale-service** | Quản lý Voucher giảm giá, Flash sale, Banner | Hoàn thành | Cho phép giới hạn thời gian áp dụng |
| 10 | **review-service** | Đánh giá, chấm điểm và phản hồi từ admin | Hoàn thành | Hỗ trợ lưu trữ ảnh đánh giá |
| 11 | **notification-service** | Gửi email thông báo cho khách hàng | Hoàn thành | Sử dụng JavaMailSender |
| 12 | **telegram-service** | Bot Telegram tự động nhắn tin cảnh báo cho Admin | Hoàn thành | Tích hợp Telegram Bots API |
| 13 | **activity-log-service** | Camera an ninh ghi lại mọi hoạt động của nhân viên | Hoàn thành | Lưu vết chi tiết địa chỉ IP và hành động |
| 14 | **product-recommendation-service**| Đề xuất các sản phẩm liên quan thông minh | Hoàn thành | Khai thác dữ liệu theo hành vi mua hàng |
| 15 | **ai-chatbot-service** | Trợ lý tư vấn mua sắm ảo 24/7 | Hoàn thành | Tích hợp trí tuệ nhân tạo (Ollama/LLM) |
| 16 | **Next.js Web Frontend** | Giao diện người dùng và trang Admin quản trị | Hoàn thành | Next.js 15, Tailwind CSS, Framer Motion |

---

## KẾ HOẠCH CHO GIAI ĐOẠN TIẾP THEO

1. **Tuần 10 (07/07 - 13/07):**
   - Tiếp tục tối ưu hóa hiệu năng các API bằng cách tận dụng Redis caching sâu hơn.
   - Viết thêm unit tests cho các dịch vụ cốt lõi (`order-service`, `payment-service`).
   - Chuẩn bị viết báo cáo thực tập tốt nghiệp chi tiết nộp cho Khoa.
2. **Tuần 11 (14/07 - 20/07):**
   - Gửi sản phẩm cho Giảng viên hướng dẫn duyệt thử.
   - Sửa các lỗi phát sinh theo yêu cầu của Giảng viên hướng dẫn.
   - Chuẩn bị slide thuyết trình và demo bảo vệ thực tập tốt nghiệp.
